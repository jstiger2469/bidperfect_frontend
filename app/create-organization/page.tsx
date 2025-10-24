'use client'

import React from 'react'
import { CreateOrganization } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateOrganizationPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white grid place-content-center font-bold text-sm shadow-md">
              BP
            </div>
            <span className="font-bold text-lg text-slate-900">BidPerfect</span>
          </Link>
        </div>
      </header>

      {/* Main Content - Perfectly Centered */}
      <div className="flex-1 grid place-items-center px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Organization
            </h1>
            <p className="text-slate-600">
              Set up a new organization to manage your contracting workflow
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex justify-center">
              <CreateOrganization
              afterCreateOrganizationUrl={redirectUrl}
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "shadow-none border-0 p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-semibold shadow-md hover:shadow-lg transition-all",
                  formFieldInput: "h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
                  formFieldLabel: "text-slate-700 font-medium text-sm",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
                },
                variables: {
                  colorPrimary: "#2563eb",
                  colorSuccess: "#10b981",
                  colorDanger: "#ef4444",
                  colorWarning: "#f59e0b",
                  colorTextOnPrimaryBackground: "#ffffff",
                  colorBackground: "#ffffff",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#0f172a",
                  borderRadius: "0.5rem",
                  fontFamily: "inherit",
                }
              }}
            />
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <Link 
              href="/select-organization" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to organization selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

