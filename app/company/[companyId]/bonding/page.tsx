"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyBonding, useUpsertCompanyBonding } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'

const bondingSchema = z.object({
  singleLimit: z.string().min(1, 'Single limit is required'),
  aggregateLimit: z.string().min(1, 'Aggregate limit is required'),
  surety: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type BondingFormValues = z.infer<typeof bondingSchema>

export default function CompanyBondingPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const bonding = useCompanyBonding(companyId)
  const upsertBond = useUpsertCompanyBonding()

  const current = bonding.data || {}

  const [open, setOpen] = React.useState(false)

  const form = useForm<BondingFormValues>({
    resolver: zodResolver(bondingSchema),
    defaultValues: { 
      singleLimit: (current.singleLimit ?? '').toString(),
      aggregateLimit: (current.aggregateLimit ?? '').toString(),
      surety: current.surety || '',
      notes: current.notes || '',
      attachments: []
    }
  })

  React.useEffect(() => {
    form.reset({
      singleLimit: (current.singleLimit ?? '').toString(),
      aggregateLimit: (current.aggregateLimit ?? '').toString(),
      surety: current.surety || '',
      notes: current.notes || '',
      attachments: (current.files || current.attachments || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
  }, [current?.id])

  const onSubmit = (values: BondingFormValues) => {
    if (!companyId) return
    const data = {
      singleLimit: Number(values.singleLimit),
      aggregateLimit: Number(values.aggregateLimit),
      surety: values.surety,
      notes: values.notes,
      files: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    upsertBond.mutate({ companyId, data, isCreate: !current?.id }, { onSuccess: () => setOpen(false) })
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Bonding</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {current?.id ? 'Update' : 'Create'} Bonding
          </Button>
        </CardHeader>
        <CardContent>
          {bonding.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Single Limit: {current.singleLimit ?? '—'}</div>
              <div className="text-sm text-gray-600">Aggregate Limit: {current.aggregateLimit ?? '—'}</div>
              <div className="text-sm text-gray-600">Surety: {current.surety || '—'}</div>
              <div className="text-sm text-gray-600">Notes: {current.notes || '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.id ? 'Update Bonding' : 'Create Bonding'}
        description="Set bonding limits and upload surety letter if available"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={upsertBond.isPending}>
              {current?.id ? 'Save Changes' : 'Create Bonding'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Single Limit</label>
              <Input type="number" step="1" min="0" {...form.register('singleLimit')} />
              {form.formState.errors.singleLimit && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.singleLimit.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Aggregate Limit</label>
              <Input type="number" step="1" min="0" {...form.register('aggregateLimit')} />
              {form.formState.errors.aggregateLimit && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.aggregateLimit.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Surety</label>
            <Input {...form.register('surety')} placeholder="Surety company name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Notes</label>
            <Input {...form.register('notes')} placeholder="Optional notes" />
          </div>
          <UploadField
            label="Attachments"
            description="Upload surety letter or related documents"
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

