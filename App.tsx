import React, { useState, useEffect } from 'react';
import { AssignmentsTab } from './components/AssignmentsTab';
import { ReviewPlanTab } from './components/ReviewPlanTab';
import { CalendarTab } from './components/CalendarTab';
import { HomeTab } from './components/HomeTab';
import { FocusTab } from './components/FocusTab';
import { LogOut, BookOpen, CalendarDays, Calendar as CalendarIcon, Home, Timer } from 'lucide-react';

function App() {
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('appTitle') || 'TaskScholar');
  const [activeTab, setActiveTab] = useState<'home' | 'assignments' | 'review' | 'calendar' | 'focus'>('home');

  useEffect(() => {
    localStorage.setItem('appTitle', appTitle);
  }, [appTitle]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-primary rounded px-2 -ml-2 w-64 truncate transition-all"
              aria-label="Application Title"
              placeholder="Enter Title..."
            />
          </div>
          <div>
             {/* Placeholder for generic logout if needed, though no auth is implemented */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <LogOut size={16} />
              Logout
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
        {activeTab === 'assignments' && <AssignmentsTab />}
        {activeTab === 'review' && <ReviewPlanTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'focus' && <FocusTab />}
      </main>
    </div>
  );
}

// Small helper for the icon above if lucide-react doesn't export RefreshCwIcon specifically by that name, usually it's RefreshCw
import { RefreshCw as RefreshCwIcon } from 'lucide-react';

export default App;