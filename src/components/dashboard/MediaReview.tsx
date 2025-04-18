'use client';

import { useState, useEffect } from 'react';
import { getMediaUploads, getTaskLogs, getMediaUrl, updateTaskApproval } from '../../lib/data-access';
import type { TaskLog, MediaUpload } from '../../lib/supabase';

interface MediaReviewProps {
  kidId?: string;
  onUpdate?: () => void;
}

interface MediaItem {
  id: string;
  taskLogId: string;
  taskName: string;
  date: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  aiValidated: boolean;
  approved: boolean | null;
  points: number;
}

export default function MediaReview({ kidId, onUpdate }: MediaReviewProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  useEffect(() => {
    loadMediaItems();
  }, [kidId]);

  const loadMediaItems = async () => {
    setLoading(true);
    try {
      // Get task logs for the selected kid or all kids
      const taskLogs = await getTaskLogs(kidId || '');
      
      if (taskLogs.length === 0) {
        setMediaItems([]);
        setLoading(false);
        return;
      }
      
      // Get media uploads associated with those task logs
      const taskLogIds = taskLogs.map(log => log.id);
      const mediaUploads = await getMediaUploads(taskLogIds);
      
      // Create media items with urls
      const items: MediaItem[] = [];
      
      for (const media of mediaUploads) {
        const taskLog = taskLogs.find(log => log.id === media.task_log_id);
        if (taskLog) {
          const mediaUrl = await getMediaUrl(media.storage_path);
          
          if (mediaUrl) {
            items.push({
              id: media.id,
              taskLogId: taskLog.id,
              taskName: taskLog.task_id, // This should be replaced with actual task name in a real implementation
              date: taskLog.date,
              mediaUrl,
              mediaType: media.type,
              aiValidated: taskLog.ai_validated,
              approved: taskLog.parent_approved,
              points: taskLog.points_awarded
            });
          }
        }
      }
      
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const handleApprove = async (points: number = selectedMedia?.points || 0) => {
    if (!selectedMedia) return;
    
    setApprovalLoading(true);
    try {
      await updateTaskApproval(selectedMedia.taskLogId, true, points);
      
      // Update the local state
      setMediaItems(prev => 
        prev.map(item => 
          item.id === selectedMedia.id 
            ? { ...item, approved: true, points } 
            : item
        )
      );
      
      setSelectedMedia(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error approving task:', error);
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMedia) return;
    
    setApprovalLoading(true);
    try {
      await updateTaskApproval(selectedMedia.taskLogId, false, 0);
      
      // Update the local state
      setMediaItems(prev => 
        prev.map(item => 
          item.id === selectedMedia.id 
            ? { ...item, approved: false, points: 0 } 
            : item
        )
      );
      
      setSelectedMedia(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error rejecting task:', error);
    } finally {
      setApprovalLoading(false);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    if (filter === 'pending') return item.approved === null;
    if (filter === 'approved') return item.approved === true;
    if (filter === 'rejected') return item.approved === false;
    return true; // 'all'
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-3"></div>
          <p className="text-gray-500">Loading media submissions...</p>
        </div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500 py-12">
        <div className="text-4xl mb-3">📸</div>
        <h3 className="text-lg font-medium mb-2">No Media Submissions Yet</h3>
        <p>
          When your children complete tasks and upload photos or videos, they will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <label htmlFor="filter" className="text-sm font-medium text-gray-700">
              Show:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Submissions</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map(item => (
          <div 
            key={item.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
              item.approved === true 
                ? 'border-2 border-green-400' 
                : item.approved === false 
                  ? 'border-2 border-red-400' 
                  : ''
            }`}
            onClick={() => handleMediaSelect(item)}
          >
            <div className="aspect-video bg-gray-100 relative">
              {item.mediaType === 'image' && (
                <img 
                  src={item.mediaUrl} 
                  alt="Task submission" 
                  className="w-full h-full object-cover"
                />
              )}
              {item.mediaType === 'video' && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                  <img 
                    src={item.mediaUrl} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {item.mediaType === 'audio' && (
                <div className="w-full h-full flex items-center justify-center bg-purple-100">
                  <div className="text-4xl">🎵</div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {item.approved === true && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Approved
                  </span>
                )}
                {item.approved === false && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                    Rejected
                  </span>
                )}
                {item.approved === null && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    Pending
                  </span>
                )}
              </div>
              
              {/* AI Badge */}
              {item.aiValidated && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    AI Validated
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-3">
              <p className="font-medium truncate">{item.taskName}</p>
              <p className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Media Review Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedMedia.taskName}</h3>
              <button 
                onClick={() => setSelectedMedia(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                {/* Media Display */}
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {selectedMedia.mediaType === 'image' && (
                    <img 
                      src={selectedMedia.mediaUrl} 
                      alt="Task submission" 
                      className="w-full max-h-[50vh] object-contain mx-auto"
                    />
                  )}
                  {selectedMedia.mediaType === 'video' && (
                    <video 
                      src={selectedMedia.mediaUrl} 
                      controls 
                      className="w-full max-h-[50vh]"
                    />
                  )}
                  {selectedMedia.mediaType === 'audio' && (
                    <div className="p-8 flex justify-center">
                      <audio src={selectedMedia.mediaUrl} controls />
                    </div>
                  )}
                </div>
                
                {/* Task Info */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Submission Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Task</p>
                      <p>{selectedMedia.taskName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p>{new Date(selectedMedia.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">AI Validation</p>
                      <p>{selectedMedia.aiValidated ? 'Passed ✅' : 'Failed ❌'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p>
                        {selectedMedia.approved === true && 'Approved ✅'}
                        {selectedMedia.approved === false && 'Rejected ❌'}
                        {selectedMedia.approved === null && 'Pending Review ⏳'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Approval Section */}
                {selectedMedia.approved === null && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Review Submission</h4>
                    
                    <div className="mb-4">
                      <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                        Points to Award (0-10)
                      </label>
                      <input
                        type="range"
                        id="points"
                        min="0"
                        max="10"
                        value={selectedMedia.points}
                        onChange={(e) => setSelectedMedia({
                          ...selectedMedia,
                          points: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                      <p className="text-center font-medium mt-2">
                        {selectedMedia.points} points
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={handleReject}
                        disabled={approvalLoading}
                        className="py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        {approvalLoading ? 'Processing...' : 'Reject'}
                      </button>
                      <button 
                        onClick={() => handleApprove(selectedMedia.points)}
                        disabled={approvalLoading}
                        className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        {approvalLoading ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 