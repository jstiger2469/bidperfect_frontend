'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, BadgeCheck, FileText, Upload, Shield, Info } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompany, useUpdateCompany, useCompanyDocuments, useCompanyStaff, useCompanyLicenses, useCompanyInsurance, useCompanyCerts, useCompanyBonding, useCreateCompanyInsurance, useUpsertCompanyBonding, useCreateCompanyLicense, useUpdateCompanyInsurance, useDeleteCompanyInsurance, useUpdateCompanyLicense, useDeleteCompanyLicense, useCreateCertification, useUpdateCertification, useVerifyCertification } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import ProgressRing from '@/components/ProgressRing'
import UploadField, { type Attachment } from '@/components/UploadField'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Dialog from '@radix-ui/react-dialog'
import { computeCompanyReadiness } from '@/lib/companyReadiness'

const profileSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  uei: z.string().optional(),
  cage: z.string().optional(),
  ein: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional().transform(v => v || undefined),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function CompanyProfilePage({ params }: { params: Promise<{ companyId: string }> }) {
  const router = useRouter()
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const company = useCompany(companyId)
  const updateCompany = useUpdateCompany()
  const docs = useCompanyDocuments(companyId)
  const staff = useCompanyStaff(companyId)
  const licenses = useCompanyLicenses(companyId)
  const insurance = useCompanyInsurance(companyId)
  const certs = useCompanyCerts(companyId)
  const bonding = useCompanyBonding(companyId)
  const [syncing, setSyncing] = React.useState(false)
  const [quickDocType, setQuickDocType] = React.useState('')
  const [quickDocTags, setQuickDocTags] = React.useState<string>('')
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const createInsurance = useCreateCompanyInsurance()
  const updateInsurance = useUpdateCompanyInsurance()
  const deleteInsurance = useDeleteCompanyInsurance()
  const upsertBonding = useUpsertCompanyBonding()
  const createLicense = useCreateCompanyLicense()
  const updateLicense = useUpdateCompanyLicense()
  const deleteLicense = useDeleteCompanyLicense()
  const createCert = useCreateCertification()
  const updateCert = useUpdateCertification()
  const verifyCert = useVerifyCertification()
  const [insType, setInsType] = React.useState('')
  const [insCarrier, setInsCarrier] = React.useState('')
  const [insPolicyNumber, setInsPolicyNumber] = React.useState('')
  const [insExpires, setInsExpires] = React.useState('')
  const [editingPolicy, setEditingPolicy] = React.useState<any | null>(null)
  const [editInsOpen, setEditInsOpen] = React.useState(false)
  const [eInsType, setEInsType] = React.useState('')
  const [eInsCarrier, setEInsCarrier] = React.useState('')
  const [eInsPolicyNumber, setEInsPolicyNumber] = React.useState('')
  const [eInsExpires, setEInsExpires] = React.useState('')
  const [bondSurety, setBondSurety] = React.useState('')
  const [bondSingleLimit, setBondSingleLimit] = React.useState('')
  const [bondAggregateLimit, setBondAggregateLimit] = React.useState('')
  const [licState, setLicState] = React.useState('')
  const [licClassification, setLicClassification] = React.useState('')
  const [licNumber, setLicNumber] = React.useState('')
  const [licExpires, setLicExpires] = React.useState('')
  const [editingLicense, setEditingLicense] = React.useState<any | null>(null)
  const [editLicOpen, setEditLicOpen] = React.useState(false)
  const [eLicState, setELicState] = React.useState('')
  const [eLicClassification, setELicClassification] = React.useState('')
  const [eLicNumber, setELicNumber] = React.useState('')
  const [eLicExpires, setELicExpires] = React.useState('')
  const [certOpen, setCertOpen] = React.useState(false)
  const [certType, setCertType] = React.useState('')
  const [certStatus, setCertStatus] = React.useState('Active')
  const [certFiles, setCertFiles] = React.useState<Attachment[]>([])
  const [editingCert, setEditingCert] = React.useState<any | null>(null)
  const [editCertOpen, setEditCertOpen] = React.useState(false)
  const [eCertType, setECertType] = React.useState('')
  const [eCertStatus, setECertStatus] = React.useState('Active')
  const [eCertFiles, setECertFiles] = React.useState<Attachment[]>([])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      legalName: '', dba: '', uei: '', cage: '', ein: '', website: '',
      addressLine1: '', addressLine2: '', city: '', state: '', postalCode: ''
    }
  })

  React.useEffect(() => {
    if (company.data) {
      const a = company.data.address || {}
      form.reset({
        legalName: company.data.legalName || '',
        dba: company.data.dba || '',
        uei: company.data.uei || '',
        cage: company.data.cage || '',
        ein: company.data.ein || '',
        website: company.data.website || '',
        addressLine1: a.addressLine1 || a.line1 || '',
        addressLine2: a.addressLine2 || a.line2 || '',
        city: a.city || '',
        state: a.state || '',
        postalCode: a.postalCode || a.zip || ''
      })
    }
  }, [company.data])

  const onSubmit = async (values: ProfileFormValues) => {
    if (!companyId) return
    const data: any = {
      legalName: values.legalName,
      name: values.dba || undefined,
      website: values.website,
      uei: values.uei,
      cage: values.cage,
      ein: values.ein,
      address: {
        line1: values.addressLine1,
        line2: values.addressLine2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
      }
    }
    try {
      const resp = await fetch('/api/company-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, data })
      })
      if (!resp.ok) throw new Error(await resp.text())
      toast.success('Company profile saved')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile')
    }
  }

  async function handleSyncSam() {
    if (!companyId) return
    try {
      setSyncing(true)
      const res = await apiClient.syncCompanySam(companyId)
      if (res?.synced) toast.success(`SAM synced: ${res.samStatus}`)
      else toast('Sync requested', { icon: '⏳' } as any)
    } catch (e: any) {
      toast.error(e?.message || 'SAM sync failed')
    } finally {
      setSyncing(false)
    }
  }

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

  async function handleQuickUpload() {
    if (!companyId || attachments.length === 0) return
    try {
      for (const a of attachments) {
        await fetch('/api/company-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, document: {
            type: quickDocType || undefined,
            tags: quickDocTags ? quickDocTags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            files: [{ fileId: a.fileId, name: a.name }],
          } }),
        })
      }
      toast.success('Document(s) uploaded')
      setAttachments([])
      setQuickDocType('')
      setQuickDocTags('')
      docs.refetch?.()
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Company Profile{company.data?.legalName ? ` · ${company.data.legalName}` : ''}</h1>
          <p className="text-gray-600 mt-2">Manage identity, registrations, and headquarters info</p>
        </div>

        {company.isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading…</div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card variant="glass-tinted" padding="lg" className="border-white/50 ring-1 ring-white/40">
                <CardHeader>
                  <CardTitle>Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-800">Legal Name</label>
                        <Tooltip.Provider delayDuration={200}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button type="button" className="text-gray-500">
                                <Info className="w-4 h-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow">
                              Registered entity name as it appears on legal documents.
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <Input {...form.register('legalName')} />
                      {form.formState.errors.legalName && (
                        <p className="text-xs text-red-600 mt-1">{form.formState.errors.legalName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-800">DBA (optional)</label>
                      <Input {...form.register('dba')} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-800">Website</label>
                    <Input placeholder="https://example.com" {...form.register('website')} />
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass-tinted" padding="lg" className="border-white/50 ring-1 ring-white/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Government Registrations</CardTitle>
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button size="sm" variant="outline">Update</Button>
                      </Dialog.Trigger>
                      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                          <div className="text-lg font-semibold mb-4">Submit Registrations</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="UEI" {...form.register('uei')} />
                            <Input placeholder="CAGE" {...form.register('cage')} />
                            <Input placeholder="EIN" {...form.register('ein')} />
                            <Input placeholder="DUNS (optional)" {...form.register('duns' as any)} />
                          </div>
                          <div className="mt-4 flex items-center gap-2 justify-end">
                            <Dialog.Close asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
                            </Dialog.Close>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-800">UEI</label>
                        <Tooltip.Provider delayDuration={200}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button type="button" className="text-gray-500">
                                <Info className="w-4 h-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow">
                              Unique Entity Identifier from SAM.gov
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <Input {...form.register('uei')} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-800">CAGE</label>
                        <Tooltip.Provider delayDuration={200}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button type="button" className="text-gray-500">
                                <Info className="w-4 h-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow">
                              Commercial and Government Entity code.
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <Input {...form.register('cage')} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-800">EIN</label>
                        <Tooltip.Provider delayDuration={200}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button type="button" className="text-gray-500">
                                <Info className="w-4 h-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow">
                              Employer Identification Number.
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <Input {...form.register('ein')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-800">DUNS</label>
                      <Input placeholder="(optional)" {...form.register('duns' as any)} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">Keep UEI/CAGE in sync with SAM to ensure eligibility.</div>
                </CardContent>
              </Card>

              <Card variant="glass-tinted" padding="lg" className="border-white/50 ring-1 ring-white/40">
                <CardHeader>
                  <CardTitle>Headquarters Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-800">Address Line 1</label>
                      <Input {...form.register('addressLine1')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-800">Address Line 2</label>
                      <Input {...form.register('addressLine2')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-800">City</label>
                      <Input {...form.register('city')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-800">State</label>
                      <Input {...form.register('state')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-800">Postal Code</label>
                      <Input {...form.register('postalCode')} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="glass" className="sticky top-24">
                <CardHeader>
                  <CardTitle>Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4">
                    <ProgressRing percentage={readinessData.score} size="lg" />
                    <div>
                      <div className="text-xl font-semibold">{readinessData.score}% Ready</div>
                      <div className="text-xs text-gray-600">{readinessData.breakdown.filter(b => !b.completed).length} items remaining</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="sticky top-24">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" size="lg" className="w-full" variant="frosted" disabled={updateCompany.isPending}>
                    {updateCompany.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button type="button" className="w-full" variant="glass" onClick={handleSyncSam} disabled={syncing}>
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Sync SAM</span>
                  </Button>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Quick Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <Input placeholder="Document Type (e.g., W-9, COI, Resume)" value={quickDocType} onChange={(e) => setQuickDocType(e.target.value)} />
                    <Input placeholder="Tags (comma separated)" value={quickDocTags} onChange={(e) => setQuickDocTags(e.target.value)} />
                    <UploadField
                      label="Attachments"
                      description="Drag and drop files here"
                      value={attachments}
                      onChange={setAttachments}
                      accept={[ '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png' ]}
                      maxFiles={10}
                      maxSizeMb={50}
                    />
                    <Button onClick={handleQuickUpload} disabled={attachments.length === 0}>Upload</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Insurance</CardTitle>
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button size="sm" variant="outline">Add Policy</Button>
                      </Dialog.Trigger>
                      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                          <div className="text-lg font-semibold mb-4">Add Insurance Policy</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="Type (e.g., General Liability)" value={insType} onChange={(e) => setInsType(e.target.value)} />
                            <Input placeholder="Carrier" value={insCarrier} onChange={(e) => setInsCarrier(e.target.value)} />
                            <Input placeholder="Policy #" value={insPolicyNumber} onChange={(e) => setInsPolicyNumber(e.target.value)} />
                            <Input placeholder="Expires (YYYY-MM-DD)" value={insExpires} onChange={(e) => setInsExpires(e.target.value)} />
                          </div>
                          <div className="mt-4 flex items-center gap-2 justify-end">
                            <Dialog.Close asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <Button onClick={() => {
                                if (!companyId) return
                                createInsurance.mutate(
                                  { companyId, data: { type: insType, carrier: insCarrier, policyNumber: insPolicyNumber, expires: insExpires } },
                                  { onSuccess: () => { toast.success('Policy added'); setInsType(''); setInsCarrier(''); setInsPolicyNumber(''); setInsExpires('') }, onError: (e: any) => toast.error(e?.message || 'Failed to add policy') }
                                )
                              }}>Save</Button>
                            </Dialog.Close>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(insurance.data || []).slice(0, 3).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2">
                        <div>
                          <div className="font-medium text-gray-900">{p.type || 'Policy'} · {p.carrier || ''}</div>
                          <div className="text-xs text-gray-600">Expires: {p.expires || '—'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingPolicy(p)
                            setEInsType(p.type || '')
                            setEInsCarrier(p.carrier || '')
                            setEInsPolicyNumber(p.policyNumber || '')
                            setEInsExpires(p.expires || '')
                            setEditInsOpen(true)
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            if (!companyId) return
                            deleteInsurance.mutate(
                              { companyId, polId: p.id },
                              { onSuccess: () => toast.success('Policy deleted'), onError: (e: any) => toast.error(e?.message || 'Delete failed') }
                            )
                          }}>Delete</Button>
                        </div>
                      </div>
                    ))}
                    {(insurance.data || []).length === 0 && (
                      <div className="text-xs text-gray-600">No policies yet.</div>
                    )}
                  </div>
                  <Dialog.Root open={editInsOpen} onOpenChange={setEditInsOpen}>
                    <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                        <div className="text-lg font-semibold mb-4">Edit Insurance Policy</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="Type" value={eInsType} onChange={(e) => setEInsType(e.target.value)} />
                          <Input placeholder="Carrier" value={eInsCarrier} onChange={(e) => setEInsCarrier(e.target.value)} />
                          <Input placeholder="Policy #" value={eInsPolicyNumber} onChange={(e) => setEInsPolicyNumber(e.target.value)} />
                          <Input placeholder="Expires (YYYY-MM-DD)" value={eInsExpires} onChange={(e) => setEInsExpires(e.target.value)} />
                        </div>
                        <div className="mt-4 flex items-center gap-2 justify-end">
                          <Dialog.Close asChild>
                            <Button variant="outline">Cancel</Button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <Button onClick={() => {
                              if (!companyId || !editingPolicy?.id) return
                              updateInsurance.mutate(
                                { companyId, polId: editingPolicy.id, data: { type: eInsType, carrier: eInsCarrier, policyNumber: eInsPolicyNumber, expires: eInsExpires } },
                                { onSuccess: () => { toast.success('Policy updated') }, onError: (e: any) => toast.error(e?.message || 'Update failed') }
                              )
                            }}>Save</Button>
                          </Dialog.Close>
                        </div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Root>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bonding</CardTitle>
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button size="sm" variant="outline">Update</Button>
                      </Dialog.Trigger>
                      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                          <div className="text-lg font-semibold mb-4">Bonding Capacity</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="Surety" value={bondSurety} onChange={(e) => setBondSurety(e.target.value)} />
                            <Input placeholder="Single Limit ($)" value={bondSingleLimit} onChange={(e) => setBondSingleLimit(e.target.value)} />
                            <Input placeholder="Aggregate Limit ($)" value={bondAggregateLimit} onChange={(e) => setBondAggregateLimit(e.target.value)} />
                          </div>
                          <div className="mt-4 flex items-center gap-2 justify-end">
                            <Dialog.Close asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <Button onClick={() => {
                                if (!companyId) return
                                const data: any = {
                                  surety: bondSurety || undefined,
                                  singleLimit: bondSingleLimit ? Number(bondSingleLimit) : undefined,
                                  aggregateLimit: bondAggregateLimit ? Number(bondAggregateLimit) : undefined,
                                }
                                upsertBonding.mutate(
                                  { companyId, data, isCreate: !bonding?.data },
                                  { onSuccess: () => { toast.success('Bonding updated'); setBondSurety(''); setBondSingleLimit(''); setBondAggregateLimit('') }, onError: (e: any) => toast.error(e?.message || 'Failed to update bonding') }
                                )
                              }}>Save</Button>
                            </Dialog.Close>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600">Upload bonding letter in Quick Upload for proof.</div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Licenses</CardTitle>
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button size="sm" variant="outline">Add License</Button>
                      </Dialog.Trigger>
                      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                          <div className="text-lg font-semibold mb-4">Add License</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="State (e.g., VA)" value={licState} onChange={(e) => setLicState(e.target.value)} />
                            <Input placeholder="Classification (e.g., Business)" value={licClassification} onChange={(e) => setLicClassification(e.target.value)} />
                            <Input placeholder="Number" value={licNumber} onChange={(e) => setLicNumber(e.target.value)} />
                            <Input placeholder="Expires (YYYY-MM-DD)" value={licExpires} onChange={(e) => setLicExpires(e.target.value)} />
                          </div>
                          <div className="mt-4 flex items-center gap-2 justify-end">
                            <Dialog.Close asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <Button onClick={() => {
                                if (!companyId) return
                                createLicense.mutate(
                                  { companyId, data: { state: licState, classification: licClassification, number: licNumber, expires: licExpires } },
                                  { onSuccess: () => { toast.success('License added'); setLicState(''); setLicClassification(''); setLicNumber(''); setLicExpires('') }, onError: (e: any) => toast.error(e?.message || 'Failed to add license') }
                                )
                              }}>Save</Button>
                            </Dialog.Close>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(licenses.data || []).slice(0, 3).map((lic: any) => (
                      <div key={lic.id} className="flex items-center justify-between border-b border-gray-100 py-2">
                        <div>
                          <div className="font-medium text-gray-900">{lic.classification || 'License'} · {lic.state || ''} · {lic.number || ''}</div>
                          <div className="text-xs text-gray-600">Expires: {lic.expires || '—'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingLicense(lic)
                            setELicState(lic.state || '')
                            setELicClassification(lic.classification || '')
                            setELicNumber(lic.number || '')
                            setELicExpires(lic.expires || '')
                            setEditLicOpen(true)
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            if (!companyId) return
                            deleteLicense.mutate(
                              { companyId, licId: lic.id },
                              { onSuccess: () => toast.success('License deleted'), onError: (e: any) => toast.error(e?.message || 'Delete failed') }
                            )
                          }}>Delete</Button>
                        </div>
                      </div>
                    ))}
                    {(licenses.data || []).length === 0 && (
                      <div className="text-xs text-gray-600">No licenses yet.</div>
                    )}
                  </div>
                  <Dialog.Root open={editLicOpen} onOpenChange={setEditLicOpen}>
                    <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                        <div className="text-lg font-semibold mb-4">Edit License</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="State" value={eLicState} onChange={(e) => setELicState(e.target.value)} />
                          <Input placeholder="Classification" value={eLicClassification} onChange={(e) => setELicClassification(e.target.value)} />
                          <Input placeholder="Number" value={eLicNumber} onChange={(e) => setELicNumber(e.target.value)} />
                          <Input placeholder="Expires (YYYY-MM-DD)" value={eLicExpires} onChange={(e) => setELicExpires(e.target.value)} />
                        </div>
                        <div className="mt-4 flex items-center gap-2 justify-end">
                          <Dialog.Close asChild>
                            <Button variant="outline">Cancel</Button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <Button onClick={() => {
                              if (!companyId || !editingLicense?.id) return
                              updateLicense.mutate(
                                { companyId, licId: editingLicense.id, data: { state: eLicState, classification: eLicClassification, number: eLicNumber, expires: eLicExpires } },
                                { onSuccess: () => { toast.success('License updated') }, onError: (e: any) => toast.error(e?.message || 'Update failed') }
                              )
                            }}>Save</Button>
                          </Dialog.Close>
                        </div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Root>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/company/${companyId}/certifications`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    <span>Manage Certifications</span>
                  </Link>
                  <Link href={`/company/${companyId}/documents`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Documents Hub</span>
                  </Link>
                  <Link href={`/company/${companyId}/insurance`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Insurance & Bonding</span>
                  </Link>
                  <Link href={`/ingest`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Upload New Files</span>
                  </Link>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Certifications</CardTitle>
                    <Dialog.Root open={certOpen} onOpenChange={setCertOpen}>
                      <Dialog.Trigger asChild>
                        <Button size="sm" variant="outline">Add Certification</Button>
                      </Dialog.Trigger>
                      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                          <div className="text-lg font-semibold mb-4">Add Certification</div>
                          <div className="space-y-3">
                            <Input placeholder="Type (e.g., 8(a), SDVOSB)" value={certType} onChange={(e) => setCertType(e.target.value)} />
                            <select className="w-full h-10 rounded-lg border px-3 text-sm" value={certStatus} onChange={(e) => setCertStatus(e.target.value)}>
                              <option value="Active">Active</option>
                              <option value="Pending">Pending</option>
                              <option value="Expired">Expired</option>
                            </select>
                            <UploadField
                              label="Attachments"
                              value={certFiles}
                              onChange={setCertFiles}
                              accept={[ '.pdf', '.jpg', '.jpeg', '.png' ]}
                              maxFiles={6}
                              maxSizeMb={25}
                              enableTypeTagging
                              typeOptions={[ 'Certificate', 'Letter', 'Application' ]}
                            />
                          </div>
                          <div className="mt-4 flex items-center gap-2 justify-end">
                            <Dialog.Close asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                              <Button onClick={() => {
                                if (!companyId || !certType) return
                                createCert.mutate(
                                  { companyId, data: { type: certType, fields: { status: certStatus }, files: certFiles.map(f => ({ fileId: f.fileId, name: f.name })) } },
                                  { onSuccess: () => { toast.success('Certification added'); setCertType(''); setCertStatus('Active'); setCertFiles([]) }, onError: (e: any) => toast.error(e?.message || 'Failed to add certification') }
                                )
                              }}>Save</Button>
                            </Dialog.Close>
                          </div>
                        </div>
                      </Dialog.Content>
                    </Dialog.Root>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(certs.data?.items || []).slice(0, 5).map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between border-b border-gray-100 py-2">
                        <div>
                          <div className="font-medium text-gray-900">{c.type}</div>
                          <div className="text-xs text-gray-600">Status: {c.status || c.fields?.status || '—'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingCert(c)
                            setECertType(c.type || '')
                            setECertStatus(c.status || c.fields?.status || 'Active')
                            setECertFiles((c.files || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url })))
                            setEditCertOpen(true)
                          }}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            if (!companyId || !c.id) return
                            verifyCert.mutate(
                              { companyId, id: c.id, verified: !(c.verified === true) },
                              { onSuccess: () => toast.success(`Marked ${!(c.verified === true) ? 'Verified' : 'Unverified'}`), onError: (e: any) => toast.error(e?.message || 'Verify failed') }
                            )
                          }}>{editingCert?.id === c.id && editingCert?.verified ? 'Unverify' : (c.verified ? 'Unverify' : 'Verify')}</Button>
                        </div>
                      </div>
                    ))}
                    {(certs.data?.items || []).length === 0 && (
                      <div className="text-xs text-gray-600">No certifications yet.</div>
                    )}
                  </div>
                  <Dialog.Root open={editCertOpen} onOpenChange={setEditCertOpen}>
                    <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="w-full max-w-lg rounded-xl bg-white shadow-soft p-6">
                        <div className="text-lg font-semibold mb-4">Edit Certification</div>
                        <div className="space-y-3">
                          <Input placeholder="Type" value={eCertType} onChange={(e) => setECertType(e.target.value)} />
                          <select className="w-full h-10 rounded-lg border px-3 text-sm" value={eCertStatus} onChange={(e) => setECertStatus(e.target.value)}>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Expired">Expired</option>
                          </select>
                          <UploadField
                            label="Attachments"
                            value={eCertFiles}
                            onChange={setECertFiles}
                            accept={[ '.pdf', '.jpg', '.jpeg', '.png' ]}
                            maxFiles={10}
                            maxSizeMb={25}
                            enableTypeTagging
                            typeOptions={[ 'Certificate', 'Letter', 'Application' ]}
                          />
                        </div>
                        <div className="mt-4 flex items-center gap-2 justify-end">
                          <Dialog.Close asChild>
                            <Button variant="outline">Cancel</Button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <Button onClick={() => {
                              if (!companyId || !editingCert?.id) return
                              updateCert.mutate(
                                { companyId, id: editingCert.id, data: { fields: { status: eCertStatus }, files: eCertFiles.map(f => ({ fileId: f.fileId, name: f.name })) } },
                                { onSuccess: () => toast.success('Certification updated'), onError: (e: any) => toast.error(e?.message || 'Update failed') }
                              )
                            }}>Save</Button>
                          </Dialog.Close>
                        </div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Root>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${company.data?.uei ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>UEI {company.data?.uei ? 'present' : 'missing'}</span>
                    <span className={`px-2 py-1 rounded-full ${company.data?.cage ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>CAGE {company.data?.cage ? 'present' : 'missing'}</span>
                    <span className={`px-2 py-1 rounded-full ${company.data?.samStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>SAM {company.data?.samStatus || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


