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

async function setupTestAccount() {
  const email = 'parent@example.com';
  const password = 'Password123!';
  
  try {
    console.log(`Setting up test account: ${email}`);
    
    // 1. Create user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });
    
    if (userError) {
      throw userError;
    }
    
    const userId = userData.user.id;
    console.log(`Created user with ID: ${userId}`);
    
    // 2. Add children
    const children = [
      { name: 'Alex', age: 8, avatar: '👦', parent_id: userId, points: 0, streak: 0 },
      { name: 'Emma', age: 6, avatar: '👧', parent_id: userId, points: 0, streak: 0 }
    ];
    
    const { data: kidsData, error: kidsError } = await supabase
      .from('kids')
      .insert(children)
      .select();
    
    if (kidsError) {
      throw kidsError;
    }
    
    console.log(`Added ${kidsData.length} children to account`);
    
    // 3. Get all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      throw tasksError;
    }
    
    if (tasks.length === 0) {
      console.log('No tasks found. Creating sample tasks...');
      
      // Create sample tasks if none exist
      const sampleTasks = [
        { name: 'Brush Teeth', description: 'Brush teeth in the morning and evening', icon: '🦷', points: 10, frequency: 'daily', verification_type: 'photo' },
        { name: 'Make Bed', description: 'Make your bed in the morning', icon: '🛏️', points: 5, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Reading', description: 'Read a book for 20 minutes', icon: '📚', points: 15, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Homework', description: 'Complete all homework assignments', icon: '✏️', points: 20, frequency: 'weekday', verification_type: 'photo' },
        { name: 'Clean Room', description: 'Tidy up your room', icon: '🧹', points: 15, frequency: 'weekly', verification_type: 'photo' },
        { name: 'Physical Activity', description: 'Play outside or exercise for 30 minutes', icon: '🏃‍♂️', points: 15, frequency: 'daily', verification_type: 'video' }
      ];
      
      const { data: createdTasks, error: createTasksError } = await supabase
        .from('tasks')
        .insert(sampleTasks)
        .select();
      
      if (createTasksError) {
        throw createTasksError;
      }
      
      console.log(`Created ${createdTasks.length} sample tasks`);
      
      // Use the created tasks for assignment
      tasks.push(...createdTasks);
    }
    
    // 4. Assign all tasks to each child
    let assignmentCount = 0;
    
    for (const kid of kidsData) {
      const kidTaskAssignments = tasks.map(task => ({
        kid_id: kid.id,
        task_id: task.id
      }));
      
      const { data: assignments, error: assignmentError } = await supabase
        .from('kid_tasks')
        .insert(kidTaskAssignments);
      
      if (assignmentError) {
        throw assignmentError;
      }
      
      assignmentCount += tasks.length;
    }
    
    console.log(`Assigned ${assignmentCount} tasks to children`);
    
    console.log('\nTest account setup successfully complete!');
    console.log('----------------------------------------');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Children:', children.map(c => c.name).join(', '));
    console.log('All activities have been enabled for the children.');
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('Error setting up test account:', error);
    
    // Check if user already exists
    if (error.code === '23505' || error.message?.includes('already exists')) {
      console.log('\nUser already exists. You can log in with:');
      console.log('Email:', email);
      console.log('Password:', password);
    }
  }
}

setupTestAccount(); 