'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HabitHeatmap from '@/components/dashboard/visualizations/HabitHeatmap';
import ComparisonChart from '@/components/dashboard/visualizations/ComparisonChart';
import ProgressSummary from '@/components/dashboard/visualizations/ProgressSummary';
import { useAuth } from '@/context/AuthContext';
import { getKids, getTaskLogs } from '@/lib/data-access';
import type { Kid, TaskLog } from '@/lib/supabase';
import { format, subDays } from 'date-fns';

export default function ProgressPage() {
  const { user } = useAuth();
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loadingKids, setLoadingKids] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch kids data
  useEffect(() => {
    const fetchKidsData = async () => {
      if (!user) return;
      setLoadingKids(true);
      setError(null);
      try {
        const kidsData = await getKids(user.id);
        setKids(kidsData);
        if (kidsData.length > 0) {
          setSelectedKid(kidsData[0]); // Select the first kid by default
        } else {
          setSelectedKid(null);
        }
      } catch (err) {
        console.error('Error fetching kids:', err);
        setError('Failed to load children data.');
      } finally {
        setLoadingKids(false);
      }
    };
    fetchKidsData();
  }, [user]);

  // Fetch task logs when selected kid changes
  useEffect(() => {
    const fetchLogsData = async () => {
      if (!selectedKid) {
        setTaskLogs([]); // Clear logs if no kid is selected
        return;
      }
      setLoadingLogs(true);
      setError(null);
      try {
        // Fetch logs for the last 90 days for heatmap/comparison
        const today = new Date();
        const startDate = format(subDays(today, 90), 'yyyy-MM-dd');
        const endDate = format(today, 'yyyy-MM-dd');
        const logs = await getTaskLogs(selectedKid.id, startDate, endDate);
        setTaskLogs(logs);
      } catch (err) {
        console.error('Error fetching task logs:', err);
        setError('Failed to load task log data.');
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogsData();
  }, [selectedKid]);

  if (loadingKids) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-600 font-medium">Loading children...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">
          Monitor your child's progress and development over time
        </p>
      </div>

      {/* TODO: Add Kid Selector Dropdown Here */}
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="habits">Habit Streaks</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          {/* Pass kids and logs to summary if needed, or let it fetch its own */}
          <ProgressSummary />
        </TabsContent>
        
        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Habit Completion</CardTitle>
              <CardDescription>
                Track habit completion trends over the last 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <p>Loading heatmap...</p>
              ) : taskLogs.length > 0 ? (
                <HabitHeatmap taskLogs={taskLogs} months={3} />
              ) : (
                <p>No task data available for heatmap.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points Comparison</CardTitle>
              <CardDescription>
                Compare total points across children
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {kids.length > 0 ? (
                <ComparisonChart kids={kids} metric="points" />
              ) : (
                <p>No children data available for comparison.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 