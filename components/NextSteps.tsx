import React from 'react';
import { 
  LightBulbIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface NextStepsProps {
  currentPhase: number;
  readiness: number;
  rfpId: string;
  className?: string;
}

interface NextStep {
  title: string;
  description: string;
  action: string;
  href: string;
  urgency: 'high' | 'medium' | 'low';
  icon: any;
}

export default function NextSteps({ currentPhase, readiness, rfpId, className = "" }: NextStepsProps) {
  
  const getNextSteps = (): NextStep[] => {
    const steps: NextStep[] = [];
    
    switch (currentPhase) {
      case 0: // Preparation
        if (readiness < 30) {
          steps.push({
            title: "Start Gap Analysis",
            description: "Identify missing requirements and potential risks",
            action: "Analyze Gaps",
            href: `/workspace/${rfpId}?tab=1`,
            urgency: 'high',
            icon: ExclamationTriangleIcon
          });
        }
        steps.push({
          title: "Review Evaluation Criteria", 
          description: "Understand how proposals will be scored",
          action: "Review Criteria",
          href: `/workspace/${rfpId}?tab=2`,
          urgency: 'medium',
          icon: CheckCircleIcon
        });
        break;
        
      case 1: // Execution
        if (readiness < 60) {
          steps.push({
            title: "Complete Compliance Matrix",
            description: "Ensure all FAR clauses are addressed",
            action: "Check Compliance",
            href: `/workspace/${rfpId}?tab=5`,
            urgency: 'high',
            icon: ExclamationTriangleIcon
          });
        }
        steps.push({
          title: "Develop Pricing Strategy",
          description: "Create competitive and compliant pricing",
          action: "Build Pricing",
          href: `/workspace/${rfpId}?tab=6`,
          urgency: 'medium',
          icon: LightBulbIcon
        });
        break;
        
      case 2: // Engagement
        steps.push({
          title: "Assign Team Members",
          description: "Select and assign qualified team members",
          action: "Manage Team",
          href: `/workspace/${rfpId}?tab=7`,
          urgency: 'high',
          icon: ExclamationTriangleIcon
        });
        steps.push({
          title: "Select Subcontractors",
          description: "Choose and manage subcontractor partnerships",
          action: "Manage Subs",
          href: `/subcontractors?rfp=rfp-${String(rfpId).padStart(3, '0')}`,
          urgency: 'medium',
          icon: LightBulbIcon
        });
        break;
        
      case 3: // Final Steps
        steps.push({
          title: "Final Review",
          description: "Review proposal completeness and quality",
          action: "Review Proposal",
          href: `/workspace/${rfpId}?tab=8`,
          urgency: 'high',
          icon: CheckCircleIcon
        });
        if (readiness >= 95) {
          steps.push({
            title: "Submit Proposal",
            description: "Finalize and submit your proposal",
            action: "Submit Now",
            href: `/workspace/${rfpId}?tab=9`,
            urgency: 'high',
            icon: ArrowRightIcon
          });
        }
        break;
    }
    
    return steps;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100/80 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100/80 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100/80 border-blue-300 text-blue-800';
      default: return 'bg-gray-100/80 border-gray-300 text-gray-800';
    }
  };

  const nextSteps = getNextSteps();

  if (nextSteps.length === 0) return null;

  return (
    <div className={`bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <LightBulbIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Next Steps</h3>
      </div>
      
      <div className="space-y-3">
        {nextSteps.map((step, index) => (
          <div key={index} className={`p-4 rounded-2xl border backdrop-blur-sm ${getUrgencyColor(step.urgency)}`}>
            <div className="flex items-start gap-3">
              <step.icon className="w-5 h-5 mt-0.5 opacity-80" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                <p className="text-xs opacity-80 mb-2">{step.description}</p>
                <button 
                  onClick={() => window.location.href = step.href}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded-lg text-xs font-medium transition-all duration-200"
                >
                  {step.action}
                  <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 