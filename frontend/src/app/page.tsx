'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import AddTaskForm from './AddTaskForm';

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

interface TasksResponse {
  success: boolean;
  data: Task[];
  count: number;
}

export default function Home() {
  const [message, setMessage] = useState<string>('Loading...');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      // Fetch tasks from the backend API
      const response = await fetch('http://localhost:5000/tasks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TasksResponse = await response.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasksError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskAdded = () => {
    // Refresh the task list when a new task is added
    fetchTasks();
  };

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using the proxy route to call our backend
        const response = await fetch('/api/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        setMessage(data);
      } catch (err) {
        console.error('Error fetching message:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch message');
        setMessage('Error loading message');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
    fetchTasks();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">BalanceBuddy</h1>
          <p className="text-lg text-gray-600 mb-8">Your Personal Finance Companion</p>
        </div>

        {/* Backend Message Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
          <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
            Backend Connection Status
          </h2>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-600 dark:text-blue-300">Connecting...</span>
              </>
            ) : error ? (
              <>
                <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                <span className="text-red-600 dark:text-red-400">Error: {error}</span>
              </>
            ) : (
              <>
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">{message}</span>
              </>
            )}
          </div>
        </div>

        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={handleTaskAdded} />

        {/* Tasks Section */}
        <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Tasks
          </h2>
          
          {tasksLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-blue-600 dark:text-blue-300">Loading tasks...</span>
            </div>
          ) : tasksError ? (
            <div className="flex items-center gap-2 py-4">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
              <span className="text-red-600 dark:text-red-400">Error: {tasksError}</span>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No tasks found. Create some tasks in your backend!</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        task.completed 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-4">
                    <h3 className={`font-medium ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center max-w-md">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Welcome to BalanceBuddy! This application demonstrates a full-stack setup with:
          </p>
          <ul className="text-sm text-left list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Next.js frontend with TypeScript</li>
            <li>Express.js backend server</li>
            <li>Task management with REST API</li>
            <li>Real-time backend connectivity</li>
          </ul>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-solid border-blue-600 transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Refresh Tasks
          </button>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="http://localhost:5000/tasks"
            target="_blank"
            rel="noopener noreferrer"
          >
            View API Directly
          </a>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Frontend: localhost:3000 | Backend: localhost:5000
        </div>
      </footer>
    </div>
  );
}
