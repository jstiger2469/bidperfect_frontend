'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInstructions: (instructions: string) => void;
  isLoading?: boolean;
}

export default function AIInstructionsModal({ 
  isOpen, 
  onClose, 
  onSendInstructions, 
  isLoading = false 
}: AIInstructionsModalProps) {
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instructions.trim()) {
      onSendInstructions(instructions.trim());
      setInstructions('');
    }
  };

  const exampleInstructions = [
    "Make the first paragraph more concise.",
    "Add more technical details about our approach.",
    "Improve the executive summary to highlight our strengths.",
    "Rewrite this section to be more compelling.",
    "Add bullet points to make this easier to read."
  ];

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Instructions</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Enter your instructions here... (e.g., 'Make the first paragraph more concise.')
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Describe what you'd like the AI to do..."
                    className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!instructions.trim() || isLoading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Instructions
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Example Instructions */}
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-3">Example instructions:</p>
                  <div className="space-y-2">
                    {exampleInstructions.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setInstructions(example)}
                        className="block w-full text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
