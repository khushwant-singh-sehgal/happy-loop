import type { Kid, Task } from '../../lib/supabase';

export interface TaskCompletion {
  id: string;
  task_id: string;
  kid_id: string;
  date: string;
  completed: boolean;
  approved: boolean | null;
  points_awarded: number;
}

// Sample kids for demonstration/testing only - not used in production
export const sampleKids: Kid[] = [
  {
    id: '1',
    parent_id: 'sample-parent-id',
    name: 'Emma',
    age: 8,
    avatar: '👧',
    points: 320,
    streak: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    parent_id: 'sample-parent-id',
    name: 'Oliver',
    age: 10,
    avatar: '👦',
    points: 450,
    streak: 12,
    created_at: new Date().toISOString(),
  },
];

// Sample tasks for demonstration/testing
export const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Brush Teeth',
    description: 'Brush teeth in the morning and evening',
    icon: '🦷',
    points: 10,
    frequency: 'daily',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Make Bed',
    description: 'Make your bed every morning',
    icon: '🛏️',
    points: 5,
    frequency: 'daily',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Read a Book',
    description: 'Read for at least 20 minutes',
    icon: '📚',
    points: 15,
    frequency: 'daily',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Clean Room',
    description: 'Tidy up your bedroom',
    icon: '🧹',
    points: 20,
    frequency: 'weekly',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Help with Dishes',
    description: 'Help wash or put away dishes',
    icon: '🍽️',
    points: 15,
    frequency: 'daily',
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Practice Instrument',
    description: 'Practice musical instrument for 30 minutes',
    icon: '🎵',
    points: 25,
    frequency: 'daily',
    created_at: new Date().toISOString(),
  },
];

// Sample completions for demonstration purposes
export const sampleCompletions: TaskCompletion[] = [
  {
    id: '1',
    task_id: '1',
    kid_id: '1',
    date: '2023-06-01',
    completed: true,
    approved: true,
    points_awarded: 10,
  },
  {
    id: '2',
    task_id: '2',
    kid_id: '1',
    date: '2023-06-01',
    completed: true,
    approved: true,
    points_awarded: 5,
  },
  {
    id: '3',
    task_id: '3',
    kid_id: '1',
    date: '2023-06-02',
    completed: true,
    approved: true,
    points_awarded: 15,
  },
  {
    id: '4',
    task_id: '1',
    kid_id: '1',
    date: '2023-06-02',
    completed: true,
    approved: true,
    points_awarded: 10,
  },
  {
    id: '5',
    task_id: '4',
    kid_id: '1',
    date: '2023-06-03',
    completed: true,
    approved: null,
    points_awarded: 0,
  },
  {
    id: '6',
    task_id: '1',
    kid_id: '2',
    date: '2023-06-01',
    completed: true,
    approved: true,
    points_awarded: 10,
  },
  {
    id: '7',
    task_id: '3',
    kid_id: '2',
    date: '2023-06-01',
    completed: true,
    approved: true,
    points_awarded: 15,
  },
  {
    id: '8',
    task_id: '5',
    kid_id: '2',
    date: '2023-06-02',
    completed: true,
    approved: false,
    points_awarded: 0,
  },
];

// Leaderboard mock data
export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
}

export const leaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Emma',
    avatar: '👧',
    points: 520,
    streak: 14,
    rank: 1
  },
  {
    id: '2',
    name: 'Oliver',
    avatar: '👦',
    points: 480,
    streak: 12,
    rank: 2
  },
  {
    id: '3',
    name: 'Sophia',
    avatar: '👧',
    points: 450,
    streak: 8,
    rank: 3
  },
  {
    id: '4',
    name: 'Noah',
    avatar: '👦',
    points: 400,
    streak: 6,
    rank: 4
  },
  {
    id: '5',
    name: 'Ava',
    avatar: '👧',
    points: 380,
    streak: 7,
    rank: 5
  },
  {
    id: '6',
    name: 'Liam',
    avatar: '👦',
    points: 350,
    streak: 5,
    rank: 6
  },
  {
    id: '7',
    name: 'Isabella',
    avatar: '👧',
    points: 330,
    streak: 4,
    rank: 7
  },
  {
    id: '8',
    name: 'Lucas',
    avatar: '👦',
    points: 310,
    streak: 3,
    rank: 8
  }
];

// Kids for the dashboard
export const kids = [
  {
    id: '1',
    name: 'Emma',
    age: 8,
    avatar: '👧',
    points: 320,
    streak: 5
  },
  {
    id: '2',
    name: 'Oliver',
    age: 10,
    avatar: '👦',
    points: 450,
    streak: 12
  }
];

