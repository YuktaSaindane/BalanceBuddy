'use client';

import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  scheduledTime?: string;
  duration?: number;
}

interface AddTaskFormProps {
  onTaskAdded: (task: Task) => void;
  scheduledTime?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  duration: number;
  scheduledTime?: string;
}

export default function AddTaskForm({ onTaskAdded, scheduledTime }: AddTaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    duration: 30,
    scheduledTime: scheduledTime || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 30 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        duration: formData.duration,
        ...(formData.scheduledTime && { scheduledTime: formData.scheduledTime })
      };

      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setFormData({ 
          title: '', 
          description: '', 
          priority: 'medium', 
          duration: 30,
          scheduledTime: scheduledTime || ''
        });
        setSuccess('Task created successfully!');
        onTaskAdded(result.data);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-green-400';
      default: return 'text-purple-400';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg animate-scale-in-gentle">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-soft">
            {scheduledTime ? `Schedule Task for ${scheduledTime}` : 'Create New Task'}
          </h2>
          <p className="text-muted text-sm">
            Add a task to your planning schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-semibold text-soft">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-muted rounded-xl glass-input text-soft input-focus placeholder:text-muted font-medium"
            placeholder="e.g., Review quarterly reports, Morning team standup, Client presentation prep"
            required
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-semibold text-soft">
            Task Details
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-muted rounded-xl glass-input text-soft input-focus placeholder:text-muted resize-none"
            placeholder="Add context, deadlines, or notes to help you stay organized and focused..."
          />
        </div>

        {/* Priority and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Field */}
          <div className="space-y-2">
            <label htmlFor="priority" className="block text-sm font-semibold text-soft">
              Priority Level
            </label>
            <div className="relative">
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-muted rounded-xl glass-input text-soft input-focus appearance-none cursor-pointer font-medium"
              >
                <option value="low" className="bg-gray-800 text-green-400">🟢 Low Priority</option>
                <option value="medium" className="bg-gray-800 text-orange-400">🟡 Medium Priority</option>
                <option value="high" className="bg-gray-800 text-red-400">🔴 High Priority</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Duration Field */}
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-semibold text-soft">
              Estimated Duration
            </label>
            <div className="relative">
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="5"
                max="480"
                step="5"
                className="w-full px-4 py-3 border border-muted rounded-xl glass-input text-soft input-focus font-medium"
                placeholder="30"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-muted text-sm">min</span>
              </div>
            </div>
            <div className="text-xs text-muted">
              Duration: {formatDuration(formData.duration)}
            </div>
          </div>
        </div>

        {/* Scheduled Time Field (if provided) */}
        {scheduledTime && (
          <div className="space-y-2">
            <label htmlFor="scheduledTime" className="block text-sm font-semibold text-soft">
              Scheduled Time
            </label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-muted rounded-xl glass-input text-soft input-focus font-medium"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in-smooth">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-red-400 font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in-smooth">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-400 font-medium">{success}</span>
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
              <span>Creating task...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{scheduledTime ? 'Schedule Task' : 'Create Task'}</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
} 