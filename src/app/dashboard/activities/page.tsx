'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  getTasks, 
  getKids, 
  assignTask, 
  unassignTask, 
  getAssignedTasks,
  createTask,
  updateTask,
  deleteTask
} from '../../../lib/data-access';
import type { Task, Kid } from '../../../lib/supabase';
import ActivityForm from '../../../components/dashboard/ActivityForm';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface TaskWithStatus extends Task {
  isAssigned: boolean;
  assignedKids: string[];
}

interface SortableTaskProps {
  task: TaskWithStatus;
  onToggle: (taskId: string) => void;
  onEdit: (task: TaskWithStatus) => void;
  onDelete: (taskId: string) => void;
}

const SortableTask = ({ task, onToggle, onEdit, onDelete }: SortableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  const getVerificationTypeLabel = (type?: string) => {
    switch (type) {
      case 'checkbox': return 'Simple checkbox';
      case 'photo': return 'Photo required';
      case 'video': return 'Video required';
      default: return 'None';
    }
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="py-4 border-b last:border-b-0">
      <div className="flex items-center">
        <div className="cursor-move text-gray-400 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="text-3xl mr-4">{task.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-800">{task.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              <div className="flex items-center mt-2 space-x-3">
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  +{task.points} points
                </span>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {task.frequency === 'daily' ? 'Daily' : 
                   task.frequency === 'weekly' ? 'Weekly' : 
                   task.frequency === 'monthly' ? 'Monthly' :
                   task.frequency === 'weekday' ? 'Weekdays' : 'Weekends'}
                </span>
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {getVerificationTypeLabel(task.verification_type)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onEdit(task)}
                className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={task.isAssigned}
                  onChange={() => onToggle(task.id)}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActivitiesPage() {
  const [allTasks, setAllTasks] = useState<TaskWithStatus[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState<TaskWithStatus | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch kids
        const kidsData = await getKids(user.id);
        setKids(kidsData);
        
        if (kidsData.length > 0 && !selectedKid) {
          setSelectedKid(kidsData[0].id);
        }
        
        // Fetch all tasks
        const tasksData = await getTasks();
        
        // For each kid, get their assigned tasks
        const kidsWithAssignments = await Promise.all(
          kidsData.map(async (kid) => {
            const assignments = await getAssignedTasks(kid.id);
            return { kidId: kid.id, assignments };
          })
        );
        
        // Track which tasks are assigned to which kids
        const tasksWithStatus: TaskWithStatus[] = tasksData.map(task => {
          const assignedKids: string[] = [];
          
          kidsWithAssignments.forEach(kid => {
            if (kid.assignments.some(a => a.task_id === task.id)) {
              assignedKids.push(kid.kidId);
            }
          });
          
          return {
            ...task,
            isAssigned: selectedKid ? assignedKids.includes(selectedKid) : false,
            assignedKids
          };
        });
        
        setAllTasks(tasksWithStatus);
      } catch (error) {
        console.error('Error fetching activities data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, selectedKid]);

  const handleKidChange = (kidId: string) => {
    setSelectedKid(kidId);
    
    // Update task assignment status based on selected kid
    setAllTasks(prev => 
      prev.map(task => ({
        ...task,
        isAssigned: task.assignedKids.includes(kidId)
      }))
    );
  };

  const handleToggleTask = async (taskId: string) => {
    if (!selectedKid) return;
    
    // Find the task
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      if (task.isAssigned) {
        // Unassign the task
        await unassignTask(selectedKid, taskId);
        
        // Update state
        setAllTasks(prev => 
          prev.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  isAssigned: false,
                  assignedKids: t.assignedKids.filter(k => k !== selectedKid)
                }
              : t
          )
        );
      } else {
        // Assign the task
        await assignTask(selectedKid, taskId);
        
        // Update state
        setAllTasks(prev => 
          prev.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  isAssigned: true,
                  assignedKids: [...t.assignedKids, selectedKid]
                }
              : t
          )
        );
      }
    } catch (error) {
      console.error('Error toggling task assignment:', error);
    }
  };
  
  const handleEditTask = (task: TaskWithStatus) => {
    setEditTask(task);
    setIsEditing(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this activity? This cannot be undone.")) {
      setIsDeleting(taskId);
      try {
        const success = await deleteTask(taskId);
        if (success) {
          // Remove from state
          setAllTasks(prev => prev.filter(t => t.id !== taskId));
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  const handleActivityFormSubmit = async (taskData: Partial<Task>) => {
    try {
      if (editTask) {
        // Update existing task
        const updatedTask = await updateTask(editTask.id, taskData);
        if (updatedTask) {
          setAllTasks(prev => 
            prev.map(t => 
              t.id === updatedTask.id 
                ? { 
                    ...updatedTask, 
                    isAssigned: t.isAssigned,
                    assignedKids: t.assignedKids
                  }
                : t
            )
          );
        }
      } else {
        // Create new task
        const newTask = await createTask(taskData as Omit<Task, 'id' | 'created_at'>);
        if (newTask) {
          setAllTasks(prev => [
            ...prev, 
            { 
              ...newTask, 
              isAssigned: false,
              assignedKids: []
            }
          ]);
        }
      }
      
      // Close the form
      setIsEditing(false);
      setEditTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setAllTasks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newArray = [...items];
        const [removed] = newArray.splice(oldIndex, 1);
        newArray.splice(newIndex, 0, removed);
        
        return newArray;
      });
    }
  };

  const getVerificationTypeLabel = (type?: string) => {
    switch (type) {
      case 'checkbox': return 'Simple checkbox';
      case 'photo': return 'Photo required';
      case 'video': return 'Video required';
      default: return 'None';
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Activities</h2>
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => {
            setEditTask(null);
            setIsEditing(true);
          }}
        >
          Add Custom Activity
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">Loading activities...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - filter by kid */}
          <div className="w-full md:w-64 bg-white rounded-xl shadow-md p-5">
            <h3 className="font-medium text-gray-700 mb-3">Select Child</h3>
            <div className="space-y-2">
              {kids.map(kid => (
                <button
                  key={kid.id}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    selectedKid === kid.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleKidChange(kid.id)}
                >
                  <span className="text-2xl mr-3">{kid.avatar}</span>
                  <span className="font-medium">{kid.name}</span>
                </button>
              ))}
              
              {kids.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p>No children added yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Main content - tasks list */}
          <div className="flex-1">
            {selectedKid ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Activity Management
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enable or disable activities for {kids.find(k => k.id === selectedKid)?.name}. 
                    Enabled activities will appear in their daily tasks.
                  </p>
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext items={allTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y">
                      {allTasks.map(task => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                {allTasks.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <p>No activities available. Click "Add Custom Activity" to create your first activity.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600">
                  Please select a child to manage their activities
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Activity Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <ActivityForm 
              task={editTask || undefined}
              onSubmit={handleActivityFormSubmit}
              onCancel={() => {
                setIsEditing(false);
                setEditTask(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-center mt-4">Deleting activity...</p>
          </div>
        </div>
      )}
    </div>
  );
} 