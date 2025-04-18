// This script creates a test account, adds children, and assigns activities
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

// Create admin client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// User we're creating/updating
const EMAIL = 'parent@example.com';
const PASSWORD = 'Password123!';

async function getUserId() {
  try {
    // Check if user exists
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    const existingUser = data.users.find(user => user.email === EMAIL);
    
    if (existingUser) {
      console.log(`User already exists with ID: ${existingUser.id}`);
      
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: PASSWORD, email_confirm: true }
      );
      
      if (updateError) {
        console.warn(`Warning: Could not update password: ${updateError.message}`);
      } else {
        console.log('Updated password for existing user');
      }
      
      return existingUser.id;
    }
    
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true
    });
    
    if (createError) {
      throw createError;
    }
    
    console.log(`Created new user with ID: ${newUser.user.id}`);
    return newUser.user.id;
  } catch (error) {
    console.error('Error getting/creating user:', error);
    throw error;
  }
}

async function setupTestAccount() {
  try {
    console.log(`Setting up test account: ${EMAIL}`);
    
    // 1. Get or create user
    const userId = await getUserId();
    
    // 2. Add entry to parents table if needed
    const { data: existingParent, error: checkParentError } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkParentError) {
      throw checkParentError;
    }
    
    if (!existingParent) {
      const { error: insertParentError } = await supabase
        .from('parents')
        .insert([{ id: userId, email: EMAIL, name: 'Test Parent' }]);
      
      if (insertParentError) {
        throw insertParentError;
      }
      
      console.log('Added parent entry to database');
    } else {
      console.log('Parent entry already exists in database');
    }
    
    // 3. Add children if needed
    const { data: existingKids, error: checkKidsError } = await supabase
      .from('kids')
      .select('*')
      .eq('parent_id', userId);
    
    if (checkKidsError) {
      throw checkKidsError;
    }
    
    let kidsData = existingKids;
    
    if (!existingKids || existingKids.length === 0) {
      const children = [
        { name: 'Alex', age: 8, avatar: '👦', parent_id: userId, points: 0, streak: 0 },
        { name: 'Emma', age: 6, avatar: '👧', parent_id: userId, points: 0, streak: 0 }
      ];
      
      const { data: newKids, error: insertKidsError } = await supabase
        .from('kids')
        .insert(children)
        .select();
      
      if (insertKidsError) {
        throw insertKidsError;
      }
      
      kidsData = newKids;
      console.log(`Added ${newKids.length} children to account`);
    } else {
      console.log(`Account already has ${existingKids.length} children`);
    }
    
    // 4. Get or create tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      throw tasksError;
    }
    
    let allTasks = tasks;
    
    if (tasks.length === 0) {
      const sampleTasks = [
        { name: 'Brush Teeth', description: 'Brush teeth in the morning and evening', icon: '🦷', points: 10, frequency: 'daily', verification_type: 'photo' },
        { name: 'Make Bed', description: 'Make your bed in the morning', icon: '🛏️', points: 5, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Reading', description: 'Read a book for 20 minutes', icon: '📚', points: 15, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Homework', description: 'Complete all homework assignments', icon: '✏️', points: 20, frequency: 'weekday', verification_type: 'photo' },
        { name: 'Clean Room', description: 'Tidy up your room', icon: '🧹', points: 15, frequency: 'weekly', verification_type: 'photo' },
        { name: 'Physical Activity', description: 'Play outside or exercise for 30 minutes', icon: '🏃‍♂️', points: 15, frequency: 'daily', verification_type: 'video' }
      ];
      
      const { data: newTasks, error: insertTasksError } = await supabase
        .from('tasks')
        .insert(sampleTasks)
        .select();
      
      if (insertTasksError) {
        throw insertTasksError;
      }
      
      allTasks = newTasks;
      console.log(`Created ${newTasks.length} sample tasks`);
    } else {
      console.log(`Found ${tasks.length} existing tasks`);
    }
    
    // 5. Assign tasks to each child
    for (const kid of kidsData) {
      // Check existing assignments
      const { data: existingAssignments, error: checkAssignmentsError } = await supabase
        .from('kid_tasks')
        .select('task_id')
        .eq('kid_id', kid.id);
      
      if (checkAssignmentsError) {
        throw checkAssignmentsError;
      }
      
      // Find tasks that haven't been assigned yet
      const existingTaskIds = existingAssignments.map(a => a.task_id);
      const unassignedTasks = allTasks.filter(task => !existingTaskIds.includes(task.id));
      
      if (unassignedTasks.length === 0) {
        console.log(`Child "${kid.name}" already has all tasks assigned`);
        continue;
      }
      
      // Create assignments for unassigned tasks
      const assignments = unassignedTasks.map(task => ({
        kid_id: kid.id,
        task_id: task.id
      }));
      
      const { error: insertAssignmentsError } = await supabase
        .from('kid_tasks')
        .insert(assignments);
      
      if (insertAssignmentsError) {
        throw insertAssignmentsError;
      }
      
      console.log(`Assigned ${unassignedTasks.length} tasks to child "${kid.name}"`);
    }
    
    console.log('\nTest account setup successfully complete!');
    console.log('----------------------------------------');
    console.log('Email:', EMAIL);
    console.log('Password:', PASSWORD);
    console.log('Children:', kidsData.map(kid => kid.name).join(', '));
    console.log('All activities have been enabled for the children.');
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('Error setting up test account:', error);
  }
}

// Run the setup function
setupTestAccount(); 