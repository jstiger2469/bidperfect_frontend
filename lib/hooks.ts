// React Query hooks for API integration
// Provides efficient data fetching, caching, and state management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type AuditLogListResponse, type AuditLogStats, type AuditLogFilters } from './api';
import { 
  mapOpportunityToRFP, 
  mapPartnerToSubcontractor, 
  mapComplianceToRequirement,
  mapReadinessToScore,
  mapTipsToFrontend,
  createMockTeamMembers,
  createMockPricingLineItems,
  handleApiError
} from './dataMapper';
import { RFP, Subcontractor, ComplianceRequirement } from './data';

// Query Keys
export const queryKeys = {
  opportunities: ['opportunities'] as const,
  opportunity: (id: string) => ['opportunities', id] as const,
  rfp: (id: string) => ['rfp', id] as const,
  // Companies domain
  companies: (params?: any) => ['companies', params] as const,
  company: (id: string) => ['company', id] as const,
  companyCerts: (companyId: string, params?: any) => ['companyCerts', companyId, params] as const,
  companyStaff: (companyId: string) => ['companyStaff', companyId] as const,
  companyRateCards: (companyId: string) => ['companyRateCards', companyId] as const,
  companyDocuments: (companyId: string) => ['companyDocuments', companyId] as const,
  companyLocations: (companyId: string) => ['companyLocations', companyId] as const,
  companyLicenses: (companyId: string) => ['companyLicenses', companyId] as const,
  companyInsurance: (companyId: string) => ['companyInsurance', companyId] as const,
  companyBonding: (companyId: string) => ['companyBonding', companyId] as const,
  companyPastPerf: (companyId: string, params?: any) => ['companyPastPerf', companyId, params] as const,
  companyAttestations: (companyId: string) => ['companyAttestations', companyId] as const,
  companyTeaming: (companyId: string) => ['companyTeaming', companyId] as const,
  companyInvites: (companyId: string, status?: string) => ['companyInvites', companyId, status] as const,
  companyEligibilityHistory: (companyId: string, limit: number) => ['companyEligibilityHistory', companyId, limit] as const,
  compliance: (rfpId: string, params?: any) => ['compliance', rfpId, params] as const,
  readiness: (rfpId: string) => ['readiness', rfpId] as const,
  gaps: (rfpId: string) => ['gaps', rfpId] as const,
  binder: (rfpId: string) => ['binder', rfpId] as const,
  pricingChecks: (opportunityId: string) => ['pricingChecks', opportunityId] as const,
  draft: (rfpId: string) => ['draft', rfpId] as const,
  partners: (params: any) => ['partners', params] as const,
  tips: (id: string, type: 'rfp' | 'opportunity') => ['tips', type, id] as const,
  questions: (opportunityId: string) => ['questions', opportunityId] as const,
  assumptions: (opportunityId: string) => ['assumptions', opportunityId] as const,
  kanban: (opportunityId: string) => ['kanban', opportunityId] as const,
  opportunityDocuments: (opportunityId: string, params?: any) => ['opportunityDocuments', opportunityId, params] as const,
  auditLogs: (filters?: AuditLogFilters) => ['auditLogs', filters] as const,
  auditLogStats: ['auditLogStats'] as const,
  companyAuditLogs: (companyId: string, params?: { limit?: number; offset?: number }) => ['companyAuditLogs', companyId, params] as const,
  opportunityAuditLogs: (opportunityId: string, params?: { limit?: number; offset?: number }) => ['opportunityAuditLogs', opportunityId, params] as const,
  ucfDocument: (rfpId: string) => ['ucfDocument', rfpId] as const,
  ucfSection: (rfpId: string, code: string) => ['ucfSection', rfpId, code] as const,
  ucfCritical: (rfpId: string) => ['ucfCritical', rfpId] as const,
  ucfStats: ['ucfStats'] as const,
};

