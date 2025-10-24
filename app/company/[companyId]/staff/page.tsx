'use client'

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useCompanyStaff, useCreateCompanyStaff as useCreateStaff, useUpdateStaff as useUpdateKeyPerson, useDeleteCompanyStaff as useDeleteStaff, useCompanyInvites, useCreateInvite, useResendInvite, useCancelInvite } from '@/lib/hooks'
import { useUser } from '@clerk/nextjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, MailPlus, RefreshCw, X, Mail, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import SideDrawer from '@/components/SideDrawer'
import UploadField, { type Attachment } from '@/components/UploadField'
import TagInput from '@/components/TagInput'
import toast from 'react-hot-toast'
import { CLEARANCE_OPTIONS } from '@/lib/options'

const staffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  title: z.string().optional(),
  rolesCsv: z.string().optional(),
  clearance: z.string().optional(),
  certsCsv: z.string().optional(),
  attachments: z.array(z.object({ fileId: z.string(), name: z.string().optional(), url: z.string().optional() })).optional()
})

type StaffFormValues = z.infer<typeof staffSchema>

export default function CompanyStaffPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const staff = useCompanyStaff(companyId)
  const invites = useCompanyInvites(companyId)
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateKeyPerson()
  const deleteStaff = useDeleteStaff()
  const createInvite = useCreateInvite()
  const resendInvite = useResendInvite()
  const cancelInvite = useCancelInvite()
  const { user, isLoaded: isUserLoaded } = useUser()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [invEmail, setInvEmail] = React.useState('')
  const [invRole, setInvRole] = React.useState('')
  const [invExpires, setInvExpires] = React.useState<number | ''>('')

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', title: '', rolesCsv: '', clearance: '', certsCsv: '', attachments: [] }
  })

  const splitCsv = (csv?: string) => (csv || '').split(',').map(s => s.trim()).filter(Boolean)

  const openCreate = () => {
    setEditing(null)
    form.reset({ firstName: '', lastName: '', email: '', phone: '', title: '', rolesCsv: '', clearance: '', certsCsv: '', attachments: [] })
    setOpen(true)
  }

  const openEdit = (s: any) => {
    setEditing(s)
    form.reset({
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      email: s.email || '',
      phone: s.phone || '',
      title: s.title || '',
      rolesCsv: (s.roles || []).join(', '),
      clearance: s.clearance || '',
      certsCsv: (s.certs || []).join(', '),
      attachments: (s.attachments || s.files || []).map((f: any) => ({ fileId: f.fileId || f.id, name: f.name, url: f.url }))
    })
    setOpen(true)
  }

  const onSubmit = (values: StaffFormValues) => {
    if (!companyId) return
    const fullName = `${values.firstName} ${values.lastName}`.trim()
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      name: fullName,
      email: values.email,
      phone: values.phone || '',
      title: values.title || '',
      roles: splitCsv(values.rolesCsv),
      role: splitCsv(values.rolesCsv)[0] || '',
      clearance: values.clearance || '',
      clearanceLevel: values.clearance || undefined,
      certs: splitCsv(values.certsCsv),
      certifications: splitCsv(values.certsCsv),
      attachments: (values.attachments || []).map(a => ({ fileId: a.fileId, name: a.name }))
    }
    if (editing?.id) {
      updateStaff.mutate(
        { companyId, staffId: editing.id, data: payload },
        {
          onSuccess: () => { toast.success('Staff updated'); setOpen(false) },
          onError: (e: any) => toast.error(e?.message || 'Failed to update staff')
        }
      )
    } else {
      createStaff.mutate(
        { companyId, data: payload },
        {
          onSuccess: () => { toast.success('Staff created'); setOpen(false) },
          onError: (e: any) => toast.error(e?.message || 'Failed to create staff')
        }
      )
    }
  }

  const [activeTab, setActiveTab] = React.useState<'members' | 'invites'>('members')

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
                <div>
            <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage staff members, clearances, and team invitations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => {
              const email = prompt('Enter email address to invite:')
              if (email && companyId) {
                createInvite.mutate(
                  { companyId, data: { email, role: 'Staff', expiresDays: 14 } },
                  { onSuccess: () => toast.success('Invitation sent'), onError: (e: any) => toast.error(e?.message || 'Failed to send invite') }
                )
              }
            }}>
              <MailPlus className="w-4 h-4" /> Send Invite
            </Button>
            <Button variant="default" onClick={openCreate} className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Team Member
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Team Members ({Array.isArray(staff.data) ? staff.data.length : 0})
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Invites ({(Array.isArray(invites.data) ? invites.data : ((invites.data as any)?.items || [])).length})
            </button>
          </nav>
        </div>

        {/* Team Members Table */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {(!staff.data || (Array.isArray(staff.data) && staff.data.length === 0)) ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Build your team by adding members or sending invitations</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" onClick={() => {
                    const email = prompt('Enter email address:')
                    if (email && companyId) {
                      createInvite.mutate(
                        { companyId, data: { email, role: 'Staff', expiresDays: 14 } },
                        { onSuccess: () => toast.success('Invitation sent'), onError: (e: any) => toast.error(e?.message || 'Failed') }
                      )
                    }
                  }}>Send Invite</Button>
                  <Button variant="default" onClick={openCreate}>Add Team Member</Button>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Platform Access</th>
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Clearance</th>
                      <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {(Array.isArray(staff.data) ? staff.data : []).map((s: any) => {
                      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Unknown'
                      const initials = `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase() || '?'
                      const hasAccess = !!s.userId
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div className="font-medium text-gray-900">{fullName}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-700">{s.title || s.role || '—'}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {s.email}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {hasAccess ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 font-normal">
                                Active User
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 font-normal">
                                  No Access
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    if (confirm(`Send platform invitation to ${s.email}?`)) {
                                      createInvite.mutate(
                                        { companyId, data: { email: s.email, role: s.role || 'Staff', expiresDays: 14 } },
                                        { 
                                          onSuccess: () => toast.success(`Invitation sent to ${s.email}`), 
                                          onError: (e: any) => toast.error(e?.message || 'Failed to send invite') 
                                        }
                                      )
                                    }
                                  }}
                                >
                                  Invite
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {s.clearanceLevel ? (
                              <Badge variant="secondary" className="font-normal">{s.clearanceLevel}</Badge>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 font-normal">Active</Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => openEdit(s)} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                if (confirm(`Remove ${fullName} from the team?`)) {
                                  deleteStaff.mutate(
                                    { companyId, staffId: s.id },
                                    { onSuccess: () => toast.success('Team member removed'), onError: (e: any) => toast.error(e?.message || 'Failed') }
                                  )
                                }
                              }} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            )}
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'invites' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
                  <Input placeholder="email@company.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Role (optional)</div>
                  <Input placeholder="e.g., Analyst" value={invRole} onChange={(e) => setInvRole(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Expires (days)</div>
                  <Input placeholder="14" value={invExpires} onChange={(e) => setInvExpires(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>
              <div>
                <Button className="gap-2" onClick={() => {
                  if (!companyId || !invEmail) { toast.error('Email required'); return }
                  createInvite.mutate(
                    { companyId, data: { email: invEmail, role: invRole || undefined, expiresDays: typeof invExpires === 'number' ? invExpires : undefined } },
                    { onSuccess: () => { toast.success('Invite sent'); setInvEmail(''); setInvRole(''); setInvExpires('') }, onError: (e: any) => toast.error(e?.message || 'Failed to send invite') }
                  )
                }}><MailPlus className="w-4 h-4" /> Send Invite</Button>
              </div>
            </div>

            <div className="mt-6 divide-y">
              {(() => {
                const list = Array.isArray(invites.data) ? invites.data : ((invites.data as any)?.items || [])
                return (list || []).map((iv: any) => {
                  const statusColor = iv.status === 'Accepted' ? 'bg-green-100 text-green-700' : iv.status === 'Cancelled' || iv.status === 'Failed' ? 'bg-red-100 text-red-700' : iv.status === 'Expired' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'
                  return (
                    <div key={iv.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{iv.email}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full ${statusColor}`}>{iv.status}</span>
                          <span>Expires: {iv.expiresAt ? new Date(iv.expiresAt).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => resendInvite.mutate(
                          { companyId, inviteId: iv.id },
                          { onSuccess: () => toast.success('Invite resent'), onError: (e: any) => toast.error(e?.message || 'Resend failed') }
                        )} disabled={['Accepted','Cancelled','Expired'].includes(iv.status)}><RefreshCw className="w-3 h-3" /> Resend</Button>
                        <Button size="sm" variant="destructive" className="gap-1" onClick={() => cancelInvite.mutate(
                          { companyId, inviteId: iv.id },
                          { onSuccess: () => toast.success('Invite cancelled'), onError: (e: any) => toast.error(e?.message || 'Cancel failed') }
                        )} disabled={['Accepted','Cancelled','Expired'].includes(iv.status)}><X className="w-3 h-3" /> Cancel</Button>
                      </div>
                    </div>
                  )
                })
              })()}
              {((Array.isArray(invites.data) ? invites.data : ((invites.data as any)?.items || [])).length === 0) && (
                <div className="py-10 text-center text-gray-500 text-sm">No invites yet. Send one above.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
        description="Add staff details, roles, and supporting documents"
        widthClassName="max-w-xl"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createStaff.isPending || updateStaff.isPending}>
              {editing ? 'Save Changes' : 'Create Staff'}
            </Button>
          </>
        )}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">First Name</label>
              <Input {...form.register('firstName')} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Last Name</label>
              <Input {...form.register('lastName')} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Email</label>
              <Input type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Phone</label>
              <Input {...form.register('phone')} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Title</label>
              <Input {...form.register('title')} placeholder="e.g. Project Manager" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Clearance</label>
              <select className="w-full h-10 rounded-lg border px-3 text-sm" {...form.register('clearance')}>
                {CLEARANCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt || 'None'}</option>
                ))}
              </select>
            </div>
          </div>
          <Controller
            name="rolesCsv"
            control={form.control}
            render={({ field }) => (
            <TagInput
              label="Roles"
              placeholder="Add a role and press Enter"
                value={splitCsv(field.value)}
                onChange={(tags) => field.onChange(tags.join(', '))}
              suggestions={["Project Manager","SME","Analyst","Security","Compliance","Engineer","Tech Writer"]}
            />
            )}
          />
          <Controller
            name="certsCsv"
            control={form.control}
            render={({ field }) => (
            <TagInput
              label="Certifications"
              placeholder="Add a cert and press Enter"
                value={splitCsv(field.value)}
                onChange={(tags) => field.onChange(tags.join(', '))}
              suggestions={["PMP","CISSP","CSM","ITIL","SEC+","CEH","AWS SA"]}
            />
            )}
          />
          <Controller
            name="attachments"
            control={form.control}
            render={({ field }) => (
          <UploadField
            label="Attachments"
            description="Upload resume, certs, clearances, etc."
                value={(field.value as Attachment[]) || []}
                onChange={(atts) => field.onChange(atts)}
            accept={[".pdf", ".doc", ".docx", ".jpg", ".png"]}
            maxFiles={10}
            maxSizeMb={50}
            enableTypeTagging
            typeOptions={["Resume","Certification","Clearance","Other"]}
              />
            )}
          />
        </form>
      </SideDrawer>
    </>
  )
}
