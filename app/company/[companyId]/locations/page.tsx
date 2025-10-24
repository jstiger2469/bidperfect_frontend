"use client"

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCompanyLocations, useCreateCompanyLocation, useUpdateCompanyLocation, useDeleteCompanyLocation } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'

const locationSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2).default('US'),
  type: z.string().optional()
})

type LocationFormValues = z.infer<typeof locationSchema>

export default function CompanyLocationsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const locations = useCompanyLocations(companyId)
  const createLoc = useCreateCompanyLocation()
  const updateLoc = useUpdateCompanyLocation()
  const deleteLoc = useDeleteCompanyLocation()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      label: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      type: ''
    }
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ label: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'US', type: '' })
    setOpen(true)
  }

  const openEdit = (loc: any) => {
    setEditing(loc)
    form.reset({
      label: loc.label || '',
      addressLine1: loc.addressLine1 || loc.address1 || '',
      addressLine2: loc.addressLine2 || '',
      city: loc.city || '',
      state: loc.state || '',
      postalCode: loc.postalCode || '',
      country: loc.country || 'US',
      type: loc.type || ''
    })
    setOpen(true)
  }

  const onSubmit = (values: LocationFormValues) => {
    if (!companyId) return
    if (editing?.id) {
      updateLoc.mutate({ companyId, locId: editing.id, data: values }, { onSuccess: () => setOpen(false) })
    } else {
      createLoc.mutate({ companyId, data: values }, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Locations</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate}>Add Location</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(locations.data || []).map((loc: any) => (
              <div key={loc.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{loc.label || 'Location'}</div>
                  <div className="text-xs text-gray-500">
                    {(loc.addressLine1 || loc.address1 || '')} {(loc.city || '')} {(loc.state || '')} {(loc.postalCode || '')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(loc)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteLoc.mutate({ companyId, locId: loc.id })}>Delete</Button>
                </div>
              </div>
            ))}
            {(locations.data || []).length === 0 && (
              <div className="py-8 text-center text-gray-500">No locations yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Location' : 'Add Location'}
        description="Add the company location details"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createLoc.isPending || updateLoc.isPending}>
              {editing ? 'Save Changes' : 'Create Location'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-800">Label</label>
            <Input {...form.register('label')} placeholder="HQ, Branch, etc." />
            {form.formState.errors.label && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.label.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Address Line 1</label>
            <Input {...form.register('addressLine1')} placeholder="123 Main St" />
            {form.formState.errors.addressLine1 && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.addressLine1.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Address Line 2</label>
            <Input {...form.register('addressLine2')} placeholder="Suite, Apt, etc." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">City</label>
              <Input {...form.register('city')} />
              {form.formState.errors.city && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.city.message}</p>
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
              <label className="text-sm font-medium text-gray-800">Postal Code</label>
              <Input {...form.register('postalCode')} />
              {form.formState.errors.postalCode && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.postalCode.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Country</label>
              <Input {...form.register('country')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Type</label>
            <Input {...form.register('type')} placeholder="HQ, Warehouse, etc." />
          </div>
        </form>
      </SideDrawer>
    </>
  )
}
