"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  XMarkIcon,
  DocumentTextIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface FloatingNavigationProps {
  rfpId?: string;
  currentPage?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  color: string;
}

export default function FloatingNavigation({ rfpId, currentPage }: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!rfpId) return null;

  const navItems: NavItem[] = [
    {
      label: "RFP Workspace",
      href: `/workspace/${rfpId.split('-')[1]}`,
      icon: DocumentTextIcon,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      label: "Subcontractors",
      href: `/subcontractors?rfp=${rfpId}`,
      icon: BuildingOfficeIcon,
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      label: "Team & Subs Tab",
      href: `/workspace/${rfpId.split('-')[1]}?tab=7`,
      icon: UsersIcon,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      label: "Pricing Tab",
      href: `/workspace/${rfpId.split('-')[1]}?tab=6`,
      icon: CurrencyDollarIcon,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      label: "Compliance Tab",
      href: `/workspace/${rfpId.split('-')[1]}?tab=5`,
      icon: CheckCircleIcon,
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Navigation Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2">
          {navItems.map((item, index) => (
            <div
              key={item.label}
              className="transform transition-all duration-300 ease-out"
              style={{
                transitionDelay: `${index * 50}ms`,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                opacity: isOpen ? 1 : 0
              }}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-3 px-4 py-3 ${item.color} text-white rounded-xl shadow-lg backdrop-blur-md transition-all duration-200 group`}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full shadow-xl backdrop-blur-md transition-all duration-300 flex items-center justify-center group`}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <PlusIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </button>
    </div>
  );
} 