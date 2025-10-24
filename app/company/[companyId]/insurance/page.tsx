"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyInsurance, useCreateCompanyInsurance, useUpdateCompanyInsurance, useDeleteCompanyInsurance } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const policySchema = z.object({
  type: z.string().min(1, 'Type is required'),
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().optional(),
  coverage: z.string().optional(),
  expires: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type PolicyFormValues = z.infer<typeof policySchema>

export default function CompanyInsurancePage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const policies = useCompanyInsurance(companyId)
  const createPol = useCreateCompanyInsurance()
  const updatePol = useUpdateCompanyInsurance()
  const deletePol = useDeleteCompanyInsurance()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [showExpiringOnly, setShowExpiringOnly] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'expiresAsc' | 'expiresDesc' | 'typeAsc'>('expiresAsc')

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { type: '', provider: '', policyNumber: '', coverage: '', expires: '', attachments: [] }
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ type: '', provider: '', policyNumber: '', coverage: '', expires: '', attachments: [] })
    setOpen(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    form.reset({
      type: p.type || '',
      provider: p.provider || '',
      policyNumber: p.policyNumber || '',
      coverage: p.coverage || '',
      expires: (p.expires || '').slice(0, 10),
      attachments: (p.files || p.attachments || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
    setOpen(true)
  }

  const onSubmit = (values: PolicyFormValues) => {
    if (!companyId) return
    const data = {
      type: values.type,
      provider: values.provider,
      policyNumber: values.policyNumber,
      coverage: values.coverage,
      expires: values.expires,
      files: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    if (editing?.id) {
      updatePol.mutate(
        { companyId, polId: editing.id, data },
        { onSuccess: () => { toast.success('Policy updated'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to update policy') }
      )
    } else {
      createPol.mutate(
        { companyId, data },
        { onSuccess: () => { toast.success('Policy created'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to create policy') }
      )
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Insurance</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <input id="expOnlyIns" type="checkbox" className="rounded" checked={showExpiringOnly} onChange={(e) => setShowExpiringOnly(e.target.checked)} />
              <label htmlFor="expOnlyIns">Expiring ≤ 60d</label>
            </div>
            <select className="h-8 text-xs border rounded px-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="expiresAsc">Expires ↑</option>
              <option value="expiresDesc">Expires ↓</option>
              <option value="typeAsc">Type A→Z</option>
            </select>
            <Button size="sm" variant="outline" onClick={openCreate}>Add Policy</Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div className="divide-y" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
            {((policies.data || [])
              .filter((p: any) => {
                if (!showExpiringOnly) return true
                const days = p.expires ? Math.ceil((new Date(p.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                return days <= 60
              })
              .sort((a: any, b: any) => {
                if (sortBy === 'typeAsc') return (a.type || '').localeCompare(b.type || '')
                const da = a.expires ? new Date(a.expires).getTime() : Number.POSITIVE_INFINITY
                const db = b.expires ? new Date(b.expires).getTime() : Number.POSITIVE_INFINITY
                return sortBy === 'expiresAsc' ? da - db : db - da
              }))
              .map((p: any) => (
              <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{p.type} · {p.provider}</div>
                  <div className="text-xs text-gray-500">Policy #: {p.policyNumber || '—'} · Coverage: {p.coverage || '—'} · Expires: {p.expires || '—'} {p.expires && (() => {
                    const days = Math.ceil((new Date(p.expires).getTime() - Date.now()) / (1000*60*60*24));
                    return days <= 60 ? <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expiring</span> : null;
                  })()}</div>
                  {(p.files?.length || p.attachments?.length) ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(p.attachments || p.files || []).slice(0, 5).map((f: any, i: number) => (
                        <span key={`f-${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{f.type || 'File'}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {!!(p.files?.length || p.attachments?.length) && (
                    <div className="text-xs text-gray-500">{(p.files?.length || p.attachments?.length || 0)} file(s)</div>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePol.mutate(
                    { companyId, polId: p.id },
                    { onSuccess: () => toast.success('Policy deleted'), onError: (e: any) => toast.error(e?.message || 'Failed to delete policy') }
                  )}>Delete</Button>
                </div>
              </motion.div>
            ))}
            {(policies.data || []).length === 0 && (
              <div className="py-8 text-center text-gray-500">No policies yet.</div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Policy' : 'Add Policy'}
        description="Provide insurance policy details and upload related files"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createPol.isPending || updatePol.isPending}>
              {editing ? 'Save Changes' : 'Create Policy'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Type</label>
              <Input {...form.register('type')} placeholder="COI, GL, WC, Auto..." />
              {form.formState.errors.type && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Provider</label>
              <Input {...form.register('provider')} />
              {form.formState.errors.provider && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.provider.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Policy #</label>
              <Input {...form.register('policyNumber')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Coverage</label>
              <Input {...form.register('coverage')} placeholder="$1M / $3M" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Expires</label>
            <Input type="date" {...form.register('expires')} />
          </div>
          <UploadField
            label="Attachments"
            description="Upload COI, endorsements, etc."
            value={(form.watch('attachments') as Attachment[]) || []}
            onChange={(atts) => form.setValue('attachments', atts as any, { shouldDirty: true })}
            accept={[".pdf", ".jpg", ".jpeg", ".png"]}
            maxFiles={5}
            maxSizeMb={25}
          />
        </form>
      </SideDrawer>
    </>
  )
}
