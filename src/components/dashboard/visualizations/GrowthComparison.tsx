'use client';

import { useState, useEffect, useRef } from 'react';
import type { TaskLog } from '../../../lib/supabase';

interface GrowthComparisonProps {
  taskLogs: TaskLog[];
  kidName: string;
  comparisonPeriod?: 'first-30-days' | 'last-30-days' | 'last-month';
}

interface DataPoint {
  label: string;
  currentValue: number;
  previousValue: number;
}

export default function GrowthComparison({ 
  taskLogs, 
  kidName, 
  comparisonPeriod = 'first-30-days' 
}: GrowthComparisonProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [improvement, setImprovement] = useState(0);
  
  useEffect(() => {
    if (taskLogs.length === 0) {
      setData([]);
      return;
    }
    
    // Sort logs by date (oldest first)
    const sortedLogs = [...taskLogs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get date ranges
    const firstLogDate = new Date(sortedLogs[0].date);
    const latestLogDate = new Date(sortedLogs[sortedLogs.length - 1].date);
    
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date = new Date();
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;
    
    if (comparisonPeriod === 'first-30-days') {
      // Current = last 30 days, Previous = first 30 days
      currentPeriodEnd = new Date();
      currentPeriodStart = new Date();
      currentPeriodStart.setDate(currentPeriodEnd.getDate() - 30);
      
      previousPeriodStart = new Date(firstLogDate);
      previousPeriodEnd = new Date(firstLogDate);
      previousPeriodEnd.setDate(previousPeriodStart.getDate() + 30);
    } else if (comparisonPeriod === 'last-30-days') {
      // Current = last 30 days, Previous = 30 days before that
      currentPeriodEnd = new Date();
      currentPeriodStart = new Date();
      currentPeriodStart.setDate(currentPeriodEnd.getDate() - 30);
      
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodEnd.getDate() - 30);
    } else { // last-month
      // Current = current month, Previous = previous month
      currentPeriodEnd = new Date();
      currentPeriodStart = new Date(currentPeriodEnd.getFullYear(), currentPeriodEnd.getMonth(), 1);
      
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodStart = new Date(previousPeriodEnd.getFullYear(), previousPeriodEnd.getMonth(), 1);
    }
    
    // Filter logs for both periods
    const currentLogs = sortedLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= currentPeriodStart && logDate <= currentPeriodEnd;
    });
    
    const previousLogs = sortedLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= previousPeriodStart && logDate <= previousPeriodEnd;
    });
    
    // Prepare metrics to compare
    const metrics: DataPoint[] = [
      {
        label: 'Tasks Completed',
        currentValue: currentLogs.length,
        previousValue: previousLogs.length
      },
      {
        label: 'Points Earned',
        currentValue: currentLogs.reduce((sum, log) => sum + log.points_awarded, 0),
        previousValue: previousLogs.reduce((sum, log) => sum + log.points_awarded, 0)
      },
      {
        label: 'Completion Rate',
        currentValue: calculateCompletionRate(currentLogs),
        previousValue: calculateCompletionRate(previousLogs)
      },
      {
        label: 'Avg. Points Per Task',
        currentValue: currentLogs.length > 0 
          ? Math.round(currentLogs.reduce((sum, log) => sum + log.points_awarded, 0) / currentLogs.length * 10) / 10
          : 0,
        previousValue: previousLogs.length > 0 
          ? Math.round(previousLogs.reduce((sum, log) => sum + log.points_awarded, 0) / previousLogs.length * 10) / 10
          : 0
      }
    ];
    
    // Calculate overall improvement percentage
    const currentTotal = metrics.reduce((sum, metric) => sum + metric.currentValue, 0);
    const previousTotal = metrics.reduce((sum, metric) => sum + metric.previousValue, 0);
    
    if (previousTotal > 0) {
      const improvementPercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
      setImprovement(Math.round(improvementPercentage));
    } else {
      setImprovement(100); // If there was nothing before, it's 100% improvement
    }
    
    setData(metrics);
  }, [taskLogs, comparisonPeriod]);
  
  // Helper function to calculate task completion rate
  const calculateCompletionRate = (logs: TaskLog[]): number => {
    // Here we estimate completion rate based on tasks per day
    // In a real app, you would compare against assigned tasks
    
    if (logs.length === 0) return 0;
    
    const dates = new Set(logs.map(log => log.date.split('T')[0]));
    const uniqueDays = dates.size;
    
    if (uniqueDays === 0) return 0;
    
    // Estimate: logs per day, capped at 100% (which would be 5+ tasks per day)
    const tasksPerDay = logs.length / uniqueDays;
    return Math.min(Math.round((tasksPerDay / 5) * 100), 100);
  };
  
  // Draw the chart
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuration
    const padding = 40;
    const barWidth = 30;
    const barSpacing = 80;
    const chartHeight = canvas.height - (padding * 2);
    const maxValue = Math.max(
      ...data.map(d => Math.max(d.currentValue, d.previousValue))
    ) * 1.2; // Add 20% headroom
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw data
    data.forEach((item, index) => {
      const x = padding + (index * barSpacing) + barSpacing / 2;
      
      // Calculate bar heights
      const currentHeight = (item.currentValue / maxValue) * chartHeight;
      const previousHeight = (item.previousValue / maxValue) * chartHeight;
      
      // Draw previous period bar (left)
      ctx.fillStyle = 'rgba(156, 163, 175, 0.6)'; // Gray
      ctx.fillRect(
        x - barWidth - 5, 
        canvas.height - padding - previousHeight, 
        barWidth, 
        previousHeight
      );
      
      // Draw current period bar (right)
      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)'; // Purple
      ctx.fillRect(
        x + 5,
        canvas.height - padding - currentHeight,
        barWidth,
        currentHeight
      );
      
      // Draw label
      ctx.fillStyle = '#4B5563';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x, canvas.height - padding + 20);
      
      // Draw values above bars
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px sans-serif';
      
      if (previousHeight > 0) {
        ctx.fillText(
          item.previousValue.toString(),
          x - barWidth / 2 - 5,
          canvas.height - padding - previousHeight - 5
        );
      }
      
      if (currentHeight > 0) {
        ctx.fillText(
          item.currentValue.toString(),
          x + barWidth / 2 + 5,
          canvas.height - padding - currentHeight - 5
        );
      }
      
      // Calculate and draw growth indicator
      if (item.previousValue > 0) {
        const growthPercent = ((item.currentValue - item.previousValue) / item.previousValue) * 100;
        const roundedGrowth = Math.round(growthPercent);
        
        if (roundedGrowth !== 0) {
          ctx.fillStyle = roundedGrowth > 0 ? '#10B981' : '#EF4444'; // Green or red
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(
            `${roundedGrowth > 0 ? '+' : ''}${roundedGrowth}%`,
            x,
            canvas.height - padding - Math.max(currentHeight, previousHeight) - 15
          );
        }
      }
    });
    
    // Add legend
    const legendY = padding / 2;
    const legendX = canvas.width - padding - 150;
    
    // Current period
    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#4B5563';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Current Period', legendX + 20, legendY + 12);
    
    // Previous period
    ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
    ctx.fillRect(legendX + 120, legendY, 15, 15);
    ctx.fillStyle = '#4B5563';
    ctx.fillText('Previous Period', legendX + 140, legendY + 12);
    
  }, [data]);
  
  // Different comparison period labels based on selection
  const getComparisonLabel = (): { current: string; previous: string } => {
    if (comparisonPeriod === 'first-30-days') {
      return {
        current: 'Last 30 days',
        previous: 'First 30 days'
      };
    } else if (comparisonPeriod === 'last-30-days') {
      return {
        current: 'Last 30 days',
        previous: 'Previous 30 days'
      };
    } else {
      // Get month names
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toLocaleString('default', { month: 'long' });
      
      return {
        current: currentMonth,
        previous: prevMonth
      };
    }
  };
  
  const periodLabels = getComparisonLabel();
  
  if (taskLogs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
        <p>Not enough data to compare periods.</p>
        <p className="text-sm mt-2">We need more logged activities to show growth comparisons.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Growth Comparison</h3>
          <p className="text-sm text-gray-500">
            Comparing {periodLabels.current} with {periodLabels.previous}
          </p>
        </div>
        
        <div className="mt-3 sm:mt-0">
          <select
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={comparisonPeriod}
            onChange={(e) => {
              const value = e.target.value as 'first-30-days' | 'last-30-days' | 'last-month';
              // Prop updates would happen here in a real app
            }}
          >
            <option value="first-30-days">Compare with first 30 days</option>
            <option value="last-30-days">Compare with previous 30 days</option>
            <option value="last-month">Compare with last month</option>
          </select>
        </div>
      </div>
      
      {improvement !== 0 && (
        <div className={`mb-4 p-3 rounded-lg ${improvement > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center">
            <div className={`text-xl mr-2 ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {improvement > 0 ? '📈' : '📉'}
            </div>
            <div>
              <p className={`font-medium ${improvement > 0 ? 'text-green-800' : 'text-red-800'}`}>
                {improvement > 0 ? `${improvement}% improvement` : `${Math.abs(improvement)}% decrease`}
              </p>
              <p className="text-sm text-gray-600">
                {improvement > 0 
                  ? `${kidName} is showing great progress compared to ${periodLabels.previous}!`
                  : `${kidName} has shown reduced activity compared to ${periodLabels.previous}.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <canvas
          ref={canvasRef}
          width="600"
          height="300"
          className="w-full h-auto"
        ></canvas>
      </div>
      
      <div className="mt-4 text-xs text-center text-gray-500">
        <p>The chart shows key metrics comparing two time periods.</p>
      </div>
    </div>
  );
} 