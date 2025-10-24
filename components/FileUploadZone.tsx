'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Archive, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface FileUploadZoneProps {
  onFilesSelected: (files: FileItem[]) => void;
  onUpload: (files: FileItem[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  onUpload,
  maxFiles = 10,
  maxSize = 100, // 100MB default
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z'],
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <Archive className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getFileType = (file: File): 'single' | 'zip' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['zip', 'rar', '7z'].includes(extension || '') ? 'zip' : 'single';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} not supported`;
    }
    
    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileItem[] = [];
    
    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      const fileItem: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: getFileType(file),
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
        size: file.size,
        lastModified: new Date(file.lastModified)
      };
      newFiles.push(fileItem);
    });

    setFiles(prev => [...prev, ...newFiles]);
    onFilesSelected([...files, ...newFiles]);
  }, [files, maxSize, acceptedTypes, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const fileList = e.dataTransfer.files;
    if (fileList.length > 0) {
      handleFiles(fileList);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      handleFiles(fileList);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Update all files to uploading status
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })));
    
    try {
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.status === 'uploading' && f.progress < 90) {
            const newProgress = Math.min(f.progress + Math.random() * 20, 90);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      await onUpload(files);
      
      // Complete all files
      setFiles(prev => prev.map(f => ({ ...f, status: 'success', progress: 100 })));
      clearInterval(progressInterval);
    } catch (error) {
      // Mark files as error
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: 'Upload failed' })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'pending', error: undefined, progress: 0 }
        : f
    ));
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <Card 
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <motion.div
              animate={{ scale: isDragOver ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
            >
              <Upload className="w-8 h-8 text-gray-600" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop RFP files or zip folders here
            </h3>
            <p className="text-gray-600 mb-4">
              Support for PDF, DOC, DOCX, TXT, ZIP, RAR, 7Z files
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Browse Files
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                Browse Folders
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3">
              Max {maxFiles} files, {maxSize}MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                Selected Files ({files.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || files.some(f => f.status === 'error')}
                  className="gap-2"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? `Uploading... ${Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)}%` : 'Upload All'}
                </Button>
                <Button
                  onClick={() => setFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                >
                  {getFileIcon(file.file)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <Badge variant={file.type === 'zip' ? 'default' : 'secondary'}>
                        {file.type === 'zip' ? 'Archive' : 'Document'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.lastModified.toLocaleDateString()}</span>
                      {file.status === 'error' && (
                        <span className="text-red-600">{file.error}</span>
                      )}
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2 space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <div className="text-xs text-gray-500 text-center">
                          {Math.round(file.progress)}% uploaded
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <Button
                          onClick={() => handleRetry(file.id)}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    {file.status === 'processing' && (
                      <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                    )}
                    
                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadZone;
