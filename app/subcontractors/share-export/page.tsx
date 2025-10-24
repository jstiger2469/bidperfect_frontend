"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownIcon,
  EyeIcon,
  LinkIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const PROPOSAL_SECTIONS = [
  { name: "Proposal Plan", status: "connected", ready: false },
  { name: "Cost Proposal", status: "connected", ready: false },
  { name: "Compliance Docs", status: "connected", ready: false }
];

const PROPOSAL_ITEMS = [
  {
    name: "HVAC SCOPE & PRICING",
    company: "Assigned",
    status: "Ready",
    statusColor: "green"
  },
  {
    name: "ELECTRICAL SCOPE & PRICING",
    company: "Smithson Electrical",
    status: "Ready", 
    statusColor: "green"
  },
  {
    name: "STAFFING PLAN:",
    company: "Plan brief: Add related past p...projects.",
    status: "Avoie",
    statusColor: "yellow"
  },
  {
    name: "COMPLIANCE SUMMARY",
    company: "Spirit recommends E-Verify / Drug-Free walvon certifications",
    status: "Review",
    statusColor: "blue"
  }
];

const SUBCONTRACTOR_DATA = [
  {
    name: "Wright Mechanical, LLC",
    file: "OPP 10/GHCZF LOI 1.pdf"
  },
  {
    name: "Smithson Electrical",
    file: "OPP 12/GHCZF LOI. OFF"
  }
];

const HISTORICAL_OVERVIEW = {
  linkedHVACProjects: 3,
  linkedHVACProjectsInfo: 3,
  infoLinks: 3
};

function ProposalSections() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Proposal Sections Connected</h3>
      
      <div className="space-y-4">
        {PROPOSAL_SECTIONS.map((section, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200/50 rounded-xl">
            <DocumentTextIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800">{section.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalItems() {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100/80 text-green-700';
      case 'blue':
        return 'bg-blue-100/80 text-blue-700';
      case 'yellow':
        return 'bg-yellow-100/80 text-yellow-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  const getStatusIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'blue':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'yellow':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="space-y-4">
        {PROPOSAL_ITEMS.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200/50 rounded-2xl">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.statusColor)}
              <div>
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.company}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.statusColor)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubcontractorDataSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Subcontractor Data Linked</h3>
      
      <div className="space-y-4 mb-6">
        {SUBCONTRACTOR_DATA.map((data, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200/50 rounded-xl">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{data.name}</p>
              <p className="text-sm text-gray-600">{data.file}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200/50 pt-4">
        <h4 className="font-medium text-gray-800 mb-2">Subcontractor Data</h4>
        <button className="w-full flex items-center justify-between p-3 bg-blue-50/80 rounded-xl hover:bg-blue-100/80 transition-colors">
          <div className="flex items-center gap-3">
            <EyeIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-800">Toggle Visibility: Wright Mechanical LLC</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function HistoricalOverview() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Historical Overview</h3>
      
      <div className="flex items-center justify-center mb-6">
        <ArrowDownIcon className="w-8 h-8 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-700">{HISTORICAL_OVERVIEW.linkedHVACProjects}</div>
          <p className="text-sm text-gray-600">Linked HVAC projects ivcol</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-700">{HISTORICAL_OVERVIEW.linkedHVACProjectsInfo}</div>
          <p className="text-sm text-gray-600">Linked HVAC projects●</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-700">{HISTORICAL_OVERVIEW.infoLinks}</div>
          <p className="text-sm text-gray-600">info ●●</p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50/80 rounded-xl">
        <p className="text-sm text-gray-700">
          <strong>Timeline context:</strong> This project builds on prior HVAC experience across 3 similar engagements.
        </p>
      </div>
    </div>
  );
}

export default function ContractorShareExportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/subcontractors')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Subcontractors</span>
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium">
            Assemble Proposal
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contractor Share & Export to Proposal Builder</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Proposal Sections */}
          <div>
            <ProposalSections />
          </div>

          {/* Middle Column - Proposal Items & Subcontractor Data */}
          <div className="space-y-8">
            <ProposalItems />
            <SubcontractorDataSection />
          </div>

          {/* Right Column - Historical Overview */}
          <div>
            <HistoricalOverview />
          </div>
        </div>
        
        {/* Bottom Message */}
        <div className="mt-8 p-4 bg-blue-50/80 backdrop-blur-md rounded-2xl border border-blue-200/40">
          <p className="text-gray-700 text-center">
            <strong>be thorough be futuristic be unified make this into the best post contract administrator</strong> 
            <span className="text-red-600 font-medium ml-2">heres what it needs to do</span>
          </p>
        </div>
      </div>
    </div>
  );
} 