// Opportunities
export function useOpportunities(params?: { q?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.opportunities,
    queryFn: () => apiClient.getOpportunities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOpportunity(id: string) {
  console.log('🎯 useOpportunity called with:', { id, enabled: !!id });

  const result = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      console.log('🚀 useOpportunity queryFn executing for:', id);
      console.log('🚀 API Client base URL:', apiClient['baseUrl']);
      
      try {
        const data = await apiClient.getOpportunity(id);
        console.log('✅ useOpportunity queryFn success:', data);
        return data;
      } catch (error) {
        console.error('❌ useOpportunity queryFn error:', error);
        throw error;
      }
    },
    enabled: !!id && id !== '',
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1, // Allow one retry
    staleTime: 0,
    // Removed deprecated cacheTime property
  });

  console.log('📊 useOpportunity result:', {
    id,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    data: result.data,
    error: result.error,
    status: result.status,
    fetchStatus: result.fetchStatus
  });

  return result;
}

// RFP
export function useRFP(id: string) {
  return useQuery({
    queryKey: queryKeys.rfp(id),
    queryFn: () => apiClient.getRFP(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Combined RFP data (Opportunity + RFP)
export function useRFPData(opportunityId: string) {
  console.log('useRFPData called with:', { opportunityId });
  const opportunityQuery = useOpportunity(opportunityId);
  const rfpQuery = useRFP(opportunityQuery.data?.rfpId || '');

  console.log('useRFPData state:', {
    opportunityId,
    opportunityData: opportunityQuery.data,
    rfpId: opportunityQuery.data?.rfpId,
    rfpData: rfpQuery.data,
    loading: opportunityQuery.isLoading || rfpQuery.isLoading,
    error: opportunityQuery.error || rfpQuery.error
  });

  return {
    data: opportunityQuery.data 
      ? (rfpQuery.data 
          ? mapOpportunityToRFP(opportunityQuery.data, rfpQuery.data)
          : opportunityQuery.data) // Return opportunity data even if RFP data is not available
      : null,
    loading: opportunityQuery.isLoading || rfpQuery.isLoading,
    error: opportunityQuery.error || rfpQuery.error,
    refetch: () => {
      opportunityQuery.refetch();
      rfpQuery.refetch();
    }
  };
}

// Compliance
export function useCompliance(
  rfpId: string, 
  params?: { refresh?: boolean; limit?: number; offset?: number; section?: string; family?: string }
) {
  return useQuery({
    queryKey: queryKeys.compliance(rfpId, params),
    queryFn: () => apiClient.getCompliance(rfpId, params),
    enabled: !!rfpId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useComplianceRequirements(rfpId: string) {
  const complianceQuery = useCompliance(rfpId);
  
  return {
    data: complianceQuery.data 
      ? mapComplianceToRequirement(complianceQuery.data, rfpId)
      : [],
    loading: complianceQuery.isLoading,
    error: complianceQuery.error,
    refetch: complianceQuery.refetch
  };
}

// Compliance refresh mutation
export function useRefreshCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rfpId: string) => apiClient.refreshCompliance(rfpId),
    onSuccess: (_, rfpId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance(rfpId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.binder(rfpId) });
    },
  });
}

// Readiness
export function useReadiness(opportunityId: string) {
  return useQuery({
    queryKey: queryKeys.readiness(opportunityId),
    queryFn: () => apiClient.getReadiness(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry if endpoint doesn't exist
  });
}

export function useReadinessScore(opportunityId: string) {
  const readinessQuery = useReadiness(opportunityId);
  
  return {
    score: readinessQuery.data ? mapReadinessToScore(readinessQuery.data) : 0,
    loading: readinessQuery.isLoading,
    error: readinessQuery.error,
    refetch: readinessQuery.refetch
  };
}

// Gaps
export function useGaps(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.gaps(rfpId),
    queryFn: () => apiClient.getGaps(rfpId),
    enabled: !!rfpId,
    staleTime: 5 * 60 * 1000,
  });
}

// Binder
export function useBinder(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.binder(rfpId),
    queryFn: () => apiClient.getBinder(rfpId),
    enabled: !!rfpId,
    staleTime: 5 * 60 * 1000,
  });
}

