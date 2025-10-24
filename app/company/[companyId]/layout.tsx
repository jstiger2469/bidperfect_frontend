'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  IdCard,
  BadgeCheck,
  MapPin,
  FileCheck2,
  Shield,
  Handshake,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  ShieldCheck,
  UserSquare2,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompany } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
// import { useActiveCompanyId } from '@/lib/tenant'
import GlobalSidebar from '@/components/GlobalSidebar'

export default function CompanyLayout({ children, params }: { children: React.ReactNode; params: Promise<{ companyId: string }> }) {
  const router = useRouter()
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const p = await params
      if (mounted) setCompanyId(p.companyId)
    })()
    return () => { mounted = false }
  }, [params])
  // Tenant mapping disabled here to avoid provider scoping issues; trust URL param

  // Guard disabled; if needed, add back after Clerk provider scoping is stable
  const { data } = useCompany(companyId)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-emerald-50/20">
      {/* Global sidebar persisted for company pages */}
      <GlobalSidebar />

      {/* Content shifted for left global sidebar; remove page-level sidebar */}
      <div className="md:pl-64 max-w-6xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}



