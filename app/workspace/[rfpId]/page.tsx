'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Target,
  Zap,
  Download,
  Eye,
  Edit3,
  BarChart3,
  Settings,
  MessageSquare,
  Share2,
  RefreshCw
} from 'lucide-react'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, computeCoverageForArtifact } from '@/lib/utils'
import { useRFPData, useReadinessScore, useBinder, useComplianceRequirements, useQuestions, useAssumptions, useRefreshQuestions, useSyncOpportunitySections, useQAPolling, useSyncKanbanBoard, useRefreshCompliance, useCompanyDocuments, useOpportunityDocuments, useUcfCritical } from '@/lib/hooks'
import { useActiveCompanyId } from '@/lib/tenant'
import EnhancedKanbanBoard from '@/components/EnhancedKanbanBoard'
import SideDrawer from '@/components/SideDrawer'
import ActivityFeed from '@/components/ActivityFeed'
import FileUploadZone from '@/components/FileUploadZone'
import { SpiritSuggestion, useSpiritSuggestion } from '@/components/SpiritSuggestion'

interface RFPData {
  id: string
  title: string
  agency: string
  dueDate: string
  status: string
  readiness: number
  estimatedValue: string
  daysLeft: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  evaluationFactors: Array<{
    name: string
    weight: number
    description: string
    ourScore: number
    riskLevel: 'low' | 'medium' | 'high'
  }>
  clins: Array<{
    number: string
    description: string
    amount: number
  }>
  team: Array<{
    id: string
    name: string
    role: string
    clearance?: string
  }>
  subcontractors: Array<{
    id: string
    name: string
    role: string
    status: string
  }>
}

// Mock RFP data based on ID
const getRFPData = (rfpId: string): RFPData => {
  const rfpDatabase: Record<string, RFPData> = {
    '001': {
      id: '001',
      title: 'IT Infrastructure Modernization',
      agency: 'Department of Education',
      dueDate: '2024-02-28',
      status: 'review',
      readiness: 87,
      estimatedValue: '$2.3M',
      daysLeft: 8,
      priority: 'critical',
      evaluationFactors: [
        {
          name: 'Technical Approach',
          weight: 40,
          description: 'Technical solution methodology and approach to modernization',
          ourScore: 8,
          riskLevel: 'low'
        },
        {
          name: 'Management Approach',
          weight: 30,
          description: 'Project management and organizational approach',
          ourScore: 7,
          riskLevel: 'medium'
        },
        {
          name: 'Past Performance',
          weight: 30,
          description: 'Relevant experience and customer satisfaction',
          ourScore: 9,
          riskLevel: 'low'
        }
      ],
      clins: [
        { number: '0001', description: 'Base Infrastructure Setup', amount: 850000 },
        { number: '0002', description: 'Security Implementation', amount: 620000 },
        { number: '0003', description: 'Training and Support', amount: 280000 },
        { number: '0004', description: 'Documentation', amount: 180000 },
        { number: '0005', description: 'Transition Services', amount: 370000 }
      ],
      team: [
        { id: 'tm-001', name: 'Colleen Martinez', role: 'Project Manager', clearance: 'Secret' },
        { id: 'tm-002', name: 'Dr. Sarah Chen', role: 'Technical Lead', clearance: 'Secret' },
        { id: 'tm-003', name: 'James Rodriguez', role: 'Security Specialist', clearance: 'Top Secret' },
        { id: 'tm-004', name: 'Emily Davis', role: 'Systems Architect' }
      ],
      subcontractors: [
        { id: 'sub-001', name: 'TechFlow Solutions', role: 'Network Infrastructure', status: 'confirmed' },
        { id: 'sub-002', name: 'CyberGuard Inc.', role: 'Security Implementation', status: 'negotiating' }
      ]
    },
    '002': {
      id: '002',
      title: 'Security System Upgrade',
      agency: 'Federal Building Administration',
      dueDate: '2024-04-10',
      status: 'planning',
      readiness: 34,
      estimatedValue: '$890K',
      daysLeft: 28,
      priority: 'medium',
      evaluationFactors: [
        {
          name: 'Technical Approach',
          weight: 35,
          description: 'Security system design and implementation approach',
          ourScore: 6,
          riskLevel: 'medium'
        },
        {
          name: 'Price',
          weight: 45,
          description: 'Cost competitiveness and value proposition',
          ourScore: 8,
          riskLevel: 'low'
        },
        {
          name: 'Past Performance',
          weight: 20,
          description: 'Federal security project experience',
          ourScore: 7,
          riskLevel: 'medium'
        }
      ],
      clins: [
        { number: '0001', description: 'Access Control Systems', amount: 320000 },
        { number: '0002', description: 'CCTV Installation', amount: 250000 },
        { number: '0003', description: 'Integration Services', amount: 180000 },
        { number: '0004', description: 'Testing & Commissioning', amount: 90000 },
        { number: '0005', description: 'Training', amount: 50000 }
      ],
      team: [
        { id: 'tm-001', name: 'Colleen Martinez', role: 'Project Manager' },
        { id: 'tm-005', name: 'Marcus Johnson', role: 'Security Engineer', clearance: 'Secret' },
        { id: 'tm-006', name: 'Lisa Park', role: 'Installation Supervisor' }
      ],
      subcontractors: [
        { id: 'sub-003', name: 'SecureForce LLC', role: 'Hardware Installation', status: 'pending' }
      ]
    },
    '003': {
      id: '003',
      title: 'HVAC Replacement - Kent Middle School',
      agency: 'GSA Region 6',
      dueDate: '2024-03-15',
      status: 'in-progress',
      readiness: 65,
      estimatedValue: '$150K',
      daysLeft: 12,
      priority: 'high',
      evaluationFactors: [
        {
          name: 'Technical Approach',
          weight: 40,
          description: 'HVAC system design and energy efficiency approach',
          ourScore: 8,
          riskLevel: 'low'
        },
        {
          name: 'Price',
          weight: 40,
          description: 'Cost reasonableness for HVAC replacement',
          ourScore: 7,
          riskLevel: 'medium'
        },
        {
          name: 'Past Performance',
          weight: 20,
          description: 'School facility and HVAC project experience',
          ourScore: 9,
          riskLevel: 'low'
        }
      ],
      clins: [
        { number: '0001', description: 'HVAC Unit Procurement', amount: 85000 },
        { number: '0002', description: 'Installation Services', amount: 35000 },
        { number: '0003', description: 'Electrical Connections', amount: 18000 },
        { number: '0004', description: 'Testing & Startup', amount: 8000 },
        { number: '0005', description: 'Disposal of Old Units', amount: 4000 }
      ],
      team: [
        { id: 'tm-001', name: 'Colleen Martinez', role: 'Project Manager' },
        { id: 'tm-007', name: 'Robert Kim', role: 'HVAC Lead Technician' },
        { id: 'tm-008', name: 'Angela Torres', role: 'Electrical Specialist' }
      ],
      subcontractors: [
        { id: 'sub-001', name: 'Statewide HVAC', role: 'Primary HVAC Contractor', status: 'confirmed' }
      ]
    }
  }

  return rfpDatabase[rfpId] || rfpDatabase['001']
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'sections', label: 'Sections (UCF)', icon: FileText },
  { id: 'proposal-writer', label: 'Proposal Writer', icon: Edit3 },
  { id: 'kanban', label: 'Kanban', icon: BarChart3 },
  { id: 'evaluation', label: 'Evaluation', icon: Target },
  { id: 'instructions', label: 'Instructions', icon: FileText },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'binder', label: 'Binder', icon: CheckCircle },
  { id: 'qa', label: 'Q&A', icon: MessageSquare },
  { id: 'assumptions', label: 'Assumptions', icon: Settings },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'scenarios', label: 'Scenarios', icon: BarChart3 }
]