// Pricing Checks
export function usePricingChecks(opportunityId: string) {
  return useQuery({
    queryKey: queryKeys.pricingChecks(opportunityId),
    queryFn: () => apiClient.getPricingChecks(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
}

// Draft Workbench
export function useDraft(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.draft(rfpId),
    queryFn: () => apiClient.getLatestDraft(rfpId),
    enabled: !!rfpId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ rfpId, content, meta }: { rfpId: string; content: string; meta?: any }) =>
      apiClient.saveDraft(rfpId, content, meta),
    onSuccess: (_, { rfpId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.draft(rfpId) });
    },
  });
}

export function useGenerateDraft() {
  return useMutation({
    mutationFn: ({ rfpId, bullet, persona, maxWords }: { 
      rfpId: string; 
      bullet: string; 
      persona?: string; 
      maxWords?: number 
    }) => apiClient.generateDraft(rfpId, bullet, persona, maxWords),
  });
}

export function useRewriteDraft() {
  return useMutation({
    mutationFn: ({ rfpId, text, persona, tone }: { 
      rfpId: string; 
      text: string; 
      persona?: string; 
      tone?: string 
    }) => apiClient.rewriteDraft(rfpId, text, persona, tone),
  });
}

// Partners/Subcontractors
export function usePartnerSuggestions(params: {
  rfpId?: string;
  q?: string;
  naics?: string;
  state?: string;
  certs?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.partners(params),
    queryFn: () => apiClient.getPartnerSuggestions(params),
    enabled: !!(params.rfpId || params.q),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSubcontractors(params: {
  rfpId?: string;
  q?: string;
  naics?: string;
  state?: string;
  certs?: string;
  limit?: number;
}) {
  const partnersQuery = usePartnerSuggestions(params);
  
  return {
    data: partnersQuery.data?.items.map(mapPartnerToSubcontractor) || [],
    loading: partnersQuery.isLoading,
    error: partnersQuery.error,
    refetch: partnersQuery.refetch
  };
}

// Tips
export function useTips(id: string, type: 'rfp' | 'opportunity' = 'rfp') {
  return useQuery({
    queryKey: queryKeys.tips(id, type),
    queryFn: () => type === 'rfp' ? apiClient.getTips(id) : apiClient.getOpportunityTips(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useTipsData(id: string, type: 'rfp' | 'opportunity' = 'rfp') {
  const tipsQuery = useTips(id, type);
  
  return {
    data: tipsQuery.data ? mapTipsToFrontend(tipsQuery.data) : null,
    loading: tipsQuery.isLoading,
    error: tipsQuery.error,
    refetch: tipsQuery.refetch
  };
}

// Q&A
export function useQuestions(opportunityId: string, llmOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.questions(opportunityId),
    queryFn: () => apiClient.getQuestions(opportunityId, llmOnly),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
}

// =====================
// Companies domain hooks
// =====================

// Companies
export function useCompanies(params?: { q?: string; naics?: string; socio?: string; state?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.companies(params),
    queryFn: () => apiClient.listCompanies(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => apiClient.getCompany(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { legalName: string; doingBusinessAs?: string; uei?: string; cage?: string; socios?: string[]; naicsCodes?: string[]; pscCodes?: string[] }) => apiClient.createCompany(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.companies({}) }); },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateCompany(id, data),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: queryKeys.company(id) }); },
  });
}

// Certifications
export function useCompanyCerts(companyId: string, params?: { type?: string; status?: string; q?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.companyCerts(companyId, params),
    queryFn: () => apiClient.listCertifications(companyId, params),
    enabled: !!companyId,
  });
}

