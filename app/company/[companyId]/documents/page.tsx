'use client'

import React from 'react'
import { useCompanyDocuments } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileUploadZone from '@/components/FileUploadZone'
import { apiClient } from '@/lib/api'

export default function CompanyDocumentsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const docs = useCompanyDocuments(companyId)
  const [uploading, setUploading] = React.useState(false)
  const [docType, setDocType] = React.useState<string>('')
  const [docTags, setDocTags] = React.useState<string[]>([])

  const onUploadDocs = async (items: any[]) => {
    if (!companyId) return
    setUploading(true)
    try {
      for (const it of items) {
        try {
          const fd = new FormData(); fd.append('file', it.file)
          const res = await apiClient.uploadFile(fd)
          await fetch('/api/company-documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, document: {
              type: docType || undefined,
              tags: docTags.length ? docTags : undefined,
              files: [{ fileId: res.fileId, name: it.file.name }],
            } }),
          })
        } catch {}
      }
    } finally {
      setUploading(false)
      docs.refetch?.()
      setDocType('')
      setDocTags([])
    }
  }

  return (
    <Card variant="glass">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <div className="text-xs text-gray-600">Drag and drop files below to upload</div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="w-full h-10 rounded-lg border px-3 text-sm"
              placeholder="Type (e.g., COI, W-9, Resume)"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
            <input
              className="w-full h-10 rounded-lg border px-3 text-sm"
              placeholder="Tags (comma separated)"
              value={docTags.join(', ')}
              onChange={(e) => setDocTags(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </div>
          <FileUploadZone
            onFilesSelected={() => {}}
            onUpload={onUploadDocs}
            acceptedTypes={[ '.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt', '.zip' ]}
            maxFiles={20}
            maxSize={100}
          />
        </div>
        <div className="divide-y">
          {(docs.data?.items || []).map((d: any) => (
            <div key={d.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{d.type}</div>
                <div className="text-xs text-gray-500">{d.filename || d.storageKey}</div>
              </div>
              <div className="text-xs text-gray-600">Expires: {d.expires || '—'}</div>
            </div>
          ))}
          {docs.data?.items?.length === 0 && (
            <div className="py-8 text-center text-gray-500">No documents yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}