export default function RFPWorkspacePage({ params }: { params: Promise<{ rfpId: string }> }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const refreshCompliance = useRefreshCompliance()
  const { suggestion, showSuggestion, closeSuggestion } = useSpiritSuggestion()
  
  // Extract rfpId from params with React.use()
  const { rfpId: extractedRfpId } = React.use(params)
  console.log('🎯 Params extracted with React.use():', { rfpId: extractedRfpId })
  
  // Use extractedRfpId directly instead of state
  const rfpId = extractedRfpId || ''
  
  // Test API call directly
  const testApiCall = async () => {
    try {
      console.log('🧪 Testing API call directly...');
      const response = await fetch(`http://localhost:3001/opportunities/${rfpId}`);
      const data = await response.json();
      console.log('🧪 Direct API response:', data);
    } catch (error) {
      console.error('🧪 Direct API error:', error);
    }
  };
  
  // Debug rfpId changes
  React.useEffect(() => {
    console.log('🔄 rfpId changed:', { rfpId })
  }, [rfpId])
  
  // Fetch real RFP data from API
  const { data: rfpData, loading: rfpLoading, error: rfpError } = useRFPData(rfpId)
  
  // Extract the actual RFP ID robustly:
  // - If rfpData is an Opportunity (fallback), it has rfpId
  // - If rfpData is mapped/real RFP, its id is the RFP id
  const actualRfpId = (rfpData as any)?.rfpId || (rfpData as any)?.id || ''
  
  // Debug logging
  React.useEffect(() => {
    console.log('Workspace Debug:', {
      rfpId,
      rfpData,
      rfpLoading,
      rfpError,
      actualRfpId
    })
  }, [rfpId, rfpData, rfpLoading, rfpError, actualRfpId])

  // Debug logging for params
  React.useEffect(() => {
    console.log('Params Debug:', { params });
  }, [params])

  
  const { score: readinessScore, loading: readinessLoading } = useReadinessScore(rfpId)
  const { data: binderData, isLoading: binderLoading } = useBinder(actualRfpId)
  const { data: complianceRequirements, loading: complianceLoading } = useComplianceRequirements(actualRfpId)
  const { data: ucfCritical, isLoading: ucfLoading } = useUcfCritical(actualRfpId)
  
  // QA and Assumptions data (using opportunityId from URL)
  const { data: qaData, isLoading: qaLoading } = useQuestions(rfpId || '') // Get all Q&A data
  const { data: assumptionsData, isLoading: assumptionsLoading } = useAssumptions(rfpId || '')
  
  // Q&A mutations
  const refreshQuestionsMutation = useRefreshQuestions()
  const syncSectionsMutation = useSyncOpportunitySections()
  const syncKanbanMutation = useSyncKanbanBoard()
  
  // Q&A state
  const [qaFilter, setQaFilter] = useState<'all' | 'llm-only'>('all')
  const [qaStatusFilter, setQaStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'answered'>('all')
  const [qaSearchTerm, setQaSearchTerm] = useState('')
  const [isGeneratingQA, setIsGeneratingQA] = useState(false)
  
  // Q&A polling
  const qaPollingQuery = useQAPolling(rfpId, isGeneratingQA)
  
  // Sections data
  const sectionsData = (rfpData as any)?.parsedSections || []
  const sectionsLoading = rfpLoading

  // UI drawers and local forms
  const [docDrawerOpen, setDocDrawerOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<any | null>(null)
  const [staffDrawerOpen, setStaffDrawerOpen] = useState(false)

  // Real company documents for coverage matching
  const { companyId } = (useActiveCompanyId as any)() || { companyId: '' }
  const { data: companyDocs, loading: docsLoading } = (useCompanyDocuments as any)(companyId || '')
  const { data: oppDocs } = (useOpportunityDocuments as any)(rfpId || '')

  const mappedDocs = React.useMemo(() => {
    const items: any[] = companyDocs?.items || []
    const oppItems: any[] = oppDocs?.items || []
    const mapDoc = (d: any, scope: 'company' | 'opportunity') => ({
      id: d.id || d.documentId || (d.files?.[0]?.fileId) || `${Math.random()}`,
      name: d.name || d.documentType || d.title || 'Document',
      type: (d.mimeType || d.type || d.files?.[0]?.mimeType || '').split('/').pop()?.toLowerCase(),
      tags: d.tags || d.metadata?.tags || d.labels || [],
      expiresAt: d.metadata?.expires || d.metadata?.expiry || d.expiresAt || null,
      uploadedAt: d.createdAt || d.uploadedAt || d.metadata?.uploadedAt || null,
      scope,
    })
    return [
      ...items.map((d:any)=> mapDoc(d, 'company')),
      ...oppItems.map((d:any)=> mapDoc(d, 'opportunity')),
    ]
  }, [companyDocs, oppDocs])
  
  // Handle Q&A generation state
  React.useEffect(() => {
    if (refreshQuestionsMutation.isPending || syncSectionsMutation.isPending) {
      setIsGeneratingQA(true)
    } else if (refreshQuestionsMutation.isSuccess || syncSectionsMutation.isSuccess) {
      // Start polling after successful mutation
      setIsGeneratingQA(true)
    }
  }, [refreshQuestionsMutation.isPending, syncSectionsMutation.isPending, refreshQuestionsMutation.isSuccess, syncSectionsMutation.isSuccess])
  
        // Stop polling when LLM questions appear or after timeout
        React.useEffect(() => {
          if (qaPollingQuery.data?.questions && qaPollingQuery.data.questions.length > 0) {
            setIsGeneratingQA(false)
          }
        }, [qaPollingQuery.data])
  
  // Auto-stop polling after 90 seconds
  React.useEffect(() => {
    if (isGeneratingQA) {
      const timeout = setTimeout(() => {
        setIsGeneratingQA(false)
      }, 90000) // 90 seconds
      return () => clearTimeout(timeout)
    }
  }, [isGeneratingQA])

  // Spirit suggestion is available but not auto-triggered
  // Call showSuggestion() manually when needed

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'review': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'planning': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200'
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-600 bg-emerald-50'
      case 'medium': return 'text-amber-600 bg-amber-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* RFP Details */}
            <Card>
              <CardHeader>
                <CardTitle>RFP Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agency</p>
                    <p className="font-semibold">{(rfpData as any)?.agency || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Due Date</p>
                    <p className="font-semibold">
                      {safeRfpData.dueAt ? new Date(safeRfpData.dueAt).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">NAICS Code</p>
                    <p className="font-semibold">{(rfpData as any)?.naics || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Days Left</p>
                    <p className="font-semibold text-orange-600">
                      {safeRfpData.dueAt ? Math.ceil((new Date(safeRfpData.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                    </p>
                  </div>
                </div>
                
                {/* Additional RFP Information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">RFP ID</p>
                      <p className="font-mono text-sm">{(rfpData as any)?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Source File</p>
                      <p className="text-sm text-blue-600 truncate">
                        {(rfpData as any)?.sourceFileUrl ? 'Available' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <ActivityFeed title="Recent Activity" scope={{ opportunityId: rfpId }} />

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Readiness</span>
                    <span className="text-lg font-bold text-blue-600">{readinessScore || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${readinessScore || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UCF Critical Sections (L & M) */}
            {ucfCritical?.hasCriticalSections && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Critical UCF Sections
                        {ucfCritical.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(ucfCritical.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Instructions to Offerors (L) and Evaluation Factors (M)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ucfCritical.sectionL && (
                    <div className="p-4 border rounded-lg bg-blue-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-blue-900">Section L: Instructions to Offerors</h4>
                          {ucfCritical.sectionL.startPage && (
                            <p className="text-xs text-blue-600 mt-1">
                              Pages: {ucfCritical.sectionL.startPage}
                              {ucfCritical.sectionL.endPage && ucfCritical.sectionL.endPage !== ucfCritical.sectionL.startPage 
                                ? `-${ucfCritical.sectionL.endPage}` 
                                : ''}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {(ucfCritical.sectionL.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {ucfCritical.sectionL.rawText?.substring(0, 300)}
                        {ucfCritical.sectionL.rawText && ucfCritical.sectionL.rawText.length > 300 ? '...' : ''}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 mt-2"
                        onClick={() => router.push(`/workspace/${rfpId}/sections/L`)}
                      >
                        View Full Section L →
                      </Button>
                    </div>
                  )}
                  {ucfCritical.sectionM && (
                    <div className="p-4 border rounded-lg bg-purple-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-purple-900">Section M: Evaluation Factors for Award</h4>
                          {ucfCritical.sectionM.startPage && (
                            <p className="text-xs text-purple-600 mt-1">
                              Pages: {ucfCritical.sectionM.startPage}
                              {ucfCritical.sectionM.endPage && ucfCritical.sectionM.endPage !== ucfCritical.sectionM.startPage 
                                ? `-${ucfCritical.sectionM.endPage}` 
                                : ''}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {(ucfCritical.sectionM.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {ucfCritical.sectionM.rawText?.substring(0, 300)}
                        {ucfCritical.sectionM.rawText && ucfCritical.sectionM.rawText.length > 300 ? '...' : ''}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-purple-600 mt-2"
                        onClick={() => router.push(`/workspace/${rfpId}/sections/M`)}
                      >
                        View Full Section M →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Backend Data Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Data Summary</CardTitle>
                <CardDescription>Available backend data for this RFP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {(rfpData as any)?.parsedSections?.length || 0}
                    </div>
                    <div className="text-sm text-blue-700">Parsed Sections</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {qaData?.questions?.length || 0}
                    </div>
                    <div className="text-sm text-green-700">Q&A Items</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {assumptionsData?.items?.length || 0}
                    </div>
                    <div className="text-sm text-purple-700">Assumptions</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {binderData?.items?.length || 0}
                    </div>
                    <div className="text-sm text-orange-700">Binder Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parsed Sections Preview */}
            {(rfpData as any)?.parsedSections && (rfpData as any).parsedSections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parsed Sections</CardTitle>
                  <CardDescription>RFP content broken down by section type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(rfpData as any).parsedSections.slice(0, 5).map((section: any, index: number) => (
                      <div key={section.id || index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{section.type}</h4>
                          <span className="text-xs text-gray-500">
                            {section.tasks?.length || 0} tasks
                          </span>
                        </div>
                        {section.content && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {typeof section.content === 'string' 
                              ? section.content.substring(0, 200) + '...'
                              : JSON.stringify(section.content).substring(0, 200) + '...'
                            }
                          </p>
                        )}
                        {section.sources && section.sources.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600">
                            Sources: {section.sources.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                    {(rfpData as any).parsedSections.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        ... and {(rfpData as any).parsedSections.length - 5} more sections
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'sections':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parsed Sections</CardTitle>
                    <CardDescription>AI-analyzed sections from {(rfpData as any)?.title || 'this RFP'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => syncSectionsMutation.mutate(rfpId)}
                      disabled={syncSectionsMutation.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {syncSectionsMutation.isPending ? 'Syncing...' : 'Sync Sections'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sectionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading sections...</p>
                  </div>
                ) : sectionsData && sectionsData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-600 mb-4">
                      Found {sectionsData.length} parsed sections
                    </div>
                    {sectionsData.map((section: any, index: number) => (
                      <div key={section.id || index} className="border rounded-lg bg-white shadow-sm">
                        {/* Section Header */}
                        <div className="p-4 border-b bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {section.type || `Section ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {section.content 
                                  ? `${typeof section.content === 'string' 
                                      ? section.content.length 
                                      : section.content.raw?.length || 0} characters`
                                  : 'No content'
                                }
                              </p>
                            </div>
                            <Badge variant="outline">
                              {section.type || 'Unknown'}
                            </Badge>
                          </div>
                        </div>

                        {/* Section Content */}
                        <div className="p-4 space-y-4">
                          {/* Summary */}
                          {section.summary && (
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                              <h4 className="font-medium text-blue-900 mb-2">AI Summary</h4>
                              <p className="text-sm text-blue-800">{section.summary}</p>
                            </div>
                          )}

                          {/* Key Points */}
                          {section.keyPoints && section.keyPoints.length > 0 && (
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                              <h4 className="font-medium text-green-900 mb-2">Key Points ({section.keyPoints.length})</h4>
                              <ul className="space-y-1">
                                {section.keyPoints.map((point: string, pointIndex: number) => (
                                  <li key={pointIndex} className="text-sm text-green-800 flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Compliance Requirements */}
                          {section.complianceRequirements && section.complianceRequirements.length > 0 && (
                            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                              <h4 className="font-medium text-orange-900 mb-2">Compliance Requirements ({section.complianceRequirements.length})</h4>
                              <ul className="space-y-1">
                                {section.complianceRequirements.map((req: string, reqIndex: number) => (
                                  <li key={reqIndex} className="text-sm text-orange-800 flex items-start gap-2">
                                    <span className="text-orange-600 mt-1">•</span>
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Technical Specifications */}
                          {section.technicalSpecs && section.technicalSpecs.length > 0 && (
                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                              <h4 className="font-medium text-purple-900 mb-2">Technical Specifications ({section.technicalSpecs.length})</h4>
                              <ul className="space-y-1">
                                {section.technicalSpecs.map((spec: string, specIndex: number) => (
                                  <li key={specIndex} className="text-sm text-purple-800 flex items-start gap-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>{spec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Tasks */}
                          {section.content && typeof section.content === 'object' && section.content.tasks && section.content.tasks.length > 0 && (
                            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                              <h4 className="font-medium text-indigo-900 mb-2">Tasks ({section.content.tasks.length})</h4>
                              <ul className="space-y-1">
                                {section.content.tasks.map((task: any, taskIndex: number) => (
                                  <li key={taskIndex} className="text-sm text-indigo-800 flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>{typeof task === 'string' ? task : task.title || task.description || JSON.stringify(task)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Raw Content */}
                          {section.content && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Raw Content</h4>
                              <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                                {typeof section.content === 'string' 
                                  ? section.content
                                  : section.content.raw || JSON.stringify(section.content)
                                }
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {section.pageNumber && (
                              <Badge variant="secondary">Page {section.pageNumber}</Badge>
                            )}
                            {section.confidence && (
                              <Badge variant="secondary">Confidence: {Math.round(section.confidence * 100)}%</Badge>
                            )}
                            {section.wordCount && (
                              <Badge variant="secondary">{section.wordCount} words</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Found</h3>
                    <p className="text-gray-600 mb-4">No parsed sections are available for this RFP.</p>
                    <Button 
                      onClick={() => syncSectionsMutation.mutate(rfpId)}
                      disabled={syncSectionsMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {syncSectionsMutation.isPending ? 'Syncing...' : 'Sync Sections'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Documents (inline checklist) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>Upload missing artifacts directly from here</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {binderLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading requirements…</p>
                  </div>
                ) : binderData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">Missing ({binderData.items.filter((i:any)=>i.uncovered).length})</h4>
                      <div className="space-y-3">
                        {binderData.items.filter((i:any)=>i.uncovered).slice(0,6).map((item:any, idx:number)=> (
                          <div key={idx} className="p-3 rounded-lg border border-red-200 bg-red-50/60">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-red-100 text-red-700 border-red-200">Required</Badge>
                                  <span className="font-medium text-gray-900 truncate">{item.artifact}</span>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2">{item.requirement}</p>
                              </div>
                              <Button size="sm" variant="frosted" onClick={()=>{ setSelectedRequirement(item); setDocDrawerOpen(true) }}>Upload</Button>
                            </div>
                          </div>
                        ))}
                        {binderData.items.filter((i:any)=>i.uncovered).length === 0 && (
                          <div className="text-sm text-gray-600">All required artifacts are covered.</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700">Recently Covered</h4>
                      <div className="space-y-3">
                        {binderData.items.filter((i:any)=>!i.uncovered).slice(0,6).map((item:any, idx:number)=> (
                          <div key={idx} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Covered</Badge>
                                  <span className="font-medium text-gray-900 truncate">{item.artifact}</span>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2">{item.requirement}</p>
                              </div>
                              <Button size="sm" variant="outline" onClick={()=>{ setSelectedRequirement(item); setDocDrawerOpen(true) }}>Add</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No binder data available.</div>
                )}
              </CardContent>
            </Card>

            {/* Staff & Roles (inline) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Staff & Roles</CardTitle>
                    <CardDescription>Assign team members to this opportunity</CardDescription>
                  </div>
                  <Button size="sm" variant="frosted" onClick={()=> setStaffDrawerOpen(true)}>Add Staff</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safeTeam.map((m:any, i:number)=> (
                    <div key={i} className="p-3 border rounded-lg bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {m.name.split(' ').map((n:string)=>n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{m.name}</div>
                          <div className="text-xs text-gray-600">{m.role}</div>
                        </div>
                      </div>
                      {m.clearance && <Badge variant="outline" className="bg-green-50 text-green-700">{m.clearance}</Badge>}
                    </div>
                  ))}
                  {safeTeam.length === 0 && (
                    <div className="text-sm text-gray-600">No staff assigned yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'evaluation':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Factors Analysis</CardTitle>
                <CardDescription>RFP-specific evaluation criteria and our competitive position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {safeEvaluationFactors.map((factor: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{factor.name}</h3>
                        <Badge variant="outline">{factor.weight}% Weight</Badge>
                      </div>
                      <Badge className={getRiskColor(factor.riskLevel)}>
                        {factor.riskLevel} risk
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{factor.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Our Competitive Strength</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${factor.ourScore * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{factor.ourScore}/10</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Strategic Focus</p>
                        <p className="text-sm">
                          {factor.riskLevel === 'high' ? 'Requires immediate attention and strengthening' :
                           factor.riskLevel === 'medium' ? 'Monitor and optimize approach' :
                           'Maintain competitive advantage'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Line Items (CLINs)</CardTitle>
                <CardDescription>Detailed pricing breakdown for {safeTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeClins.map((clin: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">CLIN {clin.number}</p>
                        <p className="text-sm text-gray-600">{clin.description}</p>
                      </div>
                      <p className="font-semibold text-lg">${clin.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg">Total Contract Value</p>
                      <p className="font-bold text-xl text-blue-600">
                        ${safeClins.reduce((sum: number, clin: any) => sum + (clin.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Strategy for this RFP */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategy</CardTitle>
                <CardDescription>Competitive positioning for {safeTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">15%</p>
                    <p className="text-sm text-gray-600">Below ceiling price</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">92%</p>
                    <p className="text-sm text-gray-600">Cost confidence</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">3</p>
                    <p className="text-sm text-gray-600">Expected competitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'documents':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>
                      Upload missing artifacts to satisfy binder requirements for {safeTitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {binderLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading requirements...</p>
                  </div>
                ) : binderData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Uncovered */}
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">Missing ({binderData.items.filter((i:any)=>i.uncovered).length})</h4>
                      <div className="space-y-3">
                        {binderData.items.filter((i:any)=>i.uncovered).map((item:any, idx:number)=> (
                          <div key={idx} className="p-4 rounded-lg border border-red-200 bg-red-50/60">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-red-100 text-red-700 border-red-200">Required</Badge>
                                  <span className="font-medium text-gray-900">{item.artifact}</span>
                                </div>
                                <p className="text-sm text-gray-700">{item.requirement}</p>
                              </div>
                              <Button size="sm" variant="frosted" onClick={()=>{ setSelectedRequirement(item); setDocDrawerOpen(true) }}>Upload</Button>
                            </div>
                          </div>
                        ))}
                        {binderData.items.filter((i:any)=>i.uncovered).length === 0 && (
                          <div className="text-sm text-gray-600">All required artifacts are covered.</div>
                        )}
                      </div>
                    </div>

                    {/* Covered */}
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700">Covered ({binderData.items.filter((i:any)=>!i.uncovered).length})</h4>
                      <div className="space-y-3">
                        {binderData.items.filter((i:any)=>!i.uncovered).map((item:any, idx:number)=> (
                          <div key={idx} className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Covered</Badge>
                                  <span className="font-medium text-gray-900">{item.artifact}</span>
                                </div>
                                <p className="text-sm text-gray-700">{item.requirement}</p>
                              </div>
                              <Button size="sm" variant="outline" onClick={()=>{ setSelectedRequirement(item); setDocDrawerOpen(true) }}>Add Another</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">No binder data available.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'binder':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>RFP Binder</CardTitle>
                    <CardDescription>Document coverage and compliance artifacts for {safeTitle}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshCompliance.mutate(actualRfpId)}
                      disabled={!actualRfpId || refreshCompliance.isPending}
                    >
                      {refreshCompliance.isPending ? (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Refreshing…</span>
                      ) : (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh Compliance</span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {binderLoading || docsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading requirements…</p>
                  </div>
                ) : binderData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {binderData.items.filter(item => !item.uncovered).length}
                        </div>
                        <div className="text-sm text-green-700">Covered Items</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {binderData.items.filter(item => item.uncovered).length}
                        </div>
                        <div className="text-sm text-red-700">Uncovered Items</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round((binderData.items.filter(item => !item.uncovered).length / binderData.items.length) * 100)}%
                        </div>
                        <div className="text-sm text-blue-700">Coverage</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {binderData.items.map((item, index) => {
                        const match = computeCoverageForArtifact(item.artifact, mappedDocs)
                        return (
                        <div key={index} className={`p-4 rounded-lg border ${
                          item.uncovered ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{item.artifact}</h4>
                              <p className="text-sm text-gray-600 mb-2">{item.requirement}</p>
                              {/* Why covered / suggested match based on real documents */}
                              {item.coveredBy && item.coveredBy.length > 0 ? (
                                <div className="text-xs text-green-700">Covered by: {item.coveredBy.join(', ')}</div>
                              ) : (
                                <div className="text-xs text-gray-600">Suggested match: {Math.round(match.confidence*100)}%{match.doc ? ` • ${match.doc.name}` : ''}</div>
                              )}
                            </div>
                            <div className="ml-2 flex flex-col items-end gap-2">
                              {match.doc && (
                                <Badge variant="outline" className="bg-white/70">{match.source === 'company' ? 'Company' : 'Opportunity'}</Badge>
                              )}
                              {item.uncovered ? (
                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Uncovered
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Covered
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>)
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No binder data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'qa':
        const filteredQuestions = qaData?.questions?.filter((item: any) => {
          // Status filter
          if (qaStatusFilter !== 'all' && item.status?.toLowerCase() !== qaStatusFilter) return false
          
          // Source filter
          if (qaFilter === 'llm-only' && item.evidence?.source !== 'llm') return false
          
          // Search filter
          if (qaSearchTerm && !item.question?.toLowerCase().includes(qaSearchTerm.toLowerCase())) return false
          
          return true
        }) || []

        const llmQuestions = qaData?.questions?.filter((item: any) => item.evidence?.source === 'llm') || []
        const answeredQuestions = qaData?.questions?.filter((item: any) => item.status === 'answered') || []

        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Q&A Analysis</CardTitle>
                    <CardDescription>AI-generated questions and answers for {(rfpData as any)?.title || 'this RFP'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => refreshQuestionsMutation.mutate(rfpId)}
                      disabled={refreshQuestionsMutation.isPending || isGeneratingQA}
                      variant="outline"
                      size="sm"
                    >
                      {refreshQuestionsMutation.isPending ? 'Generating...' : 'Generate/Refresh Q&A'}
                    </Button>
                    <Button 
                      onClick={() => syncSectionsMutation.mutate(rfpId)}
                      disabled={syncSectionsMutation.isPending || isGeneratingQA}
                      variant="outline"
                      size="sm"
                    >
                      {syncSectionsMutation.isPending ? 'Syncing...' : 'Sync Sections + Generate'}
                    </Button>
                    {isGeneratingQA && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Generating questions...
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Source:</label>
                    <select 
                      value={qaFilter} 
                      onChange={(e) => setQaFilter(e.target.value as any)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="all">All</option>
                      <option value="llm-only">LLM Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Status:</label>
                    <select 
                      value={qaStatusFilter} 
                      onChange={(e) => setQaStatusFilter(e.target.value as any)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="all">All</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="answered">Answered</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Search:</label>
                    <input 
                      type="text"
                      value={qaSearchTerm}
                      onChange={(e) => setQaSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="px-3 py-1 border rounded text-sm w-64"
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4 mt-4 text-sm text-gray-600">
                  <span>Total: {qaData?.questions?.length || 0}</span>
                  <span>LLM: {llmQuestions.length}</span>
                  <span>Answered: {answeredQuestions.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
              <CardContent className="pt-6">
                {qaLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Q&A data...</p>
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Showing {filteredQuestions.length} of {qaData?.questions?.length || 0} questions
                    </div>
                    <div className="space-y-3">
                      {filteredQuestions.map((item: any, index: number) => (
                        <div key={item.id || index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-xs font-semibold text-blue-600">Q</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={item.status === 'answered' ? 'default' : 'secondary'}>
                                  {item.status || 'Draft'}
                                </Badge>
                                {item.evidence?.source === 'llm' && (
                                  <Badge variant="outline" className="text-xs">LLM</Badge>
                                )}
                              </div>
                              
                              <div className="font-medium text-gray-900 mb-2">
                                {item.question || 'Question not available'}
                              </div>
                              
                              {item.answer && (
                                <div className="text-sm text-gray-600 bg-white p-3 rounded border-l-4 border-green-400 mb-2">
                                  <strong>Answer:</strong> {item.answer}
                                </div>
                              )}
                              
                              {item.evidence && (
                                <div className="text-xs text-gray-500">
                                  <strong>Evidence:</strong> {item.evidence.section || 'Unknown section'}
                                  {item.evidence.span_hint && (
                                    <span> • {item.evidence.span_hint}</span>
                                  )}
                                  {item.evidence.page_hint && (
                                    <span> • Page {item.evidence.page_hint}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isGeneratingQA ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Q&A Questions</h3>
                    <p className="text-gray-600 mb-4">AI is analyzing the RFP content and generating comprehensive questions...</p>
                    <div className="text-sm text-gray-500">
                      This may take up to 90 seconds. Questions will appear automatically.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Q&A Data</h3>
                    <p className="text-gray-600 mb-4">No questions and answers have been generated yet.</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={() => refreshQuestionsMutation.mutate(rfpId)}
                        disabled={refreshQuestionsMutation.isPending || isGeneratingQA}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Generate Q&A
                      </Button>
                      <Button 
                        onClick={() => syncSectionsMutation.mutate(rfpId)}
                        disabled={syncSectionsMutation.isPending || isGeneratingQA}
                        variant="outline"
                      >
                        Sync Sections + Generate
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'assumptions':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assumptions</CardTitle>
                <CardDescription>Key assumptions and requirements for {(rfpData as any)?.title || 'this RFP'}</CardDescription>
              </CardHeader>
              <CardContent>
                {assumptionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assumptions data...</p>
                  </div>
                ) : assumptionsData?.items && assumptionsData.items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Found {assumptionsData.items.length} assumptions
                    </div>
                    <div className="space-y-3">
                      {assumptionsData.items.map((item: any, index: number) => (
                        <div key={item.id || index} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Settings className="w-3 h-3 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{item.text || item.title || item.assumption || 'Assumption'}</h4>
                              <p className="text-sm text-gray-700 mb-2">{item.description || item.details || 'No description available'}</p>
                              {item.evidence && (
                                <div className="mt-2 text-xs text-blue-600">
                                  <div>Section: {item.evidence.section}</div>
                                  <div>Rationale: {item.evidence.rationale}</div>
                                  {item.evidence.mitigation && (
                                    <div>Mitigation: {item.evidence.mitigation}</div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                {item.category && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">Category: {item.category}</span>
                                )}
                                {item.createdAt && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assumptions data available</p>
                    <p className="text-sm text-gray-500 mt-2">Assumptions will be extracted from the RFP content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'team':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Team</CardTitle>
                <CardDescription>Team members assigned to {safeTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeTeam.map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      {member.clearance && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {member.clearance} Clearance
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subcontractors</CardTitle>
                <CardDescription>Partner organizations for {safeTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeSubcontractors.map((sub: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{sub.name}</p>
                        <p className="text-sm text-gray-600">{sub.role}</p>
                      </div>
                      <Badge className={
                        sub.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                        sub.status === 'negotiating' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-50 text-gray-700'
                      }>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'scenarios':
        return (
          <div className="space-y-6">
            {/* Scenario Modeling Header */}
            <div className="glass-card-subtle rounded-2xl p-6 border border-gray-200/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scenario Modeling & Simulation</h2>
                  <p className="text-gray-600">Advanced decision support with AI-powered scenario analysis • {safeTitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Spirit Analysis
                  </Button>
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                    <Download className="w-4 h-4" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {safeRfpData.id === '001' ? '87%' : safeRfpData.id === '002' ? '72%' : '85%'}
                  </div>
                  <div className="text-xs text-gray-600">Win Prob</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {safeClins.reduce((sum: number, clin: any) => sum + (clin.amount || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', '$').slice(0, -3) + (safeClins.reduce((sum: number, clin: any) => sum + (clin.amount || 0), 0) >= 1000000 ? 'M' : 'K')}
                  </div>
                  <div className="text-xs text-gray-600">Total Cost</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {safeRfpData.id === '001' ? '12.5%' : safeRfpData.id === '002' ? '8.3%' : '15.2%'}
                  </div>
                  <div className="text-xs text-gray-600">Margin</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {safeRfpData.id === '001' ? '15' : safeRfpData.id === '002' ? '22' : '8'}
                  </div>
                  <div className="text-xs text-gray-600">Risk</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {safeRfpData.id === '001' ? '85%' : safeRfpData.id === '002' ? '79%' : '92%'}
                  </div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {safeRfpData.id === '001' ? '92%' : safeRfpData.id === '002' ? '88%' : '94%'}
                  </div>
                  <div className="text-xs text-gray-600">Confidence</div>
                </div>
              </div>
            </div>

            {/* Scenario Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { id: 'overview', label: 'Scenario Overview' },
                { id: 'comparison', label: 'Scenario Comparison' },
                { id: 'variables', label: 'Variable Analysis' },
                { id: 'strategy', label: 'Strategy Options' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-white shadow-sm text-gray-900"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Current Scenario Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Scenario Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card border-gray-200/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Current Scenario: Baseline Strategy</CardTitle>
                        <CardDescription>Current planning assumptions with balanced approach</CardDescription>
                      </div>
                      <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white">
                        <option>Baseline Scenario</option>
                        <option>Aggressive Pricing</option>
                        <option>Premium Positioning</option>
                        <option>Risk Mitigation</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Key Variables */}
                      <div>
                        <h4 className="font-semibold mb-4">Key Variables</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Team Composition</span>
                            <span className="font-medium">
                              {safeRfpData.id === '001' ? 'Balanced' : safeRfpData.id === '002' ? 'Security-focused' : 'Trade-heavy'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pricing Strategy</span>
                            <span className="font-medium">
                              {safeRfpData.id === '001' ? 'Competitive' : safeRfpData.id === '002' ? 'Value-based' : 'Cost-plus'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Technical Approach</span>
                            <span className="font-medium">
                              {safeRfpData.id === '001' ? 'Cloud-native' : safeRfpData.id === '002' ? 'Hybrid' : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Subcontractor Mix</span>
                            <span className="font-medium">
                              {safeSubcontractors.length > 1 ? 'Multi-partner' : 'Single-prime'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Outcome Metrics */}
                      <div>
                        <h4 className="font-semibold mb-4">Outcome Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Win Probability</span>
                            <span className="font-bold text-blue-600">
                              {safeRfpData.id === '001' ? '87%' : safeRfpData.id === '002' ? '72%' : '85%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Profit Margin</span>
                            <span className="font-bold text-green-600">
                              {safeRfpData.id === '001' ? '12.5%' : safeRfpData.id === '002' ? '8.3%' : '15.2%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Risk Score</span>
                            <span className="font-bold text-orange-600">
                              {safeRfpData.id === '001' ? '15' : safeRfpData.id === '002' ? '22' : '8'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Delivery Confidence</span>
                            <span className="font-bold text-purple-600">
                              {safeRfpData.id === '001' ? '92%' : safeRfpData.id === '002' ? '88%' : '94%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scenario Impact Analysis */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold mb-4">Strategic Impact Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Primary Strength</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {safeRfpData.id === '001' ? 'Technical expertise with proven cloud migration experience' :
                             safeRfpData.id === '002' ? 'Security clearances and federal compliance track record' :
                             'Local presence with specialized HVAC equipment knowledge'}
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-orange-800">Key Risk</span>
                          </div>
                          <p className="text-sm text-orange-700">
                            {safeRfpData.id === '001' ? 'Price competition from larger systems integrators' :
                             safeRfpData.id === '002' ? 'Aggressive timeline requirements vs resource availability' :
                             'Material supply chain disruptions during peak season'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Strategic Scenarios */}
                <Card className="glass-card border-gray-200/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Strategic Scenario Modeling
                    </CardTitle>
                    <CardDescription>
                      Compare different strategic approaches for {safeTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Run Strategic Scenarios</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Compare aggressive vs conservative pricing, team compositions, and technical approaches
                      </p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                        Start Scenario Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card className="glass-card border-gray-200/40">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing Intelligence
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" />
                      Team Assembly
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Bid Analytics
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Target className="w-4 h-4" />
                      RFP Workspace
                    </Button>
                  </CardContent>
                </Card>

                {/* Spirit AI Insights */}
                <Card className="glass-card border-blue-200/40 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      Spirit Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-white/60 border border-blue-200/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 mb-1">
                            {safeRfpData.id === '001' ? 'Consider cloud-first positioning' :
                             safeRfpData.id === '002' ? 'Emphasize security credentials' :
                             'Highlight local supplier relationships'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {safeRfpData.id === '001' ? 'Your cloud expertise could increase win probability to 92%' :
                             safeRfpData.id === '002' ? 'Your security clearances provide competitive advantage' :
                             'Local supply chain reduces material risk by 40%'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 border border-green-200/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 mb-1">Optimize team composition</p>
                          <p className="text-xs text-gray-600">
                            {safeRfpData.id === '001' ? 'Add DevOps specialist for stronger technical score' :
                             safeRfpData.id === '002' ? 'Include certified project manager with USACE experience' :
                             'Consider adding EPA 608 certified technician'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'proposal-writer':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Writer</CardTitle>
                <CardDescription>AI-powered proposal generation and editing tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Proposal Writer</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Generate high-quality proposal components with AI assistance. Create executive summaries, 
                    technical approaches, management plans, and pricing strategies tailored to this RFP.
                  </p>
                  <Button
                    onClick={() => router.push(`/proposal-writer/${rfpId}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Open Proposal Writer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'kanban':
        return (
          <div className="space-y-6">
            {rfpId ? (
              <EnhancedKanbanBoard opportunityId={rfpId} />
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Kanban board...</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Content for {activeTab} tab coming soon...</p>
            </CardContent>
          </Card>
        )
    }
  }

  // Loading state
  if (!rfpId || rfpLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!rfpId ? 'Extracting URL parameters...' : 'Loading RFP data...'}
          </p>
          <button
            onClick={testApiCall}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test API Call
          </button>
        </div>
      </div>
    )
  }

  // Error state
  if (rfpError) {
    const isBackendError = rfpError.message.includes('Backend not available')
    const isNotFoundError = rfpError.message.includes('not found') || rfpError.message.includes('404')
    
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isBackendError ? 'Backend Not Available' : 
             isNotFoundError ? 'RFP Not Found' : 'Failed to load RFP'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isBackendError 
              ? 'Please start your backend server on http://localhost:3001 to view RFP data.'
              : isNotFoundError
              ? `The RFP with ID "${rfpId}" was not found. This might be an opportunity ID that needs to be mapped to an RFP ID.`
              : rfpError.message
            }
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            {isBackendError && (
              <p className="text-sm text-gray-500">
                The frontend is working correctly - just need the backend running!
              </p>
            )}
            {isNotFoundError && (
              <p className="text-sm text-gray-500">
                ID: {rfpId} | Check if this is an opportunity ID vs RFP ID
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!rfpData) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RFP not found</h2>
          <p className="text-gray-600 mb-4">The requested RFP could not be found.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Safe data access helpers - use any type to avoid TypeScript errors
  const safeRfpData = (rfpData as any) || {}
  const safeTitle = safeRfpData.title || 'Untitled RFP'
  const safeAgency = safeRfpData.agency || 'TBD'
  const safeEvaluationFactors = safeRfpData.evaluationFactors || []
  const safeClins = safeRfpData.clins || []
  const safeTeam = safeRfpData.team || []
  const safeSubcontractors = safeRfpData.subcontractors || []
  
  // Additional safe accessors for properties that might not exist
  const safeEvaluationCriteria = safeRfpData.evaluationCriteria || { technical: 40, price: 30, pastPerformance: 30, awardType: 'Best Value' }
  const safeScope = safeRfpData.scope || { pwsDescription: '', deliverables: [], technicalRequirements: [] }
  const safeDocuments = safeRfpData.documents || { originalRFP: '', attachments: [] }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{safeTitle}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    in progress
                  </Badge>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {readinessScore}% ready
                  </Badge>
                  <span className="text-sm text-gray-600">{(rfpData as any)?.agency || 'TBD'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => syncKanbanMutation.mutate(rfpId)}
                disabled={syncKanbanMutation.isPending}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncKanbanMutation.isPending ? 'animate-spin' : ''}`} />
                Sync Board
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Spirit
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Proposal
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200/60 bg-green-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 mb-1">Evaluation Factors</p>
                  <p className="text-2xl font-bold text-green-700">{safeEvaluationFactors.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/60 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-1">CLINs</p>
                  <p className="text-2xl font-bold text-blue-700">{safeClins.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200/60 bg-purple-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Team + Subs</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {safeTeam.length + safeSubcontractors.length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200/60 bg-emerald-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 mb-1">Est. Value</p>
                  <p className="text-2xl font-bold text-emerald-700">{(rfpData as any)?.estimatedValue || 'TBD'}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="flex space-x-8 px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" aria-label="Tabs" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload Drawer */}
      <SideDrawer
        open={docDrawerOpen}
        onClose={()=>{ setDocDrawerOpen(false); setSelectedRequirement(null) }}
        title={selectedRequirement ? `Upload: ${selectedRequirement.artifact}` : 'Upload Document'}
        widthClassName="max-w-2xl"
        footer={[
          <Button key="close" variant="outline" onClick={()=>{ setDocDrawerOpen(false); }}>Close</Button>
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Attach files to satisfy this requirement. You can add tags and a brief note.</p>
          <FileUploadZone
            onFilesSelected={()=>{}}
            onUpload={async ()=>{ setDocDrawerOpen(false); }}
            maxFiles={5}
            maxSize={50}
          />
        </div>
      </SideDrawer>

      {/* Spirit Suggestion Modal */}
      <SpiritSuggestion suggestion={suggestion} onClose={closeSuggestion} />
    </div>
  )
}