export function useCreateCompanyCert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createCertification(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyCerts(companyId) }); },
  });
}

// Staff
export function useCompanyStaff(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyStaff(companyId),
    queryFn: () => apiClient.listKeyPeople(companyId),
    enabled: !!companyId,
  });
}

export function useCreateCompanyStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createKeyPerson(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyStaff(companyId) }); },
  });
}

// Rate cards
export function useCompanyRateCards(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyRateCards(companyId),
    queryFn: () => apiClient.listRateCards(companyId),
    enabled: !!companyId,
  });
}

// Documents
// removed duplicate useCompanyDocuments/useCreateCompanyDocument (see earlier definitions)

export function useRefreshQuestions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityId: string) => apiClient.refreshQuestions(opportunityId),
    onSuccess: (_, opportunityId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions(opportunityId) });
    },
  });
}

export function useSyncOpportunitySections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityId: string) => apiClient.syncOpportunitySections(opportunityId),
    onSuccess: (_, opportunityId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions(opportunityId) });
    },
  });
}

// Polling hook for Q&A generation
export function useQAPolling(opportunityId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['qa-polling', opportunityId],
    queryFn: () => apiClient.getQuestions(opportunityId, true), // llmOnly=true
    enabled: enabled && !!opportunityId,
    refetchInterval: enabled ? 5000 : false, // Poll every 5 seconds when enabled
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: false,
  });
}

// Assumptions
export function useAssumptions(opportunityId: string) {
  return useQuery({
    queryKey: queryKeys.assumptions(opportunityId),
    queryFn: () => apiClient.getAssumptions(opportunityId),
    enabled: !!opportunityId,
    staleTime: 10 * 60 * 1000,
  });
}

// Mock data hooks (for features not yet available in backend)
export function useTeamMembers() {
  return {
    data: createMockTeamMembers(),
    loading: false,
    error: null,
    refetch: () => {}
  };
}

export function usePricingLineItems(rfpId: string) {
  return {
    data: createMockPricingLineItems(rfpId),
    loading: false,
    error: null,
    refetch: () => {}
  };
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.health(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Kanban Board Hooks
export function useKanbanBoard(opportunityId: string) {
  return useQuery({
    queryKey: queryKeys.kanban(opportunityId),
    queryFn: () => apiClient.getKanbanBoard(opportunityId),
    enabled: !!opportunityId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useInitKanbanBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityId: string) => apiClient.initKanbanBoard(opportunityId),
    onSuccess: (_, opportunityId) => {
      // Invalidate and refetch kanban board
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban(opportunityId) });
    },
  });
}

export function useSyncKanbanBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (opportunityId: string) => apiClient.syncKanbanBoard(opportunityId),
    onSuccess: (_, opportunityId) => {
      // Invalidate and refetch kanban board
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban(opportunityId) });
    },
  });
}

export function useUpdateKanbanCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, cardId, data }: { opportunityId: string; cardId: string; data: any }) => 
      apiClient.updateKanbanCard(opportunityId, cardId, data),
    onSuccess: (_, { opportunityId }) => {
      // Invalidate and refetch kanban board
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban(opportunityId) });
    },
  });
}

export function useCreateKanbanCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, data }: { opportunityId: string; data: any }) => 
      apiClient.createKanbanCard(opportunityId, data),
    onSuccess: (_, { opportunityId }) => {
      // Invalidate and refetch kanban board
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban(opportunityId) });
    },
  });
}

export function useDeleteKanbanCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ opportunityId, cardId }: { opportunityId: string; cardId: string }) => 
      apiClient.deleteKanbanCard(opportunityId, cardId),
    onSuccess: (_, { opportunityId }) => {
      // Invalidate and refetch kanban board
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban(opportunityId) });
    },
  });
}

