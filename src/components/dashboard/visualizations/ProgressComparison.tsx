import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface ComparisonData {
  name: string;
  current: number;
  previous?: number;
  target?: number;
}

interface ProgressComparisonProps {
  data: ComparisonData[];
  title?: string;
  height?: number;
  colors?: {
    current: string;
    previous?: string;
    target?: string;
  };
  showTargets?: boolean;
  showLabels?: boolean;
}

const ProgressComparison: React.FC<ProgressComparisonProps> = ({
  data,
  title = 'Progress Comparison',
  height = 300,
  colors = {
    current: '#4ade80',
    previous: '#94a3b8',
    target: '#f43f5e'
  },
  showTargets = true,
  showLabels = true
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                return [value, name === 'current' ? 'Current' : name === 'previous' ? 'Previous' : 'Target'];
              }}
            />
            <Legend 
              formatter={(value) => {
                return value === 'current' ? 'Current' : value === 'previous' ? 'Previous' : 'Target';
              }}
            />
            
            {/* Previous period data */}
            {data.some(item => item.previous !== undefined) && (
              <Bar dataKey="previous" fill={colors.previous} name="previous">
                {showLabels && (
                  <LabelList dataKey="previous" position="top" fill="#666" fontSize={10} />
                )}
              </Bar>
            )}
            
            {/* Current period data */}
            <Bar dataKey="current" fill={colors.current} name="current">
              {showLabels && (
                <LabelList dataKey="current" position="top" fill="#666" fontSize={10} />
              )}
            </Bar>
            
            {/* Target line */}
            {showTargets && data.some(item => item.target !== undefined) && (
              <Bar dataKey="target" fill={colors.target} name="target">
                {showLabels && (
                  <LabelList dataKey="target" position="top" fill="#666" fontSize={10} />
                )}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProgressComparison; 