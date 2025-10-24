// Document coverage matcher to map binder artifacts to document tags/types and compute confidence
export type DocMeta = {
  id: string
  name: string
  type?: string
  tags?: string[]
  expiresAt?: string | null
  uploadedAt?: string
  scope: 'company' | 'opportunity'
}

export type CoverageMatch = {
  artifact: string
  matched: boolean
  confidence: number // 0-1
  source?: 'company' | 'opportunity'
  doc?: DocMeta
  reason?: string
}

export const ARTIFACT_RULES: Record<string, { tags?: string[]; types?: string[]; maxAgeDays?: number }> = {
  'Certificate of Insurance': { tags: ['insurance', 'coi'], types: ['pdf'], maxAgeDays: 365 },
  'Key Personnel Resume': { tags: ['resume', 'key-personnel'], types: ['pdf', 'docx'] },
  'Past Performance': { tags: ['past-performance', 'reference'], types: ['pdf'] },
  'Technical Volume': { tags: ['proposal', 'technical'], types: ['pdf'] },
  'Price Volume': { tags: ['pricing', 'price'], types: ['xlsx', 'pdf'] },
}

export function getArtifactRule(artifact: string) {
  return ARTIFACT_RULES[artifact]
}

export function computeCoverageForArtifact(artifact: string, docs: DocMeta[]): CoverageMatch {
  const rule = ARTIFACT_RULES[artifact]
  if (!rule) {
    // unknown artifact – low-confidence match on any doc
    const any = docs[0]
    return { artifact, matched: Boolean(any), confidence: any ? 0.2 : 0, source: any?.scope, doc: any, reason: any ? 'No rule; best-effort' : 'No documents' }
  }

  let best: CoverageMatch = { artifact, matched: false, confidence: 0 }
  const now = Date.now()

  for (const doc of docs) {
    let score = 0
    const tagHit = rule.tags && doc.tags ? doc.tags.some(t => rule.tags!.includes(t)) : false
    const typeHit = rule.types ? rule.types.includes((doc.type || '').toLowerCase()) : true
    if (tagHit) score += 0.5
    if (typeHit) score += 0.3

    // Freshness / expiry
    if (rule.maxAgeDays && doc.uploadedAt) {
      const ageDays = (now - new Date(doc.uploadedAt).getTime()) / (1000*60*60*24)
      if (ageDays <= rule.maxAgeDays) score += 0.15
    } else {
      score += 0.05 // slight credit
    }
    if (doc.expiresAt) {
      const expMs = new Date(doc.expiresAt).getTime()
      if (expMs > now) score += 0.05
    }

    if (score > best.confidence) {
      best = { artifact, matched: score >= 0.6, confidence: Math.min(score, 1), source: doc.scope, doc, reason: tagHit ? 'Tag match' : typeHit ? 'Type match' : 'Freshness/expiry' }
    }
  }

  return best
}

export function computeCoverage(artifacts: string[], docs: DocMeta[]): CoverageMatch[] {
  return artifacts.map(a => computeCoverageForArtifact(a, docs))
}

// =============================
// UCF mapping helpers (Sections A–M)
// =============================
export type UCFSectionId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'

export const UCF_SECTIONS: Array<{ id: UCFSectionId; title: string; purpose: string }> = [
  { id: 'A', title: 'Solicitation/Contract Form', purpose: 'Basic contract info' },
  { id: 'B', title: 'Supplies/Services & Prices', purpose: 'What is procured and pricing structure' },
  { id: 'C', title: 'SOW/Specifications', purpose: 'Scope and technical requirements' },
  { id: 'D', title: 'Packaging & Marking', purpose: 'Packaging/labeling of deliverables' },
  { id: 'E', title: 'Inspection & Acceptance', purpose: 'Quality standards and inspection' },
  { id: 'F', title: 'Deliveries or Performance', purpose: 'Schedule and performance timelines' },
  { id: 'G', title: 'Contract Admin Data', purpose: 'POCs, invoicing, admin details' },
  { id: 'H', title: 'Special Contract Requirements', purpose: 'Special clauses/requirements' },
  { id: 'I', title: 'Contract Clauses', purpose: 'Standard FAR/agency clauses' },
  { id: 'J', title: 'Attachments', purpose: 'Exhibits, drawings, attachments' },
  { id: 'K', title: 'Reps & Certs', purpose: 'Vendor certifications and disclosures' },
  { id: 'L', title: 'Instructions to Offerors', purpose: 'Submission instructions' },
  { id: 'M', title: 'Evaluation Factors', purpose: 'How proposals are evaluated' },
]

