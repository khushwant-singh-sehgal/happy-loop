import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { Task, Kid } from '@/lib/supabase'; // Assuming types are defined here

// Define the type required for inserting Task Logs locally
type TaskLogInsert = {
  kid_id: string;
  task_id: string;
  points_awarded: number;
  created_at: string; // This is the insertion timestamp
  date: string; // The date the task log is for
  parent_approved: boolean | null;
};

// Sample Task Definitions (if none exist) - Remove validation_required and enabled
const SAMPLE_TASKS = [
  { name: 'Brush Teeth', description: 'Morning and night', icon: '🦷', points: 5, frequency: 'daily' },
  { name: 'Make Bed', description: 'Every morning', icon: '🛏️', points: 10, frequency: 'daily' },
  { name: 'Homework', description: 'Complete assigned homework', icon: '📚', points: 25, frequency: 'daily' },
  { name: 'Clean Room', description: 'Tidy up room', icon: '🧹', points: 30, frequency: 'weekly' },
  { name: 'Feed Pet', description: 'Give food and water to pet', icon: '🐾', points: 15, frequency: 'daily' },
];

// Sample Kid Definitions (if none exist)
const SAMPLE_KIDS = [
    { name: 'Sample Kid 1', age: 8, avatar: '🤖' },
    { name: 'Sample Kid 2', age: 10, avatar: '🚀' },
];

