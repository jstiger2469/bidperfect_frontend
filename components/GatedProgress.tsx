"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Lock, 
  Play,
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { cn, glassmorphism, getPhaseStatus } from '../lib/utils';
import ProgressRing from './ProgressRing';

interface GatedStep {
  id: string;
  title: string;
  description: string;
  requiredPercentage: number;
  currentPercentage: number;
  isLocked: boolean;
  estimatedTime?: string;
  completedTasks?: number;
  totalTasks?: number;
}

interface GatedProgressProps {
  steps: GatedStep[];
  currentStepId: string;
  onStepClick: (stepId: string) => void;
  overallProgress: number;
  className?: string;
}

export default function GatedProgress({
  steps,
  currentStepId,
  onStepClick,
  overallProgress,
  className
}: GatedProgressProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  const getStepStatus = (step: GatedStep, index: number) => {
    if (step.currentPercentage >= step.requiredPercentage) return 'complete';
    if (step.isLocked || index > currentStepIndex + 1) return 'locked';
    if (index === currentStepIndex) return 'active';
    if (index < currentStepIndex) return 'available';
    return 'upcoming';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-success-500" />;
      case 'active':
        return <Play className="w-6 h-6 text-primary-500" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      case 'available':
        return <Clock className="w-6 h-6 text-warning-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'complete':
        return cn(glassmorphism.green, "border-success-300/50 shadow-success-500/20");
      case 'active':
        return cn(glassmorphism.blue, "border-primary-300/50 shadow-primary-500/20 ring-2 ring-primary-200/50");
      case 'locked':
        return cn(glassmorphism.subtle, "border-gray-200/30 opacity-60");
      case 'available':
        return cn(glassmorphism.orange, "border-warning-300/50 shadow-warning-500/20");
      default:
        return cn(glassmorphism.subtle, "border-gray-200/30 opacity-40");
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress Header */}
      <motion.div 
        className={cn(glassmorphism.primary, "p-6 rounded-3xl")}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">RFP Journey Progress</h2>
            <p className="text-gray-600">Complete each phase sequentially to unlock the next</p>
          </div>
          <ProgressRing
            percentage={overallProgress}
            size="lg"
            label="Overall"
          />
        </div>
      </motion.div>

      {/* Sequential Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable = status !== 'locked' && status !== 'upcoming';
          
          return (
            <motion.div
              key={step.id}
              className={cn(
                "relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group",
                getStepClasses(status),
                isClickable && "hover:scale-[1.02] hover:shadow-2xl"
              )}
              onClick={() => isClickable && onStepClick(step.id)}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={isClickable ? { scale: 1.02 } : {}}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              {/* Step Number & Connection Line */}
              <div className="absolute -left-6 top-8 flex flex-col items-center">
                <motion.div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg",
                    status === 'complete' && "bg-success-500",
                    status === 'active' && "bg-primary-500 ring-4 ring-primary-200/50",
                    status === 'available' && "bg-warning-500",
                    status === 'locked' && "bg-gray-400",
                    status === 'upcoming' && "bg-gray-300"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {index + 1}
                </motion.div>
                
                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className={cn(
                      "w-1 h-16 mt-2",
                      status === 'complete' ? "bg-success-300" : "bg-gray-200"
                    )}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  />
                )}
              </div>

              <div className="ml-8 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStepIcon(status)}
                    <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                    
                    {/* Status Badge */}
                    <motion.span 
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        status === 'complete' && "bg-success-100 text-success-700",
                        status === 'active' && "bg-primary-100 text-primary-700",
                        status === 'available' && "bg-warning-100 text-warning-700",
                        status === 'locked' && "bg-gray-100 text-gray-500",
                        status === 'upcoming' && "bg-gray-100 text-gray-400"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.7 }}
                    >
                      {status === 'complete' && '✓ Complete'}
                      {status === 'active' && '→ In Progress'}
                      {status === 'available' && '○ Ready'}
                      {status === 'locked' && '🔒 Locked'}
                      {status === 'upcoming' && '⏳ Upcoming'}
                    </motion.span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  
                  {/* Progress Details */}
                  <div className="flex items-center gap-6 text-sm">
                    {step.estimatedTime && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{step.estimatedTime}</span>
                      </div>
                    )}
                    
                    {step.completedTasks !== undefined && step.totalTasks !== undefined && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <CheckCircle className="w-4 h-4" />
                        <span>{step.completedTasks}/{step.totalTasks} tasks</span>
                      </div>
                    )}
                    
                    <div className="text-gray-500">
                      Required: {step.requiredPercentage}% • Current: {step.currentPercentage}%
                    </div>
                  </div>
                </div>

                {/* Step Progress Ring */}
                <div className="ml-6">
                  <ProgressRing
                    percentage={step.currentPercentage}
                    size="md"
                    animated={status === 'active'}
                  />
                </div>
              </div>

              {/* Unlock Message */}
              <AnimatePresence>
                {status === 'locked' && (
                  <motion.div
                    className="mt-4 p-3 bg-warning-50/80 border border-warning-200/50 rounded-xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center gap-2 text-warning-700">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Complete previous step to unlock ({step.requiredPercentage}% minimum required)
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Steps Preview */}
              <AnimatePresence>
                {status === 'active' && (
                  <motion.div
                    className="mt-4 p-3 bg-primary-50/80 border border-primary-200/50 rounded-xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="text-primary-700 text-sm">
                      <span className="font-medium">Up next:</span> Reach {step.requiredPercentage}% completion to unlock the next phase
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 