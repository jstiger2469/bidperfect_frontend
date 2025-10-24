'use client'

import React from 'react'
import { useOrganizationList, useOrganization, useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/api'

export default function ActiveOrgEnsurer() {
  const { isSignedIn } = useUser()
  const orgListResult = useOrganizationList()
  const { organization } = useOrganization()
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1'
  const bootstrappingRef = React.useRef(false)
  
  // Extract properties safely
  const isLoaded = orgListResult.isLoaded
  const setActive = orgListResult.setActive
  const organizationList = 'userMemberships' in orgListResult 
    ? orgListResult.userMemberships.data 
    : undefined

  // NOTE: Org creation moved to ORG_CHOICE onboarding step (Phase 2 of Option 2)
  // This component now ONLY sets active org if one exists, doesn't create new ones
  React.useEffect(() => {
    const state = {
      isSignedIn,
      isLoaded,
      hasOrganization: !!organization,
      organizationId: organization?.id,
      organizationListCount: organizationList?.length || 0,
      firstOrgId: organizationList?.[0]?.organization?.id,
      firstOrgName: organizationList?.[0]?.organization?.name,
    }
    console.log('[ActiveOrgEnsurer] 🔍 State check:', state)
    
    if (!isSignedIn) {
      console.log('[ActiveOrgEnsurer] ⚠️ Not signed in, skipping')
      return
    }
    if (!isLoaded) {
      console.log('[ActiveOrgEnsurer] ⏳ Not loaded yet, waiting...')
      return
    }
    if (organization) {
      console.log('[ActiveOrgEnsurer] ✅ Active org confirmed:', {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      })
      return // Already have active org
    }
    
    // Set first available org as active (if any exist)
    const first = organizationList?.[0]?.organization
    if (first?.id) {
      console.log('[ActiveOrgEnsurer] 🔄 Setting active org:', {
        id: first.id,
        name: first.name,
        slug: first.slug,
      })
      setActive?.({ organization: first.id })
        .then(() => {
          console.log('[ActiveOrgEnsurer] ✅ setActive SUCCESS for:', first.id)
        })
        .catch((err) => {
          console.error('[ActiveOrgEnsurer] ❌ setActive FAILED:', err)
        })
      return
    }
    
    // No org exists - user will create one during onboarding
    console.log('[ActiveOrgEnsurer] ⚠️ No org found in organizationList - user needs to create one')
  }, [isSignedIn, isLoaded, organization, organizationList, setActive])

  // Ensure backend tenant bootstrap (org -> company link)
  const bootstrappedOrgRef = React.useRef<string | null>(null)
  
  React.useEffect(() => {
    if (!isSignedIn) return
    if (!isLoaded) return
    if (!organization?.id) {
      console.log('[ActiveOrgEnsurer] ⚠️ No active org for bootstrap, bootstrap skipped')
      return
    }
    // Check if we've already bootstrapped this specific org
    if (bootstrappedOrgRef.current === organization.id) {
      console.log('[ActiveOrgEnsurer] Already bootstrapped:', organization.id)
      return
    }
    if (bootstrappingRef.current) {
      console.log('[ActiveOrgEnsurer] Bootstrap already in progress')
      return
    }
    
    console.log('[ActiveOrgEnsurer] 🚀 Starting bootstrap for org:', organization.id)
    bootstrappingRef.current = true
    ;(async () => {
      try {
        const legalName = organization?.name || ''
        await apiClient.bootstrapTenant({ legalName })
        // Mark this org as bootstrapped
        bootstrappedOrgRef.current = organization.id
        console.log('[ActiveOrgEnsurer] ✅ Bootstrap tenant success:', organization.id)
      } catch (e) {
        console.error('[ActiveOrgEnsurer] ❌ Bootstrap tenant failed:', e)
      } finally {
        bootstrappingRef.current = false
      }
    })()
  }, [isSignedIn, isLoaded, organization?.id, organization?.name, debug])

  return null
}


