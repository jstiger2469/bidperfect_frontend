"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { getRFPById, getAllSubcontractors } from "../../lib/data";
import { 
  getSubcontractorsBySpecialty, 
  getRecommendedSubcontractor, 
  type SubcontractorOption,
  type SubcontractorSelection 
} from "../../lib/subcontractorSelection";
import SubcontractorSelectionModal from "../../components/SubcontractorSelectionModal";
import Breadcrumb from "../../components/Breadcrumb";
import ContextualActions from "../../components/ContextualActions";
import FloatingNavigation from "../../components/FloatingNavigation";

const PROJECT_CONTEXT = {
  title: "HVAC Replacement - Kent Middle School",
  client: "GSA Region 6",
  category: "Fixed Price",
  contractNumber: "RFP-2024-GSA-003",
  description: "Removal and replacement of rooftop HVAC units at federal building location"
};

const SPIRIT_RECOMMENDATION = {
  message: "Spirit: Recommend assigning HVAC Replacement scope to Statewide HVAC for best readiness match",
  action: "Review details"
};

// Get connected subcontractor data
const SUBCONTRACTORS = getAllSubcontractors().map(sub => ({
  id: parseInt(sub.id.split('-')[1]),
  name: sub.name,
  contractNumber: "RFP-2024-GSA-003", // Current project context
  type: sub.type,
  rating: sub.rating,
  image: sub.image,
  status: sub.status,
  tags: sub.specialty,
  statusNote: sub.status === 'assigned' ? `${sub.readiness}% Ready - Selected` : 
              sub.status === 'pending' ? "Bid Under Review" : 
              sub.status === 'overbooked' ? `Capacity ${sub.capacity}` : 'Available',
  readiness: sub.readiness,
  capacity: sub.capacity
}));

function SpiritRecommendation({ 
  onOpenSelection 
}: { 
  onOpenSelection: (specialty: string) => void;
}) {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center flex-shrink-0">
          <ChatBubbleLeftIcon className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800 mb-3">{SPIRIT_RECOMMENDATION.message}</p>
          <button 
            onClick={() => onOpenSelection('hvac')}
            className="text-blue-700 hover:text-blue-800 font-medium text-sm"
          >
            {SPIRIT_RECOMMENDATION.action} →
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectContextCard() {
  const router = useRouter();
  
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{PROJECT_CONTEXT.title}</h2>
        <button 
          onClick={() => router.push('/workspace/3')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm shadow-lg hover:bg-blue-700 transition-all duration-200"
        >
          View RFP Workspace
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Client:</span>
          <span className="ml-2 font-medium text-gray-800">{PROJECT_CONTEXT.client}</span>
        </div>
        <div>
          <span className="text-gray-600">Category:</span>
          <span className="ml-2 font-medium text-gray-800">{PROJECT_CONTEXT.category}</span>
        </div>
        <div>
          <span className="text-gray-600">Contract:</span>
          <span className="ml-2 font-medium text-gray-800">{PROJECT_CONTEXT.contractNumber}</span>
        </div>
      </div>
      <p className="text-gray-700 mt-4">{PROJECT_CONTEXT.description}</p>
    </div>
  );
}

function SubcontractorCard({ 
  subcontractor, 
  onOpenSelection 
}: { 
  subcontractor: typeof SUBCONTRACTORS[0];
  onOpenSelection: (specialty: string) => void;
}) {
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-100/80 text-green-700";
      case "available":
        return "bg-blue-100/80 text-blue-700";
      case "pending":
        return "bg-yellow-100/80 text-yellow-700";
      case "overbooked":
        return "bg-red-100/80 text-red-700";
      default:
        return "bg-gray-100/80 text-gray-700";
    }
  };

  const handleViewProfile = () => {
    router.push(`/subcontractors/profile/${subcontractor.id}`);
  };

  const handleDefineScopeAndPricing = () => {
    router.push(`/subcontractors/pricing/${subcontractor.id}`);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100/80 rounded-full flex items-center justify-center">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg">{subcontractor.name}</h3>
          <p className="text-gray-600">{subcontractor.contractNumber} - {subcontractor.type}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(subcontractor.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">{subcontractor.rating}</span>
            </div>
            <button 
              onClick={handleViewProfile}
              className="text-blue-700 hover:text-blue-800 text-sm font-medium"
            >
              View Profile
            </button>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subcontractor.status)}`}>
            {subcontractor.statusNote}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {subcontractor.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Readiness and Capacity */}
        {(subcontractor.readiness || subcontractor.capacity) && (
          <div className="flex items-center gap-4 text-sm">
            {subcontractor.readiness && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Readiness:</span>
                <span className="font-semibold text-gray-800">{subcontractor.readiness}%</span>
              </div>
            )}
            {subcontractor.capacity && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Capacity:</span>
                <span className={`font-semibold ${
                  subcontractor.capacity.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {subcontractor.capacity}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={() => onOpenSelection(subcontractor.tags[0] || 'electrical')}
        className="w-full bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 transition-all duration-200 font-medium"
      >
        Choose from {getSubcontractorsBySpecialty(subcontractor.tags[0] || 'electrical').length} Available Options
      </button>
    </div>
  );
}

