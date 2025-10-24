"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn, getProgressColor, generateProgressPath } from '../lib/utils';

interface ProgressRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPercentage?: boolean;
  label?: string;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: { width: 60, height: 60, radius: 25, fontSize: 'text-xs' },
  md: { width: 80, height: 80, radius: 35, fontSize: 'text-sm' },
  lg: { width: 120, height: 120, radius: 50, fontSize: 'text-lg' },
  xl: { width: 160, height: 160, radius: 70, fontSize: 'text-2xl' }
};

export default function ProgressRing({
  percentage,
  size = 'md',
  showPercentage = true,
  label,
  strokeWidth = 8,
  className,
  animated = true
}: ProgressRingProps) {
  const sizeConfig = sizes[size];
  const radius = sizeConfig.radius;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const progressColor = getProgressColor(percentage);
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg 
        width={sizeConfig.width} 
        height={sizeConfig.height} 
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={sizeConfig.width / 2}
          cy={sizeConfig.height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={sizeConfig.width / 2}
          cy={sizeConfig.height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn(progressColor, "transition-colors duration-500")}
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset
          }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeInOut",
            delay: animated ? 0.2 : 0
          }}
        />
      </svg>
      
      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.div 
            className={cn("font-bold", sizeConfig.fontSize, progressColor)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animated ? 1 : 0, duration: 0.5 }}
          >
            {percentage}%
          </motion.div>
        )}
        {label && (
          <div className="text-xs text-gray-600 text-center mt-1 font-medium">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset progress rings for common use cases
export function PhaseProgressRing({ 
  phase, 
  percentage, 
  size = 'lg' 
}: { 
  phase: string; 
  percentage: number; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <ProgressRing
      percentage={percentage}
      size={size}
      label={phase}
      className="mx-auto"
    />
  );
}

export function OverallProgressRing({ 
  percentage,
  total,
  completed 
}: { 
  percentage: number;
  total: number;
  completed: number;
}) {
  return (
    <div className="text-center">
      <ProgressRing
        percentage={percentage}
        size="xl"
        className="mx-auto mb-2"
      />
      <div className="text-sm text-gray-600">
        {completed} of {total} completed
      </div>
    </div>
  );
} 