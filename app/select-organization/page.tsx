'use client'

import React from 'react'
import { OrganizationSwitcher, useOrganizationList } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SelectOrganizationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding'
  const { organizationList, setActive } = useOrganizationList()

  const handleSelectOrganization = async (orgId: string) => {
    if (setActive) {
      await setActive({ organization: orgId })
      router.push(redirectUrl)
    }
  }

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

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Select Your Organization
            </h1>
            <p className="text-slate-600">
              Choose an organization to continue, or create a new one.
            </p>
          </div>

          <Card className="shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle>Your Organizations</CardTitle>
              <CardDescription>
                Select an organization to manage your government contracting workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Organization List */}
              {organizationList && organizationList.length > 0 ? (
                <div className="space-y-3">
                  {organizationList.map((org) => (
                    <button
                      key={org.organization.id}
                      onClick={() => handleSelectOrganization(org.organization.id)}
                      className="w-full p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm">
                            {org.organization.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {org.organization.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {org.membership.role}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>You don't have any organizations yet.</p>
                  <p className="text-sm mt-1">Create one to get started.</p>
                </div>
              )}

              {/* Clerk Organization Switcher (for creating new orgs) */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center">
                  <OrganizationSwitcher
                    hidePersonal
                    afterCreateOrganizationUrl={redirectUrl}
                    afterSelectOrganizationUrl={redirectUrl}
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        organizationSwitcherTrigger: 
                          "w-full justify-center px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all",
                        organizationSwitcherTriggerIcon: "text-blue-600",
                        userPreviewTextContainer: "text-slate-700",
                      }
                    }}
                  />
                </div>
              </div>

              {/* Alternative: Manual create button */}
              <Link href="/create-organization">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" />
                  Create New Organization
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Organizations help you manage separate companies or teams.{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

