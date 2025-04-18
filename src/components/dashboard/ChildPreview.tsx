'use client';

import { useState, useEffect } from 'react';
import type { Kid, Task } from '@/lib/supabase';

interface ChildPreviewProps {
  kid: Kid;
  // We might need to pass tasks and badges as separate props later
  // tasks: Task[]; 
  // badges: Badge[]; 
}

// Simplified component that only uses properties directly on the Kid type
export default function ChildPreview({ kid }: ChildPreviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to get a time-based greeting (Example)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow bg-gradient-to-br from-purple-400 to-pink-500 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{kid.avatar || '🧑'}</div>
          <div>
            {/* Use getGreeting or just display name */} 
            <p className="text-sm font-bold">{kid.name}</p>
            <p className="text-xs opacity-80">Age: {kid.age}</p>
          </div>
        </div>
        <div className="bg-white/20 text-white rounded-full h-8 px-3 flex items-center justify-center text-sm font-bold">
          {kid.points || 0} pts
        </div>
      </div>
      
      {/* Stats Row (Example) */}
       <div className="flex justify-around text-center text-xs mt-4 bg-black/10 p-2 rounded-md">
         <div>
           <p className="font-bold text-sm">{kid.streak || 0}</p>
           <p className="opacity-80">Day Streak</p>
         </div>
         {/* Placeholder for tasks completed today - would need taskLogs data */}
         <div>
           <p className="font-bold text-sm">?</p> 
           <p className="opacity-80">Tasks Today</p>
         </div>
         {/* Placeholder for badges - would need badge data */}
          <div>
           <p className="font-bold text-sm">?</p> 
           <p className="opacity-80">Badges</p>
         </div>
       </div>

      {/* Removed sections trying to access kid.tasks or kid.badges */}
      
    </div>
  );
} 