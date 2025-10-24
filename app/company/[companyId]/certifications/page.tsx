'use client'

import React from 'react'
import { useCompanyCerts } from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CompanyCertificationsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const [companyId, setCompanyId] = React.useState('')
  React.useEffect(() => { params.then(p => setCompanyId(p.companyId)) }, [params])
  const certs = useCompanyCerts(companyId)

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Certifications</CardTitle>
        <Button size="sm" variant="outline">Add Certification</Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {(certs.data?.items || []).map((c: any) => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{c.type}</div>
                <div className="text-xs text-gray-500">Issuer: {c.issuer} · Expires: {c.expires || '—'}</div>
              </div>
              <div className="text-xs text-gray-600">Status: {c.status || '—'}</div>
            </div>
          ))}
          {certs.data?.items?.length === 0 && (
            <div className="py-8 text-center text-gray-500">No certifications yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}






