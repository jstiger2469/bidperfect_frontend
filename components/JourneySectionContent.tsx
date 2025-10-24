"use client";

import React, { useState } from 'react';
import {
  LightBulbIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  CogIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SpiritRFPOrchestrator, type AIAgentResponse } from '../lib/aiAgents';
import InstructionsToOfferorsView from './InstructionsToOfferorsView';
import { 
  getSectionProgress, 
  updateChecklistItem, 
  getNextIncompleteItem,
  canCompleteItem,
  type ChecklistItem,
  type SectionProgress
} from '../lib/progressTracking';

interface JourneySectionContentProps {
  activeSection: string;
  rfpData: any;
  onNext: () => void;
}

interface SectionTemplate {
  title: string;
  description: string;
  objectives: string[];
  startHereText: string;
  tips: string[];
  checklist: Array<{ item: string; completed: boolean }>;
  nextStep?: string;
}

export default function JourneySectionContent({ activeSection, rfpData, onNext }: JourneySectionContentProps) {
  const [agentResponse, setAgentResponse] = useState<AIAgentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>(() => getSectionProgress(activeSection));
  
  const handleSpiritProcess = async () => {
    setIsProcessing(true);
    try {
      const response = await SpiritRFPOrchestrator.processRFPSection(activeSection, rfpData?.id);
      setAgentResponse(response);
      
      // Auto-complete checklist items when AI finishes successfully
      if (response.status === 'complete') {
        // Auto-complete first 3 checklist items when AI processing is done
        const itemsToComplete = sectionProgress.checklist.slice(0, 3).map(item => item.id);
        itemsToComplete.forEach(itemId => {
          const updatedProgress = updateChecklistItem(activeSection, itemId, true);
          setSectionProgress(updatedProgress);
        });
        console.log(`Spirit AI completed ${activeSection} with ${Math.round(response.confidence * 100)}% confidence`);
      }
    } catch (error) {
      console.error('AI Agent processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChecklistItemToggle = (itemId: string, completed: boolean) => {
    if (!canCompleteItem(activeSection, itemId) && completed) {
      alert('Please complete the required dependencies first');
      return;
    }
    const updatedProgress = updateChecklistItem(activeSection, itemId, completed);
    setSectionProgress(updatedProgress);
  };

  const handleActionClick = (item: ChecklistItem) => {
    if (item.actionUrl) {
      window.open(item.actionUrl, '_blank');
    }
    // Mark as completed when action is taken
    handleChecklistItemToggle(item.id, true);
  };

  // Update progress when section changes
  React.useEffect(() => {
    setSectionProgress(getSectionProgress(activeSection));
  }, [activeSection]);
  
  const getSectionTemplate = (sectionId: string): SectionTemplate => {
    const templates: Record<string, SectionTemplate> = {
      'overview': {
        title: 'RFP Overview & Assessment',
        description: 'Get familiar with this opportunity and understand what\'s required to win.',
        objectives: [
          'Understand the client\'s needs and timeline',
          'Assess if this opportunity aligns with your capabilities',
          'Identify key requirements and evaluation factors'
        ],
        startHereText: 'Start by reading the RFP document thoroughly. Focus on the Statement of Work, evaluation criteria, and submission requirements.',
        tips: [
          'Look for past performance requirements - do you have relevant experience?',
          'Check the timeline - is it realistic for your organization?',
          'Note any special requirements like security clearances or certifications'
        ],
        checklist: [
          { item: 'Read complete RFP document', completed: true },
          { item: 'Review submission timeline and deadlines', completed: true },
          { item: 'Identify key personnel requirements', completed: false },
          { item: 'Note evaluation factors and weights', completed: false },
          { item: 'Assess go/no-go decision factors', completed: false }
        ],
        nextStep: 'Gap Analysis'
      },
      'gap-analysis': {
        title: 'Gap Analysis & Risk Assessment',
        description: 'Identify what you need to acquire or develop to be competitive on this opportunity.',
        objectives: [
          'Identify capability gaps in your organization',
          'Assess resource requirements and availability',
          'Determine partnership or subcontracting needs'
        ],
        startHereText: 'Compare the RFP requirements against your current capabilities. Be honest about gaps - it\'s better to know now.',
        tips: [
          'Don\'t just look at technical capabilities - consider past performance, personnel, and capacity',
          'Think about your competitors - what advantages do they have?',
          'Consider teaming opportunities to fill critical gaps'
        ],
        checklist: [
          { item: 'Map RFP requirements to current capabilities', completed: false },
          { item: 'Identify technical skill gaps', completed: false },
          { item: 'Assess personnel availability and qualifications', completed: false },
          { item: 'Determine subcontracting needs', completed: false },
          { item: 'Evaluate competitive positioning', completed: false }
        ],
        nextStep: 'Evaluation Criteria'
      },
      'evaluation-criteria': {
        title: 'Evaluation Criteria Deep Dive',
        description: 'Understand exactly how the government will score your proposal and what they value most.',
        objectives: [
          'Understand the scoring methodology and weights',
          'Identify what the client values most highly',
          'Plan your proposal strategy around evaluation factors'
        ],
        startHereText: 'Study Section M (Evaluation Factors) carefully. This tells you exactly what the government cares about most.',
        tips: [
          'Pay attention to the relative weights - focus your effort on high-value factors',
          'Look for specific evaluation criteria and subfactors',
          'Consider how to demonstrate value in each evaluated area'
        ],
        checklist: [
          { item: 'Analyze evaluation factor weights', completed: false },
          { item: 'Understand technical evaluation criteria', completed: false },
          { item: 'Review past performance requirements', completed: false },
          { item: 'Plan win themes for each factor', completed: false },
          { item: 'Identify proposal volume structure', completed: false }
        ],
        nextStep: 'Instructions to Offerors'
      },
      'instructions': {
        title: 'Instructions to Offerors Review',
        description: 'Understand submission requirements and ensure compliance with all procedural rules.',
        objectives: [
          'Review all submission requirements and deadlines',
          'Verify compliance with formatting and procedural rules',
          'Ensure all required documents are prepared and ready'
        ],
        startHereText: 'This interactive compliance checker shows exactly what you need to submit and tracks your progress in real-time.',
        tips: [
          'Pay close attention to page limits and formatting requirements',
          'Submit early - portal issues are common near deadlines',
          'Use the Spirit Check engine to catch formatting issues before submission'
        ],
        checklist: [
          { item: 'Review all submission requirements', completed: false },
          { item: 'Verify document formatting compliance', completed: false },
          { item: 'Check Spirit compliance engine results', completed: false },
          { item: 'Test portal upload functionality', completed: false },
          { item: 'Prepare backup submission method', completed: false }
        ],
        nextStep: 'Scope of Work'
      },
      'scope': {
        title: 'Scope of Work & Technical Approach',
        description: 'Define your technical approach and demonstrate your understanding of the requirements.',
        objectives: [
          'Develop a compliant technical approach',
          'Demonstrate understanding of requirements',
          'Create detailed work breakdown structure'
        ],
        startHereText: 'Break down the Statement of Work into specific tasks and deliverables. Show you understand what needs to be done.',
        tips: [
          'Organize your approach around the government\'s task structure',
          'Show innovation while maintaining compliance',
          'Include risk mitigation strategies for challenging areas'
        ],
        checklist: [
          { item: 'Create detailed work breakdown structure', completed: false },
          { item: 'Define technical approach for each task', completed: false },
          { item: 'Identify key deliverables and milestones', completed: false },
          { item: 'Plan quality assurance approach', completed: false },
          { item: 'Address risk mitigation strategies', completed: false }
        ],
        nextStep: 'Compliance Matrix'
      },
      'compliance': {
        title: 'Compliance Matrix & Requirements',
        description: 'Ensure your proposal addresses every single requirement in the RFP.',
        objectives: [
          'Create comprehensive compliance matrix',
          'Address all FAR clauses and requirements',
          'Ensure nothing is missed or overlooked'
        ],
        startHereText: 'Go through the RFP line by line and extract every requirement. Each one needs a response in your proposal.',
        tips: [
          'Use the RFP\'s exact language when possible',
          'Number your responses to match RFP sections',
          'Have someone else review for completeness'
        ],
        checklist: [
          { item: 'Extract all requirements from PWS/SOW', completed: false },
          { item: 'Address all Section L requirements', completed: false },
          { item: 'Create compliance cross-reference matrix', completed: false },
          { item: 'Review FAR clause compliance', completed: false },
          { item: 'Validate nothing is missed', completed: false }
        ],
        nextStep: 'Pricing Strategy'
      },
      'pricing': {
        title: 'Pricing Strategy & Cost Development',
        description: 'Develop competitive pricing that wins while maintaining profitability.',
        objectives: [
          'Create detailed cost estimates',
          'Ensure pricing is competitive yet profitable',
          'Comply with all cost/price requirements'
        ],
        startHereText: 'Start with a detailed cost buildup. Know your costs before you decide on pricing strategy.',
        tips: [
          'Research similar contracts for pricing benchmarks',
          'Consider lifecycle costs, not just initial price',
          'Have your pricing reviewed by someone experienced'
        ],
        checklist: [
          { item: 'Develop detailed labor cost estimates', completed: false },
          { item: 'Calculate overhead and G&A rates', completed: false },
          { item: 'Include all required cost elements', completed: false },
          { item: 'Validate pricing is competitive', completed: false },
          { item: 'Complete cost/price forms', completed: false }
        ],
        nextStep: 'Team & Subcontractors'
      },
      'team': {
        title: 'Team Assembly & Subcontractor Management',
        description: 'Assemble your winning team and select the right subcontractor partners.',
        objectives: [
          'Assign qualified key personnel',
          'Select appropriate subcontractor partners',
          'Ensure team meets all requirements'
        ],
        startHereText: 'Match the right people to the right roles. The government is buying your team as much as your approach.',
        tips: [
          'Focus on relevant experience for key personnel',
          'Choose subcontractors that add real value',
          'Ensure backup plans for critical personnel'
        ],
        checklist: [
          { item: 'Assign all required key personnel', completed: false },
          { item: 'Validate personnel qualifications', completed: false },
          { item: 'Select subcontractor partners', completed: false },
          { item: 'Verify subcontractor capabilities', completed: false },
          { item: 'Create teaming agreements', completed: false }
        ],
        nextStep: 'Proposal Builder'
      },
      'proposal': {
        title: 'Proposal Assembly & Formatting',
        description: 'Assemble your final proposal with professional formatting and organization.',
        objectives: [
          'Organize content into required volumes',
          'Apply consistent formatting and branding',
          'Ensure professional presentation'
        ],
        startHereText: 'Follow the government\'s required format exactly. A well-organized proposal is easier to evaluate.',
        tips: [
          'Use the exact headings and numbering from Section L',
          'Include executive summaries for each volume',
          'Make sure your proposal tells a coherent story'
        ],
        checklist: [
          { item: 'Organize content per Section L format', completed: false },
          { item: 'Apply consistent formatting standards', completed: false },
          { item: 'Include all required forms and attachments', completed: false },
          { item: 'Create executive summaries', completed: false },
          { item: 'Perform final quality review', completed: false }
        ],
        nextStep: 'Final Review'
      },
      'review': {
        title: 'Final Review & Submission',
        description: 'Complete your final quality checks and submit your winning proposal.',
        objectives: [
          'Perform comprehensive quality review',
          'Ensure all requirements are met',
          'Submit on time through proper channels'
        ],
        startHereText: 'Take time for a thorough final review. Fresh eyes often catch issues you\'ve missed.',
        tips: [
          'Have someone who wasn\'t involved in writing review the proposal',
          'Check that all cross-references are accurate',
          'Submit early - don\'t wait until the last minute'
        ],
        checklist: [
          { item: 'Complete compliance review checklist', completed: false },
          { item: 'Verify all required attachments included', completed: false },
          { item: 'Validate page counts and formatting', completed: false },
          { item: 'Perform final proofreading pass', completed: false },
          { item: 'Submit through required portal/method', completed: false }
        ]
      }
    };

    return templates[sectionId] || templates['overview'];
  };

  const template = getSectionTemplate(activeSection);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{template.title}</h1>
        <p className="text-gray-600 text-lg">{template.description}</p>
      </div>

      {/* Learning Objectives */}
      <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">What You'll Accomplish</h2>
        </div>
        <ul className="space-y-2">
          {template.objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3 text-blue-700">
              <CheckCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Here Guide */}
        <div className="bg-green-50/80 backdrop-blur-md rounded-3xl p-6 border border-green-200/40 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <LightBulbIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-800">Start Here</h2>
          </div>
          <p className="text-green-700 mb-4">{template.startHereText}</p>
          
          <div className="mt-4">
            <h3 className="font-semibold text-green-800 mb-2">Pro Tips:</h3>
            <ul className="space-y-2">
              {template.tips.map((tip, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Progress Checklist */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Progress Checklist</h2>
            </div>
            <div className="text-sm text-gray-600">
              {sectionProgress.overallProgress}% Complete
            </div>
          </div>
          
          <div className="space-y-4">
            {sectionProgress.checklist.map((item) => {
              const canComplete = canCompleteItem(activeSection, item.id);
              
              return (
                <div key={item.id} className={`p-4 rounded-2xl border transition-all duration-200 ${
                  item.completed 
                    ? 'bg-green-50/80 border-green-200/40' 
                    : canComplete 
                      ? 'bg-white/80 border-gray-200/40 hover:bg-blue-50/80' 
                      : 'bg-gray-50/50 border-gray-100/40'
                }`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      disabled={!canComplete}
                      onChange={(e) => handleChecklistItemToggle(item.id, e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${
                        item.completed ? 'text-green-700 line-through' : 
                        canComplete ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {item.item}
                        {item.required && (
                          <span className="ml-2 text-xs text-red-600">*required</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </div>
                      {item.helpText && (
                        <div className="text-xs text-blue-600 mt-1 italic">
                          💡 {item.helpText}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          ⏱️ {item.estimatedTime}
                        </span>
                        {item.actionLabel && canComplete && !item.completed && (
                          <button
                            onClick={() => handleActionClick(item)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                          >
                            {item.actionLabel}
                          </button>
                        )}
                        {item.completed && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Completed
                          </span>
                        )}
                        {!canComplete && !item.completed && (
                          <span className="text-xs text-gray-500">
                            🔒 Dependencies required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Enhanced Progress Summary */}
          <div className="mt-6 p-4 bg-gray-50/80 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">Section Progress</span>
              <span className="font-bold text-gray-800">
                {sectionProgress.checklist.filter(item => item.completed).length} of {sectionProgress.checklist.length} complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  sectionProgress.isComplete ? 'bg-green-500' : 
                  sectionProgress.overallProgress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                }`}
                style={{ width: `${sectionProgress.overallProgress}%` }}
              />
            </div>
            
            {/* Status Messages */}
            {sectionProgress.isComplete ? (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircleIcon className="w-4 h-4" />
                Section Complete! Ready to proceed.
              </div>
            ) : sectionProgress.canProceed ? (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <ClockIcon className="w-4 h-4" />
                All required items complete. Optional items available.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {sectionProgress.checklist.filter(item => item.required && !item.completed).length} required items remaining
              </div>
            )}
            
            {agentResponse?.status === 'complete' && (
              <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Section processed by Spirit AI with {Math.round(agentResponse.confidence * 100)}% confidence
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Content Area */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Work Area</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSpiritProcess}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isProcessing 
                  ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <CogIcon className="w-4 h-4 animate-spin" />
                  Spirit Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Run Spirit AI
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* AI Agent Results */}
        {agentResponse && (
          <div className="mb-6">
            <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-4 border border-green-200/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">{agentResponse.agentName}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <span>Confidence: {Math.round(agentResponse.confidence * 100)}%</span>
                  <span>Time: {agentResponse.processingTime}ms</span>
                </div>
              </div>
              
              {/* Render different content based on section */}
              {activeSection === 'overview' && agentResponse.data.keyRequirements && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-800">Key Requirements Identified:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {agentResponse.data.keyRequirements.map((req: any) => (
                      <div key={req.id} className="p-3 bg-white/60 rounded-xl">
                        <div className="font-medium text-gray-800">{req.section}</div>
                        <div className="text-sm text-gray-600 mt-1">{req.requirement}</div>
                        <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                          req.criticality === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.criticality} priority
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-green-800 mt-6">Evaluation Factors:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {agentResponse.data.evaluationFactors.map((factor: any) => (
                      <div key={factor.factor} className="p-3 bg-white/60 rounded-xl text-center">
                        <div className="font-medium text-gray-800">{factor.factor}</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">{factor.weight}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'gap-analysis' && agentResponse.data.overallAssessment && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(agentResponse.data.overallAssessment.winProbability * 100)}%</div>
                      <div className="text-sm text-gray-600">Win Probability</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-lg font-bold text-green-600 capitalize">{agentResponse.data.overallAssessment.competitivePosition}</div>
                      <div className="text-sm text-gray-600">Position</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-lg font-bold text-yellow-600 capitalize">{agentResponse.data.overallAssessment.riskLevel}</div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-green-800">Critical Gaps Identified:</h3>
                  <div className="space-y-2">
                    {agentResponse.data.capabilityGaps.map((gap: any, index: number) => (
                      <div key={index} className="p-3 bg-white/60 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{gap.requirement}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            gap.gap === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {gap.gap}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Current: {gap.currentCapability}</div>
                        <div className="text-sm text-blue-700 font-medium">Recommendation: {gap.recommendation}</div>
                        <div className="text-xs text-gray-500 mt-1">Cost: {gap.cost} | Time: {gap.timeToFill}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'team' && agentResponse.data.assignments && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-800">Personnel Assignments:</h3>
                  <div className="space-y-3">
                    {agentResponse.data.assignments.map((assignment: any, index: number) => (
                      <div key={index} className="p-3 bg-white/60 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{assignment.role}</span>
                          {assignment.assignedPerson && (
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {Math.round(assignment.assignedPerson.matchScore * 100)}% match
                            </span>
                          )}
                        </div>
                        {assignment.assignedPerson ? (
                          <div>
                            <div className="font-medium text-blue-600">{assignment.assignedPerson.name}</div>
                            <div className="text-sm text-gray-600">{assignment.assignedPerson.qualifications.join(', ')}</div>
                            <div className="text-xs text-gray-500 mt-1">{assignment.assignedPerson.availability}</div>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <div className="font-medium">Gap: {assignment.gap.issue}</div>
                            <div className="text-sm">Solution: {assignment.gap.solution}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'scope' && agentResponse.data.projectPhases && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-green-800">Project Phases & Timeline:</h3>
                  
                  {/* Project Timeline Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{agentResponse.data.projectTimeline.totalDuration}</div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{agentResponse.data.projectPhases.length}</div>
                      <div className="text-sm text-gray-600">Project Phases</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600">{agentResponse.data.projectTimeline.criticalMilestones.length}</div>
                      <div className="text-sm text-gray-600">Critical Milestones</div>
                    </div>
                  </div>

                  {/* Project Phases */}
                  <div className="space-y-4">
                    {agentResponse.data.projectPhases.map((phase: any, index: number) => (
                      <div key={index} className={`p-4 rounded-xl border-l-4 ${
                        phase.criticalPath ? 'border-red-400 bg-red-50/60' : 'border-blue-400 bg-blue-50/60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-800">{phase.phase}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600">{phase.duration}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {phase.startDate} - {phase.endDate}
                            </span>
                            {phase.criticalPath && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                Critical Path
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{phase.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Key Activities:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {phase.keyActivities.slice(0, 3).map((activity: string, actIndex: number) => (
                                <li key={actIndex} className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{activity}</span>
                                </li>
                              ))}
                              {phase.keyActivities.length > 3 && (
                                <li className="text-gray-500 text-xs">+ {phase.keyActivities.length - 3} more activities...</li>
                              )}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Deliverables:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {phase.deliverables.map((deliverable: string, delIndex: number) => (
                                <li key={delIndex} className="flex items-start gap-2">
                                  <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {phase.risks && phase.risks.length > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50/80 rounded-lg">
                            <h6 className="text-xs font-semibold text-yellow-800 mb-1">Risks:</h6>
                            <div className="text-xs text-yellow-700">
                              {phase.risks.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Critical Milestones */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-green-800 mb-3">Critical Milestones:</h3>
                    <div className="space-y-2">
                      {agentResponse.data.projectTimeline.criticalMilestones.map((milestone: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <div>
                            <span className="font-medium text-gray-800">{milestone.milestone}</span>
                            <div className="text-sm text-gray-600">{milestone.importance}</div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">{milestone.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resource Allocation */}
                  <div className="mt-6 p-4 bg-blue-50/60 rounded-xl">
                    <h3 className="font-semibold text-blue-800 mb-3">Resource Allocation:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(agentResponse.data.resourceAllocation).map(([role, allocation]: [string, any]) => (
                        <div key={role} className="flex justify-between">
                          <span className="font-medium text-gray-800 capitalize">{role.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-gray-600">{allocation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'pricing' && agentResponse.data.costBreakdown && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Cost Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Labor:</span>
                          <span>${agentResponse.data.costBreakdown.labor.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Materials:</span>
                          <span>${agentResponse.data.costBreakdown.materials.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overhead:</span>
                          <span>${agentResponse.data.costBreakdown.overhead.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit:</span>
                          <span>${agentResponse.data.costBreakdown.profit.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total:</span>
                          <span>${agentResponse.data.costBreakdown.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Competitive Position</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {agentResponse.data.pricingStrategy.competitivePosition}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">vs. market average</div>
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(agentResponse.data.pricingStrategy.winProbability * 100)}% win probability
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'compliance' && agentResponse.data.complianceScore && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{agentResponse.data.complianceScore}%</div>
                      <div className="text-sm text-gray-600">Compliance Score</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{agentResponse.data.addressed}</div>
                      <div className="text-sm text-gray-600">Requirements Met</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-600">{agentResponse.data.pending}</div>
                      <div className="text-sm text-gray-600">Still Pending</div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-green-800">Recent Compliance Items:</h3>
                  <div className="space-y-2">
                    {agentResponse.data.matrix.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="p-3 bg-white/60 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{item.requirement}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{item.response.substring(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Section-specific content */}
        {activeSection === 'instructions' ? (
          <InstructionsToOfferorsView rfpId={rfpData?.id || 'rfp-003'} />
        ) : (
          /* Default prompt when no AI results */
          !agentResponse && !isProcessing && (
            <div className="text-center py-12 text-gray-500">
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Ready to let Spirit AI handle this section?</p>
              <p className="text-sm mb-4">Click "Run Spirit AI" to automatically analyze and process this RFP section.</p>
              <div className="text-xs text-gray-400">
                Spirit will read the RFP documents, match personnel, analyze gaps, and generate responses.
              </div>
            </div>
          )
        )}
      </div>

      {/* Next Step Action */}
      {template.nextStep && (
        <div className="bg-blue-50/80 backdrop-blur-md rounded-3xl p-6 border border-blue-200/40 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Ready for the next step?</h3>
              <p className="text-sm text-blue-700">Continue to: {template.nextStep}</p>
            </div>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2"
            >
              Continue to {template.nextStep}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 