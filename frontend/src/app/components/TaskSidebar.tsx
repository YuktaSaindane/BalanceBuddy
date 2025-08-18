'use client';

import { useState } from 'react';
import AddTaskForm from '../AddTaskForm';

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

interface TaskSidebarProps {
  tasks: Task[];
  onTaskAdded: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskComplete: (taskId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function TaskSidebar({ 
  tasks, 
  onTaskAdded, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskComplete,
  isCollapsed = false,
  onToggleCollapse 
}: TaskSidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'unscheduled' | 'completed'>('unscheduled');

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'unscheduled':
        return !task.scheduledTime && !task.completed;
      case 'completed':
        return task.completed;
      case 'all':
      default:
        return true;
    }
  });

  // Get priority class for task items
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-transparent';
      case 'medium':
        return 'border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-transparent';
      case 'low':
        return 'border-l-4 border-green-400 bg-gradient-to-r from-green-50 to-transparent';
      default:
        return 'border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-transparent';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    e.currentTarget.classList.add('opacity-50');
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isCollapsed) {
    return (
      <div className="w-16 glass-card border-r border-muted flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="text-xs text-muted transform -rotate-90 whitespace-nowrap">
          {filteredTasks.length} tasks
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 glass-card border-r border-muted flex flex-col h-full animate-slide-in-left">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-muted">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-soft">Task List</h2>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setFilter('unscheduled')}
            className={`flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors font-medium ${
              filter === 'unscheduled'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-50 text-muted hover:bg-gray-100'
            }`}
          >
            Unscheduled
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors font-medium ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-50 text-muted hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors font-medium ${
              filter === 'completed'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-50 text-muted hover:bg-gray-100'
            }`}
          >
            Done
          </button>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full btn-primary py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-muted text-sm font-medium">
              {filter === 'unscheduled' 
                ? 'No unscheduled tasks' 
                : filter === 'completed'
                ? 'No completed tasks'
                : 'No tasks yet'
              }
            </p>
            <p className="text-muted text-xs mt-1">
              {filter === 'unscheduled' 
                ? 'Create a task or drag from timeline'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`glass-light rounded-xl p-4 cursor-pointer draggable hover:scale-[1.02] transition-all duration-300 ${getPriorityClass(task.priority)} ${
                  task.completed ? 'opacity-60' : ''
                }`}
                draggable={!task.completed && !task.scheduledTime}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                      <h3 className={`font-semibold text-sm ${task.completed ? 'line-through text-muted' : 'text-soft'}`}>
                        {task.title}
                      </h3>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-muted">
                          ⏱️ {formatDuration(task.duration || 30)}
                        </span>
                        {task.scheduledTime && (
                          <span className="text-purple-500 font-medium">
                            📅 {task.scheduledTime.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      <span className="text-muted capitalize">
                        {task.priority} priority
                      </span>
                    </div>
                  </div>

                  {/* Task Actions */}
                  <div className="flex flex-col space-y-2 ml-3">
                    {!task.completed && (
                      <button
                        onClick={() => onTaskComplete(task.id)}
                        className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                        title="Mark complete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-muted">
        <div className="text-xs text-muted text-center font-medium">
          {filteredTasks.length} {filter === 'all' ? 'total' : filter} tasks
          {filter === 'unscheduled' && (
            <div className="mt-1 text-purple-500">
              💡 Drag tasks to schedule them
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in-gentle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-soft">Add New Task</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddTaskForm 
              onTaskAdded={(task) => {
                onTaskAdded(task);
                setShowAddForm(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in-gentle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-soft">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-muted text-sm">
              Task editing form - to be implemented
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 