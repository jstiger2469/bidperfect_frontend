"use client";

import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface ContextualActionsProps {
  currentPage?: string;
  rfpId?: string;
  className?: string;
}

interface ActionButton {
  label: string;
  href: string;
  icon: any;
  color: string;
  description?: string;
}

export default function ContextualActions({ currentPage, rfpId, className = "" }: ContextualActionsProps) {
  const router = useRouter();

  const getActions = (): ActionButton[] => {
    const baseActions: ActionButton[] = [];

    if (rfpId) {
      // RFP-specific actions
      baseActions.push(
        {
          label: "RFP Workspace",
          href: `/workspace/${rfpId.split('-')[1]}`,
          icon: DocumentTextIcon,
          color: "bg-blue-100/80 text-blue-700 hover:bg-blue-200/80",
          description: "Main RFP workspace"
        },
        {
          label: "Team & Subs",
          href: `/workspace/${rfpId.split('-')[1]}?tab=7`,
          icon: UsersIcon,
          color: "bg-green-100/80 text-green-700 hover:bg-green-200/80",
          description: "Team and subcontractor management"
        },
        {
          label: "Pricing",
          href: `/workspace/${rfpId.split('-')[1]}?tab=6`,
          icon: CurrencyDollarIcon,
          color: "bg-purple-100/80 text-purple-700 hover:bg-purple-200/80",
          description: "Pricing and cost proposal"
        },
        {
          label: "Compliance",
          href: `/workspace/${rfpId.split('-')[1]}?tab=5`,
          icon: CheckCircleIcon,
          color: "bg-orange-100/80 text-orange-700 hover:bg-orange-200/80",
          description: "Compliance matrix"
        }
      );

      // Add subcontractor-specific actions if we're in subcontractor section
      if (currentPage?.includes('subcontractor')) {
        baseActions.push({
          label: "Subcontractors",
          href: `/subcontractors?rfp=${rfpId}`,
          icon: BuildingOfficeIcon,
          color: "bg-teal-100/80 text-teal-700 hover:bg-teal-200/80",
          description: "Subcontractor management"
        });
      }
    }

    return baseActions;
  };

  const actions = getActions();

  if (actions.length === 0) return null;

  return (
    <div className={`bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg ${className}`}>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-sm ${action.color}`}
            title={action.description}
          >
            <action.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 