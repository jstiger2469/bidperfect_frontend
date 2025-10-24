// API Client for BidPerfect Backend Integration
// This client provides typed interfaces for all backend endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === '1'

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Upload Types
export interface UploadResponse {
  rfpId: string;
  rfp: RFP;
  message?: string;
  filesProcessed?: number;
  processingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Backend Entity Types (matching your Prisma schema)
export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  naics: string;
  dueAt: string;
  updatedAt: string;
  rfpId: string;
}

export interface RFP {
  id: string;
  title: string;
  agency: string;
  naicsCode: string;
  parsedSections: ParsedSection[];
}

export interface ParsedSection {
  id: string;
  type: string;
  content: any;
  createdAt: string;
}

// Kanban Types
export interface KanbanEvent {
  id: string;
  kind: 'create' | 'update' | 'delete' | 'sync';
  actor: string;
  payload?: any;
  createdAt: string;
}

export interface KanbanCard {
  id: string;
  laneId: string;
  type: 'Requirement' | 'Assumption' | 'Draft' | 'Pricing' | 'QA' | 'Artifact' | 'Blocker' | 'Task';
  title: string;
  status: 'Todo' | 'InProgress' | 'Review' | 'Blocked' | 'Ready' | 'Done';
  tags: string[];
  refs?: {
    route?: string;
    params?: Record<string, string>;
    [key: string]: any;
  };
  data?: {
    acceptance?: Array<{
      text: string;
      met: boolean;
    }>;
    [key: string]: any;
  };
  orderIdx: number;
  assigneeCompanyId?: string | null;
  assigneeStaffId?: string | null;
  assigneeRole?: 'Prime' | 'Sub' | null;
  events?: KanbanEvent[];
  extKey?: string;
}

export interface KanbanLane {
  id: string;
  title: string;
  wipLimit?: number | null;
  orderIdx: number;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: string;
  opportunityId: string;
  name: string;
  lanes: KanbanLane[];
}

export interface ComplianceResponse {
  v: number;
  rfpId: string;
  tieOut: ComplianceRow[];
  clauseFamilies: ClauseFamily[];
  meta: any;
}

export interface ComplianceRow {
  requirement: string;
  required_artifacts: string[];
  where_addressed: any[];
  families: string[];
  anchors: any[];
  summary: any;
  section: string;
}

export interface ClauseFamily {
  family: string;
  obligations: ClauseObligation[];
}

export interface ClauseObligation {
  title: string;
  impact: string;
  required_artifacts: string[];
  references: any[];
}

export interface ReadinessResponse {
  rfpId: string;
  score: number;
  stats: any;
  checklist: any[];
}

export interface GapsResponse {
  gaps: any[];
  coverage: any[];
  wd: any;
}

export interface BinderResponse {
  rfpId: string;
  items: BinderItem[];
}

export interface BinderItem {
  artifact: string;
  requirement: string;
  coveredBy: any[];
  uncovered: boolean;
}

export interface PricingChecksResponse {
  summary: {
    unbalancedCount: number;
    guardrailBreaches: number;
    uncoveredSowBuckets: number;
    orphanClins: number;
    popOutOfRangeClins: number;
  };
  unbalanced: any[];
  guardrails: any[];
  coverage: any[];
  popAlignment: any;
}

export interface DraftLatestResponse {
  rfpId: string;
  content: string;
  savedAt: string;
}

// =====================
// Audit Logs
// =====================
export interface AuditLog {
  id: string;
  actor: string | null;
  actorName: string | null;
  actorEmail: string | null;
  entity: string;
  entityId: string;
  entityLabel: string | null;
  action: string;
  before: any | null;
  after: any | null;
  changedFields: string[];
  metadata: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  companyId: string | null;
  opportunityId: string | null;
  rfpId: string | null;
  createdAt: string;
}

export interface AuditLogPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  pagination: AuditLogPagination;
}

