"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const PROJECT_INFO = {
  title: "HVAC Replacement - Kent Middle School",
  dueDate: "April 15",
  userMessage: "I've lined up potential subs. Who's the best fit to finalize the scope and pricing?"
};

const SUBCONTRACTOR_BIDS = [
  {
    id: 1,
    name: "CoolWorks",
    location: "Con Orleans, LA",
    readiness: "Ready",
    markupVsEstimate: "12% Fair",
    pricing: "$412,000",
    pricingLevel: "Fair",
    documents: [
      { name: "Signed letter of intent", status: "complete" },
      { name: "ToC doCS missing", status: "missing" }
    ],
    readinessColor: "green"
  },
  {
    id: 2,
    name: "ClimatePros LLC",
    location: "Baton Rouge, LA",
    readiness: "Missing Certs",
    markupVsEstimate: "25% High",
    pricing: "$465,000",
    pricingLevel: "High",
    documents: [
      { name: "Signed letter of intent", status: "complete" },
      { name: "Uploaded resume", status: "complete" }
    ],
    readinessColor: "yellow"
  },
  {
    id: 3,
    name: "Bayou Mechanica",
    location: "Lafayette, LA",
    readiness: "Ready",
    markupVsEstimate: "5% Low",
    pricing: "$398,200",
    pricingLevel: "Low",
    documents: [
      { name: "Signed letter of intent", status: "complete" },
      { name: "Uploaded resume", status: "complete" }
    ],
    readinessColor: "green"
  },
  {
    id: 4,
    name: "Delta HVAC Partners",
    location: "Houma, LA",
    readiness: "Ready",
    markupVsEstimate: "10% Fair",
    pricing: "$415,600",
    pricingLevel: "Fair",
    documents: [
      { name: "Signed letter of commitment", status: "complete" },
      { name: "Tagged past performance", status: "complete" }
    ],
    readinessColor: "green"
  }
];

const TABS = ["Proposals", "Availability", "Compliance Matrix", "Pricing Estimator"];

function ProjectHeader() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bid Review & Comparison</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{PROJECT_INFO.title}</span>
            <span>Due {PROJECT_INFO.dueDate}</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200">
          <PlusIcon className="w-4 h-4" />
          New Bid
        </button>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center flex-shrink-0">
          <ChatBubbleLeftIcon className="w-6 h-6 text-blue-700" />
        </div>
        <p className="text-gray-700">{PROJECT_INFO.userMessage}</p>
      </div>
    </div>
  );
}

function TabNavigation({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-2 border border-white/40 shadow-xl mb-8">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function BidCard({ bid }: { bid: typeof SUBCONTRACTOR_BIDS[0] }) {
  const getReadinessColor = (color: string) => {
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

  const getPricingColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-700';
      case 'Fair':
        return 'text-blue-700';
      case 'High':
        return 'text-orange-700';
      default:
        return 'text-gray-700';
    }
  };

  const getMarkupColor = (markup: string) => {
    if (markup.includes('Low')) return 'text-green-700';
    if (markup.includes('Fair')) return 'text-blue-700';
    if (markup.includes('High')) return 'text-orange-700';
    return 'text-gray-700';
  };

  return (
    <tr className="border-b border-gray-200/30 hover:bg-white/30 transition-colors">
      <td className="py-4">
        <div>
          <h3 className="font-semibold text-gray-800">{bid.name}</h3>
          <p className="text-sm text-gray-600">{bid.location}</p>
        </div>
      </td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReadinessColor(bid.readinessColor)}`}>
          {bid.readiness}
        </span>
      </td>
      <td className="py-4">
        <span className={`font-medium ${getMarkupColor(bid.markupVsEstimate)}`}>
          {bid.markupVsEstimate}
        </span>
      </td>
      <td className="py-4">
        <div>
          <p className="font-bold text-gray-800">{bid.pricing}</p>
          <p className={`text-sm ${getPricingColor(bid.pricingLevel)}`}>{bid.pricingLevel}</p>
        </div>
      </td>
      <td className="py-4">
        <div className="space-y-1">
          {bid.documents.map((doc, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <DocumentTextIcon className="w-4 h-4 text-gray-500" />
              <span className={doc.status === 'complete' ? 'text-gray-800' : 'text-red-600'}>
                {doc.name}
              </span>
              {doc.status === 'complete' && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
              {doc.status === 'missing' && <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />}
            </div>
          ))}
        </div>
      </td>
      <td className="py-4">
        <button className="px-4 py-2 bg-blue-100/80 text-blue-700 rounded-lg hover:bg-blue-200/80 transition-all duration-200 text-sm font-medium">
          Review Bid
        </button>
      </td>
    </tr>
  );
}

function BidComparisonTable() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-3 text-sm font-medium text-gray-600">Subcontractor</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Readiness</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Markup vs. Estimate</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Pricing</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Documents</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {SUBCONTRACTOR_BIDS.map((bid) => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200/50 flex justify-end">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">
          Finalize Selection
        </button>
      </div>
    </div>
  );
}

export default function BidReviewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Proposals");

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

        <ProjectHeader />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === "Proposals" && <BidComparisonTable />}
        {activeTab === "Availability" && (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-12 border border-white/40 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Availability View</h3>
            <p className="text-gray-600">Team availability and scheduling information</p>
          </div>
        )}
        {activeTab === "Compliance Matrix" && (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-12 border border-white/40 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Compliance Matrix</h3>
            <p className="text-gray-600">Detailed compliance tracking and requirements</p>
          </div>
        )}
        {activeTab === "Pricing Estimator" && (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-12 border border-white/40 shadow-xl text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing Estimator</h3>
            <p className="text-gray-600">Cost analysis and pricing tools</p>
          </div>
        )}
      </div>
    </div>
  );
} 