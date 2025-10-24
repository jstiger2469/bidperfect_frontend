'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Target,
  Zap,
  Download,
  Eye,
  Edit3,
  BarChart3,
  Settings,
  MessageSquare,
  Share2,
  Menu,
  Search,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRFPData, useDraft, useSaveDraft, useGenerateDraft, useRewriteDraft } from '@/lib/hooks';
import AIInstructionsModal from '@/components/AIInstructionsModal';
import ProposalSectionsModal from '@/components/ProposalSectionsModal';
import ContentGenerationCard from '@/components/ContentGenerationCard';
import RichTextEditor from '@/components/RichTextEditor';

interface ProposalSection {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'empty' | 'draft' | 'review' | 'complete';
  type: 'content' | 'technical' | 'management' | 'pricing';
  lastModified: string;
  wordCount: number;
}

export default function ProposalWriterPage({ params }: { params: Promise<{ rfpId: string }> }) {
  const router = useRouter();
  const [rfpId, setRfpId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<ProposalSection | null>(null);
  const [isAIInstructionsOpen, setIsAIInstructionsOpen] = useState(false);
  const [isProposalSectionsOpen, setIsProposalSectionsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');

  // Extract RFP ID from params
  useEffect(() => {
    params.then(({ rfpId: extractedRfpId }) => {
      setRfpId(extractedRfpId);
    });
  }, [params]);

  const { data: rfpData, loading: rfpLoading } = useRFPData(rfpId);
  const draftQuery = useDraft(rfpId);
  const saveDraft = useSaveDraft();
  const generateDraft = useGenerateDraft();
  const rewriteDraft = useRewriteDraft();

  // Default proposal sections structure
  const defaultSections: ProposalSection[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'Executive Summary',
      content: 'GUNN CONSTRUCTION LLC is honored to present this proposal for Contra Professional...',
      status: 'draft',
      type: 'content',
      lastModified: '2 hours ago',
      wordCount: 245
    },
    {
      id: 'technical-approach',
      title: 'Technical Approach and Project Understanding',
      description: 'Technical Approach and Project Understanding',
      content: 'The project involves the complete replacement of roofing systems at the RAC facility...',
      status: 'review',
      type: 'technical',
      lastModified: '1 hour ago',
      wordCount: 156
    },
    {
      id: 'project-management',
      title: 'Project Management Plan and Schedule',
      description: 'Project Management Plan and Schedule',
      content: 'Present your management plan for executing the project within the 60-day performance period...',
      status: 'empty',
      type: 'management',
      lastModified: 'Never',
      wordCount: 0
    },
    {
      id: 'key-personnel',
      title: 'Key Personnel and Qualifications',
      description: 'Key Personnel and Qualifications',
      content: 'Identify key personnel assigned to the project, including their roles...',
      status: 'empty',
      type: 'content',
      lastModified: 'Never',
      wordCount: 0
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Pricing and Cost Documents',
      content: '',
      status: 'empty',
      type: 'pricing',
      lastModified: 'Never',
      wordCount: 0
    }
  ];

  const [sections, setSections] = useState<ProposalSection[]>(defaultSections);

  // Load latest draft into sections
  useEffect(() => {
    if (draftQuery.data?.content) {
      try {
        const parsed = JSON.parse(draftQuery.data.content);
        if (parsed && Array.isArray(parsed.sections)) {
          // Merge by id to preserve new defaults when needed
          const merged: ProposalSection[] = defaultSections.map(def => {
            const found = parsed.sections.find((s: any) => s.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          setSections(merged);
        }
      } catch {}
    }
  }, [draftQuery.data?.content]);

  const handleAIInstructions = async (instructions: string) => {
    if (!activeSection) return;
    try {
      const res = await rewriteDraft.mutateAsync({
        rfpId: rfpId,
        text: activeSection.content || '',
        persona: instructions,
        tone: 'professional'
      });
      const updated = sections.map(s => s.id === activeSection.id
        ? { ...s, content: res.text, status: 'draft', lastModified: 'just now', wordCount: res.text.length }
        : s);
      setSections(updated);
      setActiveSection({ ...activeSection, content: res.text, wordCount: res.text.length, lastModified: 'just now' });
      setIsAIInstructionsOpen(false);
    } catch (e) {
      console.error('Rewrite failed:', e);
    }
  };

  const handleSelectSection = (section: ProposalSection) => {
    setActiveSection(section);
    setIsProposalSectionsOpen(false);
  };

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    // Here you would integrate with your chat/AI service
  };

  const handleReviewAndGenerate = async () => {
    // Generate for the active section or default to exec summary
    const target = activeSection || sections.find(s => s.id === 'executive-summary');
    if (!target) return;
    try {
      const prompt = `${target.title} for ${rfpData?.title || 'this RFP'}. Emphasize compliance, feasibility, and value.`;
      const res = await generateDraft.mutateAsync({ rfpId, bullet: prompt, persona: 'professional', maxWords: 300 });
      const newText = (res.paragraphs || []).join('\n\n');
      const updated = sections.map(s => s.id === target.id
        ? { ...s, content: newText, status: 'draft', lastModified: 'just now', wordCount: newText.length }
        : s);
      setSections(updated);
      if (activeSection && activeSection.id === target.id) {
        setActiveSection({ ...activeSection, content: newText, lastModified: 'just now', wordCount: newText.length });
      }
    } catch (e) {
      console.error('Generate failed:', e);
    }
  };

  const handleWriteManually = () => {
    // Open editor for manual writing
    console.log('Opening manual editor');
  };

  const handleSaveContent = async () => {
    try {
      await saveDraft.mutateAsync({ rfpId, content: JSON.stringify({ sections }), meta: { version: 'current' } });
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const handleContentChange = (content: string) => {
    if (!activeSection) return;
    const updated = sections.map(s => s.id === activeSection.id
      ? { ...s, content, wordCount: content.length, lastModified: 'editing…' }
      : s);
    setSections(updated);
    setActiveSection({ ...activeSection, content, wordCount: content.length, lastModified: 'editing…' });
  };

  if (rfpLoading || !rfpData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal writer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {activeSection ? activeSection.title : 'Proposal Writer'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {rfpData.title || 'RFP Proposal'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsAIInstructionsOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                AI Instructions
              </Button>
              <Button
                onClick={() => setIsProposalSectionsOpen(true)}
                variant="outline"
              >
                <Menu className="w-4 h-4 mr-2" />
                Sections
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeSection ? (
          /* Content Generation Cards */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Generate Key Proposal Components Instantly
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Generate high-quality proposal components—management plans, staffing strategies, 
                technical approaches, and pricing models—instantly. CLEATUS integrates your 
                business info with solicitation needs, ensuring every element is tailored and compliant.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sections.map((section) => (
                <ContentGenerationCard
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  guidance={getSectionGuidance(section.type)}
                  status={section.status}
                  onReviewAndGenerate={() => { setActiveSection(section); handleReviewAndGenerate(); }}
                  onWriteManually={() => handleSelectSection(section)}
                  onEdit={() => handleSelectSection(section)}
                  isLoading={generateDraft.isPending || rewriteDraft.isPending}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Rich Text Editor */
          <div className="max-w-4xl mx-auto">
            <RichTextEditor
              content={activeSection.content}
              onChange={handleContentChange}
              onSave={handleSaveContent}
              onAIInstructions={() => setIsAIInstructionsOpen(true)}
              placeholder={`Start writing your ${activeSection.title.toLowerCase()}...`}
              isLoading={generateDraft.isPending || rewriteDraft.isPending}
              wordCount={activeSection.wordCount}
              lastSaved={lastSaved}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AIInstructionsModal
        isOpen={isAIInstructionsOpen}
        onClose={() => setIsAIInstructionsOpen(false)}
        onSendInstructions={handleAIInstructions}
        isLoading={generateDraft.isPending || rewriteDraft.isPending}
      />

      <ProposalSectionsModal
        isOpen={isProposalSectionsOpen}
        onClose={() => setIsProposalSectionsOpen(false)}
        sections={sections}
        onSelectSection={handleSelectSection}
        onSendMessage={handleSendMessage}
        isLoading={generateDraft.isPending || rewriteDraft.isPending}
      />
    </div>
  );
}

function getSectionGuidance(type: ProposalSection['type']): string {
  switch (type) {
    case 'technical':
      return 'Present a clear and detailed technical approach for the project, including your methodology, tools, and processes. Ensure your approach aligns with the requirements and demonstrates your technical expertise.';
    case 'management':
      return 'Present a clear and detailed project management plan, including scheduling, coordination, and execution strategies. Include your approach to quality control, risk management, and stakeholder communication.';
    case 'pricing':
      return 'Present a clear and detailed pricing structure for the project, including a breakdown of costs for labor, materials, equipment, and any other relevant expenses. Ensure your pricing aligns with the requirements and explain your approach to cost control.';
    default:
      return 'Present clear and compelling content that addresses the requirements and demonstrates your capabilities. Ensure the content is well-structured, professional, and tailored to the specific needs of this opportunity.';
  }
}