export interface AuditLogStats {
  totalLogs: number;
  byEntity: Array<{ entity: string; _count: { id: number } }>;
  byAction: Array<{ action: string; _count: { id: number } }>;
  byActor: Array<{ actorName: string; _count: { id: number } }>;
  recentActivity: AuditLog[];
}

export interface AuditLogFilters {
  q?: string;
  entity?: string;
  action?: string;
  actor?: string;
  companyId?: string;
  opportunityId?: string;
  rfpId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PartnerCandidate {
  companyId: string;
  name: string;
  score: number;
  reasons: string[];
  naics: string[];
  certs: string[];
  locations: any[];
  source: string;
}

export interface TipsResponse {
  questions: Array<{
    id: string;
    opportunityId: string;
    question: string;
    submittedAt: string | null;
    answeredAt: string | null;
    answer: string | null;
    evidence: {
      source: string;
      section: string;
      due_hint: string;
      page_hint: string;
      rationale: string;
      span_hint: string;
    };
    status: string;
  }>;
}

// =====================
// UCF Types
// =====================
export interface UcfSection {
  id: string;
  ucfDocumentId: string;
  code: string;
  title: string;
  rawText: string;
  startPage: number | null;
  endPage: number | null;
  confidence: number;
  meta: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface UcfDocument {
  id: string;
  rfpId: string;
  detected: boolean;
  confidence: number;
  parseMethod: string | null;
  parseError: string | null;
  createdAt: string;
  updatedAt: string;
  sections: UcfSection[];
}

export interface UcfCriticalSections {
  detected: boolean;
  confidence: number | null;
  sectionL: UcfSection | null;
  sectionM: UcfSection | null;
  hasCriticalSections: boolean;
  message?: string;
}

export interface UcfStats {
  totalDocuments: number;
  detectedCount: number;
  detectionRate: number;
  avgConfidence: number;
  sectionCounts: Array<{
    code: string;
    _count: { id: number };
  }>;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthTokenProvider(getter: () => Promise<string | null>) {
    this.getAuthToken = getter;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.getAuthToken) {
      try {
        const token = await this.getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (DEBUG_API) {
          console.info('[api] attach token', { present: Boolean(token), len: token?.length })
        }
      } catch {}
    }

    const config: RequestInit = { headers, ...options };

    try {
      if (DEBUG_API) {
        const method = (config.method || 'GET').toUpperCase()
        const hasAuth = Boolean((headers['Authorization'] || '').toString().startsWith('Bearer '))
        console.info('[api] request', { method, url, hasAuth, contentType: headers['Content-Type'] })
      }
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
          else if (errorData?.error) errorMessage = errorData.error;
          else if (typeof errorData === 'string') errorMessage = errorData;
        } catch {}
        if (DEBUG_API) {
          console.error('[api] response error', { url, status: response.status, errorMessage })
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      if (DEBUG_API) {
        console.info('[api] response ok', { url })
      }
      return data;
    } catch (error) {
      if (error instanceof TypeError && (error as any).message?.includes('fetch')) {
        throw new Error(`Backend not available. Please start your backend server on ${API_BASE_URL}`);
      }
      if (DEBUG_API) {
        console.error('[api] request failed', { url, error })
      }
      throw error;
    }
  }

  // Health Check
  async health(): Promise<{ ok: boolean }> {
    return this.request('/health');
  }

  // =====================
  // Company Profile Hub
  // =====================

  // Types
  async uploadFile(formData: FormData): Promise<{ fileId: string; url: string; sha256?: string; pages?: number }> {
    const response = await fetch(`${this.baseUrl}/files`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('File upload failed');
    return response.json();
  }

  // Companies
  async listCompanies(params?: { q?: string; naics?: string; socio?: string; state?: string; limit?: number; offset?: number }): Promise<{ items: any[]; total: number; limit: number; offset: number }>{
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.naics) search.set('naics', params.naics);
    if (params?.socio) search.set('socio', params.socio);
    if (params?.state) search.set('state', params.state);
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return this.request(`/companies${qs ? `?${qs}` : ''}`);
  }

