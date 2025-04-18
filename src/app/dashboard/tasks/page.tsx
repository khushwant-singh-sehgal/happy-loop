'use client';

import { useState, useEffect } from 'react';
import { getKids, getTasks, getTaskLogs, getMediaUploads } from '../../../lib/data-access';
import { useAuth } from '../../../context/AuthContext';

interface CompletionWithDetails {
  id: string;
  kidId: string;
  kidName: string;
  kidAvatar: string;
  taskId: string;
  taskName: string;
  taskIcon: string;
  taskPoints: number;
  date: string;
  mediaId: string;
  thumbnailUrl: string;
  mediaType: string;
  aiVerified: boolean;
  parentApproved: boolean | null;
}

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [completions, setCompletions] = useState<CompletionWithDetails[]>([]);
  const [selectedCompletion, setSelectedCompletion] = useState<CompletionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const allCompletions: CompletionWithDetails[] = [];
        
        // Fetch kids
        const kidsData = await getKids(user.id);
        
        // Fetch all tasks
        const tasksData = await getTasks();
        
        // For each kid, get their task logs
        for (const kid of kidsData) {
          // Get recent task logs - last 30 days
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);
          
          const taskLogs = await getTaskLogs(
            kid.id, 
            thirtyDaysAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          );
          
          // Get media for all task logs
          const taskLogIds = taskLogs.map(log => log.id);
          const mediaUploads = await getMediaUploads(taskLogIds);
          
          // Create completion details
          for (const log of taskLogs) {
            const task = tasksData.find(t => t.id === log.task_id);
            const media = mediaUploads.find(m => m.task_log_id === log.id);
            
            if (task) {
              allCompletions.push({
                id: log.id,
                kidId: kid.id,
                kidName: kid.name,
                kidAvatar: kid.avatar,
                taskId: task.id,
                taskName: task.name,
                taskIcon: task.icon,
                taskPoints: task.points,
                date: log.date,
                mediaId: media?.id || '',
                thumbnailUrl: media?.thumbnail_path || '',
                mediaType: media?.type || 'image',
                aiVerified: log.ai_validated,
                parentApproved: log.parent_approved,
              });
            }
          }
        }
        
        // Sort by date (most recent first)
        allCompletions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCompletions(allCompletions);
        
        // Select first item if available
        if (allCompletions.length > 0) {
          setSelectedCompletion(allCompletions[0]);
        }
      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Handle approving a task
  const handleApprove = (id: string) => {
    setCompletions(prev => 
      prev.map(c => c.id === id ? {...c, parentApproved: true} : c)
    );
    
    if (selectedCompletion?.id === id) {
      setSelectedCompletion(prev => prev ? {...prev, parentApproved: true} : null);
    }
  };
  
  // Handle rejecting a task
  const handleReject = (id: string) => {
    setCompletions(prev => 
      prev.map(c => c.id === id ? {...c, parentApproved: false} : c)
    );
    
    if (selectedCompletion?.id === id) {
      setSelectedCompletion(prev => prev ? {...prev, parentApproved: false} : null);
    }
  };
  
  // Filter completions based on the selected filter
  const filteredCompletions = completions.filter(comp => {
    if (filter === 'all') return true;
    if (filter === 'pending') return comp.parentApproved === null;
    if (filter === 'approved') return comp.parentApproved === true;
    if (filter === 'rejected') return comp.parentApproved === false;
    return true;
  });

  return (
    <div className="h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tasks & Activities</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">Loading tasks...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-6">
          {/* Left sidebar - list of completions */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setFilter('rejected')}
                >
                  Rejected
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredCompletions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No tasks match the selected filter</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCompletions.map(comp => (
                    <div 
                      key={comp.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCompletion?.id === comp.id ? 'bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCompletion(comp)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{comp.kidAvatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{comp.kidName}</p>
                            {comp.parentApproved === null ? (
                              <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full">
                                Pending
                              </span>
                            ) : comp.parentApproved ? (
                              <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                                Approved
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full">
                                Rejected
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>{comp.taskIcon}</span>
                            <span className="ml-1">{comp.taskName}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(comp.date)}
                          </div>
                        </div>
                      </div>
                      
                      {comp.aiVerified && comp.parentApproved === null && (
                        <div className="mt-2 flex items-center text-xs text-purple-600">
                          <span>🤖</span>
                          <span className="ml-1">AI verified</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right panel - selected completion details */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
            {selectedCompletion ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{selectedCompletion.taskIcon}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedCompletion.taskName}</h3>
                        <p className="text-gray-500">
                          Completed by {selectedCompletion.kidName} on {formatDate(selectedCompletion.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full font-medium">
                        +{selectedCompletion.taskPoints} points
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-gray-100 rounded-xl p-4 mb-6">
                    <div className="mb-4">
                      <p className="font-medium text-gray-700">Verification Status:</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🤖</span>
                          <span className={selectedCompletion.aiVerified ? "text-green-600" : "text-red-600"}>
                            {selectedCompletion.aiVerified ? "AI Verified" : "AI Not Verified"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">👨‍👩‍👧‍👦</span>
                          <span className={
                            selectedCompletion.parentApproved === null
                              ? "text-yellow-600"
                              : selectedCompletion.parentApproved
                                ? "text-green-600"
                                : "text-red-600"
                          }>
                            {selectedCompletion.parentApproved === null
                              ? "Parent Review Needed"
                              : selectedCompletion.parentApproved
                                ? "Parent Approved"
                                : "Parent Rejected"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Uploaded Media:</h4>
                    <div className="bg-gray-200 rounded-xl overflow-hidden">
                      {/* In a real app, this would be the actual media */}
                      <div className="aspect-video flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">
                            {selectedCompletion.mediaType === 'video' ? '🎬' : '📷'}
                          </div>
                          <p className="text-gray-700">
                            {selectedCompletion.mediaType === 'video' 
                              ? 'Video Evidence' 
                              : 'Photo Evidence'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Thumbnail URL: {selectedCompletion.thumbnailUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCompletion.parentApproved === null && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <p className="text-yellow-800 font-medium">
                        This activity needs your review and approval
                      </p>
                      {selectedCompletion.aiVerified && (
                        <p className="text-yellow-700 text-sm mt-1">
                          Our AI system has verified this activity as completed correctly.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-6 border-t">
                  {selectedCompletion.parentApproved === null ? (
                    <div className="flex space-x-4">
                      <button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                        onClick={() => handleApprove(selectedCompletion.id)}
                      >
                        Approve Activity
                      </button>
                      <button
                        className="flex-1 bg-white border border-red-500 text-red-500 hover:bg-red-50 py-3 px-4 rounded-md font-medium transition-colors"
                        onClick={() => handleReject(selectedCompletion.id)}
                      >
                        Reject Activity
                      </button>
                    </div>
                  ) : selectedCompletion.parentApproved ? (
                    <div className="bg-green-100 text-green-800 p-4 rounded-md text-center">
                      You approved this activity on {formatDate(selectedCompletion.date)}
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-800 p-4 rounded-md text-center">
                      You rejected this activity on {formatDate(selectedCompletion.date)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Select a task to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 