'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Edit3, 
  FileText, 
  Zap, 
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContentGenerationCardProps {
  title: string;
  description: string;
  guidance: string;
  status: 'empty' | 'draft' | 'review' | 'complete';
  onReviewAndGenerate: () => void;
  onWriteManually: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export default function ContentGenerationCard({
  title,
  description,
  guidance,
  status,
  onReviewAndGenerate,
  onWriteManually,
  onEdit,
  isLoading = false
}: ContentGenerationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'draft':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'review':
        return 'Under Review';
      case 'draft':
        return 'Draft';
      default:
        return 'Not Started';
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <Badge className={getStatusColor()}>
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Section Guidance */}
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">i</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">Section Guidance</h4>
              <button
                onClick={onEdit}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Edit3 className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {guidance}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900">Choose an action:</p>
          
          <div className="flex gap-3">
            <Button
              onClick={onReviewAndGenerate}
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Review & Generate
                </>
              )}
            </Button>
            
            <Button
              onClick={onWriteManually}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Write Manually
            </Button>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {status === 'empty' ? 'No content added yet' : `${getStatusText()} content`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
