'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type DrawerView = 'none' | 'document' | 'staff' | 'rfp'

type UIState = {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void

  rightDrawerOpen: boolean
  rightDrawerView: DrawerView
  openRightDrawer: (view: DrawerView) => void
  closeRightDrawer: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      rightDrawerOpen: false,
      rightDrawerView: 'none',
      openRightDrawer: (view) => set({ rightDrawerOpen: true, rightDrawerView: view }),
      closeRightDrawer: () => set({ rightDrawerOpen: false, rightDrawerView: 'none' }),
    }),
    { name: 'ui', storage: createJSONStorage(() => localStorage) }
  )
)


