'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ 
  data,
  height = 240
}) => {
  // Calculate total for percentage display
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip 
          formatter={(value) => [`${value} tasks (${((value as number / total) * 100).toFixed(0)}%)`, 'Count']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TaskDistributionChart;