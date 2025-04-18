import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Received add-child request');
    
    // Parse request data
    const { parent_id, name, age, avatar, points, streak, email, parent_name } = await request.json();
    console.log('Request data:', { parent_id, name, age, avatar, email, parent_name });

    if (!parent_id || !name || !age || !avatar) {
      console.error('Missing required fields:', { parent_id, name, age, avatar });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createServerSupabaseClient();
    console.log('Created server Supabase client');

    // First check if the parent exists
    const { data: parentData, error: parentCheckError } = await adminClient
      .from('parents')
      .select('id')
      .eq('id', parent_id)
      .maybeSingle();
    
    if (parentCheckError) {
      console.error('Error checking parent existence:', parentCheckError);
      return NextResponse.json(
        { error: 'Failed to check parent record: ' + parentCheckError.message },
        { status: 500 }
      );
    }
    
    console.log('Parent check result:', parentData);
    
    // If parent doesn't exist, we need to create it first
    if (!parentData) {
      console.log('Parent does not exist, creating parent record first');
      
      // Create parent record with available info
      const { data: newParent, error: createParentError } = await adminClient
        .from('parents')
        .insert({
          id: parent_id,
          email: email || 'parent@example.com',  // Use provided email or fallback
          name: parent_name || 'Parent User'     // Use provided name or fallback
        })
        .select();
      
      if (createParentError) {
        console.error('Error creating parent:', createParentError);
        return NextResponse.json(
          { error: 'Failed to create parent record: ' + createParentError.message },
          { status: 500 }
        );
      }
      
      console.log('Created new parent record:', newParent);
    }

    // Now insert the child record
    console.log('Inserting child record with data:', { 
      parent_id, 
      name, 
      age, 
      avatar, 
      points: points || 0, 
      streak: streak || 0 
    });
    
    const { data, error } = await adminClient
      .from('kids')
      .insert([{ 
        parent_id, 
        name, 
        age, 
        avatar, 
        points: points || 0, 
        streak: streak || 0 
      }])
      .select();

    if (error) {
      console.error('Error creating child:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Successfully created child:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error creating child:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 