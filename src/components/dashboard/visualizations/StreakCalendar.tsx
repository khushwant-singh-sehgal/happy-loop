import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, eachDayOfInterval, subDays, startOfDay } from 'date-fns';

interface StreakCalendarProps {
  data: {
    date: string; // ISO format date string
    count: number;
  }[];
  title?: string;
  numDays?: number;
  colorRange?: string[];
  maxCount?: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  data,
  title = 'Activity Streak',
  numDays = 90,
  colorRange = ['#f3f4f6', '#d1fae5', '#a7f3d0', '#6ee7b7', '#10b981'],
  maxCount
}) => {
  const today = startOfDay(new Date());
  const startDate = subDays(today, numDays - 1);
  
  // Create array of all days in range
  const daysInRange = eachDayOfInterval({
    start: startDate,
    end: today
  });
  
  // Convert data array to a map for easy lookup
  const countByDate = new Map();
  data.forEach(item => {
    countByDate.set(format(parseISO(item.date), 'yyyy-MM-dd'), item.count);
  });
  
  // Find the max count if not provided
  const actualMaxCount = maxCount || Math.max(
    ...Array.from(countByDate.values()),
    1 // Ensure we don't divide by zero if there's no data
  );
  
  // Helper to get color based on value
  const getColor = (count: number) => {
    if (count === 0) return colorRange[0];
    const normalizedValue = Math.min(count / actualMaxCount, 1);
    const index = Math.floor(normalizedValue * (colorRange.length - 1));
    return colorRange[index + 1]; // Skip the first color (zero value)
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInRange.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const count = countByDate.get(dateKey) || 0;
              
              return (
                <div
                  key={dateKey}
                  className="aspect-square rounded-sm hover:ring-2 hover:ring-primary transition-all relative group"
                  style={{ backgroundColor: getColor(count) }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md z-10">
                    <div>{format(date, 'MMM d, yyyy')}</div>
                    <div>{count} {count === 1 ? 'activity' : 'activities'}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
            <div>Less</div>
            <div className="flex gap-1">
              {colorRange.map((color, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div>More</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar; 