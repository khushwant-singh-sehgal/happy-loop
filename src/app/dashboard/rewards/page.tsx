'use client';

import { useState, useEffect } from 'react';
import { getKids, getRewards } from '../../../lib/data-access';
import { useAuth } from '../../../context/AuthContext';
import type { Reward } from '../../../lib/supabase';

export default function RewardsPage() {
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const [selectedKid, setSelectedKid] = useState<string>('');
  const [redemptionSuccess, setRedemptionSuccess] = useState<boolean>(false);
  const [kids, setKids] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch kids
        const kidsData = await getKids(user.id);
        setKids(kidsData);
        
        // Set first kid as selected by default if we have kids
        if (kidsData.length > 0) {
          setSelectedKid(kidsData[0].id);
        }
        
        // Fetch rewards
        const rewardsData = await getRewards();
        setRewards(rewardsData);
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleRedeemClick = (rewardId: string) => {
    setRedeemingReward(rewardId);
    setRedemptionSuccess(false);
  };
  
  const handleConfirmRedeem = () => {
    // In a real app, this would call an API to redeem the reward
    setTimeout(() => {
      setRedemptionSuccess(true);
      // Reset after a delay
      setTimeout(() => {
        setRedeemingReward(null);
        setRedemptionSuccess(false);
      }, 3000);
    }, 800);
  };
  
  const selectedKidData = kids.find(kid => kid.id === selectedKid);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-600 font-medium">Loading rewards...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Rewards</h2>
      
      {/* Points Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Points</h3>
            <div className="flex items-end">
              <p className="text-4xl font-bold text-purple-600">
                {selectedKidData?.points || 0}
              </p>
              <p className="text-gray-500 ml-2 mb-1">points</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <label htmlFor="kidSelector" className="block text-sm font-medium text-gray-700 mb-2">
              Select Child
            </label>
            <select
              id="kidSelector"
              value={selectedKid}
              onChange={(e) => setSelectedKid(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              {kids.length === 0 ? (
                <option value="">No children available</option>
              ) : (
                kids.map(kid => (
                  <option key={kid.id} value={kid.id}>
                    {kid.avatar} {kid.name} - {kid.points} points
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      
      {kids.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No children added yet</h3>
          <p className="text-gray-600 mb-4">Add your first child to start redeeming rewards.</p>
        </div>
      ) : (
        // Only show rewards grid if there are kids
        <>
          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map(reward => {
              const canAfford = selectedKidData && selectedKidData.points >= reward.point_cost;
              
              return (
                <div 
                  key={reward.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                    canAfford
                      ? 'hover:shadow-lg transform hover:-translate-y-1'
                      : 'opacity-70'
                  }`}
                >
                  <div className="aspect-square bg-purple-50 flex items-center justify-center">
                    <div className="text-8xl">{reward.image}</div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{reward.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-sm font-medium">
                        {reward.point_cost} points
                      </div>
                      
                      <button
                        onClick={() => handleRedeemClick(reward.id)}
                        disabled={!canAfford}
                        className={`py-1 px-4 rounded-full text-sm font-medium ${
                          canAfford
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Monthly Special */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <div className="text-4xl mr-4">🎉</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Monthly Special Reward</h3>
                <p className="opacity-90">Available for a limited time only!</p>
              </div>
            </div>
            
            <div className="mt-6 bg-white/10 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center">
                <div className="text-8xl mb-4 md:mb-0 md:mr-6">🎡</div>
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-bold mb-2">Family Theme Park Trip</h4>
                  <p className="mb-4">
                    Redeem 1000 points for a family trip to the local theme park, 
                    including all-day passes and lunch vouchers!
                  </p>
                  <div className="flex justify-center md:justify-start">
                    <div className="bg-white/20 text-white py-1 px-3 rounded-full text-sm font-medium mr-3">
                      1000 points
                    </div>
                    <button 
                      className="bg-white text-purple-600 hover:bg-gray-100 py-1 px-4 rounded-full text-sm font-medium"
                      disabled={!(selectedKidData && selectedKidData.points >= 1000)}
                    >
                      Special Redeem
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-xs mt-4 text-center md:text-right opacity-80">
                * Special rewards are redeemed once per month. Valid until the end of the month.
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Reward History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Reward History</h3>
        </div>
        
        <div className="p-6 text-center text-gray-500">
          <p>No rewards have been redeemed yet.</p>
          <p className="mt-2 text-sm">
            When you redeem rewards, they will appear here with their status.
          </p>
        </div>
      </div>
      
      {/* Info Card */}
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-start">
          <div className="text-3xl mr-4">💡</div>
          <div>
            <h3 className="text-lg font-semibold mb-2">About Rewards</h3>
            <p className="text-gray-700 mb-2">
              Children earn points by completing tasks and building consistent habits. These points can be
              redeemed for physical and digital rewards.
            </p>
            <p className="text-gray-700">
              As a parent, you can redeem rewards on behalf of your children. Physical rewards will be
              delivered to your address at the beginning of each month.
            </p>
          </div>
        </div>
      </div>
      
      {/* Redemption Modal */}
      {redeemingReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {redemptionSuccess ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Reward Redeemed!</h3>
                <p className="text-gray-600 mb-6">
                  Your redemption has been confirmed. The reward will be delivered soon!
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Redemption</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to redeem {rewards.find(r => r.id === redeemingReward)?.name} for {selectedKidData?.name}?
                </p>
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setRedeemingReward(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleConfirmRedeem}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Confirm Redemption
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 