function textContains(text: string, ...needles: string[]) {
  const t = text.toLowerCase()
  return needles.some(n => t.includes(n.toLowerCase()))
}

export function mapSectionsToUCF(parsedSections: any[] = []): Record<UCFSectionId, any[]> {
  const out: Record<UCFSectionId, any[]> = { A:[],B:[],C:[],D:[],E:[],F:[],G:[],H:[],I:[],J:[],K:[],L:[],M:[] }
  for (const s of parsedSections) {
    const rawType = (s.type || '').toString()
    const type = rawType.toLowerCase()
    const raw = typeof s.content === 'string' ? s.content : JSON.stringify(s.content||'')

    let id: UCFSectionId | null = null
    // Exact/strong signals by type label first
    const t = rawType.trim().toUpperCase()
    if (['PRICING','PRICE','PRICES','SUPPLIES','SERVICES','CLINS','CLIN','BILL OF MATERIALS'].some(x => t.includes(x))) id = 'B'
    else if (['SOW','STATEMENT OF WORK','SPECIFICATIONS','PWS','PERFORMANCE WORK STATEMENT','SOO','STATEMENT OF OBJECTIVES'].some(x => t.includes(x))) id = 'C'
    else if (['PACKAGING','MARKING'].some(x => t.includes(x))) id = 'D'
    else if (['INSPECTION','ACCEPTANCE','QA'].some(x => t.includes(x))) id = 'E'
    else if (['DELIVERY','DELIVERIES','PERFORMANCE','SCHEDULE','TIMELINE','POP','PERIOD OF PERFORMANCE'].some(x => t.includes(x))) id = 'F'
    else if (['ADMIN','ADMINISTRATIVE','INVOICING','CONTRACT ADMINISTRATION'].some(x => t.includes(x))) id = 'G'
    else if (['SPECIAL REQUIREMENTS','SPECIAL CONTRACT REQUIREMENTS','SECURITY'].some(x => t.includes(x))) id = 'H'
    else if (['CLAUSES','FAR','DFARS','AGENCY CLAUSES'].some(x => t.includes(x))) id = 'I'
    else if (['ATTACHMENT','ATTACHMENTS','EXHIBIT','EXHIBITS','APPENDIX'].some(x => t.includes(x))) id = 'J'
    else if (['REPRESENTATIONS','REPS','CERTIFICATIONS','REPS & CERTS'].some(x => t.includes(x))) id = 'K'
    else if (['INSTRUCTIONS','INSTRUCTION TO OFFERORS','PROPOSAL INSTRUCTIONS','SUBMISSION','FORMAT'].some(x => t.includes(x))) id = 'L'
    else if (['EVALUATION','EVALUATION FACTORS','BASIS OF AWARD','BEST VALUE','LPTA','LOWEST PRICE'].some(x => t.includes(x))) id = 'M'
    else if (['SOLICITATION','OVERVIEW','GENERAL','BACKGROUND'].some(x => t.includes(x))) id = 'A'
    // Fallback to content-based
    if (!id && (textContains(type, 'pricing', 'price', 'supplies', 'services', 'clin') || textContains(raw, 'pricing', 'clin', 'supplies or services'))) id = 'B'
    else if (!id && (textContains(type, 'sow', 'statement of work', 'specification') || textContains(raw, 'statement of work', 'specification'))) id = 'C'
    else if (!id && (textContains(type, 'packaging') || textContains(raw, 'packaging', 'marking'))) id = 'D'
    else if (!id && (textContains(type, 'inspection') || textContains(raw, 'inspection', 'acceptance'))) id = 'E'
    else if (!id && (textContains(type, 'delivery', 'performance', 'timeline', 'schedule') || textContains(raw, 'deliveries', 'period of performance', 'timeline'))) id = 'F'
    else if (!id && (textContains(type, 'administration') || textContains(raw, 'invoic', 'contract administration'))) id = 'G'
    else if (!id && (textContains(type, 'special') || textContains(raw, 'special contract requirements'))) id = 'H'
    else if (!id && (textContains(type, 'clauses') || textContains(raw, 'far ', 'clause'))) id = 'I'
    else if (!id && (textContains(type, 'attachment', 'exhibit') || textContains(raw, 'attachment', 'exhibit'))) id = 'J'
    else if (!id && (textContains(type, 'representations', 'certifications') || textContains(raw, 'representations', 'certifications'))) id = 'K'
    else if (!id && (textContains(type, 'instructions') || textContains(raw, 'instructions to offerors', 'proposal format', 'submission'))) id = 'L'
    else if (!id && (textContains(type, 'evaluation') || textContains(raw, 'evaluation factors', 'best value', 'lowest price'))) id = 'M'
    else if (!id && (textContains(type, 'solicitation') || textContains(raw, 'solicitation number', 'general background'))) id = 'A'

    if (id) out[id].push(s)
    else out.J.push(s) // default to attachments/misc
  }
  return out
}
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "absolute"
    textArea.style.opacity = "0"
    document.body.appendChild(textArea)
    textArea.select()
    return new Promise<void>((resolve, reject) => {
      document.execCommand("copy") ? resolve() : reject()
      document.body.removeChild(textArea)
    })
  }
}

