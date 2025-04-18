import { supabase } from './supabase';
import type { Kid, Parent, Task, TaskLog, MediaUpload, Badge, Reward, FamilyConfig } from './supabase';

// Parent data functions
export async function getParentProfile(parentId: string): Promise<Parent | null> {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('id', parentId)
    .single();
  
  if (error) {
    console.error('Error fetching parent profile:', error);
    return null;
  }
  
  return data as Parent;
}

// Kid data functions
export async function getKids(parentId: string): Promise<Kid[]> {
  console.log(`Fetching kids for parent ID: ${parentId} at ${new Date().toISOString()}`);
  
  // Safety check for empty or undefined parent ID
  if (!parentId || parentId === 'undefined' || parentId === 'null') {
    console.error('Invalid parent ID provided to getKids:', parentId);
    return [];
  }
  
  // For real accounts, exclude any sample data
  try {
    const { data, error } = await supabase
      .from('kids')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
      .throwOnError();
    
    if (error) {
      console.error('Error fetching kids:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} kids for parent ID: ${parentId}`);
    console.log('Kids data:', JSON.stringify(data));
    return data as Kid[];
  } catch (err) {
    console.error('Exception fetching kids:', err);
    return [];
  }
}

export async function getKid(kidId: string): Promise<Kid | null> {
  const { data, error } = await supabase
    .from('kids')
    .select('*')
    .eq('id', kidId)
    .single();
  
  if (error) {
    console.error('Error fetching kid:', error);
    return null;
  }
  
  return data as Kid;
}

export async function addKid(newKid: Omit<Kid, 'id' | 'created_at'>): Promise<Kid | null> {
  const { data, error } = await supabase
    .from('kids')
    .insert([newKid])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding kid:', error);
    return null;
  }
  
  return data as Kid;
}

// Task data functions
export async function getTasks(kidId?: string): Promise<Task[]> {
  let query = supabase.from('tasks').select('*');
  
  if (kidId) {
    // Filter tasks for a specific kid
    const { data: taskAssignments, error: assignmentError } = await supabase
      .from('kid_tasks')
      .select('task_id')
      .eq('kid_id', kidId);
    
    if (assignmentError) {
      console.error('Error fetching task assignments:', assignmentError);
      return [];
    }
    
    if (taskAssignments.length > 0) {
      const taskIds = taskAssignments.map(ta => ta.task_id);
      query = query.in('id', taskIds);
    } else {
      return []; // No tasks assigned to this kid
    }
  }
  
  const { data, error } = await query.order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data as Task[];
}

// Task completion data
export async function getTaskLogs(kidId: string, startDate?: string, endDate?: string): Promise<TaskLog[]> {
  let query = supabase
    .from('task_logs')
    .select('*')
    .eq('kid_id', kidId);
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching task logs:', error);
    return [];
  }
  
  return data as TaskLog[];
}

export async function addTaskLog(newLog: Omit<TaskLog, 'id' | 'created_at'>): Promise<TaskLog | null> {
  const { data, error } = await supabase
    .from('task_logs')
    .insert([newLog])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding task log:', error);
    return null;
  }
  
  return data as TaskLog;
}

export async function updateTaskApproval(logId: string, approved: boolean, pointsAwarded?: number): Promise<boolean> {
  const updateData: any = { parent_approved: approved };
  
  if (pointsAwarded !== undefined) {
    updateData.points_awarded = pointsAwarded;
  }
  
  const { error } = await supabase
    .from('task_logs')
    .update(updateData)
    .eq('id', logId);
  
  if (error) {
    console.error('Error updating task approval:', error);
    return false;
  }
  
  return true;
}

// Media uploads
export async function getMediaUploads(taskLogIds: string[]): Promise<MediaUpload[]> {
  const { data, error } = await supabase
    .from('media_uploads')
    .select('*')
    .in('task_log_id', taskLogIds);
  
  if (error) {
    console.error('Error fetching media uploads:', error);
    return [];
  }
  
  return data as MediaUpload[];
}

export async function uploadMedia(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  return data.path;
}

export async function getMediaUrl(path: string): Promise<string | null> {
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(path);
  
  return data?.publicUrl || null;
}

// Badges
export async function getBadges(kidId: string): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('kid_id', kidId)
    .order('date_earned', { ascending: false });
  
  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  
  return data as Badge[];
}

// Rewards
export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('available', true)
    .order('point_cost', { ascending: true });
  
  if (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
  
  return data as Reward[];
}

