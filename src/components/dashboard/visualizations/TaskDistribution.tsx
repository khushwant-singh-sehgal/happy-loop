'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TaskCategory {
  name: string;
  value: number;
  color: string;
}

interface TaskDistributionProps {
  data: TaskCategory[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const TaskDistribution: React.FC<TaskDistributionProps> = ({
  data,
  title = 'Task Distribution',
  height = 300,
  showLegend = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = 80
}) => {
  // Generate custom labels that show both category name and percentage
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    // Only show label if the percentage is significant enough
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#888"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            {showTooltip && (
              <Tooltip
                formatter={(value: number, name: string) => {
                  const total = data.reduce((sum, entry) => sum + entry.value, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return [`${value} (${percentage}%)`, name];
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TaskDistribution; 