// Helper function to get date N days ago
function getDateNDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(12, 0, 0, 0); // Set to midday to avoid timezone issues near midnight
    return date;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Starting data seeding for user: ${email}`);
    const adminClient = createServerSupabaseClient();

    // --- 1. Find Parent ---
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (parentError || !parentData) {
      console.error('Seeding Error: Finding parent failed', parentError);
      return NextResponse.json({ error: 'Parent not found or error fetching parent' }, { status: parentError ? 500 : 404 });
    }
    const parentId = parentData.id;
    console.log(`Seeding: Found parent ID: ${parentId}`);

    // --- 2. Fetch or Create Kids ---
    let { data: kids, error: fetchKidsError } = await adminClient
      .from('kids')
      .select('id, name')
      .eq('parent_id', parentId);

    if (fetchKidsError) {
        console.error('Seeding Error: Fetching kids failed', fetchKidsError);
        return NextResponse.json({ error: 'Failed to fetch kids data' }, { status: 500 });
    }

    if (!kids || kids.length === 0) {
        console.log(`Seeding: No kids found for parent ${parentId}. Creating sample kids...`);
        const kidsToInsert = SAMPLE_KIDS.map(k => ({ ...k, parent_id: parentId }));
        const { data: createdKids, error: createKidsError } = await adminClient
            .from('kids')
            .insert(kidsToInsert)
            .select('id, name');

        if (createKidsError || !createdKids) {
            console.error('Seeding Error: Creating sample kids failed', createKidsError);
            return NextResponse.json({ error: 'Failed to create sample kids' }, { status: 500 });
        }
        kids = createdKids;
        console.log(`Seeding: Created ${kids.length} sample kids.`);
    } else {
        console.log(`Seeding: Found ${kids.length} existing kids.`);
    }
    const kidIds = kids.map(k => k.id);

    // --- 3. Fetch or Create Tasks ---
    let { data: tasks, error: fetchTasksError } = await adminClient
        .from('tasks')
        // Remove validation_required from select
        .select('id, name, points')
        // Keep enabled filter commented out
        // .eq('enabled', true);

     if (fetchTasksError) {
        console.error('Seeding Error: Fetching tasks failed', fetchTasksError);
        return NextResponse.json({ error: 'Failed to fetch tasks data' }, { status: 500 });
    }

    // When creating tasks, they won't have validation_required or enabled either
    if (!tasks || tasks.length === 0) {
        console.log(`Seeding: No tasks found. Creating sample tasks...`);
        // SAMPLE_TASKS already updated
        const tasksToInsert = SAMPLE_TASKS;
        const { data: createdTasks, error: createTasksError } = await adminClient
            .from('tasks')
            .insert(tasksToInsert)
            // Remove validation_required from select
            .select('id, name, points');

        if (createTasksError || !createdTasks) {
            console.error('Seeding Error: Creating sample tasks failed', createTasksError);
            return NextResponse.json({ error: 'Failed to create sample tasks' }, { status: 500 });
        }
        tasks = createdTasks;
        console.log(`Seeding: Created ${tasks.length} sample tasks.`);
    } else {
         console.log(`Seeding: Found ${tasks.length} existing active tasks.`);
    }

    // --- 4. Clear Existing Task Logs for the Last 30 Days ---
    const thirtyDaysAgo = getDateNDaysAgo(30).toISOString();
    console.log(`Seeding: Clearing existing task logs since ${thirtyDaysAgo} for kids: ${kidIds.join(', ')}`);
    const { error: deleteLogError } = await adminClient
        .from('task_logs')
        .delete()
        .in('kid_id', kidIds)
        .gte('created_at', thirtyDaysAgo);

    if (deleteLogError) {
        console.error('Seeding Error: Deleting old task logs failed', deleteLogError);
        // Proceeding anyway, might result in duplicate logs for the period
    } else {
        console.log('Seeding: Successfully cleared recent task logs.');
    }

    // --- 5. Generate New Task Logs ---
    const taskLogsToInsert: TaskLogInsert[] = [];
    const today = new Date();
    let generatedLogCount = 0;

    for (let day = 0; day < 30; day++) {
        const logDate = getDateNDaysAgo(day);
        const logDateISO = logDate.toISOString();

        for (const kid of kids) {
            // Randomly assign 1 to 4 tasks per kid per day
            const taskCount = Math.floor(Math.random() * 4) + 1;
            const shuffledTasks = [...tasks].sort(() => 0.5 - Math.random()); // Shuffle tasks
            const tasksForDay = shuffledTasks.slice(0, taskCount);

            for (const task of tasksForDay) {
                 // Randomly decide if task was done (~70% chance)
                if (Math.random() < 0.7) {
                    // Logic now only needs to determine parent_approved status
                    let parent_approved_status: boolean | null = null;

                    if (Math.random() < 0.6) { // ~60% chance status is completed/approved
                        parent_approved_status = true;
                    } // else: remains null (pending)
                    
                    // Get the date parts
                    const logDate = getDateNDaysAgo(day);
                    const logDateISO = logDate.toISOString(); // Full ISO for created_at
                    const logDateYYYYMMDD = logDateISO.split('T')[0]; // Just date part for the date column

                    taskLogsToInsert.push({
                        kid_id: kid.id,
                        task_id: task.id,
                        points_awarded: task.points,
                        created_at: logDateISO, // Store full timestamp for creation time
                        date: logDateYYYYMMDD, // Store only YYYY-MM-DD for the date column
                        parent_approved: parent_approved_status,
                    });
                    generatedLogCount++;
                }
            }
        }
    }

    console.log(`Seeding: Generated ${generatedLogCount} task log entries to insert.`);

    // Restore the rest of the function logic
    if (taskLogsToInsert.length > 0) {
        const { error: insertLogError } = await adminClient
            .from('task_logs')
            .insert(taskLogsToInsert);

        if (insertLogError) {
            console.error('Seeding Error: Inserting task logs failed', insertLogError);
            return NextResponse.json({ error: 'Failed to insert task logs', details: insertLogError.message }, { status: 500 });
        }
        console.log('Seeding: Successfully inserted task logs.');
    } else {
        console.log('Seeding: No task logs were generated to insert.');
    }

    return NextResponse.json({
      message: `Data seeding complete for ${email}. Processed ${kids.length} kids and ${tasks.length} tasks. Generated ${generatedLogCount} task logs over the last 30 days.`,
      kidsProcessed: kids.length,
      tasksFound: tasks.length,
      logsGenerated: generatedLogCount
    });

  } catch (error: any) {
    console.error('Seeding Error: Unexpected error', error);
    return NextResponse.json({ error: 'An unexpected error occurred during seeding', details: error.message }, { status: 500 });
  }
}