"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getRFPById } from "../../../../lib/data";
import Breadcrumb from "../../../../components/Breadcrumb";
import InstructionsToOfferorsView from "../../../../components/InstructionsToOfferorsView";

export default function InstructionsToOfferorsPage({ params }: { params: Promise<{ rfpId: string }> }) {
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams = React.use(params);

  // Get connected data for this RFP
  const rfpId = `rfp-${resolvedParams.rfpId.padStart(3, '0')}`;
  const rfp = getRFPById(rfpId);

  if (!rfp) {
    return <div>RFP not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-indigo-100/60">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/50 backdrop-blur-md px-6 sm:px-8 py-4 shadow-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push(`/workspace/${resolvedParams.rfpId}`)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to RFP Workspace</span>
            </button>
            <Breadcrumb
              items={[
                { label: "RFP Library", href: "/" },
                { label: rfp.title, href: `/workspace/${resolvedParams.rfpId}` },
                { label: "Instructions to Offerors", current: true }
              ]}
              showHome={false}
              className="text-gray-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/workspace/${resolvedParams.rfpId}/guided`)}
              className="px-4 py-2 bg-green-100/80 text-green-700 rounded-xl hover:bg-green-200/80 transition-all duration-200 text-sm"
            >
              Guided Journey
            </button>
            <div className="px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <span className="text-sm text-gray-600">Status: </span>
              <span className="text-sm font-medium text-gray-800">{rfp.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <InstructionsToOfferorsView rfpId={rfp.id} />
      </div>
    </div>
  );
} 