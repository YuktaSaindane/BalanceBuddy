'use client';

import TaskList from './TaskList';



export default function Home() {

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8 text-blue-600">BalanceBuddy</h1>
        </div>



        {/* Task Management */}
        <TaskList />
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Frontend: localhost:3000 | Backend: localhost:5000
        </div>
      </footer>
    </div>
  );
}
