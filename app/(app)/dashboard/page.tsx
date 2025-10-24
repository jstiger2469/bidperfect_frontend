"use client"

import { motion } from 'framer-motion'
import {
  FolderOpen,
  Users,
  FileText,
  BarChart3,
  Calendar,
  Zap,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Target,
  Bell,
  Settings,
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  MoreHorizontal,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOpportunities, useHealthCheck } from '@/lib/hooks'
import { formatDate, formatCurrency } from '@/lib/utils'

const QUICK_INSIGHTS = [
  {
    title: 'Electrical subcontractor needed',
    description: 'HVAC RFP requires electrical specialist',
    action: 'Review 3 options',
    type: 'action',
    urgency: 'high',
  },
  {
    title: 'Ready for final review',
    description: 'IT Infrastructure at 87% completion',
    action: 'Schedule review',
    type: 'ready',
    urgency: 'medium',
  },
  {
    title: 'Compliance deadline approaching',
    description: '2 documents pending verification',
    action: 'Upload docs',
    type: 'warning',
    urgency: 'high',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: opportunitiesData, isLoading: opportunitiesLoading, error: opportunitiesError } = useOpportunities({ limit: 10 })
  useHealthCheck()

  const activeRFPs = opportunitiesData?.items || []
  const totalRFPs = (opportunitiesData as any)?.total ?? activeRFPs.length
  const totalValue = activeRFPs.reduce((sum, rfp) => {
    const value = rfp.title.includes('$') ? 150000 : 100000
    return sum + value
  }, 0)

  const avgReadiness = activeRFPs.length > 0 ? Math.round(activeRFPs.reduce((sum) => sum + 65, 0) / activeRFPs.length) : 0

  // Placeholder operational KPIs (wire to real analytics when available)
  const kpiWinRate = 24 // %
  const kpiAvgResponseHours = 36 // hours

  const criticalCount = activeRFPs.filter((rfp) => {
    if (!rfp.dueAt) return false
    const daysLeft = Math.ceil((new Date(rfp.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 7
  }).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'review':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'planning':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 80) return 'text-emerald-600'
    if (readiness >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero readiness banner with checklist and clear CTAs */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="rounded-2xl p-6 md:p-7 bg-gradient-to-br from-white/70 via-white/50 to-blue-50/60 border border-white/40 backdrop-blur-xl backdrop-saturate-150 shadow-glass ring-1 ring-white/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Your readiness plan</h1>
                </div>
                <p className="text-gray-600 mb-4">Finish these to be Fortune‑500 ready.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ label: 'Complete company profile', done: true }, { label: 'Upload compliance documents', done: false }, { label: 'Invite team & assign roles', done: false }, { label: 'Sync SAM & registrations', done: true }].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-white/40 bg-white/40 backdrop-blur-md px-3 py-2">
                      {t.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-sm text-gray-800">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="text-sm text-gray-600">Active RFPs</div>
                <div className="text-3xl font-semibold text-gray-900">{activeRFPs.length}</div>
                <div className="flex gap-2 mt-2">
                  <Button variant="frosted" size="lg" onClick={() => router.push('/ingest')}>
                    <Plus className="w-4 h-4 mr-2" /> Ingest RFP
                  </Button>
                  <Button variant="glass" onClick={() => router.push('/documents')}>Upload Docs</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { label: 'Total Opportunities', value: totalRFPs.toString(), change: '+2', trend: 'up' as const, icon: FolderOpen },
            { label: 'Active', value: activeRFPs.length.toString(), change: criticalCount > 0 ? `-${criticalCount}` : '+0', trend: criticalCount > 0 ? 'down' as const : 'up' as const, icon: Target },
            { label: 'Win Rate', value: `${kpiWinRate}%`, change: '+3%', trend: 'up' as const, icon: BarChart3 },
            { label: 'Avg Response', value: `${kpiAvgResponseHours}h`, change: '-4h', trend: 'up' as const, icon: Clock },
          ].map((metric) => (
            <Card key={metric.label} className="bg-white border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                      <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{metric.change}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Active RFPs</h2>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {opportunitiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading opportunities...</p>
                  </div>
                ) : opportunitiesError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">Failed to load opportunities</p>
                    <p className="text-gray-600 text-sm">{(opportunitiesError as any).message}</p>
                  </div>
                ) : activeRFPs.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active opportunities found</p>
                  </div>
                ) : (
                  activeRFPs.map((rfp, index) => {
                    const daysLeft = rfp.dueAt ? Math.ceil((new Date(rfp.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                    const priority = daysLeft <= 7 ? 'critical' : daysLeft <= 14 ? 'high' : 'medium'
                    const status = 'in-progress'
                    const readiness = 65

                    return (
                      <motion.div key={rfp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                        <Card className="glass-card border-gray-200/40 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => router.push(`/workspace/${rfp.id}`)}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{rfp.title}</h3>
                                  <Badge className={`text-xs font-medium ${getPriorityColor(priority)}`}>{priority}</Badge>
                                  <Badge variant="outline" className={getStatusColor(status)}>
                                    {status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{rfp.agency}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className={`text-sm font-semibold ${getReadinessColor(readiness)}`}>{readiness}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${readiness}%` }} />
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">{daysLeft}</p>
                                <p className="text-xs text-gray-600">days left</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">4</p>
                                <p className="text-xs text-gray-600">team</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">12</p>
                                <p className="text-xs text-gray-600">docs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">$150K</p>
                                <p className="text-xs text-gray-600">value</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Updated {formatDate(rfp.updatedAt)}</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                                  <Edit3 className="w-4 h-4 mr-1" />
                                  Continue
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Card className="glass-primary border-blue-200/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">Spirit AI Assistant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {QUICK_INSIGHTS.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        insight.urgency === 'high' ? 'bg-red-50 border-red-200' : insight.type === 'ready' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${insight.urgency === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-1">{insight.title}</p>
                          <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                          <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                            {insight.action} →
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <Card className="bg-white border-gray-200/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: Users, label: 'Manage Subcontractors', path: '/subcontractors' },
                    { icon: FileText, label: 'Upload Documents', path: '/documents' },
                    { icon: BarChart3, label: 'View Analytics', path: '/progress-demo' },
                    { icon: Calendar, label: 'Schedule Review', path: '/availability' },
                  ].map((action) => (
                    <Button key={action.label} variant="ghost" className="w-full justify-start h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => router.push(action.path)}>
                      <action.icon className="w-4 h-4 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <Card className="bg-white border-gray-200/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'Compliance matrix updated', time: '2h ago', type: 'update' },
                    { action: 'Statewide HVAC approved', time: '4h ago', type: 'approval' },
                    { action: 'New team member added', time: '6h ago', type: 'team' },
                    { action: 'Document uploaded', time: '1d ago', type: 'document' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 py-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

//


