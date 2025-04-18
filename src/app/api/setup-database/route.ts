import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// WARNING: This endpoint should only be called once for initial setup
// and then removed or disabled in production
export async function GET(request: NextRequest) {
  try {
    const adminClient = createServerSupabaseClient();
    
    // Create the parents table if it doesn't exist
    const { error: parentTableError } = await adminClient
      .from('parents')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'setup@example.com',
        name: 'Setup User'
      })
      .select()
      .maybeSingle();
    
    if (parentTableError && !parentTableError.message.includes('duplicate key')) {
      // Table might not exist, let's create it
      const { error } = await adminClient.rpc('create_parents_table', {});
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    
    // Create the kids table if it doesn't exist
    const { error: kidsTableError } = await adminClient
      .from('kids')
      .select('id')
      .limit(1);
    
    if (kidsTableError && kidsTableError.message.includes('relation "kids" does not exist')) {
      // Table doesn't exist, let's create it
      const { error } = await adminClient.rpc('create_kids_table', {});
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    
    // Create the kid_tasks table if it doesn't exist
    const { error: kidTasksTableError } = await adminClient
      .from('kid_tasks')
      .select('kid_id')
      .limit(1);
    
    if (kidTasksTableError && kidTasksTableError.message.includes('relation "kid_tasks" does not exist')) {
      // Table doesn't exist, let's create it directly with SQL
      const { error: sqlError } = await adminClient.rpc('create_kid_tasks_table', {});
      
      if (sqlError) {
        // Alternative approach if RPC doesn't exist
        console.error('Error creating kid_tasks table:', sqlError);
        return NextResponse.json({ 
          error: 'Could not create kid_tasks table. Please run the SQL script manually.',
          sqlScript: `
            CREATE TABLE IF NOT EXISTS kid_tasks (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
              task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(kid_id, task_id)
            );
            
            ALTER TABLE kid_tasks ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY kid_tasks_user_policy ON kid_tasks
              FOR ALL USING (
                EXISTS (
                  SELECT 1 FROM kids
                  WHERE kids.id = kid_tasks.kid_id
                  AND kids.parent_id = auth.uid()
                )
              );
          `
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database check completed. Please set up RLS policies in the Supabase dashboard SQL editor using the SQL script in src/db/schema.sql' 
    });
  } catch (error: any) {
    console.error('Unexpected error checking database:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please run the SQL in the Supabase dashboard SQL editor.' },
      { status: 500 }
    );
  }
} 