'use client';

import Link from 'next/link';
import { useState } from 'react';
import TaskList from '../TaskList';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen">
      {/* Header with glass-morphism */}
      <header className="glass-light border-b border-purple-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with glow effect */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl glow-purple transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                                 <span className="text-xl font-semibold text-purple-800 tracking-wide">
                   BalanceBuddy
                 </span>
              </Link>
            </div>

            {/* Navigation with enhanced styling */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg glow-purple'
                    : 'text-off-white/70 hover:text-off-white hover:bg-off-white/10'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'tasks'
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg glow-purple'
                    : 'text-off-white/70 hover:text-off-white hover:bg-off-white/10'
                }`}
              >
                Add Task
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg glow-purple'
                    : 'text-off-white/70 hover:text-off-white hover:bg-off-white/10'
                }`}
              >
                Settings
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="outline" size="sm" className="glass-dark border-off-white/20 text-off-white hover:bg-off-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with enhanced dark theme */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12 animate-fade-in-up">
          {/* Welcome section with enhanced typography */}
          <div className="text-center space-y-6">
                         <h1 className="text-5xl font-bold text-purple-800 tracking-tight">
               Your Planning Dashboard
             </h1>
             <p className="text-xl text-purple-600 max-w-3xl mx-auto leading-relaxed">
               Organize your day, track progress, and maintain focus on your scheduled tasks
             </p>
          </div>

          {/* Enhanced stats cards with glass-morphism */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-8 transform hover:scale-103 transition-all duration-500 hover:shadow-2xl group animate-scale-in">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center group-hover:animate-glow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-off-white">0</p>
                  <p className="text-off-white/60 font-medium">Completed Today</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 transform hover:scale-103 transition-all duration-500 hover:shadow-2xl group animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:animate-glow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-off-white">0</p>
                  <p className="text-off-white/60 font-medium">Pending Tasks</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 transform hover:scale-103 transition-all duration-500 hover:shadow-2xl group animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:animate-glow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-off-white">0%</p>
                  <p className="text-off-white/60 font-medium">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task management section with glass-morphism */}
          <div className="glass-card rounded-3xl p-10 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <TaskList />
          </div>

          {/* Additional floating elements for ambiance */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-muted-teal-900/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-muted-plum-900/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
            <div className="absolute top-3/4 right-1/3 w-24 h-24 bg-soft-olive-900/10 rounded-full blur-3xl animate-float" style={{animationDelay: '6s'}}></div>
          </div>
        </div>
      </main>
    </div>
  );
} 