'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FileCheck, Upload, FileText, CheckCircle, X, AlertCircle, ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ComplianceIntakeSchema, type ComplianceDocument } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import SimpleFileUpload from '@/components/SimpleFileUpload'
import {
  InsuranceMetadataForm,
  CertificateMetadataForm,
  TaxDocumentMetadataForm,
  GenericDocumentMetadataForm,
  BondingMetadataForm,
} from '../DocumentMetadataForm'
import type { z } from 'zod'

type FormData = z.infer<typeof ComplianceIntakeSchema>

interface ComplianceIntakeStepProps {
  onContinue: () => void
  savedData?: FormData
}

// Document type with optional temporary ID and collapsed state
type DocumentWithTempId = ComplianceDocument & { 
  tempId?: string
  isCollapsed?: boolean  // UI-only state (doesn't persist)
}

const DOC_TYPES = [
  { 
    value: 'w9' as const, 
    label: 'W-9 Form', 
    required: true,
    uploadLabel: 'Drop your W-9 Form here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'IRS Form W-9 for tax reporting',
  },
  { 
    value: 'insurance' as const, 
    label: 'Insurance Policies', 
    required: true,
    uploadLabel: 'Drop your Insurance Policies here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'General liability and other coverage',
  },
  { 
    value: 'bonding' as const, 
    label: 'Bonding Capacity Letter', 
    required: true,
    uploadLabel: 'Drop your Bonding Capacity Letter here (PDF)',
    uploadDescription: 'PDF format only - Required for federal contracts > $150K (Miller Act)',
    helpText: 'Current bonding letter from your surety company showing single project and aggregate limits',
  },
  { 
    value: 'ein_letter' as const, 
    label: 'EIN Confirmation Letter', 
    required: false,
    uploadLabel: 'Drop your EIN Confirmation Letter here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'IRS confirmation letter for your EIN',
  },
  { 
    value: 'certificate' as const, 
    label: 'Business Certificates', 
    required: false,
    uploadLabel: 'Drop your Business Certificates here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'DBE, MBE, WBE, or other certifications',
  },
  { 
    value: 'license' as const, 
    label: 'Professional Licenses', 
    required: false,
    uploadLabel: 'Drop your Professional Licenses here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'Professional or trade licenses',
  },
  { 
    value: 'other' as const, 
    label: 'Other Documents', 
    required: false,
    uploadLabel: 'Drop additional documents here',
    uploadDescription: 'PDF, JPG, or PNG format (multiple files allowed)',
    helpText: 'Additional compliance documents',
  },
]

