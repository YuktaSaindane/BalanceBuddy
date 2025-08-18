'use client';

import { useState, useEffect } from 'react';
import AddTaskForm from './AddTaskForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface TaskListProps {
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
}

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{title: string; description: string; priority: 'low' | 'medium' | 'high'}>({
    title: '',
    description: '',
    priority: 'medium'
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = (newTask: Task) => {
    // Add the new task to the beginning of the tasks array for immediate display
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: '', description: '', priority: 'medium' });
  };

  const updateTask = async (taskId: number) => {
    try {
      setUpdatingTaskId(taskId);
      
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          priority: editForm.priority
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the task in the local state immediately
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, ...result.data }
              : task
          )
        );
        
        // Exit edit mode
        setEditingTaskId(null);
        setEditForm({ title: '', description: '', priority: 'medium' });
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setUpdatingTaskId(taskId);
      
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the task from local state immediately
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        throw new Error(result.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const markAsComplete = async (taskId: number) => {
    try {
      setUpdatingTaskId(taskId);
      
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the task list after successful update
        await fetchTasks();
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleTaskComplete = async (taskId: number, currentStatus: boolean) => {
    try {
      setUpdatingTaskId(taskId);
      
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the task list after successful update
        await fetchTasks();
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Refresh when refreshTrigger prop changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchTasks();
    }
  }, [refreshTrigger]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all duration-200 shadow-sm">🔴 High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-all duration-200 shadow-sm">🟡 Medium</Badge>;
      case 'low':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-all duration-200 shadow-sm">🟢 Low</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 shadow-sm">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={addTask} />
        
        {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">
            Tasks
          </h2>
          <Button 
            onClick={fetchTasks} 
            variant="outline" 
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
          >
            Refresh
          </Button>
        </div>
        
        <Card className="py-16 rounded-3xl glass-card shadow-2xl animate-scale-in">
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin h-8 w-8 border-3 border-purple-300/30 border-t-purple-400 rounded-full"></div>
              <span className="text-off-white/70 font-medium text-lg">Loading your tasks...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={addTask} />
        
        {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">
            Tasks
          </h2>
          <Button 
            onClick={fetchTasks} 
            variant="outline" 
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
          >
            Refresh
          </Button>
        </div>
        
        <Card className="py-16 rounded-3xl glass-card shadow-2xl animate-scale-in">
          <CardContent className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-off-white font-medium text-lg">{error}</span>
            </div>
            <Button 
              onClick={fetchTasks} 
              variant="outline"
              className="glass-dark border-purple-400/30 text-purple-300 hover:bg-purple-400/10 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add Task Form */}
      <AddTaskForm onTaskAdded={addTask} />
      
              {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-off-white tracking-wide">
            Tasks ({tasks.length})
          </h2>
          <Button 
            onClick={fetchTasks} 
            variant="outline" 
            size="sm"
            className="glass-dark border-purple-400/30 text-purple-300 hover:bg-purple-400/10 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Refresh
          </Button>
        </div>
      
      {tasks.length === 0 ? (
        <Card className="py-20 rounded-3xl glass-card shadow-2xl animate-scale-in">
          <CardContent className="text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl glow-purple animate-float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-off-white text-xl font-semibold">
                No tasks yet. Create your first one above ✨
              </p>
              <p className="text-off-white/60 text-base">
                Start your journey to balanced productivity
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="glass-card rounded-3xl shadow-2xl hover:shadow-purple-500/20 hover:scale-103 transition-all duration-500 hover:border-purple-400/50 animate-fade-in-up group"
            >
              {editingTaskId === task.id ? (
                /* Edit Mode */
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white/80 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white/80 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                        Priority
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) => setEditForm({...editForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white/80 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 transition-all duration-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => updateTask(task.id)}
                      disabled={updatingTaskId === task.id || !editForm.title.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {updatingTaskId === task.id ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              ) : (
                /* View Mode */
                <>
                  <CardHeader className="pb-3 px-8 pt-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 transition-all duration-200 ${
                            task.completed ? 'bg-emerald-400' : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className={`text-xl font-semibold leading-tight transition-all duration-300 ${
                            task.completed ? 'line-through text-off-white/50' : 'text-off-white'
                          }`}>
                            {task.title}
                          </CardTitle>
                          <div className="mt-3">
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => startEdit(task)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                          className="glass-dark border-purple-400/30 text-purple-300 hover:bg-purple-400/10 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteTask(task.id)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                          className="glass-dark border-red-400/30 text-red-300 hover:bg-red-400/10 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          {updatingTaskId === task.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-8 pb-8">
                    {task.description && (
                      <p className="text-off-white/70 mb-6 leading-relaxed text-base">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="space-y-4">
                      <div className="text-sm text-off-white/50 font-medium">
                        {formatDate(task.createdAt)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          task.completed 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-lg' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg'
                        }`}>
                          {task.completed ? '✓ Completed' : '○ In Progress'}
                        </span>
                        
                        {!task.completed ? (
                          <Button
                            onClick={() => markAsComplete(task.id)}
                            disabled={updatingTaskId === task.id}
                            variant="outline"
                            size="sm"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 hover:shadow-sm transition-all duration-200"
                          >
                            {updatingTaskId === task.id ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-emerald-600 border-t-transparent rounded-full mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              'Complete'
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => toggleTaskComplete(task.id, task.completed)}
                            disabled={updatingTaskId === task.id}
                            variant="outline"
                            size="sm"
                            className="bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200 hover:shadow-sm transition-all duration-200"
                          >
                            {updatingTaskId === task.id ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-sky-600 border-t-transparent rounded-full mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              'Reopen'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 