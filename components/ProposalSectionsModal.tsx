'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowLeft, 
  Search, 
  FileText, 
  Send, 
  Paperclip,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProposalSection {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'review' | 'complete' | 'needs-work';
  type: 'content' | 'technical' | 'management' | 'pricing';
  lastModified: string;
  wordCount: number;
}

interface ProposalSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ProposalSection[];
  onSelectSection: (section: ProposalSection) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ProposalSectionsModal({
  isOpen,
  onClose,
  sections,
  onSelectSection,
  onSendMessage,
  isLoading = false
}: ProposalSectionsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: ProposalSection['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'needs-work':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ProposalSection['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs-work':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">Proposal Sections</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => onSelectSection(section)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(section.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {section.title}
                          </h4>
                          <Badge className={getStatusColor(section.status)}>
                            {section.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {section.description}
                        </p>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {section.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{section.wordCount} words</span>
                          <span>{section.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-purple-600 font-medium group-hover:text-purple-700">
                        Proposal Section →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask, learn, strategize about this contract or choose from the samples above..."
                    className="w-full h-20 px-4 py-3 border border-purple-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Use @ to mention documents
                  </p>
                  <Button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  Shift + Return to add a new line • @ to mention documents
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
