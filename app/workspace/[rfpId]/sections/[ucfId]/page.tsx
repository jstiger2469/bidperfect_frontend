'use client'

import React from 'react'
import { useRFPData, useUcfSection } from '@/lib/hooks'
import { mapSectionsToUCF, UCF_SECTIONS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UCFDetailPage({ params }: { params: { rfpId: string; ucfId: string } }) {
  const code = (params.ucfId || 'A').toUpperCase()
  const meta = UCF_SECTIONS.find(s => s.id === code)
  
  // Try backend UCF first
  const { data: ucfSection, isLoading: ucfLoading, error: ucfError } = useUcfSection(params.rfpId, code)
  
  // Fallback to client-side mapping
  const { data: rfpData, loading: rfpLoading, error: rfpError } = useRFPData(params.rfpId)
  const parsed = (rfpData as any)?.parsedSections || []
  const clientUcf = mapSectionsToUCF(parsed)
  const clientItems = (clientUcf as any)[code] || []

  const loading = ucfLoading || rfpLoading
  const error = (ucfError && rfpError) ? 'Failed to load section' : null
  const useBackend = ucfSection && !ucfError
  
  const items = useBackend ? [ucfSection] : clientItems

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
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/workspace/${params.rfpId}/sections`} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to UCF Overview
        </Link>
      </div>

      {!useBackend && ucfError && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Backend UCF not available. Using client-side mapping as fallback.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          UCF {meta?.id}. {meta?.title}
          {useBackend && ucfSection.confidence && (
            <Badge variant="outline" className="text-xs">
              {(ucfSection.confidence * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </h1>
        <p className="text-gray-600 text-sm mt-1">{meta?.purpose}</p>
        {useBackend && ucfSection.startPage && (
          <p className="text-gray-500 text-xs mt-1">
            Pages: {ucfSection.startPage}{ucfSection.endPage && ucfSection.endPage !== ucfSection.startPage ? `-${ucfSection.endPage}` : ''}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">No content detected in this section.</div>
          </CardContent>
        </Card>
      ) : (
        items.map((sec:any, idx:number)=> (
          <Card key={sec.id || idx}>
            <CardHeader>
              <CardTitle className="text-base">{useBackend ? sec.title : (sec.type || `Item ${idx+1}`)}</CardTitle>
              {useBackend && (
                <CardDescription className="flex items-center gap-3 text-xs">
                  <span>ID: {sec.id}</span>
                  {sec.startPage && (
                    <span>Pages: {sec.startPage}{sec.endPage && sec.endPage !== sec.startPage ? `-${sec.endPage}` : ''}</span>
                  )}
                  {sec.confidence && (
                    <Badge variant="outline" className="text-xs">{(sec.confidence * 100).toFixed(0)}%</Badge>
                  )}
                </CardDescription>
              )}
              {!useBackend && (
                <CardDescription className="text-xs">ID: {sec.id || 'n/a'}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {sec.summary && <div className="mb-3 text-sm text-gray-700">{sec.summary}</div>}
              {useBackend && sec.rawText && (
                <div className="text-sm bg-gray-50 p-4 rounded-lg border max-h-96 overflow-auto whitespace-pre-wrap">
                  {sec.rawText}
                </div>
              )}
              {!useBackend && sec.content && (
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
{typeof sec.content === 'string' ? sec.content : JSON.stringify(sec.content, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}




