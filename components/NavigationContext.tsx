"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRFPById, type RFP } from '../lib/data';

interface NavigationContextType {
  currentRFP: RFP | null;
  setCurrentRFP: (rfp: RFP | null) => void;
  setCurrentRFPById: (rfpId: string) => void;
  isInRFPContext: boolean;
  getContextualBreadcrumbs: () => Array<{ label: string; href?: string; current?: boolean }>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentRFP, setCurrentRFP] = useState<RFP | null>(null);

  const setCurrentRFPById = (rfpId: string) => {
    const rfp = getRFPById(rfpId);
    setCurrentRFP(rfp || null);
  };

  const isInRFPContext = currentRFP !== null;

  const getContextualBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; href?: string; current?: boolean }> = [];
    
    if (currentRFP) {
      breadcrumbs.push({
        label: "RFP Library",
        href: "/"
      });
      breadcrumbs.push({
        label: currentRFP.title,
        href: `/workspace/${currentRFP.id.split('-')[1]}`,
        current: false
      });
    }
    
    return breadcrumbs;
  };

  return (
    <NavigationContext.Provider value={{
      currentRFP,
      setCurrentRFP,
      setCurrentRFPById,
      isInRFPContext,
      getContextualBreadcrumbs
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 