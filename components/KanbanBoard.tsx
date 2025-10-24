'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  DollarSign,
  MessageSquare,
  Settings,
  Zap,
  Archive,
  Users,
  Building2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useKanbanBoard, 
  useInitKanbanBoard, 
  useSyncKanbanBoard, 
  useUpdateKanbanCard,
  useCreateKanbanCard,
  useDeleteKanbanCard 
} from '@/lib/hooks';
import { KanbanCard, KanbanLane } from '@/lib/api';

interface KanbanBoardProps {
  opportunityId: string;
}

const cardTypeIcons = {
  Requirement: FileText,
  Assumption: Settings,
  Draft: FileText,
  Pricing: DollarSign,
  QA: MessageSquare,
  Artifact: Archive,
  Blocker: AlertTriangle,
  Task: CheckCircle,
};

const cardTypeColors = {
  Requirement: 'bg-blue-100 text-blue-800',
  Assumption: 'bg-purple-100 text-purple-800',
  Draft: 'bg-green-100 text-green-800',
  Pricing: 'bg-yellow-100 text-yellow-800',
  QA: 'bg-orange-100 text-orange-800',
  Artifact: 'bg-gray-100 text-gray-800',
  Blocker: 'bg-red-100 text-red-800',
  Task: 'bg-indigo-100 text-indigo-800',
};

const statusColors = {
  Todo: 'bg-gray-100 text-gray-800',
  InProgress: 'bg-blue-100 text-blue-800',
  Review: 'bg-yellow-100 text-yellow-800',
  Blocked: 'bg-red-100 text-red-800',
  Ready: 'bg-green-100 text-green-800',
  Done: 'bg-green-200 text-green-900',
};

