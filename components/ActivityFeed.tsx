'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuditLogs, useCompanyAuditLogs, useOpportunityAuditLogs } from '@/lib/hooks'

type Scope = { companyId?: string; opportunityId?: string; filters?: any; limit?: number; offset?: number }

export default function ActivityFeed({ title = 'Activity', scope = {} as Scope }: { title?: string; scope?: Scope }) {
  const { companyId, opportunityId, limit = 20, offset = 0, filters = {} } = scope

  const listQuery = companyId
    ? useCompanyAuditLogs(companyId, { limit, offset })
    : opportunityId
    ? useOpportunityAuditLogs(opportunityId, { limit, offset })
    : useAuditLogs({ ...filters, limit, offset })

  const logs = (listQuery.data as any)?.logs || []
  const stats = (listQuery.data as any)?.pagination

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {listQuery.isLoading ? (
          <div className="text-sm text-gray-600 py-4">Loading activity…</div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-gray-600 py-4">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{log.actorName || 'System'}</span>
                      <span className="text-gray-500">{log.action}</span>
                      <span className="text-gray-700">{log.entity}</span>
                      {log.entityLabel && <span className="font-medium">“{log.entityLabel}”</span>}
                      <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {Array.isArray(log.changedFields) && log.changedFields.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">Changed: {log.changedFields.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">{log.action}</Badge>
                  </div>
                </div>
              </div>
            ))}

            {stats && (
              <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                <span>Total: {stats.total}</span>
                <span>Page: {Math.floor((stats.offset || 0) / (stats.limit || 1)) + 1}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


