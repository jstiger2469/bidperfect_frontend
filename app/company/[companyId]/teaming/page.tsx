'use client'

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyTeaming, useUpsertCompanyTeaming } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import TagInput from '@/components/TagInput'

const teamingSchema = z.object({
  rolesCsv: z.string().optional(),
  geoCsv: z.string().optional(),
  partnerTypesCsv: z.string().optional(),
  notes: z.string().optional()
})

type TeamingFormValues = z.infer<typeof teamingSchema>

export default function CompanyTeamingPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const team = useCompanyTeaming(companyId)
  const upsert = useUpsertCompanyTeaming()

  const data = team.data || { preferredRoles: [], geo: [], partnerTypes: [], notes: '' }

  const [open, setOpen] = React.useState(false)
  const form = useForm<TeamingFormValues>({
    resolver: zodResolver(teamingSchema),
    defaultValues: {
      rolesCsv: (data.preferredRoles || []).join(', '),
      geoCsv: (data.geo || []).join(', '),
      partnerTypesCsv: (data.partnerTypes || []).join(', '),
      notes: data.notes || ''
    }
  })

  React.useEffect(() => {
    form.reset({
      rolesCsv: (data.preferredRoles || []).join(', '),
      geoCsv: (data.geo || []).join(', '),
      partnerTypesCsv: (data.partnerTypes || []).join(', '),
      notes: data.notes || ''
    })
  }, [data?.preferredRoles?.join(','), data?.geo?.join(','), data?.partnerTypes?.join(','), data?.notes])

  const splitCsv = (csv?: string) =>
    (csv || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

  const onSubmit = (values: TeamingFormValues) => {
    if (!companyId) return
    const payload = {
      preferredRoles: splitCsv(values.rolesCsv),
      geo: splitCsv(values.geoCsv),
      partnerTypes: splitCsv(values.partnerTypesCsv),
      notes: values.notes
    }
    upsert.mutate({ companyId, data: payload }, { onSuccess: () => setOpen(false) })
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Teaming Preferences</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Edit</Button>
        </CardHeader>
        <CardContent>
          {team.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <div>Preferred Roles: {(data.preferredRoles || []).join(', ') || '—'}</div>
              <div>Geographies: {(data.geo || []).join(', ') || '—'}</div>
              <div>Partner Types: {(data.partnerTypes || []).join(', ') || '—'}</div>
              <div>Notes: {data.notes || '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Teaming Preferences"
        description="Use comma-separated values for lists"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={upsert.isPending}>Save Preferences</Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <TagInput
            label="Preferred Roles"
            placeholder="Prime, Sub, JV"
            value={splitCsv(form.watch('rolesCsv'))}
            onChange={(tags) => form.setValue('rolesCsv', tags.join(', '), { shouldDirty: true })}
            suggestions={["Prime","Sub","JV","Mentor","Protégé"]}
          />
          <TagInput
            label="Geographies"
            placeholder="VA, MD, DC"
            value={splitCsv(form.watch('geoCsv'))}
            onChange={(tags) => form.setValue('geoCsv', tags.join(', '), { shouldDirty: true })}
            suggestions={["VA","MD","DC","NC","SC","PA","DE"]}
          />
          <TagInput
            label="Partner Types"
            placeholder="8(a), SDVOSB, WOSB"
            value={splitCsv(form.watch('partnerTypesCsv'))}
            onChange={(tags) => form.setValue('partnerTypesCsv', tags.join(', '), { shouldDirty: true })}
            suggestions={["8(a)","SDVOSB","WOSB","HUBZone","VOSB","SDB"]}
          />
          <div>
            <label className="text-sm font-medium text-gray-800">Notes</label>
            <Input {...form.register('notes')} placeholder="Optional notes" />
          </div>
        </form>
      </SideDrawer>
    </>
  )
}