// Upload Hooks
export function useUploadRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (progress: any) => void }) => 
      apiClient.uploadRFP(files, onProgress),
    onSuccess: (data) => {
      // Invalidate opportunities list to show new RFP
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      // Invalidate the specific RFP
      queryClient.invalidateQueries({ queryKey: queryKeys.rfp(data.rfpId) });
    },
  });
}

export function useUploadZipRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ zipFile, onProgress }: { zipFile: File; onProgress?: (progress: any) => void }) => 
      apiClient.uploadZipRFP(zipFile, onProgress),
    onSuccess: (data) => {
      // Invalidate opportunities list to show new RFP
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      // Invalidate the specific RFP
      queryClient.invalidateQueries({ queryKey: queryKeys.rfp(data.rfpId) });
    },
  });
}

// =====================
// Audit Logs Hooks
// =====================
export function useAuditLogs(filters: AuditLogFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => apiClient.listAuditLogs(filters) as Promise<AuditLogListResponse>,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: queryKeys.auditLogStats,
    queryFn: () => apiClient.getAuditLogStats() as Promise<AuditLogStats>,
    staleTime: 60 * 1000,
  });
}

export function useCompanyAuditLogs(companyId: string | undefined, params: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.companyAuditLogs(companyId || '', params),
    queryFn: () => apiClient.getCompanyAuditLogs(companyId as string, params) as Promise<AuditLogListResponse>,
    enabled: !!companyId,
    staleTime: 30 * 1000,
  });
}

export function useOpportunityAuditLogs(opportunityId: string | undefined, params: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.opportunityAuditLogs(opportunityId || '', params),
    queryFn: () => apiClient.getOpportunityAuditLogs(opportunityId as string, params) as Promise<AuditLogListResponse>,
    enabled: !!opportunityId,
    staleTime: 30 * 1000,
  });
}

export function useUploadStatus(opportunityId: string) {
  return useQuery({
    queryKey: ['uploadStatus', opportunityId],
    queryFn: () => apiClient.getUploadStatus(opportunityId),
    enabled: !!opportunityId,
    refetchInterval: (query) => {
      const data = (query as any)?.state?.data as { status?: string } | undefined;
      return data && (data.status === 'completed' || data.status === 'failed') ? false : 2000;
    }
  });
}

export function useCreateOpportunityFromRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rfpId: string) => apiClient.createOpportunityFromRFP(rfpId),
    onSuccess: (data) => {
      // Invalidate opportunities list to show new opportunity
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      // Invalidate the specific opportunity
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunity(data.opportunityId) });
    },
  });
}

// Opportunity Documents
export function useOpportunityDocuments(opportunityId: string, params?: { tag?: string; tags?: string[] }) {
  return useQuery({
    queryKey: queryKeys.opportunityDocuments(opportunityId, params),
    queryFn: () => apiClient.listOpportunityDocuments(opportunityId, params),
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
  }) as unknown as { data?: { items: any[] }, loading: boolean, error: any }
}

export function useCreateOpportunityDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ opportunityId, data }: { opportunityId: string; data: any }) => apiClient.createOpportunityDocument(opportunityId, data),
    onSuccess: (_, { opportunityId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.opportunityDocuments(opportunityId, {}) })
      qc.invalidateQueries({ queryKey: queryKeys.binder(opportunityId) })
    },
  })
}

export function useRunAgents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ rfpId, agents }: { rfpId: string; agents: string[] }) => 
      apiClient.runAgents(rfpId, agents),
    onSuccess: (_, { rfpId }) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.assumptions(rfpId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.binder(rfpId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance(rfpId) });
    },
  });
}

// =====================
// Company Profile Hub Hooks
// =====================

// removed duplicate useCompany

// removed duplicate useUpdateCompany

export function useCertifications(companyId: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.companyCerts(companyId, params),
    queryFn: () => apiClient.listCertifications(companyId, params),
    enabled: !!companyId,
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createCertification(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyCerts(companyId) });
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }: { companyId: string; id: string; data: any }) => apiClient.updateCertification(companyId, id, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyCerts(companyId) });
    },
  });
}

