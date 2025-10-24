"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const SUBCONTRACTOR_PROFILE = {
  id: 1,
  name: "Gulf Plains HVAC Services",
  hubZone: "HUBZone",
  status: "Approved",
  companyInfo: {
    duns: "04-241-8005",
    naics: "236220",
    size: "Small Business",
    address: "902 Thatcher Blvd\nAmarillo, TX 79105"
  },
  keyContacts: [
    {
      name: "Oscar Wood",
      role: "Operations Manager",
      phone: "509-924-1335",
      email: "owood@gulfplainshvac.com",
      image: "/api/placeholder/60/60"
    }
  ],
  pastPerformance: [
    {
      project: "HVAC Preventive Maintenance",
      client: "Amarillo ISD",
      value: "$3500K",
      status: "success"
    },
    {
      project: "K-12 HVAC Installation",
      client: "Sunray ISD",
      value: "$7600K",
      status: "success"
    },
    {
      project: "HVAC System Upgrade",
      client: "City of Borger",
      value: "$4800K",
      status: "success"
    }
  ],
  complianceFlags: [
    {
      type: "error",
      message: "General Liability Insurance does not meet minimum limits."
    },
    {
      type: "warning",
      message: "Insurance documents have expired in the past 30 days."
    }
  ],
  documentsVault: [
    {
      name: "Capability Statement",
      type: "pdf",
      updated: "yesterday",
      color: "blue"
    },
    {
      name: "Certificates of Insurance",
      type: "pdf",
      updated: "4 days ago",
      color: "red"
    }
  ]
};

const SPIRIT_INSIGHTS = {
  message: "Two insurance policies do not meet minimum coverage thresholds. Alternatively, require an updated COI.",
  suggestions: [
    "Consider alternative insurance requirements",
    "Request updated Certificate of Insurance",
    "Review coverage thresholds"
  ]
};

function ProfileHeader() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100/80 rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{SUBCONTRACTOR_PROFILE.name}</h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100/80 text-blue-700 text-sm rounded-full font-medium">
                {SUBCONTRACTOR_PROFILE.hubZone}
              </span>
              <span className="px-3 py-1 bg-green-100/80 text-green-700 text-sm rounded-full font-medium">
                {SUBCONTRACTOR_PROFILE.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyInfoSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Info</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">D-U-N-S</span>
            <p className="font-medium text-gray-800">{SUBCONTRACTOR_PROFILE.companyInfo.duns}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">NAICS</span>
            <p className="font-medium text-gray-800">{SUBCONTRACTOR_PROFILE.companyInfo.naics}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Size</span>
            <p className="font-medium text-gray-800">{SUBCONTRACTOR_PROFILE.companyInfo.size}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Address</span>
            <p className="font-medium text-gray-800 whitespace-pre-line">{SUBCONTRACTOR_PROFILE.companyInfo.address}</p>
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-600">Address</span>
          <div className="mt-2">
            <p className="font-medium text-gray-800">Oscar Wood</p>
            <p className="text-gray-600">Operations Manager</p>
            <div className="flex items-center gap-2 mt-2">
              <PhoneIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">509-924-1335</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <EnvelopeIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">owood@gulfplainshvac.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PastPerformanceSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Past Performance Projects</h3>
      <div className="space-y-4">
        {SUBCONTRACTOR_PROFILE.pastPerformance.map((project, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{project.project}</h4>
              <p className="text-sm text-gray-600">{project.client}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{project.value}</p>
              <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceFlagsSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Flags</h3>
      <div className="space-y-3">
        {SUBCONTRACTOR_PROFILE.complianceFlags.map((flag, index) => (
          <div key={index} className={`flex items-start gap-3 p-4 rounded-2xl ${
            flag.type === 'error' ? 'bg-red-50/80' : 'bg-yellow-50/80'
          }`}>
            <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
              flag.type === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <p className="text-sm text-gray-700">{flag.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsVaultSection() {
  const getDocumentColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100/80 text-blue-700';
      case 'red':
        return 'bg-red-100/80 text-red-700';
      case 'orange':
        return 'bg-orange-100/80 text-orange-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents Vault</h3>
      <div className="space-y-3">
        {SUBCONTRACTOR_PROFILE.documentsVault.map((doc, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200/50 rounded-xl">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDocumentColor(doc.color)}`}>
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{doc.name}</p>
              <p className="text-sm text-gray-600">Updated {doc.updated}</p>
            </div>
            <button className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors">
              <EyeIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpiritInsightsSidebar() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      <p className="text-sm text-gray-700 mb-4">{SPIRIT_INSIGHTS.message}</p>
      <div className="space-y-2">
        {SPIRIT_INSIGHTS.suggestions.map((suggestion, index) => (
          <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>{suggestion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubcontractorProfilePage({ params }: { params: { id: string } }) {
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

        <ProfileHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CompanyInfoSection />
              <PastPerformanceSection />
            </div>
            <ComplianceFlagsSection />
            <DocumentsVaultSection />
          </div>

          {/* Right Column - Spirit Insights */}
          <div>
            <SpiritInsightsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
} 