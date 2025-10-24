'use client'

import React from 'react'
import { useCompanyRateCards } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CompanyRatesPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const rateCards = useCompanyRateCards(companyId)

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Rate Cards</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">New Rate Card</Button>
          <Button size="sm" variant="outline">Import CSV</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(rateCards.data || []).map((rc: any) => (
            <div key={rc.id} className="p-3 border rounded">
              <div className="font-medium text-gray-900">Version {rc.version}</div>
              <div className="text-xs text-gray-500">Items: {(rc.items || []).length}</div>
            </div>
          ))}
          {(rateCards.data || []).length === 0 && (
            <div className="py-8 text-center text-gray-500">No rate cards yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}






