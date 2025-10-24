'use client'

import React, { useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SimpleFileUploadProps {
  onUploadComplete: (files: Array<{ fileId: string; filename: string }>) => void
  accept?: string
  multiple?: boolean
  label?: string
  description?: string
  className?: string
  documentType?: string // For categorizing uploads (e.g., 'insurance', 'certificate')
}

export default function SimpleFileUpload({
  onUploadComplete,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = false,
  label = 'Drop files here',
  description = 'or click to browse',
  className = '',
  documentType = 'general',
}: SimpleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList)
    
    if (!multiple && files.length > 1) {
      toast.error('Only one file allowed')
      return
    }

    // Validate file sizes (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      toast.error(`File too large. Maximum size is 10MB.`)
      return
    }

    setIsUploading(true)

    try {
      // Upload files one by one (could be parallelized with Promise.all)
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          // Create form data
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', documentType)

          // Upload to backend
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }))
            throw new Error(error.error || `Failed to upload ${file.name}`)
          }

          const data = await response.json()

          return {
            fileId: data.fileKey, // Real S3 key from backend
            filename: data.filename || file.name,
          }
        })
      )

      // Show success toast
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
      
      // Call callback with uploaded files
      onUploadComplete(uploadedFiles)
      
    } catch (error: any) {
      console.error('[SimpleFileUpload] Upload error:', error)
      toast.error(error.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const fileList = e.dataTransfer.files
    if (fileList.length > 0) {
      handleFiles(fileList)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList && fileList.length > 0) {
      handleFiles(fileList)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-all duration-200
          ${isUploading 
            ? 'border-blue-500 bg-blue-50 cursor-wait' 
            : isDragOver 
              ? 'border-blue-500 bg-blue-50 cursor-pointer' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-700">Uploading...</p>
                <p className="text-xs text-blue-600">Please wait</p>
              </div>
            </>
          ) : (
            <>
              <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              {multiple && (
                <p className="text-xs text-gray-400 mt-1">Multiple files allowed</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

