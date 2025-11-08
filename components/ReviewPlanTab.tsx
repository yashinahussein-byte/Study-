import React, { useState, useEffect } from 'react';
import { ReviewItem, AssignmentType } from '../types';
import { Plus, Trash2, CheckCircle, Circle, Calendar, RefreshCw, Info, Edit2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PRESET_INTERVALS = [1, 3, 7, 14, 30]; // Standard spaced repetition

export const ReviewPlanTab: React.FC = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('reviewItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [type, setType] = useState<AssignmentType>(AssignmentType.HOMEWORK);
  const [customIntervals, setCustomIntervals] = useState(PRESET_INTERVALS.join(', '));

  useEffect(() => {
    localStorage.setItem('reviewItems', JSON.stringify(reviewItems));
  }, [reviewItems]);

  const resetForm = () => {
      setSubject('');
      setLessonName('');
      setType(AssignmentType.HOMEWORK);
      setCustomIntervals(PRESET_INTERVALS.join(', '));
      setEditingId(null);
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse intervals, allowing 0 for "today"
    const intervals = customIntervals
      .split(',')
      .map(i => parseInt(i.trim()))
      .filter(i => !isNaN(i) && i >= 0)
      .sort((a, b) => a - b);

    const finalIntervals = intervals.length > 0 ? intervals : PRESET_INTERVALS;

    if (editingId) {
        // Update existing
        setReviewItems(prev => prev.map(item => 
            item.id === editingId 
                ? { ...item, subject, lessonName, type, intervals: finalIntervals }
                : item
        ));
    } else {
        // Create new
        const newItem: ReviewItem = {
            id: uuidv4(),
            subject,
            lessonName,
            type,
            createdDate: new Date().toISOString().split('T')[0],
            intervals: finalIntervals,
            completedReviews: []
        };
        setReviewItems(prev => [...prev, newItem]);
    }
    resetForm();
  };

  const handleEditItem = (item: ReviewItem) => {
      setEditingId(item.id);
      setSubject(item.subject);
      setLessonName(item.lessonName);
      setType(item.type || AssignmentType.HOMEWORK); // Fallback for old data
      setCustomIntervals(item.intervals.join(', '));
      // Scroll to form on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = (id: string) => {
      if (window.confirm("Delete this review plan?")) {
         setReviewItems(prev => prev.filter(item => item.id !== id));
         if (editingId === id) resetForm();
      }
  }

  const markReviewedToday = (itemId: string) => {
      const todayStr = new Date().toISOString().split('T')[0];
      setReviewItems(prev => prev.map(item => {
          if (item.id === itemId) {
              if (!item.completedReviews.includes(todayStr)) {
                  return { ...item, completedReviews: [...item.completedReviews, todayStr] };
              }
          }
          return item;
      }));
  };

  const getReviewStatus = (item: ReviewItem) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const created = new Date(item.createdDate + 'T00:00:00');
      created.setMinutes(created.getMinutes() + created.getTimezoneOffset());
      
      const todayStr = new Date().toISOString().split('T')[0];
      const isReviewedToday = item.completedReviews.includes(todayStr);

      const dueDates = item.intervals.map(interval => {
          const dueDate = new Date(created);
          dueDate.setDate(created.getDate() + interval);
          return {
              date: dueDate,
              dateStr: dueDate.toISOString().split('T')[0],
              interval: interval
          };
      });

      const dueTodayOrOverdue = dueDates.filter(d => {
          const dStr = d.date.toISOString().split('T')[0];
          const tStr = today.toISOString().split('T')[0];
          return dStr <= tStr && !item.completedReviews.includes(dStr);
      });

      const nextDue = dueDates.find(d => d.date > today);

      return {
          isDue: dueTodayOrOverdue.length > 0,
          nextDueDate: nextDue ? nextDue.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Done!',
          isReviewedToday
      };
  };

  const getTypeColorClass = (type: AssignmentType) => {
      switch (type) {
          case AssignmentType.EXAM:
          case AssignmentType.TEST: return 'bg-red-100 text-red-800';
          case AssignmentType.SUMMATIVE: return 'bg-purple-100 text-purple-800';
          case AssignmentType.PROJECT: return 'bg-pink-100 text-pink-800';
          case AssignmentType.FORMATIVE:
          case AssignmentType.QUIZ: return 'bg-amber-100 text-amber-800';
          default: return 'bg-blue-100 text-blue-800';
      }
  };

  const itemsDueToday = reviewItems.filter(item => {
      const status = getReviewStatus(item);
      return status.isDue && !status.isReviewedToday;
  });

  const itemsReviewedToday = reviewItems.filter(item => getReviewStatus(item).isReviewedToday);

  const upcomingItems = reviewItems.filter(item => {
       const status = getReviewStatus(item);
       return !status.isDue && !status.isReviewedToday && status.nextDueDate !== 'Done!';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Today's Agenda & Upcoming */}
      <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
        <section>
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Today's Review Agenda
                </h2>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {itemsDueToday.length} Due
                </span>
            </div>
         
          {itemsDueToday.length === 0 && itemsReviewedToday.length === 0 ? (
             <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                 <RefreshCw size={40} className="mx-auto mb-4 text-gray-300" />
                 <p className="text-lg font-medium text-gray-700">Nothing to review today!</p>
                 <p className="text-sm mt-2">Add new topics to start your spaced repetition journey.</p>
             </div>
          ) : (
             <div className="space-y-4">
                 {itemsDueToday.map(item => (
                     <div key={item.id} className="bg-white border-l-4 border-red-500 shadow-sm rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-all gap-4">
                         <div>
                             <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-gray-900">{item.lessonName}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColorClass(item.type || AssignmentType.HOMEWORK)}`}>
                                    {item.type || 'Homework'}
                                </span>
                             </div>
                             <p className="text-gray-600">{item.subject}</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                 <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                     !!! OVERDUE
                                 </span>
                             </div>
                         </div>
                         <div className="flex gap-2 self-end sm:self-center">
                            <button 
                                onClick={() => handleEditItem(item)}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button 
                                onClick={() => markReviewedToday(item.id)}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <CheckCircle size={18} />
                                <span className="hidden sm:inline">Mark Reviewed</span>
                                <span className="sm:hidden">Done</span>
                            </button>
                         </div>
                     </div>
                 ))}
                  {itemsReviewedToday.length > 0 && (
                      <div className="mt-6">
                          <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">Completed Today</h4>
                           <div className="space-y-3 opacity-75">
                            {itemsReviewedToday.map(item => (
                                <div key={item.id} className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-800 strike-through decoration-green-500/50">{item.lessonName}</h3>
                                         <p className="text-xs text-gray-500">{item.subject}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-green-700 font-medium text-sm">
                                        <CheckCircle size={16} /> Reviewed
                                    </span>
                                </div>
                            ))}
                            </div>
                      </div>
                  )}
             </div>
          )}
        </section>

         {upcomingItems.length > 0 && (
              <section className="pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Reviews</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {upcomingItems.map(item => {
                           const status = getReviewStatus(item);
                           return (
                              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="truncate pr-2">
                                          <h3 className="font-semibold text-gray-900 truncate">{item.lessonName}</h3>
                                          <p className="text-sm text-gray-500 truncate">{item.subject}</p>
                                      </div>
                                      <div className="flex flex-shrink-0">
                                        <button onClick={() => handleEditItem(item)} className="text-gray-300 hover:text-blue-500 p-1 transition-colors">
                                              <Edit2 size={16} />
                                          </button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                                  <div className="flex justify-between items-center mt-3">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColorClass(item.type || AssignmentType.HOMEWORK)}`}>
                                            {item.type || 'Homework'}
                                      </span>
                                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                        <Calendar size={12} />
                                        {status.nextDueDate}
                                      </div>
                                  </div>
                              </div>
                           );
                      })}
                  </div>
              </section>
          )}
      </div>

      {/* Right Column: Add/Edit Form */}
      <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
          <div className={`rounded-2xl p-6 shadow-lg sticky top-24 transition-colors ${editingId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-900 text-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${editingId ? 'text-gray-900' : 'text-white'}`}>
                    {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-400" />}
                    {editingId ? 'Edit Review Topic' : 'Add New Topic'}
                </h3>
                {editingId && (
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
              </div>
              
              {!editingId && (
                <p className="text-gray-300 text-sm mb-6">
                    Enter a lesson you just learned. We'll schedule reviews based on the forgetting curve.
                </p>
              )}

              <form onSubmit={handleSaveItem} className="space-y-4">
                  <div>
                      <label className={`block text-sm font-medium mb-1 ${editingId ? 'text-gray-700' : 'text-gray-300'}`}>Subject</label>
                      <input
                          type="text"
                          required
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="e.g., Biology"
                          className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editingId ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'}`}
                      />
                  </div>
                  <div>
                      <label className={`block text-sm font-medium mb-1 ${editingId ? 'text-gray-700' : 'text-gray-300'}`}>Lesson Name</label>
                       <input
                          type="text"
                          required
                          value={lessonName}
                          onChange={e => setLessonName(e.target.value)}
                          placeholder="e.g., Cell Structure"
                          className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editingId ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'}`}
                      />
                  </div>
                  <div>
                      <label className={`block text-sm font-medium mb-1 ${editingId ? 'text-gray-700' : 'text-gray-300'}`}>Type</label>
                      <select
                          value={type}
                          onChange={e => setType(e.target.value as AssignmentType)}
                          className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editingId ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-700 text-white'}`}
                      >
                          {Object.values(AssignmentType).map(t => (
                              <option key={t} value={t} className="text-gray-900">{t}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                       <div className="flex justify-between items-center mb-1">
                           <label className={`block text-sm font-medium ${editingId ? 'text-gray-700' : 'text-gray-300'}`}>Review Intervals (days)</label>
                           <div className="group relative flex items-center">
                                <Info size={14} className={`${editingId ? 'text-gray-400' : 'text-gray-500'} cursor-help`}/>
                                <div className="absolute right-0 bottom-6 w-56 p-3 bg-white text-gray-900 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 border border-gray-100">
                                    Days after creation to review. Use 0 for today. Default: 1, 3, 7, 14, 30.
                                </div>
                           </div>
                       </div>
                       <input
                          type="text"
                          value={customIntervals}
                          onChange={e => setCustomIntervals(e.target.value)}
                          placeholder="0, 1, 3, 7, 14"
                          className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editingId ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'}`}
                      />
                      <p className={`text-xs mt-1 ${editingId ? 'text-gray-500' : 'text-gray-400'}`}>Tip: Enter '0' to review today.</p>
                  </div>
                  <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mt-6"
                  >
                      {editingId ? 'Save Changes' : 'Start Tracking Topic'}
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};