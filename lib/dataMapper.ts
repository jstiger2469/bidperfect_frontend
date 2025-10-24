// Data Mapper - Transforms backend API responses to frontend interfaces
// This ensures compatibility between backend data and frontend components

import { 
  ApiOpportunity, 
  ApiRFP, 
  ApiComplianceResponse,
  ApiReadinessResponse,
  ApiPartnerCandidate,
  ApiTipsResponse
} from './api';
import { 
  RFP as FrontendRFP, 
  Subcontractor, 
  TeamMember, 
  ComplianceRequirement,
  PricingLineItem 
} from './data';

// Map backend Opportunity to frontend RFP
export function mapOpportunityToRFP(opportunity: ApiOpportunity, rfp?: ApiRFP): FrontendRFP {
  return {
    id: opportunity.rfpId || opportunity.id,
    title: opportunity.title,
    agency: opportunity.agency || '',
    rfpNumber: opportunity.id,
    dueDate: opportunity.dueAt,
    estimatedValue: 'TBD', // Not available in backend
    readiness: 0, // Will be fetched separately
    status: 'in-progress',
    type: 'fixed-price', // Default, could be enhanced
    description: rfp?.title || opportunity.title,
    location: 'TBD', // Not available in backend
    performancePeriod: 'TBD', // Not available in backend
    assignedTeamMembers: [],
    selectedSubcontractors: [],
    pendingSubcontractors: [],
    complianceRequirements: [],
    pricingLineItems: [],
    parsedSections: rfp?.parsedSections || [], // Include parsed sections from backend
    documents: {
      originalRFP: '',
      attachments: []
    },
    scope: {
      pwsDescription: '',
      deliverables: [],
      technicalRequirements: []
    },
    evaluationCriteria: {
      technical: 40,
      price: 30,
      pastPerformance: 30,
      awardType: 'Best Value'
    }
  };
}

// Map backend PartnerCandidate to frontend Subcontractor
export function mapPartnerToSubcontractor(partner: ApiPartnerCandidate): Subcontractor {
  return {
    id: partner.companyId,
    name: partner.name,
    contactName: 'TBD', // Not available in backend
    email: 'TBD', // Not available in backend
    phone: 'TBD', // Not available in backend
    type: 'Contractor', // Default
    specialty: partner.naics || [],
    rating: Math.min(5, Math.max(1, partner.score / 20)), // Convert score to 1-5 rating
    status: 'available',
    readiness: Math.round(partner.score), // Use score as readiness
    capacity: '+0%', // Default
    licenses: [],
    certifications: partner.certs || [],
    insuranceStatus: 'pending',
    wageDeterminationCompliant: false,
    pastPerformanceScore: 0,
    image: '/api/placeholder/60/60',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    businessInfo: {
      ein: '',
      uei: '',
      naics: partner.naics || [],
      cageCode: ''
    }
  };
}

// Map backend ComplianceResponse to frontend ComplianceRequirement
export function mapComplianceToRequirement(
  compliance: ApiComplianceResponse,
  rfpId: string
): ComplianceRequirement[] {
  return compliance.tieOut.map((row, index) => ({
    id: `comp-${rfpId}-${index}`,
    rfpId: rfpId,
    requirementType: 'prime',
    farClause: row.families[0] || 'TBD',
    title: row.requirement,
    description: row.summary?.description || row.requirement,
    status: row.where_addressed.length > 0 ? 'complete' : 'pending',
    response: row.where_addressed.length > 0 ? 'Addressed in proposal' : undefined,
    attachments: row.required_artifacts || [],
    dueDate: new Date().toISOString(),
    assignedTo: undefined
  }));
}

// Map backend ReadinessResponse to frontend readiness score
export function mapReadinessToScore(readiness: ApiReadinessResponse): number {
  return Math.round(readiness.score || 0);
}

// Map backend TipsResponse (QA data) to frontend tips
export function mapTipsToFrontend(tips: ApiTipsResponse): {
  summary: string;
  mustDo: string[];
  constraints: string[];
  requiredArtifacts: string[];
  risks: string[];
  links: { label: string; href: string }[];
} {
  // Since TipsResponse now contains questions, we'll create a summary from the questions
  const questions = tips.questions || [];
  const summary = questions.length > 0 
    ? `Found ${questions.length} questions and answers from the RFP analysis.`
    : 'No questions found in the RFP analysis.';
  
  return {
    summary,
    mustDo: [], // Could extract from questions if needed
    constraints: [], // Could extract from questions if needed
    requiredArtifacts: [], // Could extract from questions if needed
    risks: [], // Could extract from questions if needed
    links: []
  };
}

// Helper function to create mock team members (since backend doesn't have this yet)
export function createMockTeamMembers(): TeamMember[] {
  return [
    {
      id: "tm-001",
      name: "Colleen",
      role: "Project Manager",
      position: "Principal PM",
      email: "colleen@company.com",
      phone: "(504) 555-0123",
      status: "assigned",
      badges: ["SECRET Clearance", "PMP"],
      clearanceLevel: "SECRET",
      certifications: ["PMP", "PRINCE2"],
      hourlyRate: 85,
      availability: 90,
      image: "/api/placeholder/60/60"
    },
    {
      id: "tm-002",
      name: "Ethan",
      role: "Cost Analyst",
      position: "Senior Estimator",
      email: "ethan@company.com", 
      phone: "(504) 555-0124",
      status: "assigned",
      badges: ["CCP"],
      certifications: ["CCP", "CVS"],
      hourlyRate: 75,
      availability: 85,
      image: "/api/placeholder/60/60"
    }
  ];
}

// Helper function to create mock pricing line items (since backend doesn't have this yet)
export function createMockPricingLineItems(rfpId: string): PricingLineItem[] {
  return [
    {
      id: "price-001",
      clin: "0001",
      description: "Project Management and Administration",
      quantity: 160,
      unitPrice: 80,
      totalPrice: 12800,
      laborHours: 160,
      category: "labor"
    },
    {
      id: "price-002", 
      clin: "0002",
      description: "Technical Writing Services",
      quantity: 80,
      unitPrice: 65,
      totalPrice: 5200,
      laborHours: 80,
      category: "labor"
    }
  ];
}

// Error handling utilities
export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Loading state utilities
export function createLoadingState<T>(data: T | null = null): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  return {
    data,
    loading: false,
    error: null
  };
}

export function setLoadingState<T>(state: { data: T | null; loading: boolean; error: string | null }): typeof state {
  return {
    ...state,
    loading: true,
    error: null
  };
}

export function setErrorState<T>(state: { data: T | null; loading: boolean; error: string | null }, error: string): typeof state {
  return {
    ...state,
    loading: false,
    error
  };
}

export function setSuccessState<T>(state: { data: T | null; loading: boolean; error: string | null }, data: T): typeof state {
  return {
    data,
    loading: false,
    error: null
  };
}
