'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const [message, setMessage] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">BalanceBuddy</h1>
          <p className="text-lg text-gray-600 mb-8">Your Personal Finance Companion</p>
        </div>

        {/* Backend Message Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
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
            <li>Proxy configuration for API calls</li>
            <li>Real-time backend connectivity</li>
          </ul>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-solid border-blue-600 transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Refresh Connection
          </button>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="http://localhost:5000"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Backend Directly
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
