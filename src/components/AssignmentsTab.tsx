import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentStatus, Priority } from '../types';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentModal } from './AssignmentModal';
import { Plus, Filter, CalendarX2 } from 'lucide-react';

interface Props {
    onActivity?: () => void;
}

export const AssignmentsTab: React.FC<Props> = ({ onActivity }) => {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('assignments');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  const handleSave = (assignment: Assignment) => {
    // Check if it was just marked DONE to trigger streak
    if (assignment.status === AssignmentStatus.DONE && onActivity) {
        // Simple check: if it wasn't done before, or if it's new and done immediately
        const wasDoneBefore = editingAssignment?.status === AssignmentStatus.DONE;
        if (!wasDoneBefore) {
            onActivity();
        }
    }

    if (editingAssignment) {
      setAssignments(prev => prev.map(a => a.id === assignment.id ? assignment : a));
    } else {
      setAssignments(prev => [...prev, assignment]);
    }
    setEditingAssignment(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleToggleTask = (assignmentId: string, taskId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === assignmentId) {
        return {
          ...a,
          studyTasks: a.studyTasks.map(t =>
            t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
          )
        };
      }
      return a;
    }));
  };

  const openNewModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const filteredAssignments = assignments
    .filter(a => filterStatus === 'All' || a.status === filterStatus)
    .filter(a => filterPriority === 'All' || a.priority === filterPriority)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Assignments</h2>
          <p className="text-gray-500 mt-1">{assignments.length} assignments total</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-colors w-full sm:w-auto ${showFilters ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            Add Assignment
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as AssignmentStatus | 'All')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                    <option value="All">All Statuses</option>
                    {Object.values(AssignmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Priority</label>
                 <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                >
                    <option value="All">All Priorities</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>
      )}

      {filteredAssignments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <CalendarX2 size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {assignments.length === 0 
                ? "Add your first assignment to get started and organize your study schedule!" 
                : "Try adjusting your filters to see your assignments."}
          </p>
          {assignments.length === 0 && (
             <button
                onClick={openNewModal}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
                Add Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>
      )}

      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingAssignment}
      />
    </div>
  );
};
