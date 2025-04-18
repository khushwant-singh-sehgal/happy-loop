import { createClient } from '@supabase/supabase-js';

// These values should be replaced with your actual Supabase project details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgbfyolyrzptsiacnurp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

console.log('Supabase client initialized with URL:', supabaseUrl);

// Check if there's an issue with the keys
if (!supabaseAnonKey || supabaseAnonKey.length < 10) {
  console.error('WARNING: Supabase anon key appears to be invalid or missing');
}

// Check if we're in a browser environment where window is defined
const isServer = typeof window === 'undefined';

/**
 * For server environments, we need to use this function.
 * CAUTION: Never expose this admin client to the browser
 */
export const createServerSupabaseClient = () => {
  if (!isServer) {
    console.error("Admin client should only be used on the server");
    return supabase;
  }
  
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error("Service role key not found");
    return supabase;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Types based on the suggested schema
export type Parent = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type Kid = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  parent_id: string;
  points: number;
  streak: number;
  created_at: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'weekday' | 'weekend';
  verification_type?: 'checkbox' | 'photo' | 'video';
  enabled?: boolean;
  created_at: string;
};

export type TaskLog = {
  id: string;
  task_id: string;
  kid_id: string;
  date: string;
  media_id: string | null;
  ai_validated: boolean;
  parent_approved: boolean | null;
  points_awarded: number;
  created_at: string;
};

export type MediaUpload = {
  id: string;
  task_log_id: string;
  storage_path: string;
  type: 'image' | 'video' | 'audio';
  thumbnail_path?: string;
  created_at: string;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  kid_id: string;
  date_earned: string;
};

export type Reward = {
  id: string;
  name: string;
  description: string;
  image: string;
  point_cost: number;
  available: boolean;
  created_at: string;
};

export type FamilyConfig = {
  id: string;
  parent_id: string;
  show_leaderboard: boolean;
  ai_validation: boolean;
  notification_frequency: 'daily' | 'weekly' | 'never';
  reward_preferences: string[];
  created_at: string;
  updated_at: string;
}; 