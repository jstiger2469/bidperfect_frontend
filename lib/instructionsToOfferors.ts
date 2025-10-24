// Instructions to Offerors Data and Logic
export interface SubmissionRequirement {
  id: string;
  requirement: string;
  description: string;
  required: boolean;
  status: 'uploaded' | 'missing' | 'incomplete' | 'needs-attention';
  source?: string;
  fileUrl?: string;
  lastUpdated?: string;
  notes?: string;
}

export interface SpiritCheckRule {
  id: string;
  rule: string;
  intent: string;
  result: 'pass' | 'warning' | 'fail';
  details: string;
  suggestion?: string;
}

export interface ComplianceGap {
  type: 'missing' | 'incorrect' | 'incomplete';
  item: string;
  severity: 'critical' | 'warning' | 'minor';
  description: string;
  action: string;
}

export interface InstructionsToOfferorsData {
  rfpId: string;
  submissionRequirements: SubmissionRequirement[];
  spiritCheckRules: SpiritCheckRule[];
  missingItems: ComplianceGap[];
  adminNotes: string[];
  overallComplianceScore: number;
  submissionDeadline: string;
  portalInfo: {
    url: string;
    deadline: string;
    autoUploadEnabled: boolean;
  };
}

// Mock data for HVAC RFP
export const getInstructionsToOfferorsData = (rfpId: string): InstructionsToOfferorsData => {
  return {
    rfpId,
    submissionRequirements: [
      {
        id: 'tech-proposal',
        requirement: 'Technical Proposal',
        description: 'Description of how work will be performed',
        required: true,
        status: 'uploaded',
        source: 'Section L.1',
        fileUrl: '/docs/technical-proposal.pdf',
        lastUpdated: '2024-07-15T10:30:00Z',
        notes: 'Meets page limit requirements'
      },
      {
        id: 'past-performance',
        requirement: 'Past Performance',
        description: 'Details of similar projects',
        required: true,
        status: 'missing',
        source: 'Section L.2',
        notes: 'Need 3 references from last 3 years'
      },
      {
        id: 'pricing-sheet',
        requirement: 'Pricing Sheet',
        description: 'Completed cost table',
        required: true,
        status: 'uploaded',
        source: 'Section L.3',
        fileUrl: '/docs/pricing-sheet.xlsx',
        lastUpdated: '2024-07-14T16:45:00Z'
      },
      {
        id: 'compliance-certs',
        requirement: 'Compliance Certifications',
        description: 'SBA, EEO, OSHA, etc.',
        required: true,
        status: 'incomplete',
        source: 'Section L.4',
        notes: 'Missing OSHA 30-hour certification'
      },
      {
        id: 'cover-letter',
        requirement: 'Cover Letter',
        description: 'Signed, official letter of intent',
        required: false,
        status: 'needs-attention',
        source: 'Section L.5',
        fileUrl: '/docs/cover-letter.pdf',
        lastUpdated: '2024-07-12T09:15:00Z',
        notes: 'Font formatting needs correction'
      },
      {
        id: 'insurance-docs',
        requirement: 'Insurance Documentation',
        description: 'General liability and workers comp certificates',
        required: true,
        status: 'uploaded',
        source: 'Section L.6',
        fileUrl: '/docs/insurance-certs.pdf',
        lastUpdated: '2024-07-10T14:20:00Z'
      }
    ],
    spiritCheckRules: [
      {
        id: 'page-limits',
        rule: 'Follow exact page limits',
        intent: 'Proposal must not exceed 20 pages total',
        result: 'pass',
        details: 'Technical proposal: 18 pages (within 20-page limit)',
        suggestion: '2 pages remaining for additional content'
      },
      {
        id: 'formatting',
        rule: 'Use specified formatting',
        intent: 'Times New Roman, 12pt, 1" margins',
        result: 'warning',
        details: 'Cover letter uses Arial font instead of Times New Roman',
        suggestion: 'Convert cover letter to Times New Roman 12pt'
      },
      {
        id: 'section-organization',
        rule: 'Organize in specified sections',
        intent: 'Technical, Cost, Past Performance',
        result: 'pass',
        details: 'All sections properly organized and labeled',
        suggestion: 'Consider adding executive summary'
      },
      {
        id: 'portal-submission',
        rule: 'Submit via portal by due date',
        intent: '5:00 PM on 8/1/2025',
        result: 'pass',
        details: 'Auto-upload scheduled for 4:30 PM on submission date',
        suggestion: 'Upload enabled and tested'
      }
    ],
    missingItems: [
      {
        type: 'missing',
        item: 'Past Performance narrative',
        severity: 'critical',
        description: 'Required past performance references not submitted',
        action: 'Upload Missing File'
      },
      {
        type: 'incorrect',
        item: 'Font style in executive summary',
        severity: 'warning',
        description: 'Arial font detected instead of required Times New Roman',
        action: 'Fix Formatting'
      },
      {
        type: 'incomplete',
        item: 'OSHA certification attachment',
        severity: 'warning',
        description: 'General certifications uploaded but missing OSHA 30-hour specific cert',
        action: 'Upload Missing File'
      }
    ],
    adminNotes: [
      '"SOW reference on page 6 is "vague"—suggest stronger language on technical capacity:"',
      '"Revise pricing table to match required layout (see page 11 of RFP):"'
    ],
    overallComplianceScore: 78,
    submissionDeadline: '2024-08-01T17:00:00Z',
    portalInfo: {
      url: 'https://portal.gsa.gov/rfp-2024-003',
      deadline: '5:00 PM on 8/1/2025',
      autoUploadEnabled: true
    }
  };
};

// Helper functions for status management
export const updateRequirementStatus = (
  data: InstructionsToOfferorsData,
  requirementId: string,
  newStatus: SubmissionRequirement['status']
): InstructionsToOfferorsData => {
  return {
    ...data,
    submissionRequirements: data.submissionRequirements.map(req =>
      req.id === requirementId ? { ...req, status: newStatus, lastUpdated: new Date().toISOString() } : req
    )
  };
};

export const calculateComplianceScore = (data: InstructionsToOfferorsData): number => {
  const totalRequired = data.submissionRequirements.filter(req => req.required).length;
  const completed = data.submissionRequirements.filter(req => req.required && req.status === 'uploaded').length;
  const spiritPassed = data.spiritCheckRules.filter(rule => rule.result === 'pass').length;
  const totalSpirit = data.spiritCheckRules.length;
  
  const requirementScore = (completed / totalRequired) * 0.7; // 70% weight
  const spiritScore = (spiritPassed / totalSpirit) * 0.3; // 30% weight
  
  return Math.round((requirementScore + spiritScore) * 100);
};

export const getStatusIcon = (status: SubmissionRequirement['status']) => {
  switch (status) {
    case 'uploaded': return '✅';
    case 'missing': return '❌';
    case 'incomplete': return '⚠️';
    case 'needs-attention': return '⚠️';
    default: return '⚪';
  }
};

export const getStatusColor = (status: SubmissionRequirement['status']) => {
  switch (status) {
    case 'uploaded': return 'text-green-600 bg-green-100';
    case 'missing': return 'text-red-600 bg-red-100';
    case 'incomplete': return 'text-yellow-600 bg-yellow-100';
    case 'needs-attention': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getSpiritResultColor = (result: SpiritCheckRule['result']) => {
  switch (result) {
    case 'pass': return 'text-green-600 bg-green-100';
    case 'warning': return 'text-yellow-600 bg-yellow-100';
    case 'fail': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}; 