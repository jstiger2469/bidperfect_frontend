"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const PROJECT_INFO = {
  title: "HVAC Replacement - Kent Middle School",
  readiness: 65
};

const PRIME_CONTRACTOR_TEAM = [
  {
    id: 1,
    name: "Colleen",
    role: "Prime Contractor",
    position: "Project Manager",
    badges: ["SECERT Clearance"],
    image: "/api/placeholder/60/60"
  },
  {
    id: 2,
    name: "Ethan",
    role: "Estimator",
    position: "Cost Analyst",
    badges: [],
    image: "/api/placeholder/60/60"
  },
  {
    id: 3,
    name: "Sarah",
    role: "Compliance Lead",
    position: "Quality Manager",
    badges: ["⚠️"],
    image: "/api/placeholder/60/60"
  },
  {
    id: 4,
    name: "James",
    role: "Propossu Writer",
    position: "Technical Writer",
    badges: [],
    image: "/api/placeholder/60/60"
  }
];

const SUBCONTRACTOR_TEAMS = [
  {
    name: "Gun HVAC",
    logo: "GUNN",
    status: "Excellent",
    members: [
      { name: "Paul", role: "HVAC Technician", image: "/api/placeholder/40/40" },
      { name: "Thomas", role: "Safety Officer", badges: ["✓"], image: "/api/placeholder/40/40" }
    ]
  },
  {
    name: "Bregman Electric",
    logo: "⚡",
    status: "In Review",
    members: [
      { name: "Natalie", role: "Electrician", badges: ["⚠️"], image: "/api/placeholder/40/40" },
      { name: "Jacob", role: "Journeyman", image: "/api/placeholder/40/40" }
    ]
  },
  {
    name: "Carroll Plumbing",
    logo: "C",
    status: "Good",
    members: [
      { name: "Matthew", role: "Plumber", badges: ["✓"], image: "/api/placeholder/40/40" },
      { name: "Olivia", role: "Plumbing Helper", image: "/api/placeholder/40/40" }
    ]
  }
];

const SPIRIT_RECOMMENDATIONS = [
  {
    type: "recommendation",
    message: "Recommend pulling Safety Officer from Gun HVAC invalid OSHA + State license!"
  },
  {
    type: "suggestion",
    message: "Construction Manager role uncovered - suggest activnate hiring agent?"
  },
  {
    type: "info",
    message: "3 of 4roles for Tak iD ##18 (Plumbing) are filled. One helper missing"
  },
  {
    type: "alert",
    message: "Construction Manager role uncovered — suggest activating hiring agent?"
  }
];

function ReadinessCircle({ percentage }: { percentage: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className="text-blue-600"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
          <div className="text-xs text-gray-600">Ready</div>
        </div>
      </div>
    </div>
  );
}

function ProjectHeader() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-700">A</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{PROJECT_INFO.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <button className="px-3 py-1 bg-gray-100/80 text-gray-700 rounded-lg text-sm">
                Scenario Simulator
              </button>
              <button className="px-3 py-1 bg-blue-100/80 text-blue-700 rounded-lg text-sm">
                Overall Readiness
              </button>
              <button className="p-1 hover:bg-gray-100/50 rounded">
                <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        <ReadinessCircle percentage={PROJECT_INFO.readiness} />
      </div>
    </div>
  );
}

function PrimeContractorSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Prime Contractor</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRIME_CONTRACTOR_TEAM.map((member) => (
          <div key={member.id} className="text-center">
            <div className="w-16 h-16 bg-blue-100/80 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserIcon className="w-8 h-8 text-blue-700" />
            </div>
            <h4 className="font-medium text-gray-800">{member.name}</h4>
            <p className="text-sm text-gray-600">{member.role}</p>
            <div className="mt-2">
              {member.badges.map((badge, index) => (
                <span key={index} className={`inline-block px-2 py-1 text-xs rounded-full ${
                  badge === "SECERT Clearance" ? "bg-green-100/80 text-green-700" :
                  badge === "⚠️" ? "bg-yellow-100/80 text-yellow-700" :
                  "bg-gray-100/80 text-gray-700"
                }`}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubcontractorSection() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'text-green-700';
      case 'Good':
        return 'text-blue-700';
      case 'In Review':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Subcontractors</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBCONTRACTOR_TEAMS.map((team, index) => (
          <div key={index} className="border border-gray-200/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100/80 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">{team.logo}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{team.name}</h4>
                <p className={`text-sm font-medium ${getStatusColor(team.status)}`}>{team.status}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {team.members.map((member, memberIndex) => (
                <div key={memberIndex} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100/80 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                  {member.badges?.map((badge, badgeIndex) => (
                    <span key={badgeIndex} className={`text-sm ${
                      badge === "✓" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {badge}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpiritRecommendations() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      
      <div className="space-y-4">
        {SPIRIT_RECOMMENDATIONS.map((rec, index) => (
          <div key={index} className="bg-white/60 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              {rec.type === 'recommendation' && (
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              {rec.type === 'suggestion' && (
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              {rec.type === 'info' && (
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              {rec.type === 'alert' && (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-gray-700">{rec.message}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-800">Suggest espiroit:</h4>
        <div className="bg-white/60 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">3 of 4roles for Tak iD ##18 (Plumbing) are filled. One helper missing</p>
          </div>
        </div>
        <div className="bg-red-50/80 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">Construction Manager role uncovered — suggest activating hiring agent?</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractorTeamAssemblyPage() {
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

        <ProjectHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Team Sections */}
          <div className="lg:col-span-2 space-y-8">
            <PrimeContractorSection />
            <SubcontractorSection />
          </div>

          {/* Right Column - Spirit Recommendations */}
          <div>
            <SpiritRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
} 