'use client';

import { useState, useEffect } from 'react';
import { useJourneyStore } from '../../hooks/useJourneyStore';

export default function LoadingSpinner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Searching for accessible paths...');
  const [progress, setProgress] = useState(0);
  
  // Messages to cycle through during loading
  const loadingMessages = [
    'Searching for accessible paths...',
    'Finding step-free stations...',
    'Calculating optimal routes...',
    'Checking accessibility features...',
    'Almost there...'
  ];

  useEffect(() => {
    // In a real app, we would connect this to real loading states
    // For demo purposes, we simulate loading when component mounts
    
    let messageIndex = 0;
    let progressValue = 0;
    
    if (isVisible) {
      // Update progress every 150ms
      const progressInterval = setInterval(() => {
        progressValue += 2;
        if (progressValue >= 100) {
          clearInterval(progressInterval);
          setIsVisible(false);
        } else {
          setProgress(progressValue);
          
          // Change message every 20% progress
          if (progressValue % 20 === 0) {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
          }
        }
      }, 150);
      
      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, loadingMessages]);

  // Function to show the spinner (would be called when starting a route search)
  const showSpinner = () => {
    setProgress(0);
    setLoadingMessage(loadingMessages[0]);
    setIsVisible(true);
  };

  return (
    <div 
      id="loading-spinner" 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-opacity duration-300`}
      aria-live="assertive" 
      aria-atomic="true" 
      role="status"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="mr-4 text-blue-600 dark:text-blue-400">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Finding Your Route</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{loadingMessage}</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-200 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 