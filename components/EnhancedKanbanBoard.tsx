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
  Edit,
  Filter,
  RefreshCw,
  Search,
  ChevronDown
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
import KanbanCardDetail from './KanbanCardDetail';

interface EnhancedKanbanBoardProps {
  opportunityId: string;
}

type Phase = 'all' | 'intake' | 'development' | 'proposal';

const PHASE_CONFIG = {
  intake: {
    label: 'Intake',
    lanes: ['Intake', 'Parsing', 'Review'],
    color: 'bg-blue-50 text-blue-800'
  },
  development: {
    label: 'Development',
    lanes: ['Review', 'Compliance', 'Pricing/POP', 'QA/Checks', 'Ready'],
    color: 'bg-purple-50 text-purple-800'
  },
  proposal: {
    label: 'Proposal',
    lanes: ['Draft', 'Review', 'QA/Checks', 'Ready', 'Done'],
    color: 'bg-green-50 text-green-800'
  }
};

export default function EnhancedKanbanBoard({ opportunityId }: EnhancedKanbanBoardProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase>('all');
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [draggedOverLane, setDraggedOverLane] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSynced, setLastSynced] = useState<string>('');
  const [boardStatus, setBoardStatus] = useState<'initializing' | 'syncing' | 'ready' | 'error'>('ready');

  // Hooks
  const { data: board, isLoading, error, refetch } = useKanbanBoard(opportunityId);
  const initKanbanMutation = useInitKanbanBoard();
  const syncKanbanMutation = useSyncKanbanBoard();
  const updateCardMutation = useUpdateKanbanCard();
  const createCardMutation = useCreateKanbanCard();
  const deleteCardMutation = useDeleteKanbanCard();

  // Direct API state for debugging
  const [directBoardData, setDirectBoardData] = useState<any>(null);
  const [directLoading, setDirectLoading] = useState(false);

  // Direct API call to bypass React Query issues
  const fetchBoardDirectly = async () => {
    try {
      setDirectLoading(true);
      console.log('🔄 Fetching board directly from API...');
      const response = await fetch(`http://localhost:3001/opportunities/${opportunityId}/kanban`);
      const data = await response.json();
      console.log('✅ Direct board fetch success:', data);
      setDirectBoardData(data.board);
      setBoardStatus('ready');
    } catch (error) {
      console.error('❌ Direct board fetch error:', error);
      setBoardStatus('error');
    } finally {
      setDirectLoading(false);
    }
  };

  // Initialize board on mount with proper baseline seeding
  useEffect(() => {
    if (opportunityId && !board && !directBoardData) {
      console.log('🎯 Initializing Kanban board with baseline seeding...');
      setBoardStatus('initializing');
      initKanbanMutation.mutate(opportunityId, {
        onSuccess: (data) => {
          console.log('✅ Board initialized successfully:', data);
          setBoardStatus('ready');
          refetch();
          // Also fetch directly to ensure we get the data
          fetchBoardDirectly();
        },
        onError: (error) => {
          console.error('❌ Board initialization failed:', error);
          setBoardStatus('error');
          // Try direct fetch as fallback
          fetchBoardDirectly();
        }
      });
    }
  }, [opportunityId, board, initKanbanMutation, refetch, directBoardData]);

  // Fallback: if React Query fails, try direct fetch
  useEffect(() => {
    if (opportunityId && !board && !directBoardData && !isLoading) {
      console.log('🔄 React Query failed, trying direct fetch...');
      fetchBoardDirectly();
    }
  }, [opportunityId, board, directBoardData, isLoading]);

  // Auto-sync after initialization
  useEffect(() => {
    if (board && !lastSynced) {
      handleSync();
    }
  }, [board]);

  const handleSync = async () => {
    try {
      console.log('🔄 Syncing Kanban board with backend...');
      setBoardStatus('syncing');
      await syncKanbanMutation.mutateAsync(opportunityId);
      setLastSynced(new Date().toLocaleTimeString());
      setBoardStatus('ready');
      console.log('✅ Sync completed successfully');
      refetch(); // Refresh the board data
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setBoardStatus('error');
      // If sync fails (404), try to re-initialize
      if (error instanceof Error && error.message.includes('404')) {
        console.log('🔄 Sync endpoint not available, re-initializing board...');
        setBoardStatus('initializing');
        initKanbanMutation.mutate(opportunityId, {
          onSuccess: () => {
            setBoardStatus('ready');
            refetch();
            setLastSynced(new Date().toLocaleTimeString());
          },
          onError: () => {
            setBoardStatus('error');
          }
        });
      }
    }
  };

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

  const handleDrop = async (e: React.DragEvent, targetLaneId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.laneId === targetLaneId) {
      setDraggedCard(null);
      setDraggedOverLane(null);
      return;
    }

    // Optimistic update
    const originalLaneId = draggedCard.laneId;
    
    try {
      await updateCardMutation.mutateAsync({
        opportunityId,
        cardId: draggedCard.id,
        data: { laneId: targetLaneId }
      });
      
      refetch();
    } catch (error) {
      console.error('Move failed:', error);
      // Could implement rollback here
    }
    
    setDraggedCard(null);
    setDraggedOverLane(null);
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<KanbanCard>) => {
    try {
      await updateCardMutation.mutateAsync({
        opportunityId,
        cardId,
        data: updates
      });
      refetch();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDeepLink = (route: string, params?: Record<string, string>) => {
    // Handle different route formats
    let url: string;
    
    if (route.startsWith('/opportunities/')) {
      // Backend route format - replace opportunity ID and add rfpId if needed
      url = route.replace('[id]', opportunityId);
      if (params?.rfpId) {
        url = url.replace('[rfpId]', params.rfpId);
      }
    } else if (route.startsWith('/')) {
      // Frontend route format - construct full path
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      url = `/workspace/${opportunityId}${route}${queryString}`;
    } else {
      // Relative route
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      url = `/workspace/${opportunityId}/${route}${queryString}`;
    }
    
    window.open(url, '_blank');
  };

  const getFilteredLanes = () => {
    // Use direct board data as fallback
    const currentBoard = board || directBoardData;
    if (!currentBoard?.lanes) return [];
    
    let filteredLanes = currentBoard.lanes;
    
    // Filter by phase
    if (selectedPhase !== 'all') {
      const phaseLanes = PHASE_CONFIG[selectedPhase].lanes;
      filteredLanes = filteredLanes.filter((lane: any) => phaseLanes.includes(lane.title));
    }
    
    // Filter by search
    if (searchQuery) {
      filteredLanes = filteredLanes.map((lane: any) => ({
        ...lane,
        cards: lane.cards.filter((card: any) => 
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.tags.some((tag: any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter((lane: any) => lane.cards.length > 0);
    }
    
    return filteredLanes.sort((a: any, b: any) => a.orderIdx - b.orderIdx);
  };

  const getCardTypeIcon = (type: KanbanCard['type']) => {
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

  const filteredLanes = getFilteredLanes();

  // Use direct board data as fallback
  const currentBoard = board || directBoardData;
  const currentLoading = isLoading || directLoading;

  if (currentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kanban board...</p>
          <p className="text-sm text-gray-500 mt-2">
            {directLoading ? 'Fetching directly from API...' : 'Using React Query...'}
          </p>
        </div>
      </div>
    );
  }

  if ((error || !currentBoard) && !directBoardData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board Not Found</h3>
        <p className="text-gray-600 mb-4">The board for this opportunity doesn't exist yet.</p>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => initKanbanMutation.mutate(opportunityId)}
            disabled={initKanbanMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {initKanbanMutation.isPending ? 'Creating...' : 'Create Board'}
          </Button>
          <Button
            onClick={fetchBoardDirectly}
            disabled={directLoading}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {directLoading ? 'Fetching...' : 'Fetch Directly'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kanban Board</h2>
          <p className="text-gray-600">Track and manage your RFP workflow</p>
          {/* Smart Status Indicator */}
          <div className="flex items-center gap-2 mt-2">
            {boardStatus === 'initializing' && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs">Initializing baseline cards...</span>
              </div>
            )}
            {boardStatus === 'syncing' && (
              <div className="flex items-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                <span className="text-xs">Syncing with backend...</span>
              </div>
            )}
            {boardStatus === 'ready' && lastSynced && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-xs">Last synced: {lastSynced}</span>
              </div>
            )}
            {boardStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-xs">Sync failed - retrying...</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncKanbanMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncKanbanMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Board
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Phase Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Phase:</span>
          <div className="flex gap-1">
            <Button
              variant={selectedPhase === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase('all')}
            >
              All
            </Button>
            {Object.entries(PHASE_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedPhase === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPhase(key as Phase)}
                className={selectedPhase === key ? config.color : ''}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLanes.map((lane: any) => (
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
                  <CardTitle className="text-sm font-medium text-gray-900">
                    {lane.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {lane.cards.length}
                    </Badge>
                    {lane.wipLimit && (
                      <Badge variant="outline" className="text-xs">
                        WIP: {lane.wipLimit}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {lane.cards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No cards
                  </div>
                ) : (
                  lane.cards
                    .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
                    .map((card: any) => (
                      <motion.div
                        key={card.id}
                        layout
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, card)}
                        onClick={() => setSelectedCard(card)}
                        className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {getCardTypeIcon(card.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {card.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(card.status)}>
                                  {card.status}
                                </Badge>
                                {card.assigneeRole && (
                                  <Badge variant="outline" className="text-xs">
                                    {card.assigneeRole}
                                  </Badge>
                                )}
                                {card.extKey && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    Baseline
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {card.tags.slice(0, 3).map((tag: any) => (
                                <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                                  {tag}
                                </Badge>
                              ))}
                              {card.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{card.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Activity indicator */}
                          {card.events && card.events.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {(() => {
                                  const lastEvent = card.events[0];
                                  const timeDiff = Date.now() - new Date(lastEvent.createdAt).getTime();
                                  const minutes = Math.floor(timeDiff / 60000);
                                  if (minutes < 1) return 'Just now';
                                  if (minutes < 60) return `${minutes}m ago`;
                                  const hours = Math.floor(minutes / 60);
                                  if (hours < 24) return `${hours}h ago`;
                                  const days = Math.floor(hours / 24);
                                  return `${days}d ago`;
                                })()}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Card Detail Sidebar */}
      <KanbanCardDetail
        card={selectedCard!}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdateCard={handleUpdateCard}
        onDeepLink={handleDeepLink}
      />
    </div>
  );
}