function EligibleSubcontractorsTable() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Eligible Subcontractors</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-3 text-sm font-medium text-gray-600">Subcontractor</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Tags</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 text-sm font-medium text-gray-600">Station</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200/30">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-800">Mechanical Services</span>
                </div>
              </td>
              <td className="py-4">
                <span className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full">236220</span>
              </td>
              <td className="py-4">
                <span className="text-gray-600">Prev...3x Partner</span>
              </td>
              <td className="py-4">
                <span className="text-gray-600">Pending</span>
              </td>
            </tr>
            <tr className="border-b border-gray-200/30">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-800">All-Pro Mechanical</span>
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
              </td>
              <td className="py-4">
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full">238220</span>
                  <span className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full">236220</span>
                </div>
              </td>
              <td className="py-4">
                <span className="text-green-600">Available</span>
              </td>
              <td className="py-4">
                <span className="text-gray-600">DM/DB Cert Needed</span>
              </td>
            </tr>
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-800">Bayou HVAC</span>
                </div>
              </td>
              <td className="py-4">
                <span className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs rounded-full">236220</span>
              </td>
              <td className="py-4">
                <span className="text-green-600">Available</span>
              </td>
              <td className="py-4">
                <span className="text-gray-600">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SubcontractorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfpParam = searchParams.get('rfp');
  const [selectionModal, setSelectionModal] = useState<{isOpen: boolean, specialty: string} | null>(null);
  const [selections, setSelections] = useState<SubcontractorSelection[]>([]);
  
  // Get RFP context if coming from RFP workspace
  const contextRFP = rfpParam ? getRFPById(rfpParam) : null;

  const handleSubcontractorSelection = (selection: SubcontractorSelection) => {
    setSelections(prev => [...prev.filter(s => s.category !== selection.category), selection]);
    setSelectionModal(null);
  };

  const openSelectionModal = (specialty: string) => {
    setSelectionModal({ isOpen: true, specialty });
  };
  
  const getBreadcrumbItems = () => {
    if (contextRFP) {
      return [
        { label: "RFP Library", href: "/" },
        { label: contextRFP.title, href: `/workspace/${contextRFP.id.split('-')[1]}` },
        { label: "Subcontractors", current: true }
      ];
    }
    return [
      { label: "RFP Library", href: "/" },
      { label: "Subcontractors", current: true }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push(contextRFP ? `/workspace/${contextRFP.id.split('-')[1]}` : '/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to {contextRFP ? 'RFP Workspace' : 'RFP Library'}</span>
            </button>
            <Breadcrumb 
              items={getBreadcrumbItems()}
              showHome={false}
              className="text-gray-600"
            />
          </div>
          {contextRFP && (
            <div className="px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-xl border border-blue-200/40">
              <span className="text-sm text-blue-700 font-medium">Working on: {contextRFP.title}</span>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subcontractors</h1>
          
          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <button 
              onClick={() => router.push('/subcontractors/bid-review')}
              className="px-4 py-2 bg-blue-100/80 text-blue-700 rounded-xl hover:bg-blue-200/80 transition-all duration-200 text-sm"
            >
              Bid Review & Comparison
            </button>
            <button 
              onClick={() => router.push('/subcontractors/scope-assignment')}
              className="px-4 py-2 bg-green-100/80 text-green-700 rounded-xl hover:bg-green-200/80 transition-all duration-200 text-sm"
            >
              Scope Assignment
            </button>
            <button 
              onClick={() => router.push('/subcontractors/compliance')}
              className="px-4 py-2 bg-orange-100/80 text-orange-700 rounded-xl hover:bg-orange-200/80 transition-all duration-200 text-sm"
            >
              Compliance Check
            </button>
            <button 
              onClick={() => router.push('/subcontractors/prime-scope-review')}
              className="px-4 py-2 bg-purple-100/80 text-purple-700 rounded-xl hover:bg-purple-200/80 transition-all duration-200 text-sm"
            >
              Prime Scope Review
            </button>
            <button 
              onClick={() => router.push('/subcontractors/team-assembly')}
              className="px-4 py-2 bg-indigo-100/80 text-indigo-700 rounded-xl hover:bg-indigo-200/80 transition-all duration-200 text-sm"
            >
              Team Assembly
            </button>
            <button 
              onClick={() => router.push('/subcontractors/individual-compliance')}
              className="px-4 py-2 bg-red-100/80 text-red-700 rounded-xl hover:bg-red-200/80 transition-all duration-200 text-sm"
            >
              Individual Compliance
            </button>
            <button 
              onClick={() => router.push('/subcontractors/final-approval')}
              className="px-4 py-2 bg-teal-100/80 text-teal-700 rounded-xl hover:bg-teal-200/80 transition-all duration-200 text-sm"
            >
              Final Approval
            </button>
            <button 
              onClick={() => router.push('/subcontractors/share-export')}
              className="px-4 py-2 bg-emerald-100/80 text-emerald-700 rounded-xl hover:bg-emerald-200/80 transition-all duration-200 text-sm"
            >
              Share & Export
            </button>
          </div>
        </div>

        {/* Contextual Actions */}
        {contextRFP && (
          <ContextualActions 
            currentPage="subcontractors" 
            rfpId={contextRFP.id} 
            className="mb-8"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <SpiritRecommendation onOpenSelection={openSelectionModal} />
            <ProjectContextCard />
            
            <div className="grid grid-cols-1 gap-6">
              {SUBCONTRACTORS.map((subcontractor) => (
                <SubcontractorCard 
                  key={subcontractor.id} 
                  subcontractor={subcontractor} 
                  onOpenSelection={openSelectionModal}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Eligible Subcontractors */}
          <div>
            <EligibleSubcontractorsTable />
          </div>
        </div>
        
        {/* Subcontractor Selection Modal */}
        {selectionModal && (
          <SubcontractorSelectionModal
            isOpen={selectionModal.isOpen}
            onClose={() => setSelectionModal(null)}
            specialty={selectionModal.specialty}
            rfpId={contextRFP?.id || 'rfp-003'}
            onSelection={handleSubcontractorSelection}
          />
        )}
      </div>
      
      {/* Floating Navigation */}
      <FloatingNavigation rfpId={contextRFP?.id} currentPage="subcontractors" />
    </div>
  );
} 