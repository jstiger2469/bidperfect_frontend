/**
 * Spirit AI Service - Intelligent Assistant for BidPerfect
 * Provides real-time AI guidance and automation for government contracting
 */

export interface SpiritMessage {
  id: string
  type: 'suggestion' | 'warning' | 'insight' | 'action'
  title: string
  message: string
  confidence: number
  timestamp: Date
  category: 'rfp' | 'proposal' | 'compliance' | 'pricing' | 'team'
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable?: boolean
  actions?: SpiritAction[]
}

export interface SpiritAction {
  id: string
  label: string
  type: 'navigate' | 'create' | 'update' | 'review'
  target?: string
  data?: any
}

export interface SpiritAnalysis {
  score: number
  insights: SpiritMessage[]
  recommendations: SpiritMessage[]
  risks: SpiritMessage[]
  opportunities: SpiritMessage[]
}

class SpiritAI {
  private static instance: SpiritAI
  private listeners: Map<string, (messages: SpiritMessage[]) => void> = new Map()
  private messageQueue: SpiritMessage[] = []

  private constructor() {
    // Initialize Spirit AI
    this.startRealTimeAnalysis()
  }

  static getInstance(): SpiritAI {
    if (!SpiritAI.instance) {
      SpiritAI.instance = new SpiritAI()
    }
    return SpiritAI.instance
  }

  /**
   * Analyze RFP document and provide insights
   */
  async analyzeRFP(content: string, metadata?: any): Promise<SpiritAnalysis> {
    // Simulate AI analysis
    const analysis = await this.performAIAnalysis('rfp', { content, metadata })
    
    return {
      score: this.calculateRFPScore(content),
      insights: this.generateInsights('rfp', content),
      recommendations: this.generateRecommendations('rfp', content),
      risks: this.identifyRisks('rfp', content),
      opportunities: this.findOpportunities('rfp', content),
    }
  }

  /**
   * Analyze proposal content and suggest improvements
   */
  async analyzeProposal(sections: any[]): Promise<SpiritAnalysis> {
    const analysis = await this.performAIAnalysis('proposal', { sections })
    
    return {
      score: this.calculateProposalScore(sections),
      insights: this.generateInsights('proposal', sections),
      recommendations: this.generateRecommendations('proposal', sections),
      risks: this.identifyRisks('proposal', sections),
      opportunities: this.findOpportunities('proposal', sections),
    }
  }

  /**
   * Monitor compliance status and alert on issues
   */
  async checkCompliance(requirements: any[], current: any[]): Promise<SpiritMessage[]> {
    const gaps = this.identifyComplianceGaps(requirements, current)
    return gaps.map(gap => this.createComplianceMessage(gap))
  }

  /**
   * Provide real-time pricing suggestions
   */
  async analyzePricing(costs: any, market: any): Promise<SpiritMessage[]> {
    const suggestions = await this.performPricingAnalysis(costs, market)
    return suggestions.map(s => this.createPricingMessage(s))
  }

  /**
   * Get contextual suggestions based on current page/action
   */
  getContextualSuggestions(context: string, data?: any): SpiritMessage[] {
    switch (context) {
      case 'rfp-analysis':
        return this.getRFPSuggestions(data)
      case 'proposal-writing':
        return this.getProposalSuggestions(data)
      case 'team-assembly':
        return this.getTeamSuggestions(data)
      case 'pricing':
        return this.getPricingSuggestions(data)
      default:
        return this.getGeneralSuggestions()
    }
  }

  /**
   * Subscribe to real-time Spirit messages
   */
  subscribe(id: string, callback: (messages: SpiritMessage[]) => void): void {
    this.listeners.set(id, callback)
    // Send initial messages
    callback(this.messageQueue.slice(-5))
  }

  /**
   * Unsubscribe from Spirit messages
   */
  unsubscribe(id: string): void {
    this.listeners.delete(id)
  }

  // Private methods for AI processing

  private async performAIAnalysis(type: string, data: any): Promise<any> {
    // Simulate API call to AI service
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    return { processed: true, type, timestamp: new Date() }
  }

  private calculateRFPScore(content: string): number {
    // Simulate RFP complexity scoring
    const words = content.split(' ').length
    const complexity = Math.min(words / 1000, 1)
    return Math.round((0.8 + complexity * 0.2) * 100)
  }

