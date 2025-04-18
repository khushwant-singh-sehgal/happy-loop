'use client';

import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Task } from '../../lib/supabase';
import ActivityForm from './ActivityForm';
import { createTask, updateTask } from '../../lib/data-access';
import { toast } from 'react-hot-toast';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSuccess: () => void;
}

export default function ActivityModal({ isOpen, onClose, task, onSuccess }: ActivityModalProps) {
  const cancelButtonRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (formData: Partial<Task>) => {
    setSaving(true);
    try {
      if (task?.id) {
        // Update existing task
        await updateTask(task.id, formData);
        toast.success('Activity updated successfully');
      } else {
        // Create new task
        
        // --- VALIDATION --- 
        // Check for required fields based on Task type
        if (!formData.name || !formData.description || !formData.icon || formData.points == null || !formData.frequency) {
          toast.error('Please fill in all required fields: Name, Description, Icon, Points, Frequency.');
          setSaving(false);
          return; // Stop execution if validation fails
        }
        // --- END VALIDATION --- 

        // Construct the object for createTask, ensuring required fields are present
        // and matching the Omit<Task, 'id' | 'created_at'> type implicitly.
        const newTaskData = {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          points: formData.points,
          frequency: formData.frequency,
          // Include optional fields ONLY if they exist in formData AND the Task type allows them
          // (Assuming Task type allows these as optional - check Task definition if unsure)
          ...(formData.verification_type && { verification_type: formData.verification_type }),
          ...(formData.enabled !== undefined && { enabled: formData.enabled }), 
        };
        
        // Now call createTask with the validated and correctly typed object
        await createTask(newTaskData);
        toast.success('Activity created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-left sm:mt-0">
                    <div className="flex items-center justify-between">
                      <Dialog.Title 
                        as="h3" 
                        className="text-xl font-semibold leading-6 text-gray-900"
                      >
                        {task ? 'Edit Activity' : 'Add New Activity'}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <ActivityForm 
                        task={task} 
                        onSubmit={handleSave}
                        onCancel={onClose}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 