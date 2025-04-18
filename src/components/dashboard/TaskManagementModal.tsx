'use client';

import { Kid } from '@/lib/supabase';
import TaskManagement from './TaskManagement';

interface TaskManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: Kid | null;
}

export default function TaskManagementModal({ isOpen, onClose, kid }: TaskManagementModalProps) {
  if (!isOpen || !kid) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Manage Tasks</h2>
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
          
          {/* Task Management Component */}
          <TaskManagement kid={kid} onUpdate={onClose} />
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 