  private calculateProposalScore(sections: any[]): number {
    // Simulate proposal completeness scoring
    const completeness = sections.length / 10
    return Math.round(Math.min(completeness, 1) * 100)
  }

  private generateInsights(type: string, data: any): SpiritMessage[] {
    const insights = {
      rfp: [
        {
          id: 'rfp-insight-1',
          type: 'insight' as const,
          title: 'High Competition Expected',
          message: 'This RFP has characteristics typical of high-competition contracts. Consider focusing on unique value propositions.',
          confidence: 0.85,
          timestamp: new Date(),
          category: 'rfp' as const,
          priority: 'medium' as const,
        },
        {
          id: 'rfp-insight-2',
          type: 'insight' as const,
          title: 'Technical Requirements Complex',
          message: 'The technical specifications indicate advanced requirements. Ensure your team has the necessary expertise.',
          confidence: 0.92,
          timestamp: new Date(),
          category: 'rfp' as const,
          priority: 'high' as const,
        }
      ],
      proposal: [
        {
          id: 'prop-insight-1',
          type: 'insight' as const,
          title: 'Strong Technical Approach',
          message: 'Your technical approach aligns well with the RFP requirements. Consider emphasizing this in your executive summary.',
          confidence: 0.88,
          timestamp: new Date(),
          category: 'proposal' as const,
          priority: 'medium' as const,
        }
      ]
    }

    return insights[type as keyof typeof insights] || []
  }

  private generateRecommendations(type: string, data: any): SpiritMessage[] {
    return [
      {
        id: `${type}-rec-1`,
        type: 'suggestion',
        title: 'Optimize Section Structure',
        message: 'Consider reorganizing your content to better match the evaluation criteria.',
        confidence: 0.75,
        timestamp: new Date(),
        category: type as any,
        priority: 'medium',
        actionable: true,
        actions: [
          {
            id: 'restructure',
            label: 'Auto-restructure',
            type: 'update',
            target: 'document'
          }
        ]
      }
    ]
  }

  private identifyRisks(type: string, data: any): SpiritMessage[] {
    return [
      {
        id: `${type}-risk-1`,
        type: 'warning',
        title: 'Missing Key Personnel',
        message: 'Your team may lack required certifications for this contract type.',
        confidence: 0.70,
        timestamp: new Date(),
        category: 'team',
        priority: 'high',
        actionable: true,
        actions: [
          {
            id: 'find-personnel',
            label: 'Find Qualified Personnel',
            type: 'navigate',
            target: '/team/search'
          }
        ]
      }
    ]
  }

  private findOpportunities(type: string, data: any): SpiritMessage[] {
    return [
      {
        id: `${type}-opp-1`,
        type: 'insight',
        title: 'Partnership Opportunity',
        message: 'Consider partnering with minority-owned businesses for additional scoring points.',
        confidence: 0.82,
        timestamp: new Date(),
        category: 'team',
        priority: 'medium',
        actionable: true,
        actions: [
          {
            id: 'find-partners',
            label: 'Find Partners',
            type: 'navigate',
            target: '/subcontractors'
          }
        ]
      }
    ]
  }

