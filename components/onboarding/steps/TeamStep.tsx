'use client'

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Plus, X, Mail, UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TeamSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import type { z } from 'zod'

type FormData = z.infer<typeof TeamSchema>

export function TeamStep({ onContinue }: { onContinue: () => void }) {
  const { register, control, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(TeamSchema),
    defaultValues: { invites: [] },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'invites' })

  const { saveImmediate, isSaving } = useStepSaver({
    step: 'TEAM',
    onSuccess: (response) => {
      clearPendingChanges()
      if (response.nextStep) onContinue()
    },
  })

  const currentData = watch()

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          Invite Your Team
        </h2>
        <p className="text-gray-600 mt-2">Add team members who will work on proposals</p>
        <Badge variant="secondary" className="mt-2">Optional</Badge>
      </div>

      <form onSubmit={handleSubmit((data) => saveImmediate(data))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Team Invitations
            </CardTitle>
            <CardDescription>Send invitation emails to your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input {...register(`invites.${index}.email`)} placeholder="Email" />
                  <select {...register(`invites.${index}.role`)} className="w-full px-3 py-2 border rounded-md">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ email: '', role: 'member' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Team Member
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onContinue}>Skip for now</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Sending...' : fields.length > 0 ? `Send ${fields.length} Invite(s)` : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

