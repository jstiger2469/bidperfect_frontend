"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getRFPById } from "../../../../lib/data";
import Breadcrumb from "../../../../components/Breadcrumb";
import RFPJourney from "../../../../components/RFPJourney";
import JourneySectionContent from "../../../../components/JourneySectionContent";

export default function GuidedWorkspacePage({ params }: { params: Promise<{ rfpId: string }> }) {
  const [activeSection, setActiveSection] = useState('overview');
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams = React.use(params);

  // Get connected data for this RFP
  const rfpId = `rfp-${resolvedParams.rfpId.padStart(3, '0')}`;
  const rfp = getRFPById(rfpId);

  if (!rfp) {
    return <div>RFP not found</div>;
  }

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleNext = () => {
    const sectionOrder = ['overview', 'gap-analysis', 'evaluation-criteria', 'scope', 'compliance', 'pricing', 'team', 'proposal', 'review'];
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/50 backdrop-blur-md px-6 sm:px-8 py-4 shadow-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to RFP Library</span>
            </button>
            <Breadcrumb
              items={[
                { label: "RFP Library", href: "/" },
                { label: rfp.title, href: `/workspace/${resolvedParams.rfpId}` },
                { label: "Guided Journey", current: true }
              ]}
              showHome={false}
              className="text-gray-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/workspace/${resolvedParams.rfpId}`)}
              className="px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 text-sm"
            >
              Switch to Tab View
            </button>
            <div className="px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <span className="text-sm text-gray-600">Status: </span>
              <span className="text-sm font-medium text-gray-800">{rfp.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Journey Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{rfp.title}</h1>
          <p className="text-gray-600">Guided RFP Journey - Follow the steps to complete your proposal</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full">
        {/* Left Sidebar - Journey Navigation */}
        <aside className="w-full lg:w-96 border-r border-white/20 bg-white/30 backdrop-blur-md p-6 shadow-xl">
          <RFPJourney
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            rfpData={rfp}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <JourneySectionContent
            activeSection={activeSection}
            rfpData={rfp}
            onNext={handleNext}
          />
        </main>
      </div>
    </div>
  );
} 