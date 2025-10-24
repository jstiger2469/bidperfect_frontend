// Progress Tracking System
export interface ChecklistItem {
  id: string;
  item: string;
  description: string;
  completed: boolean;
  required: boolean;
  actionType: 'upload' | 'review' | 'submit' | 'verify' | 'auto' | 'manual';
  actionLabel?: string;
  actionUrl?: string;
  dependencies?: string[]; // Other items that must be completed first
  estimatedTime: string;
  helpText?: string;
}

export interface SectionProgress {
  sectionId: string;
  title: string;
  description: string;
  checklist: ChecklistItem[];
  overallProgress: number;
  isComplete: boolean;
  canProceed: boolean;
  nextSection?: string;
}

// Progress state management
const progressState: Record<string, SectionProgress> = {};

// Initialize section progress
export const initializeSectionProgress = (sectionId: string): SectionProgress => {
  const templates = getSectionTemplate(sectionId);
  
  const progress: SectionProgress = {
    sectionId,
    title: templates.title,
    description: templates.description,
    checklist: templates.checklist.map((item, index) => ({
      id: `${sectionId}-${index}`,
      item: item.item,
      description: item.description || `Complete ${item.item.toLowerCase()}`,
      completed: item.completed || false,
      required: item.required !== false,
      actionType: item.actionType || 'manual',
      actionLabel: item.actionLabel,
      actionUrl: item.actionUrl,
      dependencies: item.dependencies || [],
      estimatedTime: item.estimatedTime || '5 min',
      helpText: item.helpText
    })),
    overallProgress: 0,
    isComplete: false,
    canProceed: false,
    nextSection: templates.nextStep
  };

  progress.overallProgress = calculateProgress(progress);
  progress.isComplete = progress.overallProgress === 100;
  progress.canProceed = canProceedToNext(progress);
  
  progressState[sectionId] = progress;
  return progress;
};

// Update checklist item completion
export const updateChecklistItem = (
  sectionId: string, 
  itemId: string, 
  completed: boolean,
  metadata?: any
): SectionProgress => {
  const progress = progressState[sectionId] || initializeSectionProgress(sectionId);
  
  const item = progress.checklist.find(item => item.id === itemId);
  if (item) {
    item.completed = completed;
    
    // Auto-complete dependent items if this is a key item
    if (completed && item.actionType === 'auto') {
      progress.checklist.forEach(otherItem => {
        if (otherItem.dependencies?.includes(item.id)) {
          otherItem.completed = true;
        }
      });
    }
  }
  
  progress.overallProgress = calculateProgress(progress);
  progress.isComplete = progress.overallProgress === 100;
  progress.canProceed = canProceedToNext(progress);
  
  progressState[sectionId] = progress;
  return progress;
};

// Calculate overall progress percentage
const calculateProgress = (progress: SectionProgress): number => {
  const requiredItems = progress.checklist.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed);
  const optionalItems = progress.checklist.filter(item => !item.required);
  const completedOptional = optionalItems.filter(item => item.completed);
  
  // 80% weight for required items, 20% for optional
  const requiredScore = requiredItems.length > 0 ? (completedRequired.length / requiredItems.length) * 80 : 80;
  const optionalScore = optionalItems.length > 0 ? (completedOptional.length / optionalItems.length) * 20 : 20;
  
  return Math.round(requiredScore + optionalScore);
};

// Check if user can proceed to next section
const canProceedToNext = (progress: SectionProgress): boolean => {
  const requiredItems = progress.checklist.filter(item => item.required);
  return requiredItems.every(item => item.completed);
};

// Get current progress state
export const getSectionProgress = (sectionId: string): SectionProgress => {
  return progressState[sectionId] || initializeSectionProgress(sectionId);
};

