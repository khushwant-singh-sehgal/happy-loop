'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getKids, getTaskLogs, getTasks } from '@/lib/data-access';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import ProgressChart from './ProgressChart';
import TaskDistributionChart from './TaskDistributionChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import type { Kid, TaskLog, Task } from '@/lib/supabase';

interface TasksByCategory {
  [category: string]: number;
}

const ProgressSummary = () => {
  const { user } = useAuth();
  const [selectedKid, setSelectedKid] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [tasksByCategory, setTasksByCategory] = useState<TasksByCategory>({});
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const tasksData = await getTasks();
        setAllTasks(tasksData);
      } catch (error) {
        console.error('Error fetching all tasks:', error);
      }
    };
    fetchAllTasks();
  }, []);

  useEffect(() => {
    const fetchKids = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const kidsData = await getKids(user.id);
        setKids(kidsData);
        if (kidsData.length > 0) {
          setSelectedKid(kidsData[0].id);
        } else {
          setSelectedKid(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching kids:', error);
        setLoading(false);
      }
    };

    fetchKids();
  }, [user]);

  useEffect(() => {
    const fetchTaskLogs = async () => {
      if (!selectedKid) {
        setTaskLogs([]);
        setProgressData([]);
        setTasksByCategory({});
        if (!kids.length) setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const today = new Date();
        let startDate;
        
        if (timeRange === '7d') {
          startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        } else if (timeRange === '30d') {
          startDate = format(subDays(today, 30), 'yyyy-MM-dd');
        } else {
          startDate = format(subDays(today, 90), 'yyyy-MM-dd');
        }
        
        const endDate = format(today, 'yyyy-MM-dd');
        const logs = await getTaskLogs(selectedKid, startDate, endDate);
        setTaskLogs(logs);
        
        if (allTasks.length > 0) {
          processTaskCategories(logs, allTasks);
        } else {
          setTasksByCategory({});
        }
        generateProgressData(logs, timeRange);
      } catch (error) {
        console.error('Error fetching task logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedKid && allTasks.length > 0) {
      fetchTaskLogs();
    } else if (!selectedKid && !loading) {
      setLoading(false);
    }
  }, [selectedKid, timeRange, kids, allTasks]);

  const processTaskCategories = (logs: TaskLog[], tasks: Task[]) => {
    const taskMap = new Map<string, Task>(tasks.map(task => [task.id, task]));
    const categories: TasksByCategory = {};
    
    logs.forEach(log => {
      const task = taskMap.get(log.task_id);
      const category = task?.name || 'Unknown Task';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += 1;
    });
    
    setTasksByCategory(categories);
  };

  const generateProgressData = (logs: TaskLog[], period: string) => {
    const dataByDate: Record<string, number> = {};
    const today = new Date();
    let days = 30;
    
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dataByDate[dateStr] = 0;
    }
    
    logs.forEach(log => {
      const dateStr = log.date.split('T')[0];
      if (dataByDate[dateStr] !== undefined) {
        dataByDate[dateStr] += 1;
      }
    });
    
    const chartData = Object.entries(dataByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setProgressData(chartData);
  };

  const calculateStats = () => {
    if (taskLogs.length === 0 && !loading) {
      return {
        totalCompleted: 0,
        completionRate: 0,
        streak: 0,
        recentActivity: 'No activity yet'
      };
    }
    
    const sortedLogs = [...taskLogs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const mostRecent = sortedLogs[0];
    const recentActivity = mostRecent 
      ? formatDistanceToNow(new Date(mostRecent.date), { addSuffix: true })
      : 'No activity yet';
    
    const totalDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const daysWithActivity = new Set(sortedLogs.map(log => log.date.split('T')[0])).size;
    
    const currentKid = kids.find(k => k.id === selectedKid);
    const streak = currentKid?.streak || 0;
    
    return {
      totalCompleted: taskLogs.length,
      completionRate: totalDays > 0 ? Math.round((daysWithActivity / totalDays) * 100) : 0,
      streak,
      recentActivity
    };
  };
  
  const stats = calculateStats();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 inline-block mb-2"></div>
        <p>Loading progress data...</p>
      </div>
    );
  }

  if (!selectedKid && kids.length > 0) {
    return <div className="p-8 text-center">Please select a child to view progress.</div>;
  }
  
  if (kids.length === 0) {
    return <div className="p-8 text-center">No children found. Please add a child first.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold tracking-tight">Progress Summary</h3>
          <p className="text-sm text-muted-foreground">
            Overview of task completion and habits for {kids.find(k => k.id === selectedKid)?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedKid || undefined}
            onValueChange={(value) => setSelectedKid(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {kids.map((kid) => (
                <SelectItem key={kid.id} value={kid.id}>
                  {kid.avatar} {kid.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={timeRange}
            onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              in the {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on days with activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Consecutive days with tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              Last task completed
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tasks Completed Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={progressData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Distribution of completed tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(tasksByCategory).length > 0 ? (
                 <TaskDistributionChart data={Object.entries(tasksByCategory).map(([name, value]) => ({ name, value }))} />
             ) : (
                 <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                     {loading ? 'Loading chart data...' : 'No task category data available'}
                 </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressSummary; 