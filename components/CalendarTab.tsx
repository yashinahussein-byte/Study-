import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentType, ReviewItem } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, LayoutGrid, List } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'assignment' | 'review';
  assignmentType?: AssignmentType;
  status?: string;
}

type ViewMode = 'month' | 'week' | 'day';

export const CalendarTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});

  // Load data and build events map
  useEffect(() => {
    const loadEvents = () => {
      const loadedEvents: Record<string, CalendarEvent[]> = {};
      const addEvent = (date: string, event: CalendarEvent) => {
        if (!loadedEvents[date]) loadedEvents[date] = [];
        loadedEvents[date].push(event);
      };

      // 1. Load Assignments
      try {
        const savedAssignments: Assignment[] = JSON.parse(localStorage.getItem('assignments') || '[]');
        savedAssignments.forEach(a => {
          addEvent(a.dueDate, {
            id: a.id,
            title: `${a.subject}: ${a.name}`,
            date: a.dueDate,
            type: 'assignment',
            assignmentType: a.type,
            status: a.status
          });
        });
      } catch (e) { console.error("Failed to load assignments for calendar", e); }

      // 2. Load and calculate Reviews
      try {
        const savedReviews: ReviewItem[] = JSON.parse(localStorage.getItem('reviewItems') || '[]');
        savedReviews.forEach(item => {
            const created = new Date(item.createdDate + 'T00:00:00');
            created.setMinutes(created.getMinutes() + created.getTimezoneOffset());

            item.intervals.forEach(interval => {
                const dueDate = new Date(created);
                dueDate.setDate(created.getDate() + interval);
                const dateStr = dueDate.toISOString().split('T')[0];
                
                addEvent(dateStr, {
                    id: `${item.id}-${interval}`,
                    title: `Review: ${item.lessonName}`,
                    date: dateStr,
                    type: 'review',
                    assignmentType: item.type // Use the item's type for color coding in calendar too
                });
            });
        });
      } catch (e) { console.error("Failed to load reviews for calendar", e); }

      setEvents(loadedEvents);
    };

    loadEvents();
  }, []);

  // Navigation Logic
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const modifier = direction === 'next' ? 1 : -1;

    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + modifier);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (modifier * 7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + modifier);
        break;
    }
    setCurrentDate(newDate);
  };

  const getHeaderText = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = currentDate.getFullYear();
    const month = monthNames[currentDate.getMonth()];

    if (viewMode === 'month') return `${month} ${year}`;
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    // Week view header
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    // If same month
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${month} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
    }
    // Different months
    return `${monthNames[startOfWeek.getMonth()].substring(0, 3)} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()].substring(0, 3)} ${endOfWeek.getDate()}, ${year}`;
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventColorClass = (event: CalendarEvent) => {
      // Optional: distinguish review tasks visually from actual due dates,
      // even if they share the same color base.
      const baseClasses = event.type === 'review' ? 'opacity-75 border-dashed' : '';

      switch (event.assignmentType) {
          case AssignmentType.EXAM:
          case AssignmentType.TEST: return `bg-red-100 text-red-800 border-l-4 border-red-500 ${baseClasses}`;
          case AssignmentType.SUMMATIVE: return `bg-purple-100 text-purple-800 border-l-4 border-purple-500 ${baseClasses}`;
          case AssignmentType.PROJECT: return `bg-pink-100 text-pink-800 border-l-4 border-pink-500 ${baseClasses}`;
          case AssignmentType.FORMATIVE:
          case AssignmentType.QUIZ: return `bg-amber-100 text-amber-800 border-l-4 border-amber-500 ${baseClasses}`;
          default: return `bg-blue-100 text-blue-800 border-l-4 border-blue-500 ${baseClasses}`;
      }
  };

  // --- RENDERERS ---

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-gray-50/50 border-r border-b border-gray-100 min-h-[100px] sm:min-h-[120px]" />;
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = events[dateStr] || [];
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className={`border-r border-b border-gray-100 min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 transition-colors ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex justify-center sm:justify-start">
                  <span className={`text-xs sm:text-sm font-medium p-1 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="mt-1 sm:mt-2 space-y-1 overflow-y-auto max-h-[70px] sm:max-h-[85px] scrollbar-hide">
                  {dayEvents.map(event => (
                    <div key={event.id} className={`text-[10px] sm:text-xs p-1 rounded-md truncate font-medium ${getEventColorClass(event)}`} title={event.title}>
                      {event.type === 'review' ? 'R: ' : ''}{event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
           {weekDays.map(date => {
              const isToday = date.toISOString().split('T')[0] === todayStr;
              return (
                <div key={date.toString()} className={`py-3 text-center flex flex-col items-center ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                   <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                   <span className={`text-lg font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : ''}`}>
                       {date.getDate()}
                   </span>
                </div>
              );
           })}
        </div>
        <div className="grid grid-cols-7 min-h-[500px] divide-x divide-gray-100">
           {weekDays.map(date => {
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = events[dateStr] || [];
              const isToday = dateStr === todayStr;
              return (
                  <div key={dateStr} className={`p-2 ${isToday ? 'bg-blue-50/30' : ''}`}>
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`text-xs p-2 rounded-md font-medium shadow-sm ${getEventColorClass(event)}`}>
                            {event.type === 'review' ? 'Review: ' : ''}{event.title}
                            </div>
                        ))}
                      </div>
                  </div>
              )
           })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvents = events[dateStr] || [];
      
      return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] p-6">
              {dayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <CalIcon size={48} className="mb-4 opacity-50"/>
                      <p className="text-xl font-medium">No events scheduled for this day</p>
                  </div>
              ) : (
                  <div className="space-y-3 max-w-3xl mx-auto">
                      {dayEvents.map(event => (
                          <div key={event.id} className={`p-4 rounded-lg shadow-sm border flex items-center gap-4 ${getEventColorClass(event).replace('border-l-4', 'border-l-[6px]')}`}>
                              <div className="flex-1">
                                   <h4 className="font-bold text-lg">{event.title}</h4>
                                   <div className="flex items-center gap-2">
                                     <span className="text-sm opacity-90 capitalize font-semibold">
                                        {event.type === 'review' ? 'Review Task' : 'Assignment Due'}
                                     </span>
                                     {event.assignmentType && (
                                         <span className="text-xs opacity-75 px-2 py-0.5 bg-black/10 rounded-full">
                                             {event.assignmentType}
                                         </span>
                                     )}
                                   </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between lg:justify-start gap-4">
             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 w-full lg:w-auto truncate">
                {getHeaderText()}
            </h2>
            <div className="flex gap-1 lg:hidden bg-gray-100 p-1 rounded-lg flex-shrink-0">
                 <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} /></button>
                 <button onClick={() => navigate('next')} className="p-1.5 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} /></button>
            </div>
        </div>
       
        <div className="flex items-center justify-between gap-4">
            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('month')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <LayoutGrid size={16} className="hidden sm:block"/> Month
                </button>
                 <button 
                    onClick={() => setViewMode('week')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <CalIcon size={16} className="hidden sm:block"/> Week
                </button>
                 <button 
                    onClick={() => setViewMode('day')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'day' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <List size={16} className="hidden sm:block"/> Day
                </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-2 items-center">
                <button onClick={() => navigate('prev')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                    Today
                </button>
                <button onClick={() => navigate('next')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>

      {/* Main Calendar View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span>Homework</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span>Quizzes & Formatives</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span>Summatives</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-full"></div><span>Projects</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Tests & Exams</span></div>
          <div className="flex items-center gap-2 opacity-75"><div className="w-3 h-3 bg-gray-400 border-dashed border-gray-600 rounded-full"></div><span>(Dashed = Review Task)</span></div>
      </div>
    </div>
  );
};