"use client";

import { useState } from "react";
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
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function WorkingSubcontractorsPage() {
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
    // Show success message or update UI
    alert(`Selected ${getSubcontractorsBySpecialty(selection.category).find(s => s.id === selection.selectedSubcontractor)?.name} for ${selection.category}`);
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

  // Real subcontractor categories with actual data
  const categories = [
    {
      id: 'electrical',
      name: 'Electrical Subcontractors',
      description: 'HVAC electrical connections and controls',
      count: getSubcontractorsBySpecialty('electrical').length,
      selected: selections.find(s => s.category === 'electrical')?.selectedSubcontractor
    },
    {
      id: 'hvac',
      name: 'HVAC Specialists',
      description: 'Primary HVAC installation and maintenance',
      count: getSubcontractorsBySpecialty('hvac').length,
      selected: selections.find(s => s.category === 'hvac')?.selectedSubcontractor
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/50 backdrop-blur-md px-6 sm:px-8 py-4 shadow-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => contextRFP ? router.push(`/workspace/${contextRFP.id.split('-')[1]}`) : router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to {contextRFP ? 'RFP Workspace' : 'Dashboard'}</span>
            </button>
            <Breadcrumb
              items={getBreadcrumbItems()}
              showHome={false}
              className="text-gray-600"
            />
          </div>
                     <div className="flex items-center gap-3">
             <button
               onClick={() => router.push(`/subcontractors/team-assembly?rfp=${contextRFP?.id}`)}
               className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm"
             >
               Team Assembly
             </button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subcontractor Selection</h1>
          <p className="text-gray-600">
            {contextRFP 
              ? `Choose qualified subcontractors for ${contextRFP.title}`
              : 'Manage your subcontractor partnerships'
            }
          </p>
          
          {/* Progress Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-100/80 backdrop-blur-sm rounded-2xl border border-blue-200/40">
              <div className="text-2xl font-bold text-blue-600">{categories.reduce((sum, cat) => sum + cat.count, 0)}</div>
              <div className="text-sm text-blue-800">Available Subcontractors</div>
            </div>
            <div className="text-center p-4 bg-green-100/80 backdrop-blur-sm rounded-2xl border border-green-200/40">
              <div className="text-2xl font-bold text-green-600">{selections.length}</div>
              <div className="text-sm text-green-800">Selected</div>
            </div>
            <div className="text-center p-4 bg-orange-100/80 backdrop-blur-sm rounded-2xl border border-orange-200/40">
              <div className="text-2xl font-bold text-orange-600">{categories.length - selections.length}</div>
              <div className="text-sm text-orange-800">Pending Selection</div>
            </div>
          </div>
        </div>

        {/* Spirit Recommendation */}
        <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 mb-3">
                Spirit AI: Based on project requirements and past performance, I recommend Bay Electric Inc. for electrical work and Statewide HVAC for the primary installation.
              </p>
              <button 
                onClick={() => openSelectionModal('electrical')}
                className="text-blue-700 hover:text-blue-800 font-medium text-sm"
              >
                Review Recommendations →
              </button>
            </div>
          </div>
        </div>

        {/* Selection Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => {
            const recommended = getRecommendedSubcontractor(category.id);
            const selectedSub = category.selected ? 
              getSubcontractorsBySpecialty(category.id).find(s => s.id === category.selected) : null;
            
            return (
              <div key={category.id} className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{category.count}</div>
                    <div className="text-sm text-gray-600">available</div>
                  </div>
                </div>

                {/* Current Selection or Recommendation */}
                {selectedSub ? (
                  <div className="p-4 bg-green-50/80 rounded-2xl border border-green-200/40 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-800">{selectedSub.name}</div>
                        <div className="text-sm text-green-700">Selected • Score: {selectedSub.recommendationScore}/100</div>
                        <div className="text-xs text-green-600 mt-1">
                          ${selectedSub.pricing.estimatedTotal.toLocaleString()} • {selectedSub.location}
                        </div>
                      </div>
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                ) : recommended ? (
                  <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/40 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-800">{recommended.name}</div>
                        <div className="text-sm text-blue-700">Recommended • Score: {recommended.recommendationScore}/100</div>
                        <div className="text-xs text-blue-600 mt-1">
                          ${recommended.pricing.estimatedTotal.toLocaleString()} • {recommended.location}
                        </div>
                      </div>
                      <StarIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/40 mb-4">
                    <div className="text-center text-gray-600">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No subcontractors available for this category</div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => openSelectionModal(category.id)}
                  disabled={category.count === 0}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    category.count === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedSub
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {category.count === 0 
                    ? 'No Options Available'
                    : selectedSub 
                    ? `Change Selection (${category.count} options)`
                    : `Choose from ${category.count} Options`
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Selection Summary */}
        {selections.length > 0 && (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Selection Summary</h3>
            <div className="space-y-3">
              {selections.map((selection) => {
                const sub = getSubcontractorsBySpecialty(selection.category).find(s => s.id === selection.selectedSubcontractor);
                return sub ? (
                  <div key={selection.category} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-800">{sub.name}</div>
                      <div className="text-sm text-gray-600">{selection.category} • ${sub.pricing.estimatedTotal.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Selected</div>
                      <div className="text-xs text-gray-500">{new Date(selection.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
            
            {/* Total Estimate */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">Total Subcontractor Cost</div>
                <div className="text-2xl font-bold text-green-600">
                  ${selections.reduce((total, selection) => {
                    const sub = getSubcontractorsBySpecialty(selection.category).find(s => s.id === selection.selectedSubcontractor);
                    return total + (sub?.pricing.estimatedTotal || 0);
                  }, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
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
  );
} 