// Tasks with completions
export interface TaskWithCompletions {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  frequency: string;
  completions: Array<{
    id: string;
    kidId: string;
    taskId: string;
    date: string;
    mediaId: string;
    aiVerified: boolean;
    parentApproved: boolean | null;
  }>;
}

export const tasks: TaskWithCompletions[] = [
  {
    id: '1',
    name: 'Brush Teeth',
    description: 'Brush teeth in the morning and evening',
    icon: '🦷',
    points: 10,
    frequency: 'daily',
    completions: [
      {
        id: 'c1',
        kidId: '1',
        taskId: '1',
        date: '2023-07-10T08:30:00Z',
        mediaId: 'm1',
        aiVerified: true,
        parentApproved: null
      },
      {
        id: 'c2',
        kidId: '2',
        taskId: '1',
        date: '2023-07-09T19:15:00Z',
        mediaId: 'm2',
        aiVerified: true,
        parentApproved: true
      }
    ]
  },
  {
    id: '2',
    name: 'Make Bed',
    description: 'Make your bed every morning',
    icon: '🛏️',
    points: 5,
    frequency: 'daily',
    completions: [
      {
        id: 'c3',
        kidId: '1',
        taskId: '2',
        date: '2023-07-10T07:45:00Z',
        mediaId: 'm3',
        aiVerified: false,
        parentApproved: null
      }
    ]
  },
  {
    id: '3',
    name: 'Read a Book',
    description: 'Read for at least 20 minutes',
    icon: '📚',
    points: 15,
    frequency: 'daily',
    completions: [
      {
        id: 'c4',
        kidId: '2',
        taskId: '3',
        date: '2023-07-09T20:00:00Z',
        mediaId: 'm4',
        aiVerified: true,
        parentApproved: true
      }
    ]
  },
  {
    id: '4',
    name: 'Clean Room',
    description: 'Tidy up your bedroom',
    icon: '🧹',
    points: 20,
    frequency: 'weekly',
    completions: []
  }
];

// Media uploads for task verification
export const mediaUploads = [
  {
    id: 'm1',
    type: 'image' as const,
    thumbnailUrl: 'https://placehold.co/300x200/purple/white?text=Brushing+Teeth',
    fullUrl: 'https://placehold.co/600x400/purple/white?text=Brushing+Teeth',
    uploadedAt: '2023-07-10T08:30:00Z'
  },
  {
    id: 'm2',
    type: 'video' as const,
    thumbnailUrl: 'https://placehold.co/300x200/blue/white?text=Brushing+Video',
    fullUrl: 'https://placehold.co/600x400/blue/white?text=Brushing+Video',
    uploadedAt: '2023-07-09T19:15:00Z'
  },
  {
    id: 'm3',
    type: 'image' as const,
    thumbnailUrl: 'https://placehold.co/300x200/green/white?text=Bed+Made',
    fullUrl: 'https://placehold.co/600x400/green/white?text=Bed+Made',
    uploadedAt: '2023-07-10T07:45:00Z'
  },
  {
    id: 'm4',
    type: 'image' as const,
    thumbnailUrl: 'https://placehold.co/300x200/orange/white?text=Reading+Book',
    fullUrl: 'https://placehold.co/600x400/orange/white?text=Reading+Book',
    uploadedAt: '2023-07-09T20:00:00Z'
  }
];

// Rewards for the rewards page
export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  pointCost: number;
  available: boolean;
}

export const rewards: Reward[] = [
  {
    id: 'r1',
    name: 'Extra Screen Time',
    description: '30 minutes of additional screen time',
    image: '📱',
    pointCost: 50,
    available: true
  },
  {
    id: 'r2',
    name: 'Ice Cream Treat',
    description: 'A delicious ice cream of your choice',
    image: '🍦',
    pointCost: 100,
    available: true
  },
  {
    id: 'r3',
    name: 'Movie Night',
    description: 'Pick a movie for family movie night',
    image: '🎬',
    pointCost: 150,
    available: true
  },
  {
    id: 'r4',
    name: 'New Book',
    description: 'Choose a new book to read',
    image: '📘',
    pointCost: 200,
    available: true
  },
  {
    id: 'r5',
    name: 'Trip to Zoo',
    description: 'Family trip to the local zoo',
    image: '🦁',
    pointCost: 500,
    available: true
  },
  {
    id: 'r6',
    name: 'New Toy',
    description: 'Choose a new toy within budget',
    image: '🧸',
    pointCost: 300,
    available: true
  },
  {
    id: 'r7',
    name: 'Pizza Party',
    description: 'Host a pizza party with friends',
    image: '🍕',
    pointCost: 400,
    available: true
  },
  {
    id: 'r8',
    name: 'Stay Up Late',
    description: 'Stay up 1 hour past bedtime',
    image: '🌙',
    pointCost: 75,
    available: true
  }
]; 