'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCompany } from '@/lib/hooks'
import { useActiveCompanyId } from '@/lib/tenant'
import { Building2 } from 'lucide-react'

export default function GlobalCompanyBar() {
  const pathname = usePathname()
  const showBar = !(pathname?.startsWith('/onboarding'))
  const { companyId } = useActiveCompanyId()
  const { data: company } = useCompany(companyId || '')

  if (!showBar) return null

  return (
    <div className="w-full border-b border-white/50 bg-white/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-800">
          <Building2 className="w-4 h-4" />
          <span className="font-medium">{company?.legalName || (companyId ? companyId : 'No Company')}</span>
          {companyId && (
            <Link href={`/company/${companyId}`} className="ml-3 text-blue-600 hover:underline">Open Dashboard</Link>
          )}
        </div>
      </div>
    </div>
  )
}