// Enhanced glassmorphism object with all color variants
export const glassmorphism = {
  primary: "glass-card",
  secondary: "glass-card-subtle", 
  subtle: "glass-card-subtle",
  strong: "glass-card",
  interactive: "glass-card hover:glass-card-subtle transition-all duration-200",
  // Color variants for different states
  blue: "glass-card border-primary/20 bg-primary/5",
  green: "glass-card border-success-300/20 bg-success-50/30",
  orange: "glass-card border-warning-300/20 bg-warning-50/30",
  red: "glass-card border-error-300/20 bg-error-50/30",
  purple: "glass-card border-purple-300/20 bg-purple-50/30",
  gray: "glass-card border-gray-300/20 bg-gray-50/30",
}

export const gradients = {
  primary: "bg-gradient-to-br from-primary-50 to-primary-100",
  secondary: "bg-gradient-to-br from-secondary-50 to-secondary-100", 
  neutral: "bg-gradient-to-br from-gray-50 to-gray-100",
}

// Progress utilities for backward compatibility
export function calculateProgress(completed: number, total: number): number {
  return Math.round((completed / total) * 100)
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "text-success-500"
  if (percentage >= 75) return "text-primary-500"
  if (percentage >= 50) return "text-warning-500"
  if (percentage >= 25) return "text-orange-500"
  return "text-error-500"
}

export function getProgressRingColor(percentage: number): string {
  if (percentage >= 90) return "stroke-success-500"
  if (percentage >= 75) return "stroke-primary-500"
  if (percentage >= 50) return "stroke-warning-500"
  if (percentage >= 25) return "stroke-orange-500"
  return "stroke-error-500"
}

export function generateProgressPath(percentage: number, radius: number = 45): string {
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  return `${circumference} ${strokeDashoffset}`
}

export function getPhaseStatus(readiness: number, phaseMinimum: number): 'locked' | 'available' | 'in-progress' | 'complete' {
  if (readiness < phaseMinimum - 15) return 'locked'
  if (readiness < phaseMinimum) return 'available'
  if (readiness < phaseMinimum + 25) return 'in-progress'
  return 'complete'
} 