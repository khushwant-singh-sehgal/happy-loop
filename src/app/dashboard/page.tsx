'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getKids, getTaskLogs, getMediaUploads, getTasks } from '../../lib/data-access';
import type { Kid, Task, TaskLog } from '../../lib/supabase';
import AddChildModal from '../../components/dashboard/AddChildModal';

interface Activity {
  id: string;
  kidName: string;
  kidAvatar: string;
  taskName: string;
  taskIcon: string;
  points: number;
  date: string;
  approved: boolean | null;
  aiVerified: boolean;
  mediaType: 'image' | 'video' | 'audio';
  thumbnailUrl: string;
}

// Child Preview Component
const ChildPreview = ({ kid, onClick, selected }: { kid: Kid; onClick: () => void; selected: boolean }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-2 border-purple-400' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-3xl">{kid.avatar}</div>
        <div>
          <p className="font-medium">{kid.name}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{kid.points} points</span>
            <span className="mx-1">•</span>
            <span>🔥 {kid.streak} day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Monthly Calendar Component
const MonthlyCalendar = ({ selectedKid, activityDays = [] }: { selectedKid: Kid | null, activityDays?: number[] }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{monthName} {currentYear}</h3>
        <div className="flex space-x-2">
          <button className="p-1 rounded hover:bg-gray-100">◀</button>
          <button className="p-1 rounded hover:bg-gray-100">▶</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs text-gray-500 font-medium">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center">
        {Array(firstDayOfMonth).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8"></div>
        ))}
        
        {days.map(day => {
          const isToday = day === currentDate.getDate();
          const hasActivity = activityDays.includes(day);
          
          return (
            <div 
              key={day} 
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm
                ${isToday ? 'bg-purple-100 text-purple-700 font-bold' : ''}
                ${hasActivity && !isToday ? 'bg-green-100 text-green-700' : ''}
                ${!selectedKid ? 'opacity-50' : ''}
              `}
            >
              {day}
              {hasActivity && (
                <span className="absolute -mt-5 text-xs">•</span>
              )}
            </div>
          );
        })}
      </div>
      
      {!selectedKid && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Select a child to view their activity calendar
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityDays, setActivityDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch kids
        console.log('Fetching kids for dashboard with user ID:', user.id);
        let kidsData = await getKids(user.id);
        console.log('Dashboard getKids returned:', kidsData);
        
        // If we have no kids, try our verification endpoint
        if (kidsData.length === 0 && user.email) {
          console.log('No kids found for dashboard, trying verification endpoint');
          const response = await fetch(`/api/dashboard/verify-kids?email=${encodeURIComponent(user.email)}`);
          const data = await response.json();
          
          if (response.ok && data.kids && data.kids.length > 0) {
            console.log('Verification endpoint found kids for dashboard:', data.kids);
            kidsData = data.kids;
          }
        }
        
        setKids(kidsData);
        
        if (kidsData.length > 0) {
          // Pre-select the first kid
          setSelectedKid(kidsData[0]);
          
          // Calculate total points
          const pointsSum = kidsData.reduce((sum, kid) => sum + kid.points, 0);
          setTotalPoints(pointsSum);
          
          // Get task logs for all kids to find pending approvals
          let pendingCount = 0;
          let allActivities: Activity[] = [];
          
          for (const kid of kidsData) {
            // Get recent task logs
            const today = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            
            const taskLogs = await getTaskLogs(
              kid.id,
              oneMonthAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            );
            
            // Count pending approvals
            pendingCount += taskLogs.filter(log => log.ai_validated && log.parent_approved === null).length;
            
            // Get task details
            const tasks = await getTasks();
            const taskMap = new Map<string, Task>();
            tasks.forEach(task => taskMap.set(task.id, task));
            
            // Get media uploads
            const taskLogIds = taskLogs.map(log => log.id);
            const mediaUploads = await getMediaUploads(taskLogIds);
            
            // Create activities
            const kidActivities = taskLogs.map(log => {
              const task = taskMap.get(log.task_id);
              const media = mediaUploads.find(m => m.task_log_id === log.id);
              
              return {
                id: log.id,
                kidName: kid.name,
                kidAvatar: kid.avatar,
                taskName: task?.name || 'Unknown task',
                taskIcon: task?.icon || '❓',
                points: log.points_awarded,
                date: log.date,
                approved: log.parent_approved,
                aiVerified: log.ai_validated,
                mediaType: media?.type || 'image',
                thumbnailUrl: media?.thumbnail_path || '',
              };
            });
            
            allActivities = [...allActivities, ...kidActivities];
            
            // Set activity days for the first kid
            if (kid.id === kidsData[0].id) {
              const daysWithActivity = taskLogs
                .map(log => new Date(log.date).getDate())
                .filter((value, index, self) => self.indexOf(value) === index);
              
              setActivityDays(daysWithActivity);
            }
          }
          
          // Sort activities by date and take first 5
          allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecentActivities(allActivities.slice(0, 5));
          setPendingApprovals(pendingCount);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  useEffect(() => {
    const updateActivityDays = async () => {
      if (!selectedKid) return;
      
      try {
        // Get task logs for the selected kid
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const taskLogs = await getTaskLogs(
          selectedKid.id,
          oneMonthAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        
        // Extract days with activity
        const daysWithActivity = taskLogs
          .map(log => new Date(log.date).getDate())
          .filter((value, index, self) => self.indexOf(value) === index);
        
        setActivityDays(daysWithActivity);
      } catch (error) {
        console.error('Error fetching activity days:', error);
      }
    };
    
    updateActivityDays();
  }, [selectedKid]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Function to refresh kids data
  const refreshKidsData = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing kids data for dashboard with user ID:', user.id);
      let kidsData = await getKids(user.id);
      console.log('Dashboard refresh getKids returned:', kidsData);
      
      // If we have no kids, try our verification endpoint
      if (kidsData.length === 0 && user.email) {
        console.log('No kids found during refresh, trying verification endpoint');
        const response = await fetch(`/api/dashboard/verify-kids?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (response.ok && data.kids && data.kids.length > 0) {
          console.log('Verification endpoint found kids during refresh:', data.kids);
          kidsData = data.kids;
        }
      }
      
      setKids(kidsData);
      
      // Calculate total points
      const pointsSum = kidsData.reduce((sum, kid) => sum + kid.points, 0);
      setTotalPoints(pointsSum);
      
      // If there was no selected kid or the selected kid was removed, select the first one
      if (kidsData.length > 0 && (!selectedKid || !kidsData.find(k => k.id === selectedKid.id))) {
        setSelectedKid(kidsData[0]);
      }
    } catch (error) {
      console.error('Error refreshing kids data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Parent Dashboard</h2>
      
      {/* Children Selection Row */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">Your Children</h3>
          <button
            onClick={() => setShowAddChildModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Child
          </button>
        </div>
        
        {kids.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No children added yet</h3>
            <p className="text-gray-600 mb-4">Add your first child to get started with tracking tasks and rewards.</p>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Add Your First Child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {kids.map((kid) => (
              <ChildPreview
                key={kid.id}
                kid={kid}
                selected={selectedKid?.id === kid.id}
                onClick={() => setSelectedKid(kid)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'calendar' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'summary' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <Link 
          href="/dashboard/activities"
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700"
        >
          Activities
        </Link>
        <Link 
          href="/dashboard/progress"
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700"
        >
          Progress
        </Link>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Kids</h3>
                <span className="text-3xl">👨‍👩‍👧‍👦</span>
              </div>
              <p className="text-3xl font-bold mt-2">{kids.length}</p>
              <div className="mt-4 flex space-x-2">
                {kids.map(kid => (
                  <div key={kid.id} className="text-center">
                    <div className="text-2xl">{kid.avatar}</div>
                    <p className="text-xs mt-1">{kid.name}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Total Points</h3>
                <span className="text-3xl">🏆</span>
              </div>
              <p className="text-3xl font-bold mt-2">{totalPoints}</p>
              <p className="text-sm text-gray-500 mt-2">Points earned across all children</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Pending Approvals</h3>
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-3xl font-bold mt-2">{pendingApprovals}</p>
              <div className="mt-4">
                <Link href="/dashboard/tasks" className="text-purple-600 text-sm font-medium hover:underline">
                  {pendingApprovals > 0 ? 'Review now' : 'All caught up!'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-700">Recent Activity</h3>
              <Link href="/dashboard/tasks" className="text-purple-600 text-sm font-medium hover:underline">
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="text-2xl mr-4">{activity.taskIcon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {activity.kidName} completed <span className="text-gray-700">{activity.taskName}</span>
                        </p>
                        <span className="text-gray-500 text-sm">{formatDate(activity.date)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                          activity.approved === true
                            ? 'bg-green-100 text-green-800'
                            : activity.approved === false
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.approved === true
                            ? '✓ Approved'
                            : activity.approved === false
                            ? '✗ Rejected'
                            : '⋯ Pending'}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{activity.points} points</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No recent activities found
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <MonthlyCalendar selectedKid={selectedKid} activityDays={activityDays} />
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Summary</h3>
            {selectedKid ? (
              <>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{selectedKid.avatar}</span>
                  <div>
                    <p className="font-medium">{selectedKid.name}</p>
                    <p className="text-sm text-gray-500">{selectedKid.age} years old</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active days this month:</span>
                    <span className="font-medium">{activityDays.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current streak:</span>
                    <span className="font-medium">{selectedKid.streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total points:</span>
                    <span className="font-medium">{selectedKid.points}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Select a child to view their activity summary
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'summary' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Monthly Summary</h3>
          
          {selectedKid ? (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{selectedKid.avatar}</span>
                <div>
                  <p className="font-medium">{selectedKid.name}</p>
                  <p className="text-sm text-gray-500">{selectedKid.age} years old</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 mb-1">Completed Tasks</p>
                  <p className="text-2xl font-bold">{activityDays.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 mb-1">Consistency</p>
                  <p className="text-2xl font-bold">{Math.round((activityDays.length / 30) * 100)}%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Points Earned</p>
                  <p className="text-2xl font-bold">{selectedKid.points}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                  Generate PDF Report
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Select a child to view their monthly summary
            </div>
          )}
        </div>
      )}
      
      {/* Add Child Modal */}
      <AddChildModal 
        isOpen={showAddChildModal} 
        onClose={() => setShowAddChildModal(false)} 
        onSuccess={refreshKidsData}
      />
    </div>
  );
} 