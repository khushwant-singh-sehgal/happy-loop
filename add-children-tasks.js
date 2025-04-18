// This script adds children and assigns tasks for an existing user
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
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

// Email of the existing user
const EMAIL = 'parent@example.com';

async function addChildrenAndTasks() {
  try {
    console.log(`Setting up children and tasks for: ${EMAIL}`);
    
    // 1. Get user ID using email
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }
    
    const existingUser = usersData.users.find(u => u.email === EMAIL);
    
    if (!existingUser) {
      throw new Error(`User with email ${EMAIL} not found`);
    }
    
    const userId = existingUser.id;
    console.log(`Found user with ID: ${userId}`);
    
    // 2. Ensure parent entry exists
    const { data: existingParent, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (parentError) {
      throw parentError;
    }
    
    if (!existingParent) {
      // Create parent entry
      const { error: insertParentError } = await supabase
        .from('parents')
        .insert([{ id: userId, email: EMAIL, name: 'Test Parent' }]);
      
      if (insertParentError) {
        throw insertParentError;
      }
      
      console.log(`Created parent entry for user: ${userId}`);
    } else {
      console.log(`Parent entry already exists for user: ${userId}`);
    }
    
    // 3. Add children if they don't exist
    const { data: existingKids, error: kidsError } = await supabase
      .from('kids')
      .select('*')
      .eq('parent_id', userId);
    
    if (kidsError) {
      throw kidsError;
    }
    
    let kidsToUse = existingKids || [];
    
    if (kidsToUse.length === 0) {
      // Add children
      const newKids = [
        { name: 'Alex', age: 8, avatar: '👦', parent_id: userId, points: 0, streak: 0 },
        { name: 'Emma', age: 6, avatar: '👧', parent_id: userId, points: 0, streak: 0 }
      ];
      
      const { data: insertedKids, error: insertKidsError } = await supabase
        .from('kids')
        .insert(newKids)
        .select();
      
      if (insertKidsError) {
        throw insertKidsError;
      }
      
      kidsToUse = insertedKids;
      console.log(`Added ${insertedKids.length} children`);
    } else {
      console.log(`Found ${kidsToUse.length} existing children`);
    }
    
    // 4. Get or create tasks
    const { data: existingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      throw tasksError;
    }
    
    let tasksToUse = existingTasks || [];
    
    if (tasksToUse.length === 0) {
      // Add sample tasks
      const sampleTasks = [
        { name: 'Brush Teeth', description: 'Brush teeth in the morning and evening', icon: '🦷', points: 10, frequency: 'daily', verification_type: 'photo' },
        { name: 'Make Bed', description: 'Make your bed in the morning', icon: '🛏️', points: 5, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Reading', description: 'Read a book for 20 minutes', icon: '📚', points: 15, frequency: 'daily', verification_type: 'checkbox' },
        { name: 'Homework', description: 'Complete all homework assignments', icon: '✏️', points: 20, frequency: 'weekday', verification_type: 'photo' },
        { name: 'Clean Room', description: 'Tidy up your room', icon: '🧹', points: 15, frequency: 'weekly', verification_type: 'photo' },
        { name: 'Physical Activity', description: 'Play outside or exercise for 30 minutes', icon: '🏃‍♂️', points: 15, frequency: 'daily', verification_type: 'video' }
      ];
      
      const { data: insertedTasks, error: insertTasksError } = await supabase
        .from('tasks')
        .insert(sampleTasks)
        .select();
      
      if (insertTasksError) {
        throw insertTasksError;
      }
      
      tasksToUse = insertedTasks;
      console.log(`Added ${insertedTasks.length} sample tasks`);
    } else {
      console.log(`Found ${tasksToUse.length} existing tasks`);
    }
    
    // 5. Assign tasks to children
    for (const kid of kidsToUse) {
      // Check existing assignments
      const { data: existingAssignments, error: assignmentsError } = await supabase
        .from('kid_tasks')
        .select('task_id')
        .eq('kid_id', kid.id);
      
      if (assignmentsError) {
        throw assignmentsError;
      }
      
      const existingTaskIds = (existingAssignments || []).map(a => a.task_id);
      const tasksToAssign = tasksToUse.filter(t => !existingTaskIds.includes(t.id));
      
      if (tasksToAssign.length === 0) {
        console.log(`All tasks already assigned to child ${kid.name}`);
        continue;
      }
      
      // Create assignments
      const newAssignments = tasksToAssign.map(task => ({
        kid_id: kid.id,
        task_id: task.id
      }));
      
      const { error: insertAssignmentsError } = await supabase
        .from('kid_tasks')
        .insert(newAssignments);
      
      if (insertAssignmentsError) {
        throw insertAssignmentsError;
      }
      
      console.log(`Assigned ${tasksToAssign.length} tasks to child ${kid.name}`);
    }
    
    console.log('\nSetup completed successfully!');
    console.log('----------------------------------------');
    console.log('Login email:', EMAIL);
    console.log('Login password: Password123!');
    console.log('Children:', kidsToUse.map(kid => kid.name).join(', '));
    console.log('All activities have been enabled for the children.');
    console.log('----------------------------------------');
    
  } catch (error) {
    console.error('Error setting up children and tasks:', error);
  }
}

addChildrenAndTasks(); 