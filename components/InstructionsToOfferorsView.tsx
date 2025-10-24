"use client";

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import {
  getInstructionsToOfferorsData,
  updateRequirementStatus,
  calculateComplianceScore,
  getStatusIcon,
  getStatusColor,
  getSpiritResultColor,
  type InstructionsToOfferorsData,
  type SubmissionRequirement
} from '../lib/instructionsToOfferors';
import { createDocumentViewerUrl, getDocumentById } from '../lib/mockDocuments';

interface InstructionsToOfferorsViewProps {
  rfpId: string;
}

export default function InstructionsToOfferorsView({ rfpId }: InstructionsToOfferorsViewProps) {
  const [data, setData] = useState<InstructionsToOfferorsData>(() => getInstructionsToOfferorsData(rfpId));
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleStatusUpdate = (requirementId: string, newStatus: SubmissionRequirement['status']) => {
    const updatedData = updateRequirementStatus(data, requirementId, newStatus);
    const newScore = calculateComplianceScore(updatedData);
    setData({ ...updatedData, overallComplianceScore: newScore });
  };

  const handleFileUpload = async (requirementId: string) => {
    setIsUploading(requirementId);
    // Simulate file upload
    setTimeout(() => {
      handleStatusUpdate(requirementId, 'uploaded');
      setIsUploading(null);
    }, 2000);
  };

  const handleFixFormatting = async (requirementId: string) => {
    setIsUploading(requirementId);
    // Simulate formatting fix
    setTimeout(() => {
      handleStatusUpdate(requirementId, 'uploaded');
      setIsUploading(null);
    }, 1500);
  };

  const getActionButton = (req: SubmissionRequirement) => {
    if (isUploading === req.id) {
      return (
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
          <ClockIcon className="w-4 h-4 animate-spin" />
          Processing...
        </button>
      );
    }

    switch (req.status) {
      case 'missing':
        return (
          <button
            onClick={() => handleFileUpload(req.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload File
          </button>
        );
      case 'needs-attention':
        return (
          <button
            onClick={() => handleFixFormatting(req.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
          >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            Fix
          </button>
        );
      case 'incomplete':
        return (
          <button
            onClick={() => handleFileUpload(req.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Complete
          </button>
        );
      case 'uploaded':
        return req.fileUrl ? (
          <button
            onClick={() => {
              // Map requirement IDs to document IDs
              const docMap: Record<string, string> = {
                'tech-proposal': 'tech-proposal-v2',
                'pricing-sheet': 'pricing-sheet-v1',
                'compliance-certs': 'general-certs',
                'insurance-docs': 'insurance-certs',
                'cover-letter': 'tech-proposal-v2' // Fallback for demo
              };
              const docId = docMap[req.id];
              if (docId) {
                const url = createDocumentViewerUrl(docId);
                window.open(url, '_blank');
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            View PDF
          </button>
        ) : (
          <span className="text-green-600 text-sm font-medium">Completed</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Instructions to Offerors' Breakdown View</h1>
        <p className="text-gray-600">Comprehensive compliance checking and submission requirements tracking</p>
        
        {/* Overall Score */}
        <div className="mt-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-blue-600">{data.overallComplianceScore}%</div>
          <div className="text-gray-600">Overall Compliance Score</div>
          <div className="ml-auto text-sm text-gray-500">
            Due: {new Date(data.submissionDeadline).toLocaleDateString()} at 5:00 PM
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Submission Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Requirements Table */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Submission Requirements</h2>
              <span className="text-sm text-gray-600">Eligibility</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">REQUIREMENT</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">DESCRIPTION</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">REQUIRED?</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.submissionRequirements.map((req) => (
                    <tr 
                      key={req.id} 
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequirement(selectedRequirement === req.id ? null : req.id)}
                    >
                      <td className="py-4">
                        <div className="font-medium text-gray-800">{req.requirement}</div>
                        <div className="text-sm text-gray-600 mt-1">{req.description}</div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {req.source && (
                          <span className="text-blue-600 hover:underline">{req.source}</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          <span>{getStatusIcon(req.status)}</span>
                          {req.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td className="py-4">
                        {getActionButton(req)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Missing Items / Gaps */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Missing Items / Gaps</h2>
            
            <div className="space-y-4">
              {data.missingItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="flex-shrink-0 mt-1">
                    {item.severity === 'critical' ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.item}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  </div>
                  <div className="flex gap-2">
                    {item.action === 'Fix Formatting' ? (
                      <button
                        onClick={() => handleFixFormatting('formatting-fix')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm hover:bg-orange-700 transition-colors"
                      >
                        Fix Formatting
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFileUpload('missing-file')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
                      >
                        Upload Missing File
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Spirit Check & Notes */}
        <div className="space-y-6">
          {/* Spirit Check Compliance Engine */}
          <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
            <h2 className="text-xl font-bold text-blue-800 mb-6">Spirit Check Compliance Engine</h2>
            
            <div className="space-y-4">
              {data.spiritCheckRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-white/60 rounded-2xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-800">{rule.rule}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpiritResultColor(rule.result)}`}>
                      {rule.result === 'pass' ? 'Pass' : rule.result === 'warning' ? 'String' : 'Fail'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{rule.intent}</div>
                  <div className="text-sm text-gray-700">{rule.details}</div>
                  {rule.suggestion && (
                    <div className="text-xs text-blue-600 mt-2 italic">{rule.suggestion}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes to Admin / Writer */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Notes to Admin / Writer</h2>
            
            <div className="space-y-4">
              {data.adminNotes.map((note, index) => (
                <div key={index} className="p-4 bg-yellow-50/80 rounded-2xl border border-yellow-200/40">
                  <div className="text-sm text-gray-700">
                    {note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Submission Info */}
          <div className="bg-green-50/80 backdrop-blur-md rounded-3xl p-6 border border-green-200/40 shadow-xl">
            <h2 className="text-xl font-bold text-green-800 mb-4">Submission Portal</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Portal URL:</span>
                <button
                  onClick={() => window.open(data.portalInfo.url, '_blank')}
                  className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  GSA Portal
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deadline:</span>
                <span className="text-sm font-medium text-gray-800">{data.portalInfo.deadline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Upload:</span>
                <span className={`text-sm font-medium ${data.portalInfo.autoUploadEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {data.portalInfo.autoUploadEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
              Test Portal Connection
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Requirement Details */}
      {selectedRequirement && (
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
          {(() => {
            const req = data.submissionRequirements.find(r => r.id === selectedRequirement);
            if (!req) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{req.requirement} Details</h3>
                  <button
                    onClick={() => setSelectedRequirement(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Requirement Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Description:</span> {req.description}</div>
                      <div><span className="font-medium">Source:</span> {req.source}</div>
                      <div><span className="font-medium">Required:</span> {req.required ? 'Yes' : 'No'}</div>
                      {req.lastUpdated && (
                        <div><span className="font-medium">Last Updated:</span> {new Date(req.lastUpdated).toLocaleString()}</div>
                      )}
                      {req.notes && (
                        <div><span className="font-medium">Notes:</span> {req.notes}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Actions</h4>
                    <div className="space-y-2">
                      {req.fileUrl && (
                        <button
                          onClick={() => {
                            const docMap: Record<string, string> = {
                              'tech-proposal': 'tech-proposal-v2',
                              'pricing-sheet': 'pricing-sheet-v1',
                              'compliance-certs': 'general-certs',
                              'insurance-docs': 'insurance-certs',
                              'cover-letter': 'tech-proposal-v2'
                            };
                            const docId = docMap[req.id];
                            if (docId) {
                              const url = createDocumentViewerUrl(docId);
                              window.open(url, '_blank');
                            }
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm hover:bg-blue-200 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Current File
                        </button>
                      )}
                      <button
                        onClick={() => handleFileUpload(req.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition-colors"
                      >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Upload New Version
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 