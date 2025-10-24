'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2,
  FileText,
  DollarSign,
  MessageSquare,
  Settings,
  Zap,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanCard, KanbanEvent } from '@/lib/api';

interface KanbanCardDetailProps {
  card: KanbanCard;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: string, updates: Partial<KanbanCard>) => void;
  onDeepLink: (route: string, params?: Record<string, string>) => void;
}

export default function KanbanCardDetail({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  onDeepLink
}: KanbanCardDetailProps) {
  if (!isOpen) return null;

  const getTypeIcon = (type: KanbanCard['type']) => {
    switch (type) {
      case 'Requirement': return <CheckCircle className="w-4 h-4" />;
      case 'Artifact': return <FileText className="w-4 h-4" />;
      case 'Blocker': return <AlertTriangle className="w-4 h-4" />;
      case 'Pricing': return <DollarSign className="w-4 h-4" />;
      case 'QA': return <MessageSquare className="w-4 h-4" />;
      case 'Draft': return <FileText className="w-4 h-4" />;
      case 'Assumption': return <Settings className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: KanbanCard['status']) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Ready': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      case 'InProgress': return 'bg-purple-100 text-purple-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'covered': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'outofpop': return 'bg-orange-100 text-orange-800';
      case 'unbalanced': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeepLinkAction = () => {
    if (!card.refs) return null;

    // Use the new refs structure from backend
    if (card.refs.route) {
      return {
        label: `Open ${card.type} Tool`,
        route: card.refs.route,
        params: card.refs.params || {}
      };
    }

    // Fallback to legacy structure
    const { type, refs } = card;
    
    switch (type) {
      case 'Requirement':
        return {
          label: 'Open Compliance Row',
          route: '/compliance',
          params: { row: refs.hash || refs.id }
        };
      case 'Artifact':
        return {
          label: 'Open Binder',
          route: '/binder',
          params: { artifact: refs.slug || refs.id }
        };
      case 'Pricing':
        return {
          label: 'Open CLIN Check',
          route: '/pricing/checks',
          params: { clin: refs.clinId || refs.id }
        };
      case 'Draft':
        return {
          label: 'Open Draft Node',
          route: '/draft',
          params: { node: refs.factorSubfactor || refs.id }
        };
      case 'QA':
        return {
          label: 'Open Q&A',
          route: '/qa',
          params: { focus: refs.qid || refs.id }
        };
      case 'Blocker':
        return {
          label: 'View Blocker Details',
          route: '/gaps',
          params: { blocker: refs.id }
        };
      default:
        return null;
    }
  };

  const deepLinkAction = getDeepLinkAction();

  const getAcceptanceCriteria = () => {
    // Use backend-provided acceptance criteria if available
    if (card.data?.acceptance) {
      return card.data.acceptance;
    }

    // Fallback to tag-based criteria
    const { type, tags } = card;
    
    switch (type) {
      case 'Requirement':
        return [
          { text: 'Coverage must be Covered', met: tags.includes('Covered') },
          { text: 'No expiring artifacts', met: !tags.includes('Expiring') }
        ];
      case 'Draft':
        return [
          { text: 'Check prompts critical = 0', met: !tags.includes('Critical') },
          { text: 'Citations present', met: tags.includes('Citations') }
        ];
      case 'Pricing':
        return [
          { text: 'No OutOfPOP items', met: !tags.includes('OutOfPOP') },
          { text: 'No Unbalanced items', met: !tags.includes('Unbalanced') }
        ];
      case 'Artifact':
        return [
          { text: 'Document uploaded', met: tags.includes('Uploaded') },
          { text: 'Validation passed', met: tags.includes('Validated') }
        ];
      default:
        return [];
    }
  };

  const acceptanceCriteria = getAcceptanceCriteria();
  const isReady = acceptanceCriteria.length > 0 && acceptanceCriteria.every(c => c.met);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {getTypeIcon(card.type)}
          <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status and Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Badge className={getStatusColor(card.status)}>
              {card.status}
            </Badge>
          </div>
          
          {card.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assignment */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-700">Assignment:</span>
          <div className="space-y-2">
            {card.assigneeCompanyId ? (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {card.assigneeRole === 'Prime' ? 'Prime Company' : 'Sub Company'}
                </span>
                <Badge variant="outline">
                  {card.assigneeRole}
                </Badge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unassigned</div>
            )}
            
            {card.assigneeStaffId && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Staff assigned</span>
              </div>
            )}
          </div>
        </div>

        {/* Acceptance Criteria */}
        {acceptanceCriteria.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Acceptance Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {acceptanceCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center gap-2">
                  {criteria.met ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${criteria.met ? 'text-green-700' : 'text-red-700'}`}>
                    {criteria.text}
                  </span>
                </div>
              ))}
              
              {isReady && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Ready to move to Done
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Deep Link Action */}
        {deepLinkAction && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Quick Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onDeepLink(deepLinkAction.route, deepLinkAction.params)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {deepLinkAction.label}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Micro-UIs based on card type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {card.type === 'Artifact' && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Validate Document
                </Button>
              </div>
            )}
            
            {card.type === 'Pricing' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Re-check POP Alignment
              </Button>
            )}
            
            {card.type === 'Draft' && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Run Check Prompts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Draft
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onUpdateCard(card.id, { status: 'Blocked' })}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Mark as Blocked
            </Button>
          </CardContent>
        </Card>

        {/* Event Feed */}
        {card.events && card.events.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {card.events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {event.kind === 'create' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {event.kind === 'update' && <Clock className="w-4 h-4 text-blue-600" />}
                      {event.kind === 'sync' && <Zap className="w-4 h-4 text-purple-600" />}
                      {event.kind === 'delete' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">
                        {event.kind === 'create' && 'Card created'}
                        {event.kind === 'update' && 'Card updated'}
                        {event.kind === 'sync' && 'Synced from data'}
                        {event.kind === 'delete' && 'Card deleted'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.actor} • {new Date(event.createdAt).toLocaleString()}
                      </div>
                      {event.payload && (
                        <div className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(event.payload)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Data (if available) */}
        {card.data && Object.keys(card.data).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Additional Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-auto">
                {JSON.stringify(card.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
