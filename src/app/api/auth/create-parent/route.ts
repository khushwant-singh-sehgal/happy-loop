import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const { userId, email, name } = await request.json();

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createServerSupabaseClient();

    // Insert parent record
    const { data, error } = await adminClient
      .from('parents')
      .insert([{ id: userId, email, name }])
      .select();

    if (error) {
      console.error('Error creating parent profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error creating parent:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 