'use client';

import { useState } from 'react';

// Task interface to match the backend API response
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface AddTaskFormProps {
  onTaskAdded: (task: Task) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AddTaskForm({ onTaskAdded }: AddTaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          completed: false
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear the form
        setFormData({
          title: '',
          description: '',
          priority: 'medium'
        });
        
        setSuccess('Task scheduled successfully!');
        
        // Call the callback with the new task data for immediate display
        onTaskAdded(result.data);
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-purple-600';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-lg animate-scale-in-gentle">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-purple-800">
            Schedule New Task
          </h2>
          <p className="text-purple-600 text-sm">
            Add a task to your daily planning schedule
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-semibold text-purple-800">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-purple-200 rounded-xl glass-input text-purple-900 input-focus placeholder:text-purple-400 font-medium"
            placeholder="e.g., Review quarterly reports, Morning team standup, Client presentation prep"
            required
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-purple-800">
            Task Details
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-purple-200 rounded-xl glass-input text-purple-900 input-focus placeholder:text-purple-400 resize-none"
            placeholder="Add context, deadlines, or notes to help you stay organized and focused during this task..."
          />
        </div>

        {/* Priority Dropdown */}
        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-semibold text-purple-800">
            Priority Level
          </label>
          <div className="relative">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-purple-200 rounded-xl glass-input text-purple-900 input-focus appearance-none cursor-pointer font-medium"
            >
              <option value="low" className="text-green-600">🟢 Low Priority - Flexible timing</option>
              <option value="medium" className="text-orange-600">🟡 Medium Priority - Standard timeline</option>
              <option value="high" className="text-red-600">🔴 High Priority - Urgent deadline</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className={`font-medium ${getPriorityColor(formData.priority)}`}>
              Selected: {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in-smooth">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in-smooth">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-4 px-6 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
              <span>Scheduling task...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add to Schedule</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
} 