export function ComplianceIntakeStep({ onContinue, savedData }: ComplianceIntakeStepProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const store = useOnboardingStore()
  
  // Load from Zustand cache first (for refresh/navigation back), then savedData (from backend)
  const cachedData = store.stepData?.['COMPLIANCE_INTAKE']
  console.log('[ComplianceIntakeStep] Loading data sources:', {
    cachedData,
    savedData,
    usingCache: !!cachedData,
  })
  
  const initialDocs = cachedData?.documents || savedData?.documents || []
  
  // State: uploaded documents with metadata
  const [uploadedDocs, setUploadedDocs] = React.useState<DocumentWithTempId[]>(initialDocs)
  
  // State: validation errors per document
  const [validationErrors, setValidationErrors] = React.useState<Record<string, any>>({})

  // Track if we've already navigated to prevent re-triggering
  const hasNavigatedRef = React.useRef(false)
  
  // Track initial mount and last saved data for Zustand persistence
  const hasInitializedRef = React.useRef(false)
  const lastSavedDataRef = React.useRef<any>(null)
  const saveToZustandTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const { saveImmediate, isSaving } = useStepSaver({
    step: 'COMPLIANCE_INTAKE',
    onSuccess: (response) => {
      console.log('[ComplianceIntakeStep] Step saved successfully:', response)
      
      // Prevent duplicate navigation
      if (hasNavigatedRef.current) {
        console.log('[ComplianceIntakeStep] Already navigated, skipping')
        return
      }
      
      if (response.nextStep) {
        console.log('[ComplianceIntakeStep] Moving to next step:', response.nextStep)
        hasNavigatedRef.current = true
        
        // Update query cache immediately to prevent race conditions
        queryClient.setQueryData(['onboarding', 'state'], (old: any) => {
          if (!old) return old
          console.log('[ComplianceIntakeStep] Updating query cache with new state:', response.state)
          return {
            ...old,
            state: response.state
          }
        })
        
        // Navigate to next step via router
        const nextUrl = `/onboarding?step=${response.nextStep}`
        console.log('[ComplianceIntakeStep] Navigating to:', nextUrl)
        router.push(nextUrl)
      } else {
        console.log('[ComplianceIntakeStep] Onboarding complete, calling onContinue')
        onContinue()
      }
    },
  })

  // Auto-save to Zustand for persistence (debounced 2s to avoid excessive updates)
  React.useEffect(() => {
    // Skip on initial mount to prevent loop
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      lastSavedDataRef.current = uploadedDocs
      return
    }
    
    // Skip if data hasn't actually changed (deep equality check)
    if (JSON.stringify(uploadedDocs) === JSON.stringify(lastSavedDataRef.current)) {
      console.log('[ComplianceIntakeStep] Data unchanged, skipping Zustand save')
      return
    }
    
    // Clear existing timeout
    if (saveToZustandTimeoutRef.current) {
      clearTimeout(saveToZustandTimeoutRef.current)
    }
    
    // Debounce Zustand update (2s - longer than Company Profile since metadata is more complex)
    saveToZustandTimeoutRef.current = setTimeout(() => {
      // Only save if we have docs
    if (uploadedDocs.length > 0) {
        console.log('[ComplianceIntakeStep] Saving to Zustand cache:', uploadedDocs)
        
        // Strip UI-only properties before saving
        const docsToSave = uploadedDocs.map(({ isCollapsed, ...doc }) => doc)
        
        store.setState({
          stepData: {
            ...store.stepData,
            'COMPLIANCE_INTAKE': { documents: docsToSave },
          },
        })
        lastSavedDataRef.current = uploadedDocs
        console.log('[ComplianceIntakeStep] Zustand cache updated successfully')
      }
    }, 2000) // 2 second debounce
    
    return () => {
      if (saveToZustandTimeoutRef.current) {
        clearTimeout(saveToZustandTimeoutRef.current)
      }
    }
  }, [uploadedDocs, store])

  // Check if document metadata is complete
  const isDocumentComplete = (doc: DocumentWithTempId): boolean => {
    if (!doc.metadata) return false
    
    // Check based on document type
    switch (doc.type) {
      case 'insurance':
        return !!(
          doc.metadata.policyNumber &&
          doc.metadata.carrier &&
          doc.metadata.effectiveDate &&
          doc.metadata.expirationDate
        )
      case 'certificate':
        return !!(
          doc.metadata.certificateNumber &&
          doc.metadata.issuingAuthority &&
          doc.metadata.issueDate
        )
      case 'w9':
      case 'ein_letter':
        return !!(
          doc.metadata.ein &&
          doc.metadata.legalName
        )
      case 'bonding':
        return !!(
          doc.metadata.suretyName &&
          doc.metadata.singleProjectLimit &&
          doc.metadata.aggregateLimit &&
          doc.metadata.expirationDate
        )
      case 'license':
      case 'other':
        // These have optional metadata
        return true
      default:
        return false
    }
  }

  // Detailed validation with user-friendly error messages
  const validateDocuments = () => {
    const errors: string[] = []
    
    // Check for required document types
    const hasW9 = uploadedDocs.some(d => d.type === 'w9')
    const hasInsurance = uploadedDocs.some(d => d.type === 'insurance')
    const hasBonding = uploadedDocs.some(d => d.type === 'bonding')
    
    if (!hasW9) {
      errors.push('📄 W-9 Form is required')
    }
    if (!hasInsurance) {
      errors.push('🛡️ Insurance Policies are required')
    }
    if (!hasBonding) {
      errors.push('📜 Bonding Capacity Letter is required')
    }
    
    // Check each document for complete metadata
    uploadedDocs.forEach(doc => {
      const docName = doc.name || 'Unnamed document'
      const isComplete = isDocumentComplete(doc)
      
      if (!isComplete) {
        const missingFields: string[] = []
        
        switch (doc.type) {
          case 'insurance':
            if (!doc.metadata?.policyNumber?.trim()) missingFields.push('Policy Number')
            if (!doc.metadata?.carrier?.trim()) missingFields.push('Insurance Carrier')
            if (!doc.metadata?.effectiveDate?.trim()) missingFields.push('Effective Date')
            if (!doc.metadata?.expirationDate?.trim()) missingFields.push('Expiration Date')
            break
          case 'certificate':
            if (!doc.metadata?.certificateNumber?.trim()) missingFields.push('Certificate Number')
            if (!doc.metadata?.issuingAuthority?.trim()) missingFields.push('Issuing Authority')
            if (!doc.metadata?.issueDate?.trim()) missingFields.push('Issue Date')
            break
          case 'w9':
          case 'ein_letter':
            if (!doc.metadata?.ein?.trim()) missingFields.push('EIN')
            if (!doc.metadata?.legalName?.trim()) missingFields.push('Legal Name')
            break
          case 'bonding':
            if (!doc.metadata?.suretyName?.trim()) missingFields.push('Surety Company Name')
            if (!doc.metadata?.singleProjectLimit) missingFields.push('Single Project Limit')
            if (!doc.metadata?.aggregateLimit) missingFields.push('Aggregate Limit')
            if (!doc.metadata?.expirationDate?.trim()) missingFields.push('Expiration Date')
            break
        }
        
        if (missingFields.length > 0) {
          errors.push(`📋 "${docName}" is missing: ${missingFields.join(', ')}`)
        }
      }
    })
    
    if (errors.length > 0) {
      setValidationErrors({ general: errors })
      return false
    }
    
    setValidationErrors({})
    return true
  }

  // Check if required docs are present with complete metadata
  const hasRequiredDocs = 
    uploadedDocs.some(d => d.type === 'w9' && isDocumentComplete(d)) && 
    uploadedDocs.some(d => d.type === 'insurance' && isDocumentComplete(d)) &&
    uploadedDocs.some(d => d.type === 'bonding' && isDocumentComplete(d))

  const canContinue = hasRequiredDocs && Object.keys(validationErrors).length === 0

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[ComplianceIntakeStep] 🚀 Form submitted!')
    console.log('[ComplianceIntakeStep] Raw uploadedDocs:', JSON.stringify(uploadedDocs, null, 2))
    
    if (validateDocuments()) {
      // Transform documents to match backend schema
      const transformedDocs = uploadedDocs.map(doc => {
        console.log(`[ComplianceIntakeStep] 📄 Processing doc: ${doc.name}`, {
          type: doc.type,
          metadata: doc.metadata,
        })
        
        // Remove UI-only properties
        const { tempId, isCollapsed, ...docWithoutUIProps } = doc
        
        // Map frontend types to backend discriminator types
        let backendType: 'certificate' | 'insurance' | 'bonding' | 'attachment'
        switch (doc.type) {
          case 'insurance':
            backendType = 'insurance'
            break
          case 'certificate':
            backendType = 'certificate'
            break
          case 'bonding':
            backendType = 'bonding'
            break
          case 'w9':
          case 'ein_letter':
          case 'license':
          case 'other':
          default:
            backendType = 'attachment'
            break
        }
        
        // Clean metadata - remove empty strings and convert to undefined
        const cleanedMetadata: Record<string, any> = {}
        if (doc.metadata) {
          console.log(`[ComplianceIntakeStep] 🧹 Cleaning metadata for ${doc.name}:`, doc.metadata)
          
          for (const key in doc.metadata) {
            const value = (doc.metadata as any)[key]
            console.log(`  - Field "${key}": ${typeof value} = ${JSON.stringify(value)}`)
            
            // Keep the value if it's not an empty string or whitespace
            if (typeof value === 'string') {
              if (value.trim() !== '') {
                cleanedMetadata[key] = value.trim()
                console.log(`    ✅ Kept: "${value.trim()}"`)
              } else {
                console.log(`    ❌ Removed (empty string)`)
              }
            } else if (value !== null && value !== undefined) {
              // Keep non-string values (numbers, booleans, arrays, objects)
              cleanedMetadata[key] = value
              console.log(`    ✅ Kept (non-string): ${JSON.stringify(value)}`)
            } else {
              console.log(`    ❌ Removed (null/undefined)`)
            }
          }
          
          console.log(`[ComplianceIntakeStep] ✨ Cleaned metadata:`, cleanedMetadata)
        }
        
        // CRITICAL: Always include metadata if it exists in the original doc
        // Don't set to undefined, as backend expects an object (even if empty for some fields)
        const finalMetadata = Object.keys(cleanedMetadata).length > 0 
          ? cleanedMetadata 
          : (doc.metadata ? doc.metadata : undefined)
        
        const transformed = {
          ...docWithoutUIProps,
          type: backendType,
          metadata: finalMetadata,
        }
        
        console.log(`[ComplianceIntakeStep] ✅ Transformed doc:`, transformed)
        console.log(`[ComplianceIntakeStep] 📋 Final metadata for ${doc.name}:`, finalMetadata)
        return transformed
      })
      
      console.log('[ComplianceIntakeStep] 📦 FINAL PAYLOAD TO BACKEND:', JSON.stringify(transformedDocs, null, 2))
      console.log('[ComplianceIntakeStep] 📤 Calling saveImmediate...')
      saveImmediate({ documents: transformedDocs as ComplianceDocument[] })
    } else {
      console.log('[ComplianceIntakeStep] ❌ Validation failed, not submitting')
    }
  }

  // Handle file upload - create pending documents without metadata
  const handleUploadComplete = (files: Array<{ fileId: string; filename: string }>, type: string) => {
    const newDocs = files.map(f => {
      const tempId = `${type}_${Date.now()}_${Math.random()}`
      
      // Create document with empty metadata based on type
      const baseDoc = {
      fileId: f.fileId,
      name: f.filename,
      verified: false,
        tempId,
      }
      
      switch (type) {
        case 'insurance':
          return {
            ...baseDoc,
            type: 'insurance' as const,
            subType: 'general_liability' as const,
            metadata: {
              policyNumber: '',
              carrier: '',
              effectiveDate: '',
              expirationDate: '',
            },
          }
        case 'certificate':
          return {
            ...baseDoc,
            type: 'certificate' as const,
            subType: 'EIGHT_A' as const,
            metadata: {
              certificateNumber: '',
              issuingAuthority: '',
              issueDate: '',
            },
          }
        case 'w9':
        case 'ein_letter':
          return {
            ...baseDoc,
            type: type as 'w9' | 'ein_letter',
            metadata: {
              documentDate: '',
              ein: '',
              legalName: '',
            },
          }
        case 'bonding':
          return {
            ...baseDoc,
            type: 'bonding' as const,
            metadata: {
              suretyName: '',
              singleProjectLimit: 0,
              aggregateLimit: 0,
              expirationDate: '',
              bondTypesIncluded: ['BID', 'PERFORMANCE', 'PAYMENT'],
              subjectToUnderwriting: true,
            },
          }
        case 'license':
        case 'other':
          return {
            ...baseDoc,
            type: type as 'license' | 'other',
            metadata: {},
          }
        default:
          return {
            ...baseDoc,
            type: 'other' as const,
            metadata: {},
          }
      }
    })
    
    setUploadedDocs(prev => [...prev, ...newDocs as DocumentWithTempId[]])
  }

  const removeDoc = (identifier: string) => {
    setUploadedDocs(prev => prev.filter(d => (d.tempId || d.fileId) !== identifier))
  }

  const updateDocMetadata = (identifier: string, metadata: any) => {
    setUploadedDocs(prev => prev.map(doc => {
      if ((doc.tempId || doc.fileId) === identifier) {
        return { ...doc, metadata }
      }
      return doc
    }))
  }

  const updateDocSubType = (identifier: string, subType: string) => {
    setUploadedDocs(prev => prev.map(doc => {
      if ((doc.tempId || doc.fileId) === identifier) {
        return { ...doc, subType } as DocumentWithTempId
      }
      return doc
    }))
  }
  
  // Toggle collapsed state
  const toggleCollapse = (identifier: string) => {
    setUploadedDocs(prev => prev.map(doc => {
      if ((doc.tempId || doc.fileId) === identifier) {
        return { ...doc, isCollapsed: !doc.isCollapsed }
      }
      return doc
    }))
  }
  
  // Render collapsed document summary
  const renderCollapsedSummary = (doc: DocumentWithTempId) => {
    const identifier = doc.tempId || doc.fileId
    const isComplete = isDocumentComplete(doc)
    
    // Build summary text based on doc type
    let summary = ''
    if (doc.type === 'insurance' && doc.metadata) {
      summary = `Policy #${doc.metadata.policyNumber || '...'} | Exp: ${doc.metadata.expirationDate || '...'}`
    } else if (doc.type === 'certificate' && doc.metadata) {
      summary = `Cert #${doc.metadata.certificateNumber || '...'} | ${doc.metadata.issuingAuthority || '...'}`
    } else if ((doc.type === 'w9' || doc.type === 'ein_letter') && doc.metadata) {
      summary = `EIN: ${doc.metadata.ein || '...'} | ${doc.metadata.legalName || '...'}`
    } else if (doc.type === 'bonding' && doc.metadata) {
      summary = `${doc.metadata.suretyName || '...'} | Single: $${(doc.metadata.singleProjectLimit || 0).toLocaleString()} | Agg: $${(doc.metadata.aggregateLimit || 0).toLocaleString()}`
    }
    
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{doc.name}</span>
                  {isComplete && (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300 shrink-0">
                      Complete
                    </Badge>
                  )}
                </div>
                {summary && (
                  <p className="text-xs text-gray-600 mt-1 truncate">{summary}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCollapse(identifier)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDoc(identifier)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render metadata form based on document type
  const renderMetadataForm = (doc: DocumentWithTempId) => {
    const identifier = doc.tempId || doc.fileId
    
    switch (doc.type) {
      case 'insurance':
        return (
          <InsuranceMetadataForm
            data={doc.metadata || {}}
            onChange={(data) => updateDocMetadata(identifier, data)}
            subType={doc.subType}
            onSubTypeChange={(subType) => updateDocSubType(identifier, subType)}
          />
        )
      case 'certificate':
        return (
          <CertificateMetadataForm
            data={doc.metadata || {}}
            onChange={(data) => updateDocMetadata(identifier, data)}
            subType={doc.subType}
            onSubTypeChange={(subType) => updateDocSubType(identifier, subType)}
          />
        )
      case 'w9':
      case 'ein_letter':
        return (
          <TaxDocumentMetadataForm
            data={doc.metadata || {}}
            onChange={(data) => updateDocMetadata(identifier, data)}
          />
        )
      case 'bonding':
        return (
          <BondingMetadataForm
            data={doc.metadata || {}}
            onChange={(data) => updateDocMetadata(identifier, data)}
          />
        )
      case 'license':
      case 'other':
        return (
          <GenericDocumentMetadataForm
            data={doc.metadata || {}}
            onChange={(data) => updateDocMetadata(identifier, data)}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          Compliance Documents
        </h2>
        <p className="text-gray-600 mt-2">
          Upload required documents and provide metadata for compliance tracking
        </p>
      </div>

      {validationErrors.general && validationErrors.general.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Please complete the following before continuing:</div>
            <ul className="space-y-1 ml-4">
              {validationErrors.general.map((error: string, index: number) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Upload Sections */}
        {DOC_TYPES.map((docType) => {
          const docsOfType = uploadedDocs.filter(d => d.type === docType.value)
          return (
            <Card key={docType.value}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {docType.label}
                  {docType.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                </CardTitle>
                <CardDescription>
                  {docType.helpText}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Uploaded documents with metadata forms */}
                {docsOfType.map(doc => {
                  const identifier = doc.tempId || doc.fileId
                  const isComplete = isDocumentComplete(doc)
                  
                  // Show collapsed summary if marked as collapsed OR if metadata is complete
                  if (doc.isCollapsed || (isComplete && doc.isCollapsed !== false)) {
                    return <div key={identifier}>{renderCollapsedSummary(doc)}</div>
                  }
                  
                  return (
                    <div key={identifier} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
                      {/* File header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">{doc.name}</span>
                          {!isComplete && (
                            <Badge variant="outline" className="text-xs text-yellow-700">
                              Metadata Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isComplete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCollapse(identifier)}
                              title="Collapse"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDoc(identifier)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Metadata form */}
                      {renderMetadataForm(doc)}
                    </div>
                  )
                })}
                
                {/* Upload zone */}
                <SimpleFileUpload
                  onUploadComplete={(files) => handleUploadComplete(files, docType.value)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  label={docType.uploadLabel}
                  description={docType.uploadDescription}
                  documentType={docType.value}
                />
              </CardContent>
            </Card>
          )
        })}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm">📋 Document Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Fill in document details after uploading each file</li>
              <li>• Expiration dates help us send renewal reminders</li>
              <li>• Policy/certificate numbers enable compliance tracking</li>
              <li>• You can update metadata later from your dashboard</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {isSaving && 'Saving...'}
            {uploadedDocs.length > 0 && !isSaving && (
              <>
                {uploadedDocs.length} document(s) uploaded
                {!canContinue && ' • Complete metadata to continue'}
              </>
            )}
          </div>
          <Button
            type="submit"
            disabled={!canContinue || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}
