import { z } from 'zod'

// =====================
// Onboarding State & Steps
// =====================

export type OnboardingStep = 
  | 'ACCOUNT_VERIFIED'
  | 'ORG_CHOICE'
  | 'COMPANY_PROFILE'
  | 'COMPLIANCE_INTAKE'
  | 'INTEGRATIONS'
  | 'TEAM'
  | 'FIRST_RFP'
  | 'DONE'

export interface OnboardingStepConfig {
  id: OnboardingStep
  label: string
  description: string
  blocking: boolean
  icon: string
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'ACCOUNT_VERIFIED',
    label: 'Verify Account',
    description: 'Secure your account with email verification and MFA',
    blocking: true,
    icon: 'shield-check',
  },
  {
    id: 'ORG_CHOICE',
    label: 'Organization',
    description: 'Create or join your organization',
    blocking: true,
    icon: 'building',
  },
  {
    id: 'COMPANY_PROFILE',
    label: 'Company Profile',
    description: 'Basic company information and registrations',
    blocking: true,
    icon: 'briefcase',
  },
  {
    id: 'COMPLIANCE_INTAKE',
    label: 'Compliance Documents',
    description: 'Upload required compliance and insurance documents',
    blocking: true,
    icon: 'file-check',
  },
  {
    id: 'INTEGRATIONS',
    label: 'Integrations',
    description: 'Connect your tools and services',
    blocking: false,
    icon: 'plug',
  },
  {
    id: 'TEAM',
    label: 'Team Members',
    description: 'Invite your team and assign roles',
    blocking: false,
    icon: 'users',
  },
  {
    id: 'FIRST_RFP',
    label: 'First RFP',
    description: 'Upload your first RFP or try a sample',
    blocking: false,
    icon: 'file-text',
  },
  {
    id: 'DONE',
    label: 'Complete',
    description: "You're all set!",
    blocking: false,
    icon: 'check-circle',
  },
]

export interface OnboardingState {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  requiredSteps: OnboardingStep[]
  progress: number // 0-100
  org?: {
    id: string
    name: string
    role: string
  }
  company?: {
    id: string
    legalName: string
  }
  invite?: {
    token: string
    orgName: string
    role: string
    email: string
  }
}

// =====================
// Step Payload Schemas
// =====================

export const AccountVerifiedSchema = z.object({
  emailVerified: z.boolean(),
  mfaEnabled: z.boolean().optional(),
})

export const OrgChoiceSchema = z.object({
  mode: z.enum(['create', 'join']),
  orgName: z.string().min(2, 'Organization name is required').optional(),
  verifiedDomains: z.array(z.string().email().or(z.string().includes('.'))).optional(),
  inviteToken: z.string().optional(),
})

export const CompanyProfileSchema = z.object({
  legalName: z.string().min(2, 'Legal name is required'),
  doingBusinessAs: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(5, 'ZIP code is required'),
  }),
  naicsCodes: z.array(z.string()).optional().default([]),
  uei: z.string().optional(),
  cage: z.string().optional(),
  ein: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

// =====================
// Document Metadata Schemas
// =====================

// Insurance metadata
const InsuranceMetadataSchema = z.object({
  policyNumber: z.string().min(1, 'Policy number is required'),
  carrier: z.string().min(1, 'Insurance carrier is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'), // ISO date string
  expirationDate: z.string().min(1, 'Expiration date is required'), // ISO date string
  occurrenceCoverage: z.number().positive('Occurrence coverage must be positive').optional(),
  aggregateCoverage: z.number().positive('Aggregate coverage must be positive').optional(),
  namedInsured: z.string().optional(),
})

// Certificate metadata
const CertificateMetadataSchema = z.object({
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  issuingAuthority: z.string().min(1, 'Issuing authority is required'),
  issueDate: z.string().min(1, 'Issue date is required'), // ISO date string
  expirationDate: z.string().optional(), // Some certs don't expire
  scope: z.string().optional(), // e.g., "Manufacturing" for ISO
  level: z.string().optional(), // e.g., "Moderate" for FedRAMP
})

// Tax document metadata (W-9, EIN Letter)
const TaxDocumentMetadataSchema = z.object({
  documentDate: z.string().min(1, 'Document date is required'), // ISO date string
  ein: z.string().regex(/^\d{2}-?\d{7}$/, 'EIN must be in format XX-XXXXXXX or XXXXXXXXX'),
  legalName: z.string().min(1, 'Legal name is required'),
})

// Generic document metadata (for license, other)
const GenericDocumentMetadataSchema = z.object({
  documentNumber: z.string().optional(),
  issueDate: z.string().optional(), // ISO date string
  expirationDate: z.string().optional(), // ISO date string
  issuingOrganization: z.string().optional(),
  notes: z.string().optional(),
})

