import React from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import GlobalSidebar from '@/components/GlobalSidebar'
import AuthTokenBridge from '@/components/AuthTokenBridge'
import ActiveOrgEnsurer from '@/components/ActiveOrgEnsurer'

export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <SignedIn>
        <AuthTokenBridge />
        <ActiveOrgEnsurer />
        <GlobalSidebar />
        <div className="md:pl-64">
          <div className="max-w-6xl mx-auto px-6 py-6">
            {children}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  )
}


