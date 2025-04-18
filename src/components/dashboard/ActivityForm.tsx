'use client';

import { useState } from 'react';
import type { Task } from '../../lib/supabase';

interface ActivityFormProps {
  task?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
}

// Common emoji options for tasks
const emojiOptions = ['📚', '🦷', '🧹', '✏️', '🏃‍♂️', '🍽️', '🛏️', '🧮', '🎵', '🎨', '🌱', '🧘‍♀️', '🚿', '👕', '🧩', '💻'];

// Frequency options
const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekday', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekends' },
];

// Verification type options
const verificationOptions = [
  { value: 'checkbox', label: 'Simple checkbox' },
  { value: 'photo', label: 'Photo required' },
  { value: 'video', label: 'Video required' },
];

export default function ActivityForm({ task, onSubmit, onCancel }: ActivityFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    id: task?.id,
    name: task?.name || '',
    description: task?.description || '',
    icon: task?.icon || '📚',
    points: task?.points || 10,
    frequency: task?.frequency || 'daily',
    verification_type: task?.verification_type || 'checkbox',
  });
  
  const [customEmojiInput, setCustomEmojiInput] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'points' ? parseInt(value) : value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setFormData({
      ...formData,
      icon: emoji,
    });
    setCustomEmojiInput(false);
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Activity name is required';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.icon) {
      errors.icon = 'Please select an icon';
    }
    
    if (!formData.points || formData.points < 1) {
      errors.points = 'Points must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">
        {task ? 'Edit Activity' : 'Create New Activity'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
            placeholder="e.g., Brush Teeth"
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`block w-full px-3 py-2 border ${
              formErrors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
            placeholder="Describe what needs to be done to complete this activity"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>
        
        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Icon*
          </label>
          <div className="mb-2">
            <div className="grid grid-cols-8 gap-2 mb-3">
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`h-10 w-10 flex items-center justify-center text-xl rounded-md border ${
                    formData.icon === emoji ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setCustomEmojiInput(!customEmojiInput)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {customEmojiInput ? 'Hide custom input' : 'Use custom emoji'}
              </button>
            </div>
            
            {customEmojiInput && (
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={handleChange}
                  name="icon"
                  maxLength={2}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Paste emoji here"
                />
              </div>
            )}
          </div>
          {formErrors.icon && (
            <p className="mt-1 text-sm text-red-600">{formErrors.icon}</p>
          )}
        </div>
        
        {/* Points and Frequency Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Points */}
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
              Points*
            </label>
            <input
              type="number"
              id="points"
              name="points"
              min="1"
              max="100"
              value={formData.points}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                formErrors.points ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
            />
            {formErrors.points && (
              <p className="mt-1 text-sm text-red-600">{formErrors.points}</p>
            )}
          </div>
          
          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency*
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Verification Type */}
        <div>
          <label htmlFor="verification_type" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Method
          </label>
          <select
            id="verification_type"
            name="verification_type"
            value={formData.verification_type}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
            {verificationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose how kids should verify they've completed this activity
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {task ? 'Update Activity' : 'Create Activity'}
          </button>
        </div>
      </form>
    </div>
  );
} 