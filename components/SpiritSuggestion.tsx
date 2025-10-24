'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SpiritSuggestionData {
  id: string
  title: string
  message: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  autoHideAfter?: number // milliseconds
}

interface SpiritSuggestionProps {
  suggestion: SpiritSuggestionData | null
  onClose?: () => void
}

export function SpiritSuggestion({ suggestion, onClose }: SpiritSuggestionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (suggestion) {
      setIsVisible(true)
      
      // Auto-hide if configured
      if (suggestion.autoHideAfter) {
        const timer = setTimeout(() => {
          handleClose()
        }, suggestion.autoHideAfter)
        return () => clearTimeout(timer)
      }
    }
  }, [suggestion])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      suggestion?.onDismiss?.()
      onClose?.()
    }, 300) // Wait for animation to complete
  }

  const handlePrimaryAction = () => {
    suggestion?.primaryAction?.onClick()
    handleClose()
  }

  const handleSecondaryAction = () => {
    suggestion?.secondaryAction?.onClick()
    handleClose()
  }

  if (!suggestion) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-200/60 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Spirit suggests</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                <p className="text-base text-blue-700 font-medium leading-relaxed">
                  {suggestion.title}
                </p>
                {suggestion.message && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {suggestion.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 flex items-center gap-3">
                {suggestion.primaryAction && (
                  <Button
                    onClick={handlePrimaryAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {suggestion.primaryAction.label}
                  </Button>
                )}
                {suggestion.secondaryAction && (
                  <Button
                    onClick={handleSecondaryAction}
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {suggestion.secondaryAction.label}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for managing Spirit suggestions
export function useSpiritSuggestion() {
  const [suggestion, setSuggestion] = useState<SpiritSuggestionData | null>(null)

  const showSuggestion = (data: Omit<SpiritSuggestionData, 'id'>) => {
    setSuggestion({
      id: `spirit-${Date.now()}`,
      ...data,
    })
  }

  const closeSuggestion = () => {
    setSuggestion(null)
  }

  return {
    suggestion,
    showSuggestion,
    closeSuggestion,
  }
}
