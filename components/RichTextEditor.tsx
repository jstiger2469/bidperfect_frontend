'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Link,
  Undo,
  Redo,
  Save,
  Zap,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onAIInstructions: () => void;
  placeholder?: string;
  isLoading?: boolean;
  wordCount?: number;
  lastSaved?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  onSave,
  onAIInstructions,
  placeholder = "Start writing your proposal content...",
  isLoading = false,
  wordCount = 0,
  lastSaved
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      setHasUnsavedChanges(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
        case 's':
          e.preventDefault();
          onSave();
          break;
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    onSave();
    setHasUnsavedChanges(false);
  };

  const getWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return wordCount;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Formatting Tools */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('formatBlock', 'blockquote')}
              className="p-2 hover:bg-gray-200"
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('undo')}
              className="p-2 hover:bg-gray-200"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('redo')}
              className="p-2 hover:bg-gray-200"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{getWordCount()} words</span>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Unsaved changes
              </Badge>
            )}
            {lastSaved && (
              <span className="text-xs">Saved {lastSaved}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onAIInstructions}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Instructions
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[400px] p-6 focus:outline-none ${
            isFocused ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
          }`}
          style={{
            lineHeight: '1.6',
            fontSize: '16px'
          }}
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
        
        {!content && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Ctrl+B for bold</span>
          <span>Ctrl+I for italic</span>
          <span>Ctrl+S to save</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
