'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [databaseKids, setDatabaseKids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDebugData = async () => {
      if (!user || !user.email) {
        setError('User not logged in or missing email');
        setLoading(false);
        return;
      }

      try {
        // Fetch data from our debug endpoint
        const response = await fetch(`/api/dashboard/verify-kids?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch debug data');
        } else {
          setUserInfo({
            id: user.id,
            email: user.email,
            parent: data.parent
          });
          setDatabaseKids(data.kids || []);
        }
      } catch (err) {
        console.error('Error fetching debug data:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Debug Database Information</h1>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Kids in Database (Server Query)</h2>
        {databaseKids.length === 0 ? (
          <p className="text-gray-500">No kids found in database</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(databaseKids, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          This page bypasses RLS policies and shows the raw database records. If children appear here but not in the UI,
          there may be an RLS issue or a client-side data fetching problem.
        </p>
      </div>
    </div>
  );
} 