"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const HVAC_TASKS = [
  { id: 1, task: "Remove existing units", completed: true, assigned: false },
  { id: 2, task: "Install new units", completed: false, assigned: true },
  { id: 3, task: "Perform startup and testing", completed: false, assigned: false },
  { id: 4, task: "Commission system", completed: false, assigned: false }
];

const SUBCONTRACTORS = [
  {
    id: 1,
    name: "Reliable Mechanical",
    readiness: "82%",
    capacity: "-35%",
    status: "overbooked",
    assignedTasks: ["Install new units"],
    capacityIndicators: ["red", "red", "yellow"],
    issues: ["Insurance"]
  },
  {
    id: 2,
    name: "Statewide HVAC", 
    readiness: "94%",
    capacity: "+20%",
    status: "available",
    assignedTasks: ["Remove existing units", "Perform startup and testing"],
    capacityIndicators: ["green", "green", "green"],
    issues: ["License"]
  }
];

const METADATA = {
  metadata: "5 days",
  includes: "Licensed HVAC",
  classification: "Project Safety Plan",
  metaTVIT: "5reay",
  requires: "Missing HVAC LAG must"
};

const SPIRIT_SUGGESTIONS = [
  {
    type: "recommendation",
    message: "Consider splitting Site Cleanup between Vendor A and B to shorten schedule optimization."
  },
  {
    type: "warning", 
    message: "This subcontractor lacks valid OSHA cert, reassign?"
  }
];

function TaskList() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">HVAC Installation</h3>
        <button className="p-2 hover:bg-gray-100/50 rounded-lg">
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-3">
        {HVAC_TASKS.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-3 border border-gray-200/50 rounded-xl">
            <div className="relative">
              <input
                type="checkbox"
                checked={task.completed}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                readOnly
              />
              {task.completed && (
                <CheckCircleIcon className="absolute inset-0 w-5 h-5 text-blue-600" />
              )}
            </div>
            <span className={`flex-1 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {task.task}
            </span>
            {task.assigned && (
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <h4 className="font-medium text-gray-800 mb-3">Metadata</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-600" />
            <span>Metadata: {METADATA.metadata}</span>
          </div>
          <div className="text-gray-700">
            <p>Includes: {METADATA.includes}</p>
            <p>Classification: {METADATA.classification}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p><strong>Meta TVIT:</strong> {METADATA.metaTVIT}</p>
        <p><strong>Requires:</strong> <span className="text-red-600">{METADATA.requires}</span></p>
      </div>
    </div>
  );
}

function SubcontractorCapacity({ contractor }: { contractor: typeof SUBCONTRACTORS[0] }) {
  const getCapacityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-700';
      case 'overbooked':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{contractor.name}</h3>
          <p className="text-sm text-gray-600">{contractor.readiness} Ready</p>
        </div>
        <div className="flex gap-1">
          {contractor.capacityIndicators.map((color, index) => (
            <div key={index} className={`w-3 h-3 rounded-full ${getIndicatorColor(color)}`}></div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Capacity</span>
          <span className={`font-medium ${getCapacityColor(contractor.status)}`}>
            {contractor.capacity} of capacity
          </span>
        </div>
        
        <div className="space-y-2">
          {contractor.assignedTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
              <span className="text-gray-800">{task}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Impact:</span>
          <span className="font-medium text-gray-800">
            +${contractor.status === 'available' ? '1,800' : '800'} to baseline cost
          </span>
        </div>
      </div>
    </div>
  );
}

function SpiritRecommendations() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      
      <div className="space-y-4">
        {SPIRIT_SUGGESTIONS.map((suggestion, index) => (
          <div key={index} className="bg-white/60 rounded-2xl p-4">
            <p className="text-sm text-gray-700">{suggestion.message}</p>
          </div>
        ))}
        
        <button className="w-full text-blue-700 hover:text-blue-800 font-medium text-sm mt-4">
          Add a second subcontractor?
        </button>
      </div>
    </div>
  );
}

function ToolsSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <div className="space-y-4">
        <button className="w-full flex items-center gap-3 p-4 bg-blue-100/80 rounded-2xl hover:bg-blue-200/80 transition-colors">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">LG</span>
          </div>
          <span className="font-medium text-gray-800">LOI Generator</span>
        </button>
        
        <button className="w-full flex items-center gap-3 p-4 bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-colors">
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">PE</span>
          </div>
          <span className="font-medium text-gray-800">Pricing Estimator</span>
        </button>
      </div>
    </div>
  );
}

export default function ScopeAssignmentPage() {
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
          
          <h1 className="text-3xl font-bold text-gray-800">Scope Assignment Panel</h1>
          
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks */}
          <div>
            <TaskList />
          </div>

          {/* Middle Column - Subcontractors */}
          <div className="space-y-6">
            {SUBCONTRACTORS.map((contractor) => (
              <SubcontractorCapacity key={contractor.id} contractor={contractor} />
            ))}
          </div>

          {/* Right Column - Spirit & Tools */}
          <div className="space-y-6">
            <SpiritRecommendations />
            <ToolsSection />
          </div>
        </div>
      </div>
    </div>
  );
} 