export function useVerifyCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, verified, notes }: { companyId: string; id: string; verified: boolean; notes?: string }) => apiClient.verifyCertification(companyId, id, verified, notes),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyCerts(companyId) });
    },
  });
}

export function useCompanyDocuments(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyDocuments(companyId),
    queryFn: () => apiClient.listCompanyDocuments(companyId),
    enabled: !!companyId,
  });
}

export function useCreateCompanyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createCompanyDocument(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyDocuments(companyId) });
    },
  });
}

export function useStaff(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyStaff(companyId),
    queryFn: () => apiClient.listStaff(companyId),
    enabled: !!companyId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createStaff(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyStaff(companyId) });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, staffId, data }: { companyId: string; staffId: string; data: any }) => apiClient.updateKeyPerson(companyId, staffId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyStaff(companyId) });
    },
  });
}

export function useDeleteCompanyStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, staffId }: { companyId: string; staffId: string }) => apiClient.deleteKeyPerson(companyId, staffId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyStaff(companyId) }); },
  });
}

// Locations
export function useCompanyLocations(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyLocations(companyId),
    queryFn: () => apiClient.listLocations(companyId),
    enabled: !!companyId,
  });
}
export function useCreateCompanyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createLocation(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLocations(companyId) }); },
  });
}
export function useUpdateCompanyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, locId, data }: { companyId: string; locId: string; data: any }) => apiClient.updateLocation(companyId, locId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLocations(companyId) }); },
  });
}
export function useDeleteCompanyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, locId }: { companyId: string; locId: string }) => apiClient.deleteLocation(companyId, locId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLocations(companyId) }); },
  });
}

// Licenses
export function useCompanyLicenses(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyLicenses(companyId),
    queryFn: () => apiClient.listLicenses(companyId),
    enabled: !!companyId,
  });
}
export function useCreateCompanyLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createLicense(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLicenses(companyId) }); },
  });
}
export function useUpdateCompanyLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, licId, data }: { companyId: string; licId: string; data: any }) => apiClient.updateLicense(companyId, licId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLicenses(companyId) }); },
  });
}
export function useDeleteCompanyLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, licId }: { companyId: string; licId: string }) => apiClient.deleteLicense(companyId, licId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyLicenses(companyId) }); },
  });
}

// Insurance
export function useCompanyInsurance(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyInsurance(companyId),
    queryFn: () => apiClient.listInsurance(companyId),
    enabled: !!companyId,
  });
}
export function useCreateCompanyInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createInsurance(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInsurance(companyId) }); },
  });
}
export function useUpdateCompanyInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, polId, data }: { companyId: string; polId: string; data: any }) => apiClient.updateInsurance(companyId, polId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInsurance(companyId) }); },
  });
}
export function useDeleteCompanyInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, polId }: { companyId: string; polId: string }) => apiClient.deleteInsurance(companyId, polId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInsurance(companyId) }); },
  });
}

// Bonding
export function useCompanyBonding(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyBonding(companyId),
    queryFn: () => apiClient.getBonding(companyId),
    enabled: !!companyId,
  });
}
export function useUpsertCompanyBonding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data, isCreate }: { companyId: string; data: any; isCreate?: boolean }) => isCreate ? apiClient.createBonding(companyId, data) : apiClient.updateBonding(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyBonding(companyId) }); },
  });
}

// Past Performance
export function useCompanyPastPerformance(companyId: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.companyPastPerf(companyId, params),
    queryFn: () => apiClient.listPastPerformance(companyId, params),
    enabled: !!companyId,
  });
}
export function useCreateCompanyPastPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createPastPerformance(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyPastPerf(companyId) }); },
  });
}
export function useUpdateCompanyPastPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, ppId, data }: { companyId: string; ppId: string; data: any }) => apiClient.updatePastPerformance(companyId, ppId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyPastPerf(companyId) }); },
  });
}
export function useDeleteCompanyPastPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, ppId }: { companyId: string; ppId: string }) => apiClient.deletePastPerformance(companyId, ppId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyPastPerf(companyId) }); },
  });
}

