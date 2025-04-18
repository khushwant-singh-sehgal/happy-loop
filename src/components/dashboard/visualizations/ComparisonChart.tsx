import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import type { Kid } from '@/lib/supabase'; // Import correct type

// Remove local Kid interface
// interface Kid {
//   id: string;
//   name: string;
//   avatar_url?: string;
//   progress: number;  // 0-100 percent
//   points: number;
// }

interface ComparisonChartProps {
  kids: Kid[];
  metric: 'progress' | 'points'; // Keep 'progress' for potential future use
  title?: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  kids,
  metric = 'points', // Default to points for now
  title = metric === 'progress' ? 'Progress Comparison' : 'Points Comparison'
}) => {
  // Prepare data for the chart
  const data = kids.map(kid => ({
    name: kid.name,
    points: kid.points, // Use points directly
    // progress: kid.progress || 0, // If progress is needed, handle potential undefined
    fill: getRandomColor(kid.id)  // Assign a consistent color based on kid id
  }));

  // Function to generate a color based on string
  function getRandomColor(str: string) {
    // Simple hash function to convert string to a number
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, '0')}`;
  }

  // Format label based on metric type
  const formatLabel = (value: number) => {
    if (metric === 'progress') {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                domain={metric === 'progress' ? [0, 100] : [0, 'auto']}
                tickFormatter={formatLabel}
              />
              <Tooltip 
                formatter={(value) => [formatLabel(value as number), metric === 'progress' ? 'Progress' : 'Points']}
              />
              <Legend />
              <Bar 
                dataKey={metric} // Use the dynamic metric key
                name={metric === 'progress' ? 'Progress' : 'Points'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart; 