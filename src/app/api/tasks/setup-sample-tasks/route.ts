import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Define sample tasks directly in this file
const SAMPLE_TASKS = [
  { name: 'Brush Teeth', description: 'Brush for 2 minutes', icon: '🦷', points: 5, frequency: 'daily' },
  { name: 'Make Bed', description: 'Smooth sheets and arrange pillows', icon: '🛏️', points: 5, frequency: 'daily' },
  { name: 'Tidy Room', description: 'Put away toys and clothes', icon: '🧹', points: 10, frequency: 'daily' },
  { name: 'Read Book', description: 'Read for 15 minutes', icon: '📚', points: 10, frequency: 'daily' },
  { name: 'Homework', description: 'Complete assigned homework', icon: '✏️', points: 15, frequency: 'daily' },
  { name: 'Set Table', description: 'Set the table for dinner', icon: '🍽️', points: 5, frequency: 'daily' },
  { name: 'Clear Table', description: 'Clear your plate after eating', icon: '🍽️', points: 5, frequency: 'daily' },
  { name: 'Walk Dog', description: 'Take the dog for a walk', icon: '🐕', points: 15, frequency: 'daily' }, // Example weekly
  { name: 'Water Plants', description: 'Water the houseplants', icon: '🌱', points: 10, frequency: 'weekly' }, // Example weekly
  { name: 'Clean Bathroom', description: 'Help clean the bathroom sink/counter', icon: '🛁', points: 20, frequency: 'weekly' }, // Example weekly
];

// This endpoint adds sample tasks to the database if there are none
export async function GET(request: NextRequest) {
  try {
    const adminClient = createServerSupabaseClient();
    
    // Check if tasks table is empty
    const { data: existingTasks, error: checkError } = await adminClient
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (checkError) {
      return NextResponse.json(
        { error: 'Error checking tasks: ' + checkError.message },
        { status: 500 }
      );
    }
    
    // If we have tasks already, don't add sample ones
    if (existingTasks && existingTasks.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Tasks already exist', 
        tasksCount: existingTasks.length 
      });
    }
    
    // Insert sample tasks using the local constant
    const { data, error } = await adminClient
      .from('tasks')
      .insert(SAMPLE_TASKS.map(task => ({
        // Map fields explicitly to ensure correct schema match
        name: task.name,
        description: task.description,
        icon: task.icon,
        points: task.points,
        frequency: task.frequency
      })));
    
    if (error) {
      return NextResponse.json(
        { error: 'Error creating sample tasks: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample tasks added successfully' 
    });
  } catch (error) {
    console.error('Unexpected error setting up sample tasks:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 