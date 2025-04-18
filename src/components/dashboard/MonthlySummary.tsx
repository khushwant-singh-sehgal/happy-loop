'use client';

import { useState } from 'react';
import type { Kid, Task, TaskLog } from '@/lib/supabase';

interface MonthlySummaryProps {
  kid: Kid;
  tasks: Task[];
  monthlyLogs: TaskLog[];
  month: string; // Format: "YYYY-MM" (e.g., "2023-03")
}

export default function MonthlySummary({ kid, tasks, monthlyLogs, month }: MonthlySummaryProps) {
  const [downloading, setDownloading] = useState(false);
  
  // Simulate download
  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };
  
  // Calculate stats based on monthlyLogs
  const calculateMonthlyStats = () => {
    let completionsCount = 0;
    let pointsEarned = 0;
    
    // Use monthlyLogs instead of iterating through tasks and their non-existent completions
    monthlyLogs.forEach(log => {
      if (log.parent_approved) { // Check approval status from the log
        completionsCount++;
        // Find the corresponding task to get points
        const task = tasks.find(t => t.id === log.task_id);
        if (task) {
          pointsEarned += task.points ?? 0; // Use points from the task definition
        }
      }
    });
    
    return { completionsCount, pointsEarned };
  };
  
  // Call the updated calculation function
  const { completionsCount, pointsEarned } = calculateMonthlyStats();
  
  // Format month for display
  const formatMonth = () => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Monthly Summary</h3>
          <p className="text-sm text-gray-500">{formatMonth()}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {downloading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </span>
          )}
        </button>
      </div>
      
      {/* PDF Preview */}
      <div className="p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8 border-2 border-gray-200">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎮</span>
                  <h1 className="text-2xl font-bold text-purple-600">Happy Loop</h1>
                </div>
                <span className="text-gray-500">|</span>
                <h2 className="text-xl font-semibold text-gray-800">Monthly Progress Report</h2>
              </div>
              <div className="text-right">
                <p className="text-gray-500">{formatMonth()}</p>
              </div>
            </div>
          </div>
          
          {/* Child Info */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">{kid.avatar}</div>
              <div>
                <h3 className="text-xl font-bold">{kid.name}</h3>
                <p className="text-gray-600">Age: {kid.age}</p>
              </div>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-purple-800 mb-1">Total Tasks Completed</p>
              <p className="text-3xl font-bold text-purple-600">{completionsCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-green-800 mb-1">Points Earned</p>
              <p className="text-3xl font-bold text-green-600">{pointsEarned}</p>
            </div>
          </div>
          
          {/* Tasks Breakdown */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 border-b pb-2">Tasks Breakdown</h4>
            <div className="space-y-3">
              {tasks.map(task => {
                // Find logs for this specific task within the provided monthly logs
                const taskLogs = monthlyLogs.filter(log => log.task_id === task.id && log.parent_approved);
                const taskCompletionsCount = taskLogs.length;
                const taskPointsEarned = taskCompletionsCount * (task.points ?? 0);

                // Only display tasks that were completed at least once this month
                if (taskCompletionsCount === 0) {
                  return null; 
                }
                
                return (
                  <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{task.icon || '❓'}</div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-gray-500">{task.points} points per completion</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{taskCompletionsCount} times</p>
                      <p className="text-sm text-green-600">+{taskPointsEarned} points</p>
                    </div>
                  </div>
                );
              })}
              {completionsCount === 0 && (
                 <p className="text-gray-500 italic text-center py-4">No tasks completed this month.</p>
              )}
            </div>
          </div>
          
          {/* Encouragement */}
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <p className="text-lg font-medium text-purple-800 mb-2">Great progress this month!</p>
            <p className="text-purple-600">
              Keep building those positive habits and reaching for your goals.
              Every small step counts on your journey to success!
            </p>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
            <p>Generated by Happy Loop on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 