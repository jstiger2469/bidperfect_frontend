// Company readiness utilities: recommended docs, scoring, and status checks

export type ReadinessItem = {
  key: string
  label: string
  description?: string
  docType?: string
  tags?: string[]
  required?: boolean
  weight?: number
}

export const RECOMMENDED_DOCS: ReadinessItem[] = [
  { key: 'w9', label: 'IRS Form W-9', docType: 'W-9', tags: ['w9'], required: true, weight: 4 },
  { key: 'ein-letter', label: 'IRS EIN Confirmation Letter', docType: 'EIN Letter', tags: ['ein','irs'], weight: 2 },
  { key: 'capability-statement', label: 'Capabilities Statement', docType: 'Capabilities Statement', tags: ['capabilities','statement'], required: true, weight: 4 },
  { key: 'org-chart', label: 'Organizational Chart', docType: 'Org Chart', tags: ['org','chart'], weight: 2 },
  { key: 'quality-plan', label: 'Quality Management Plan', docType: 'Quality Plan', tags: ['quality'], weight: 2 },
  { key: 'safety-plan', label: 'Safety Plan', docType: 'Safety Plan', tags: ['safety'], weight: 2 },
  { key: 'cybersecurity-plan', label: 'Cybersecurity/IT Security Plan', docType: 'Cybersecurity Plan', tags: ['cyber','security'], weight: 2 },
  { key: 'key-resumes', label: 'Key Personnel Resumes', docType: 'Resume', tags: ['resume'], required: true, weight: 3 },
  { key: 'sam-confirmation', label: 'SAM Registration Confirmation', docType: 'SAM Confirmation', tags: ['sam'], required: true, weight: 3 },
  { key: 'gl-policy', label: 'General Liability Insurance (COI)', docType: 'Insurance - GL', tags: ['insurance','coi','general-liability'], required: true, weight: 4 },
  { key: 'wc-policy', label: "Workers' Compensation Insurance (COI)", docType: 'Insurance - WC', tags: ['insurance','workers-comp'], required: true, weight: 4 },
  { key: 'auto-policy', label: 'Auto Liability Insurance (COI)', docType: 'Insurance - Auto', tags: ['insurance','auto-liability'], weight: 3 },
  { key: 'pl-policy', label: 'Professional Liability (if applicable)', docType: 'Insurance - Professional', tags: ['insurance','professional-liability'], weight: 2 },
  { key: 'bonding-letter', label: 'Bonding Capacity Letter', docType: 'Bonding Letter', tags: ['bond','bonding'], weight: 3 },
]

export type CompanyReadinessInputs = {
  company?: any
  documents?: any[]
  staff?: any[]
  insurance?: any[]
  licenses?: any[]
  certifications?: any[]
  bonding?: any
}

export type CompanyReadiness = {
  score: number
  totalWeight: number
  achievedWeight: number
  breakdown: Array<{
    key: string
    label: string
    completed: boolean
    weight: number
    reason?: string
  }>
  missingKeys: string[]
}

function hasDoc(docs: any[] | undefined, predicate: (d: any) => boolean): boolean {
  if (!docs || !docs.length) return false
  return docs.some((d) => {
    try {
      return Boolean(predicate(d))
    } catch { return false }
  })
}

