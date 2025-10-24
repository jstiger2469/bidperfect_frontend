"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const STAFF_READINESS_DATA = [
  {
    id: 1,
    name: "Clark Wells",
    role: "Project Manager",
    status: "Ready",
    missing: []
  },
  {
    id: 2,
    name: "Russell Nguyen",
    role: "HVAC Technician",
    status: "Expiring Certs",
    missing: ["Bonds", "Past Perf"]
  },
  {
    id: 3,
    name: "Debra Lewis",
    role: "Technical Writer",
    status: "Ready",
    missing: []
  },
  {
    id: 4,
    name: "Charles Morgan",
    role: "Subcontractor",
    status: "Ready",
    missing: []
  },
  {
    id: 5,
    name: "Justin Larson",
    role: "Mechanical Engineer",
    status: "Expiring Certs",
    missing: []
  },
  {
    id: 6,
    name: "Loretta Sims",
    role: "Compliance Officer",
    status: "Ready",
    missing: ["Clearance"]
  }
];

function CompanyReadinessCard() {
  const complianceScore = 75;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (complianceScore / 100) * circumference;

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Company Readiness</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="#e5e7eb" 
              strokeWidth="8" 
              fill="none" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="#3b82f6" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{complianceScore}%</span>
          </div>
        </div>
        <span className="text-gray-500 text-sm">Compliance score</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-orange-50/80 rounded-xl">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-700">5 certifications expiring within 90 days</span>
          </div>
          <span className="text-sm text-orange-600 font-medium">90 days</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">2 past performance gaps</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">9 RFPs identifying relevant opportunities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffReadinessCard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-500";
      case "Expiring Certs":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Staff Readiness</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Ready for Proposals</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Missing</th>
            </tr>
          </thead>
          <tbody>
            {STAFF_READINESS_DATA.map((staff) => (
              <tr key={staff.id} className="border-b border-gray-100/50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100/80 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-800">{staff.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-sm text-gray-600">{staff.role}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(staff.status)}`}></div>
                    <span className="text-sm text-gray-800">{staff.status}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex flex-wrap gap-1">
                    {staff.missing.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100/80 text-red-700 text-xs rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReadinessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to RFP Library</span>
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200">
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Download Report</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Readiness Heatmap Dashboard</h1>
          <p className="text-gray-600">Evaluate company and staff readiness for upcoming proposals</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CompanyReadinessCard />
          <StaffReadinessCard />
        </div>
      </div>
    </div>
  );
} 