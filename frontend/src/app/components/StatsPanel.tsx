'use client';

import { useState, useEffect } from 'react';

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

interface StatsPanelProps {
  tasks: Task[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StatsPanel({ tasks, isCollapsed = false, onToggleCollapse }: StatsPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const scheduledTasks = tasks.filter(task => task.scheduledTime && !task.completed).length;
    const unscheduledTasks = tasks.filter(task => !task.scheduledTime && !task.completed).length;
    
    // Calculate today's stats
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const completedToday = tasks.filter(task => {
      if (!task.completed) return false;
      const updatedDate = new Date(task.updatedAt).toISOString().split('T')[0];
      return updatedDate === todayStr;
    }).length;
    
    const scheduledToday = tasks.filter(task => 
      task.scheduledTime && 
      task.scheduledTime.includes(todayStr.slice(5)) // rough date match
    ).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      scheduledTasks,
      unscheduledTasks,
      completedToday,
      scheduledToday,
      completionRate
    };
  };

  const stats = calculateStats();

  // Self-care suggestions
  const selfCareSuggestions = [
    { icon: '💧', text: 'Drink a glass of water', action: 'Stay hydrated' },
    { icon: '🚶', text: 'Take a 5-minute walk', action: 'Stretch your legs' },
    { icon: '👁️', text: 'Look away from screen for 20 seconds', action: '20-20-20 rule' },
    { icon: '🫁', text: 'Take 3 deep breaths', action: 'Reduce stress' },
    { icon: '🧘', text: 'Do a quick meditation', action: 'Clear your mind' },
    { icon: '☀️', text: 'Get some natural light', action: 'Boost energy' },
  ];

  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  // Rotate suggestions every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % selfCareSuggestions.length);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Break reminder logic
  useEffect(() => {
    const checkBreakTime = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      // Suggest break every hour at :00
      if (minutes === 0 && !showBreakReminder) {
        setShowBreakReminder(true);
        setTimeout(() => setShowBreakReminder(false), 300000); // Hide after 5 minutes
      }
    };

    const timer = setInterval(checkBreakTime, 60000);
    return () => clearInterval(timer);
  }, [showBreakReminder]);

  if (isCollapsed) {
    return (
      <div className="w-16 glass-card border-l border-muted flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Expand stats panel"
        >
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-xs text-muted writing-mode-vertical transform rotate-180">
          Stats
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 glass-card border-l border-muted flex flex-col h-full animate-slide-in-right">
      {/* Panel Header */}
      <div className="p-4 border-b border-muted">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-soft">Dashboard</h2>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Collapse stats panel"
          >
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Current Time */}
        <div className="text-center">
          <div className="text-2xl font-bold text-soft">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm text-muted">
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-soft mb-3">Statistics</h3>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.completedToday}</div>
            <div className="text-xs text-muted">Completed Today</div>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.scheduledTasks}</div>
            <div className="text-xs text-muted">Scheduled</div>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.unscheduledTasks}</div>
            <div className="text-xs text-muted">Unscheduled</div>
          </div>
          <div className="glass-light rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.completionRate}%</div>
            <div className="text-xs text-muted">Completion Rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-soft">Daily Progress</span>
            <span className="text-sm text-muted">{stats.completedTasks}/{stats.totalTasks}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-light rounded-lg p-4">
          <h4 className="text-sm font-semibold text-soft mb-3">By Priority</h4>
          <div className="space-y-2">
            {['high', 'medium', 'low'].map(priority => {
              const count = tasks.filter(t => t.priority === priority && !t.completed).length;
              const completed = tasks.filter(t => t.priority === priority && t.completed).length;
              const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${color}-400`}></div>
                    <span className="text-sm text-soft capitalize">{priority}</span>
                  </div>
                  <span className="text-sm text-muted">{completed}/{count + completed}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Break Reminder */}
      {showBreakReminder && (
        <div className="mx-4 mb-4 glass-light rounded-lg p-4 border border-orange-400/30 animate-scale-in-gentle">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-lg">⏰</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange-400">Break Time!</h4>
              <p className="text-xs text-muted">Time for a quick break</p>
            </div>
          </div>
          <button
            onClick={() => setShowBreakReminder(false)}
            className="w-full btn-secondary py-2 text-sm rounded-lg"
          >
            I'll take a break
          </button>
        </div>
      )}

      {/* Self-Care Suggestions */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-soft mb-3">Wellness Tips</h3>
        <div className="glass-light rounded-lg p-4 animate-fade-in-smooth">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{selfCareSuggestions[currentSuggestion].icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-soft mb-1">
                {selfCareSuggestions[currentSuggestion].action}
              </h4>
              <p className="text-xs text-muted mb-3">
                {selfCareSuggestions[currentSuggestion].text}
              </p>
              <button 
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                onClick={() => setCurrentSuggestion((prev) => (prev + 1) % selfCareSuggestions.length)}
              >
                Next tip →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-muted mt-auto">
        <h3 className="text-lg font-semibold text-soft mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full btn-secondary py-2 text-sm rounded-lg flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start Focus Timer</span>
          </button>
          <button className="w-full btn-secondary py-2 text-sm rounded-lg flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-muted">
        <div className="text-xs text-muted text-center">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
} 