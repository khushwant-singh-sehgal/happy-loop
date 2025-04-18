'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  height = 300 
}) => {
  // Format the date for display in the chart
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          allowDecimals={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`${value} tasks`, 'Completed']}
          labelFormatter={(label) => formatDate(label as string)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="count"
          name="Tasks Completed"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart; 