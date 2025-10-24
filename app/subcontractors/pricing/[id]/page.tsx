"use client";

import { useState } from "react";
import { 
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const LABOR_COSTS = [
  { description: "Install Rooftop Units", hours: 80, hourlyRate: 85, totalCost: 6800 },
  { description: "Lay Ductwork", hours: 120, hourlyRate: 75, totalCost: 9000 },
  { description: "Mount Thermostats", hours: 16, hourlyRate: 70, totalCost: 1120 },
  { description: "Material", hours: 0, hourlyRate: 0, totalCost: 4000, isMaterial: true }
];

const FRINGE_BENEFITS = {
  cashInLieu: {
    enabled: true,
    rate: 4.98
  },
  paidHolidays: 1280,
  vacation: 750,
  totalFringeCost: 9990
};

const PRICING_ANALYSIS = {
  totalLaborCost: 20920,
  totalFringeCost: 9990,
  subtotal: 30910,
  markupPercentage: 52,
  markupAmount: 16073,
  total: 46983,
  fairnessRange: "51-55%",
  region: "Louisiana HVAC projects"
};

const SPIRIT_INSIGHTS = [
  "This pricing is within a fair range for Louisiana HVAC projects (51-55%)",
  "Consider adjusting markup based on project complexity",
  "Fringe benefits calculated according to current wage determinations"
];

function LaborMaterialSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Labor & Material Costs</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/50">
              <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">Hours</th>
              <th className="text-center py-3 text-sm font-medium text-gray-600">Hourly Rate</th>
              <th className="text-right py-3 text-sm font-medium text-gray-600">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {LABOR_COSTS.map((item, index) => (
              <tr key={index} className="border-b border-gray-200/30">
                <td className="py-4 text-gray-800">{item.description}</td>
                <td className="py-4 text-center text-gray-800">
                  {item.isMaterial ? '—' : item.hours}
                </td>
                <td className="py-4 text-center text-gray-800">
                  {item.isMaterial ? '—' : `$${item.hourlyRate}`}
                </td>
                <td className="py-4 text-right font-semibold text-gray-800">
                  ${item.totalCost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FringeBenefitsSection() {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Fringe Benefits</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={FRINGE_BENEFITS.cashInLieu.enabled}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                readOnly
              />
            </div>
            <span className="text-gray-800">Cash in lieu of benefits</span>
          </div>
          <span className="font-semibold text-gray-800">
            ${FRINGE_BENEFITS.cashInLieu.rate} / hor
          </span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-t border-gray-200/50">
          <span className="text-gray-800">Paid Holidays</span>
          <span className="font-semibold text-gray-800">
            ${FRINGE_BENEFITS.paidHolidays.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-t border-gray-200/50">
          <span className="text-gray-800">Vacation</span>
          <span className="font-semibold text-gray-800">
            ${FRINGE_BENEFITS.vacation.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-3 border-t-2 border-gray-300/50 mt-4">
          <span className="font-semibold text-gray-800">Total Fringe Cost</span>
          <span className="font-bold text-gray-800 text-lg">
            ${FRINGE_BENEFITS.totalFringeCost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpiritInsightsPanel() {
  return (
    <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Spirit</h3>
      </div>
      
      <div className="bg-white/60 rounded-2xl p-4 mb-6">
        <p className="text-gray-800 text-sm">
          This pricing is within a fair range for Louisiana HVAC projects (51-55%)
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Markup</h4>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Low</span>
              <span>Fair</span>
              <span>High</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
              <div className="absolute top-0 left-[60%] transform -translate-x-1/2">
                <div className="w-4 h-4 bg-blue-700 rounded-full -mt-1"></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600">Markup / Margin</p>
        </div>
        
        <div className="bg-white/60 rounded-2xl p-4">
          <p className="text-sm text-gray-700">
            This pricing is within a fair range for Louisiana HVAC projects (51-55% markup).
          </p>
        </div>
      </div>
    </div>
  );
}

function PricingSummary() {
  return (
    <div className="bg-green-50/80 backdrop-blur-md rounded-3xl p-6 border border-green-200/40 shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Pricing Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-700">Total Labor & Material</span>
          <span className="font-semibold text-gray-800">
            ${PRICING_ANALYSIS.totalLaborCost.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Total Fringe Benefits</span>
          <span className="font-semibold text-gray-800">
            ${PRICING_ANALYSIS.totalFringeCost.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-gray-300/50">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-semibold text-gray-800">
            ${PRICING_ANALYSIS.subtotal.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Markup ({PRICING_ANALYSIS.markupPercentage}%)</span>
          <span className="font-semibold text-gray-800">
            ${PRICING_ANALYSIS.markupAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between pt-3 border-t-2 border-gray-400/50">
          <span className="font-bold text-gray-800 text-lg">Total Project Cost</span>
          <span className="font-bold text-gray-800 text-xl">
            ${PRICING_ANALYSIS.total.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-300/50">
        <div className="flex gap-3">
          <button className="flex-1 bg-red-100 text-red-700 border border-red-200 rounded-xl py-3 hover:bg-red-200 transition-all duration-200 font-medium">
            Reject
          </button>
          <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 transition-all duration-200 font-medium">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubcontractorPricingPage({ params }: { params: { id: string } }) {
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
          <h1 className="text-3xl font-bold text-gray-800">Subcontractor Pricing Estimator</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Labor & Fringe */}
          <div className="lg:col-span-2 space-y-8">
            <LaborMaterialSection />
            <FringeBenefitsSection />
          </div>

          {/* Right Column - Spirit & Summary */}
          <div className="space-y-8">
            <SpiritInsightsPanel />
            <PricingSummary />
          </div>
        </div>
      </div>
    </div>
  );
} 