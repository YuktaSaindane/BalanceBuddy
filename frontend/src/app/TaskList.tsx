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
        // Update the task in local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? result.data : task
          )
        );
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
    if (!window.confirm('Are you sure you want to delete this task?')) {
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
        // Remove the task from local state
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
        return <Badge className="bg-red-500 text-white hover:bg-red-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={addTask} />
        
        {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Tasks
          </h2>
          <Button onClick={fetchTasks} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-muted-foreground">Loading tasks...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Add Task Form */}
        <AddTaskForm onTaskAdded={addTask} />
        
        {/* Tasks Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Tasks
          </h2>
          <Button onClick={fetchTasks} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        
        <Card className="py-12">
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 bg-destructive rounded-full"></div>
              <span className="text-destructive">Error: {error}</span>
            </div>
            <Button onClick={fetchTasks} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Add Task Form */}
      <AddTaskForm onTaskAdded={addTask} />
      
      {/* Tasks Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Tasks ({tasks.length})
        </h2>
        <Button onClick={fetchTasks} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              No tasks found. Add your first task above!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              {editingTaskId === task.id ? (
                /* Edit Mode */
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({...editForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTask(task.id)}
                      disabled={updatingTaskId === task.id || !editForm.title.trim()}
                      size="sm"
                    >
                      {updatingTaskId === task.id ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              ) : (
                /* View Mode */
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            task.completed ? 'bg-green-500' : 'bg-muted-foreground'
                          }`}
                        />
                        <CardTitle className={`text-lg ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </CardTitle>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(task)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => deleteTask(task.id)}
                          disabled={updatingTaskId === task.id}
                          variant="destructive"
                          size="sm"
                        >
                          {updatingTaskId === task.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {task.description && (
                      <p className="text-muted-foreground mb-4">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={`font-medium ${
                          task.completed ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                        <span>Created: {formatDate(task.createdAt)}</span>
                      </div>
                      
                      {!task.completed ? (
                        <Button
                          onClick={() => markAsComplete(task.id)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        >
                          {updatingTaskId === task.id ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => toggleTaskComplete(task.id, task.completed)}
                          disabled={updatingTaskId === task.id}
                          variant="outline"
                          size="sm"
                          className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        >
                          {updatingTaskId === task.id ? (
                            <>
                              <div className="animate-spin h-3 w-3 border-2 border-orange-600 border-t-transparent rounded-full mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            'Mark Pending'
                          )}
                        </Button>
                      )}
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