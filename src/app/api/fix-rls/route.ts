import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting RLS fix process');
    
    // Create admin client to bypass RLS
    const adminClient = createServerSupabaseClient();
    
    // Check if we have access to run SQL
    try {
      // First check if RLS is enabled on the kids table
      const { data: rlsStatus, error: rlsError } = await adminClient.rpc('check_rls_status', {
        table_name: 'kids'
      });
      
      console.log('RLS status check result:', rlsStatus, rlsError);
      
      // Fix RLS for the kids table
      const { error: kidsPolicyError } = await adminClient.rpc('fix_kids_rls_policy');
      
      if (kidsPolicyError) {
        console.error('Error fixing kids RLS policy:', kidsPolicyError);
        return NextResponse.json({
          message: 'Failed to fix kids RLS policy',
          error: kidsPolicyError.message
        }, { status: 500 });
      }
      
      // Fix RLS for the parents table
      const { error: parentsPolicyError } = await adminClient.rpc('fix_parents_rls_policy');
      
      if (parentsPolicyError) {
        console.error('Error fixing parents RLS policy:', parentsPolicyError);
        return NextResponse.json({
          message: 'Failed to fix parents RLS policy',
          error: parentsPolicyError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({
        message: 'RLS policies fixed successfully',
        success: true
      });
    } catch (sqlError) {
      console.error('No direct SQL access, attempting alternative approach:', sqlError);
      
      // Create or replace the stored procedures if we have permission
      const createRLSCheckFunction = `
        CREATE OR REPLACE FUNCTION public.check_rls_status(table_name text)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result jsonb;
        BEGIN
          EXECUTE format('
            SELECT jsonb_build_object(
              ''table'', %L,
              ''rls_enabled'', has_table_privilege(''authenticated'', %L, ''SELECT''),
              ''policies'', (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    ''name'', policyname,
                    ''action'', operation
                  )
                )
                FROM pg_policies
                WHERE tablename = %L
              )
            )
          ', table_name, table_name, table_name) INTO result;
          
          RETURN result;
        END;
        $$;
      `;
      
      const createKidsRLSFixFunction = `
        CREATE OR REPLACE FUNCTION public.fix_kids_rls_policy()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Enable RLS on kids table
          ALTER TABLE public.kids ENABLE ROW LEVEL SECURITY;
          
          -- Drop any existing policies
          DROP POLICY IF EXISTS kids_select_policy ON public.kids;
          DROP POLICY IF EXISTS kids_insert_policy ON public.kids;
          DROP POLICY IF EXISTS kids_update_policy ON public.kids;
          DROP POLICY IF EXISTS kids_delete_policy ON public.kids;
          
          -- Create policies
          CREATE POLICY kids_select_policy ON public.kids
            FOR SELECT USING (auth.uid() = parent_id);
            
          CREATE POLICY kids_insert_policy ON public.kids
            FOR INSERT WITH CHECK (auth.uid() = parent_id);
            
          CREATE POLICY kids_update_policy ON public.kids
            FOR UPDATE USING (auth.uid() = parent_id);
            
          CREATE POLICY kids_delete_policy ON public.kids
            FOR DELETE USING (auth.uid() = parent_id);
        END;
        $$;
      `;
      
      const createParentsRLSFixFunction = `
        CREATE OR REPLACE FUNCTION public.fix_parents_rls_policy()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Enable RLS on parents table
          ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
          
          -- Drop any existing policies
          DROP POLICY IF EXISTS parents_select_policy ON public.parents;
          DROP POLICY IF EXISTS parents_insert_policy ON public.parents;
          DROP POLICY IF EXISTS parents_update_policy ON public.parents;
          DROP POLICY IF EXISTS parents_delete_policy ON public.parents;
          
          -- Create policies
          CREATE POLICY parents_select_policy ON public.parents
            FOR SELECT USING (auth.uid() = id);
            
          CREATE POLICY parents_insert_policy ON public.parents
            FOR INSERT WITH CHECK (auth.uid() = id);
            
          CREATE POLICY parents_update_policy ON public.parents
            FOR UPDATE USING (auth.uid() = id);
            
          CREATE POLICY parents_delete_policy ON public.parents
            FOR DELETE USING (auth.uid() = id);
        END;
        $$;
      `;
      
      // Create the functions
      const { error: createFuncError1 } = await adminClient.rpc('exec_sql', { 
        sql: createRLSCheckFunction 
      });
      
      const { error: createFuncError2 } = await adminClient.rpc('exec_sql', { 
        sql: createKidsRLSFixFunction 
      });
      
      const { error: createFuncError3 } = await adminClient.rpc('exec_sql', { 
        sql: createParentsRLSFixFunction 
      });
      
      if (createFuncError1 || createFuncError2 || createFuncError3) {
        console.error('Error creating RLS fix functions:', 
          createFuncError1, createFuncError2, createFuncError3);
        
        return NextResponse.json({
          message: 'Limited permissions, could not create RLS fix functions',
          errors: [createFuncError1, createFuncError2, createFuncError3]
            .filter(Boolean)
            .map(e => e?.message || 'Unknown error')
        }, { status: 403 });
      }
      
      // Execute the functions
      const { error: execError1 } = await adminClient.rpc('fix_kids_rls_policy');
      const { error: execError2 } = await adminClient.rpc('fix_parents_rls_policy');
      
      if (execError1 || execError2) {
        console.error('Error executing RLS fix functions:', execError1, execError2);
        return NextResponse.json({
          message: 'Failed to apply RLS policies',
          errors: [execError1, execError2]
            .filter(Boolean)
            .map(e => e?.message || 'Unknown error')
        }, { status: 500 });
      }
      
      return NextResponse.json({
        message: 'RLS policies fixed successfully using custom approach',
        success: true
      });
    }
    
  } catch (error) {
    console.error('Unexpected error fixing RLS:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 