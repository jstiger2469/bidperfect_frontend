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
  PhoneIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "../../../components/Breadcrumb";
import { getRFPById } from "../../../lib/data";

const CONTRACTOR_INFO = {
  name: "Statewide HVAC",
  contact: "Sarah Williams",
  phone: "+1 (504) 555-0198",
  assignedScope: "HVAC Replacement - Kent Middle School"
};

const COMPLIANCE_REQUIREMENTS = [
  {
    requirement: "Wage Determination coverage",
    status: "Passed",
    statusColor: "green",
    icon: CheckCircleIcon
  },
  {
    requirement: "Required licenses",
    status: "Missing",
    statusColor: "red",
    icon: ExclamationTriangleIcon
  },
  {
    requirement: "Certificate of Insurance (COI)",
    status: "Passed",
    statusColor: "green", 
    icon: CheckCircleIcon
  },
  {
    requirement: "Letter of Intent (LoI)",
    status: "Needs review",
    statusColor: "yellow",
    icon: ClockIcon
  },
  {
    requirement: "Past performance uploaded",
    status: "Passed",
    statusColor: "green",
    icon: CheckCircleIcon
  }
];

const SPIRIT_COMPLIANCE = {
  score: "4 of 6",
  message: "4 of 6 compliance requirements are complete",
  recommendation: "Would you like to send a reminder to the subcontractor or assign a new vendor?",
  alerts: [
    "Louisiana Electrician License (Class C) not yet uploaded.",
    "LoI pending signature. Remind now?"
  ]
};

function ContractorHeader() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-blue-100/80 rounded-full flex items-center justify-center">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{CONTRACTOR_INFO.name}</h1>
          <p className="text-gray-600 mb-2">{CONTRACTOR_INFO.contact}</p>
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneIcon className="w-4 h-4" />
            <span className="text-sm">{CONTRACTOR_INFO.phone}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50/80 rounded-2xl">
        <h3 className="font-medium text-gray-800 mb-1">Assigned scope</h3>
        <p className="text-gray-700">{CONTRACTOR_INFO.assignedScope}</p>
      </div>
    </div>
  );
}

function ComplianceRequirements() {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100/80 text-green-700';
      case 'red':
        return 'bg-red-100/80 text-red-700';
      case 'yellow':
        return 'bg-yellow-100/80 text-yellow-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Requirement Status</h3>
      
      <div className="space-y-4">
        {COMPLIANCE_REQUIREMENTS.map((req, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <req.icon className={`w-6 h-6 ${
                req.statusColor === 'green' ? 'text-green-600' :
                req.statusColor === 'red' ? 'text-red-600' :
                req.statusColor === 'yellow' ? 'text-yellow-600' :
                'text-gray-600'
              }`} />
              <span className="font-medium text-gray-800">{req.requirement}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.statusColor)}`}>
              {req.status}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200/50 flex gap-4">
        <button className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200">
          View compliance log
        </button>
        <button className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200">
          Request update
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 ml-auto">
          Approve & add to proposal
        </button>
        <button className="px-4 py-2 bg-red-100/80 text-red-700 rounded-xl hover:bg-red-200/80 transition-all duration-200">
          Reject sub
        </button>
      </div>
    </div>
  );
}

function SpiritCompliancePanel() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      
      <div className="bg-white/60 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold text-blue-700">{SPIRIT_COMPLIANCE.score}</div>
          <div>
            <p className="font-medium text-gray-800">compliance requirements are complete</p>
            <p className="text-sm text-gray-600">{SPIRIT_COMPLIANCE.message}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-2xl p-4 mb-6">
        <p className="text-sm text-gray-700 mb-4">{SPIRIT_COMPLIANCE.recommendation}</p>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Alert:</h4>
        {SPIRIT_COMPLIANCE.alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-700">{alert}</p>
          </div>
        ))}
        
        <div className="mt-4 text-sm">
          <p className="text-gray-700 mb-2">Remind now?</p>
        </div>
      </div>
    </div>
  );
}

export default function IndividualCompliancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfpParam = searchParams.get('rfp');
  const contextRFP = rfpParam ? getRFPById(rfpParam) : null;

  const getBreadcrumbItems = () => {
    if (contextRFP) {
      return [
        { label: "RFP Library", href: "/" },
        { label: contextRFP.title, href: `/workspace/${contextRFP.id.split('-')[1]}` },
        { label: "Subcontractors", href: `/subcontractors?rfp=${contextRFP.id}` },
        { label: "Compliance Check", href: `/subcontractors/compliance?rfp=${contextRFP.id}` },
        { label: CONTRACTOR_INFO.name, current: true }
      ];
    }
    return [
      { label: "Subcontractors", href: "/subcontractors" },
      { label: "Compliance Check", href: "/subcontractors/compliance" },
      { label: CONTRACTOR_INFO.name, current: true }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push(contextRFP ? `/subcontractors/compliance?rfp=${contextRFP.id}` : '/subcontractors/compliance')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Compliance Summary</span>
            </button>
            <Breadcrumb 
              items={getBreadcrumbItems()}
              showHome={false}
              className="text-gray-600"
            />
          </div>
          {contextRFP && (
            <div className="px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-xl border border-blue-200/40">
              <span className="text-sm text-blue-700 font-medium">RFP: {contextRFP.title}</span>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Compliance Check Summary</h1>
        </div>

        <ContractorHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Requirements */}
          <div className="lg:col-span-2">
            <ComplianceRequirements />
          </div>

          {/* Right Column - Spirit Compliance */}
          <div>
            <SpiritCompliancePanel />
          </div>
        </div>
      </div>
    </div>
  );
} 