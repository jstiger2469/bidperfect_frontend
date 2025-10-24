'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  FileText,
  Archive,
  Brain,
  Search,
  BarChart3,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  duration?: number;
  error?: string;
  icon: React.ReactNode;
}

interface ProcessingPipelineProps {
  files: Array<{
    id: string;
    name: string;
    type: 'single' | 'zip';
    size: number;
  }>;
  onComplete: (opportunityId: string) => void;
  onError: (error: string) => void;
  uploadStatus?: {
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    error?: string;
  };
  isUploading?: boolean;
  opportunityId?: string | null;
  rfpId?: string | null;
  syncSections?: any;
  refreshQuestions?: any;
  initKanban?: any;
  syncKanban?: any;
  runAgents?: any;
  className?: string;
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  files,
  onComplete,
  onError,
  uploadStatus,
  isUploading = false,
  opportunityId,
  rfpId,
  syncSections,
  refreshQuestions,
  initKanban,
  syncKanban,
  runAgents,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const steps: ProcessingStep[] = [
    {
      id: 'upload',
      name: 'Uploading Files',
      description: 'Transferring files to server',
      status: 'pending',
      progress: 0,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'extract',
      name: 'Extracting Archives',
      description: 'Processing zip files and organizing documents',
      status: 'pending',
      progress: 0,
      icon: <Archive className="w-5 h-5" />
    },
    {
      id: 'parse',
      name: 'Parsing Documents',
      description: 'Analyzing RFP content and extracting sections',
      status: 'pending',
      progress: 0,
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'analyze',
      name: 'Content Analysis',
      description: 'Generating insights and compliance requirements',
      status: 'pending',
      progress: 0,
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'pricing',
      name: 'Pricing Analysis',
      description: 'Analyzing CLINs and pricing constraints',
      status: 'pending',
      progress: 0,
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'qa',
      name: 'Generating Q&A',
      description: 'Creating comprehensive questions and answers',
      status: 'pending',
      progress: 0,
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 'assumptions',
      name: 'Generating Assumptions',
      description: 'Extracting assumptions from SOW and instructions',
      status: 'pending',
      progress: 0,
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'binder',
      name: 'Building Binder',
      description: 'Synthesizing compliance artifacts and credentials',
      status: 'pending',
      progress: 0,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'agents',
      name: 'Multi-Agent Analysis',
      description: 'Running comprehensive compliance and scoring analysis',
      status: 'pending',
      progress: 0,
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const [processingSteps, setProcessingSteps] = useState(steps);

  // Use real upload status or simulate processing
  useEffect(() => {
    if (uploadStatus) {
      // Use real upload status
      setOverallProgress(uploadStatus.progress);
      
      if (uploadStatus.status === 'completed') {
        setIsProcessing(false);
        onComplete('uploaded-opportunity-id');
      } else if (uploadStatus.status === 'failed') {
        setIsProcessing(false);
        onError(uploadStatus.error || 'Upload failed');
      } else if (uploadStatus.status === 'processing') {
        setIsProcessing(true);
        if (!startTime) setStartTime(Date.now());
      }
    } else if (isProcessing) {
      if (!startTime) setStartTime(Date.now());
      // Fallback to simulation
      const processStep = async (stepIndex: number) => {
        if (stepIndex >= processingSteps.length) {
          setIsProcessing(false);
          onComplete('generated-opportunity-id');
          return;
        }

        const step = processingSteps[stepIndex];
        setCurrentStep(stepIndex);

        // Update step to processing
        setProcessingSteps(prev => prev.map((s, i) => 
          i === stepIndex 
            ? { ...s, status: 'processing', progress: 0 }
            : s
        ));

        // Simulate step processing with progress updates
        const stepDuration = getStepDuration(step.id, files);
        const progressInterval = setInterval(() => {
          setProcessingSteps(prev => prev.map((s, i) => {
            if (i === stepIndex) {
              const newProgress = Math.min(s.progress + Math.random() * 15, 100);
              return { ...s, progress: newProgress };
            }
            return s;
          }));
        }, 200);

        // Complete step after duration
        setTimeout(() => {
          clearInterval(progressInterval);
          setProcessingSteps(prev => prev.map((s, i) => 
            i === stepIndex 
              ? { ...s, status: 'success', progress: 100 }
              : s
          ));
          
          // Move to next step
          setTimeout(() => processStep(stepIndex + 1), 500);
        }, stepDuration);
      };

      processStep(0);
    }
  }, [isProcessing, files, processingSteps.length, onComplete, uploadStatus, onError]);

  // Calculate estimated time remaining
  useEffect(() => {
    if (isProcessing && startTime && overallProgress > 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = overallProgress / elapsed;
      const remaining = (100 - overallProgress) / rate;
      setEstimatedTime(Math.max(0, remaining * 1000));
    }
  }, [isProcessing, startTime, overallProgress]);

  const getStepDuration = (stepId: string, files: any[]): number => {
    const baseDuration = 2000; // 2 seconds base
    const fileCount = files.length;
    const hasZip = files.some(f => f.type === 'zip');
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    let multiplier = 1;
    
    switch (stepId) {
      case 'upload':
        multiplier = Math.max(1, totalSize / (10 * 1024 * 1024)); // 10MB base
        break;
      case 'extract':
        multiplier = hasZip ? 2 : 0.5;
        break;
      case 'parse':
        multiplier = Math.max(1, fileCount * 0.5);
        break;
      case 'analyze':
        multiplier = Math.max(1, fileCount * 0.8);
        break;
      case 'pricing':
        multiplier = 1.5;
        break;
      case 'qa':
        multiplier = Math.max(2, fileCount * 1.2);
        break;
    }
    
    return Math.min(baseDuration * multiplier, 15000); // Max 15 seconds per step
  };

  const startProcessing = async () => {
    if (!uploadStatus && opportunityId) {
      setIsProcessing(true);
      setOverallProgress(0);
      setCurrentStep(0);
      setStartTime(Date.now());
      
      try {
        // Step 1: Sync sections (parsing)
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 0 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        await syncSections?.mutateAsync(opportunityId);
        setOverallProgress(25);
        
        // Step 2: Initialize Kanban board
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 0 ? { ...s, status: 'success', progress: 100 } : 
          i === 1 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        await initKanban?.mutateAsync(opportunityId);
        setOverallProgress(50);
        
        // Step 3: Generate Q&A
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 1 ? { ...s, status: 'success', progress: 100 } : 
          i === 2 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        await refreshQuestions?.mutateAsync(opportunityId);
        setOverallProgress(75);
        
        // Step 4: Sync Kanban board
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 2 ? { ...s, status: 'success', progress: 100 } : 
          i === 3 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        await syncKanban?.mutateAsync(opportunityId);
        setOverallProgress(85);
        
        // Step 5: Generate Assumptions (auto-triggered by GET)
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 3 ? { ...s, status: 'success', progress: 100 } : 
          i === 4 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        // Trigger assumptions generation by calling the GET endpoint
        // This will auto-generate if none exist
        if (opportunityId) {
          // The GET call will trigger generation
          await fetch(`http://localhost:3001/opportunities/${opportunityId}/assumptions`);
        }
        setOverallProgress(90);
        
        // Step 6: Generate Compliance and Binder
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 4 ? { ...s, status: 'success', progress: 100 } : 
          i === 5 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        // Trigger compliance analysis and binder generation
        if (rfpId) {
          // First trigger compliance refresh to analyze requirements
          await fetch(`http://localhost:3001/rfp/${rfpId}/compliance/refresh`);
          // Then get the binder (will auto-synthesize from parsed sections)
          await fetch(`http://localhost:3001/rfp/${rfpId}/binder`);
        }
        setOverallProgress(95);
        
        // Step 7: Run Multi-Agent Analysis
        setProcessingSteps(prev => prev.map((s, i) => 
          i === 5 ? { ...s, status: 'success', progress: 100 } : 
          i === 6 ? { ...s, status: 'processing', progress: 0 } : s
        ));
        
        await runAgents?.mutateAsync({ 
          rfpId: rfpId!, 
          agents: ['assumptions', 'compliance', 'score'] 
        });
        setOverallProgress(100);
        
        // Complete all steps
        setProcessingSteps(prev => prev.map(s => ({ ...s, status: 'success', progress: 100 })));
        setIsProcessing(false);
        onComplete(opportunityId);
        
      } catch (error) {
        console.error('Processing failed:', error);
        onError(error instanceof Error ? error.message : 'Processing failed');
        setIsProcessing(false);
      }
    }
  };

  const retryStep = (stepIndex: number) => {
    setProcessingSteps(prev => prev.map((s, i) => 
      i === stepIndex 
        ? { ...s, status: 'pending', progress: 0, error: undefined }
        : s
    ));
  };

  const getStepStatusIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <RefreshCw className={`w-6 h-6 ${isProcessing ? 'animate-spin' : ''}`} />
            Processing RFP Documents
          </CardTitle>
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} • {files.reduce((sum, f) => sum + f.size, 0) > 1024 * 1024 ? `${Math.round(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024))}MB` : `${Math.round(files.reduce((sum, f) => sum + f.size, 0) / 1024)}KB`}
          </div>
        </CardHeader>
        <CardContent>
          {!isProcessing && !isUploading ? (
            <div className="text-center py-8">
              <Button onClick={startProcessing} size="lg" className="gap-2">
                <RefreshCw className="w-5 h-5" />
                Start Processing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* Estimated Time and Status */}
              <div className="text-sm text-gray-500 text-center space-y-1">
                {estimatedTime > 0 && (
                  <div>
                    Estimated time remaining: {Math.ceil(estimatedTime / 1000)}s
                  </div>
                )}
                {uploadStatus?.message && (
                  <div className="text-blue-600">
                    {uploadStatus.message}
                  </div>
                )}
                {isUploading && (
                  <div className="text-blue-600">
                    Uploading files to server...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <div className="space-y-3">
        {processingSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`transition-all duration-200 ${getStepStatusColor(step)}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStepStatusIcon(step)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      {step.status === 'processing' && (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.status === 'processing' && (
                      <div className="space-y-2">
                        <Progress value={step.progress} className="h-1" />
                        <div className="text-xs text-gray-500">
                          {Math.round(step.progress)}% complete
                        </div>
                      </div>
                    )}
                    
                    {step.status === 'error' && step.error && (
                      <div className="text-sm text-red-600 mb-2">
                        {step.error}
                      </div>
                    )}
                  </div>
                  
                  {step.status === 'error' && (
                    <Button
                      onClick={() => retryStep(index)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Processing Complete */}
      <AnimatePresence>
        {!isProcessing && processingSteps.every(s => s.status === 'success') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              Your RFP has been analyzed and is ready for review.
            </p>
            <Button onClick={() => onComplete('generated-opportunity-id')} size="lg">
              Open RFP Workspace
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProcessingPipeline;