// Section templates with detailed checklists
const getSectionTemplate = (sectionId: string) => {
  const templates: Record<string, any> = {
    'overview': {
      title: 'RFP Overview & Analysis',
      description: 'Understand the project requirements and establish your approach.',
      nextStep: 'Gap Analysis',
      checklist: [
        {
          item: 'Review RFP documents',
          description: 'Read through all RFP documents and attachments',
          required: true,
          actionType: 'review',
          actionLabel: 'Open Documents',
          actionUrl: '/documents',
          estimatedTime: '30 min',
          helpText: 'Focus on Section C (Description/Specs) and Section L (Instructions)'
        },
        {
          item: 'Identify key requirements',
          description: 'Extract and document the main project requirements',
          required: true,
          actionType: 'manual',
          estimatedTime: '15 min',
          helpText: 'Look for technical specs, timeline, deliverables, and special requirements'
        },
        {
          item: 'Note submission deadline',
          description: 'Record the proposal due date and submission method',
          required: true,
          actionType: 'verify',
          estimatedTime: '2 min',
          helpText: 'Usually found in Section L - verify both date AND time'
        },
        {
          item: 'Download all attachments',
          description: 'Save all RFP documents and attachments locally',
          required: false,
          actionType: 'manual',
          estimatedTime: '5 min'
        },
        {
          item: 'Create project folder structure',
          description: 'Set up organized folders for proposal development',
          required: false,
          actionType: 'manual',
          estimatedTime: '10 min'
        }
      ]
    },
    'gap-analysis': {
      title: 'Gap Analysis',
      description: 'Identify what you need to address to meet all requirements.',
      nextStep: 'Evaluation Criteria',
      checklist: [
        {
          item: 'Compare requirements vs capabilities',
          description: 'Assess your current capabilities against RFP requirements',
          required: true,
          actionType: 'manual',
          estimatedTime: '45 min',
          helpText: 'Be honest about gaps - better to know now than during proposal'
        },
        {
          item: 'Identify missing certifications',
          description: 'List any certifications or licenses you need to obtain',
          required: true,
          actionType: 'verify',
          estimatedTime: '15 min'
        },
        {
          item: 'Assess personnel requirements',
          description: 'Determine if you have adequate qualified staff',
          required: true,
          actionType: 'review',
          actionLabel: 'Review Team',
          actionUrl: '/staff',
          estimatedTime: '20 min'
        },
        {
          item: 'Evaluate subcontractor needs',
          description: 'Determine what work needs to be subcontracted',
          required: true,
          actionType: 'review',
          actionLabel: 'View Subcontractors',
          actionUrl: '/subcontractors',
          estimatedTime: '30 min'
        },
        {
          item: 'Create gap mitigation plan',
          description: 'Document how you will address each identified gap',
          required: false,
          actionType: 'manual',
          estimatedTime: '25 min'
        }
      ]
    },
    'instructions': {
      title: 'Instructions to Offerors Review',
      description: 'Understand submission requirements and ensure compliance.',
      nextStep: 'Scope of Work',
      checklist: [
        {
          item: 'Review all submission requirements',
          description: 'Check every requirement in Section L',
          required: true,
          actionType: 'review',
          actionLabel: 'Open Instructions View',
          estimatedTime: '20 min',
          helpText: 'Use the interactive compliance checker to track each requirement'
        },
        {
          item: 'Verify document formatting compliance',
          description: 'Ensure all documents meet formatting requirements',
          required: true,
          actionType: 'verify',
          estimatedTime: '15 min',
          helpText: 'Check font, margins, page limits, and file formats'
        },
        {
          item: 'Test portal upload functionality',
          description: 'Verify you can access and upload to submission portal',
          required: true,
          actionType: 'verify',
          estimatedTime: '10 min'
        },
        {
          item: 'Prepare required certifications',
          description: 'Gather all required compliance certifications',
          required: true,
          actionType: 'upload',
          actionLabel: 'Upload Certs',
          estimatedTime: '30 min'
        },
        {
          item: 'Set up backup submission method',
          description: 'Prepare alternative submission in case of portal issues',
          required: false,
          actionType: 'manual',
          estimatedTime: '15 min'
        }
      ]
    },
    'scope': {
      title: 'Scope of Work Development',
      description: 'Define your technical approach and deliverables.',
      nextStep: 'Compliance Matrix',
      checklist: [
        {
          item: 'Break down work into phases',
          description: 'Create detailed project phases and milestones',
          required: true,
          actionType: 'manual',
          estimatedTime: '60 min'
        },
        {
          item: 'Define deliverables for each phase',
          description: 'Specify what will be delivered at each milestone',
          required: true,
          actionType: 'manual',
          estimatedTime: '45 min'
        },
        {
          item: 'Create project timeline',
          description: 'Develop realistic schedule with dependencies',
          required: true,
          actionType: 'manual',
          estimatedTime: '30 min'
        },
        {
          item: 'Identify risks and mitigation',
          description: 'Document potential risks and how you will handle them',
          required: true,
          actionType: 'manual',
          estimatedTime: '25 min'
        },
        {
          item: 'Review technical specifications',
          description: 'Ensure your approach meets all technical requirements',
          required: true,
          actionType: 'verify',
          estimatedTime: '40 min'
        }
      ]
    },
    'compliance': {
      title: 'Compliance Matrix',
      description: 'Map your response to each RFP requirement.',
      nextStep: 'Pricing',
      checklist: [
        {
          item: 'Extract all RFP requirements',
          description: 'Create comprehensive list of all requirements',
          required: true,
          actionType: 'manual',
          estimatedTime: '90 min'
        },
        {
          item: 'Map requirements to proposal sections',
          description: 'Link each requirement to where you address it',
          required: true,
          actionType: 'manual',
          estimatedTime: '60 min'
        },
        {
          item: 'Verify compliance for each requirement',
          description: 'Confirm you meet or exceed each requirement',
          required: true,
          actionType: 'verify',
          estimatedTime: '45 min'
        },
        {
          item: 'Document any exceptions or clarifications',
          description: 'Note any areas where you take exception',
          required: false,
          actionType: 'manual',
          estimatedTime: '20 min'
        },
        {
          item: 'Create compliance summary',
          description: 'Prepare executive summary of compliance status',
          required: false,
          actionType: 'manual',
          estimatedTime: '15 min'
        }
      ]
    },
    'pricing': {
      title: 'Pricing & Cost Proposal',
      description: 'Develop competitive and accurate pricing.',
      nextStep: 'Team & Subcontractors',
      checklist: [
        {
          item: 'Calculate direct labor costs',
          description: 'Estimate labor hours and rates for each task',
          required: true,
          actionType: 'manual',
          estimatedTime: '120 min'
        },
        {
          item: 'Determine material and equipment costs',
          description: 'Get quotes for all required materials and equipment',
          required: true,
          actionType: 'manual',
          estimatedTime: '90 min'
        },
        {
          item: 'Get subcontractor quotes',
          description: 'Obtain firm pricing from all subcontractors',
          required: true,
          actionType: 'review',
          actionLabel: 'Manage Subcontractors',
          actionUrl: '/subcontractors',
          estimatedTime: '60 min'
        },
        {
          item: 'Calculate overhead and profit',
          description: 'Apply appropriate overhead rates and profit margins',
          required: true,
          actionType: 'manual',
          estimatedTime: '30 min'
        },
        {
          item: 'Review pricing for competitiveness',
          description: 'Validate pricing against market rates and competition',
          required: true,
          actionType: 'verify',
          estimatedTime: '45 min'
        },
        {
          item: 'Prepare cost volume',
          description: 'Create detailed cost breakdown documentation',
          required: false,
          actionType: 'manual',
          estimatedTime: '90 min'
        }
      ]
    },
    'team': {
      title: 'Team & Subcontractors',
      description: 'Assemble your project team and finalize partnerships.',
      nextStep: 'Proposal Builder',
      checklist: [
        {
          item: 'Assign key personnel',
          description: 'Identify and assign all key positions',
          required: true,
          actionType: 'review',
          actionLabel: 'Manage Team',
          actionUrl: '/staff',
          estimatedTime: '45 min'
        },
        {
          item: 'Finalize subcontractor agreements',
          description: 'Execute agreements with selected subcontractors',
          required: true,
          actionType: 'review',
          actionLabel: 'Finalize Subs',
          actionUrl: '/subcontractors',
          estimatedTime: '60 min'
        },
        {
          item: 'Gather resumes and qualifications',
          description: 'Collect current resumes for all key personnel',
          required: true,
          actionType: 'upload',
          actionLabel: 'Upload Resumes',
          estimatedTime: '30 min'
        },
        {
          item: 'Verify security clearances',
          description: 'Confirm all personnel have required clearances',
          required: true,
          actionType: 'verify',
          estimatedTime: '20 min'
        },
        {
          item: 'Create organizational chart',
          description: 'Develop clear project organization structure',
          required: false,
          actionType: 'manual',
          estimatedTime: '25 min'
        }
      ]
    },
    'proposal': {
      title: 'Proposal Assembly',
      description: 'Compile all sections into final proposal.',
      nextStep: 'Review & Submit',
      checklist: [
        {
          item: 'Compile all proposal sections',
          description: 'Assemble technical, management, and cost volumes',
          required: true,
          actionType: 'manual',
          estimatedTime: '120 min'
        },
        {
          item: 'Create executive summary',
          description: 'Write compelling summary of your solution',
          required: true,
          actionType: 'manual',
          estimatedTime: '90 min'
        },
        {
          item: 'Format and paginate proposal',
          description: 'Apply consistent formatting and page numbering',
          required: true,
          actionType: 'manual',
          estimatedTime: '60 min'
        },
        {
          item: 'Generate table of contents',
          description: 'Create comprehensive TOC with page numbers',
          required: true,
          actionType: 'manual',
          estimatedTime: '15 min'
        },
        {
          item: 'Conduct internal review',
          description: 'Have team members review for accuracy and completeness',
          required: true,
          actionType: 'verify',
          estimatedTime: '180 min'
        }
      ]
    },
    'review': {
      title: 'Final Review & Submission',
      description: 'Final quality check and proposal submission.',
      nextStep: null,
      checklist: [
        {
          item: 'Final compliance check',
          description: 'Verify proposal meets all RFP requirements',
          required: true,
          actionType: 'verify',
          estimatedTime: '60 min'
        },
        {
          item: 'Proofread entire proposal',
          description: 'Check for spelling, grammar, and formatting errors',
          required: true,
          actionType: 'verify',
          estimatedTime: '90 min'
        },
        {
          item: 'Verify all attachments included',
          description: 'Confirm all required documents are attached',
          required: true,
          actionType: 'verify',
          estimatedTime: '30 min'
        },
        {
          item: 'Test final PDF generation',
          description: 'Generate final PDFs and verify they open correctly',
          required: true,
          actionType: 'verify',
          estimatedTime: '20 min'
        },
        {
          item: 'Submit proposal',
          description: 'Upload to portal or deliver as required',
          required: true,
          actionType: 'submit',
          actionLabel: 'Submit Now',
          estimatedTime: '15 min'
        },
        {
          item: 'Confirm receipt',
          description: 'Verify government has received your proposal',
          required: false,
          actionType: 'verify',
          estimatedTime: '10 min'
        }
      ]
    }
  };

  return templates[sectionId] || templates['overview'];
};

