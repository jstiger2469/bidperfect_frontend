'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Building2, Plus, ChevronDown, ChevronRight, BadgeCheck, MapPin, FileCheck2, Shield, Handshake, DollarSign, BarChart3, ShieldCheck, UserSquare2, CheckCircle, Search, FolderOpen, Upload } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { useActiveCompanyId } from '@/lib/tenant'
import SideDrawer from './SideDrawer'
import { Button } from './ui/button'
import { useUIStore } from '@/lib/uiStore'

export default function GlobalSidebar() {
  const pathname = usePathname()
  const { companyId } = useActiveCompanyId()
  const [isMounted, setIsMounted] = React.useState(false)

  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const setCollapsed = (v: boolean) => useUIStore.getState().setSidebarCollapsed(v)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)

  // Prevent hydration mismatch by only rendering UserButton on client
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const primaryNav = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/opportunities', label: 'Opportunities', icon: FolderOpen },
    { href: '/ingest', label: 'Ingest RFP', icon: Upload },
  ] as Array<{ href: string; label: string; icon: any }>

  const resourcesNav = [
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/subcontractors', label: 'Partners', icon: Users },
  ] as Array<{ href: string; label: string; icon: any }>

  const isActive = (href: string) => pathname?.startsWith(href)

  // Company submenu
  const inCompany = pathname?.startsWith('/company/')
  const [companyMenuOpen, setCompanyMenuOpen] = React.useState(true)

  // Create drawer
  const rightDrawerOpen = useUIStore(s => s.rightDrawerOpen)
  const rightDrawerView = useUIStore(s => s.rightDrawerView)
  const openCreate = (view: any) => useUIStore.getState().openRightDrawer(view)
  const closeCreate = () => useUIStore.getState().closeRightDrawer()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40" style={{ width: '16rem' }} data-collapsed={collapsed ? '1' : '0'}>
      <div className="flex h-full w-full flex-col border-r border-white/40 bg-gradient-to-b from-white/85 to-white/65 backdrop-blur-xl ring-1 ring-white/25">
        {/* Brand */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-white/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSidebar()}
              className="rounded-md border px-2 py-1 bg-white/80 text-xs text-gray-700 hover:bg-white"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
            {!collapsed && (
              <Link href="/" className="text-sm font-semibold text-gray-900">BidPerfect</Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isMounted && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
        {/* Primary CTA: Company Hub */}
        <div className="px-3 pt-3">
          <Link
            href={companyId ? `/company/${companyId}` : '/company'}
            className={`flex items-center justify-center gap-2 w-full text-sm font-medium rounded-xl px-3 py-2 shadow-soft transition-all hover:translate-y-[1px] ${companyId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 pointer-events-none'}`}
            aria-disabled={!companyId}
          >
            <Building2 className="w-[18px] h-[18px]" />
            {!collapsed && <span>Company Hub</span>}
          </Link>
        </div>
        {/* Quick create (single) */}
        <div className="px-3 pt-2">
          <button
            onClick={() => openCreate('document')}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 border text-sm"
            title="Create"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Create</span>}
          </button>
        </div>
        {/* Nav */}
        <nav className="px-3 py-3 space-y-5 text-sm overflow-y-auto" aria-label="Main navigation">
          {/* Primary */}
          <div>
            {!collapsed && <div className="px-3 pb-2 text-[11px] uppercase tracking-[0.08em] text-gray-500">Primary</div>}
            <div className="space-y-1">
              {primaryNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 h-11 rounded-xl transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${isActive(href) ? 'bg-blue-50/80 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50/80'}`}
                  aria-label={label}
                  title={label}
                  aria-current={isActive(href) ? 'page' : undefined}
                >
                  <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all ${isActive(href) ? 'bg-blue-400' : 'bg-transparent group-hover:bg-gray-300'}`} />
                  <Icon className={`w-[18px] h-[18px] ${isActive(href) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            {!collapsed && <div className="px-3 pb-2 text-[11px] uppercase tracking-[0.08em] text-gray-500">Resources</div>}
            <div className="space-y-1">
              {resourcesNav.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 h-11 rounded-xl transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${isActive(href) ? 'bg-blue-50/80 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50/80'}`} title={label} aria-current={isActive(href) ? 'page' : undefined}>
                  <Icon className={`w-[18px] h-[18px] ${isActive(href) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Company submenu */}
          {companyId && (
            <div className="pt-3">
              <button
                onClick={() => setCompanyMenuOpen(v => !v)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50/80`}
                title="Company"
              >
                {(companyMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                {!collapsed && <span className="text-sm font-medium">Company</span>}
              </button>
              {companyMenuOpen && (
                <div className={`mt-1 space-y-1 ${collapsed ? 'hidden' : ''}`}>
                  {[ 
                    { href: `/company/${companyId}`, label: 'Overview', icon: Home },
                    { href: `/company/${companyId}/profile`, label: 'Profile', icon: Building2 },
                    { href: `/company/${companyId}/certifications`, label: 'Certifications', icon: BadgeCheck },
                    { href: `/company/${companyId}/locations`, label: 'Locations', icon: MapPin },
                    { href: `/company/${companyId}/licenses`, label: 'Licenses', icon: FileCheck2 },
                    { href: `/company/${companyId}/insurance`, label: 'Insurance', icon: Shield },
                    { href: `/company/${companyId}/bonding`, label: 'Bonding', icon: Handshake },
                    { href: `/company/${companyId}/staff`, label: 'Staff', icon: Users },
                    { href: `/company/${companyId}/rates`, label: 'Rates', icon: DollarSign },
                    { href: `/company/${companyId}/documents`, label: 'Documents', icon: FileText },
                    { href: `/company/${companyId}/past-performance`, label: 'Past Performance', icon: BarChart3 },
                    { href: `/company/${companyId}/attestations`, label: 'Attestations', icon: ShieldCheck },
                    { href: `/company/${companyId}/teaming`, label: 'Teaming', icon: UserSquare2 },
                    { href: `/company/${companyId}/eligibility`, label: 'Eligibility', icon: CheckCircle },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className={`flex items-center gap-2 px-3 h-11 rounded-xl transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${isActive(href) ? 'bg-blue-50/80 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50/80'}`} title={label} aria-current={isActive(href) ? 'page' : undefined}>
                      <Icon className={`w-[18px] h-[18px] ${isActive(href) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
        

        {/* Create Drawer */}
        <SideDrawer
          open={rightDrawerOpen}
          onClose={closeCreate}
          title={rightDrawerView === 'staff' ? 'Add Staff Member' : rightDrawerView === 'document' ? 'Upload Document' : rightDrawerView === 'rfp' ? 'Add RFP' : 'Create'}
          widthClassName="max-w-xl"
          footer={[
            <Button key="cancel" variant="outline" onClick={closeCreate}>Cancel</Button>,
            <Button key="save" variant="frosted" onClick={closeCreate}>Save</Button>,
          ]}
        >
          <div className="text-sm text-gray-700 space-y-3">
            <p>Select what you want to create:</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => openCreate('document')}>Document</Button>
              <Button size="sm" onClick={() => openCreate('staff')}>Staff</Button>
              <Button size="sm" onClick={() => openCreate('rfp')}>RFP</Button>
            </div>
          </div>
        </SideDrawer>
      </div>
    </aside>
  )
}


