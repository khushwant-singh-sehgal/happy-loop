// Script to verify user authentication and data access
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  process.exit(1);
}

// Create clients
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Email to check
const EMAIL = 'parent@example.com';
const PASSWORD = 'Password123!';

async function verifyUserData() {
  console.log('=== User Authentication and Data Access Verification ===\n');
  
  try {
    // 1. First check if the user exists
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error listing users: ${userError.message}`);
    }
    
    const user = userData.users.find(u => u.email === EMAIL);
    
    if (!user) {
      throw new Error(`User with email ${EMAIL} not found`);
    }
    
    console.log('✅ User exists in auth system');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log('');
    
    // 2. Check parent entry in database
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (parentError) {
      throw new Error(`Error fetching parent data: ${parentError.message}`);
    }
    
    if (!parentData) {
      console.log('❌ No parent entry found in database');
      console.log('   Creating parent entry...');
      
      const { error: insertError } = await adminClient
        .from('parents')
        .insert([{ id: user.id, email: EMAIL, name: 'Recovered Parent' }]);
      
      if (insertError) {
        throw new Error(`Error creating parent entry: ${insertError.message}`);
      }
      
      console.log('✅ Parent entry created successfully');
    } else {
      console.log('✅ Parent entry exists in database');
      console.log(`   Name: ${parentData.name}`);
    }
    console.log('');
    
    // 3. Check kids in database
    const { data: kidsData, error: kidsError } = await adminClient
      .from('kids')
      .select('*')
      .eq('parent_id', user.id);
    
    if (kidsError) {
      throw new Error(`Error fetching kids data: ${kidsError.message}`);
    }
    
    if (!kidsData || kidsData.length === 0) {
      console.log('❌ No kids found for this parent');
      console.log('   Creating sample kids...');
      
      const sampleKids = [
        { name: 'Alex', age: 8, avatar: '👦', parent_id: user.id, points: 0, streak: 0 },
        { name: 'Emma', age: 6, avatar: '👧', parent_id: user.id, points: 0, streak: 0 }
      ];
      
      const { data: newKids, error: insertKidsError } = await adminClient
        .from('kids')
        .insert(sampleKids)
        .select();
      
      if (insertKidsError) {
        throw new Error(`Error creating sample kids: ${insertKidsError.message}`);
      }
      
      console.log(`✅ ${newKids.length} sample kids created successfully`);
      
      // Use the newly created kids for further checks
      kidsData = newKids;
    } else {
      console.log(`✅ Found ${kidsData.length} kids for this parent`);
      kidsData.forEach((kid, index) => {
        console.log(`   ${index + 1}. ${kid.name} (${kid.avatar}), Age: ${kid.age}, Points: ${kid.points}`);
      });
    }
    console.log('');
    
    // 4. Check tasks
    const { data: tasksData, error: tasksError } = await adminClient
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      throw new Error(`Error fetching tasks: ${tasksError.message}`);
    }
    
    if (!tasksData || tasksData.length === 0) {
      console.log('❌ No tasks found in the database');
    } else {
      console.log(`✅ Found ${tasksData.length} tasks in the database`);
    }
    console.log('');
    
    // 5. Check task assignments
    for (const kid of kidsData) {
      const { data: assignments, error: assignmentsError } = await adminClient
        .from('kid_tasks')
        .select('task_id')
        .eq('kid_id', kid.id);
      
      if (assignmentsError) {
        console.log(`❌ Error fetching task assignments for ${kid.name}: ${assignmentsError.message}`);
        continue;
      }
      
      if (!assignments || assignments.length === 0) {
        console.log(`❌ No tasks assigned to ${kid.name}`);
        
        if (tasksData && tasksData.length > 0) {
          console.log(`   Assigning tasks to ${kid.name}...`);
          
          const taskAssignments = tasksData.map(task => ({
            kid_id: kid.id,
            task_id: task.id
          }));
          
          const { error: assignError } = await adminClient
            .from('kid_tasks')
            .insert(taskAssignments);
          
          if (assignError) {
            console.log(`❌ Error assigning tasks: ${assignError.message}`);
          } else {
            console.log(`✅ Successfully assigned ${tasksData.length} tasks to ${kid.name}`);
          }
        }
      } else {
        console.log(`✅ ${kid.name} has ${assignments.length} tasks assigned`);
      }
    }
    console.log('');
    
    // 6. Test regular client access
    console.log('Testing regular client access (as a browser would)...');
    
    // Sign in with regular client
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD
    });
    
    if (signInError) {
      throw new Error(`Error signing in with regular client: ${signInError.message}`);
    }
    
    console.log('✅ Successfully signed in with regular client');
    
    // Fetch kids with regular client
    const { data: clientKidsData, error: clientKidsError } = await anonClient
      .from('kids')
      .select('*');
    
    if (clientKidsError) {
      throw new Error(`Error fetching kids with regular client: ${clientKidsError.message}`);
    }
    
    if (!clientKidsData || clientKidsData.length === 0) {
      console.log('❌ No kids found when using regular client - suggests RLS issue');
    } else {
      console.log(`✅ Successfully fetched ${clientKidsData.length} kids with regular client`);
      clientKidsData.forEach((kid, index) => {
        console.log(`   ${index + 1}. ${kid.name} (${kid.avatar}), Age: ${kid.age}`);
      });
    }
    
    console.log('\n=== Verification Complete ===');
    console.log('Login credentials:');
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

verifyUserData(); 