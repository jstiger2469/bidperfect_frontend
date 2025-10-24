"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
  PlayIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  TableCellsIcon,
  CurrencyDollarIcon,
  UsersIcon,
  RectangleStackIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface RFPJourneyProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  rfpData: any;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  progress: number;
  estimatedTime: string;
  required: boolean;
}

interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  color: string;
  steps: JourneyStep[];
  status: 'locked' | 'available' | 'in-progress' | 'complete';
  overallProgress: number;
}

export default function RFPJourney({ activeSection, onSectionChange, rfpData }: RFPJourneyProps) {
  const [expandedPhase, setExpandedPhase] = useState<string>('preparation');

  const getStepStatus = (stepId: string, stepProgress: number): 'locked' | 'available' | 'in-progress' | 'complete' => {
    if (stepProgress >= 100) return 'complete';
    if (stepProgress > 0) return 'in-progress';
    
    // Logic for when steps become available
    const stepOrder = ['overview', 'gap-analysis', 'evaluation-criteria', 'instructions', 'scope', 'compliance', 'pricing', 'team', 'proposal', 'review'];
    const currentIndex = stepOrder.indexOf(stepId);
    const previousStepIndex = currentIndex - 1;
    
    if (currentIndex === 0) return 'available'; // First step always available
    if (previousStepIndex >= 0) {
      const previousStep = stepOrder[previousStepIndex];
      const previousProgress = getStepProgress(previousStep);
      if (previousProgress >= 70) return 'available'; // Previous step 70% complete
    }
    
    return 'locked';
  };

  const getStepProgress = (stepId: string): number => {
    // Mock progress calculation - in real app this would come from actual data
    switch (stepId) {
      case 'overview': return rfpData?.readiness >= 20 ? 100 : 50;
      case 'gap-analysis': return rfpData?.readiness >= 30 ? 100 : 0;
      case 'evaluation-criteria': return rfpData?.readiness >= 40 ? 100 : 0;
      case 'instructions': return rfpData?.readiness >= 45 ? 100 : 0;
      case 'scope': return rfpData?.readiness >= 50 ? 100 : 0;
      case 'compliance': return rfpData?.readiness >= 65 ? 80 : 0;
      case 'pricing': return rfpData?.readiness >= 70 ? 90 : 0;
      case 'team': return rfpData?.readiness >= 75 ? 85 : 0;
      case 'proposal': return rfpData?.readiness >= 85 ? 70 : 0;
      case 'review': return rfpData?.readiness >= 95 ? 100 : 0;
      default: return 0;
    }
  };

  const phases: JourneyPhase[] = [
    {
      id: 'preparation',
      title: 'Preparation',
      description: 'Understand the opportunity and assess your approach',
      color: 'blue',
      status: 'available',
      overallProgress: 75,
      steps: [
        {
          id: 'overview',
          title: 'RFP Overview',
          description: 'Review RFP details, timeline, and requirements',
          icon: DocumentTextIcon,
          status: getStepStatus('overview', getStepProgress('overview')),
          progress: getStepProgress('overview'),
          estimatedTime: '15 min',
          required: true
        },
        {
          id: 'gap-analysis',
          title: 'Gap Analysis',
          description: 'Identify what you need to win this opportunity',
          icon: ExclamationTriangleIcon,
          status: getStepStatus('gap-analysis', getStepProgress('gap-analysis')),
          progress: getStepProgress('gap-analysis'),
          estimatedTime: '30 min',
          required: true
        },
        {
          id: 'evaluation-criteria',
          title: 'Evaluation Criteria',
          description: 'Understand how proposals will be scored',
          icon: ClipboardDocumentCheckIcon,
          status: getStepStatus('evaluation-criteria', getStepProgress('evaluation-criteria')),
          progress: getStepProgress('evaluation-criteria'),
          estimatedTime: '20 min',
          required: true
        }
      ]
    },
    {
      id: 'execution',
      title: 'Execution',
      description: 'Build the technical and compliance foundation',
      color: 'purple',
      status: 'available',
      overallProgress: 60,
      steps: [
        {
          id: 'instructions',
          title: 'Instructions to Offerors',
          description: 'Review submission requirements and compliance',
          icon: DocumentTextIcon,
          status: getStepStatus('instructions', getStepProgress('instructions')),
          progress: getStepProgress('instructions'),
          estimatedTime: '30 min',
          required: true
        },
        {
          id: 'scope',
          title: 'Scope of Work',
          description: 'Define your technical approach and deliverables',
          icon: BookOpenIcon,
          status: getStepStatus('scope', getStepProgress('scope')),
          progress: getStepProgress('scope'),
          estimatedTime: '45 min',
          required: true
        },
        {
          id: 'compliance',
          title: 'Compliance Matrix',
          description: 'Address all FAR clauses and requirements',
          icon: TableCellsIcon,
          status: getStepStatus('compliance', getStepProgress('compliance')),
          progress: getStepProgress('compliance'),
          estimatedTime: '60 min',
          required: true
        },
        {
          id: 'pricing',
          title: 'Pricing Strategy',
          description: 'Develop competitive and compliant pricing',
          icon: CurrencyDollarIcon,
          status: getStepStatus('pricing', getStepProgress('pricing')),
          progress: getStepProgress('pricing'),
          estimatedTime: '90 min',
          required: true
        }
      ]
    },
    {
      id: 'engagement',
      title: 'Engagement',
      description: 'Assemble your team and build the proposal',
      color: 'green',
      status: 'available',
      overallProgress: 45,
      steps: [
        {
          id: 'team',
          title: 'Team & Subcontractors',
          description: 'Assign qualified team members and partners',
          icon: UsersIcon,
          status: getStepStatus('team', getStepProgress('team')),
          progress: getStepProgress('team'),
          estimatedTime: '60 min',
          required: true
        },
        {
          id: 'proposal',
          title: 'Proposal Builder',
          description: 'Assemble and format your final proposal',
          icon: RectangleStackIcon,
          status: getStepStatus('proposal', getStepProgress('proposal')),
          progress: getStepProgress('proposal'),
          estimatedTime: '45 min',
          required: true
        }
      ]
    },
    {
      id: 'finalization',
      title: 'Final Steps',
      description: 'Review, validate, and submit your proposal',
      color: 'orange',
      status: 'available',
      overallProgress: 20,
      steps: [
        {
          id: 'review',
          title: 'Final Review & Submit',
          description: 'Complete final checks and submit your proposal',
          icon: ArrowDownTrayIcon,
          status: getStepStatus('review', getStepProgress('review')),
          progress: getStepProgress('review'),
          estimatedTime: '30 min',
          required: true
        }
      ]
    }
  ];

  const getStatusIcon = (status: string, progress: number = 0) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <LockClosedIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <PlayIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPhaseColorClasses = (color: string, status: string) => {
    const baseClasses = "transition-all duration-300 border";
    
    if (status === 'complete') {
      return `${baseClasses} bg-green-50/80 border-green-200 text-green-800`;
    }
    
    switch (color) {
      case 'blue': return `${baseClasses} bg-blue-50/80 border-blue-200 text-blue-800`;
      case 'purple': return `${baseClasses} bg-purple-50/80 border-purple-200 text-purple-800`;
      case 'green': return `${baseClasses} bg-green-50/80 border-green-200 text-green-800`;
      case 'orange': return `${baseClasses} bg-orange-50/80 border-orange-200 text-orange-800`;
      default: return `${baseClasses} bg-gray-50/80 border-gray-200 text-gray-800`;
    }
  };

  const getStepColorClasses = (status: string, isActive: boolean = false) => {
    if (isActive) {
      return "bg-blue-100/90 border-blue-300 text-blue-900 shadow-lg";
    }
    
    switch (status) {
      case 'complete':
        return "bg-green-50/80 border-green-200 text-green-800 hover:bg-green-100/80";
      case 'in-progress':
        return "bg-blue-50/80 border-blue-200 text-blue-800 hover:bg-blue-100/80";
      case 'available':
        return "bg-white/80 border-gray-200 text-gray-800 hover:bg-gray-50/80";
      case 'locked':
        return "bg-gray-50/60 border-gray-200 text-gray-500 cursor-not-allowed";
      default:
        return "bg-white/80 border-gray-200 text-gray-800";
    }
  };

  const handleStepClick = (step: JourneyStep) => {
    if (step.status === 'locked') return;
    onSectionChange(step.id);
  };

  const getNextAvailableStep = () => {
    for (const phase of phases) {
      for (const step of phase.steps) {
        if (step.status === 'available' || step.status === 'in-progress') {
          return step;
        }
      }
    }
    return phases[0].steps[0]; // Fallback to first step
  };

  const overallProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.overallProgress, 0) / phases.length
  );

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">RFP Journey</h2>
            <p className="text-gray-600 mt-1">Follow this guided path to complete your proposal</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        
        {/* Quick Action */}
        <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border border-blue-200/50">
          <div>
            <h3 className="font-semibold text-blue-800">Continue Where You Left Off</h3>
            <p className="text-sm text-blue-700">Next: {getNextAvailableStep().title}</p>
          </div>
          <button
            onClick={() => handleStepClick(getNextAvailableStep())}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2"
          >
            Continue Journey
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Journey Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className={`rounded-3xl p-6 backdrop-blur-md shadow-xl ${getPhaseColorClasses(phase.color, phase.status)}`}>
            <button
              onClick={() => setExpandedPhase(expandedPhase === phase.id ? '' : phase.id)}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <h3 className="text-xl font-bold">{phase.title}</h3>
                  <p className="text-sm opacity-80">{phase.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold">{phase.overallProgress}%</div>
                  <div className="text-xs opacity-70">Progress</div>
                </div>
                <ChevronRightIcon className={`w-5 h-5 transition-transform duration-200 ${expandedPhase === phase.id ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* Progress Bar */}
            <div className="w-full bg-white/60 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${phase.overallProgress}%` }}
              />
            </div>

            {/* Phase Steps */}
            {expandedPhase === phase.id && (
              <div className="space-y-3 mt-4">
                {phase.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step)}
                    disabled={step.status === 'locked'}
                    className={`w-full p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${getStepColorClasses(step.status, activeSection === step.id)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status, step.progress)}
                      </div>
                      <step.icon className="w-6 h-6 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{step.title}</h4>
                          {step.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
                          )}
                        </div>
                        <p className="text-sm opacity-80">{step.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-xs opacity-70">⏱ {step.estimatedTime}</div>
                          {step.progress > 0 && (
                            <div className="text-xs opacity-70">{step.progress}% complete</div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {step.status !== 'locked' && (
                          <ChevronRightIcon className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    {/* Step Progress Bar */}
                    {step.progress > 0 && (
                      <div className="w-full bg-white/60 rounded-full h-1.5 mt-3">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 