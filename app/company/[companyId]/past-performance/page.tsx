"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyPastPerformance, useCreateCompanyPastPerformance, useUpdateCompanyPastPerformance, useDeleteCompanyPastPerformance } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'
import toast from 'react-hot-toast'

const ppSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  agency: z.string().min(1, 'Agency is required'),
  value: z.string().optional(),
  popStart: z.string().optional(),
  popEnd: z.string().optional(),
  description: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type PPFormValues = z.infer<typeof ppSchema>

export default function CompanyPastPerformancePage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const list = useCompanyPastPerformance(companyId)
  const createPP = useCreateCompanyPastPerformance()
  const updatePP = useUpdateCompanyPastPerformance()
  const deletePP = useDeleteCompanyPastPerformance()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)

  const form = useForm<PPFormValues>({
    resolver: zodResolver(ppSchema),
    defaultValues: { title: '', agency: '', value: '', popStart: '', popEnd: '', description: '', attachments: [] }
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ title: '', agency: '', value: '', popStart: '', popEnd: '', description: '', attachments: [] })
    setOpen(true)
  }

  const openEdit = (pp: any) => {
    setEditing(pp)
    form.reset({
      title: pp.title || '',
      agency: pp.agency || '',
      value: pp.value || '',
      popStart: (pp.popStart || '').slice(0, 10),
      popEnd: (pp.popEnd || '').slice(0, 10),
      description: pp.description || '',
      attachments: (pp.files || pp.attachments || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
    setOpen(true)
  }

  const onSubmit = (values: PPFormValues) => {
    if (!companyId) return
    const data = {
      title: values.title,
      agency: values.agency,
      value: values.value,
      popStart: values.popStart,
      popEnd: values.popEnd,
      description: values.description,
      files: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    if (editing?.id) {
      updatePP.mutate(
        { companyId, ppId: editing.id, data },
        { onSuccess: () => { toast.success('Past performance updated'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to update record') }
      )
    } else {
      createPP.mutate(
        { companyId, data },
        { onSuccess: () => { toast.success('Past performance created'); setOpen(false) }, onError: (e: any) => toast.error(e?.message || 'Failed to create record') }
      )
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Past Performance</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate}>Add Record</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(list.data || []).map((pp: any) => (
              <div key={pp.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{pp.title || 'Engagement'}</div>
                  <div className="text-xs text-gray-500">Agency: {pp.agency || '—'} · Value: {pp.value || '—'} · POP: {pp.popStart || '—'} – {pp.popEnd || '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  {!!(pp.files?.length || pp.attachments?.length) && (
                    <div className="text-xs text-gray-500">{(pp.files?.length || pp.attachments?.length || 0)} file(s)</div>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(pp)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePP.mutate(
                    { companyId, ppId: pp.id },
                    { onSuccess: () => toast.success('Record deleted'), onError: (e: any) => toast.error(e?.message || 'Failed to delete record') }
                  )}>Delete</Button>
                </div>
              </div>
            ))}
            {(list.data || []).length === 0 && (
              <div className="py-8 text-center text-gray-500">No past performance yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Past Performance' : 'Add Past Performance'}
        description="Provide engagement details and upload proof documents"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createPP.isPending || updatePP.isPending}>
              {editing ? 'Save Changes' : 'Create Record'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-800">Title</label>
            <Input {...form.register('title')} placeholder="Contract Title" />
            {form.formState.errors.title && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Agency</label>
            <Input {...form.register('agency')} placeholder="Customer Agency" />
            {form.formState.errors.agency && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.agency.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Value</label>
              <Input {...form.register('value')} placeholder="$1,250,000" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">POP Start</label>
              <Input type="date" {...form.register('popStart')} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">POP End</label>
              <Input type="date" {...form.register('popEnd')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Description</label>
            <Input {...form.register('description')} placeholder="Brief summary (optional)" />
          </div>
          <UploadField
            label="Attachments"
            description="Upload SOW, CPARS, CO letters, etc."
            value={(form.watch('attachments') as Attachment[]) || []}
            onChange={(atts) => form.setValue('attachments', atts as any, { shouldDirty: true })}
            accept={[".pdf", ".docx", ".pdf", ".jpg", ".png"]}
            maxFiles={10}
            maxSizeMb={50}
          />
        </form>
      </SideDrawer>
    </>
  )
}