// Attestations
export function useCompanyAttestations(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyAttestations(companyId),
    queryFn: () => apiClient.listAttestations(companyId),
    enabled: !!companyId,
  });
}
export function useCreateCompanyAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.createAttestation(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyAttestations(companyId) }); },
  });
}
export function useUpdateCompanyAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, attId, data }: { companyId: string; attId: string; data: any }) => apiClient.updateAttestation(companyId, attId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyAttestations(companyId) }); },
  });
}

// Teaming
export function useCompanyTeaming(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyTeaming(companyId),
    queryFn: () => apiClient.getTeaming(companyId),
    enabled: !!companyId,
  });
}
export function useUpsertCompanyTeaming() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.upsertTeaming(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyTeaming(companyId) }); },
  });
}

// Invites
export function useCompanyInvites(companyId: string, status?: string) {
  return useQuery({
    queryKey: queryKeys.companyInvites(companyId, status),
    queryFn: () => apiClient.listInvites(companyId, status) as Promise<{ items: any[] } | any[]>,
    enabled: !!companyId,
    staleTime: 60 * 1000,
  }) as unknown as { data?: { items: any[] } | any[], loading: boolean, error: any, refetch: () => void }
}

export function useCreateInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: { email: string; role?: string; expiresDays?: number; metadata?: any } }) => apiClient.createInvite(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInvites(companyId) }) },
  })
}

export function useResendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, inviteId }: { companyId: string; inviteId: string }) => apiClient.resendInvite(inviteId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInvites(companyId) }) },
  })
}

export function useCancelInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, inviteId }: { companyId: string; inviteId: string }) => apiClient.cancelInvite(inviteId),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyInvites(companyId) }) },
  })
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: ({ token, profile }: { token: string; profile?: { firstName?: string; lastName?: string; title?: string; phone?: string; role?: string } }) => apiClient.acceptInvite(token, profile),
  })
}

// Eligibility
export function useRunCompanyEligibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => apiClient.runEligibility(companyId, data),
    onSuccess: (_, { companyId }) => { qc.invalidateQueries({ queryKey: queryKeys.companyEligibilityHistory(companyId, 10) }); },
  });
}
export function useCompanyEligibilityHistory(companyId: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.companyEligibilityHistory(companyId, limit),
    queryFn: () => apiClient.eligibilityHistory(companyId, limit),
    enabled: !!companyId,
  });
}

// align with rate cards
export function useRateCards(companyId: string) {
  return useQuery({
    queryKey: queryKeys.companyRateCards(companyId),
    queryFn: () => apiClient.listRateCards(companyId),
    enabled: !!companyId,
  });
}

// =====================
// UCF Hooks
// =====================
export function useUcfDocument(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.ucfDocument(rfpId),
    queryFn: () => apiClient.getUcfDocument(rfpId),
    enabled: !!rfpId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry if UCF not available
  });
}

export function useUcfSection(rfpId: string, code: string) {
  return useQuery({
    queryKey: queryKeys.ucfSection(rfpId, code),
    queryFn: () => apiClient.getUcfSection(rfpId, code),
    enabled: !!rfpId && !!code,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useUcfCritical(rfpId: string) {
  return useQuery({
    queryKey: queryKeys.ucfCritical(rfpId),
    queryFn: () => apiClient.getUcfCritical(rfpId),
    enabled: !!rfpId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useUcfStats() {
  return useQuery({
    queryKey: queryKeys.ucfStats,
    queryFn: () => apiClient.getUcfStats(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useReparseUcf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rfpId: string) => apiClient.reparseUcf(rfpId),
    onSuccess: (_, rfpId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ucfDocument(rfpId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ucfCritical(rfpId) });
    },
  });
}
