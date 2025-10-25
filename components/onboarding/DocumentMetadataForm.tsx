'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  InsuranceMetadata,
  CertificateMetadata,
  TaxDocumentMetadata,
  GenericDocumentMetadata,
  BondingMetadata,
} from '@/lib/onboarding-types'

// =====================
// Insurance Metadata Form
// =====================

interface InsuranceMetadataFormProps {
  data: Partial<InsuranceMetadata>
  onChange: (data: Partial<InsuranceMetadata>) => void
  errors?: Partial<Record<keyof InsuranceMetadata, string>>
  subType?: string
  onSubTypeChange?: (subType: string) => void
}

export function InsuranceMetadataForm({
  data,
  onChange,
  errors,
  subType,
  onSubTypeChange,
}: InsuranceMetadataFormProps) {
  const updateField = <K extends keyof InsuranceMetadata>(
    field: K,
    value: InsuranceMetadata[K]
  ) => {
    console.log(`[InsuranceMetadataForm] 📝 Field updated:`, { field, value, previousData: data })
    const newData = { ...data, [field]: value }
    console.log(`[InsuranceMetadataForm] 📤 Calling onChange with:`, newData)
    onChange(newData)
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm text-gray-700">Insurance Policy Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Insurance Type */}
        <div className="col-span-2">
          <Label htmlFor="subType">Insurance Type *</Label>
          <Select value={subType} onValueChange={onSubTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general_liability">General Liability</SelectItem>
              <SelectItem value="workers_comp">Workers Compensation</SelectItem>
              <SelectItem value="professional_liability">Professional Liability</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Policy Number */}
        <div>
          <Label htmlFor="policyNumber">Policy Number *</Label>
          <Input
            id="policyNumber"
            value={data.policyNumber || ''}
            onChange={(e) => updateField('policyNumber', e.target.value)}
            placeholder="GL-123456789"
            className="mt-1"
          />
          {errors?.policyNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.policyNumber}</p>
          )}
        </div>

        {/* Carrier */}
        <div>
          <Label htmlFor="carrier">Insurance Carrier *</Label>
          <Input
            id="carrier"
            value={data.carrier || ''}
            onChange={(e) => updateField('carrier', e.target.value)}
            placeholder="State Farm"
            className="mt-1"
          />
          {errors?.carrier && (
            <p className="text-sm text-red-600 mt-1">{errors.carrier}</p>
          )}
        </div>

        {/* Effective Date */}
        <div>
          <Label htmlFor="effectiveDate">Effective Date *</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={data.effectiveDate || ''}
            onChange={(e) => updateField('effectiveDate', e.target.value)}
            className="mt-1"
          />
          {errors?.effectiveDate && (
            <p className="text-sm text-red-600 mt-1">{errors.effectiveDate}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <Label htmlFor="expirationDate">Expiration Date *</Label>
          <Input
            id="expirationDate"
            type="date"
            value={data.expirationDate || ''}
            onChange={(e) => updateField('expirationDate', e.target.value)}
            className="mt-1"
          />
          {errors?.expirationDate && (
            <p className="text-sm text-red-600 mt-1">{errors.expirationDate}</p>
          )}
        </div>

        {/* Occurrence Coverage */}
        <div>
          <Label htmlFor="occurrenceCoverage">Occurrence Coverage ($)</Label>
          <Input
            id="occurrenceCoverage"
            type="number"
            value={data.occurrenceCoverage || ''}
            onChange={(e) => updateField('occurrenceCoverage', parseFloat(e.target.value) || undefined)}
            placeholder="1000000"
            className="mt-1"
          />
        </div>

        {/* Aggregate Coverage */}
        <div>
          <Label htmlFor="aggregateCoverage">Aggregate Coverage ($)</Label>
          <Input
            id="aggregateCoverage"
            type="number"
            value={data.aggregateCoverage || ''}
            onChange={(e) => updateField('aggregateCoverage', parseFloat(e.target.value) || undefined)}
            placeholder="2000000"
            className="mt-1"
          />
        </div>

        {/* Named Insured */}
        <div className="col-span-2">
          <Label htmlFor="namedInsured">Named Insured</Label>
          <Input
            id="namedInsured"
            value={data.namedInsured || ''}
            onChange={(e) => updateField('namedInsured', e.target.value)}
            placeholder="Company Legal Name"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

// =====================
// Certificate Metadata Form
// =====================

interface CertificateMetadataFormProps {
  data: Partial<CertificateMetadata>
  onChange: (data: Partial<CertificateMetadata>) => void
  errors?: Partial<Record<keyof CertificateMetadata, string>>
  subType?: string
  onSubTypeChange?: (subType: string) => void
}

export function CertificateMetadataForm({
  data,
  onChange,
  errors,
  subType,
  onSubTypeChange,
}: CertificateMetadataFormProps) {
  const updateField = <K extends keyof CertificateMetadata>(
    field: K,
    value: CertificateMetadata[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm text-gray-700">Certificate Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Certificate Type */}
        <div className="col-span-2">
          <Label htmlFor="subType">Certificate Type *</Label>
          <Select value={subType} onValueChange={onSubTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EIGHT_A">8(a) Business Development</SelectItem>
              <SelectItem value="HUBZONE">HUBZone</SelectItem>
              <SelectItem value="WOSB">Women-Owned Small Business</SelectItem>
              <SelectItem value="VOSB">Veteran-Owned Small Business</SelectItem>
              <SelectItem value="ISO_9001">ISO 9001</SelectItem>
              <SelectItem value="ISO_27001">ISO 27001</SelectItem>
              <SelectItem value="CMMC">CMMC</SelectItem>
              <SelectItem value="FEDRAMP">FedRAMP</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Certificate Number */}
        <div>
          <Label htmlFor="certificateNumber">Certificate Number *</Label>
          <Input
            id="certificateNumber"
            value={data.certificateNumber || ''}
            onChange={(e) => updateField('certificateNumber', e.target.value)}
            placeholder="8A-2024-12345"
            className="mt-1"
          />
          {errors?.certificateNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.certificateNumber}</p>
          )}
        </div>

        {/* Issuing Authority */}
        <div>
          <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
          <Input
            id="issuingAuthority"
            value={data.issuingAuthority || ''}
            onChange={(e) => updateField('issuingAuthority', e.target.value)}
            placeholder="SBA"
            className="mt-1"
          />
          {errors?.issuingAuthority && (
            <p className="text-sm text-red-600 mt-1">{errors.issuingAuthority}</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input
            id="issueDate"
            type="date"
            value={data.issueDate || ''}
            onChange={(e) => updateField('issueDate', e.target.value)}
            className="mt-1"
          />
          {errors?.issueDate && (
            <p className="text-sm text-red-600 mt-1">{errors.issueDate}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <Label htmlFor="expirationDate">Expiration Date</Label>
          <Input
            id="expirationDate"
            type="date"
            value={data.expirationDate || ''}
            onChange={(e) => updateField('expirationDate', e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank if no expiration</p>
        </div>

        {/* Scope */}
        <div>
          <Label htmlFor="scope">Scope</Label>
          <Input
            id="scope"
            value={data.scope || ''}
            onChange={(e) => updateField('scope', e.target.value)}
            placeholder="Manufacturing"
            className="mt-1"
          />
        </div>

        {/* Level */}
        <div>
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            value={data.level || ''}
            onChange={(e) => updateField('level', e.target.value)}
            placeholder="Moderate"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

// =====================
// Tax Document Metadata Form (W-9, EIN Letter)
// =====================

interface TaxDocumentMetadataFormProps {
  data: Partial<TaxDocumentMetadata>
  onChange: (data: Partial<TaxDocumentMetadata>) => void
  errors?: Partial<Record<keyof TaxDocumentMetadata, string>>
}

export function TaxDocumentMetadataForm({
  data,
  onChange,
  errors,
}: TaxDocumentMetadataFormProps) {
  const updateField = <K extends keyof TaxDocumentMetadata>(
    field: K,
    value: TaxDocumentMetadata[K]
  ) => {
    console.log(`[TaxDocumentMetadataForm] 📝 Field updated:`, { field, value, previousData: data })
    const newData = { ...data, [field]: value }
    console.log(`[TaxDocumentMetadataForm] 📤 Calling onChange with:`, newData)
    onChange(newData)
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm text-gray-700">Tax Document Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Document Date */}
        <div>
          <Label htmlFor="documentDate">Document Date *</Label>
          <Input
            id="documentDate"
            type="date"
            value={data.documentDate || ''}
            onChange={(e) => updateField('documentDate', e.target.value)}
            className="mt-1"
          />
          {errors?.documentDate && (
            <p className="text-sm text-red-600 mt-1">{errors.documentDate}</p>
          )}
        </div>

        {/* EIN */}
        <div>
          <Label htmlFor="ein">EIN *</Label>
          <Input
            id="ein"
            value={data.ein || ''}
            onChange={(e) => updateField('ein', e.target.value)}
            placeholder="12-3456789"
            className="mt-1"
          />
          {errors?.ein && (
            <p className="text-sm text-red-600 mt-1">{errors.ein}</p>
          )}
        </div>

        {/* Legal Name */}
        <div className="col-span-2">
          <Label htmlFor="legalName">Legal Business Name *</Label>
          <Input
            id="legalName"
            value={data.legalName || ''}
            onChange={(e) => updateField('legalName', e.target.value)}
            placeholder="Company Legal Name"
            className="mt-1"
          />
          {errors?.legalName && (
            <p className="text-sm text-red-600 mt-1">{errors.legalName}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// =====================
// Generic Document Metadata Form
// =====================

interface GenericDocumentMetadataFormProps {
  data: Partial<GenericDocumentMetadata>
  onChange: (data: Partial<GenericDocumentMetadata>) => void
  errors?: Partial<Record<keyof GenericDocumentMetadata, string>>
}

export function GenericDocumentMetadataForm({
  data,
  onChange,
  errors,
}: GenericDocumentMetadataFormProps) {
  const updateField = <K extends keyof GenericDocumentMetadata>(
    field: K,
    value: GenericDocumentMetadata[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm text-gray-700">Document Details</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Document Number */}
        <div>
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            value={data.documentNumber || ''}
            onChange={(e) => updateField('documentNumber', e.target.value)}
            placeholder="License #"
            className="mt-1"
          />
        </div>

        {/* Issuing Organization */}
        <div>
          <Label htmlFor="issuingOrganization">Issuing Organization</Label>
          <Input
            id="issuingOrganization"
            value={data.issuingOrganization || ''}
            onChange={(e) => updateField('issuingOrganization', e.target.value)}
            placeholder="State Board"
            className="mt-1"
          />
        </div>

        {/* Issue Date */}
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={data.issueDate || ''}
            onChange={(e) => updateField('issueDate', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Expiration Date */}
        <div>
          <Label htmlFor="expirationDate">Expiration Date</Label>
          <Input
            id="expirationDate"
            type="date"
            value={data.expirationDate || ''}
            onChange={(e) => updateField('expirationDate', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional information about this document"
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}

// =====================
// Bonding Capacity Metadata Form
// =====================

interface BondingMetadataFormProps {
  data: Partial<BondingMetadata>
  onChange: (data: Partial<BondingMetadata>) => void
  errors?: Partial<Record<keyof BondingMetadata, string>>
}

export function BondingMetadataForm({
  data,
  onChange,
  errors,
}: BondingMetadataFormProps) {
  const updateField = <K extends keyof BondingMetadata>(
    field: K,
    value: BondingMetadata[K]
  ) => {
    console.log(`[BondingMetadataForm] 📝 Field updated:`, { field, value, previousData: data })
    const newData = { ...data, [field]: value }
    console.log(`[BondingMetadataForm] 📤 Calling onChange with:`, newData)
    onChange(newData)
  }

  const updateBondTypes = (type: string, checked: boolean) => {
    const currentTypes = data.bondTypesIncluded || ['BID', 'PERFORMANCE', 'PAYMENT']
    const newTypes = checked 
      ? [...currentTypes, type as any]
      : currentTypes.filter(t => t !== type)
    updateField('bondTypesIncluded', newTypes as any)
  }

  // Calculate available capacity
  const availableCapacity = data.aggregateLimit && data.currentlyBonded !== undefined
    ? data.aggregateLimit - data.currentlyBonded
    : undefined

  // Calculate days until expiration
  const daysUntilExpiration = data.expirationDate 
    ? Math.floor((new Date(data.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div>
        <h4 className="font-medium text-sm text-gray-700">Bonding Capacity Letter</h4>
        <p className="text-xs text-gray-600 mt-1">Required for federal contracts &gt; $150K (Miller Act)</p>
      </div>
      
      {/* Surety Company Information */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-700 border-b pb-1">Surety Company</h5>
        <div className="grid grid-cols-2 gap-4">
          {/* Surety Name */}
          <div className="col-span-2">
            <Label htmlFor="suretyName">Surety Company Name *</Label>
            <Input
              id="suretyName"
              value={data.suretyName || ''}
              onChange={(e) => updateField('suretyName', e.target.value)}
              placeholder="Travelers Casualty and Surety Company"
              className="mt-1"
            />
            {errors?.suretyName && (
              <p className="text-sm text-red-600 mt-1">{errors.suretyName}</p>
            )}
          </div>

          {/* NAIC Number */}
          <div>
            <Label htmlFor="suretyNAIC">NAIC Number</Label>
            <Input
              id="suretyNAIC"
              value={data.suretyNAIC || ''}
              onChange={(e) => updateField('suretyNAIC', e.target.value)}
              placeholder="31194"
              maxLength={5}
              className="mt-1"
            />
            <p className="text-xs text-gray-600 mt-1">5 digits (required for federal work)</p>
            {errors?.suretyNAIC && (
              <p className="text-sm text-red-600 mt-1">{errors.suretyNAIC}</p>
            )}
          </div>

          {/* AM Best Rating */}
          <div>
            <Label htmlFor="suretyAMBestRating">AM Best Rating</Label>
            <Select value={data.suretyAMBestRating} onValueChange={(val) => updateField('suretyAMBestRating', val as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A_PLUS_PLUS">A++ (Superior)</SelectItem>
                <SelectItem value="A_PLUS">A+ (Superior)</SelectItem>
                <SelectItem value="A">A (Excellent)</SelectItem>
                <SelectItem value="A_MINUS">A- (Excellent)</SelectItem>
                <SelectItem value="B_PLUS_PLUS">B++ (Good)</SelectItem>
                <SelectItem value="B_PLUS">B+ (Good)</SelectItem>
                <SelectItem value="B">B (Fair)</SelectItem>
                <SelectItem value="B_MINUS">B- (Fair)</SelectItem>
                <SelectItem value="NOT_RATED">Not Rated</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">A- or better recommended for federal work</p>
          </div>

          {/* Treasury Listed */}
          <div className="col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="suretyTreasuryListed"
              checked={data.suretyTreasuryListed || false}
              onChange={(e) => updateField('suretyTreasuryListed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="suretyTreasuryListed" className="text-sm font-normal cursor-pointer">
              Treasury-listed (required for federal contracts &gt; $150K)
            </Label>
          </div>
        </div>
      </div>

      {/* Bonding Capacity */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-700 border-b pb-1">Bonding Capacity</h5>
        <div className="grid grid-cols-2 gap-4">
          {/* Single Project Limit */}
          <div>
            <Label htmlFor="singleProjectLimit">Single Project Limit *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                id="singleProjectLimit"
                type="number"
                value={data.singleProjectLimit || ''}
                onChange={(e) => updateField('singleProjectLimit', parseFloat(e.target.value) || 0)}
                placeholder="5000000"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Max bond for ONE project</p>
            {errors?.singleProjectLimit && (
              <p className="text-sm text-red-600 mt-1">{errors.singleProjectLimit}</p>
            )}
          </div>

          {/* Aggregate Limit */}
          <div>
            <Label htmlFor="aggregateLimit">Aggregate Limit *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                id="aggregateLimit"
                type="number"
                value={data.aggregateLimit || ''}
                onChange={(e) => updateField('aggregateLimit', parseFloat(e.target.value) || 0)}
                placeholder="15000000"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Total capacity across ALL projects</p>
            {errors?.aggregateLimit && (
              <p className="text-sm text-red-600 mt-1">{errors.aggregateLimit}</p>
            )}
          </div>

          {/* Currently Bonded (optional) */}
          <div className="col-span-2">
            <Label htmlFor="currentlyBonded">Currently Bonded Amount (Optional)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                id="currentlyBonded"
                type="number"
                value={data.currentlyBonded !== undefined ? data.currentlyBonded : ''}
                onChange={(e) => updateField('currentlyBonded', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="pl-7"
              />
            </div>
            {availableCapacity !== undefined && (
              <div className="mt-2 p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium text-gray-700">Available Capacity:</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${availableCapacity.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  ({((availableCapacity / (data.aggregateLimit || 1)) * 100).toFixed(0)}% available)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Letter Details */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-700 border-b pb-1">Letter Details</h5>
        <div className="grid grid-cols-2 gap-4">
          {/* Letter Number */}
          <div>
            <Label htmlFor="letterNumber">Letter Number</Label>
            <Input
              id="letterNumber"
              value={data.letterNumber || ''}
              onChange={(e) => updateField('letterNumber', e.target.value)}
              placeholder="BCL-2024-12345"
              className="mt-1"
            />
          </div>

          {/* Issue Date */}
          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={data.issueDate || ''}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Expiration Date - CRITICAL */}
          <div className="col-span-2">
            <Label htmlFor="expirationDate">Expiration Date * <span className="text-red-600">CRITICAL</span></Label>
            <Input
              id="expirationDate"
              type="date"
              value={data.expirationDate || ''}
              onChange={(e) => updateField('expirationDate', e.target.value)}
              className="mt-1"
            />
            {daysUntilExpiration !== undefined && (
              <div className={`mt-2 p-2 rounded text-sm ${
                daysUntilExpiration < 0 ? 'bg-red-100 text-red-800' :
                daysUntilExpiration < 30 ? 'bg-red-100 text-red-800' :
                daysUntilExpiration < 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {daysUntilExpiration < 0 ? '⛔ EXPIRED' :
                 daysUntilExpiration < 30 ? `🚨 Critical: Expires in ${daysUntilExpiration} days` :
                 daysUntilExpiration < 60 ? `⚠️ Warning: Expires in ${daysUntilExpiration} days` :
                 `✓ Valid for ${daysUntilExpiration} days`}
              </div>
            )}
            {errors?.expirationDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expirationDate}</p>
            )}
          </div>

          {/* Bond Types */}
          <div className="col-span-2">
            <Label>Bond Types Covered</Label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'BID', label: 'Bid Bonds', description: 'For proposals' },
                { value: 'PERFORMANCE', label: 'Performance Bonds', description: 'Guarantees work completion' },
                { value: 'PAYMENT', label: 'Payment Bonds', description: 'Guarantees sub/supplier payment' },
                { value: 'MAINTENANCE', label: 'Maintenance Bonds', description: 'Post-completion coverage' },
              ].map((bondType) => (
                <div key={bondType.value} className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id={`bond-${bondType.value}`}
                    checked={(data.bondTypesIncluded || []).includes(bondType.value as any)}
                    onChange={(e) => updateBondTypes(bondType.value, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <Label htmlFor={`bond-${bondType.value}`} className="text-sm font-normal cursor-pointer">
                    <span className="font-medium">{bondType.label}</span>
                    <span className="text-gray-600"> - {bondType.description}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Information (Optional) */}
      <details className="space-y-4">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600">
          Agent Information (Optional, but speeds up bond issuance)
        </summary>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Agent Name */}
          <div>
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={data.agentName || ''}
              onChange={(e) => updateField('agentName', e.target.value)}
              placeholder="John Smith"
              className="mt-1"
            />
          </div>

          {/* Agency Name */}
          <div>
            <Label htmlFor="agencyName">Agency Name</Label>
            <Input
              id="agencyName"
              value={data.agencyName || ''}
              onChange={(e) => updateField('agencyName', e.target.value)}
              placeholder="ABC Bonding Agency"
              className="mt-1"
            />
          </div>

          {/* Agent Phone */}
          <div>
            <Label htmlFor="agentPhone">Agent Phone</Label>
            <Input
              id="agentPhone"
              type="tel"
              value={data.agentPhone || ''}
              onChange={(e) => updateField('agentPhone', e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1"
            />
          </div>

          {/* Agent Email */}
          <div>
            <Label htmlFor="agentEmail">Agent Email</Label>
            <Input
              id="agentEmail"
              type="email"
              value={data.agentEmail || ''}
              onChange={(e) => updateField('agentEmail', e.target.value)}
              placeholder="john@abcbonding.com"
              className="mt-1"
            />
          </div>

          {/* Agent License */}
          <div>
            <Label htmlFor="agentLicenseNumber">Agent License Number</Label>
            <Input
              id="agentLicenseNumber"
              value={data.agentLicenseNumber || ''}
              onChange={(e) => updateField('agentLicenseNumber', e.target.value)}
              placeholder="INS-12345"
              className="mt-1"
            />
          </div>

          {/* Power of Attorney */}
          <div>
            <Label htmlFor="powerOfAttorneyNumber">Power of Attorney Number</Label>
            <Input
              id="powerOfAttorneyNumber"
              value={data.powerOfAttorneyNumber || ''}
              onChange={(e) => updateField('powerOfAttorneyNumber', e.target.value)}
              placeholder="POA-2024-001"
              className="mt-1"
            />
          </div>
        </div>
      </details>

      {/* Terms & Notes */}
      <details className="space-y-4">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600">
          Terms & Notes (Optional)
        </summary>
        <div className="space-y-4 mt-4">
          {/* Exclusions */}
          <div>
            <Label htmlFor="exclusions">Exclusions or Limitations</Label>
            <Textarea
              id="exclusions"
              value={data.exclusions || ''}
              onChange={(e) => updateField('exclusions', e.target.value)}
              placeholder="e.g., 'Excludes hazardous waste projects'"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={data.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional information about this bonding letter"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </details>
    </div>
  )
}

