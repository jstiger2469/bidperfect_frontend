"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const CONTRACTORS = [
  {
    id: 1,
    name: "Eco Renew",
    type: "Electrical – DBE",
    status: "Scope sent",
    statusColor: "blue",
    icon: "🌱"
  },
  {
    id: 2,
    name: "GreenBuild Inc.",
    type: "General Contracting",
    status: "Reviewed",
    statusColor: "orange",
    icon: "👷"
  },
  {
    id: 3,
    name: "SolarCraft",
    type: "Solar Installation",
    status: "Requesting changes",
    statusColor: "yellow",
    icon: "☀️"
  },
  {
    id: 4,
    name: "CleanSweep Group",
    type: "Property Maintenance",
    status: "Confirmed",
    statusColor: "green",
    icon: "🧹"
  }
];

const SCOPE_ITEMS = [
  { task: "Install electrical wiring", role: "Journeyman Electrician", completed: true },
  { task: "Equipment connection", role: "Instrument Electrician", completed: true },
  { task: "Site cleanup", role: "Receiving Clerk", completed: true }
];

const SCOPE_DETAILS = {
  wageDetermination: "Laus 12 Sbc",
  pricing: "$73,500",
  pricingNote: "Pricing submitted is below market avg for NAICS 238210"
};

const SPIRIT_INSIGHTS = [
  "Consider splitting Site Cleanup between Vendor A and B to shorten schedule optimization.",
  "This subcontractor lacks valid OSHA cert, reassign?"
];

function ContractorCard({ contractor }: { contractor: typeof CONTRACTORS[0] }) {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100/80 text-blue-700 border-blue-200/50';
      case 'orange':
        return 'bg-orange-100/80 text-orange-700 border-orange-200/50';
      case 'yellow':
        return 'bg-yellow-100/80 text-yellow-700 border-yellow-200/50';
      case 'green':
        return 'bg-green-100/80 text-green-700 border-green-200/50';
      default:
        return 'bg-gray-100/80 text-gray-700 border-gray-200/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scope sent':
        return <ClockIcon className="w-5 h-5" />;
      case 'Reviewed':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'Requesting changes':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'Confirmed':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-100/80 rounded-2xl flex items-center justify-center text-2xl">
          {contractor.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800">{contractor.name}</h3>
          <p className="text-sm text-gray-600">{contractor.type}</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${getStatusColor(contractor.statusColor)}`}>
        {getStatusIcon(contractor.status)}
        <span className="text-sm font-medium">{contractor.status}</span>
      </div>
      
      {contractor.status === 'Requesting changes' && (
        <div className="mt-4 p-3 bg-yellow-50/80 rounded-xl border border-yellow-200/50">
          <p className="text-sm text-yellow-800">Changes requested to electrical scope</p>
        </div>
      )}
    </div>
  );
}

function ScopeSummary() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Scope Summary</h3>
        <button className="p-2 hover:bg-gray-100/50 rounded-lg">
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-4 mb-6">
        {SCOPE_ITEMS.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-gray-800">{item.task}</p>
              <p className="text-sm text-gray-600">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200/50 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Wage Determination</span>
          <span className="font-medium text-gray-800">{SCOPE_DETAILS.wageDetermination}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pricing</span>
          <span className="font-bold text-gray-800 text-lg">{SCOPE_DETAILS.pricing}</span>
        </div>
        <div className="flex items-start gap-2 p-3 bg-orange-50/80 rounded-xl">
          <ExclamationTriangleIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-orange-800">{SCOPE_DETAILS.pricingNote}</p>
        </div>
      </div>
      
      <div className="mt-6 flex gap-3">
        <button className="flex-1 bg-blue-100/80 text-blue-700 rounded-xl py-3 hover:bg-blue-200/80 transition-all duration-200 font-medium">
          Request Revisions
        </button>
        <button className="flex-1 bg-green-100/80 text-green-700 rounded-xl py-3 hover:bg-green-200/80 transition-all duration-200 font-medium">
          Accept Scope
        </button>
        <button className="px-4 py-3 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 font-medium">
          Send Letter of Intent
        </button>
      </div>
    </div>
  );
}

function SpiritInsightsPanel() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      
      <div className="space-y-4">
        {SPIRIT_INSIGHTS.map((insight, index) => (
          <div key={index} className="bg-white/60 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsPanel() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Spirit</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-100/80 rounded-xl">
          <DocumentTextIcon className="w-5 h-5 text-blue-700" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">Letter of Intent - Eco Renew (Draft)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-red-100/80 rounded-xl">
          <DocumentTextIcon className="w-5 h-5 text-red-700" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">General Liability (COI) pdf</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrimeScopeReviewPage() {
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

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Prime Contractor Scope Review</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contractor Cards */}
          <div className="space-y-6">
            {CONTRACTORS.map((contractor) => (
              <ContractorCard key={contractor.id} contractor={contractor} />
            ))}
          </div>

          {/* Middle Column - Scope Summary */}
          <div>
            <ScopeSummary />
          </div>

          {/* Right Column - Spirit & Documents */}
          <div className="space-y-6">
            <SpiritInsightsPanel />
            <DocumentsPanel />
          </div>
        </div>
      </div>
    </div>
  );
} 