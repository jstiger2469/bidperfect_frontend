'use client'

import React from 'react'
import FileUploadZone from '@/components/FileUploadZone'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'

export interface Attachment {
  fileId: string
  name?: string
  url?: string
  type?: string
}

interface UploadFieldProps {
  label?: string
  description?: string
  value: Attachment[]
  onChange: (attachments: Attachment[]) => void
  accept?: string[]
  maxFiles?: number
  maxSizeMb?: number
  className?: string
  enableTypeTagging?: boolean
  typeOptions?: string[]
}

export default function UploadField({
  label,
  description,
  value,
  onChange,
  accept = ['.pdf', '.doc', '.docx', '.txt', '.zip'],
  maxFiles = 10,
  maxSizeMb = 50,
  className = '',
  enableTypeTagging = false,
  typeOptions = ['Resume', 'Certification', 'Clearance', 'Evidence', 'Other']
}: UploadFieldProps) {
  const [busy, setBusy] = React.useState(false)

  const handleUpload = async (items: Array<{ file: File }>) => {
    setBusy(true)
    try {
      const uploaded = await Promise.all(
        items.map(async (it) => {
          const form = new FormData()
          form.append('file', it.file)
          const res = await apiClient.uploadFile(form)
          return { fileId: res.fileId, name: it.file.name, url: res.url } as Attachment
        })
      )
      onChange([...(value || []), ...uploaded])
    } finally {
      setBusy(false)
    }
  }

  const removeAttachment = (idx: number) => {
    const next = [...(value || [])]
    next.splice(idx, 1)
    onChange(next)
  }

  const setType = (idx: number, type: string) => {
    const next = [...(value || [])]
    next[idx] = { ...next[idx], type }
    onChange(next)
  }

  return (
    <div className={className}>
      {(label || description) && (
        <div className="mb-2">
          {label && <div className="text-sm font-medium text-gray-800">{label}</div>}
          {description && <div className="text-xs text-gray-500">{description}</div>}
        </div>
      )}

      <FileUploadZone
        onFilesSelected={() => {}}
        onUpload={async (files) => {
          await handleUpload(files.map(f => ({ file: f.file })))}
        }
        acceptedTypes={accept}
        maxFiles={maxFiles}
        maxSize={maxSizeMb}
      />

      {value && value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((a, idx) => (
            <div key={`${a.fileId}-${idx}`} className="flex items-center justify-between p-2 border rounded-md bg-white">
              <div className="text-sm text-gray-700 truncate">
                {a.name || a.url || a.fileId}
              </div>
              <div className="flex items-center gap-2">
                {enableTypeTagging && (
                  <select
                    className="text-xs border rounded-md px-2 py-1 bg-white"
                    value={a.type || ''}
                    onChange={(e) => setType(idx, e.target.value)}
                  >
                    <option value="">Type…</option>
                    {typeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {a.url && (
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                )}
                <Button size="sm" variant="ghost" onClick={() => removeAttachment(idx)} disabled={busy}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