  private identifyComplianceGaps(requirements: any[], current: any[]): any[] {
    // Simulate compliance gap analysis
    return [
      {
        type: 'missing_document',
        requirement: 'Security Clearance Verification',
        severity: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  private createComplianceMessage(gap: any): SpiritMessage {
    return {
      id: `compliance-${Date.now()}`,
      type: 'warning',
      title: `Missing: ${gap.requirement}`,
      message: `Required document "${gap.requirement}" is missing and due soon.`,
      confidence: 0.95,
      timestamp: new Date(),
      category: 'compliance',
      priority: gap.severity,
      actionable: true,
      actions: [
        {
          id: 'upload-doc',
          label: 'Upload Document',
          type: 'create',
          target: '/documents/upload'
        }
      ]
    }
  }

  private async performPricingAnalysis(costs: any, market: any): Promise<any[]> {
    // Simulate pricing analysis
    return [
      {
        type: 'pricing_optimization',
        message: 'Your labor rates are 15% above market average',
        impact: 'medium',
        suggestion: 'Consider adjusting senior engineer rates'
      }
    ]
  }

  private createPricingMessage(suggestion: any): SpiritMessage {
    return {
      id: `pricing-${Date.now()}`,
      type: 'suggestion',
      title: 'Pricing Optimization',
      message: suggestion.message,
      confidence: 0.78,
      timestamp: new Date(),
      category: 'pricing',
      priority: suggestion.impact,
      actionable: true
    }
  }

  private getRFPSuggestions(data?: any): SpiritMessage[] {
    return [
      {
        id: 'rfp-sugg-1',
        type: 'suggestion',
        title: 'Review Similar Past RFPs',
        message: 'I found 3 similar RFPs in your history. Would you like me to highlight key differences?',
        confidence: 0.88,
        timestamp: new Date(),
        category: 'rfp',
        priority: 'medium',
        actionable: true,
        actions: [
          {
            id: 'compare-rfps',
            label: 'Compare RFPs',
            type: 'navigate',
            target: '/rfp/compare'
          }
        ]
      }
    ]
  }

  private getProposalSuggestions(data?: any): SpiritMessage[] {
    return [
      {
        id: 'prop-sugg-1',
        type: 'suggestion',
        title: 'Enhance Executive Summary',
        message: 'Your executive summary could benefit from stronger value proposition statements.',
        confidence: 0.82,
        timestamp: new Date(),
        category: 'proposal',
        priority: 'medium',
        actionable: true
      }
    ]
  }

  private getTeamSuggestions(data?: any): SpiritMessage[] {
    return [
      {
        id: 'team-sugg-1',
        type: 'suggestion',
        title: 'Optimize Team Composition',
        message: 'Consider adding a cybersecurity specialist for this contract type.',
        confidence: 0.75,
        timestamp: new Date(),
        category: 'team',
        priority: 'medium',
        actionable: true
      }
    ]
  }

  private getPricingSuggestions(data?: any): SpiritMessage[] {
    return [
      {
        id: 'price-sugg-1',
        type: 'suggestion',
        title: 'Competitive Pricing Alert',
        message: 'Your total price is within the competitive range. Consider emphasizing value over cost.',
        confidence: 0.86,
        timestamp: new Date(),
        category: 'pricing',
        priority: 'low',
        actionable: false
      }
    ]
  }

  private getGeneralSuggestions(): SpiritMessage[] {
    return [
      {
        id: 'general-sugg-1',
        type: 'insight',
        title: 'System Optimization',
        message: 'Your proposal completion rate has improved by 23% this month.',
        confidence: 0.95,
        timestamp: new Date(),
        category: 'rfp',
        priority: 'low',
        actionable: false
      }
    ]
  }

  private startRealTimeAnalysis(): void {
    // Simulate real-time analysis updates
    setInterval(() => {
      const randomMessage = this.generateRandomMessage()
      this.messageQueue.push(randomMessage)
      
      // Keep only recent messages
      if (this.messageQueue.length > 50) {
        this.messageQueue = this.messageQueue.slice(-50)
      }

      // Notify all listeners
      this.listeners.forEach(callback => {
        callback(this.messageQueue.slice(-5))
      })
    }, 30000) // Every 30 seconds
  }

  private generateRandomMessage(): SpiritMessage {
    const types = ['suggestion', 'insight', 'warning'] as const
    const categories = ['rfp', 'proposal', 'compliance', 'pricing', 'team'] as const
    const priorities = ['low', 'medium', 'high'] as const

    const messages = [
      'New RFP matching your capabilities detected',
      'Proposal deadline approaching in 48 hours',
      'Team member certification expires next month',
      'Market rates for similar services have changed',
      'Compliance document requires annual renewal'
    ]

    return {
      id: `auto-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: 'Automated Alert',
      message: messages[Math.floor(Math.random() * messages.length)],
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      timestamp: new Date(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      actionable: Math.random() > 0.5
    }
  }
}

// Export singleton instance
export const spirit = SpiritAI.getInstance()

// Utility functions
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'text-error-600 bg-error-50'
    case 'high': return 'text-warning-600 bg-warning-50'
    case 'medium': return 'text-primary-600 bg-primary-50'
    case 'low': return 'text-success-600 bg-success-50'
    default: return 'text-secondary-600 bg-secondary-50'
  }
}

export function getTypeIcon(type: string): string {
  switch (type) {
    case 'suggestion': return '💡'
    case 'warning': return '⚠️'
    case 'insight': return '🎯'
    case 'action': return '⚡'
    default: return '💭'
  }
} 