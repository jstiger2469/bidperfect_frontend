"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, AlertCircle, CheckCircle, Clock, FileText, DollarSign, MessageSquare, Edit, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanLane, KanbanCard } from '../lib/api';

interface LaneCardProps {
  lane: KanbanLane;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, card: KanbanCard) => void;
  onCreateCard: (title: string) => void;
}

const cardTypeColors = {
  requirement: 'bg-blue-100 text-blue-800 border-blue-200',
  artifact: 'bg-green-100 text-green-800 border-green-200',
  blocker: 'bg-red-100 text-red-800 border-red-200',
  pricing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qa: 'bg-purple-100 text-purple-800 border-purple-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  assumption: 'bg-orange-100 text-orange-800 border-orange-200',
};

const getCardIcon = (type: string) => {
  switch (type) {
    case 'requirement': return <AlertCircle className="w-3 h-3 mr-1" />;
    case 'artifact': return <FileText className="w-3 h-3 mr-1" />;
    case 'blocker': return <AlertCircle className="w-3 h-3 mr-1" />;
    case 'pricing': return <DollarSign className="w-3 h-3 mr-1" />;
    case 'qa': return <MessageSquare className="w-3 h-3 mr-1" />;
    case 'draft': return <Edit className="w-3 h-3 mr-1" />;
    case 'assumption': return <Lightbulb className="w-3 h-3 mr-1" />;
    default: return <FileText className="w-3 h-3 mr-1" />;
  }
};

const getLaneIcon = (title: string) => {
  switch (title) {
    case 'Intake': return <Clock className="w-4 h-4" />;
    case 'Parsing': return <FileText className="w-4 h-4" />;
    case 'Review': return <AlertCircle className="w-4 h-4" />;
    case 'Compliance': return <CheckCircle className="w-4 h-4" />;
    case 'Draft': return <Edit className="w-4 h-4" />;
    case 'Pricing/POP': return <DollarSign className="w-4 h-4" />;
    case 'QA/Checks': return <MessageSquare className="w-4 h-4" />;
    case 'Ready': return <CheckCircle className="w-4 h-4" />;
    case 'Done': return <CheckCircle className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getLaneColor = (title: string) => {
  switch (title) {
    case 'Intake': return 'border-blue-200 bg-blue-50/30';
    case 'Parsing': return 'border-purple-200 bg-purple-50/30';
    case 'Review': return 'border-yellow-200 bg-yellow-50/30';
    case 'Compliance': return 'border-red-200 bg-red-50/30';
    case 'Draft': return 'border-gray-200 bg-gray-50/30';
    case 'Pricing/POP': return 'border-green-200 bg-green-50/30';
    case 'QA/Checks': return 'border-indigo-200 bg-indigo-50/30';
    case 'Ready': return 'border-emerald-200 bg-emerald-50/30';
    case 'Done': return 'border-slate-200 bg-slate-50/30';
    default: return 'border-gray-200 bg-gray-50/30';
  }
};

export default function LaneCard({ 
  lane, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onDragStart, 
  onCreateCard 
}: LaneCardProps) {
  const handleCreateCard = () => {
    const title = prompt('Card title:');
    if (title?.trim()) {
      onCreateCard(title.trim());
    }
  };

  return (
    <div
      className="h-full"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Card className={`h-full ${getLaneColor(lane.title)} transition-all duration-200 hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getLaneIcon(lane.title)}
              <CardTitle className="text-base font-semibold text-gray-800">
                {lane.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {lane.cards?.length || 0}
              </Badge>
              {lane.wipLimit && (
                <Badge variant="outline" className="text-xs">
                  WIP: {lane.cards?.length || 0}/{lane.wipLimit}
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreateCard}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[200px]">
          <AnimatePresence>
            {lane.cards
              ?.sort((a, b) => a.orderIdx - b.orderIdx)
              .map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  draggable
                  onDragStart={(e) => onDragStart(e, card)}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="space-y-2">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-xs ${cardTypeColors[card.type as keyof typeof cardTypeColors] || cardTypeColors.draft}`}
                        >
                          {getCardIcon(card.type)}
                          {card.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Title */}
                    <div className="font-medium text-gray-800 text-sm leading-tight">
                      {card.title}
                    </div>

                    {/* Card Description */}
                    {card.description && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {card.description}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-2">
                      {card.assigneeCompanyId && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {card.assigneeCompanyId}
                        </div>
                      )}
                      {card.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            card.priority === 'high' ? 'border-red-300 text-red-700' :
                            card.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-gray-300 text-gray-700'
                          }`}
                        >
                          {card.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
          
          {/* Empty State */}
          {(!lane.cards || lane.cards.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-sm">No cards yet</div>
              <div className="text-xs mt-1">Click + to add a card</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
