'use client';

import { useState, useEffect } from 'react';
import type { Kid, Task, TaskLog } from '@/lib/supabase';
import { getTaskLogs } from '@/lib/data-access';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

interface MonthlyCalendarProps {
  kid: Kid;
  tasks: Task[];
  initialMonth?: Date; // Optional initial month to display
}

export default function MonthlyCalendar({ kid, tasks, initialMonth }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [completions, setCompletions] = useState<Record<string, any[]>>({});
  const [loadingCompletions, setLoadingCompletions] = useState(true);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Array to hold all calendar days
    const days: Date[] = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }
    
    setCalendarDays(days);
    
    // --- Refactored Completions Logic ---
    const fetchAndProcessLogs = async () => {
      setLoadingCompletions(true);
      try {
        // 1. Get date range for the current month
        const monthStartDate = formatISO(startOfMonth(currentMonth), { representation: 'date' });
        const monthEndDate = formatISO(endOfMonth(currentMonth), { representation: 'date' });
        
        // 2. Fetch logs for this kid and month
        const logs: TaskLog[] = await getTaskLogs(kid.id, monthStartDate, monthEndDate);
        
        // 3. Create a map of tasks for quick lookup
        const taskMap = new Map<string, Task>(tasks.map(task => [task.id, task]));
        
        // 4. Build completionsMap from logs
        const completionsMap: Record<string, any[]> = {};
        logs.forEach(log => {
          const taskDetails = taskMap.get(log.task_id);
          const dateKey = log.date; // Assumes log.date is already 'yyyy-MM-dd'
          
          if (!completionsMap[dateKey]) {
            completionsMap[dateKey] = [];
          }
          
          // Push data needed for rendering
          completionsMap[dateKey].push({
            id: log.id,
            taskId: log.task_id,
            taskName: taskDetails?.name || 'Unknown Task', // Handle case where task might not be found
            taskIcon: taskDetails?.icon || '❓',
            points: log.points_awarded, // Use points from the log
            // Add other relevant fields from TaskLog type
            aiVerified: log.ai_validated, 
            parentApproved: log.parent_approved,
          });
        });
        setCompletions(completionsMap);
        
      } catch (error) {
        console.error("Error fetching or processing task logs for calendar:", error);
        setCompletions({}); // Clear completions on error
      } finally {
        setLoadingCompletions(false);
      }
    };

    fetchAndProcessLogs();
    // Dependency array includes kid and month, tasks are needed for mapping
  }, [currentMonth, kid.id, tasks]);
  
  // Format month
  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  // Format date as ISO string (YYYY-MM-DD)
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Get color based on parent approval status
  const getCompletionColor = (completion: any) => {
    if (completion.parentApproved === true) return 'bg-green-100 text-green-800';
    if (completion.parentApproved === false) return 'bg-red-100 text-red-800';
    if (completion.aiVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Monthly View</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium">{formatMonth(currentMonth)}</span>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className={`
                p-2 rounded-lg min-h-[90px] border
                ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${isToday(date) ? 'border-purple-500' : 'border-gray-200'}
              `}
            >
              <div className="text-right mb-1">
                <span className={`text-sm ${isToday(date) ? 'font-bold bg-purple-500 text-white w-6 h-6 inline-block rounded-full' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
              
              {/* Task Completions for this day */}
              <div className="space-y-1">
                {completions[formatDateKey(date)]?.map((completion, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-1.5 py-0.5 rounded flex items-center ${getCompletionColor(completion)}`}
                    title={`${completion.taskName} (${completion.parentApproved === true ? 'Approved' : completion.parentApproved === false ? 'Rejected' : completion.aiVerified ? 'AI Verified - Pending' : 'Pending'
                    })`}
                  >
                    <span className="mr-1">{completion.taskIcon}</span>
                    <span className="truncate">{completion.taskName}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-600">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-xs text-gray-600">Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span className="text-xs text-gray-600">AI Verified (Pending)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
} 