export function computeCompanyReadiness(input: CompanyReadinessInputs): CompanyReadiness {
  const company = input.company || {}
  const docs = input.documents || []
  const staff = input.staff || []
  const insurance = input.insurance || []
  const bonding = input.bonding || null

  const breakdown: CompanyReadiness['breakdown'] = []
  let achieved = 0
  let total = 0

  // Identity & registrations
  const identityItems: Array<{ key: string; label: string; present: boolean; weight: number; reason?: string }> = [
    { key: 'uei', label: 'UEI on file', present: Boolean(company.uei), weight: 4, reason: 'Add UEI under Government Registrations' },
    { key: 'cage', label: 'CAGE on file', present: Boolean(company.cage), weight: 4, reason: 'Add CAGE under Government Registrations' },
    { key: 'address', label: 'Headquarters address', present: Boolean(company?.address?.city && company?.address?.state), weight: 2, reason: 'Complete HQ address in Profile' },
    { key: 'sam-active', label: 'SAM Active', present: (company.samStatus || '').toLowerCase() === 'active', weight: 4, reason: 'Sync SAM or resolve SAM status' },
  ]
  identityItems.forEach((it) => {
    total += it.weight
    if (it.present) achieved += it.weight
    breakdown.push({ key: it.key, label: it.label, completed: it.present, weight: it.weight, reason: it.present ? undefined : it.reason })
  })

  // Staff presence
  const staffPresent = (staff?.length || 0) > 0
  total += 4
  if (staffPresent) achieved += 4
  breakdown.push({ key: 'staff', label: 'At least 1 staff record', completed: staffPresent, weight: 4, reason: 'Add key personnel under Staff' })

  // Insurance checks (document or insurance policy records)
  const insHas = (typeHint: string) => {
    const policyMatch = insurance.some((p: any) => {
      const t = (p?.type || '').toString().toLowerCase()
      return t.includes(typeHint)
    })
    const docMatch = hasDoc(docs, (d) => {
      const t = (d?.type || d?.documentType || '').toString().toLowerCase()
      const tags = (d?.tags || []) as string[]
      return t.includes(typeHint) || tags.some((x) => x?.toLowerCase().includes(typeHint))
    })
    return policyMatch || docMatch
  }

  const insuranceChecks: Array<{ key: string; label: string; ok: boolean; weight: number; reason: string }> = [
    { key: 'gl', label: 'General Liability policy', ok: insHas('general'), weight: 4, reason: 'Upload COI for General Liability' },
    { key: 'wc', label: "Workers' Comp policy", ok: insHas('workers'), weight: 4, reason: "Upload COI for Workers' Comp" },
    { key: 'auto', label: 'Auto Liability policy', ok: insHas('auto'), weight: 3, reason: 'Upload COI for Auto Liability' },
  ]
  insuranceChecks.forEach((it) => {
    total += it.weight
    if (it.ok) achieved += it.weight
    breakdown.push({ key: `ins-${it.key}`, label: it.label, completed: it.ok, weight: it.weight, reason: it.ok ? undefined : it.reason })
  })

  // Bonding letter
  const hasBondingLetter = Boolean(bonding?.capacity || hasDoc(docs, (d) => {
    const t = (d?.type || d?.documentType || '').toString().toLowerCase()
    const tags = (d?.tags || []) as string[]
    return t.includes('bond') || tags.some((x) => x?.toLowerCase().includes('bond'))
  }))
  total += 3
  if (hasBondingLetter) achieved += 3
  breakdown.push({ key: 'bonding', label: 'Bonding capacity letter', completed: hasBondingLetter, weight: 3, reason: 'Upload bonding capacity letter' })

  // Recommended docs
  RECOMMENDED_DOCS.forEach((rec) => {
    const ok = hasDoc(docs, (d) => {
      const t = (d?.type || d?.documentType || '').toString().toLowerCase()
      const tags = (d?.tags || []) as string[]
      const name = (d?.name || d?.filename || d?.storageKey || '').toString().toLowerCase()
      const matchType = rec.docType ? t.includes(rec.docType.toLowerCase()) : false
      const matchTag = (rec.tags || []).some((tag) => t.includes(tag.toLowerCase()) || name.includes(tag.toLowerCase()) || tags.some((x) => x?.toLowerCase().includes(tag.toLowerCase())))
      return matchType || matchTag
    })
    const weight = rec.weight ?? (rec.required ? 3 : 2)
    total += weight
    if (ok) achieved += weight
    breakdown.push({ key: rec.key, label: rec.label, completed: ok, weight, reason: ok ? undefined : `Add ${rec.label}` })
  })

  // Normalize and cap score between 0 and 100
  const percentage = total > 0 ? Math.max(0, Math.min(100, Math.round((achieved / total) * 100))) : 0
  const missing = breakdown.filter((b) => !b.completed).map((b) => b.key)

  return { score: percentage, totalWeight: total, achievedWeight: achieved, breakdown, missingKeys: missing }
}



