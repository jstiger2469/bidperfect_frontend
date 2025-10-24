"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useActiveCompanyId } from '@/lib/tenant'

export default function CompaniesIndexPage() {
  const router = useRouter()
  const { companyId, isLoadingCompany } = useActiveCompanyId()

  React.useEffect(() => {
    if (companyId) {
      router.replace(`/company/${companyId}`)
    } else if (!isLoadingCompany) {
      // No linked company → send to onboarding flow
      router.replace('/onboarding')
    }
  }, [companyId, isLoadingCompany])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Redirecting to your Company Hub…
    </div>
  )
}