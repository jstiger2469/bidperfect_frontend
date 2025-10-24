'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Address = {
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
}

export type CompanyBasics = {
  legalName: string
  dba?: string
  einTin?: string
  duns?: string
  website?: string
  uei?: string
  cage?: string
  naics: string[]
  psc: string[]
  states: string[]
  address: Address
}

type OnboardingState = {
  // scope: isolates persisted data per user/org/company
  scopeKey: string
  step: number
  companyId?: string
  basics: CompanyBasics
  registrations: Record<string, any>
  socio: string[]
  insuranceBonding: Record<string, any>
  docs: { files: Array<{ id: string; name: string; type?: string }> }
  // actions
  setStep: (n: number) => void
  setScopeKey: (k: string) => void
  setBasics: (p: Partial<CompanyBasics>) => void
  setRegistrations: (r: Record<string, any>) => void
  setSocio: (s: string[]) => void
  setInsuranceBonding: (p: Record<string, any>) => void
  setDocs: (d: OnboardingState['docs']) => void
  setCompanyId: (id: string) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      scopeKey: '',
      step: 0,
      basics: {
        legalName: '',
        dba: '',
        einTin: '',
        duns: '',
        website: '',
        uei: '',
        cage: '',
        naics: [],
        psc: [],
        states: [],
        address: {},
      },
      registrations: {},
      socio: [],
      insuranceBonding: {},
      docs: { files: [] },
      setStep: (n) => set({ step: n }),
      setScopeKey: (k) => set({ scopeKey: k }),
      setBasics: (p) =>
        set((s) => ({ basics: { ...s.basics, ...p, address: { ...s.basics.address, ...(p as any).address } } })),
      setRegistrations: (r) => set({ registrations: r }),
      setSocio: (s) => set({ socio: s }),
      setInsuranceBonding: (p) => set({ insuranceBonding: p }),
      setDocs: (d) => set({ docs: d }),
      setCompanyId: (id) => set({ companyId: id }),
      reset: () =>
        set({
          scopeKey: '',
          step: 0,
          companyId: undefined,
          basics: {
            legalName: '',
            dba: '',
            einTin: '',
            duns: '',
            website: '',
            uei: '',
            cage: '',
            naics: [],
            psc: [],
            states: [],
            address: {},
          },
          registrations: {},
          socio: [],
          insuranceBonding: {},
          docs: { files: [] },
        }),
    }),
    { name: 'onboarding', storage: createJSONStorage(() => sessionStorage) }
  )
)


