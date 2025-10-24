"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyLicenses, useCreateCompanyLicense, useUpdateCompanyLicense, useDeleteCompanyLicense } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const licenseSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  number: z.string().min(1, 'License number is required'),
  state: z.string().min(2, 'State/Province is required'),
  classification: z.string().optional(),
  expires: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type LicenseFormValues = z.infer<typeof licenseSchema>

export default function CompanyLicensesPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const list = useCompanyLicenses(companyId)
  const createLic = useCreateCompanyLicense()
  const updateLic = useUpdateCompanyLicense()
  const deleteLic = useDeleteCompanyLicense()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [showExpiringOnly, setShowExpiringOnly] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'expiresAsc' | 'expiresDesc' | 'typeAsc'>('expiresAsc')

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: { type: '', number: '', state: '', classification: '', expires: '', attachments: [] }
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ type: '', number: '', state: '', classification: '', expires: '', attachments: [] })
    setOpen(true)
  }

  const openEdit = (lic: any) => {
    setEditing(lic)
    form.reset({
      type: lic.type || '',
      number: lic.number || '',
      state: lic.state || '',
      classification: lic.classification || '',
      expires: (lic.expires || '').slice(0, 10),
      attachments: (lic.files || lic.attachments || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
    setOpen(true)
  }

  const onSubmit = (values: LicenseFormValues) => {
    if (!companyId) return
    const data = {
      type: values.type,
      number: values.number,
      state: values.state,
      classification: values.classification,
      expires: values.expires,
      files: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    if (editing?.id) {
      updateLic.mutate(
        { companyId, licId: editing.id, data },
        { onSuccess: () => { toast.success('License updated'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to update license') }
      )
    } else {
      createLic.mutate(
        { companyId, data },
        { onSuccess: () => { toast.success('License created'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to create license') }
      )
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Licenses</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <input id="expOnly" type="checkbox" className="rounded" checked={showExpiringOnly} onChange={(e) => setShowExpiringOnly(e.target.checked)} />
              <label htmlFor="expOnly">Expiring ≤ 60d</label>
            </div>
            <select className="h-8 text-xs border rounded px-2" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="expiresAsc">Expires ↑</option>
              <option value="expiresDesc">Expires ↓</option>
              <option value="typeAsc">Type A→Z</option>
            </select>
            <Button size="sm" variant="outline" onClick={openCreate}>Add License</Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div className="divide-y" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
            {((list.data || [])
              .filter((lic: any) => {
                if (!showExpiringOnly) return true
                const days = lic.expires ? Math.ceil((new Date(lic.expires).getTime() - Date.now()) / (1000*60*60*24)) : Infinity
                return days <= 60
              })
              .sort((a: any, b: any) => {
                if (sortBy === 'typeAsc') return (a.type || '').localeCompare(b.type || '')
                const da = a.expires ? new Date(a.expires).getTime() : Number.POSITIVE_INFINITY
                const db = b.expires ? new Date(b.expires).getTime() : Number.POSITIVE_INFINITY
                return sortBy === 'expiresAsc' ? da - db : db - da
              }))
              .map((lic: any) => (
              <motion.div key={lic.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{lic.type} · {lic.number}</div>
                  <div className="text-xs text-gray-500">State: {lic.state || '—'} · Class: {lic.classification || '—'} · Expires: {lic.expires || '—'} {lic.expires && (() => {
                    const days = Math.ceil((new Date(lic.expires).getTime() - Date.now()) / (1000*60*60*24));
                    return days <= 60 ? <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expiring</span> : null;
                  })()}</div>
                  {(lic.files?.length || lic.attachments?.length) ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(lic.attachments || lic.files || []).slice(0, 5).map((f: any, i: number) => (
                        <span key={`f-${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{f.type || 'File'}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {!!(lic.files?.length || lic.attachments?.length) && (
                    <div className="text-xs text-gray-500">{(lic.files?.length || lic.attachments?.length || 0)} file(s)</div>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(lic)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteLic.mutate(
                    { companyId, licId: lic.id },
                    { onSuccess: () => toast.success('License deleted'), onError: (e: any) => toast.error(e?.message || 'Failed to delete license') }
                  )}>Delete</Button>
                </div>
              </motion.div>
            ))}
            {(list.data || []).length === 0 && (
              <div className="py-8 text-center text-gray-500">No licenses yet.</div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit License' : 'Add License'}
        description="Provide license details and upload related files"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createLic.isPending || updateLic.isPending}>
              {editing ? 'Save Changes' : 'Create License'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-800">Type</label>
            <Input {...form.register('type')} placeholder="Contractor, HVAC, Electrical..." />
            {form.formState.errors.type && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.type.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Number</label>
              <Input {...form.register('number')} />
              {form.formState.errors.number && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.number.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">State</label>
              <Input {...form.register('state')} />
              {form.formState.errors.state && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.state.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Classification</label>
              <Input {...form.register('classification')} placeholder="Class A, B, C" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Expires</label>
              <Input type="date" {...form.register('expires')} />
            </div>
          </div>
          <UploadField
            label="Attachments"
            description="Upload copies of the license, renewal, etc."
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