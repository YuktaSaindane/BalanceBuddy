'use client';

import TaskList from './TaskList';



export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-2xl px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-3 text-slate-800 dark:text-slate-100 tracking-wide">BalanceBuddy</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Organize your tasks with calm and clarity</p>
        </div>

        {/* Task Management */}
        <TaskList />
      </div>

      <footer className="mt-8 text-xs text-slate-500 dark:text-slate-500">
        Frontend: localhost:3000 | Backend: localhost:5000
      </footer>
    </div>
  );
}
