'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { TaskLog } from '@/lib/supabase';

export interface HabitHeatmapProps {
  taskLogs: TaskLog[];
  months?: number;
}

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ taskLogs, months = 3 }) => {
  // Calculate date range
  const today = new Date();
  const startDate = subDays(today, months * 30); // Approximate months by days
  
  // Create array of all days in the range
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  // Get counts of tasks completed per day
  const taskCountByDay = days.reduce<Record<string, number>>((acc, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    acc[dateStr] = 0;
    return acc;
  }, {});
  
  // --- DEBUG LOGGING START ---
  console.log('[HabitHeatmap] Initial taskCountByDay keys:', Object.keys(taskCountByDay).slice(0, 10)); // Log first 10 keys
  console.log('[HabitHeatmap] Received taskLogs (first 5):', taskLogs.slice(0, 5));
  // --- DEBUG LOGGING END ---

  // Fill in actual task counts using the correct date field
  taskLogs.forEach((log, index) => {
    // Original attempt was log.date.split('T')[0];
    // Since log.date is now 'yyyy-MM-dd', we just use it directly.
    const dateStr = log.date; 

    // --- DEBUG LOGGING START ---
    if (index < 5) { // Log details for the first 5 logs
        console.log(`[HabitHeatmap] Processing log ${index}: log.date = ${log.date}, derived dateStr = ${dateStr}`);
    }
    // --- DEBUG LOGGING END ---

    if (taskCountByDay[dateStr] !== undefined) {
      taskCountByDay[dateStr] += 1;
    } else {
      // Log if a date from taskLogs doesn't match any key in taskCountByDay
      // This might indicate a timezone issue or off-by-one error in date range generation
      console.warn(`[HabitHeatmap] Task log date ${dateStr} (from log ID ${log.id}) not found in generated days range.`);
    }
  });
  
  // --- DEBUG LOGGING START ---
  console.log('[HabitHeatmap] Final taskCountByDay (showing counts > 0):', 
    Object.entries(taskCountByDay).filter(([_, count]) => count > 0)
  );
  // --- DEBUG LOGGING END ---

  // Group by month and week for display
  const monthGroups: { month: string; weeks: any[] }[] = [];
  let currentMonth = '';
  let currentWeek: any[] = [];
  let weekDay = 0;
  
  days.forEach((day, index) => {
    const month = format(day, 'MMMM');
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = day.getDay();
    
    // Start a new month if needed
    if (month !== currentMonth) {
      if (currentWeek.length > 0) {
        // Pad the last week of the previous month
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        
        // Add the completed week to the current month
        if (monthGroups.length > 0) {
          monthGroups[monthGroups.length - 1].weeks.push([...currentWeek]);
        }
        
        // Reset the current week
        currentWeek = [];
        weekDay = 0;
      }
      
      currentMonth = month;
      monthGroups.push({ month, weeks: [] });
    }
    
    // Pad the current week until we reach the current day of week
    while (weekDay < dayOfWeek) {
      currentWeek.push(null);
      weekDay++;
    }
    
    // Add the current day to the week
    const count = taskCountByDay[dateStr] || 0;
    currentWeek.push({ date: day, count, dateStr });
    weekDay++;
    
    // If we've completed a week, add it to the current month and reset
    if (weekDay === 7 || index === days.length - 1) {
      // Pad the last week if needed
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      
      // Add the completed week to the current month
      monthGroups[monthGroups.length - 1].weeks.push([...currentWeek]);
      
      // Reset the current week
      currentWeek = [];
      weekDay = 0;
    }
  });
  
  // Function to determine cell color based on task count
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-6">
      {monthGroups.map((monthGroup, monthIndex) => (
        <div key={monthIndex} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">{monthGroup.month}</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            {monthGroup.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day: { date: Date; count: number; dateStr: string } | null, dayIndex: number) => {
                  // --- MORE DEBUGGING --- Log the count value being used for rendering
                  if (day) {
                    // Log count for the first few non-empty cells to avoid flooding
                    if (weekIndex < 1 && dayIndex < 7) { 
                         console.log(`[HabitHeatmap Rendering] Date: ${day.dateStr}, Count: ${day.count}`);
                    }
                  }
                  // --- END DEBUGGING ---
                  return (
                    <div 
                      key={dayIndex} 
                      // Revert className to use getCellColor (or keep the test one, doesn't matter much now)
                      className={`aspect-square rounded-sm flex items-center justify-center text-xs ${day ? getCellColor(day.count) : 'bg-transparent'}`}
                      title={day ? `${format(day.date, 'MMM d')}: ${day.count} tasks` : ''}
                    >
                      {/* Render the count directly if > 0 */} 
                      {day && day.count > 0 ? day.count : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-gray-600">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <span className="text-gray-600">More</span>
      </div>
    </div>
  );
};

export default HabitHeatmap; 