'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import TaskSidebar from './TaskSidebar';
import TimelineView from './TimelineView';
import StatsPanel from './StatsPanel';
import { Button } from '@/components/ui/button';

// Task interface with scheduling support
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

interface TasksResponse {
  success: boolean;
  data: Task[];
  count: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'tasks' | 'timeline' | 'stats'>('timeline');

  // Function to fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/tasks');
      
      if (!response.ok) {
        throw new Error(`Backend server error! status: ${response.status}. Make sure the backend is running on http://localhost:5000`);
      }
      
      const data: TasksResponse = await response.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        console.error('Failed to fetch tasks');
        setError('Failed to fetch tasks from server');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err instanceof Error && err.message.includes('fetch')) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Task CRUD Operations
  const handleTaskAdded = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Only send the fields that can be updated
      const updateData = {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        scheduledTime: updatedTask.scheduledTime,
        duration: updatedTask.duration
      };

      const response = await fetch(`http://localhost:5000/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === updatedTask.id ? { ...task, ...result.data } : task
          )
        );
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
          )
        );
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to update task');
    }
  };

  // Timeline-specific operations
  const handleTaskSchedule = async (taskId: number, time: string, duration: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const scheduledTime = time; // Format: "HH:MM"
      const updatedTask = { ...task, scheduledTime, duration };

      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledTime, duration }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, scheduledTime, duration } : t
          )
        );
      }
    } catch (err) {
      console.error('Error scheduling task:', err);
      setError('Failed to schedule task');
    }
  };

  const handleTaskCreateAtTime = (time: string) => {
    // This would open a task creation modal with pre-filled time
    console.log(`Create task at ${time}`);
    // For now, just create a placeholder task
    const newTask = {
      title: `Task at ${time}`,
      description: '',
      priority: 'medium' as const,
      scheduledTime: time,
      duration: 30
    };
    
    // Call the backend to create the task
    handleCreateScheduledTask(newTask);
  };

  const handleCreateScheduledTask = async (taskData: any) => {
    try {
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
        setTasks(prevTasks => [result.data, ...prevTasks]);
      }
    } catch (err) {
      console.error('Error creating scheduled task:', err);
      setError('Failed to create task');
    }
  };

  // Mobile view renderer
  const renderMobileView = () => {
    return (
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="glass-light border-b border-muted p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-soft">BalanceBuddy</h1>
            <div className="flex space-x-1">
              <button
                onClick={() => setMobileView('tasks')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  mobileView === 'tasks'
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-muted hover:bg-white/10'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setMobileView('timeline')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  mobileView === 'timeline'
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-muted hover:bg-white/10'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setMobileView('stats')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  mobileView === 'stats'
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-muted hover:bg-white/10'
                }`}
              >
                Stats
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {mobileView === 'tasks' && (
            <TaskSidebar
              tasks={tasks}
              onTaskAdded={handleTaskAdded}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskComplete={handleTaskComplete}
            />
          )}
          {mobileView === 'timeline' && (
            <TimelineView
              tasks={tasks}
              onTaskSchedule={handleTaskSchedule}
              onTaskCreate={handleTaskCreateAtTime}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
            />
          )}
          {mobileView === 'stats' && (
            <StatsPanel tasks={tasks} />
          )}
        </div>
      </div>
    );
  };

  // Show mobile view on small screens
  if (isMobile) {
    return renderMobileView();
  }

  // Desktop view
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="floating-element floating-element-1"></div>
        <div className="floating-element floating-element-2"></div>
        <div className="floating-element floating-element-3"></div>
      </div>

      {/* Desktop Header */}
      <header className="glass-light border-b border-muted sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-soft tracking-wide">
                BalanceBuddy
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <Link href="/">
              <Button variant="outline" size="sm" className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 m-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Layout - Three Columns */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar - Task List */}
        <TaskSidebar
          tasks={tasks}
          onTaskAdded={handleTaskAdded}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskComplete={handleTaskComplete}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />

        {/* Center - Timeline View */}
        <div className="flex-1 flex flex-col min-w-0">
          <TimelineView
            tasks={tasks}
            onTaskSchedule={handleTaskSchedule}
            onTaskCreate={handleTaskCreateAtTime}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>

        {/* Right Sidebar - Stats and Wellness */}
        <StatsPanel
          tasks={tasks}
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in-gentle">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div>
            </div>
            <p className="text-soft font-medium">Loading your schedule...</p>
          </div>
        </div>
      )}
    </div>
  );
} 