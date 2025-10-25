'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Upload, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FirstRfpSchema } from '@/lib/onboarding-types'
import { useStepSaver } from '@/lib/useOnboarding'
import FileUploadZone from '@/components/FileUploadZone'
import type { z } from 'zod'

type FormData = z.infer<typeof FirstRfpSchema>

export function FirstRfpStep({ onContinue }: { onContinue: () => void }) {
  const { watch, setValue, handleSubmit, formState: { isValid } } = useForm<FormData>({
    resolver: zodResolver(FirstRfpSchema),
    defaultValues: { mode: 'skip' },
    mode: 'onChange',
  })

  const { saveImmediate, isSaving } = useStepSaver({
    step: 'FIRST_RFP',
    onSuccess: (response) => {
      clearPendingChanges()
      if (response.nextStep) onContinue()
    },
  })

  const currentData = watch()
  const mode = currentData.mode

  // Simple no-op function for backward compatibility
  const clearPendingChanges = () => {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          Upload Your First RFP
        </h2>
        <p className="text-gray-600 mt-2">Get started by uploading an RFP or try a sample</p>
        <Badge variant="secondary" className="mt-2">Optional</Badge>
      </div>

      <form onSubmit={handleSubmit((data) => saveImmediate(data))} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={mode === 'upload' ? 'border-blue-500 bg-blue-50' : 'cursor-pointer'} onClick={() => setValue('mode', 'upload')}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload RFP
              </CardTitle>
              <CardDescription>Upload a PDF, DOCX, or ZIP file</CardDescription>
            </CardHeader>
          </Card>

          <Card className={mode === 'sample' ? 'border-blue-500 bg-blue-50' : 'cursor-pointer'} onClick={() => setValue('mode', 'sample')}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Try Sample
              </CardTitle>
              <CardDescription>Explore with a sample RFP</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {mode === 'upload' && (
          <Card>
            <CardContent className="pt-6">
              <FileUploadZone
                onUploadComplete={(files) => {
                  if (files[0]) setValue('fileId', files[0].fileId)
                }}
                accept=".pdf,.docx,.zip"
              />
            </CardContent>
          </Card>
        )}

        {mode === 'sample' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select a Sample RFP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Construction Project', 'IT Services', 'Professional Services'].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setValue('sampleId', `sample-${i}`)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                  >
                    <p className="font-medium">{sample}</p>
                    <p className="text-sm text-gray-600">Sample solicitation document</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => saveImmediate(currentData)}
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  )
}

