'use client';

import { useState, useEffect } from 'react';
import { Kid, Task } from '@/lib/supabase';
import { getTasks, getAssignedTasks, assignTask, unassignTask } from '@/lib/data-access';

interface TaskManagementProps {
  kid: Kid;
  onUpdate: () => void;
}

export default function TaskManagement({ kid, onUpdate }: TaskManagementProps) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [assignedTaskIds, setAssignedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all tasks and assigned tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Get all available tasks
        const tasks = await getTasks();
        setAllTasks(tasks);
        
        // Get tasks assigned to this kid
        const assigned = await getAssignedTasks(kid.id);
        setAssignedTaskIds(assigned.map(a => a.task_id));
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [kid.id]);

  // Handle toggling a task
  const handleToggleTask = async (taskId: string) => {
    try {
      setError('');
      setSuccess('');
      
      if (assignedTaskIds.includes(taskId)) {
        // Unassign task
        await unassignTask(kid.id, taskId);
        setAssignedTaskIds(prev => prev.filter(id => id !== taskId));
      } else {
        // Assign task
        await assignTask(kid.id, taskId);
        setAssignedTaskIds(prev => [...prev, taskId]);
      }
      
      setSuccess('Tasks updated successfully');
      onUpdate();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating task assignment:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-3"></div>
          <p className="text-purple-600 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Task Management for {kid.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable tasks for this child
        </p>
      </div>
      
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 text-green-600 rounded-md">
          {success}
        </div>
      )}
      
      <div className="p-6">
        <div className="space-y-3">
          {allTasks.length > 0 ? (
            allTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{task.icon}</div>
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-4 text-sm">
                    {task.points} points ({task.frequency})
                  </span>
                  <div className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      id={`task-toggle-${task.id}`}
                      className="sr-only"
                      checked={assignedTaskIds.includes(task.id)}
                      onChange={() => handleToggleTask(task.id)}
                    />
                    <label
                      htmlFor={`task-toggle-${task.id}`}
                      className={`block h-6 w-12 rounded-full transition-colors cursor-pointer ${
                        assignedTaskIds.includes(task.id) ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 mt-0.5 ml-0.5 rounded-full transition-transform bg-white ${
                          assignedTaskIds.includes(task.id) ? 'transform translate-x-6' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No tasks available. Add tasks on the Tasks page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 