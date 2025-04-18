import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Kid, Task, TaskLog, MediaUpload } from '@/lib/supabase';

// Helper function for random number
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get a placeholder image URL
function getPlaceholderImageUrl(width = 300, height = 200): string {
  // Simple placeholder service
  return `https://placehold.co/${width}x${height}/EEE/31343C?text=Evidence`; 
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Populating sample data for user: ${email}`);
    const adminClient = createServerSupabaseClient();

    // --- 1. Find Parent --- 
    const { data: parentData, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (parentError || !parentData) {
      console.error('Error finding parent:', parentError);
      return NextResponse.json({ error: 'Parent not found or error fetching parent' }, { status: parentError ? 500 : 404 });
    }
    const parentId = parentData.id;
    console.log(`Found parent ID: ${parentId}`);

    // --- 2. Define and Add Children --- 
    const childrenToAdd = [
      { name: 'Sukhnaaz kaur', age: 7, avatar: '👧' },
      { name: 'Sehajpreet Kaur', age: 12, avatar: '👦' } 
    ];
    const createdKids: Kid[] = [];

    for (const child of childrenToAdd) {
      const { data: newKid, error: insertKidError } = await adminClient
        .from('kids')
        .insert({ 
          parent_id: parentId, 
          name: child.name, 
          age: child.age, 
          avatar: child.avatar, 
          points: 0, // Points will be updated later based on logs
          streak: 0 
        })
        .select()
        .single();
      
      if (insertKidError) {
        console.error(`Error adding child ${child.name}:`, insertKidError);
      } else if (newKid) {
        console.log(`Added child: ${newKid.name} (ID: ${newKid.id})`);
        createdKids.push(newKid as Kid);
      }
    }

    if (createdKids.length === 0) {
      return NextResponse.json({ error: 'Failed to add any children' }, { status: 500 });
    }

    // --- 3. Fetch Available Tasks --- 
    const { data: availableTasks, error: taskError } = await adminClient
      .from('tasks')
      .select('*');

    if (taskError || !availableTasks || availableTasks.length === 0) {
      console.error('Error fetching tasks or no tasks available:', taskError);
      return NextResponse.json({ error: 'Could not fetch tasks to generate logs' }, { status: 500 });
    }
    console.log(`Fetched ${availableTasks.length} tasks.`);
    const taskMap = new Map<string, Task>(availableTasks.map(task => [task.id, task]));

    // --- 3b. Ensure Sample Rewards Exist --- 
    const { data: existingRewards, error: rewardCheckError } = await adminClient
        .from('rewards')
        .select('id')
        .limit(1);

    if (rewardCheckError) {
        console.error('Error checking for existing rewards:', rewardCheckError);
        // Continue even if check fails, might be a permission issue
    } else if (!existingRewards || existingRewards.length === 0) {
        console.log('No rewards found, adding sample rewards...');
        const sampleRewardsToAdd = [
            { name: 'Extra Screen Time', description: '30 minutes extra screen time', image: '📱', point_cost: 50, available: true },
            { name: 'Small Toy', description: 'Choose a small toy from the shop', image: '🧸', point_cost: 100, available: true },
            { name: 'Book Voucher', description: '$10 book voucher', image: '📚', point_cost: 150, available: true },
            { name: 'Movie Night Choice', description: 'Choose the movie for family night', image: '🎬', point_cost: 75, available: true },
        ];
        const { error: insertRewardError } = await adminClient
            .from('rewards')
            .insert(sampleRewardsToAdd);

        if (insertRewardError) {
            console.error('Error adding sample rewards:', insertRewardError);
        } else {
            console.log(`Added ${sampleRewardsToAdd.length} sample rewards.`);
        }
    }

    // --- 3c. Assign All Tasks to New Kids --- 
    console.log('Assigning tasks to newly created kids...');
    for (const kid of createdKids) {
        const assignments = availableTasks.map(task => ({ kid_id: kid.id, task_id: task.id }));
        const { error: assignError } = await adminClient
            .from('kid_tasks')
            .insert(assignments);
        
        if (assignError) {
            console.error(`Error assigning tasks to kid ${kid.id}:`, assignError);
            // Log error but continue, maybe some assignments worked
        } else {
            console.log(`Assigned ${assignments.length} tasks to kid ${kid.id}`);
        }
    }

    // --- 4. Generate and Insert Sample Task Logs & Media --- 
    const today = new Date();
    const startDate = subDays(today, 29); // Last 30 days
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    const kidPoints: Record<string, number> = {};
    const kidStreaks: Record<string, { current: number, lastDate: string | null }> = {};
    let totalLogsGenerated = 0;
    let totalMediaGenerated = 0;

    createdKids.forEach(kid => {
        kidPoints[kid.id] = 0;
        kidStreaks[kid.id] = { current: 0, lastDate: null };
    });

    for (const date of dateRange) {
      const dateStr = format(date, 'yyyy-MM-dd');
      let kidsActiveToday = false;

      for (const kid of createdKids) {
        let kidActiveThisDay = false;
        if (Math.random() < 0.7) { // ~70% chance of activity
          kidActiveThisDay = true;
          kidsActiveToday = true;
          const tasksToCompleteCount = getRandomInt(2, 5);
          const shuffledTasks = [...availableTasks].sort(() => 0.5 - Math.random());
          const tasksForToday = shuffledTasks.slice(0, tasksToCompleteCount);
          const logsForThisBatch: Omit<TaskLog, 'id' | 'created_at'>[] = [];
          const mediaForThisBatch: Omit<MediaUpload, 'id' | 'created_at'>[] = [];
          let tempLogMediaLink: { logIndex: number, media_id: string }[] = [];

          for (const task of tasksForToday) {
            const points = task.points;
            const aiValidated = Math.random() < 0.8;
            let parentApproved: boolean | null = null;
            const approvalRand = Math.random();
            if (aiValidated && approvalRand < 0.6) parentApproved = true;
            else if (aiValidated && approvalRand < 0.7) parentApproved = false;

            const pointsAwarded = parentApproved === true ? points : 0;
            kidPoints[kid.id] += pointsAwarded; // Add points

            let currentMediaId: string | null = null;
            if (!parentApproved && Math.random() < 0.2) {
              currentMediaId = crypto.randomUUID();
              // Prepare media record but don't link task_log_id yet
              mediaForThisBatch.push({
                task_log_id: "", // Placeholder
                storage_path: getPlaceholderImageUrl(),
                type: 'image',
                thumbnail_path: getPlaceholderImageUrl(100, 100), // Smaller placeholder for thumbnail
              });
              tempLogMediaLink.push({ logIndex: logsForThisBatch.length, media_id: currentMediaId });
              totalMediaGenerated++;
            }

            logsForThisBatch.push({
              task_id: task.id,
              kid_id: kid.id,
              date: dateStr,
              ai_validated: aiValidated,
              parent_approved: parentApproved,
              points_awarded: pointsAwarded,
              media_id: currentMediaId, // Assign string or null directly
            });
            totalLogsGenerated++;
          }

          // Insert Logs for this batch
          if (logsForThisBatch.length > 0) {
            const { data: insertedLogs, error: logInsertError } = await adminClient
              .from('task_logs')
              .insert(logsForThisBatch)
              .select('id');
            
            if (logInsertError || !insertedLogs) {
              console.error('Error inserting batch of task logs:', logInsertError);
              // Continue to next kid/day
            } else {
              // Link Media records to inserted logs
              if (mediaForThisBatch.length > 0) {
                  const mediaToInsert = tempLogMediaLink.map((link, index) => {
                      if (insertedLogs[link.logIndex]) {
                          return {
                              ...mediaForThisBatch[index],
                              task_log_id: insertedLogs[link.logIndex].id,
                          };
                      }
                      return null;
                  }).filter(Boolean);

                  if (mediaToInsert.length > 0) {
                      const { error: mediaInsertError } = await adminClient
                          .from('media_uploads')
                          .insert(mediaToInsert as any);
                      if (mediaInsertError) {
                          console.error('Error inserting batch of media records:', mediaInsertError);
                      }
                  }
              }
            }
          }
        }
        
        // Update Streak
        if (kidActiveThisDay) {
            if (kidStreaks[kid.id].lastDate) {
                const lastActivityDate = new Date(kidStreaks[kid.id].lastDate + 'T00:00:00'); // Ensure correct parsing
                const currentDay = new Date(dateStr + 'T00:00:00');
                const diffDays = Math.round((currentDay.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    kidStreaks[kid.id].current++;
                } else if (diffDays > 1) {
                    kidStreaks[kid.id].current = 1; // Reset streak if gap > 1 day
                }
                // If diffDays === 0, it's the same day, streak doesn't change
            } else {
                kidStreaks[kid.id].current = 1; // First day of activity
            }
            kidStreaks[kid.id].lastDate = dateStr;
        } else {
            // Check if the streak should be reset (if it's not today and yesterday wasn't the last activity)
            if (kidStreaks[kid.id].lastDate) {
                const lastActivityDate = new Date(kidStreaks[kid.id].lastDate + 'T00:00:00');
                const currentDay = new Date(dateStr + 'T00:00:00');
                const diffDays = Math.round((currentDay.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                     kidStreaks[kid.id].current = 0; // Reset streak if gap > 1 day
                }
            }
        }

      }
    }
    console.log(`Processing complete. Total logs generated: ${totalLogsGenerated}, Total media generated: ${totalMediaGenerated}.`);

    // --- 6. Update Kid Points and Streaks --- 
    for (const kid of createdKids) {
        const finalPoints = kidPoints[kid.id] || 0;
        const finalStreak = kidStreaks[kid.id]?.current || 0;
        console.log(`Updating Kid ${kid.id}: Points=${finalPoints}, Streak=${finalStreak}`);
        const { error: updateKidError } = await adminClient
            .from('kids')
            .update({ points: finalPoints, streak: finalStreak })
            .eq('id', kid.id);
        if (updateKidError) {
            console.error(`Error updating points/streak for kid ${kid.id}:`, updateKidError);
        }
    }

    return NextResponse.json({
      message: `Successfully added ${createdKids.length} children, assigned tasks, generated ${totalLogsGenerated} logs and ${totalMediaGenerated} media placeholders. Kid stats updated.`,
      kidsAdded: createdKids,
      logsGenerated: totalLogsGenerated,
      mediaGenerated: totalMediaGenerated
    });

  } catch (error: any) {
    console.error('Unexpected error populating sample data:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
} 