import React, { useEffect, useState } from 'react';
import { Assignment, AssignmentStatus, AssignmentType, ReviewItem } from '../types';
import { AlertTriangle, Calendar, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface Props {
    onNavigate: (tab: 'assignments' | 'review' | 'calendar' | 'focus') => void;
}

export const HomeTab: React.FC<Props> = ({ onNavigate }) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Scholar');

    useEffect(() => {
        const loadedAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const loadedReviews = JSON.parse(localStorage.getItem('reviewItems') || '[]');
        setAssignments(loadedAssignments);
        setReviewItems(loadedReviews);
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
        localStorage.setItem('userName', e.target.value);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // --- Logic to find overdue and today's tasks ---
    const overdueAssignments = assignments.filter(a => {
        const dueDate = new Date(a.dueDate + 'T00:00:00');
        return dueDate < today && a.status !== AssignmentStatus.DONE;
    });

    const dueTodayAssignments = assignments.filter(a => {
        return a.dueDate === todayStr && a.status !== AssignmentStatus.DONE;
    });

    // Reuse review logic (simplified version of what's in ReviewPlanTab)
    const reviewsDueToday = reviewItems.filter(item => {
        const created = new Date(item.createdDate + 'T00:00:00');
        // Adjust for potential timezone offset issues on creation date
        created.setMinutes(created.getMinutes() + created.getTimezoneOffset());

        const isReviewedToday = item.completedReviews.includes(todayStr);
        if (isReviewedToday) return false;

        // Check if any interval lands on today or before and isn't reviewed
        return item.intervals.some(interval => {
            const dueDate = new Date(created);
            dueDate.setDate(created.getDate() + interval);
            const dueStr = dueDate.toISOString().split('T')[0];
            return dueStr <= todayStr && !item.completedReviews.includes(dueStr);
        });
    });

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

    const totalDueToday = dueTodayAssignments.length + reviewsDueToday.length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
                        Welcome back, 
                        <input 
                            value={userName} 
                            onChange={handleNameChange}
                            className="bg-transparent border-b-2 border-gray-200 hover:border-primary focus:border-primary outline-none px-1 min-w-[150px] max-w-[300px] truncate transition-colors"
                            placeholder="Enter name..."
                        />
                         👋
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        You have <span className="font-bold text-primary">{totalDueToday} things</span> to tackle today. Let's get to work!
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('focus')}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    Start Focus Session <ArrowRight size={18} />
                </button>
            </div>

            {/* Critical Alerts */}
            {overdueAssignments.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-600" size={24} />
                        <h2 className="text-xl font-bold text-red-800">Overdue! Action Required</h2>
                    </div>
                    <div className="space-y-3">
                        {overdueAssignments.map(a => (
                            <div key={a.id} className="bg-white p-4 rounded-lg border border-red-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{a.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColorClass(a.type)}`}>
                                            {a.type}
                                        </span>
                                        <span className="text-sm text-red-600 font-medium">
                                            Due: {new Date(a.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => onNavigate('assignments')} className="text-sm text-gray-500 hover:text-primary underline">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Agenda Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today's Assignments */}
                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="text-blue-500" />
                            Due Today
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {dueTodayAssignments.length}
                        </span>
                    </div>
                    {dueTodayAssignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle size={40} className="mx-auto mb-3 text-gray-300" />
                            <p>Nothing due today! Great job.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dueTodayAssignments.map(a => (
                                <div key={a.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{a.name}</h3>
                                            <p className="text-gray-600 text-sm">{a.subject}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTypeColorClass(a.type)}`}>
                                            {a.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                             <button onClick={() => onNavigate('assignments')} className="w-full mt-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                                Go to Assignments &rarr;
                            </button>
                        </div>
                    )}
                </section>

                 {/* Today's Reviews */}
                 <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <RefreshCw className="text-emerald-500" />
                            Review Today
                        </h2>
                        <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                            {reviewsDueToday.length}
                        </span>
                    </div>
                    {reviewsDueToday.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle size={40} className="mx-auto mb-3 text-gray-300" />
                            <p>All caught up on reviews!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviewsDueToday.map(item => (
                                <div key={item.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-emerald-50/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{item.lessonName}</h3>
                                            <p className="text-gray-600 text-sm">{item.subject}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTypeColorClass(item.type || AssignmentType.HOMEWORK)}`}>
                                            {item.type || 'Review'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => onNavigate('review')} className="w-full mt-4 py-2 text-sm text-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium">
                                Go to Review Plan &rarr;
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};