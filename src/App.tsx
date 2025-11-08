import React, { useState, useEffect } from 'react';
import { AssignmentsTab } from './components/AssignmentsTab';
import { ReviewPlanTab } from './components/ReviewPlanTab';
import { CalendarTab } from './components/CalendarTab';
import { HomeTab } from './components/HomeTab';
import { FocusTab } from './components/FocusTab';
import { LogOut, BookOpen, Calendar as CalendarIcon, Home, Timer, Flame } from 'lucide-react';
import { StreakData } from './types';

function App() {
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('appTitle') || 'TaskScholar');
  const [activeTab, setActiveTab] = useState<'home' | 'assignments' | 'review' | 'calendar' | 'focus'>('home');

  // --- Global Streak State ---
  const [streak, setStreak] = useState<StreakData>(() => {
      const saved = localStorage.getItem('streakData');
      return saved ? JSON.parse(saved) : { count: 0, lastActivityDate: '' };
  });

  useEffect(() => {
    localStorage.setItem('appTitle', appTitle);
  }, [appTitle]);

  useEffect(() => {
      localStorage.setItem('streakData', JSON.stringify(streak));
  }, [streak]);

  // Centralized activity handler
  const handleActivity = () => {
      const today = new Date().toISOString().split('T')[0];
      
      setStreak(prev => {
          // Already counted for today
          if (prev.lastActivityDate === today) {
              return prev;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (prev.lastActivityDate === yesterdayStr) {
              // Continued streak
              return { count: prev.count + 1, lastActivityDate: today };
          } else {
              // Broken streak or first time
              return { count: 1, lastActivityDate: today };
          }
      });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-primary rounded px-2 -ml-2 w-48 sm:w-64 truncate transition-all"
              aria-label="Application Title"
              placeholder="Enter Title..."
            />
             {/* Streak Indicator in Header */}
             <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold text-sm" title={`${streak.count} day streak!`}>
                <Flame size={16} fill="currentColor" />
                <span>{streak.count}</span>
            </div>
          </div>
          <div>
             {/* Placeholder for generic logout */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 mt-2 overflow-x-auto scrollbar-hide">
            <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'home'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home size={18} />
                Home
            </button>
            <button
                onClick={() => setActiveTab('assignments')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'assignments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen size={18} />
                Assignments
            </button>
            <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'review'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <RefreshCwIcon size={18} />
                Review Plan
            </button>
            <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CalendarIcon size={18} />
                Calendar
            </button>
             <button
                onClick={() => setActiveTab('focus')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'focus'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Timer size={18} />
                Focus & Streak
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'assignments' && <AssignmentsTab onActivity={handleActivity} />}
        {activeTab === 'review' && <ReviewPlanTab onActivity={handleActivity} />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'focus' && <FocusTab streak={streak} onActivity={handleActivity} />}
      </main>
    </div>
  );
}

// Small helper for the icon above if lucide-react doesn't export RefreshCwIcon specifically by that name, usually it's RefreshCw
import { RefreshCw as RefreshCwIcon } from 'lucide-react';

export default App;
