'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useOrganization, useOrganizationList } from '@clerk/nextjs'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, NumberInput } from '@/components/ui/input'
import TagInput from '@/components/TagInput'
import FileUploadZone from '@/components/FileUploadZone'
import { apiClient } from '@/lib/api'
import { Pencil, Trash2 } from 'lucide-react'
import { useOnboardingStore } from '@/lib/onboardingStore'

const steps = [
  { key: 'basics', title: 'Basics' },
  { key: 'registrations', title: 'Registrations' },
  { key: 'socio', title: 'NAICS & Socio' },
  { key: 'insurance', title: 'Insurance & Bonding' },
  { key: 'documents', title: 'Documents' },
] as const

const basicsSchema = z.object({
  legalName: z.string().min(1, 'Company legal name is required'),
  dba: z.string().optional(),
  website: z
    .string()
    .trim()
    .optional()
    .transform(v => v || undefined)
    .refine(v => !v || /^https?:\/\//i.test(v), { message: 'Must start with http(s)://' }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  phone: z.string().optional(),
})
type BasicsForm = z.infer<typeof basicsSchema>

const registrationsSchema = z.object({
  uei: z.string().optional(),
  cage: z.string().optional(),
  einTin: z.string().optional(),
  duns: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  samStatus: z.enum(['Active','Inactive']).optional(),
  samExpiration: z.string().optional(),
})
type RegistrationsForm = z.infer<typeof registrationsSchema>

const socioSchema = z.object({
  naics: z.array(z.string()).default([]),
  socio: z.array(z.string()).default([]),
})
type SocioForm = z.infer<typeof socioSchema>

const insuranceSchema = z.object({
  generalLiability: z.string().optional(),
  workersComp: z.string().optional(),
  professionalLiability: z.string().optional(),
  bondingCapacity: z.string().optional(),
})
type InsuranceForm = z.infer<typeof insuranceSchema>

export default function OnboardingWizard() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { organization } = useOrganization()
  const { isLoaded, createOrganization, setActive } = useOrganizationList()

  const {
    step,
    setStep,
    scopeKey,
    setScopeKey,
    basics,
    setBasics,
    registrations,
    setRegistrations,
    socio,
    setSocio,
    insuranceBonding,
    setInsuranceBonding,
    docs,
    setDocs,
    companyId,
    setCompanyId,
    reset,
  } = useOnboardingStore()

  const [isBusy, setIsBusy] = React.useState(false)

  // RHF instances per step, seeded from Zustand
  const basicsForm = useForm<BasicsForm>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      legalName: basics.legalName || '',
      dba: basics.dba || '',
      website: basics.website || '',
      firstName: '',
      lastName: '',
      title: '',
      phone: '',
    },
  })

  // Avoid per-keystroke store writes to prevent typing lag; persist onBlur via register options below

  const registrationsForm = useForm<RegistrationsForm>({
    resolver: zodResolver(registrationsSchema),
    defaultValues: {
      uei: basics.uei || '',
      cage: basics.cage || '',
      einTin: basics.einTin || '',
      duns: basics.duns || '',
      addressLine1: basics.address.addressLine1 || '',
      addressLine2: basics.address.addressLine2 || '',
      city: basics.address.city || '',
      state: basics.address.state || '',
      postalCode: basics.address.postalCode || '',
      samStatus: undefined,
      samExpiration: '',
    },
  })

  // Guard flags to avoid write-back loops during form rehydration
  const regHydratingRef = React.useRef(false)
  const socioHydratingRef = React.useRef(false)

  // Avoid per-keystroke writes for Registrations; we rehydrate on mount and persist onBlur/onChange

  const socioForm = useForm<SocioForm>({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      naics: basics.naics || [],
      socio: socio || [],
    },
  })

  const insuranceForm = useForm<InsuranceForm>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      generalLiability: (insuranceBonding as any).generalLiability || '',
      workersComp: (insuranceBonding as any).workersComp || '',
      professionalLiability: (insuranceBonding as any).professionalLiability || '',
      bondingCapacity: (insuranceBonding as any).bondingCapacity || '',
    },
  })

  const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend'

  // derive a scope key from user + org + company to isolate persisted state
  React.useEffect(() => {
    const userId = (typeof window !== 'undefined' ? (window as any).Clerk?.user?.id : undefined) || undefined
    const orgIdCurrent = organization?.id || undefined
    const company = companyId || undefined
    const key = [userId, orgIdCurrent, company].filter(Boolean).join(':')
    if (key && key !== scopeKey) {
      // When companyId is not set (e.g., user/org changed), clear state.
      // When companyId just became available (post-bootstrap), DO NOT reset or force step back.
      if (!company) {
        reset()
        setStep(0)
      }
      setScopeKey(key)
    }
  }, [organization?.id, companyId])

  // Pre-fill legal name from sign-up if empty
  React.useEffect(() => {
    if (!basics.legalName) {
      try {
        const name = typeof window !== 'undefined' ? sessionStorage.getItem('signupBusinessName') : null
        if (name && name.trim().length > 0) {
          setBasics({ legalName: name })
          basicsForm.setValue('legalName', name, { shouldDirty: false })
        }
      } catch {}
    }
    // keep form in sync with store basics on initial mount
    if (basics.legalName && basics.legalName !== basicsForm.getValues('legalName')) {
      basicsForm.setValue('legalName', basics.legalName, { shouldDirty: false })
    }
  }, [])

  async function ensureActiveOrg(preferredName: string): Promise<void> {
    if (!isLoaded) return
    try {
      apiClient.setAuthTokenProvider(async () => (await getToken({ template })) || null)
      // If an org is active, re-affirm it to ensure org_id in template JWT
      if (organization?.id) {
        try { await setActive?.({ organization: organization.id }) } catch {}
        await apiClient.setAuthTokenProvider(async () => (await getToken({ template })) || null)
        return
      }
      try {
        const org = await createOrganization({ name: preferredName || 'My Organization' })
        await setActive?.({ organization: org.id })
        await apiClient.setAuthTokenProvider(async () => (await getToken({ template })) || null)
      } catch (err: any) {
        // If orgs are disabled, proceed without creating
        if (typeof err?.message === 'string' && err.message.toLowerCase().includes('organizations')) {
          return
        }
        throw err
      }
    } catch (e) {
      throw e
    }
  }

  async function handleNextFromBasics(values: BasicsForm) {
    setIsBusy(true)
    try {
      console.info('[onboarding] basics submit', { values })
      setBasics({ legalName: values.legalName, dba: values.dba, website: values.website })
      await ensureActiveOrg(values.legalName)

      // Mint a fresh template token immediately after setActive (skip cache)
      apiClient.setAuthTokenProvider(async () => (await getToken({ template, skipCache: true })) || null)
      let token = await getToken({ template, skipCache: true })

      // Enterprise-grade: automatically wait until orgId is present using the SAME token path
      let ctx: any = null
      let orgReady = false
      for (let i = 0; i < 20; i++) {
        try {
          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          // Always refresh token to avoid cache and capture latest claims
          token = await getToken({ template, skipCache: true })
          const r = await fetch(`${base}/me/context`, { headers: { Authorization: `Bearer ${token}` } })
          ctx = await r.json().catch(() => ({}))
          console.info('[onboarding] poll me/context', { i, ok: r.ok, orgId: ctx?.orgId, haveToken: Boolean(token), tokenLen: token?.length })
          if (r.ok && ctx?.orgId) { orgReady = true; break }
        } catch {}
        await new Promise(res => setTimeout(res, 250 + i * 100))
      }

      const payload = {
        companyName: values.legalName,
        creator: {
          firstName: values.firstName,
          lastName: values.lastName,
          title: values.title || undefined,
          phone: values.phone || undefined,
        },
      }
      console.info('[onboarding] bootstrap payload', { ...payload, tokenLen: token?.length })
      // Verify token org claims before bootstrap (debug / safety)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const verify = await fetch(`${base}/me/context`, { headers: { Authorization: `Bearer ${token}` } })
        const verifyJson = await verify.json().catch(() => ({}))
        if (!verify.ok || !verifyJson?.orgId) {
          console.warn('[onboarding] template token missing orgId; retrying shortly', verify.status, verifyJson)
        }
      } catch {}

      // Only call bootstrap for the current org; do not call /companies directly
      if (!orgReady) {
        toast.error('Still activating your organization. Please wait a moment and try again.')
        setIsBusy(false)
        return
      }
      const baseUrl = '/api'
      // Robust: retry bootstrap via server proxy a few times if backend still propagating claims
      let companyFromBootstrap: any = null
      for (let attempt = 0; attempt < 5; attempt++) {
        console.info('[onboarding] call /api/bootstrap attempt', { attempt })
        const resp = await fetch(`${baseUrl}/bootstrap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        console.info('[onboarding] /api/bootstrap status', resp.status)
        if (resp.status === 409) {
          await new Promise(res => setTimeout(res, 300 + attempt * 200))
          continue
        }
        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}))
          throw new Error(errorData?.message || `Bootstrap failed (${resp.status})`)
        }
        companyFromBootstrap = await resp.json()
        break
      }
      if (!companyFromBootstrap?.companyId) {
        throw new Error('Bootstrap did not return a companyId')
      }
      setCompanyId(companyFromBootstrap.companyId)
      toast.success('Company created and linked to your organization')
      // advance immediately
      setStep(1)
    } catch (err: any) {
      console.error('[onboarding] error', err)
      toast.error(err?.message || 'Failed to bootstrap tenant')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleNextFromRegistrations(values: RegistrationsForm) {
    setIsBusy(true)
    let advance = false
    try {
      console.info('[onboarding] registrations submit', { values, companyId })
      setBasics({
        uei: values.uei,
        cage: values.cage,
        einTin: values.einTin,
        duns: values.duns,
        address: {
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
        },
      })
      setRegistrations({ ...registrations })

      if (companyId) {
        const payload: any = {
          uei: values.uei?.trim() || undefined,
          cage: values.cage?.trim() || undefined,
          ein: values.einTin?.trim() || undefined,
          duns: values.duns?.trim() || undefined,
          address: {
            line1: values.addressLine1?.trim() || undefined,
            line2: values.addressLine2?.trim() || undefined,
            city: values.city?.trim() || undefined,
            state: values.state?.trim() || undefined,
            postalCode: values.postalCode?.trim() || undefined,
          },
          // duplicate top-level for tolerant backend
          addressLine1: values.addressLine1?.trim() || undefined,
          addressLine2: values.addressLine2?.trim() || undefined,
          city: values.city?.trim() || undefined,
          state: values.state?.trim() || undefined,
          postalCode: values.postalCode?.trim() || undefined,
        }
        // prune empty address object
        if (Object.values(payload.address).every(v => !v)) delete payload.address
        // If everything is empty, skip
        const hasAny = Object.values({ ...payload, address: undefined }).some(v => !!v)
        console.info('[onboarding] registrations payload', { payload })
        if (hasAny) {
          const scheduleRetry = async (delayMs: number, attempt: number) => {
            try {
              const bearer = await getToken({ template, skipCache: true }).catch(() => null)
              const resp = await fetch('/api/company-registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
                body: JSON.stringify({ companyId, data: payload }),
              })
              if (!resp.ok) {
                if ((resp.status === 403 || resp.status === 409) && attempt < 3) {
                  setTimeout(() => { scheduleRetry(delayMs * 2, attempt + 1) }, delayMs)
                  return
                }
                const err = await resp.json().catch(() => ({}))
                console.warn('[onboarding] registrations final fail', err)
              }
            } catch (e) {
              if (attempt < 3) setTimeout(() => { scheduleRetry(delayMs * 2, attempt + 1) }, delayMs)
            }
          }
          try {
            // initial attempt
            const bearer = await getToken({ template, skipCache: true }).catch(() => null)
            const resp = await fetch('/api/company-registrations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
              body: JSON.stringify({ companyId, data: payload }),
            })
            if (!resp.ok) {
              if (resp.status === 403 || resp.status === 409) {
                toast('We’ll finish saving registrations once permissions propagate.', { icon: '⏳' } as any)
                scheduleRetry(800, 1)
              } else {
                const err = await resp.json().catch(() => ({}))
                throw new Error(err?.message || `registrations failed (${resp.status})`)
              }
            }
            advance = true
          } catch (e: any) {
            console.error('[onboarding] registrations submit failed', e)
            advance = true
          }
        } else {
          console.info('[onboarding] registrations: nothing to submit; skipping')
          advance = true
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save registrations')
    } finally {
      if (advance) setStep(2)
      setIsBusy(false)
    }
  }

  async function handleNextFromSocio(values: SocioForm) {
    setIsBusy(true)
    try {
      console.info('[onboarding] socio submit', { values, companyId })
      setBasics({ naics: values.naics })
      setSocio(values.socio)
      if (companyId) {
        const hasNaics = Array.isArray(values.naics) && values.naics.length > 0
        if (hasNaics) {
          try {
            const bearer = await getToken({ template, skipCache: true }).catch(() => null)
            const resp = await fetch('/api/company-update', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
              body: JSON.stringify({ companyId, data: { naics: values.naics, naicsCodes: values.naics } }),
            })
            if (!resp.ok) {
              if ([400, 403, 409, 422].includes(resp.status)) {
                console.warn('[onboarding] socio update non-blocking status', resp.status)
              } else {
                const err = await resp.json().catch(() => ({}))
                throw new Error(err?.message || `naics update failed (${resp.status})`)
              }
            }
          } catch (e: any) {
            const msg = (e?.message || '').toLowerCase()
            if (msg.includes('403') || msg.includes('forbidden') || msg.includes('400') || msg.includes('422')) {
              console.warn('[onboarding] socio update deferred', e)
            } else if (!msg.includes('no fields')) {
              throw e
            }
          }
        } else {
          console.info('[onboarding] socio: no NAICS provided; skipping PATCH')
        }
      }
      setStep(3)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save NAICS/Socio')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleNextFromInsurance(values: InsuranceForm) {
    setIsBusy(true)
    try {
      setInsuranceBonding(values as any)
      if (companyId && (values.bondingCapacity || values.professionalLiability)) {
        try {
          const bearer = await getToken({ template, skipCache: true }).catch(() => null)
          const resp = await fetch('/api/company-bonding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
            body: JSON.stringify({ companyId, data: {
              bondingCapacity: values.bondingCapacity,
              professionalLiability: values.professionalLiability,
            } }),
          })
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}))
            throw new Error(err?.message || `bonding update failed (${resp.status})`)
          }
        } catch (e) {
          console.warn('[onboarding] bonding update deferred', e)
        }
      }
      setStep(4)
    } catch {
      // no-op
    } finally {
      setIsBusy(false)
    }
  }

  function handleBack() {
    setStep(Math.max(0, step - 1))
  }

  function Stepper() {
    return (
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, idx) => {
          const isActive = step === idx
          const isComplete = step > idx
          return (
            <div key={s.key} className="flex-1 flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium transition-all ring-1 ring-white/50 shadow-sm ${
                isComplete
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isActive
                  ? 'bg-white/80 backdrop-blur-sm border-blue-400 text-blue-700'
                  : 'bg-white/50 backdrop-blur-sm border-gray-300 text-gray-700'
              }`}>
                {idx + 1}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700 select-none">{s.title}</div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-3 bg-gradient-to-r from-gray-200 to-transparent" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  function BasicsStep() {
    return (
      <form onSubmit={basicsForm.handleSubmit(handleNextFromBasics)} className="space-y-5">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900">Company Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Legal Name <span className="text-red-500">*</span></label>
            <Input {...basicsForm.register('legalName', { onBlur: (e) => setBasics({ legalName: e.target.value }) })} />
            {basicsForm.formState.errors.legalName && (
              <p className="text-xs text-red-600 mt-1">{basicsForm.formState.errors.legalName.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">DBA (optional)</label>
            <Input {...basicsForm.register('dba', { onBlur: (e) => setBasics({ dba: e.target.value }) })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-800">Website (optional)</label>
          <Input placeholder="https://example.com" {...basicsForm.register('website', { onBlur: (e) => setBasics({ website: e.target.value }) })} />
          {basicsForm.formState.errors.website && (
            <p className="text-xs text-red-600 mt-1">{basicsForm.formState.errors.website.message as string}</p>
          )}
        </div>
        
        <div className="space-y-1 pt-4">
          <h4 className="text-sm font-semibold text-gray-900">Your Information</h4>
          <p className="text-xs text-gray-600">We'll add you as the first team member</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">First Name <span className="text-red-500">*</span></label>
            <Input {...basicsForm.register('firstName')} />
            {basicsForm.formState.errors.firstName && (
              <p className="text-xs text-red-600 mt-1">{basicsForm.formState.errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Last Name <span className="text-red-500">*</span></label>
            <Input {...basicsForm.register('lastName')} />
            {basicsForm.formState.errors.lastName && (
              <p className="text-xs text-red-600 mt-1">{basicsForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Title (optional)</label>
            <Input placeholder="e.g., President, CEO" {...basicsForm.register('title')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Phone (optional)</label>
            <Input placeholder="(555) 123-4567" {...basicsForm.register('phone')} />
          </div>
        </div>
        
        <CardFooter className="justify-end gap-2 p-0 pt-2">
          <Button
            type="submit"
            size="lg"
            variant="frosted"
            disabled={isBusy}
            className="min-w-36"
          >
            {isBusy ? 'Saving…' : 'Continue'}
          </Button>
        </CardFooter>
      </form>
    )
  }

  function RegistrationsStep() {
    // Rehydrate the form from store when returning to this step
    React.useEffect(() => {
      regHydratingRef.current = true
      registrationsForm.reset({
        uei: basics.uei || '',
        cage: basics.cage || '',
        einTin: basics.einTin || '',
        duns: basics.duns || '',
        addressLine1: basics.address.addressLine1 || '',
        addressLine2: basics.address.addressLine2 || '',
        city: basics.address.city || '',
        state: basics.address.state || '',
        postalCode: basics.address.postalCode || '',
        samStatus: (registrations as any)?.samStatus || undefined,
        samExpiration: (registrations as any)?.samExpiration || '',
      }, { keepDefaultValues: false })
      // Defer to next tick so watchers triggered by reset won't write back
      setTimeout(() => { regHydratingRef.current = false }, 0)
    }, [])
    return (
      <form onSubmit={registrationsForm.handleSubmit(handleNextFromRegistrations)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">UEI</label>
            <Input {...registrationsForm.register('uei', { onBlur: (e) => setBasics({ uei: e.target.value }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">CAGE</label>
            <Input {...registrationsForm.register('cage', { onBlur: (e) => setBasics({ cage: e.target.value }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">EIN/TIN</label>
            <Input {...registrationsForm.register('einTin', { onBlur: (e) => setBasics({ einTin: e.target.value }) })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">DUNS</label>
            <Input {...registrationsForm.register('duns', { onBlur: (e) => setBasics({ duns: e.target.value }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">SAM Status</label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" {...registrationsForm.register('samStatus', { onChange: (e) => setRegistrations({ ...registrations, samStatus: e.target.value || undefined }) })}>
              <option value="">Select…</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">SAM Expiration</label>
            <Input type="date" {...registrationsForm.register('samExpiration', { onChange: (e) => setRegistrations({ ...registrations, samExpiration: e.target.value || '' }) })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Address Line 1</label>
            <Input {...registrationsForm.register('addressLine1', { onBlur: (e) => setBasics({ address: { addressLine1: e.target.value } }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Address Line 2</label>
            <Input {...registrationsForm.register('addressLine2', { onBlur: (e) => setBasics({ address: { addressLine2: e.target.value } }) })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">City</label>
            <Input {...registrationsForm.register('city', { onBlur: (e) => setBasics({ address: { city: e.target.value } }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">State</label>
            <Input {...registrationsForm.register('state', { onBlur: (e) => setBasics({ address: { state: e.target.value } }) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Postal Code</label>
            <Input {...registrationsForm.register('postalCode', { onBlur: (e) => setBasics({ address: { postalCode: e.target.value } }) })} />
          </div>
        </div>
        <CardFooter className="justify-between gap-2 p-0 pt-2">
          <Button
            type="button"
            onClick={() => {
              const v = registrationsForm.getValues()
              setBasics({
                uei: v.uei,
                cage: v.cage,
                einTin: v.einTin,
                duns: v.duns,
                address: {
                  addressLine1: v.addressLine1,
                  addressLine2: v.addressLine2,
                  city: v.city,
                  state: v.state,
                  postalCode: v.postalCode,
                },
              })
              setStep(0)
            }}
            variant="outline"
            className="min-w-28"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="frosted"
            disabled={isBusy}
            className="min-w-36"
          >
            {isBusy ? 'Saving…' : 'Next'}
          </Button>
        </CardFooter>
      </form>
    )
  }

  function SocioStep() {
    const naics = socioForm.watch('naics')
    const socioVals = socioForm.watch('socio')
    // Persist changes live and rehydrate on return to this step without loops
    React.useEffect(() => {
      const sub = socioForm.watch((val) => {
        if (socioHydratingRef.current) return
        setBasics({ naics: (val as any).naics || [] })
        setSocio((val as any).socio || [])
      })
      return () => sub.unsubscribe()
    }, [])
    React.useEffect(() => {
      socioHydratingRef.current = true
      socioForm.reset({ naics: basics.naics || [], socio: socio || [] }, { keepDefaultValues: false })
      setTimeout(() => { socioHydratingRef.current = false }, 0)
    }, [])
    return (
      <form onSubmit={socioForm.handleSubmit(handleNextFromSocio)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagInput
            label="NAICS Codes"
            placeholder="Type a code and press Enter (e.g., 541330)"
            value={naics as unknown as string[]}
            onChange={(tags) => socioForm.setValue('naics' as any, tags, { shouldDirty: true })}
            suggestions={[
              '541330','541511','541512','541519','541611','541618','236220','237310','238210','238220'
            ]}
          />
          <TagInput
            label="Socioeconomic Status"
            placeholder="Type and press Enter (e.g., SB, 8(a), WOSB)"
            value={socioVals as unknown as string[]}
            onChange={(tags) => socioForm.setValue('socio' as any, tags, { shouldDirty: true })}
            suggestions={[
              'SB','SDB','8(a)','WOSB','EDWOSB','HUBZone','VOSB','SDVOSB'
            ]}
          />
        </div>
        <CardFooter className="justify-between gap-2 p-0 pt-2">
          <Button
            type="button"
            onClick={() => {
              const v = socioForm.getValues()
              setBasics({ naics: v.naics })
              setSocio(v.socio)
              setStep(1)
            }}
            variant="outline"
            className="min-w-28"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="frosted"
            disabled={isBusy}
            className="min-w-36"
          >
            {isBusy ? 'Saving…' : 'Next'}
          </Button>
        </CardFooter>
      </form>
    )
  }

  function InsuranceStep() {
    const [policy, setPolicy] = React.useState<{ type: string; carrier?: string; policyNumber?: string; occurrence?: number | null; aggregate?: number | null; effective?: string; expires?: string; certificateId?: string }>({ type: 'GL' })
    const [policies, setPolicies] = React.useState<any[]>([])
    React.useEffect(() => {
      const load = async () => {
        if (!companyId) return
        try {
          const list = await apiClient.listInsurance(companyId)
          setPolicies(Array.isArray(list) ? list : [])
        } catch {}
      }
      load()
    }, [companyId])
    const policyTypes = ['GL','Auto','WorkersComp','Umbrella','Professional','Cyber','Other']
    const onAddPolicy = async () => {
      if (!companyId) return
      try {
        const bearer = await getToken({ template, skipCache: true }).catch(() => null)
        const resp = await fetch('/api/company-insurance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
          body: JSON.stringify({ companyId, policy: {
            type: policy.type,
            carrier: policy.carrier,
            policyNumber: policy.policyNumber,
            occurrence: policy.occurrence ?? undefined,
            aggregate: policy.aggregate ?? undefined,
            effective: policy.effective ? new Date(policy.effective).toISOString() : undefined,
            expires: policy.expires ? new Date(policy.expires).toISOString() : undefined,
            certificateId: policy.certificateId,
          } }),
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          throw new Error(err?.message || `policy create failed (${resp.status})`)
        }
        // append or refetch list
        try {
          const created = await resp.json().catch(() => null)
          if (created) setPolicies((prev) => [{ ...created, _files: certFiles }, ...prev])
          else {
            const list = await apiClient.listInsurance(companyId)
            setPolicies(Array.isArray(list) ? list : [])
          }
        } catch {
          try { const list = await apiClient.listInsurance(companyId); setPolicies(Array.isArray(list) ? list : []) } catch {}
        }
        // reset entry form for next policy
        setPolicy({ type: policy.type })
        setCertFiles([])
        toast.success('Policy saved')
      } catch (e: any) {
        console.warn('[onboarding] policy create deferred', e)
        toast('We’ll finish saving insurance once permissions propagate.', { icon: '⏳' } as any)
      }
    }
    const [certFiles, setCertFiles] = React.useState<Array<{ id: string; name: string; url?: string }>>([])
    const uploadCerts = async (items: any[]) => {
      if (!companyId) return
      const uploaded: Array<{ id: string; name: string; url?: string }> = []
      for (const it of items) {
        try {
          const res = await apiClient.uploadFile((() => { const fd = new FormData(); fd.append('file', it.file); return fd })())
          uploaded.push({ id: res.fileId, name: it.file.name, url: (res as any).url })
          const bearer = await getToken({ template, skipCache: true }).catch(() => null)
          await fetch('/api/company-documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
            body: JSON.stringify({ companyId, document: {
              tags: ['insurance:COI', `insurance:${policy.type}`],
              files: [{ fileId: res.fileId, name: it.file.name }],
              metadata: { policyNumber: policy.policyNumber, expires: policy.expires || null },
            } }),
          })
        } catch {}
      }
      setCertFiles(uploaded)
    }
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Policy Type</label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={policy.type} onChange={(e) => setPolicy(p => ({ ...p, type: e.target.value }))}>
              {policyTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Carrier</label>
            <Input value={policy.carrier || ''} onChange={(e) => setPolicy(p => ({ ...p, carrier: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Policy #</label>
            <Input value={policy.policyNumber || ''} onChange={(e) => setPolicy(p => ({ ...p, policyNumber: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Occurrence</label>
            <NumberInput placeholder="$1,000,000" onValueChange={(n) => setPolicy(p => ({ ...p, occurrence: n }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Aggregate</label>
            <NumberInput placeholder="$2,000,000" onValueChange={(n) => setPolicy(p => ({ ...p, aggregate: n }))} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Effective</label>
            <Input type="date" value={policy.effective || ''} onChange={(e) => setPolicy(p => ({ ...p, effective: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Expires</label>
            <Input type="date" value={policy.expires || ''} onChange={(e) => setPolicy(p => ({ ...p, expires: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-800">Certificate Upload (COI)</label>
          <FileUploadZone onFilesSelected={() => {}} onUpload={uploadCerts} maxFiles={3} acceptedTypes={[ '.pdf', '.jpg', '.jpeg', '.png' ]} />
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setStep(2)} className="min-w-28">Back</Button>
          <Button type="button" onClick={onAddPolicy} className="min-w-32">Add Policy</Button>
          <Button type="button" onClick={() => insuranceForm.handleSubmit(handleNextFromInsurance)()} size="lg" variant="frosted" className="min-w-36" disabled={isBusy}>{isBusy ? 'Saving…' : 'Next'}</Button>
        </div>

        {policies.length > 0 && (
          <div className="pt-4 space-y-3">
            <h5 className="text-sm font-semibold text-gray-900">Saved Policies</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {policies.map((p, idx) => (
                <Card key={p.id || idx} variant="glass-tinted" padding="sm" className="border-white/50 group transition-transform duration-200 hover:-translate-y-[1px] hover:shadow-soft-lg hover:ring-2 hover:ring-white/50" role="group">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{p.type || 'Policy'}</div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:group-hover:translate-y-[-1px]">
                      <Button size="sm" variant="outline" title="Edit policy" aria-label="Edit policy" className="h-7 px-2 rounded-md transition-all hover:-translate-y-px hover:bg-blue-50 hover:text-blue-700 hover:ring-2 hover:ring-blue-200/80 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/20" onClick={async () => {
                        const bearer = await getToken({ template, skipCache: true }).catch(() => null)
                        const resp = await fetch(`/api/company-insurance/${p.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
                          body: JSON.stringify({ companyId, data: { type: p.type, carrier: p.carrier, policyNumber: p.policyNumber } }),
                        })
                        if (!resp.ok) console.warn('policy edit failed')
                      }}>
                        <Pencil className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </Button>
                      <Button size="sm" variant="destructive" title="Delete policy" aria-label="Delete policy" className="h-7 px-2 rounded-md transition-all hover:-translate-y-px hover:bg-red-50 hover:text-red-700 hover:ring-2 hover:ring-red-200/80 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/20" onClick={async () => {
                        const bearer = await getToken({ template, skipCache: true }).catch(() => null)
                        const resp = await fetch(`/api/company-insurance/${p.id}?companyId=${companyId}`, {
                          method: 'DELETE',
                          headers: { ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
                        })
                        if (resp.ok) setPolicies(prev => prev.filter((x) => (x.id || '') !== (p.id || '')))
                      }}>
                        <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-700">
                    <div>Carrier: {p.carrier || '—'}</div>
                    <div>Occurrence: {p.occurrence != null ? Number(p.occurrence).toLocaleString() : '—'}</div>
                    <div>Aggregate: {p.aggregate != null ? Number(p.aggregate).toLocaleString() : '—'}</div>
                    <div>Effective: {p.effective ? new Date(p.effective).toLocaleDateString() : '—'} → Expires: {p.expires ? new Date(p.expires).toLocaleDateString() : '—'}</div>
                  </div>
                  {Array.isArray((p as any)._files) && (p as any)._files.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(p as any)._files.map((f: any, i: number) => {
                        const url = f.url as string | undefined
                        const isImage = !!url && /(png|jpg|jpeg|gif|webp)$/i.test(url)
                        return (
                          <div key={f.id || i} className="relative overflow-hidden rounded-md border border-white/40 bg-white/40 backdrop-blur-sm">
                            {isImage && url ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt={f.name || 'attachment'} className="w-full h-20 object-cover" />
                              </a>
                            ) : (
                              <a href={url || '#'} target={url ? '_blank' : undefined} rel={url ? 'noreferrer' : undefined} className="flex items-center justify-center h-20 text-xs text-blue-700 underline">
                                {f.name || 'View file'}
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  async function handleUploadDocuments(fileItems: any[]) {
    const uploaded: Array<{ id: string; name: string; type?: string }> = []
    for (const item of fileItems) {
      const formData = new FormData()
      formData.append('file', item.file)
      const res = await apiClient.uploadFile(formData)
      uploaded.push({ id: res.fileId, name: item.file.name })
    }
    setDocs({ files: [...(docs?.files || []), ...uploaded] })
  }

  function DocumentsStep() {
    const [tags, setTags] = React.useState<string[]>([])
    const [docType, setDocType] = React.useState<string>('')
    const [expires, setExpires] = React.useState<string>('')
    const suggestions = ['capability','marketing','org-chart','w9','insurance:GL','insurance:COI','bonding:capacity-letter','certification:ISO9001','policy:EEO']
    const onUploadDocs = async (items: any[]) => {
      if (!companyId) return
      for (const it of items) {
        try {
          const res = await apiClient.uploadFile((() => { const fd = new FormData(); fd.append('file', it.file); return fd })())
          const bearer = await getToken({ template, skipCache: true }).catch(() => null)
          await fetch('/api/company-documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
            body: JSON.stringify({ companyId, document: {
              tags: tags.length ? tags : undefined,
              type: docType || undefined,
              metadata: expires ? { expires } : undefined,
              files: [{ fileId: res.fileId, name: it.file.name }],
            } }),
          })
        } catch (e) { console.warn('[onboarding] doc upload deferred', e) }
      }
      await handleUploadDocuments(items)
    }
    return (
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Add supporting documents</h4>
          <p className="text-xs text-gray-600">Upload COIs, bonding letters, certifications, capability briefs, and more. Tag uploads so they’re easy to find later.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Type (optional)</label>
            <Input placeholder="e.g., certificate, brochure" value={docType} onChange={(e) => setDocType(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Tags</label>
            <TagInput label="" placeholder="Add a tag and press Enter" value={tags} onChange={setTags} suggestions={suggestions} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800">Expires (optional)</label>
            <Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
        </div>
        <FileUploadZone onFilesSelected={() => {}} onUpload={onUploadDocs} maxFiles={12} maxSize={100} acceptedTypes={[ '.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.png' ]} />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>Uploaded this session: {docs?.files?.length || 0}</div>
        </div>
        <CardFooter className="justify-between gap-2 p-0 pt-2">
          <Button type="button" onClick={handleBack} variant="outline" className="min-w-28">Back</Button>
          <Button type="button" onClick={() => { if (companyId) router.replace(`/company/${companyId}/profile`); else router.replace('/dashboard') }} className="min-w-28">Finish</Button>
        </CardFooter>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card variant="glass" className="w-full max-w-3xl border-white/50 ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150 bg-gradient-to-br from-white/70 to-white/40">
        <CardHeader className="pb-3">
          <CardTitle>Welcome — Let’s set up your company</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Stepper />
          <div className="rounded-2xl border border-white/50 ring-1 ring-white/30 bg-white/60 bg-gradient-to-br from-white/65 to-white/40 backdrop-blur-xl backdrop-saturate-150 shadow-glass p-5">
            {step === 0 && <BasicsStep />}
            {step === 1 && <RegistrationsStep />}
            {step === 2 && <SocioStep />}
            {step === 3 && <InsuranceStep />}
            {step === 4 && <DocumentsStep />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


