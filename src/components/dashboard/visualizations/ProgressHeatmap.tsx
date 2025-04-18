import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfWeek, addDays, differenceInDays } from 'date-fns';

// Types for the heatmap data
interface HeatmapDay {
  date: string; // ISO string format
  count: number;
  title?: string;
}

interface ProgressHeatmapProps {
  data: HeatmapDay[];
  title?: string;
  weeks?: number; // Number of weeks to display
  startColor?: string;
  endColor?: string;
}

const ProgressHeatmap: React.FC<ProgressHeatmapProps> = ({
  data,
  title = 'Activity Heatmap',
  weeks = 12,
  startColor = '#f3f4f6',
  endColor = '#4ade80',
}) => {
  // Process data into a map for quick lookups
  const activityMap = new Map<string, HeatmapDay>();
  data.forEach((day) => {
    activityMap.set(day.date, day);
  });
  
  // Generate calendar grid
  const today = new Date();
  const startDate = startOfWeek(addDays(today, -7 * (weeks - 1)), { weekStartsOn: 0 });
  
  // Create week rows and day cells
  const weekRows: JSX.Element[] = [];
  const daysInWeek = 7;
  
  for (let week = 0; week < weeks; week++) {
    const dayCells: JSX.Element[] = [];
    
    for (let day = 0; day < daysInWeek; day++) {
      const currentDate = addDays(startDate, week * daysInWeek + day);
      const dateString = currentDate.toISOString().split('T')[0];
      const activity = activityMap.get(dateString);
      const count = activity?.count || 0;
      
      // Calculate color intensity based on count (0-5 scale)
      const intensity = Math.min(Math.max(count, 0), 5) / 5;
      const color = getColorShade(startColor, endColor, intensity);
      
      dayCells.push(
        <div
          key={dateString}
          className="w-4 h-4 rounded-sm m-1"
          style={{ backgroundColor: color }}
          title={activity?.title || `${format(currentDate, 'MMM d, yyyy')}: ${count} activities`}
        />
      );
    }
    
    weekRows.push(
      <div key={`week-${week}`} className="flex flex-row">
        {dayCells}
      </div>
    );
  }
  
  // Generate day labels (S, M, T, W, T, F, S)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
    <div key={`label-${index}`} className="w-4 h-4 m-1 text-xs text-center text-gray-500">
      {label}
    </div>
  ));
  
  // Generate month labels
  const monthLabels: JSX.Element[] = [];
  let lastMonth = -1;
  
  for (let week = 0; week < weeks; week++) {
    const currentDate = addDays(startDate, week * daysInWeek);
    const month = currentDate.getMonth();
    
    if (month !== lastMonth) {
      lastMonth = month;
      monthLabels.push(
        <div 
          key={`month-${month}`} 
          className="text-xs text-gray-500"
          style={{ 
            position: 'absolute', 
            left: `${week * 26}px`, 
            top: '-20px' 
          }}
        >
          {format(currentDate, 'MMM')}
        </div>
      );
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-start mt-6">
          {/* Day labels (S, M, T, W, T, F, S) */}
          <div className="flex flex-col mr-2">
            <div className="h-4 m-1"></div> {/* Empty space for alignment */}
            {dayLabels}
          </div>
          
          {/* Heatmap grid */}
          <div className="relative">
            <div className="absolute w-full">
              {monthLabels}
            </div>
            <div className="flex flex-col">
              {weekRows}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center mt-4 justify-end">
          <span className="text-xs text-gray-500 mr-2">Less</span>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <div
              key={`legend-${level}`}
              className="w-3 h-3 rounded-sm mx-0.5"
              style={{ backgroundColor: getColorShade(startColor, endColor, level / 5) }}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to interpolate between two colors
function getColorShade(startColor: string, endColor: string, intensity: number): string {
  // Parse hex colors into RGB components
  const start = {
    r: parseInt(startColor.slice(1, 3), 16),
    g: parseInt(startColor.slice(3, 5), 16),
    b: parseInt(startColor.slice(5, 7), 16),
  };
  
  const end = {
    r: parseInt(endColor.slice(1, 3), 16),
    g: parseInt(endColor.slice(3, 5), 16),
    b: parseInt(endColor.slice(5, 7), 16),
  };
  
  // Interpolate between the colors based on intensity
  const r = Math.round(start.r + (end.r - start.r) * intensity);
  const g = Math.round(start.g + (end.g - start.g) * intensity);
  const b = Math.round(start.b + (end.b - start.b) * intensity);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default ProgressHeatmap; 