export default function KanbanBoard({ opportunityId }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [draggedOverLane, setDraggedOverLane] = useState<string | null>(null);
  
  const { data: board, isLoading, error, refetch } = useKanbanBoard(opportunityId);
  const initKanbanMutation = useInitKanbanBoard();
  const syncKanbanMutation = useSyncKanbanBoard();
  const updateCardMutation = useUpdateKanbanCard();
  const createCardMutation = useCreateKanbanCard();
  const deleteCardMutation = useDeleteKanbanCard();
  
  // Direct opportunity data fetch to bypass React Query issue
  const [opportunityData, setOpportunityData] = useState(null);
  const [opportunityLoading, setOpportunityLoading] = useState(true);
  
  useEffect(() => {
    if (!opportunityId) return;
    
    const fetchOpportunity = async () => {
      try {
        setOpportunityLoading(true);
        const response = await fetch(`http://localhost:3001/opportunities/${opportunityId}`);
        const data = await response.json();
        setOpportunityData(data);
        console.log('✅ Direct opportunity fetch success:', data);
      } catch (error) {
        console.error('❌ Direct opportunity fetch error:', error);
      } finally {
        setOpportunityLoading(false);
      }
    };
    
    fetchOpportunity();
  }, [opportunityId]);

  // Initialize board on mount
  useEffect(() => {
    if (opportunityId && !board && !isLoading) {
      initKanbanMutation.mutate(opportunityId);
    }
  }, [opportunityId, board, isLoading]);

  // Refetch board data after successful creation
  useEffect(() => {
    if (initKanbanMutation.isSuccess) {
      console.log('🔄 Board created successfully, refetching board data...');
      refetch();
    }
  }, [initKanbanMutation.isSuccess, refetch]);

  const handleDragStart = (e: React.DragEvent, card: KanbanCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverLane(laneId);
  };

  const handleDragLeave = () => {
    setDraggedOverLane(null);
  };

  const handleDrop = (e: React.DragEvent, targetLaneId: string) => {
    e.preventDefault();
    
    if (draggedCard && draggedCard.laneId !== targetLaneId) {
      updateCardMutation.mutate({
        opportunityId,
        cardId: draggedCard.id,
        data: { laneId: targetLaneId }
      });
    }
    
    setDraggedCard(null);
    setDraggedOverLane(null);
  };

  const handleCreateCard = (laneId: string) => {
    const title = prompt('Enter card title:');
    if (title) {
      createCardMutation.mutate({
        opportunityId,
        data: {
          laneId,
          type: 'Task',
          title,
          status: 'Todo',
          tags: [],
          orderIdx: 0
        }
      });
    }
  };

  // Mock sync function removed - using backend baseline seeding instead

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate({ opportunityId, cardId });
    }
  };

  const handleTestAPI = async () => {
    console.log('🧪 Testing API directly...');
    try {
      const response = await fetch(`http://localhost:3001/opportunities/${opportunityId}`);
      const data = await response.json();
      console.log('✅ Direct API test success:', data);
      alert(`API Test Success! Title: ${data.title}`);
    } catch (error) {
      console.error('❌ Direct API test error:', error);
      alert(`API Test Failed: ${error}`);
    }
  };

  const getCardIcon = (type: KanbanCard['type']) => {
    const Icon = cardTypeIcons[type];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  if (opportunityLoading || isLoading || initKanbanMutation.isPending || syncKanbanMutation.isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kanban board...</p>
          {opportunityData && (
            <p className="text-sm text-green-600 mt-2">✅ Opportunity data loaded: {opportunityData.title}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load Kanban board</p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Debug logging for board data
  console.log('🎯 KanbanBoard render state:', {
    board: board ? 'exists' : 'null',
    boardLanes: board?.lanes ? `has ${board.lanes.length} lanes` : 'no lanes',
    isLoading,
    error: error ? 'has error' : 'no error',
    opportunityData: opportunityData ? 'loaded' : 'not loaded'
  });

  if (!board || !board.lanes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No Kanban board found</p>
          {opportunityData && (
            <p className="text-sm text-green-600 mb-4">✅ Opportunity: {opportunityData.title}</p>
          )}
          <div className="space-y-2">
            <Button 
              onClick={() => initKanbanMutation.mutate(opportunityId)} 
              disabled={initKanbanMutation.isPending}
            >
              {initKanbanMutation.isPending ? 'Creating...' : 'Create Board'}
            </Button>
            <Button 
              onClick={handleTestAPI}
              variant="outline"
              className="w-full"
            >
              🧪 Test API Direct
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kanban Board</h2>
          <p className="text-gray-600">Track and manage your RFP tasks</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              try {
                // Try backend sync first
                await syncKanbanMutation.mutateAsync(opportunityId);
              } catch (error) {
                // Backend sync failed - show error instead of falling back to mock data
                console.error('Backend sync failed:', error);
                alert('Failed to sync with backend. Please check your connection.');
              }
            }}
            disabled={syncKanbanMutation.isPending || createCardMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            {syncKanbanMutation.isPending || createCardMutation.isPending ? 'Syncing...' : 'Sync Board'}
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Lane Groups - Better Organization */}
      <div className="space-y-6">
        {/* Active Workflow - Most Important Lanes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Active Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {board.lanes
              .filter(lane => ['Intake', 'Parsing', 'Review', 'Compliance'].includes(lane.title))
              .sort((a, b) => a.orderIdx - b.orderIdx)
              .map((lane) => (
                <div
                  key={lane.id}
                  className="h-full"
                  onDragOver={(e) => handleDragOver(e, lane.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, lane.id)}
                >
                  <Card className={`h-full ${draggedOverLane === lane.id ? 'ring-2 ring-blue-500' : ''} transition-all duration-200 hover:shadow-lg`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800">
                          {lane.title}
                        </CardTitle>
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
                            onClick={() => handleCreateCard(lane.id)}
                            className="h-6 w-6 p-0"
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
                              onDragStart={(e) => handleDragStart(e, card)}
                              className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 hover:border-gray-300"
                            >
                              <div className="space-y-2">
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`text-xs ${cardTypeColors[card.type]}`}
                                    >
                                      {getCardIcon(card.type)}
                                      {card.type}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${statusColors[card.status]}`}
                                    >
                                      {card.status}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Card Title */}
                                <h4 className="font-medium text-gray-800 text-sm leading-tight">
                                  {card.title}
                                </h4>

                                {/* Card Tags */}
                                {card.tags && card.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {card.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Card Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-2">
                                    {card.assigneeCompanyId && (
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        <span>{card.assigneeRole}</span>
                                      </div>
                                    )}
                                    {card.assigneeStaffId && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>Assigned</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>#{card.orderIdx}</span>
                                  </div>
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
              ))}
          </div>
        </div>

        {/* Development Phase */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5 text-purple-600" />
            Development Phase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {board.lanes
              .filter(lane => ['Draft', 'Pricing/POP', 'QA/Checks'].includes(lane.title))
              .sort((a, b) => a.orderIdx - b.orderIdx)
              .map((lane) => (
                <div
                  key={lane.id}
                  className="h-full"
                  onDragOver={(e) => handleDragOver(e, lane.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, lane.id)}
                >
                  <Card className={`h-full ${draggedOverLane === lane.id ? 'ring-2 ring-blue-500' : ''} transition-all duration-200 hover:shadow-lg`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800">
                          {lane.title}
                        </CardTitle>
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
                            onClick={() => handleCreateCard(lane.id)}
                            className="h-6 w-6 p-0"
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
                              onDragStart={(e) => handleDragStart(e, card)}
                              className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 hover:border-gray-300"
                            >
                              <div className="space-y-2">
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`text-xs ${cardTypeColors[card.type]}`}
                                    >
                                      {getCardIcon(card.type)}
                                      {card.type}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${statusColors[card.status]}`}
                                    >
                                      {card.status}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Card Title */}
                                <h4 className="font-medium text-gray-800 text-sm leading-tight">
                                  {card.title}
                                </h4>

                                {/* Card Tags */}
                                {card.tags && card.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {card.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Card Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-2">
                                    {card.assigneeCompanyId && (
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        <span>{card.assigneeRole}</span>
                                      </div>
                                    )}
                                    {card.assigneeStaffId && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>Assigned</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>#{card.orderIdx}</span>
                                  </div>
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
              ))}
          </div>
        </div>

        {/* Completion Phase */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completion Phase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {board.lanes
              .filter(lane => ['Ready', 'Done'].includes(lane.title))
              .sort((a, b) => a.orderIdx - b.orderIdx)
              .map((lane) => (
                <div
                  key={lane.id}
                  className="h-full"
                  onDragOver={(e) => handleDragOver(e, lane.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, lane.id)}
                >
                  <Card className={`h-full ${draggedOverLane === lane.id ? 'ring-2 ring-blue-500' : ''} transition-all duration-200 hover:shadow-lg`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800">
                          {lane.title}
                        </CardTitle>
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
                            onClick={() => handleCreateCard(lane.id)}
                            className="h-6 w-6 p-0"
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
                              onDragStart={(e) => handleDragStart(e, card)}
                              className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 hover:border-gray-300"
                            >
                              <div className="space-y-2">
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`text-xs ${cardTypeColors[card.type]}`}
                                    >
                                      {getCardIcon(card.type)}
                                      {card.type}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${statusColors[card.status]}`}
                                    >
                                      {card.status}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Card Title */}
                                <h4 className="font-medium text-gray-800 text-sm leading-tight">
                                  {card.title}
                                </h4>

                                {/* Card Tags */}
                                {card.tags && card.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {card.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Card Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-2">
                                    {card.assigneeCompanyId && (
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        <span>{card.assigneeRole}</span>
                                      </div>
                                    )}
                                    {card.assigneeStaffId && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>Assigned</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>#{card.orderIdx}</span>
                                  </div>
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
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
