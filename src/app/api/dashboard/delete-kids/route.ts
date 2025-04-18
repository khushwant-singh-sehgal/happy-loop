import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // Get email from query string
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete kids for user with email: ${email}`);
    
    // Create admin client to bypass RLS
    const adminClient = createServerSupabaseClient();
    
    // 1. Find the parent by email
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (parentError) {
      console.error('Error finding parent:', parentError);
      return NextResponse.json(
        { error: 'Failed to find parent record', details: parentError.message },
        { status: 500 }
      );
    }
    
    if (!parentData) {
      return NextResponse.json(
        { error: 'No parent found with this email' },
        { status: 404 }
      );
    }
    
    const parentId = parentData.id;
    console.log(`Found parent ID: ${parentId} for email: ${email}`);
    
    // 2. Delete all kids associated with this parent ID
    const { data: deletedKids, error: deleteError } = await adminClient
      .from('kids')
      .delete()
      .eq('parent_id', parentId)
      .select(); // Optionally select the deleted records to see what was removed
      
    if (deleteError) {
      console.error('Error deleting kids:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete kids', details: deleteError.message },
        { status: 500 }
      );
    }
    
    const count = deletedKids?.length || 0;
    console.log(`Successfully deleted ${count} kids for parent ID: ${parentId}`);
    
    return NextResponse.json({
      message: `Successfully deleted ${count} kids for user ${email}`,
      deletedCount: count,
      // deletedKids: deletedKids // Uncomment to see the deleted records
    });
    
  } catch (error: any) {
    console.error('Unexpected error deleting kids:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
} 