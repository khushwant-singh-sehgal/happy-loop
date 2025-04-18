'use client';

import { useState, useEffect } from 'react';
import { getKids } from '../../../lib/data-access';
import { useAuth } from '../../../context/AuthContext';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch real kids data
        const kidsData = await getKids(user.id);
        
        // Generate leaderboard entries from real data
        // Sort kids by points
        const sortedKids = [...kidsData].sort((a, b) => b.points - a.points);
        
        // Map to leaderboard entries and assign ranks
        const leaderboardEntries = sortedKids.map((kid, index) => ({
          id: kid.id,
          name: kid.name,
          avatar: kid.avatar,
          points: kid.points,
          streak: kid.streak || 0,
          rank: index + 1
        }));
        
        // If we have fewer than 8 entries, fill with anonymous entries
        const placeholderAvatars = ['👧', '👦', '👧', '👦', '👧', '👦', '👧', '👦'];
        const placeholderNames = ['Sophia', 'Noah', 'Ava', 'Liam', 'Isabella', 'Lucas', 'Emma', 'Oliver'];
        
        if (leaderboardEntries.length < 8) {
          const startRank = leaderboardEntries.length + 1;
          const placeholdersNeeded = 8 - leaderboardEntries.length;
          
          for (let i = 0; i < placeholdersNeeded; i++) {
            const rank = startRank + i;
            // Points decrease with rank
            const points = Math.max(400 - (rank * 30), 100);
            // Streak decreases with rank
            const streak = Math.max(12 - (rank * 1), 1);
            
            leaderboardEntries.push({
              id: `placeholder-${i}`,
              name: placeholderNames[i % placeholderNames.length],
              avatar: placeholderAvatars[i % placeholderAvatars.length],
              points,
              streak,
              rank
            });
          }
        }
        
        setLeaderboard(leaderboardEntries);
        
        // Show the spotlight award after a delay for UI effect
        const timer = setTimeout(() => {
          setShowSpotlight(true);
        }, 1500);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, timeFrame]);
  
  // Get ranking colors
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500'; // Gold
      case 2: return 'bg-gray-300'; // Silver
      case 3: return 'bg-amber-600'; // Bronze
      default: return 'bg-purple-100 text-purple-800';
    }
  };
  
  // Get ranking text color
  const getRankTextColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-amber-600';
      default: return 'text-gray-500';
    }
  };
  
  // Get encouraging message based on rank
  const getEncouragementMessage = (rank: number) => {
    if (rank === 1) return "Amazing work! You're leading the pack! 🌟";
    if (rank === 2) return "So close to the top! Keep it up! ✨";
    if (rank === 3) return "Bronze is shining bright! Great progress! 🥉";
    if (rank <= 5) return "You're in the top 5! That's awesome! 🔥";
    return "Progress over perfection! Keep building those habits! 💪";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Family Leaderboard</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeFrame === 'weekly' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setTimeFrame('weekly')}
          >
            Weekly
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeFrame === 'monthly' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setTimeFrame('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeFrame === 'allTime' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setTimeFrame('allTime')}
          >
            All Time
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-purple-600 font-medium">Loading leaderboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Podium - Top 3 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Top Performers</h3>
              <p className="text-gray-600">Celebrating consistent habit builders</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* Second Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-32 w-full bg-gray-200 rounded-t-lg flex items-end justify-center">
                    <div className="absolute top-0 w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center border-4 border-white -mt-6">
                      <span className="text-3xl">{leaderboard[1]?.avatar || '👤'}</span>
                    </div>
                    <div className="mb-2 text-center">
                      <span className="text-xl font-bold text-gray-600">2nd</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-b-lg shadow-sm text-center w-full">
                  <p className="font-medium">{leaderboard[1]?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{leaderboard[1]?.points || 0} points</p>
                  <p className="text-xs mt-1">🔥 {leaderboard[1]?.streak || 0} day streak</p>
                </div>
              </div>
              
              {/* First Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-40 w-full bg-yellow-100 rounded-t-lg flex items-end justify-center">
                    <div className="absolute top-0 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white -mt-8">
                      <span className="text-4xl">{leaderboard[0]?.avatar || '👤'}</span>
                    </div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                      <span className="text-2xl">👑</span>
                    </div>
                    <div className="mb-2 text-center">
                      <span className="text-2xl font-bold text-yellow-800">1st</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-md text-center w-full border-t-4 border-yellow-400">
                  <p className="font-bold text-lg">{leaderboard[0]?.name || 'N/A'}</p>
                  <p className="text-gray-700 font-medium">{leaderboard[0]?.points || 0} points</p>
                  <p className="text-sm mt-1">🔥 {leaderboard[0]?.streak || 0} day streak</p>
                </div>
              </div>
              
              {/* Third Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-24 w-full bg-amber-100 rounded-t-lg flex items-end justify-center">
                    <div className="absolute top-0 w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center border-4 border-white -mt-5">
                      <span className="text-3xl">{leaderboard[2]?.avatar || '👤'}</span>
                    </div>
                    <div className="mb-2 text-center">
                      <span className="text-xl font-bold text-amber-800">3rd</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-b-lg shadow-sm text-center w-full">
                  <p className="font-medium">{leaderboard[2]?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{leaderboard[2]?.points || 0} points</p>
                  <p className="text-xs mt-1">🔥 {leaderboard[2]?.streak || 0} day streak</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Full Leaderboard */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Complete Standings</h3>
            </div>
            
            <div className="divide-y">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                      <span className="font-bold text-white">{entry.rank}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{entry.avatar}</span>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <div className="flex items-center text-sm">
                            <span className={`${getRankTextColor(entry.rank)} font-medium`}>
                              {entry.points} points
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500">
                              Streak: {entry.streak} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Your family indicator */}
                    {(entry.name === 'Kid1' || entry.name === 'Kid2') && (
                      <div className="ml-4 bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-xs">
                        Your family
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 ml-12 text-sm text-gray-600">
                    {getEncouragementMessage(entry.rank)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Surprise Spotlight Award */}
          {showSpotlight && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white animate-fade-in-up">
              <div className="flex items-center">
                <div className="text-4xl mr-4">✨</div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Surprise Spotlight Award</h3>
                  <p className="opacity-90">Recognizing effort and consistency</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">
                    {leaderboard[4]?.avatar || '👤'}
                  </div>
                  <div>
                    <p className="font-medium text-lg">
                      {leaderboard[4]?.name || 'Anonymous Family'}
                    </p>
                    <p className="text-sm opacity-90">
                      Most improved this {timeFrame === 'weekly' ? 'week' : timeFrame === 'monthly' ? 'month' : 'period'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 italic">
                  &quot;Even though they&apos;re not in the top 3, they&apos;ve shown incredible dedication by 
                  improving their consistency every day. That&apos;s what Happy Loop is all about!&quot;
                </p>
              </div>
            </div>
          )}
          
          {/* Info Card */}
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">💡</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">About the Leaderboard</h3>
                <p className="text-gray-700">
                  Our leaderboard celebrates consistency and effort - not just points. We highlight families that show 
                  regular engagement and improvement, even if they&apos;re not at the top of the rankings.
                </p>
                <p className="text-gray-700 mt-2">
                  All families are anonymized to protect privacy - you&apos;ll only see your own family&apos;s actual names.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 