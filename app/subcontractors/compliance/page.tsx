"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const COMPLIANCE_SUMMARY = {
  finalCheckpoint: "74%",
  submissionRisk: "42%",
  message: "Final checkpoint before proposal submission – let's ensure every sub meets the mark."
};

const SUBCONTRACTOR_COMPLIANCE = [
  {
    id: 1,
    name: "Acme Construction",
    coi: "Missing H/V Installer",
    wdAlignment: "Missing H/V",
    licenses: "Passed",
    resume: "Passed",
    attachments: "Passed",
    status: "Passed",
    statusColor: "green"
  },
  {
    id: 2,
    name: "TigerTech",
    coi: "Missing H/V Labor Class",
    wdAlignment: "Missing H/V",
    licenses: "Needs Review",
    resume: "Needs Review",
    attachments: "Needs Review", 
    status: "Needs Review",
    statusColor: "yellow"
  },
  {
    id: 3,
    name: "Urban Systems",
    coi: "Expired CoursIng PMS",
    wdAlignment: "Expired",
    licenses: "Needs Review",
    resume: "Needs Review",
    attachments: "Needs Firming",
    status: "Needs Firming",
    statusColor: "orange"
  },
  {
    id: 4,
    name: "Johnston Electrical",
    coi: "Expired Missing Docs",
    wdAlignment: "Expired",
    licenses: "Incomplete",
    resume: "Incomplete",
    attachments: "Incomplete",
    status: "Incomplete",
    statusColor: "red"
  },
  {
    id: 5,
    name: "Rivera Contractors",
    coi: "Incomplete Risk Forecast",
    wdAlignment: "Incomplete",
    licenses: "Incomplete",
    resume: "Incomplete", 
    attachments: "Incomplete",
    status: "Incomplete",
    statusColor: "blue"
  }
];

const SPIRIT_INSIGHTS = [
  {
    type: "info",
    message: "3 of your 5 subcontractors are fully compliant, a require updated COIs and WD alignment."
  },
  {
    type: "question",
    message: "Would you like to request missing documents now?"
  },
  {
    type: "alert",
    items: [
      "Johnston Electrical's COI expired on 09/12/2025. This is a require separate prior to submission.",
      "LOI from TigerTech has not been formally signed for submission risk."
    ]
  },
  {
    type: "forecast",
    message: "Submission at 4:2 due to unconfirmed sub."
  }
];

function ComplianceSummaryHeader() {
  return (
    <div className="bg-blue-100/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Compliance Check Summary</h1>
          <p className="text-gray-700">{COMPLIANCE_SUMMARY.message}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-700">{COMPLIANCE_SUMMARY.finalCheckpoint}</div>
          <div className="text-sm text-gray-600">LAVSaid</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div>
          <span className="text-sm text-gray-600">COI COMPLIANT STATUS</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '74%'}}></div>
            </div>
            <span className="text-sm font-medium text-gray-800">{COMPLIANCE_SUMMARY.finalCheckpoint}</span>
          </div>
        </div>
        <div className="ml-8">
          <span className="text-sm text-gray-600">Estimated submission risk</span>
          <div className="text-xl font-bold text-orange-600">{COMPLIANCE_SUMMARY.submissionRisk}</div>
        </div>
      </div>
    </div>
  );
}

function ComplianceTable() {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100/80 text-green-700';
      case 'yellow':
        return 'bg-yellow-100/80 text-yellow-700';
      case 'orange':
        return 'bg-orange-100/80 text-orange-700';
      case 'red':
        return 'bg-red-100/80 text-red-700';
      case 'blue':
        return 'bg-blue-100/80 text-blue-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">SUBCONTRACTOR</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>COI</span>
          <span>Licenses</span>
          <span>Resume</span>
          <span>Attachments</span>
          <button className="p-1 hover:bg-gray-100/50 rounded">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {SUBCONTRACTOR_COMPLIANCE.map((sub) => (
          <div key={sub.id} className="border border-gray-200/50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{sub.name}</h4>
                  <p className="text-sm text-gray-600">{sub.coi}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-8 h-8 bg-blue-100/80 rounded flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-blue-700" />
                </div>
                
                <div className="w-8 h-8 bg-red-100/80 rounded flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-red-700" />
                </div>
                
                <div className="w-8 h-8 bg-blue-100/80 rounded flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-blue-700" />
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.statusColor)}`}>
                  {sub.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200/50 flex gap-4">
        <button className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200">
          Request Update
        </button>
        <button className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200">
          Swap Subcontractor
        </button>
        <button className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200">
          Export Packet
        </button>
        <button className="px-4 py-2 bg-blue-100/80 text-blue-700 rounded-xl hover:bg-blue-200/80 transition-all duration-200 ml-auto">
          Request Update
        </button>
      </div>
    </div>
  );
}

function SpiritInsightsPanel() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
        <button className="ml-auto p-1 hover:bg-blue-100/50 rounded">
          <EllipsisHorizontalIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-4">
        {SPIRIT_INSIGHTS.map((insight, index) => (
          <div key={index}>
            {insight.type === 'info' && (
              <div className="bg-white/60 rounded-2xl p-4">
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            )}
            
            {insight.type === 'question' && (
              <div className="bg-white/60 rounded-2xl p-4">
                <p className="text-sm text-gray-700 mb-3">{insight.message}</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Send Reminder
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                    Replace Sub
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                    Edit Scope
                  </button>
                </div>
              </div>
            )}
            
            {insight.type === 'alert' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">Insights</span>
                </div>
                {insight.items?.map((item, i) => (
                  <div key={i} className="bg-white/60 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UserIcon className="w-3 h-3 text-blue-700" />
                      </div>
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {insight.type === 'forecast' && (
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-800">Risk forecast</span>
                </div>
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComplianceCheckPage() {
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

        <ComplianceSummaryHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Compliance Table */}
          <div className="lg:col-span-2">
            <ComplianceTable />
          </div>

          {/* Right Column - Spirit Insights */}
          <div>
            <SpiritInsightsPanel />
          </div>
        </div>
      </div>
    </div>
  );
} 