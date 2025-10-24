"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Tab navigation
const TABS = [
  { id: 'overview', title: 'Overview' },
  { id: 'invoice-builder', title: 'Invoice Builder' },
  { id: 'clin-billing', title: 'CLIN Billing Matrix' },
  { id: 'export-submission', title: 'Export & Submission' }
];

// Invoice status data
const INVOICE_STATUS = [
  { label: 'Submitted', count: 3 },
  { label: 'Under Review', count: 1 },
  { label: 'Approved', count: 5 },
  { label: 'Paid', count: 18 }
];

// Aging tracker data
const AGING_DATA = [
  { label: '30 days', percentage: 60, color: 'bg-red-500' },
  { label: '15-30 days', percentage: 25, color: 'bg-yellow-500' },
  { label: '15 days', percentage: 15, color: 'bg-green-500' }
];

// Alerts data
const ALERTS = [
  { 
    id: 1, 
    title: 'INV-00004 is overdue (+7 days)',
    icon: ExclamationTriangleIcon,
    color: 'text-red-500'
  },
  { 
    id: 2, 
    title: 'INV-00002 was reviewed',
    icon: CheckCircleIcon,
    color: 'text-blue-500'
  },
  { 
    id: 3, 
    title: 'INV-00002 was rejected',
    icon: ExclamationTriangleIcon,
    color: 'text-red-500'
  },
  { 
    id: 4, 
    title: 'INV-00001 pending review',
    icon: ClockIcon,
    color: 'text-yellow-500'
  }
];

// Invoice table data
const INVOICES = [
  {
    id: 'INV-00008',
    rfpContract: 'Grounds Maintenance Services',
    subcontractor: 'Keystone Partners',
    status: 'Submitted',
    statusColor: 'bg-blue-500',
    total: '$12,850.00'
  },
  {
    id: 'INV-00007',
    rfpContract: 'Data Center Network Upgrade',
    subcontractor: 'Lucas Associates',
    status: 'Pending Review',
    statusColor: 'bg-yellow-500',
    total: '$23,400.00'
  },
  {
    id: 'INV-00006',
    rfpContract: 'Conference Planning',
    subcontractor: '—',
    status: 'Approved',
    statusColor: 'bg-green-500',
    total: '$3,200.00'
  },
  {
    id: 'INV-00005',
    rfpContract: 'Pattaborets Taunning',
    subcontractor: '$17,600.00',
    status: 'Paid',
    statusColor: 'bg-gray-500',
    total: '$17,600.00'
  }
];

export default function PaymentInvoicingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      {/* Header */}
      <motion.div 
        className="bg-white/50 backdrop-blur-xl border-b border-white/30 shadow-2xl shadow-black/10 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={() => router.push('/')}
                className="bg-white/15 backdrop-blur-lg border border-white/20 shadow-xl shadow-black/5 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </motion.button>
              <div>
                <motion.h1 
                  className="text-3xl font-bold text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Payment & Invoicing
                </motion.h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
              <motion.button 
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <motion.div 
            className="bg-white/15 backdrop-blur-lg border border-white/20 shadow-xl shadow-black/5 rounded-2xl p-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex space-x-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/30"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Invoice Status Cards */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Invoices</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {INVOICE_STATUS.map((status, index) => (
                  <motion.div
                    key={status.label}
                    className="bg-white/15 backdrop-blur-lg border border-white/20 shadow-xl shadow-black/5 p-6 rounded-2xl text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-gray-600 text-sm font-medium mb-2">{status.label}</h3>
                    <div className="text-4xl font-bold text-gray-800 mb-2">{status.count}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Aging Tracker */}
            <motion.div
              className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Aging Tracker</h3>
              <div className="space-y-3">
                {AGING_DATA.map((item, index) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className={`h-2 rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Alerts */}
            <motion.div
              className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Alerts</h3>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {ALERTS.map((alert, index) => {
                  const Icon = alert.icon;
                  return (
                    <motion.div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-white/20 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${alert.color}`} />
                        <span className="font-medium text-gray-800">{alert.title}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Invoice Table */}
            <motion.div
              className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Invoice</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">RFP | Contract</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subcontractor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICES.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        className="border-t border-white/10 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.7 }}
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{invoice.id}</td>
                        <td className="px-6 py-4 text-gray-700">{invoice.rfpContract}</td>
                        <td className="px-6 py-4 text-gray-700">{invoice.subcontractor}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${invoice.statusColor}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{invoice.total}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Other tabs content */}
        {activeTab !== 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 p-12 rounded-2xl text-center"
          >
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {TABS.find(tab => tab.id === activeTab)?.title}
            </h3>
            <p className="text-gray-600">This section is under development and will be available soon.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 