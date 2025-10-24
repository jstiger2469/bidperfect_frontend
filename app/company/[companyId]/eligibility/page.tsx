'use client'

import React from 'react'
import { useRunCompanyEligibility, useCompanyEligibilityHistory } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CompanyEligibilityPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const history = useCompanyEligibilityHistory(companyId)
  const run = useRunCompanyEligibility()

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Eligibility</CardTitle>
        <Button size="sm" variant="outline" onClick={() => run.mutate({ companyId, data: { refresh: true } })}>Run Check</Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {(history.data || []).map((h: any) => (
            <div key={h.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{h.result?.status || 'Result'}</div>
                <div className="text-xs text-gray-500">{h.createdAt}</div>
              </div>
              <div className="text-xs text-gray-600">Score: {h.result?.score ?? '—'}</div>
            </div>
          ))}
          {(history.data || []).length === 0 && (
            <div className="py-8 text-center text-gray-500">No eligibility runs yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}







