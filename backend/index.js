const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware for CORS - allow requests from frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
  credentials: true
}));

// Middleware for parsing JSON requests
app.use(express.json());

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// Helper function to find task by ID
const findTaskById = (id) => {
  return tasks.find(task => task.id === parseInt(id));
};

// Helper function to validate task data
const validateTask = (task) => {
  if (!task.title || typeof task.title !== 'string' || task.title.trim() === '') {
    return { isValid: false, error: 'Title is required and must be a non-empty string' };
  }
  return { isValid: true };
};

// Root route that responds with 'Hello BalanceBuddy'
app.get('/', (req, res) => {
  res.send('Hello BalanceBuddy');
});

// GET /tasks - Retrieve all tasks
app.get('/tasks', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks'
    });
  }
});

// POST /tasks - Add a new task
app.post('/tasks', (req, res) => {
  try {
    const { 
      title, 
      description, 
      completed = false, 
      priority = 'medium',
      scheduledTime,
      duration = 30
    } = req.body;
    
    // Validate required fields
    const validation = validateTask({ title });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Create new task
    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: Boolean(completed),
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      scheduledTime: scheduledTime || null,
      duration: typeof duration === 'number' && duration > 0 ? duration : 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      completed, 
      priority,
      scheduledTime,
      duration
    } = req.body;

    // Find the task
    const task = findTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Validate title if provided
    if (title !== undefined) {
      const validation = validateTask({ title });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
      task.title = title.trim();
    }

    // Update other fields if provided
    if (description !== undefined) {
      task.description = description ? description.trim() : '';
    }
    if (completed !== undefined) {
      task.completed = Boolean(completed);
    }
    if (priority !== undefined) {
      task.priority = ['low', 'medium', 'high'].includes(priority) ? priority : task.priority;
    }
    if (scheduledTime !== undefined) {
      task.scheduledTime = scheduledTime;
    }
    if (duration !== undefined) {
      task.duration = typeof duration === 'number' && duration > 0 ? duration : task.duration;
    }

    task.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

// GET /tasks/:id - Get a specific task by ID (bonus endpoint)
app.get('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = findTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve task'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    / - Hello message');
  console.log('  GET    /tasks - Get all tasks');
  console.log('  POST   /tasks - Create a new task');
  console.log('  GET    /tasks/:id - Get a specific task');
  console.log('  PUT    /tasks/:id - Update a task');
  console.log('  DELETE /tasks/:id - Delete a task');
  console.log('Server should be running continuously...');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle process events
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Script execution completed, server should be listening...'); 