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
  duration?: number; // in minutes
}

interface TimelineViewProps {
  tasks: Task[];
  onTaskSchedule: (taskId: number, time: string, duration: number) => void;
  onTaskCreate: (time: string) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export default function TimelineView({ tasks, onTaskSchedule, onTaskCreate, onTaskUpdate, onTaskDelete }: TimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Generate time slots for the day (6 AM to 10 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get tasks scheduled for a specific time slot
  const getTasksForSlot = (timeSlot: string) => {
    return tasks.filter(task => 
      task.scheduledTime && 
      task.scheduledTime.slice(0, 5) === timeSlot
    );
  };

  // Handle drag start - both from timeline and from sidebar
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    
    // Try to get task from drag data first (for sidebar drags)
    const taskDataStr = e.dataTransfer.getData('application/json');
    let taskToSchedule = draggedTask;
    
    if (taskDataStr) {
      try {
        taskToSchedule = JSON.parse(taskDataStr);
      } catch (err) {
        console.error('Error parsing dragged task:', err);
      }
    }
    
    if (taskToSchedule) {
      onTaskSchedule(taskToSchedule.id, timeSlot, taskToSchedule.duration || 30);
      setDraggedTask(null);
    }
    setHoveredSlot(null);
  };

  // Handle drag enter
  const handleDragEnter = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    setHoveredSlot(timeSlot);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear hover if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setHoveredSlot(null);
    }
  };

  // Format time for display
  const formatTime = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  // Get priority class for task blocks
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle task deletion
  const handleTaskDelete = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskDelete(taskId);
  };

  // Handle unscheduling (removing from timeline)
  const handleUnscheduleTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTask = { ...task, scheduledTime: undefined };
    onTaskUpdate(updatedTask);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Header */}
      <div className="schedule-header glass-light p-6 border-b border-muted sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-soft">Daily Schedule</h2>
            <p className="text-muted text-sm mt-1">{formatDate(selectedDate)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-0 p-4">
          {timeSlots.map((timeSlot) => {
            const slotTasks = getTasksForSlot(timeSlot);
            const isHovered = hoveredSlot === timeSlot;
            
            return (
              <div
                key={timeSlot}
                className={`time-slot timeline-slot drop-zone min-h-[60px] rounded-lg p-4 transition-all duration-300 ${isHovered ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, timeSlot)}
                onDragEnter={(e) => handleDragEnter(e, timeSlot)}
                onDragLeave={handleDragLeave}
                onClick={() => onTaskCreate(timeSlot)}
              >
                <div className="flex items-start space-x-4">
                  {/* Time Label */}
                  <div className="w-24 flex-shrink-0">
                    <span className="text-sm font-semibold text-muted">
                      {formatTime(timeSlot)}
                    </span>
                  </div>

                  {/* Task Area */}
                  <div className="flex-1 min-h-[40px] relative">
                    {slotTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-10 text-muted text-sm opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Click to add task or drag here</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotTasks.map((task, index) => (
                          <div
                            key={`${task.id}-${timeSlot}-${index}`}
                            className={`task-block ${getPriorityClass(task.priority)} rounded-xl p-4 cursor-pointer draggable group relative`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => onTaskUpdate(task)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-sm truncate">
                                    {task.title}
                                  </h4>
                                  {task.completed && (
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs opacity-80 mb-2 truncate">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-3 text-xs opacity-70">
                                  <span>
                                    ⏱️ {task.duration || 30}m
                                  </span>
                                  <span>
                                    🏷️ {task.priority}
                                  </span>
                                </div>
                              </div>

                              {/* Task Actions */}
                              <div className="flex items-center space-x-1 ml-3 task-delete-btn">
                                <button
                                  onClick={(e) => handleUnscheduleTask(task, e)}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-600 transition-colors"
                                  title="Remove from schedule"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => handleTaskDelete(task.id, e)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-600 transition-colors"
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
                    
                    {/* Drop Indicator */}
                    {isHovered && <div className="drop-indicator"></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Footer */}
      <div className="glass-light border-t border-muted p-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {tasks.filter(t => t.scheduledTime).length} scheduled tasks
          </span>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 