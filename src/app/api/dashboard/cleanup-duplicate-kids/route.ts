import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { Kid } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Starting duplicate kid cleanup for user: ${email}`);
    const adminClient = createServerSupabaseClient();

    // --- 1. Find Parent --- 
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (parentError || !parentData) {
      console.error('Cleanup Error: Finding parent failed', parentError);
      return NextResponse.json({ error: 'Parent not found or error fetching parent' }, { status: parentError ? 500 : 404 });
    }
    const parentId = parentData.id;
    console.log(`Cleanup: Found parent ID: ${parentId}`);

    // --- 2. Fetch All Kids for Parent --- 
    const { data: allKids, error: fetchKidsError } = await adminClient
      .from('kids')
      .select('id, name, created_at')
      .eq('parent_id', parentId)
      .order('name', { ascending: true })
      .order('created_at', { ascending: false }); // Newest first within each name group

    if (fetchKidsError) {
      console.error('Cleanup Error: Fetching kids failed', fetchKidsError);
      return NextResponse.json({ error: 'Failed to fetch kids data' }, { status: 500 });
    }

    if (!allKids || allKids.length === 0) {
        return NextResponse.json({ message: 'No kids found for this user, no cleanup needed.' });
    }
    console.log(`Cleanup: Found ${allKids.length} total kids for parent.`);

    // --- 3. Identify Duplicates to Delete --- 
    const kidsToDeleteIds: string[] = [];
    const kidsToKeep = new Map<string, string>(); // Map<name, latest_id>

    for (const kid of allKids) {
        if (!kidsToKeep.has(kid.name)) {
            // This is the first time we see this name, and since it's sorted newest first,
            // this is the one to keep.
            kidsToKeep.set(kid.name, kid.id);
            console.log(`Cleanup: Keeping kid ${kid.name} (ID: ${kid.id}, Created: ${kid.created_at})`);
        } else {
            // We already have a newer one for this name, mark this one for deletion.
            kidsToDeleteIds.push(kid.id);
             console.log(`Cleanup: Marking kid ${kid.name} (ID: ${kid.id}, Created: ${kid.created_at}) for deletion.`);
        }
    }

    // --- 4. Delete Associated Task Logs FIRST --- 
    let deletedLogCount = 0;
    if (kidsToDeleteIds.length > 0) {
        console.log(`Cleanup: Attempting to delete associated task logs for ${kidsToDeleteIds.length} duplicate kids...`);
        const { data: deletedLogs, error: deleteLogError } = await adminClient
            .from('task_logs')
            .delete()
            .in('kid_id', kidsToDeleteIds)
            .select('id'); // Select to count

        if (deleteLogError) {
            console.error('Cleanup Error: Deleting associated task logs failed', deleteLogError);
            // If logs can't be deleted, we can't delete the kids. Stop here.
            return NextResponse.json({ 
                message: `Found ${kidsToDeleteIds.length} duplicates but failed to delete associated task logs. Cannot delete kids.`, 
                error: deleteLogError.message 
            }, { status: 500 });
        }
        deletedLogCount = deletedLogs?.length || 0;
        console.log(`Cleanup: Successfully deleted ${deletedLogCount} associated task logs.`);
    } else {
        console.log('Cleanup: No duplicates found, skipping task log deletion.');
    }

    // --- 5. Delete Duplicate Kids --- 
    let deletedKidCount = 0;
    if (kidsToDeleteIds.length > 0) {
      console.log(`Cleanup: Attempting to delete ${kidsToDeleteIds.length} duplicate kids...`);
      const { data: deleteData, error: deleteError } = await adminClient
        .from('kids')
        .delete()
        .in('id', kidsToDeleteIds)
        .select('id'); 

      if (deleteError) {
        console.error('Cleanup Error: Deleting duplicate kids failed (after deleting logs)', deleteError);
        return NextResponse.json({ 
            message: `Deleted associated logs, but failed to delete the duplicate kids themselves.`, 
            error: deleteError.message 
        }, { status: 500 });
      } 
      deletedKidCount = deleteData?.length || 0;
      console.log(`Cleanup: Successfully deleted ${deletedKidCount} duplicate kids.`);
    } else {
        // This case shouldn't be reached if logs were deleted, but included for completeness
        console.log('Cleanup: No duplicate kids to delete.');
    }

    return NextResponse.json({
      message: `Duplicate cleanup complete for ${email}. Removed ${deletedKidCount} duplicate kid entries and ${deletedLogCount} associated task logs.`, 
      deletedKids: deletedKidCount,
      deletedLogs: deletedLogCount
    });

  } catch (error: any) {
    console.error('Cleanup Error: Unexpected error', error);
    return NextResponse.json({ error: 'An unexpected error occurred during cleanup', details: error.message }, { status: 500 });
  }
} 