// Bonding capacity metadata (Miller Act / Little Miller Acts compliance)
const BondingMetadataSchema = z.object({
  // Surety Company Information
  suretyName: z.string().min(1, 'Surety company name is required'),
  suretyNAIC: z.string().regex(/^\d{5}$/, 'NAIC must be 5 digits').optional(),
  suretyTreasuryListed: z.boolean().default(false),
  suretyAMBestRating: z.enum([
    'A_PLUS_PLUS', 'A_PLUS', 'A', 'A_MINUS',
    'B_PLUS_PLUS', 'B_PLUS', 'B', 'B_MINUS',
    'C_PLUS_PLUS', 'C_PLUS', 'C', 'C_MINUS',
    'D', 'E', 'F', 'S', 'NOT_RATED'
  ]).optional(),
  suretyAddress: z.string().optional(),
  suretyPhone: z.string().optional(),
  
  // Bonding Capacity Amounts
  singleProjectLimit: z.number().positive('Single project limit must be positive'),
  aggregateLimit: z.number().positive('Aggregate limit must be positive'),
  currentlyBonded: z.number().nonnegative('Currently bonded cannot be negative').optional(),
  
  // Bond Types Covered
  bondTypesIncluded: z.array(z.enum(['BID', 'PERFORMANCE', 'PAYMENT', 'MAINTENANCE', 'WARRANTY', 'SUPPLY', 'SUBDIVISION'])).default(['BID', 'PERFORMANCE', 'PAYMENT']),
  
  // Letter Details
  letterNumber: z.string().optional(),
  issueDate: z.string().optional(), // ISO date string
  expirationDate: z.string().min(1, 'Expiration date is required'), // ISO date string - CRITICAL
  
  // Bonding Agent Information
  agentName: z.string().optional(),
  agencyName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  agentLicenseNumber: z.string().optional(),
  powerOfAttorneyNumber: z.string().optional(),
  
  // Terms & Conditions
  subjectToUnderwriting: z.boolean().default(true),
  exclusions: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.aggregateLimit >= data.singleProjectLimit, {
  message: 'Aggregate limit must be greater than or equal to single project limit',
  path: ['aggregateLimit'],
})

// Discriminated union for document types
const DocumentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('insurance'),
    fileId: z.string(),
    name: z.string(),
    subType: z.enum(['general_liability', 'workers_comp', 'professional_liability', 'other']),
    metadata: InsuranceMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('certificate'),
    fileId: z.string(),
    name: z.string(),
    subType: z.enum(['EIGHT_A', 'HUBZONE', 'WOSB', 'VOSB', 'ISO_9001', 'ISO_27001', 'CMMC', 'FEDRAMP', 'other']),
    metadata: CertificateMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('w9'),
    fileId: z.string(),
    name: z.string(),
    metadata: TaxDocumentMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('ein_letter'),
    fileId: z.string(),
    name: z.string(),
    metadata: TaxDocumentMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('license'),
    fileId: z.string(),
    name: z.string(),
    metadata: GenericDocumentMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('other'),
    fileId: z.string(),
    name: z.string(),
    metadata: GenericDocumentMetadataSchema,
    verified: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('bonding'),
    fileId: z.string(),
    name: z.string(),
    metadata: BondingMetadataSchema,
    verified: z.boolean().default(false),
  }),
])

export const ComplianceIntakeSchema = z.object({
  documents: z.array(DocumentSchema),
})

// Export metadata types for use in components
export type InsuranceMetadata = z.infer<typeof InsuranceMetadataSchema>
export type CertificateMetadata = z.infer<typeof CertificateMetadataSchema>
export type TaxDocumentMetadata = z.infer<typeof TaxDocumentMetadataSchema>
export type GenericDocumentMetadata = z.infer<typeof GenericDocumentMetadataSchema>
export type BondingMetadata = z.infer<typeof BondingMetadataSchema>
export type ComplianceDocument = z.infer<typeof DocumentSchema>

export const IntegrationsSchema = z.object({
  drive: z.object({
    enabled: z.boolean(),
    provider: z.enum(['google', 'microsoft', 'none']).optional(),
  }).optional(),
  email: z.object({
    enabled: z.boolean(),
    provider: z.enum(['gmail', 'microsoft365', 'none']).optional(),
  }).optional(),
  eSign: z.object({
    enabled: z.boolean(),
    provider: z.enum(['docusign', 'adobe', 'none']).optional(),
  }).optional(),
  accounting: z.object({
    enabled: z.boolean(),
    provider: z.enum(['quickbooks', 'none']).optional(),
  }).optional(),
})

export const TeamSchema = z.object({
  invites: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'member', 'viewer']),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })),
})

export const FirstRfpSchema = z.object({
  mode: z.enum(['upload', 'sample', 'skip']),
  fileId: z.string().optional(),
  sampleId: z.string().optional(),
})

// Union type for all payloads
export type StepPayload =
  | z.infer<typeof AccountVerifiedSchema>
  | z.infer<typeof OrgChoiceSchema>
  | z.infer<typeof CompanyProfileSchema>
  | z.infer<typeof ComplianceIntakeSchema>
  | z.infer<typeof IntegrationsSchema>
  | z.infer<typeof TeamSchema>
  | z.infer<typeof FirstRfpSchema>

// =====================
// API Types
// =====================

export interface OnboardingStateResponse {
  state: OnboardingState
  user: {
    id: string
    email: string
    emailVerified: boolean
    mfaEnabled?: boolean
  }
}

export interface CompleteStepRequest {
  step: OnboardingStep
  payload: StepPayload
}

export interface CompleteStepResponse {
  ok: boolean
  nextStep?: OnboardingStep
  state: OnboardingState
  errors?: Record<string, string>
}

