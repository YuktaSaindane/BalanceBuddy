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
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 transition-all duration-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 transition-all duration-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-all duration-200">Low</Badge>;
      default:
        return <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200">{priority}</Badge>;
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
        
        <Card className="py-16 rounded-3xl shadow-sm border-slate-200/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-transparent rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Loading your tasks...</span>
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
        
        <Card className="py-16 rounded-3xl shadow-sm border-slate-200/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 bg-rose-400 rounded-full"></div>
              <span className="text-slate-700 dark:text-slate-300">{error}</span>
            </div>
            <Button 
              onClick={fetchTasks} 
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
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
        <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">
          Tasks ({tasks.length})
        </h2>
        <Button 
          onClick={fetchTasks} 
          variant="outline" 
          size="sm"
          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
        >
          Refresh
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <Card className="py-16 rounded-3xl shadow-sm border-slate-200/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No tasks yet. Create your first one above ✨
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="rounded-3xl shadow-sm border-slate-200/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.02] transition-all duration-200 hover:border-slate-300/50"
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
                      className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white border-0 hover:from-emerald-500 hover:to-sky-500 shadow-sm hover:shadow-md transition-all duration-200"
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
                          <CardTitle className={`text-lg font-semibold leading-tight transition-all duration-200 ${
                            task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'
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
                          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all duration-200"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteTask(task.id)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:shadow-sm transition-all duration-200"
                        >
                          {updatingTaskId === task.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-8 pb-8">
                    {task.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="space-y-4">
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {formatDate(task.createdAt)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          task.completed 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
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