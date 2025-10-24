"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import JourneySectionContent from '../../components/JourneySectionContent';
import GatedProgress from '../../components/GatedProgress';
import ProgressRing, { OverallProgressRing } from '../../components/ProgressRing';
import { cn, glassmorphism, gradients, floatingAnimation } from '../../lib/utils';
import { getSectionProgress } from '../../lib/progressTracking';

const DEMO_SECTIONS = [
  { id: 'overview', name: 'Overview' },
  { id: 'gap-analysis', name: 'Gap Analysis' },
  { id: 'instructions', name: 'Instructions to Offerors' },
  { id: 'scope', name: 'Scope of Work' },
  { id: 'compliance', name: 'Compliance Matrix' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'team', name: 'Team & Subcontractors' },
  { id: 'proposal', name: 'Proposal Assembly' },
  { id: 'review', name: 'Final Review' }
];

export default function ProgressDemoPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [viewMode, setViewMode] = useState<'guided' | 'gated'>('guided');

  const mockRFPData = {
    id: 'rfp-003',
    title: 'HVAC Replacement - Kent Middle School',
    agency: 'General Services Administration'
  };

  const handleNext = () => {
    const currentIndex = DEMO_SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIndex < DEMO_SECTIONS.length - 1) {
      setActiveSection(DEMO_SECTIONS[currentIndex + 1].id);
    }
  };

  // Calculate progress for each section
  const sectionProgressData = DEMO_SECTIONS.map(section => {
    const progress = getSectionProgress(section.id);
    const completed = progress.checklist.filter(item => item.completed).length;
    const total = progress.checklist.length;
    const percentage = Math.round((completed / total) * 100);
    
    return {
      id: section.id,
      title: section.name,
      description: `Complete ${section.name.toLowerCase()} requirements and checklist items`,
      requiredPercentage: 80, // Require 80% to unlock next phase
      currentPercentage: percentage,
      isLocked: false, // Will be calculated based on previous phases
      estimatedTime: ['60 min', '45 min', '30 min', '40 min', '90 min', '120 min', '60 min', '180 min', '30 min'][DEMO_SECTIONS.findIndex(s => s.id === section.id)] || '45 min',
      completedTasks: completed,
      totalTasks: total
    };
  });

  // Calculate overall progress
  const overallCompleted = sectionProgressData.reduce((sum, section) => sum + section.completedTasks!, 0);
  const overallTotal = sectionProgressData.reduce((sum, section) => sum + section.totalTasks!, 0);
  const overallProgress = Math.round((overallCompleted / overallTotal) * 100);

  return (
    <div className={cn("min-h-screen", gradients.primary)}>
      {/* Enhanced Header */}
      <motion.div 
        className={cn(glassmorphism.primary, "border-b border-white/20 px-6 sm:px-8 py-4 shadow-xl z-10")}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => router.push('/')}
              className={cn(glassmorphism.secondary, "flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl transition-all duration-200")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
            <div>
              <motion.h1 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Interactive Progress Demo
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Experience the enhanced guided workflow system
              </motion.p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <ProgressRing 
              percentage={overallProgress} 
              size="sm" 
              label="Overall"
            />
            <motion.div 
              className={cn(glassmorphism.secondary, "flex rounded-xl p-1")}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setViewMode('guided')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  viewMode === 'guided' 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Guided View
              </button>
              <button
                onClick={() => setViewMode('gated')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  viewMode === 'gated' 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                Gated Progress
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {viewMode === 'gated' ? (
          /* Gated Progress View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GatedProgress
              steps={sectionProgressData}
              currentStepId={activeSection}
              onStepClick={setActiveSection}
              overallProgress={overallProgress}
            />
          </motion.div>
        ) : (
          /* Guided View */
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Section Navigation */}
                         <motion.div 
               className={cn(glassmorphism.primary, "rounded-3xl p-6")}
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">RFP Sections</h2>
                <OverallProgressRing
                  percentage={overallProgress}
                  total={overallTotal}
                  completed={overallCompleted}
                />
              </div>
              
              <div className="space-y-3">
                {DEMO_SECTIONS.map((section, index) => {
                  const sectionData = sectionProgressData[index];
                  const isActive = activeSection === section.id;
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl transition-all duration-200 group",
                        isActive
                          ? cn(glassmorphism.blue, "text-white shadow-lg")
                          : cn(glassmorphism.secondary, "text-gray-700 hover:bg-blue-100/80")
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {sectionData.completedTasks}/{sectionData.totalTasks} tasks
                          </div>
                        </div>
                        <ProgressRing
                          percentage={sectionData.currentPercentage}
                          size="sm"
                          showPercentage={false}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Enhanced Main Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <JourneySectionContent
                activeSection={activeSection}
                rfpData={mockRFPData}
                onNext={handleNext}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Instructions */}
        <motion.div 
          className={cn(glassmorphism.blue, "mt-8 rounded-3xl p-6")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-blue-800 mb-4">🚀 Interactive Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              className={cn(glassmorphism.secondary, "p-4 rounded-2xl")}
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-3 text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <strong>Click checkboxes</strong> to mark items as complete
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <strong>Dependencies</strong> prevent completing items until prerequisites are met
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <strong>Action buttons</strong> open relevant pages and auto-complete items
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <strong>Spirit AI button</strong> auto-completes the first 3 items in each section
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className={cn(glassmorphism.secondary, "p-4 rounded-2xl")}
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-3 text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <strong>Progress tracking</strong> updates in real-time with percentage completion
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <strong>Time estimates</strong> help you plan your work
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <strong>Help text</strong> provides guidance on what to do
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <strong>Gated progress</strong> unlocks sections sequentially
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 