// Batch update multiple items (useful for AI completion)
export const batchUpdateChecklist = (
  sectionId: string,
  updates: { itemId: string; completed: boolean }[]
): SectionProgress => {
  const progress = progressState[sectionId] || initializeSectionProgress(sectionId);
  
  updates.forEach(update => {
    const item = progress.checklist.find(item => item.id === update.itemId);
    if (item) {
      item.completed = update.completed;
    }
  });
  
  progress.overallProgress = calculateProgress(progress);
  progress.isComplete = progress.overallProgress === 100;
  progress.canProceed = canProceedToNext(progress);
  
  progressState[sectionId] = progress;
  return progress;
};

// Get next incomplete item
export const getNextIncompleteItem = (sectionId: string): ChecklistItem | null => {
  const progress = getSectionProgress(sectionId);
  return progress.checklist.find(item => !item.completed && item.required) || null;
};

// Check if item can be completed (dependencies met)
export const canCompleteItem = (sectionId: string, itemId: string): boolean => {
  const progress = getSectionProgress(sectionId);
  const item = progress.checklist.find(item => item.id === itemId);
  
  if (!item || !item.dependencies) return true;
  
  return item.dependencies.every(depId => {
    const depItem = progress.checklist.find(item => item.id === depId);
    return depItem?.completed || false;
  });
}; 