'use client'

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api'

export default function AuthTokenBridge() {
  const { getToken } = useAuth()
  const debug = process.env.NEXT_PUBLIC_DEBUG_API === '1'

  React.useEffect(() => {
    apiClient.setAuthTokenProvider(async () => {
      try {
        const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'
        const t = await getToken?.({ template, skipCache: true })
        if (debug) console.info('[auth-bridge] getToken', { template, present: Boolean(t), len: t?.length })
        return t || null
      } catch (e) {
        if (debug) console.error('[auth-bridge] getToken error', e)
        return null
      }
    })
  }, [getToken])

  return null
}


