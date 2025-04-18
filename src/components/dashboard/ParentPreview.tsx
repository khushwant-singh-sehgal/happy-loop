'use client';

import { useState, useEffect } from 'react';
import { getKid, getTasks, getTaskLogs, getRewards, getFamilyConfig } from '../../lib/data-access';
import type { Kid, Task, TaskLog, Reward, FamilyConfig } from '../../lib/supabase';

interface ParentPreviewProps {
  kidId: string;
}

export default function ParentPreview({ kidId }: ParentPreviewProps) {
  const [kid, setKid] = useState<Kid | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskLog[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<FamilyConfig | null>(null);
  
  useEffect(() => {
    // Log the received kidId immediately
    console.log(`[ParentPreview] Received kidId prop: ${kidId}`); 

    if (!kidId) {
        console.log('[ParentPreview] kidId is missing, returning.');
        setLoading(false); // Stop loading if no ID
        return;
    }
    
    const loadData = async () => {
      console.log(`[ParentPreview] Loading data for kidId: ${kidId}`);
      setLoading(true);
      try {
        console.log('[ParentPreview] Fetching kid data...');
        const kidData = await getKid(kidId);
        console.log('[ParentPreview] Fetched kid data:', kidData);
        setKid(kidData);
        
        console.log('[ParentPreview] Fetching tasks...');
        const tasksData = await getTasks(kidId);
        console.log('[ParentPreview] Fetched tasks:', tasksData);
        setTasks(tasksData);
        
        console.log('[ParentPreview] Fetching today\'s task logs...');
        const today = new Date().toISOString().split('T')[0];
        const taskLogsData = await getTaskLogs(kidId, today, today);
        console.log('[ParentPreview] Fetched task logs:', taskLogsData);
        setCompletedTasks(taskLogsData);
        
        console.log('[ParentPreview] Fetching rewards...');
        const rewardsData = await getRewards();
        console.log('[ParentPreview] Fetched rewards:', rewardsData);
        setRewards(rewardsData);
        
        if (kidData?.parent_id) {
          console.log('[ParentPreview] Fetching family config...');
          const configData = await getFamilyConfig(kidData.parent_id);
          console.log('[ParentPreview] Fetched family config:', configData);
          setConfig(configData);
        }
      } catch (error) {
        console.error('[ParentPreview] Error loading preview data:', error);
      } finally {
        console.log('[ParentPreview] Finished loading data.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [kidId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-3"></div>
        <p className="ml-2 text-gray-500">Loading preview...</p>
      </div>
    );
  }
  
  if (!kid) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No child selected for preview.</p>
      </div>
    );
  }
  
  // Calculate completion rate for today's tasks
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
    
  // Get top rewards the child can afford
  const affordableRewards = rewards
    .filter(reward => reward.available && reward.point_cost <= kid.points)
    .sort((a, b) => a.point_cost - b.point_cost)
    .slice(0, 3);
  
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl overflow-hidden shadow-lg">
      {/* Mock Phone Frame */}
      <div className="relative">
        {/* Status Bar */}
        <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-xs">
          <span>9:41 AM</span>
          <div className="flex space-x-2">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        
        {/* App Content */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white min-h-[30rem] p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Hi, {kid.name}!</h1>
              <p className="opacity-90">Let's build good habits today 🚀</p>
            </div>
            <div className="text-4xl">{kid.avatar}</div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-sm opacity-90">Your Points</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{kid.points}</span>
                <span className="ml-1 text-xs">points</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-sm opacity-90">Streak</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{kid.streak}</span>
                <span className="ml-1 text-xs">days</span>
              </div>
            </div>
          </div>
          
          {/* Today's Progress */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
            <h2 className="font-bold mb-2">Today's Progress</h2>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1 text-sm">
                <span>Completed</span>
                <span>{completedTasks.length}/{tasks.length} tasks</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-400 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm opacity-90">
              {completionRate === 100 
                ? 'Amazing job! You completed all tasks today!' 
                : `${completionRate}% done - keep going!`}
            </p>
          </div>
          
          {/* Today's Tasks */}
          <div className="mb-6">
            <h2 className="font-bold mb-3">Today's Tasks</h2>
            
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p>No tasks assigned for today</p>
                </div>
              ) : (
                tasks.slice(0, 3).map(task => {
                  const isCompleted = completedTasks.some(log => log.task_id === task.id);
                  
                  return (
                    <div 
                      key={task.id}
                      className={`bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center ${
                        isCompleted ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="text-2xl mr-3">{task.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{task.name}</h3>
                        <p className="text-xs opacity-90">{task.description}</p>
                      </div>
                      <div>
                        {isCompleted ? (
                          <div className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-xs">
                            +{task.points}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {tasks.length > 3 && (
                <div className="text-center text-sm">
                  <span>+ {tasks.length - 3} more tasks</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Available Rewards */}
          <div>
            <h2 className="font-bold mb-3">Rewards You Can Get</h2>
            
            {affordableRewards.length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="mb-2">Keep earning points!</p>
                <p className="text-sm opacity-90">
                  You'll need {rewards.length > 0 ? rewards[0].point_cost - kid.points : 0} more points 
                  for your first reward.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {affordableRewards.map(reward => (
                  <div 
                    key={reward.id}
                    className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center"
                  >
                    <div className="text-3xl mb-2">{reward.image}</div>
                    <h3 className="font-medium text-center text-sm mb-1">{reward.name}</h3>
                    <span className="bg-white/30 text-xs rounded-full px-2 py-1">
                      {reward.point_cost} points
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="bg-gray-800 text-white px-4 py-3 flex justify-around">
          <div className="flex flex-col items-center text-xs">
            <span className="text-lg mb-1">🏠</span>
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center text-xs">
            <span className="text-lg mb-1">📝</span>
            <span>Tasks</span>
          </div>
          <div className="flex flex-col items-center text-xs">
            <span className="text-lg mb-1">🎁</span>
            <span>Rewards</span>
          </div>
          <div className="flex flex-col items-center text-xs">
            <span className="text-lg mb-1">👤</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
      
      {/* Preview Notice */}
      <div className="bg-yellow-100 text-yellow-800 p-3 text-sm text-center">
        <p>Preview Mode: This shows what {kid.name} sees on their device</p>
      </div>
    </div>
  );
} 