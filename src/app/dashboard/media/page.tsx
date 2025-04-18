'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getPendingReviewLogsWithMedia, updateTaskApproval, TaskLogWithMedia } from '../../../lib/data-access';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export default function MediaReviewPage() {
  const [pendingLogs, setPendingLogs] = useState<TaskLogWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPendingLogs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const logs = await getPendingReviewLogsWithMedia(user.id);
      setPendingLogs(logs);
    } catch (err) {
      console.error('Error fetching pending logs:', err);
      setError('Failed to load items for review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLogs();
  }, [user]);

  const handleApproval = async (logId: string, approved: boolean) => {
    const log = pendingLogs.find(l => l.id === logId);
    if (!log || !log.tasks) return;

    setUpdatingLogId(logId); // Indicate loading for this specific item
    try {
      const pointsAwarded = approved ? log.tasks.points : 0;
      const success = await updateTaskApproval(logId, approved, pointsAwarded);
      if (success) {
        // Remove the approved/rejected item from the list
        setPendingLogs(prev => prev.filter(l => l.id !== logId));
      } else {
        alert('Failed to update approval. Please try again.');
      }
    } catch (err) {
      console.error('Error updating task approval:', err);
      alert('An error occurred while updating approval.');
    } finally {
      setUpdatingLogId(null); // Stop loading for this item
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-600 font-medium">Loading items for review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Media Review</h2>
      
       <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start mb-6">
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">About Media Review</h3>
            <p className="text-gray-600">
              Review photos, videos, or audio uploads from your children. AI provides initial 
              verification, but you give the final approval and award points.
            </p>
          </div>
        </div>

        {pendingLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <p className="font-medium text-lg">All caught up!</p>
            <p>There are no submissions waiting for your review.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {log.tasks?.icon} {log.tasks?.name || 'Unknown Task'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Completed by <span className="font-medium">{log.kids?.name || 'Unknown Child'}</span> - 
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ 
                      log.ai_validated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.ai_validated ? 'AI Verified' : 'AI Not Verified'}
                    </span>
                  </div>
                </div>

                {log.media_uploads ? (
                  <div className="p-4">
                    <h4 className="font-medium mb-2 text-gray-700">Submitted Evidence:</h4>
                    <div className="bg-gray-100 rounded-md p-2 flex justify-center items-center aspect-video overflow-hidden">
                      {log.media_uploads.type === 'image' ? (
                        <Image 
                          src={log.media_uploads.storage_path} 
                          alt={`Evidence for ${log.tasks?.name}`}
                          width={400} 
                          height={300}
                          className="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <p className="text-gray-500">({log.media_uploads.type} evidence - preview not available)</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 italic">
                    No media evidence submitted for this task.
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-t flex items-center justify-end space-x-3">
                  <button 
                    onClick={() => handleApproval(log.id, false)}
                    disabled={updatingLogId === log.id}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingLogId === log.id ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button 
                    onClick={() => handleApproval(log.id, true)}
                    disabled={updatingLogId === log.id}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {updatingLogId === log.id ? 'Approving...' : `Approve (+${log.tasks?.points || 0} pts)`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 