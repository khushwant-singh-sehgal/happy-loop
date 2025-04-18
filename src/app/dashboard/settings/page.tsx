'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getKids } from '../../../lib/data-access';
import type { Kid } from '../../../lib/supabase';
import AddChildModal from '../../../components/dashboard/AddChildModal';
import TaskManagementModal from '../../../components/dashboard/TaskManagementModal';

export default function SettingsPage() {
  const [aiAutoCheck, setAiAutoCheck] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showTaskManagement, setShowTaskManagement] = useState(false);
  const [kids, setKids] = useState<Kid[]>([]);
  const [kidToManageTasks, setKidToManageTasks] = useState<Kid | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchKids = async () => {
      if (!user) return;
      
      try {
        // First try our regular method
        console.log('Fetching kids with regular method for user:', user.id);
        const kidsData = await getKids(user.id);
        console.log('Regular method returned kids:', kidsData);
        
        // If we have no kids, try our verification endpoint
        if (kidsData.length === 0 && user.email) {
          console.log('No kids found, trying verification endpoint');
          const response = await fetch(`/api/dashboard/verify-kids?email=${encodeURIComponent(user.email)}`);
          const data = await response.json();
          
          if (response.ok && data.kids && data.kids.length > 0) {
            console.log('Verification endpoint found kids:', data.kids);
            setKids(data.kids);
            return;
          }
        }
        
        setKids(kidsData);
      } catch (error) {
        console.error('Error fetching kids:', error);
      }
    };
    
    fetchKids();
  }, [user]);
  
  const refreshKidsData = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing kids data for user:', user.id);
      const kidsData = await getKids(user.id);
      console.log('Fetched kids data:', kidsData);
      setKids(kidsData);
    } catch (error) {
      console.error('Error refreshing kids data:', error);
    }
  };
  
  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Parent Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    defaultValue="Parent User"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    defaultValue="parent@example.com"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Password</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kids Management */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Children Management</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {kids.map(kid => (
              <div key={kid.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{kid.avatar}</div>
                  <div>
                    <p className="font-medium">{kid.name}</p>
                    <p className="text-sm text-gray-500">Age: {kid.age}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-gray-600 hover:text-purple-600 py-1 px-3 rounded-md text-sm">
                    Edit
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-md text-sm"
                    onClick={() => {
                      // Set kid to manage
                      setKidToManageTasks(kid);
                      // Open the task management modal
                      setShowTaskManagement(true);
                    }}
                  >
                    Manage Tasks
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setShowAddChildModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Child
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Settings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">AI Verification Settings</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">AI Auto-Check</h4>
              <p className="text-sm text-gray-500 mt-1">
                Allow AI to automatically verify task completions before your review
              </p>
            </div>
            
            <div className="relative inline-block w-12 h-6 ml-4">
              <input
                type="checkbox"
                id="ai-toggle"
                className="sr-only"
                checked={aiAutoCheck}
                onChange={() => setAiAutoCheck(!aiAutoCheck)}
              />
              <label
                htmlFor="ai-toggle"
                className={`block h-6 w-12 rounded-full transition-colors cursor-pointer ${
                  aiAutoCheck ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block h-5 w-5 mt-0.5 ml-0.5 rounded-full transition-transform bg-white ${
                    aiAutoCheck ? 'transform translate-x-6' : ''
                  }`}
                ></span>
              </label>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-2">AI Verification Strictness</h4>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Lenient</span>
              <input
                type="range"
                min="1"
                max="5"
                defaultValue="3"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0"
              />
              <span className="text-sm text-gray-500 ml-2">Strict</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set how strictly the AI should verify task completions
            </p>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="font-medium text-gray-700">Email Notifications</h4>
              <p className="text-sm text-gray-500">Get task completion updates via email</p>
            </div>
            
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                id="email-toggle"
                className="sr-only"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <label
                htmlFor="email-toggle"
                className={`block h-6 w-12 rounded-full transition-colors cursor-pointer ${
                  emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block h-5 w-5 mt-0.5 ml-0.5 rounded-full transition-transform bg-white ${
                    emailNotifications ? 'transform translate-x-6' : ''
                  }`}
                ></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <h4 className="font-medium text-gray-700">Push Notifications</h4>
              <p className="text-sm text-gray-500">Get instant notifications on your device</p>
            </div>
            
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                id="push-toggle"
                className="sr-only"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
              />
              <label
                htmlFor="push-toggle"
                className={`block h-6 w-12 rounded-full transition-colors cursor-pointer ${
                  pushNotifications ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block h-5 w-5 mt-0.5 ml-0.5 rounded-full transition-transform bg-white ${
                    pushNotifications ? 'transform translate-x-6' : ''
                  }`}
                ></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <h4 className="font-medium text-gray-700">Weekly Progress Report</h4>
              <p className="text-sm text-gray-500">Receive a summary of your child's progress each week</p>
            </div>
            
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                id="report-toggle"
                className="sr-only"
                checked={weeklyReport}
                onChange={() => setWeeklyReport(!weeklyReport)}
              />
              <label
                htmlFor="report-toggle"
                className={`block h-6 w-12 rounded-full transition-colors cursor-pointer ${
                  weeklyReport ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block h-5 w-5 mt-0.5 ml-0.5 rounded-full transition-transform bg-white ${
                    weeklyReport ? 'transform translate-x-6' : ''
                  }`}
                ></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          className={`py-2 px-6 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center ${
            saving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
      
      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-md shadow-lg animate-fade-in-up flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Settings saved successfully!
        </div>
      )}
      
      {/* Add Child Modal */}
      <AddChildModal 
        isOpen={showAddChildModal} 
        onClose={() => setShowAddChildModal(false)} 
        onSuccess={refreshKidsData}
      />
      
      {/* Task Management Modal */}
      <TaskManagementModal 
        isOpen={showTaskManagement} 
        onClose={() => setShowTaskManagement(false)} 
        kid={kidToManageTasks}
      />
    </div>
  );
} 