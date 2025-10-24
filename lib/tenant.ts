'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth, useOrganization } from '@clerk/nextjs'
import { apiClient } from '@/lib/api'

export function useActiveCompanyId() {
  const pathname = usePathname()
  const onOnboarding = pathname?.startsWith('/onboarding')
  const [companyId, setCompanyId] = React.useState<string>('')
  const [isLoadingCompany, setIsLoadingCompany] = React.useState<boolean>(true)
  const { getToken } = useAuth()
  const { organization } = useOrganization()

  // Attach token provider to api client once
  React.useEffect(() => {
    apiClient.setAuthTokenProvider(async () => {
      try {
        return (
          await getToken?.({ template: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend', skipCache: true })
        ) || null
      } catch { return null }
    })
  }, [getToken])

  // Resolve org -> company via backend mapping
  React.useEffect(() => {
    const resolve = async () => {
      setIsLoadingCompany(true)
      if (onOnboarding) {
        setCompanyId('')
        setIsLoadingCompany(false)
        return
      }
      const orgId = organization?.id
      if (!orgId) {
        setCompanyId('')
        try { localStorage.removeItem('activeCompanyId') } catch {}
        setIsLoadingCompany(false)
        return
      }
      try {
        const res = await apiClient.getCompanyByOrg(orgId)
        if (res?.companyId) {
          setCompanyId(res.companyId)
          try { localStorage.setItem('activeCompanyId', res.companyId) } catch {}
        } else {
          setCompanyId('')
          try { localStorage.removeItem('activeCompanyId') } catch {}
        }
      } catch {
        // fallback to any stored company id to avoid blocking UI
        const stored = typeof window !== 'undefined' ? localStorage.getItem('activeCompanyId') : null
        if (stored) setCompanyId(stored)
      }
      setIsLoadingCompany(false)
    }
    resolve()
  }, [organization?.id, onOnboarding])

  const setActiveCompanyId = (id: string) => {
    setCompanyId(id)
    try { localStorage.setItem('activeCompanyId', id) } catch {}
  }

  return { companyId, isLoadingCompany, setActiveCompanyId }
}


