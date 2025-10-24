'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface SideDrawerProps {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  widthClassName?: string
  headerRight?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

export default function SideDrawer({
  open,
  title,
  description,
  onClose,
  widthClassName = 'max-w-lg',
  headerRight,
  footer,
  children
}: SideDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 h-full w-full ${widthClassName} bg-white shadow-2xl z-50 flex flex-col`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {headerRight}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
            {footer && (
              <div className="p-4 border-t bg-white">
                <div className="flex justify-end gap-3">
                  {footer}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}


