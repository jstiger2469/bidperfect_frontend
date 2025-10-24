import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface WorkflowProgressProps {
  currentPhase: number;
  totalPhases: number;
  readiness: number;
  className?: string;
}

const PHASE_NAMES = ["Preparation", "Execution", "Engagement", "Final Steps"];
const PHASE_COLORS = ["blue", "purple", "green", "orange"];

export default function WorkflowProgress({ 
  currentPhase, 
  totalPhases, 
  readiness, 
  className = "" 
}: WorkflowProgressProps) {
  
  const getPhaseStatus = (phaseIndex: number) => {
    if (readiness >= 90 && phaseIndex <= 2) return 'completed';
    if (readiness >= 70 && phaseIndex <= 1) return 'completed';
    if (readiness >= 50 && phaseIndex === 0) return 'completed';
    if (phaseIndex === currentPhase) return 'current';
    if (phaseIndex < currentPhase) return 'completed';
    return 'upcoming';
  };

  const getPhaseColorClass = (phaseIndex: number) => {
    const status = getPhaseStatus(phaseIndex);
    const color = PHASE_COLORS[phaseIndex];
    
    if (status === 'completed') return 'bg-green-500';
    if (status === 'current') {
      switch (color) {
        case 'blue': return 'bg-blue-500';
        case 'purple': return 'bg-purple-500';
        case 'green': return 'bg-green-500';
        case 'orange': return 'bg-orange-500';
        default: return 'bg-blue-500';
      }
    }
    return 'bg-gray-300';
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Phase Indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPhases }, (_, index) => {
          const status = getPhaseStatus(index);
          return (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${getPhaseColorClass(index)}`} />
              {index < totalPhases - 1 && (
                <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                  status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Info */}
      <div className="flex items-center gap-2 text-sm">
        {getPhaseStatus(currentPhase) === 'completed' ? (
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
        ) : (
          <ClockIcon className="w-4 h-4 text-blue-600" />
        )}
        <span className="text-gray-700">
          <span className="font-medium">{PHASE_NAMES[currentPhase]}</span>
          <span className="text-gray-500 ml-1">({readiness}%)</span>
        </span>
      </div>
    </div>
  );
} 