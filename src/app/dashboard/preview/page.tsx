'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getKids } from '../../../lib/data-access';
import type { Kid } from '../../../lib/supabase';
// Re-import ParentPreview
import ParentPreview from '../../../components/dashboard/ParentPreview'; 

// Remove temporary components
// const TodaysTasks = ...
// const AvailableRewards = ...
// const RecentActivity = ...

export default function PreviewPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string>('');
  // Remove state for data fetched in this component
  // const [selectedKidData, setSelectedKidData] = useState<...>(null);
  const [loading, setLoading] = useState(true);
  // Remove loadingPreview state
  // const [loadingPreview, setLoadingPreview] = useState(false);
  const { user } = useAuth();

  // Fetch initial list of kids
  useEffect(() => {
    const fetchKidsList = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const kidsData = await getKids(user.id);
        setKids(kidsData);
        if (kidsData.length > 0) {
          setSelectedKidId(kidsData[0].id);
        } 
      } catch (error) {
        console.error('Error fetching kids:', error);
      } finally {
         // Stop loading after fetching kids list
        setLoading(false);
      }
    };
    fetchKidsList();
  }, [user]);

  // Remove useEffect hook for fetching preview data (handled by ParentPreview)
  // useEffect(() => { ... fetchPreviewData ... }, [selectedKidId, kids]);

  const handleKidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKidId(e.target.value);
  };

  if (loading) { // Use the main loading state
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Child Preview Mode</h2>
        
        {kids.length > 0 && selectedKidId && (
          <div className="flex space-x-2 items-center">
            <label htmlFor="kidSelector" className="text-sm font-medium text-gray-700">
              Preview as:
            </label>
            <select
              id="kidSelector"
              value={selectedKidId}
              onChange={handleKidChange}
              className="py-1 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              // Remove loadingPreview disable
              // disabled={loadingPreview} 
            >
              {kids.map(kid => (
                <option key={kid.id} value={kid.id}>
                  {kid.avatar} {kid.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {kids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl mb-4">👶</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Children Added</h3>
          <p className="text-gray-600 mb-6">
            Add a child in the settings to see a preview of their experience.
          </p>
          <a 
            href="/dashboard/settings" 
            className="inline-block bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Settings
          </a>
        </div>
       // Use selectedKidId to conditionally render ParentPreview 
      ) : selectedKidId ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Info Section */}
          <div className="flex items-start mb-6">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">About Preview Mode</h3>
              <p className="text-gray-600">
                This preview shows what your child sees on their device. You can explore their
                tasks, progress, and available rewards. This helps you understand their experience
                and better guide them in building positive habits.
              </p>
            </div>
          </div>
          
          {/* Render ParentPreview component */}
          <div className="border-t border-gray-200 pt-6 flex justify-center">
             <ParentPreview kidId={selectedKidId} />
          </div>
        </div>
      ) : (
          // Handle case where kids exist but none selected (shouldn't happen with default selection)
           <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">Please select a child to preview.</p>
          </div>
      )}
      
      {/* Tip Section */}
       <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex">
          <div className="text-blue-500 mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Preview Tip</h3>
            <p className="text-blue-700 text-sm">
              This is how your child sees the app. Try checking it at the end of each day to see their
              progress. Use this insight to offer encouragement for their achievements!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 