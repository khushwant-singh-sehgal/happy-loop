import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get email from query string
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    console.log(`Verifying kids for user with email: ${email}`);
    
    // Create admin client to bypass RLS
    const adminClient = createServerSupabaseClient();
    
    // First find the parent by email
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();
    
    if (parentError) {
      console.error('Error finding parent:', parentError);
      return NextResponse.json(
        { error: 'Failed to find parent record' },
        { status: 500 }
      );
    }
    
    if (!parentData) {
      return NextResponse.json(
        { error: 'No parent found with this email' },
        { status: 404 }
      );
    }
    
    console.log(`Found parent: ${parentData.name} (${parentData.id})`);
    
    // Now get all kids for this parent
    const { data: kidsData, error: kidsError } = await adminClient
      .from('kids')
      .select('*')
      .eq('parent_id', parentData.id);
    
    if (kidsError) {
      console.error('Error fetching kids:', kidsError);
      return NextResponse.json(
        { error: 'Failed to fetch kids' },
        { status: 500 }
      );
    }
    
    console.log(`Found ${kidsData.length} kids for parent ${parentData.name}`);
    
    return NextResponse.json({
      parent: parentData,
      kids: kidsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error verifying kids:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 