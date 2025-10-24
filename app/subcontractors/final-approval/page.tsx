"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const APPROVAL_OVERVIEW = {
  totalInvited: 8,
  ready: 5,
  pending: 1,
  needReview: 2,
  failed: 2
};

const SUBCONTRACTORS = [
  {
    id: 1,
    name: "Alice Jefferson",
    company: "Detail MechanicsAI, Inc.",
    status: "Approved",
    statusColor: "green",
    actions: ["Approved"]
  },
  {
    id: 2,
    name: "Christina Harris",
    company: "Swirl Electrical",
    status: "Approved",
    statusColor: "green", 
    actions: ["Pending"]
  },
  {
    id: 3,
    name: "Wade Garrett",
    company: "Alt PIC Technologies",
    status: "Approved",
    statusColor: "green",
    actions: ["Needs Review"]
  },
  {
    id: 4,
    name: "Scott Mitchell",
    company: "Expoll UVAC Services",
    status: "Needs review",
    statusColor: "yellow",
    actions: ["Review"]
  },
  {
    id: 5,
    name: "Bob Wayne",
    company: "Primaciple Plumbing Inc.",
    status: "Needs Review",
    statusColor: "yellow",
    actions: ["Rejected"]
  },
  {
    id: 6,
    name: "Peter Rivera",
    company: "Suprems Contrate Services",
    status: "Needs Review",
    statusColor: "yellow",
    actions: ["Review"]
  },
  {
    id: 7,
    name: "Theoan O'Donnell",
    company: "River City Building Co.",
    status: "Rejected",
    statusColor: "red",
    actions: ["Details"]
  }
];

function ApprovalOverview() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subcontractor Final Approval</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">All statuses</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Review list</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100/80 text-yellow-700 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">2 Failed</span>
            </div>
            <span className="text-sm text-gray-600">Status</span>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">
          Submit Proposal
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        {APPROVAL_OVERVIEW.ready} ready / {APPROVAL_OVERVIEW.pending} pending / {APPROVAL_OVERVIEW.needReview} need review
      </div>
    </div>
  );
}

function SubcontractorList() {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100/80 text-green-700';
      case 'yellow':
        return 'bg-yellow-100/80 text-yellow-700';
      case 'red':
        return 'bg-red-100/80 text-red-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  const getStatusIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'yellow':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'red':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Approved':
        return 'bg-green-100/80 text-green-700';
      case 'Pending':
        return 'bg-gray-100/80 text-gray-700';
      case 'Needs Review':
      case 'Review':
        return 'bg-yellow-100/80 text-yellow-700';
      case 'Rejected':
        return 'bg-red-100/80 text-red-700';
      case 'Details':
        return 'bg-blue-100/80 text-blue-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="space-y-4">
        {SUBCONTRACTORS.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-4 border border-gray-200/50 rounded-2xl hover:bg-white/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{sub.name}</h3>
                <p className="text-sm text-gray-600">{sub.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(sub.statusColor)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.statusColor)}`}>
                  {sub.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {sub.actions.map((action, index) => (
                  <button 
                    key={index}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${getActionColor(action)}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
              
              <button className="p-1 hover:bg-gray-100/50 rounded">
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalSidebar() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Overview of all invited subcontractors</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Invited</span>
          <span className="font-bold text-gray-800">{APPROVAL_OVERVIEW.totalInvited}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Ready</span>
          <span className="font-bold text-green-700">{APPROVAL_OVERVIEW.ready}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Pending</span>
          <span className="font-bold text-yellow-700">{APPROVAL_OVERVIEW.pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Need Review</span>
          <span className="font-bold text-orange-700">{APPROVAL_OVERVIEW.needReview}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Readiness checklists per sub</h4>
        <p className="text-sm text-gray-600">Filter by: Approved / Rejected /Pending</p>
        <p className="text-sm text-gray-600">Final submission button: "Add to Proposal"</p>
      </div>
    </div>
  );
}

export default function SubcontractorFinalApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/subcontractors')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Subcontractors</span>
          </button>
        </div>

        <ApprovalOverview />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Subcontractor List */}
          <div className="lg:col-span-3">
            <SubcontractorList />
          </div>

          {/* Right Column - Overview Sidebar */}
          <div>
            <ApprovalSidebar />
          </div>
        </div>
      </div>
    </div>
  );
} 