// Script to verify kids in the database for a specific user
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

// Email to check
const EMAIL = 'parent@example.com';

async function verifyKids() {
  try {
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
    
    // 2. Check the parents table
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (parentError) {
      throw parentError;
    }
    
    if (!parentData) {
      console.log(`WARNING: No parent entry found for user ID: ${userId}`);
    } else {
      console.log(`Parent entry found: ${JSON.stringify(parentData)}`);
    }
    
    // 3. Check kids associated with this parent
    const { data: kidsData, error: kidsError } = await supabase
      .from('kids')
      .select('*')
      .eq('parent_id', userId);
    
    if (kidsError) {
      throw kidsError;
    }
    
    if (!kidsData || kidsData.length === 0) {
      console.log(`No kids found for parent ID: ${userId}`);
    } else {
      console.log(`Found ${kidsData.length} kids for parent ID: ${userId}:`);
      kidsData.forEach(kid => {
        console.log(`- ${kid.name} (ID: ${kid.id}), Avatar: ${kid.avatar}`);
      });
    }
    
    // 4. Test fetching with a standard client (non-admin) to check RLS
    console.log("\nTesting fetch with standard client (to simulate frontend):");
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: EMAIL,
      password: 'Password123!'
    });
    
    if (signInError) {
      console.log(`Error signing in with standard client: ${signInError.message}`);
    } else {
      console.log(`Signed in as ${EMAIL} successfully`);
      
      // Try to fetch kids with the authenticated client
      const { data: clientKidsData, error: clientKidsError } = await anonClient
        .from('kids')
        .select('*');
      
      if (clientKidsError) {
        console.log(`Error fetching kids with standard client: ${clientKidsError.message}`);
      } else if (!clientKidsData || clientKidsData.length === 0) {
        console.log(`No kids found when fetching with standard client - RLS might be blocking access`);
      } else {
        console.log(`Found ${clientKidsData.length} kids with standard client`);
        clientKidsData.forEach(kid => {
          console.log(`- ${kid.name} (ID: ${kid.id}), Parent ID: ${kid.parent_id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error verifying kids:', error);
  }
}

verifyKids(); 