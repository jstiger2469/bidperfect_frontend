'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Filter, ArrowRight, AlertTriangle, Plus } from 'lucide-react'
import { useOpportunities } from '@/lib/hooks'
import { formatDate } from '@/lib/utils'

export default function OpportunitiesPage() {
  const router = useRouter()
  const { data, isLoading, error } = useOpportunities({ limit: 50 })
  const items = data?.items || []

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
            <p className="text-gray-600">All pursuits in one place</p>
          </div>
          <div className="flex gap-2">
            <Button variant="frosted" onClick={() => router.push('/ingest')}>
              <Plus className="w-4 h-4 mr-2" /> Ingest RFP
            </Button>
            <Button variant="ghost">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Failed to load opportunities</p>
            <p className="text-gray-600 text-sm">{(error as any).message}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No opportunities yet</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/ingest')}>Ingest your first RFP</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((rfp: any, index: number) => {
              const daysLeft = rfp.dueAt ? Math.ceil((new Date(rfp.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
              const priority = daysLeft <= 7 ? 'critical' : daysLeft <= 14 ? 'high' : 'medium'
              return (
                <motion.div key={rfp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.02 }}>
                  <Card className="group hover:shadow-md transition-all cursor-pointer" onClick={() => router.push(`/workspace/${rfp.id}`)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{rfp.title}</h3>
                            <Badge variant="outline">{rfp.agency || 'Agency'}</Badge>
                            <Badge className={`text-xs ${priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">Updated {formatDate(rfp.updatedAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm">View <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}




