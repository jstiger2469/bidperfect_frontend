'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Archive, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUploadZone from '@/components/FileUploadZone';
import ProcessingPipeline from '@/components/ProcessingPipeline';
import { useUploadRFP, useUploadZipRFP, useUploadStatus, useCreateOpportunityFromRFP, useSyncOpportunitySections, useRefreshQuestions, useInitKanbanBoard, useSyncKanbanBoard, useRunAgents, useAssumptions, useBinder } from '@/lib/hooks';

interface FileItem {
  id: string;
  file: File;
  type: 'single' | 'zip';
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
  size: number;
  lastModified: Date;
}

type IngestionStep = 'upload' | 'processing' | 'complete';

export default function RFPIngestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<IngestionStep>('upload');
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [uploadedOpportunityId, setUploadedOpportunityId] = useState<string | null>(null);
  const [uploadedRfpId, setUploadedRfpId] = useState<string | null>(null);
  
  // API hooks
  const uploadRFP = useUploadRFP();
  const uploadZipRFP = useUploadZipRFP();
  const createOpportunity = useCreateOpportunityFromRFP();
  const syncSections = useSyncOpportunitySections();
  const refreshQuestions = useRefreshQuestions();
  const initKanban = useInitKanbanBoard();
  const syncKanban = useSyncKanbanBoard();
  const runAgents = useRunAgents();
  const uploadStatus = useUploadStatus(uploadedOpportunityId || '');

  const handleFilesSelected = (files: FileItem[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async (files: FileItem[]) => {
    try {
      const fileObjects = files.map(f => f.file);
      const zipFiles = files.filter(f => f.type === 'zip');
      const regularFiles = files.filter(f => f.type === 'single');

      let uploadResult;

      if (zipFiles.length > 0) {
        // Upload zip files
        uploadResult = await uploadZipRFP.mutateAsync({
          zipFile: zipFiles[0].file,
          onProgress: (progress) => {
            console.log('Upload progress:', progress);
          }
        });
      } else if (regularFiles.length > 0) {
        // Upload regular files
        uploadResult = await uploadRFP.mutateAsync({
          files: fileObjects,
          onProgress: (progress) => {
            console.log('Upload progress:', progress);
          }
        });
      } else {
        throw new Error('No valid files to upload');
      }

      // Store RFP ID and create opportunity
      setUploadedRfpId(uploadResult.rfpId);
      const opportunityResult = await createOpportunity.mutateAsync(uploadResult.rfpId);
      setUploadedOpportunityId(opportunityResult.opportunityId);
      setCurrentStep('processing');
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error - could show error modal
    }
  };

  const handleProcessingComplete = (opportunityId: string) => {
    setCurrentStep('complete');
    // Redirect to workspace after a short delay
    setTimeout(() => {
      router.push(`/workspace/${opportunityId}`);
    }, 2000);
  };

  // Monitor upload status and handle completion
  React.useEffect(() => {
    if (uploadStatus.data?.status === 'completed' && uploadedOpportunityId) {
      handleProcessingComplete(uploadedOpportunityId);
    }
  }, [uploadStatus.data?.status, uploadedOpportunityId]);

  const handleProcessingError = (error: string) => {
    console.error('Processing error:', error);
    // Handle error - could show error modal or retry option
  };

  const getStepIcon = (step: IngestionStep) => {
    switch (step) {
      case 'upload':
        return <Upload className="w-6 h-6" />;
      case 'processing':
        return <Brain className="w-6 h-6" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getStepTitle = (step: IngestionStep) => {
    switch (step) {
      case 'upload':
        return 'Upload RFP Documents';
      case 'processing':
        return 'Processing Documents';
      case 'complete':
        return 'Processing Complete';
    }
  };

  const getStepDescription = (step: IngestionStep) => {
    switch (step) {
      case 'upload':
        return 'Upload your RFP files or zip folders to get started';
      case 'processing':
        return 'AI is analyzing your documents and generating insights';
      case 'complete':
        return 'Your RFP workspace is ready for review';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">New RFP</h1>
                <p className="text-sm text-gray-600">Upload and analyze RFP documents</p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {(['upload', 'processing', 'complete'] as IngestionStep[]).map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    currentStep === step 
                      ? 'bg-blue-100 text-blue-700' 
                      : index < (['upload', 'processing', 'complete'] as IngestionStep[]).indexOf(currentStep)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getStepIcon(step)}
                    <span className="hidden sm:inline">{getStepTitle(step)}</span>
                  </div>
                  {index < 2 && (
                    <div className="w-4 h-px bg-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'upload' && (
              <div className="space-y-8">
                {/* Upload Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Upload className="w-6 h-6" />
                      {getStepTitle('upload')}
                    </CardTitle>
                    <p className="text-gray-600">{getStepDescription('upload')}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-blue-900">Individual Files</h4>
                        <p className="text-sm text-blue-700">PDF, DOC, DOCX, TXT</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Archive className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium text-green-900">Zip Folders</h4>
                        <p className="text-sm text-green-700">ZIP, RAR, 7Z archives</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-medium text-purple-900">AI Analysis</h4>
                        <p className="text-sm text-purple-700">Smart parsing & insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Zone */}
                <FileUploadZone
                  onFilesSelected={handleFilesSelected}
                  onUpload={handleUpload}
                  maxFiles={10}
                  maxSize={100}
                />

                {/* File Summary */}
                {selectedFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedFiles.length}
                          </div>
                          <div className="text-sm text-gray-600">Files Selected</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedFiles.filter(f => f.type === 'zip').length}
                          </div>
                          <div className="text-sm text-gray-600">Archives</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(selectedFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024))}MB
                          </div>
                          <div className="text-sm text-gray-600">Total Size</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 'processing' && (
              <ProcessingPipeline
                files={selectedFiles.map(f => ({
                  id: f.id,
                  name: f.file.name,
                  type: f.type,
                  size: f.size
                }))}
                onComplete={handleProcessingComplete}
                onError={handleProcessingError}
                uploadStatus={uploadStatus.data}
                isUploading={uploadRFP.isPending || uploadZipRFP.isPending || createOpportunity.isPending}
                opportunityId={uploadedOpportunityId}
                rfpId={uploadedRfpId}
                // Pass the API hooks for real LLM work
                syncSections={syncSections}
                refreshQuestions={refreshQuestions}
                initKanban={initKanban}
                syncKanban={syncKanban}
                runAgents={runAgents}
              />
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    RFP Processing Complete!
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Your RFP has been successfully analyzed. AI has generated comprehensive 
                    insights, Q&A, and compliance requirements. You'll be redirected to your 
                    workspace shortly.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      size="lg"
                    >
                      Back to Dashboard
                    </Button>
                    <Button
                      onClick={() => setCurrentStep('upload')}
                      size="lg"
                    >
                      Upload Another RFP
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
