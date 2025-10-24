'use client'

import React from 'react'
import { useCompany, useCompanyCerts, useCompanyRateCards, useCompanyDocuments, useCompanyStaff, useCompanyLicenses, useCompanyInsurance, useCompanyBonding, useOpportunities } from '@/lib/hooks'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import ActivityFeed from '@/components/ActivityFeed'
import SideDrawer from '@/components/SideDrawer'
import FileUploadZone from '@/components/FileUploadZone'
import TagInput from '@/components/TagInput'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import ProgressRing from '@/components/ProgressRing'
import { computeCompanyReadiness, RECOMMENDED_DOCS } from '@/lib/companyReadiness'

export default function CompanyOverviewPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const company = useCompany(companyId)
  const certs = useCompanyCerts(companyId)
  const rates = useCompanyRateCards(companyId)
  const docs = useCompanyDocuments(companyId)
  const staff = useCompanyStaff(companyId)
  const licenses = useCompanyLicenses(companyId)
  const insurance = useCompanyInsurance(companyId)
  const bonding = useCompanyBonding(companyId)
  const opportunities = useOpportunities({})

  const readinessData = React.useMemo(() => {
    return computeCompanyReadiness({
      company: company.data,
      documents: (docs.data as any)?.items,
      staff: (staff.data as any)?.items,
      insurance: insurance.data as any,
      licenses: licenses.data as any,
      certifications: certs.data as any,
      bonding: bonding.data as any,
    })
  }, [company.data, docs.data, staff.data, insurance.data, licenses.data, certs.data, bonding.data])

  const readiness = readinessData.score

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [drawerView, setDrawerView] = React.useState<'staff' | 'document' | 'rfp' | 'none'>('none')
  const openDrawer = (view: typeof drawerView) => { setDrawerView(view); setDrawerOpen(true) }
  const [docType, setDocType] = React.useState('')
  const [docTags, setDocTags] = React.useState<string[]>([])
  const onUploadHubDocs = async (items: any[]) => {
    if (!companyId) return
    for (const it of items) {
      try {
        const fd = new FormData(); fd.append('file', it.file)
        const res = await apiClient.uploadFile(fd)
        await fetch('/api/company-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, document: {
            type: docType || undefined,
            tags: docTags.length ? docTags : undefined,
            files: [{ fileId: res.fileId, name: it.file.name }],
          } }),
        })
      } catch {}
    }
    setDrawerOpen(false)
    setDocType('')
    setDocTags([])
  }

  // Remove section-level collapses per request; keep cards static

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Company Hub</h1>
        <p className="text-gray-600">Centralized company management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="group">
          <CardHeader><CardTitle>Compliance Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <ProgressRing percentage={readiness} size="lg" />
                <div>
                  <div className="text-xl font-semibold">{readiness}% Ready</div>
                  <div className="text-xs text-gray-600">{readinessData.breakdown.filter(b => !b.completed).length} items remaining</div>
                </div>
              </div>
              <Link href={`/company/${companyId}/eligibility`}>
                <Button size="sm" variant="glass">View Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="group">
          <CardHeader><CardTitle>Staff</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 mb-3">{(staff.data as any)?.items?.length || 0} Filled</div>
            <div className="flex gap-2">
              <Link href={`/company/${companyId}/staff`}>
                <Button size="sm" variant="glass">Edit Roles</Button>
              </Link>
              <Button size="sm" variant="default" onClick={() => openDrawer('staff')}>Add Staff</Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="group">
          <CardHeader><CardTitle>Docs Expiring Soon</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {(() => {
                const soon = [
                  ...((licenses.data || []) as any[]).map((x) => ({ label: x.type || 'License', expires: x.expires })),
                  ...((insurance.data || []) as any[]).map((x) => ({ label: x.type || 'Policy', expires: x.expires })),
                ]
                .filter(x => x.expires)
                .sort((a,b) => new Date(a.expires).getTime() - new Date(b.expires).getTime())
                .slice(0, 3)
                if (soon.length === 0) return <div className="text-gray-500">No upcoming expirations</div>
                return soon.map((x, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>{x.label}</span>
                    <span className="text-xs text-gray-600">{new Date(x.expires).toLocaleDateString()}</span>
                  </div>
                ))
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="md:col-span-2">
          <CardHeader><CardTitle>Recommended Documents</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 divide-y">
              {RECOMMENDED_DOCS.map((rec) => {
                const status = readinessData.breakdown.find(b => b.key === rec.key)
                const done = Boolean(status?.completed)
                return (
                  <div key={rec.key} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{rec.label}</div>
                      {rec.description ? (<div className="text-xs text-gray-600">{rec.description}</div>) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {done ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Completed</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setDocType(rec.docType || rec.label); setDocTags(rec.tags || []); openDrawer('document') }}>
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <ActivityFeed title="Company Activity" scope={{ companyId }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="md:col-span-2">
          <CardHeader><CardTitle>Staff & Roles</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700">
              <div className="grid grid-cols-[1fr,1fr] gap-2">
                {(((staff.data as any)?.items || []) as any[]).slice(0,5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span>{s.name}</span>
                    <span className="text-gray-600">{(s.roles || [])[0] || 'Unassigned'}</span>
                  </div>
                ))}
                {(((staff.data as any)?.items || []) as any[]).length === 0 && (
                  <div className="text-gray-500">No staff yet</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader><CardTitle>Active RFPs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {((opportunities.data?.items || []) as any[]).slice(0,3).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between">
                  <span className="truncate max-w-[12rem]">{o.title}</span>
                  <span className="text-xs text-gray-600">{o.agency}</span>
                </div>
              ))}
              {((opportunities.data?.items || []) as any[]).length === 0 && (
                <div className="text-gray-500">No active RFPs</div>
              )}
              <div className="pt-2">
                <Button size="sm" variant="default" onClick={() => openDrawer('rfp')}>Add RFP</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" className="md:col-span-2">
          <CardHeader><CardTitle>Spirit Compliance Assistant</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700">
              You might be missing signatures for onboarding docs. Upload or request documents to reach 100% readiness.
              <div className="mt-3">
                <Link href={`/company/${companyId}/documents`}>
                  <Button size="sm" variant="glass">Upload Document</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rate Cards</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700">{(rates.data || []).length} cards</div>
          </CardContent>
        </Card>
      </div>

      <Card variant="glass" className="group">
        <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {(((docs.data as any)?.items || []) as any[]).slice(0,5).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between">
                <span className="truncate max-w-[16rem]">{d.name || d.documentType || 'Document'}</span>
                <span className="text-xs text-gray-600">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
            {(((docs.data as any)?.items || []) as any[]).length === 0 && (
              <div className="text-gray-500">No documents yet</div>
            )}
            <div className="pt-2">
              <Button size="sm" variant="default" onClick={() => openDrawer('document')}>Upload Document</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass" className="md:col-span-2 group">
        <CardHeader><CardTitle>Expiring Soon</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-2">Licenses</div>
              <div className="space-y-1">
                {((licenses.data || []).filter((lic: any) => {
                  const days = lic.expires ? Math.ceil((new Date(lic.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                  return days <= 60
                }).slice(0, 5)).map((lic: any) => (
                  <div key={lic.id} className="flex items-center justify-between">
                    <span>{lic.type} · {lic.number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expiring</span>
                  </div>
                ))}
                {((licenses.data || []).filter((lic: any) => {
                  const days = lic.expires ? Math.ceil((new Date(lic.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                  return days <= 60
                }).length === 0) && <div className="text-xs text-gray-500">No items</div>}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Insurance</div>
              <div className="space-y-1">
                {((insurance.data || []).filter((p: any) => {
                  const days = p.expires ? Math.ceil((new Date(p.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                  return days <= 60
                }).slice(0, 5)).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span>{p.type} · {p.provider}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expiring</span>
                  </div>
                ))}
                {((insurance.data || []).filter((p: any) => {
                  const days = p.expires ? Math.ceil((new Date(p.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                  return days <= 60
                }).length === 0) && <div className="text-xs text-gray-500">No items</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerView === 'staff' ? 'Add Staff Member' : drawerView === 'document' ? 'Upload Document' : drawerView === 'rfp' ? 'Add RFP' : ''}
        description={drawerView === 'staff' ? 'Create a staff record and assign roles' : drawerView === 'document' ? 'Attach files and tag appropriately' : drawerView === 'rfp' ? 'Track an active opportunity' : ''}
        widthClassName="max-w-xl"
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>,
          <Button key="save" variant="frosted" onClick={() => setDrawerOpen(false)}>Save</Button>,
        ]}
      >
        {drawerView === 'staff' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">Name</label>
            <Input placeholder="Full name" />
            <label className="text-sm font-medium text-gray-800">Email</label>
            <Input placeholder="name@company.com" />
            <label className="text-sm font-medium text-gray-800">Role</label>
            <Input placeholder="e.g., Project Manager" />
          </div>
        )}
        {drawerView === 'document' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Type</label>
              <Input placeholder="e.g., COI, W-9" value={docType} onChange={(e) => setDocType(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Tags</label>
              <TagInput label="" placeholder="Add tags" value={docTags} onChange={setDocTags} suggestions={['insurance','policy','w9','coi','bonding','license']} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Files</label>
              <FileUploadZone onFilesSelected={() => {}} onUpload={onUploadHubDocs} maxFiles={12} acceptedTypes={[ '.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx' ]} />
            </div>
          </div>
        )}
        {drawerView === 'rfp' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">Title</label>
            <Input placeholder="Opportunity title" />
            <label className="text-sm font-medium text-gray-800">Agency</label>
            <Input placeholder="Agency" />
            <label className="text-sm font-medium text-gray-800">Due Date</label>
            <Input type="date" />
          </div>
        )}
      </SideDrawer>
    </div>
  )
}




