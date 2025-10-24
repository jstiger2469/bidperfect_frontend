"use client";

import React, { useState } from 'react';
import {
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  getSubcontractorsBySpecialty,
  selectSubcontractor,
  calculateSelectionScore,
  type SubcontractorOption,
  type SubcontractorSelection
} from '../lib/subcontractorSelection';

interface SubcontractorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialty: string;
  rfpId: string;
  onSelection: (selection: SubcontractorSelection) => void;
}

export default function SubcontractorSelectionModal({
  isOpen,
  onClose,
  specialty,
  rfpId,
  onSelection
}: SubcontractorSelectionModalProps) {
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'performance' | 'compliance'>('overview');

  const subcontractors = getSubcontractorsBySpecialty(specialty);

  if (!isOpen) return null;

  const handleSelectSubcontractor = (subId: string) => {
    const selection = selectSubcontractor(rfpId, specialty, subId, notes);
    onSelection(selection);
    onClose();
  };

  const toggleComparison = (subId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(subId) 
        ? prev.filter(id => id !== subId)
        : [...prev, subId].slice(0, 3) // Max 3 for comparison
    );
  };

  const getStatusBadge = (subcontractor: SubcontractorOption) => {
    if (subcontractor.capacity.includes('-')) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Overbooked</span>;
    }
    if (subcontractor.availability.conflictRisk === 'high') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Schedule Risk</span>;
    }
    if (subcontractor.complianceStatus.overallScore < 90) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Compliance Gap</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Available</span>;
  };

  const SubcontractorCard = ({ subcontractor }: { subcontractor: SubcontractorOption }) => (
    <div className={`p-6 border rounded-2xl transition-all duration-200 ${
      selectedSubcontractor === subcontractor.id 
        ? 'border-blue-300 bg-blue-50/80' 
        : 'border-gray-200 bg-white/60 hover:bg-gray-50/80'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-800">{subcontractor.name}</h3>
            {getStatusBadge(subcontractor)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span>{subcontractor.rating}/5.0</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{subcontractor.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{subcontractor.availability.startDate}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-3">{subcontractor.experience}</p>
          
          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subcontractor.specialty.map((spec, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {spec}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${subcontractor.pricing.estimatedTotal.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Estimated Total</div>
          <div className="text-xs text-gray-500 mt-1">
            Rank #{subcontractor.pricing.competitiveRank} price
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50/80 rounded-xl">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{subcontractor.recommendationScore}</div>
          <div className="text-xs text-gray-600">Spirit Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{subcontractor.pastPerformance.length}</div>
          <div className="text-xs text-gray-600">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{subcontractor.complianceStatus.overallScore}%</div>
          <div className="text-xs text-gray-600">Compliance</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            subcontractor.availability.conflictRisk === 'low' ? 'text-green-600' :
            subcontractor.availability.conflictRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {subcontractor.availability.conflictRisk.toUpperCase()}
          </div>
          <div className="text-xs text-gray-600">Risk</div>
        </div>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold text-green-800 text-sm mb-2">Strengths</h4>
          <ul className="space-y-1">
            {subcontractor.strengths.slice(0, 3).map((strength, index) => (
              <li key={index} className="text-xs text-green-700 flex items-start gap-1">
                <CheckCircleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        {subcontractor.concerns.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-800 text-sm mb-2">Concerns</h4>
            <ul className="space-y-1">
              {subcontractor.concerns.slice(0, 3).map((concern, index) => (
                <li key={index} className="text-xs text-orange-700 flex items-start gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedSubcontractor(subcontractor.id)}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            selectedSubcontractor === subcontractor.id
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {selectedSubcontractor === subcontractor.id ? 'Selected' : 'Select'}
        </button>
        <button
          onClick={() => toggleComparison(subcontractor.id)}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            selectedForComparison.includes(subcontractor.id)
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {selectedForComparison.includes(subcontractor.id) ? 'Added' : 'Compare'}
        </button>
        <button
          onClick={() => {
            // Show detailed view modal (placeholder)
            alert(`Detailed view for ${subcontractor.name} would open here`);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
        >
          Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Select {specialty} Subcontractor</h2>
              <p className="text-gray-600 mt-1">Choose the best partner for your HVAC project</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedForComparison.length > 1 && (
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
                >
                  {comparisonMode ? 'Exit Comparison' : `Compare ${selectedForComparison.length}`}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {comparisonMode && selectedForComparison.length > 1 ? (
              /* Comparison View */
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Subcontractor Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-semibold">Criteria</th>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <th key={subId} className="text-center p-4 font-semibold">
                              {sub.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Spirit Score</td>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <td key={subId} className="p-4 text-center">
                              <span className="text-2xl font-bold text-blue-600">{sub.recommendationScore}</span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Estimated Total</td>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <td key={subId} className="p-4 text-center">
                              <span className="text-lg font-bold text-green-600">
                                ${sub.pricing.estimatedTotal.toLocaleString()}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Rating</td>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <td key={subId} className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span>{sub.rating}/5.0</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Availability</td>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <td key={subId} className="p-4 text-center">
                              <span className={
                                sub.availability.conflictRisk === 'low' ? 'text-green-600' :
                                sub.availability.conflictRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                              }>
                                {sub.availability.startDate}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Compliance</td>
                        {selectedForComparison.map(subId => {
                          const sub = subcontractors.find(s => s.id === subId)!;
                          return (
                            <td key={subId} className="p-4 text-center">
                              <span className={
                                sub.complianceStatus.overallScore >= 90 ? 'text-green-600' : 'text-orange-600'
                              }>
                                {sub.complianceStatus.overallScore}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Standard List View */
              <div className="space-y-6">
                {subcontractors.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Subcontractors Available</h3>
                    <p className="text-gray-500">No qualified subcontractors found for {specialty}</p>
                  </div>
                ) : (
                  subcontractors.map((subcontractor) => (
                    <SubcontractorCard key={subcontractor.id} subcontractor={subcontractor} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {subcontractors.length} subcontractors available for {specialty}
              </div>
              {selectedForComparison.length > 0 && (
                <div className="text-sm text-blue-600">
                  {selectedForComparison.length} selected for comparison
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              {selectedSubcontractor && (
                <button
                  onClick={() => handleSelectSubcontractor(selectedSubcontractor)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
                >
                  Confirm Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 