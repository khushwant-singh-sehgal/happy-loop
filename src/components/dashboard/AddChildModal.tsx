'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const AVATARS = ['👧', '👦', '👶', '👼', '🧒', '🧑', '👱', '👸', '🧚'];

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      setError('Please enter a valid age between 1 and 18');
      return;
    }
    
    setLoading(true);

    try {
      if (!user) {
        setError('You must be logged in to add a child');
        setLoading(false);
        return;
      }

      console.log('Adding child with parent_id:', user.id);
      
      const childData = {
        parent_id: user.id,
        name: name.trim(),
        age: ageNum,
        avatar: selectedAvatar,
        points: 0,
        streak: 0,
        // Add user information to help create parent record if needed
        email: user.email,
        parent_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Parent'
      };

      console.log('Sending child data:', JSON.stringify(childData));

      // Use the server API route to bypass RLS
      const response = await fetch('/api/dashboard/add-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(childData),
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        console.error('Server error:', result.error);
        setError(result.error || 'Failed to add child');
        return;
      }
      
      if (result.success) {
        // Success - reset form and close
        console.log('Child added successfully:', result.data);
        setName('');
        setAge('');
        setSelectedAvatar(AVATARS[0]);
        
        // Call onSuccess first and then onClose
        try {
          onSuccess();
          console.log('onSuccess callback executed');
        } catch (err) {
          console.error('Error in onSuccess callback:', err);
        }
        
        onClose();
      } else {
        setError('Failed to add child. Please try again.');
      }
    } catch (err) {
      console.error('Error adding child:', err);
      setError('An unexpected error occurred. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add a Child</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Child's Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                min="1"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter age"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`h-12 w-12 text-2xl flex items-center justify-center rounded-md ${
                      selectedAvatar === avatar 
                        ? 'bg-purple-100 border-2 border-purple-500' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Child'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 