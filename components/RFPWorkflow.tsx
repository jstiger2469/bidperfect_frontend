"use client";

import React from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HomeIcon,
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

interface WorkflowPhase {
  id: number;
  title: string;
  description: string;
  color: string;
  tabs: number[];
  status: 'completed' | 'current' | 'upcoming';
}

interface RFPWorkflowProps {
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
  rfpReadiness: number;
}

const TABS = [
  { label: "Overview", icon: HomeIcon },
  { label: "Gap Analysis", icon: ExclamationTriangleIcon },
  { label: "Evaluation Criteria", icon: ClipboardDocumentCheckIcon },
  { label: "Instructions", icon: DocumentTextIcon },
  { label: "Scope of Work", icon: BookOpenIcon },
  { label: "Compliance Matrix", icon: TableCellsIcon },
  { label: "Pricing & Cost Proposal", icon: CurrencyDollarIcon },
  { label: "Team & Subcontractors", icon: UsersIcon },
  { label: "Proposal Builder", icon: RectangleStackIcon },
  { label: "Submission & Export", icon: ArrowDownTrayIcon },
];

export default function RFPWorkflow({ activeTab, onTabChange, rfpReadiness }: RFPWorkflowProps) {
  
  const getPhaseStatus = (phaseIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (rfpReadiness >= 90 && phaseIndex <= 2) return 'completed';
    if (rfpReadiness >= 70 && phaseIndex <= 1) return 'completed';
    if (rfpReadiness >= 50 && phaseIndex === 0) return 'completed';
    
    // Current phase logic based on active tab
    const phases = [
      [0, 1, 2], // Preparation
      [3, 4, 5, 6], // Execution  
      [7, 8], // Engagement
      [9] // Final Steps
    ];
    
    const currentPhase = phases.findIndex(tabs => tabs.includes(activeTab));
    if (currentPhase === phaseIndex) return 'current';
    if (currentPhase > phaseIndex) return 'completed';
    
    return 'upcoming';
  };

  const phases: WorkflowPhase[] = [
    {
      id: 1,
      title: "Preparation",
      description: "Understand requirements and evaluate approach",
      color: "blue",
      tabs: [0, 1, 2],
      status: getPhaseStatus(0)
    },
    {
      id: 2,
      title: "Execution", 
      description: "Analyze scope, ensure compliance, and develop pricing",
      color: "purple",
      tabs: [3, 4, 5, 6],
      status: getPhaseStatus(1)
    },
    {
      id: 3,
      title: "Engagement",
      description: "Assemble team and build proposal",
      color: "green",
      tabs: [7, 8],
      status: getPhaseStatus(2)
    },
    {
      id: 4,
      title: "Final Steps",
      description: "Review, finalize, and submit proposal",
      color: "orange",
      tabs: [9],
      status: getPhaseStatus(3)
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'current':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getPhaseColorClasses = (color: string, status: string) => {
    const baseClasses = "transition-all duration-300";
    
    if (status === 'completed') {
      return `${baseClasses} bg-green-100/80 border-green-300 text-green-800`;
    }
    if (status === 'current') {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-100/80 border-blue-300 text-blue-800`;
        case 'purple': return `${baseClasses} bg-purple-100/80 border-purple-300 text-purple-800`;
        case 'green': return `${baseClasses} bg-green-100/80 border-green-300 text-green-800`;
        case 'orange': return `${baseClasses} bg-orange-100/80 border-orange-300 text-orange-800`;
      }
    }
    return `${baseClasses} bg-gray-100/80 border-gray-300 text-gray-600`;
  };

  const getTabColorClasses = (tabIndex: number) => {
    const isActive = activeTab === tabIndex;
    const phase = phases.find(p => p.tabs.includes(tabIndex));
    
    if (isActive) {
      switch (phase?.color) {
        case 'blue': return "bg-blue-600/90 text-white shadow-lg";
        case 'purple': return "bg-purple-600/90 text-white shadow-lg";
        case 'green': return "bg-green-600/90 text-white shadow-lg";
        case 'orange': return "bg-orange-600/90 text-white shadow-lg";
        default: return "bg-blue-600/90 text-white shadow-lg";
      }
    }
    
    if (phase?.status === 'completed') {
      return "bg-green-100/80 text-green-700 hover:bg-green-200/80";
    }
    if (phase?.status === 'current') {
      switch (phase.color) {
        case 'blue': return "bg-blue-100/80 text-blue-700 hover:bg-blue-200/80";
        case 'purple': return "bg-purple-100/80 text-purple-700 hover:bg-purple-200/80";
        case 'green': return "bg-green-100/80 text-green-700 hover:bg-green-200/80";
        case 'orange': return "bg-orange-100/80 text-orange-700 hover:bg-orange-200/80";
      }
    }
    
    return "bg-white/60 text-gray-600 hover:bg-white/80";
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">RFP Workflow Progress</h3>
          <div className="text-sm text-gray-600">
            Overall Readiness: <span className="font-semibold text-blue-600">{rfpReadiness}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {phases.map((phase, index) => (
            <div 
              key={phase.id}
              className={`p-4 rounded-2xl border backdrop-blur-sm ${getPhaseColorClasses(phase.color, phase.status)}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(phase.status)}
                <h4 className="font-semibold text-sm">{phase.title}</h4>
              </div>
              <p className="text-xs opacity-80 mb-3">{phase.description}</p>
              <div className="flex flex-wrap gap-1">
                {phase.tabs.map(tabIndex => (
                  <button
                    key={tabIndex}
                    onClick={() => onTabChange(tabIndex)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-200"
                    title={TABS[tabIndex].label}
                  >
                    {TABS[tabIndex].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-2 border border-white/40 shadow-xl">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab, index) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={index}
                onClick={() => onTabChange(index)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm ${getTabColorClasses(index)}`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 