// Family configuration
export async function getFamilyConfig(parentId: string): Promise<FamilyConfig | null> {
  const { data, error } = await supabase
    .from('family_configs')
    .select('*')
    .eq('parent_id', parentId)
    .single();
  
  if (error) {
    // If no config exists, create a default one
    if (error.code === 'PGRST116') {
      const defaultConfig: Omit<FamilyConfig, 'id' | 'created_at' | 'updated_at'> = {
        parent_id: parentId,
        show_leaderboard: true,
        ai_validation: true,
        notification_frequency: 'daily',
        reward_preferences: ['books', 'toys', 'art']
      };
      
      const { data: newConfig, error: insertError } = await supabase
        .from('family_configs')
        .insert([defaultConfig])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating family config:', insertError);
        return null;
      }
      
      return newConfig as FamilyConfig;
    }
    
    console.error('Error fetching family config:', error);
    return null;
  }
  
  return data as FamilyConfig;
}

// Task assignment functions
export async function getAssignedTasks(kidId: string): Promise<{ kid_id: string, task_id: string }[]> {
  const { data, error } = await supabase
    .from('kid_tasks')
    .select('*')
    .eq('kid_id', kidId);
  
  if (error) {
    console.error('Error fetching assigned tasks:', error);
    return [];
  }
  
  return data as { kid_id: string, task_id: string }[];
}

export async function assignTask(kidId: string, taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('kid_tasks')
    .insert([{ kid_id: kidId, task_id: taskId }]);
  
  if (error) {
    console.error('Error assigning task:', error);
    return false;
  }
  
  return true;
}

export async function unassignTask(kidId: string, taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('kid_tasks')
    .delete()
    .eq('kid_id', kidId)
    .eq('task_id', taskId);
  
  if (error) {
    console.error('Error unassigning task:', error);
    return false;
  }
  
  return true;
}

// Add a function to get tasks for a specific kid
export async function getTasksForKid(kidId: string): Promise<Task[]> {
  // Get assigned task ids
  const { data: assignments, error: assignmentError } = await supabase
    .from('kid_tasks')
    .select('task_id')
    .eq('kid_id', kidId);
  
  if (assignmentError || !assignments || assignments.length === 0) {
    console.error('Error fetching task assignments or no assigned tasks:', assignmentError);
    return [];
  }
  
  // Get the actual tasks
  const taskIds = assignments.map(a => a.task_id);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('id', taskIds);
  
  if (error) {
    console.error('Error fetching tasks for kid:', error);
    return [];
  }
  
  return data as Task[];
}

// Task creation, update and deletion functions
export async function createTask(taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  
  return data as Task;
}

export async function updateTask(id: string, taskData: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  
  return data as Task;
}

export async function deleteTask(id: string): Promise<boolean> {
  // First remove all assignments
  const { error: assignmentError } = await supabase
    .from('kid_tasks')
    .delete()
    .eq('task_id', id);
  
  if (assignmentError) {
    console.error('Error removing task assignments:', assignmentError);
    return false;
  }
  
  // Then delete the task itself
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  
  return true;
}

// Function to get task logs needing parent approval, with associated media
export type TaskLogWithMedia = TaskLog & {
  media_uploads: MediaUpload | null;
  kids: Kid | null; // Include kid info
  tasks: Task | null; // Include task info
};

export async function getPendingReviewLogsWithMedia(parentId: string): Promise<TaskLogWithMedia[]> {
  // First, get the kids associated with the parent
  const { data: kids, error: kidsError } = await supabase
      .from('kids')
      .select('id')
      .eq('parent_id', parentId);

  if (kidsError || !kids || kids.length === 0) {
      console.error('Error fetching kids or no kids found for parent:', parentId, kidsError);
      return [];
  }
  const kidIds = kids.map(kid => kid.id);

  // Now fetch task logs for these kids that need review, joining with media, kid, and task tables
  const { data, error } = await supabase
      .from('task_logs')
      .select(`
          *,
          media_uploads (*),
          kids (*),
          tasks (*)
      `)
      .in('kid_id', kidIds)
      .is('parent_approved', null) // Filter for pending approval
      .order('created_at', { ascending: false });

  if (error) {
      console.error('Error fetching pending review logs with media:', error);
      return [];
  }

  // Supabase might return an array for one-to-one relations, flatten it
  const formattedData = data.map(log => ({
    ...log,
    media_uploads: Array.isArray(log.media_uploads) ? log.media_uploads[0] || null : log.media_uploads,
  })) as TaskLogWithMedia[];

  return formattedData;
} 