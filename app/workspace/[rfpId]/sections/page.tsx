'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { useRFPData, useUcfDocument, useReparseUcf } from '@/lib/hooks'
import { UCF_SECTIONS, mapSectionsToUCF } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function UCFSectionsPage({ params }: { params: { rfpId: string } }) {
  const { data: rfpData, loading: rfpLoading, error: rfpError } = useRFPData(params.rfpId)
  const { data: ucfDoc, isLoading: ucfLoading, error: ucfError, refetch: refetchUcf } = useUcfDocument(params.rfpId)
  const { mutate: reparse, isPending: reparseLoading } = useReparseUcf()
  
  const [jumpOpen, setJumpOpen] = React.useState(false)
  const gPressedAtRef = React.useRef<number | null>(null)

  // Use backend UCF if available, otherwise fallback to client-side mapping
  const useBackendUcf = ucfDoc?.detected && ucfDoc.sections.length > 0
  const parsed = (rfpData as any)?.parsedSections || []
  const clientUcf = mapSectionsToUCF(parsed)
  
  // Transform backend UCF sections into the same structure as client-side mapping
  const backendUcf = React.useMemo(() => {
    if (!ucfDoc?.sections) return {}
    const grouped: Record<string, any[]> = {}
    ucfDoc.sections.forEach(section => {
      if (!grouped[section.code]) grouped[section.code] = []
      grouped[section.code].push({
        id: section.id,
        type: section.title,
        summary: section.rawText?.substring(0, 200) + (section.rawText?.length > 200 ? '...' : ''),
        rawText: section.rawText,
        confidence: section.confidence,
        startPage: section.startPage,
        endPage: section.endPage,
      })
    })
    return grouped
  }, [ucfDoc])

  const ucf = useBackendUcf ? backendUcf : clientUcf
  const totalItems = useBackendUcf ? ucfDoc.sections.length : parsed.length
  const loading = rfpLoading || ucfLoading
  const error = rfpError || ucfError

  const sectionIds = React.useMemo(() => UCF_SECTIONS.map(s => `ucf-${s.id}`), [])
  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // open jump palette: period '.' or '\\'
      if ((e.key === '.' || e.key === '/') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setJumpOpen(v => !v)
        return
      }
      // g + <letter> to jump to UCF
      const now = Date.now()
      if (e.key.toLowerCase() === 'g') {
        gPressedAtRef.current = now
        return
      }
      if (gPressedAtRef.current && now - gPressedAtRef.current < 900) {
        const letter = e.key.toUpperCase()
        if (UCF_SECTIONS.some(s => s.id === letter as any)) {
          e.preventDefault()
          scrollToId(`ucf-${letter}`)
        }
        gPressedAtRef.current = null
        return
      }
      // j / k navigation across visible sections
      if ((e.key === 'j' || e.key === 'k') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const tops = sectionIds.map(id => ({ id, el: document.getElementById(id) })).filter(x => x.el) as { id: string; el: HTMLElement }[]
        const withTop = tops.map(t => ({ id: t.id, top: t.el.getBoundingClientRect().top }))
        const currentIdx = withTop.reduce((best, cur, idx) => {
          const isAbove = cur.top <= 24
          if (isAbove && (best === -1 || withTop[idx].top > withTop[best].top)) return idx
          return best
        }, -1)
        const nextIdx = e.key === 'j' ? Math.min((currentIdx + 1 + withTop.length) % withTop.length, withTop.length - 1) : Math.max(currentIdx - 1, 0)
        const target = withTop[nextIdx] || withTop[0]
        if (target) scrollToId(target.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sectionIds])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
  if (error) return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load UCF sections</AlertDescription>
      </Alert>
    </div>
  )

  const handleReparse = () => {
    reparse(params.rfpId, {
      onSuccess: () => {
        refetchUcf()
      }
    })
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="default" className="bg-green-500">High ({(confidence * 100).toFixed(0)}%)</Badge>
    if (confidence >= 0.7) return <Badge variant="default" className="bg-blue-500">Good ({(confidence * 100).toFixed(0)}%)</Badge>
    if (confidence >= 0.5) return <Badge variant="default" className="bg-yellow-500">Moderate ({(confidence * 100).toFixed(0)}%)</Badge>
    return <Badge variant="destructive">Low ({(confidence * 100).toFixed(0)}%)</Badge>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/workspace/${params.rfpId}`} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        {useBackendUcf && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReparse}
            disabled={reparseLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${reparseLoading ? 'animate-spin' : ''}`} />
            Reparse UCF
          </Button>
        )}
      </div>

      {!useBackendUcf && ucfError && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Backend UCF not available. Using client-side mapping as fallback.
          </AlertDescription>
        </Alert>
      )}

      <Card variant="glass-tinted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Uniform Contract Format (UCF)
                {useBackendUcf && ucfDoc?.confidence && getConfidenceBadge(ucfDoc.confidence)}
              </CardTitle>
              <CardDescription>
                Sections A–M organized from the solicitation
                {useBackendUcf && ` • Detected by ${ucfDoc?.parseMethod || 'rule-based'} parser`}
                {!useBackendUcf && ' • Client-side mapping'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white/60">{totalItems} items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left nav */}
            <div className="space-y-2 lg:sticky lg:top-20 self-start">
              {UCF_SECTIONS.map(s => (
                <Link key={s.id} href={`#ucf-${s.id}`} className="block px-3 py-2 rounded-md bg-white/80 hover:bg-white border text-sm transition-colors">
                  <span className="font-semibold mr-2">{s.id}</span>{s.title}
                  <span className="float-right text-xs text-gray-500">{(ucf[s.id] || []).length}</span>
                </Link>
              ))}
            </div>
            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {UCF_SECTIONS.map(s => (
                <motion.div key={s.id} id={`ucf-${s.id}`} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2 }}>
                  <Card variant="glass-subtle">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{s.id}. {s.title}</CardTitle>
                          <CardDescription>{s.purpose}</CardDescription>
                        </div>
                        <Link href={`/workspace/${params.rfpId}/sections/${s.id}`} className="text-sm text-blue-600 hover:underline">Open section</Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(ucf[s.id] || []).length === 0 ? (
                        <div className="text-sm text-gray-600">No parsed content mapped here.</div>
                      ) : (
                        <div className="space-y-3">
                          {(ucf[s.id] || []).slice(0,4).map((sec:any, idx:number)=> (
                            <motion.div key={sec.id || idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="p-3 border rounded-lg bg-white">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="text-sm font-medium text-gray-900">{sec.type || `Item ${idx+1}`}</div>
                                {useBackendUcf && sec.confidence && (
                                  <Badge variant="outline" className="text-xs">{(sec.confidence * 100).toFixed(0)}%</Badge>
                                )}
                              </div>
                              {sec.summary && <div className="text-sm text-gray-700 mb-1">{sec.summary}</div>}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>ID: {sec.id || 'n/a'}</span>
                                {useBackendUcf && sec.startPage && (
                                  <span>Pages: {sec.startPage}{sec.endPage && sec.endPage !== sec.startPage ? `-${sec.endPage}` : ''}</span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {(ucf[s.id] || []).length > 4 && (
                            <div className="text-xs text-gray-500">… and {(ucf[s.id] || []).length - 4} more</div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Floating Jump menu */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button variant="frosted" size="lg" onClick={() => setJumpOpen(v => !v)}>Jump to</Button>
        {jumpOpen && (
          <div className="mt-2 w-64 rounded-xl border bg-white shadow-lg p-2">
            <div className="px-2 py-1 text-xs text-gray-500">UCF Sections (Press G + letter)</div>
            <div className="max-h-64 overflow-auto">
              {UCF_SECTIONS.map(s => (
                <button key={s.id} onClick={() => { scrollToId(`ucf-${s.id}`); setJumpOpen(false) }} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm">
                  <span className="font-semibold mr-2">{s.id}</span>{s.title}
                  <span className="float-right text-xs text-gray-500">{(ucf[s.id] || []).length}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


