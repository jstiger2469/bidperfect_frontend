"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyAttestations, useCreateCompanyAttestation, useUpdateCompanyAttestation } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'
import toast from 'react-hot-toast'
import { ATTESTATION_TYPE_OPTIONS, ATTESTATION_STATUS_OPTIONS } from '@/lib/options'
import { motion } from 'framer-motion'

const attSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type AttFormValues = z.infer<typeof attSchema>

export default function CompanyAttestationsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const list = useCompanyAttestations(companyId)
  const create = useCreateCompanyAttestation()
  const update = useUpdateCompanyAttestation()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)

  const form = useForm<AttFormValues>({
    resolver: zodResolver(attSchema),
    defaultValues: { type: '', status: 'pending', notes: '', attachments: [] }
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ type: '', status: 'pending', notes: '', attachments: [] })
    setOpen(true)
  }

  const openEdit = (a: any) => {
    setEditing(a)
    form.reset({
      type: a.type || '',
      status: a.status || 'pending',
      notes: a.notes || '',
      attachments: (a.files || a.attachments || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
    setOpen(true)
  }

  const onSubmit = (values: AttFormValues) => {
    if (!companyId) return
    const data = {
      type: values.type,
      status: values.status,
      notes: values.notes,
      files: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    if (editing?.id) {
      update.mutate(
        { companyId, attId: editing.id, data },
        { onSuccess: () => { toast.success('Attestation updated'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to update attestation') }
      )
    } else {
      create.mutate(
        { companyId, data },
        { onSuccess: () => { toast.success('Attestation created'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to create attestation') }
      )
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Compliance Attestations</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate}>Add Attestation</Button>
        </CardHeader>
        <CardContent>
          <motion.div
            className="divide-y"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
         >
            {(list.data || []).map((a: any) => (
              <motion.div key={a.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{a.type}</div>
                  <div className="text-xs text-gray-500">Status: {a.status || '—'} · Updated: {a.updatedAt || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>Edit</Button>
                </div>
              </motion.div>
            ))}
            {(list.data || []).length === 0 && (
              <div className="py-8 text-center text-gray-500">No attestations yet.</div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Attestation' : 'Add Attestation'}
        description="Provide attestation details and upload evidence"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={create.isPending || update.isPending}>
              {editing ? 'Save Changes' : 'Create Attestation'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Type</label>
              <select className="w-full h-10 rounded-lg border px-3 text-sm" {...form.register('type')}>
                {ATTESTATION_TYPE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt || 'Select type…'}</option>
                ))}
              </select>
              {form.formState.errors.type && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Status</label>
              <select className="w-full h-10 rounded-lg border px-3 text-sm" {...form.register('status')}>
                {ATTESTATION_STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {form.formState.errors.status && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Notes</label>
            <Input {...form.register('notes')} placeholder="Optional notes" />
          </div>
          <UploadField
            label="Evidence"
            description="Upload evidence files (PDFs, images)"
            value={(form.watch('attachments') as Attachment[]) || []}
            onChange={(atts) => form.setValue('attachments', atts as any, { shouldDirty: true })}
            accept={[".pdf", ".jpg", ".jpeg", ".png"]}
            maxFiles={10}
            maxSizeMb={50}
          />
        </form>
      </SideDrawer>
    </>
  )
}