  async createCompany(data: { legalName: string; doingBusinessAs?: string; uei?: string; cage?: string; socios?: string[]; naicsCodes?: string[]; pscCodes?: string[] }): Promise<any>{
    return this.request(`/companies`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getCompany(companyId: string): Promise<{ id: string; legalName: string; dba?: string; uei?: string; cage?: string; ein?: string; website?: string; address?: any; naics?: string[]; psc?: string[]; samStatus?: string }>
  {
    return this.request(`/companies/${companyId}`);
  }

  async updateCompany(companyId: string, data: Partial<{ legalName: string; dba?: string; uei?: string; cage?: string; ein?: string; website?: string; address?: any; naics?: string[]; psc?: string[]; samStatus?: string }>): Promise<{ ok: boolean }>
  {
    return this.request(`/companies/${companyId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Registrations (tolerant alias-accepting endpoint)
  async submitCompanyRegistrations(companyId: string, data: {
    uei?: string; cage?: string; ein?: string; duns?: string;
    address?: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string };
    addressLine1?: string; addressLine2?: string; city?: string; state?: string; postalCode?: string;
  }): Promise<{ ok: boolean; companyId: string; profile?: any; hq?: any }>{
    return this.request(`/companies/${companyId}/registrations`, { method: 'POST', body: JSON.stringify(data) })
  }

  async deleteCompany(companyId: string): Promise<{ ok: boolean }>{
    return this.request(`/companies/${companyId}`, { method: 'DELETE' });
  }

  async syncCompanySam(companyId: string): Promise<{ synced: boolean; samStatus: string; samLastSyncAt: string }>{
    return this.request(`/companies/${companyId}/sync/sam`, { method: 'POST' });
  }

  // Tenant/Organization → Company mapping
  async getCompanyByOrg(orgId: string): Promise<{ companyId: string }> {
    return this.request(`/tenants/org/${orgId}`)
  }

  // Me context
  async getMeContext(): Promise<{ userId: string; orgId?: string; companyId?: string; roles?: string[] }> {
    return this.request(`/me/context`)
  }

  // Bootstrap: create company for current org and link
  async bootstrapTenant(payload: { legalName: string; dba?: string; website?: string; uei?: string; cage?: string; naics?: string[]; socio?: string[]; address?: any }): Promise<{ companyId: string }> {
    return this.request(`/tenants/bootstrap`, { method: 'POST', body: JSON.stringify(payload) })
  }

  async linkOrgToCompany(orgId: string, companyId: string): Promise<{ ok: boolean }>{
    return this.request(`/tenants/org/${orgId}/link`, { method: 'POST', body: JSON.stringify({ companyId }) })
  }

  // Certifications
  async listCertifications(companyId: string, params?: { type?: string; status?: string; q?: string; limit?: number; offset?: number }): Promise<{ items: any[]; total: number }>
  {
    const search = new URLSearchParams();
    if (params?.type) search.set('type', params.type);
    if (params?.status) search.set('status', params.status);
    if (params?.q) search.set('q', params.q);
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return this.request(`/companies/${companyId}/certifications${qs ? `?${qs}` : ''}`);
  }

  async createCertification(companyId: string, data: { type: string; fields: any; files?: Array<{ fileId: string; name?: string }> }): Promise<any> {
    return this.request(`/companies/${companyId}/certifications`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCertification(companyId: string, id: string, data: Partial<{ fields: any; status: string; files: Array<{ fileId: string; name?: string }> }>): Promise<any> {
    return this.request(`/companies/${companyId}/certifications/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async verifyCertification(companyId: string, id: string, verified: boolean, notes?: string): Promise<{ ok: boolean }>
  {
    return this.request(`/companies/${companyId}/certifications/${id}/verify`, { method: 'POST', body: JSON.stringify({ verified, notes }) });
  }

  // Documents
  async listCompanyDocuments(companyId: string): Promise<{ items: any[]; total: number }> {
    return this.request(`/companies/${companyId}/documents`);
  }

  async createCompanyDocument(companyId: string, data: { documentType: string; metadata?: any; files: Array<{ fileId: string; name?: string }> }): Promise<any> {
    return this.request(`/companies/${companyId}/documents`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteCompanyDocument(companyId: string, docId: string): Promise<{ ok: boolean }>{
    return this.request(`/companies/${companyId}/documents/${docId}`, { method: 'DELETE' });
  }

  // Staff
  async listStaff(companyId: string): Promise<{ items: any[] }> {
    return this.request(`/companies/${companyId}/staff`);
  }

  async createStaff(companyId: string, data: { name: string; email: string; phone?: string; roles?: string[]; clearance?: string; certs?: string[]; attachments?: Array<{ fileId: string; name?: string }> }): Promise<any>
  {
    return this.request(`/companies/${companyId}/staff`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateStaff(companyId: string, staffId: string, data: Partial<{ roles: string[]; clearance: string; certs: string[]; attachments: Array<{ fileId: string; name?: string }> }>): Promise<any>
  {
    return this.request(`/companies/${companyId}/staff/${staffId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Rates
  async listRateCards(companyId: string): Promise<any[]> {
    return this.request(`/companies/${companyId}/rate-cards`);
  }
  async createRateCard(companyId: string, data: { version: string; notes?: string }): Promise<any> {
    return this.request(`/companies/${companyId}/rate-cards`, { method: 'POST', body: JSON.stringify(data) });
  }
  async getRateCard(rcId: string): Promise<any> { return this.request(`/rate-cards/${rcId}`); }
  async addRateCardItem(rcId: string, item: any): Promise<any> {
    return this.request(`/rate-cards/${rcId}/items`, { method: 'POST', body: JSON.stringify(item) });
  }
  async updateRateCardItem(rcId: string, itemId: string, item: any): Promise<any> {
    return this.request(`/rate-cards/${rcId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(item) });
  }
  async deleteRateCardItem(rcId: string, itemId: string): Promise<{ ok: boolean }> {
    return this.request(`/rate-cards/${rcId}/items/${itemId}`, { method: 'DELETE' });
  }

  // Locations
  async listLocations(companyId: string): Promise<any[]> { return this.request(`/companies/${companyId}/locations`); }
  async createLocation(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/locations`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateLocation(companyId: string, locId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/locations/${locId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteLocation(companyId: string, locId: string): Promise<{ ok: boolean }> { return this.request(`/companies/${companyId}/locations/${locId}`, { method: 'DELETE' }); }

  // Licenses
  async listLicenses(companyId: string): Promise<any[]> { return this.request(`/companies/${companyId}/licenses`); }
  async createLicense(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/licenses`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateLicense(companyId: string, licId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/licenses/${licId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteLicense(companyId: string, licId: string): Promise<{ ok: boolean }> { return this.request(`/companies/${companyId}/licenses/${licId}`, { method: 'DELETE' }); }

  // Insurance
  async listInsurance(companyId: string): Promise<any[]> { return this.request(`/companies/${companyId}/insurance`); }
  async createInsurance(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/insurance`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateInsurance(companyId: string, polId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/insurance/${polId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteInsurance(companyId: string, polId: string): Promise<{ ok: boolean }> { return this.request(`/companies/${companyId}/insurance/${polId}`, { method: 'DELETE' }); }

  // Bonding
  async getBonding(companyId: string): Promise<any> { return this.request(`/companies/${companyId}/bonding`); }
  async createBonding(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/bonding`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateBonding(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/bonding`, { method: 'PATCH', body: JSON.stringify(data) }); }

  // Key People
  async listKeyPeople(companyId: string): Promise<any[]> { return this.request(`/companies/${companyId}/key-people`); }
  async createKeyPerson(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/key-people`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateKeyPerson(companyId: string, personId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/key-people/${personId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteKeyPerson(companyId: string, personId: string): Promise<{ ok: boolean }> { return this.request(`/companies/${companyId}/key-people/${personId}`, { method: 'DELETE' }); }

  // Past Performance
  async listPastPerformance(companyId: string, params?: { agency?: string; naics?: string; start?: string; end?: string }): Promise<any[]> {
    const search = new URLSearchParams();
    if (params?.agency) search.set('agency', params.agency);
    if (params?.naics) search.set('naics', params.naics);
    if (params?.start) search.set('start', params.start);
    if (params?.end) search.set('end', params.end);
    const qs = search.toString();
    return this.request(`/companies/${companyId}/past-performance${qs ? `?${qs}` : ''}`);
  }
  async createPastPerformance(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/past-performance`, { method: 'POST', body: JSON.stringify(data) }); }
  async updatePastPerformance(companyId: string, ppId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/past-performance/${ppId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deletePastPerformance(companyId: string, ppId: string): Promise<{ ok: boolean }> { return this.request(`/companies/${companyId}/past-performance/${ppId}`, { method: 'DELETE' }); }

  // Attestations
  async listAttestations(companyId: string): Promise<any[]> { return this.request(`/companies/${companyId}/attestations`); }
  async createAttestation(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/attestations`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateAttestation(companyId: string, attId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/attestations/${attId}`, { method: 'PATCH', body: JSON.stringify(data) }); }

  // Invites
  async listInvites(companyId: string, status?: string): Promise<{ items: any[] } | any[]> {
    const search = new URLSearchParams()
    if (status) search.set('status', status)
    const qs = search.toString()
    return this.request(`/companies/${companyId}/invites${qs ? `?${qs}` : ''}`)
  }
  async createInvite(companyId: string, data: { email: string; role?: string; expiresDays?: number; metadata?: any }): Promise<any> {
    return this.request(`/companies/${companyId}/invites`, { method: 'POST', body: JSON.stringify(data) })
  }
  async resendInvite(inviteId: string): Promise<any> {
    return this.request(`/invites/${inviteId}/resend`, { method: 'POST', body: JSON.stringify({}) })
  }
  async cancelInvite(inviteId: string): Promise<any> {
    return this.request(`/invites/${inviteId}/cancel`, { method: 'POST', body: JSON.stringify({}) })
  }
  async acceptInvite(token: string, profile?: { firstName?: string; lastName?: string; title?: string; phone?: string; role?: string }): Promise<{ invite: any; staff: any }>{
    return this.request(`/invites/accept`, { method: 'POST', body: JSON.stringify({ token, profile }) })
  }

  // Teaming
  async getTeaming(companyId: string): Promise<any> { return this.request(`/companies/${companyId}/teaming`); }
  async upsertTeaming(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/teaming`, { method: 'PUT', body: JSON.stringify(data) }); }

  // Eligibility
  async runEligibility(companyId: string, data: any): Promise<any> { return this.request(`/companies/${companyId}/eligibility`, { method: 'POST', body: JSON.stringify(data) }); }
  async eligibilityHistory(companyId: string, limit = 10): Promise<any[]> { return this.request(`/companies/${companyId}/eligibility/history?limit=${limit}`); }

  // Opportunities
  async getOpportunities(params?: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Opportunity>> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.set('q', params.q);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    
    const queryString = queryParams.toString();
    return this.request(`/opportunities${queryString ? `?${queryString}` : ''}`);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    console.log('🚀 getOpportunity called with id:', id);
    console.log('🚀 API Base URL:', this.baseUrl);
    console.log('🚀 Full URL:', `${this.baseUrl}/opportunities/${id}`);
    
    try {
      const result = await this.request(`/opportunities/${id}`) as Opportunity;
      console.log('✅ getOpportunity result:', result);
      return result;
    } catch (error) {
      console.error('❌ getOpportunity error:', error);
      throw error;
    }
  }

  // RFP
  async getRFP(id: string): Promise<RFP> {
    return this.request(`/rfp/${id}`);
  }

  // Compliance
  async getCompliance(
    rfpId: string,
    params?: {
      refresh?: boolean;
      limit?: number;
      offset?: number;
      section?: string;
      family?: string;
    }
  ): Promise<ComplianceResponse> {
    const queryParams = new URLSearchParams();
    if (params?.refresh) queryParams.set('refresh', '1');
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.section) queryParams.set('section', params.section);
    if (params?.family) queryParams.set('family', params.family);
    
    const queryString = queryParams.toString();
    return this.request(`/rfp/${rfpId}/compliance${queryString ? `?${queryString}` : ''}`);
  }

  async refreshCompliance(rfpId: string): Promise<{ ok: boolean }> {
    return this.request(`/rfp/${rfpId}/compliance/refresh`, {
      method: 'POST',
    });
  }

  async checkComplianceCoverage(
    rfpId: string,
    text: string
  ): Promise<{ tagged: any[]; score: number }> {
    return this.request(`/rfp/${rfpId}/compliance/coverage`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Readiness
  async getReadiness(opportunityId: string): Promise<ReadinessResponse> {
    return this.request(`/opportunities/${opportunityId}/readiness`);
  }

  // Gaps
  async getGaps(rfpId: string): Promise<GapsResponse> {
    return this.request(`/rfp/${rfpId}/gaps`);
  }

  // Binder
  async getBinder(rfpId: string): Promise<BinderResponse> {
    return this.request(`/rfp/${rfpId}/binder`);
  }

  async getBinderByOpportunity(opportunityId: string): Promise<BinderResponse> {
    return this.request(`/opportunities/${opportunityId}/binder`);
  }

  // Pricing Checks
  async getPricingChecks(opportunityId: string): Promise<PricingChecksResponse> {
    return this.request(`/opportunities/${opportunityId}/pricing/checks`);
  }

  // Draft Workbench
  async saveDraft(
    rfpId: string,
    content: string,
    meta?: any
  ): Promise<{ ok: boolean }> {
    return this.request(`/rfp/${rfpId}/draft/save`, {
      method: 'POST',
      body: JSON.stringify({ content, meta }),
    });
  }

  async getLatestDraft(rfpId: string): Promise<DraftLatestResponse> {
    return this.request(`/rfp/${rfpId}/draft/latest`);
  }

  async getDraftVersions(rfpId: string): Promise<{ rfpId: string; versions: any[] }> {
    return this.request(`/rfp/${rfpId}/draft/versions`);
  }

  async generateDraft(
    rfpId: string,
    bullet: string,
    persona?: string,
    maxWords?: number
  ): Promise<{ paragraphs: string[] }> {
    return this.request(`/rfp/${rfpId}/draft/generate`, {
      method: 'POST',
      body: JSON.stringify({ bullet, persona, maxWords }),
    });
  }

  async rewriteDraft(
    rfpId: string,
    text: string,
    persona?: string,
    tone?: string
  ): Promise<{ text: string }> {
    return this.request(`/rfp/${rfpId}/draft/rewrite`, {
      method: 'POST',
      body: JSON.stringify({ text, persona, tone }),
    });
  }

  // =====================
  // Audit Logs
  // =====================
  async listAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
    });
    const qs = params.toString();
    return this.request(`/audit-logs${qs ? `?${qs}` : ''}`);
  }

  async getAuditLogStats(): Promise<AuditLogStats> {
    return this.request(`/audit-logs/stats`);
  }

  async getAuditLog(id: string): Promise<AuditLog> {
    return this.request(`/audit-logs/${id}`);
  }

  async getCompanyAuditLogs(companyId: string, params?: { limit?: number; offset?: number }): Promise<AuditLogListResponse> {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return this.request(`/companies/${companyId}/audit-logs${qs ? `?${qs}` : ''}`);
  }

  async getOpportunityAuditLogs(opportunityId: string, params?: { limit?: number; offset?: number }): Promise<AuditLogListResponse> {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return this.request(`/opportunities/${opportunityId}/audit-logs${qs ? `?${qs}` : ''}`);
  }

  // Partners/Subcontractors
  async getPartnerSuggestions(params: {
    rfpId?: string;
    q?: string;
    naics?: string;
    state?: string;
    certs?: string;
    limit?: number;
  }): Promise<{ items: PartnerCandidate[] }> {
    const queryParams = new URLSearchParams();
    if (params.rfpId) queryParams.set('rfpId', params.rfpId);
    if (params.q) queryParams.set('q', params.q);
    if (params.naics) queryParams.set('naics', params.naics);
    if (params.state) queryParams.set('state', params.state);
    if (params.certs) queryParams.set('certs', params.certs);
    if (params.limit) queryParams.set('limit', String(params.limit));
    
    const queryString = queryParams.toString();
    return this.request(`/partners/suggest${queryString ? `?${queryString}` : ''}`);
  }

  // Tips
  async getTips(rfpId: string): Promise<TipsResponse> {
    return this.request(`/rfp/${rfpId}/tips`);
  }

  async getOpportunityTips(opportunityId: string): Promise<TipsResponse> {
    return this.request(`/opportunities/${opportunityId}/tips`);
  }

  // Q&A
  async getQuestions(opportunityId: string, llmOnly?: boolean): Promise<TipsResponse> {
    const queryParams = new URLSearchParams();
    if (llmOnly) queryParams.set('llmOnly', '1');
    
    const queryString = queryParams.toString();
    return this.request(`/opportunities/${opportunityId}/qa${queryString ? `?${queryString}` : ''}`);
  }

  async refreshQuestions(opportunityId: string): Promise<{ ok: boolean }> {
    return this.request(`/opportunities/${opportunityId}/qa/refresh`, {
      method: 'POST',
    });
  }

  async syncOpportunitySections(opportunityId: string): Promise<{ queued: boolean; sections?: number }> {
    return this.request(`/opportunities/${opportunityId}/sync/sections`, {
      method: 'POST',
    });
  }

  // Assumptions
  async getAssumptions(opportunityId: string): Promise<{ opportunityId: string; total: number; items: any[] }> {
    return this.request(`/opportunities/${opportunityId}/assumptions`);
  }

  // Kanban Board Methods
  async initKanbanBoard(opportunityId: string): Promise<{ ok: boolean }> {
    return this.request(`/opportunities/${opportunityId}/kanban/init`, {
      method: 'POST',
      body: JSON.stringify({}), // Send empty object instead of no body
    });
  }

  async getKanbanBoard(opportunityId: string): Promise<KanbanBoard> {
    const response = await this.request(`/opportunities/${opportunityId}/kanban`) as { board?: KanbanBoard } | KanbanBoard;
    console.log('🔍 getKanbanBoard raw response:', response);
    // The API returns { board: { ... } }, but we need just the board object
    const board = 'board' in response ? response.board : response;
    console.log('🔍 getKanbanBoard extracted board:', board);
    console.log('🔍 getKanbanBoard board.lanes:', (board as KanbanBoard)?.lanes ? `has ${(board as KanbanBoard).lanes.length} lanes` : 'no lanes');
    return board as KanbanBoard;
  }

  async syncKanbanBoard(opportunityId: string): Promise<{ ok: boolean; summary?: { created: number; updated: number; total: number } }> {
    return this.request(`/opportunities/${opportunityId}/kanban/sync`, {
      method: 'POST',
      body: JSON.stringify({}), // Send empty object instead of no body
    });
  }

  async createKanbanLane(opportunityId: string, data: { title: string; wipLimit?: number; orderIdx?: number }): Promise<KanbanLane> {
    return this.request(`/opportunities/${opportunityId}/kanban/lanes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKanbanLane(opportunityId: string, laneId: string, data: Partial<KanbanLane>): Promise<KanbanLane> {
    return this.request(`/opportunities/${opportunityId}/kanban/lanes/${laneId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createKanbanCard(opportunityId: string, data: { laneId: string; type: KanbanCard['type']; title: string; [key: string]: any }): Promise<KanbanCard> {
    return this.request(`/opportunities/${opportunityId}/kanban/cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKanbanCard(opportunityId: string, cardId: string, data: Partial<KanbanCard>): Promise<KanbanCard> {
    return this.request(`/opportunities/${opportunityId}/kanban/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteKanbanCard(opportunityId: string, cardId: string): Promise<{ ok: boolean }> {
    return this.request(`/opportunities/${opportunityId}/kanban/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // Upload Methods
  async uploadRFP(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResponse> {
    // For individual files, we'll use the zip endpoint as the primary method
    // This ensures consistent processing pipeline
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await fetch(`${this.baseUrl}/rfp/ingest/archive`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadZipRFP(zipFile: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('zip', zipFile);

    const response = await fetch(`${this.baseUrl}/rfp/ingest/zip`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Zip upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUploadStatus(opportunityId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    error?: string;
  }> {
    return this.request(`/opportunities/${opportunityId}/upload/status`);
  }

  async createOpportunityFromRFP(rfpId: string): Promise<{ opportunityId: string; opportunity: Opportunity }> {
    return this.request(`/opportunities/create-from-rfp`, {
      method: 'POST',
      body: JSON.stringify({ rfpId }),
    });
  }

  async runAgents(rfpId: string, agents: string[]): Promise<{ status: string; results?: any }> {
    return this.request(`/assistant/${rfpId}/agents/run`, {
      method: 'POST',
      body: JSON.stringify({ agents }),
    });
  }

  // =====================
  // Opportunity Documents
  // =====================
  async listOpportunityDocuments(opportunityId: string, params?: { tag?: string; tags?: string[] }): Promise<{ items: any[] }> {
    const search = new URLSearchParams()
    if (params?.tag) search.set('tag', params.tag)
    if (params?.tags && params.tags.length) search.set('tags', params.tags.join(','))
    const qs = search.toString()
    return this.request(`/opportunities/${opportunityId}/documents${qs ? `?${qs}` : ''}`)
  }

  async createOpportunityDocument(opportunityId: string, data: {
    s3Bucket?: string
    storageKey?: string
    key?: string
    filename?: string
    name?: string
    mime?: string
    mimeType?: string
    sizeBytes?: number
    sha256?: string
    tags?: string[]
    metadata?: any
  }): Promise<any> {
    return this.request(`/opportunities/${opportunityId}/documents`, { method: 'POST', body: JSON.stringify(data) })
  }

  // =====================
  // UCF (Uniform Contract Format)
  // =====================
  async getUcfDocument(rfpId: string): Promise<UcfDocument> {
    return this.request(`/rfp/${rfpId}/ucf`)
  }

  async getUcfSection(rfpId: string, code: string): Promise<UcfSection> {
    return this.request(`/rfp/${rfpId}/ucf/sections/${code}`)
  }

  async getUcfCritical(rfpId: string): Promise<UcfCriticalSections> {
    return this.request(`/rfp/${rfpId}/ucf/critical`)
  }

  async reparseUcf(rfpId: string): Promise<{ success: boolean; ucfDoc: UcfDocument; message: string }> {
    return this.request(`/rfp/${rfpId}/ucf/reparse`, { method: 'POST', body: JSON.stringify({}) })
  }

  async getUcfStats(): Promise<UcfStats> {
    return this.request(`/ucf/stats`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  Opportunity as ApiOpportunity,
  RFP as ApiRFP,
  ComplianceResponse as ApiComplianceResponse,
  ReadinessResponse as ApiReadinessResponse,
  GapsResponse as ApiGapsResponse,
  BinderResponse as ApiBinderResponse,
  PricingChecksResponse as ApiPricingChecksResponse,
  DraftLatestResponse as ApiDraftLatestResponse,
  PartnerCandidate as ApiPartnerCandidate,
  TipsResponse as ApiTipsResponse,
  KanbanBoard as ApiKanbanBoard,
  KanbanLane as ApiKanbanLane,
  KanbanCard as ApiKanbanCard,
};
