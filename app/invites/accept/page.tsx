'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth, useOrganization } from '@clerk/nextjs'
import { useAcceptInvite } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export default function InviteAcceptPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const initialToken = sp.get('token') || ''
  const { isSignedIn } = useAuth()
  const { organization } = useOrganization()
  const accept = useAcceptInvite()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [token, setToken] = React.useState(initialToken)

  // Ensure user is signed in; preserve token across redirect
  React.useEffect(() => {
    const current = initialToken || token || ''
    if (!isSignedIn) {
      if (current) sessionStorage.setItem('inviteToken', current)
      const redirectUrl = `/invites/accept${current ? `?token=${encodeURIComponent(current)}` : ''}`
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`)
      return
    }
    // After sign-in, restore token if missing
    if (!current) {
      const restored = sessionStorage.getItem('inviteToken') || ''
      if (restored) setToken(restored)
    }
  }, [isSignedIn, initialToken])

  const handleAccept = async () => {
    if (!token) { toast.error('Missing invite token'); return }
    accept.mutate(
      { token, profile: { firstName, lastName, title, phone } },
      { onSuccess: ({ staff }) => { toast.success('Invite accepted'); router.push(`/company/${staff?.companyId}/staff`) }, onError: (e: any) => toast.error(e?.message || 'Accept failed') }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8 max-w-lg mx-auto">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Accept Invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700">Confirm your details and accept the invite.</div>
            <div className="text-xs text-gray-600">
              {organization?.name ? (
                <span>Current organization: <span className="font-medium text-gray-800">{organization.name}</span>. If this doesn't match the inviter's org, acceptance may be rejected.</span>
              ) : (
                <span>No active organization. You may be added during acceptance.</span>
              )}
            </div>
            <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button onClick={handleAccept} disabled={accept.isPending}>Accept Invite</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


