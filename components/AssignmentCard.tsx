import React, { useState } from 'react';
import { Assignment, AssignmentStatus, AssignmentType, Priority, StudyTask } from '../types';
import { Calendar, AlertCircle, CheckSquare, Square, ChevronDown, ChevronUp, Edit2, Trash2, FileText } from 'lucide-react';

interface Props {
  assignment: Assignment;
  onEdit: (a: Assignment) => void;
  onDelete: (id: string) => void;
  onToggleTask: (assignmentId: string, taskId: string) => void;
}

export const AssignmentCard: React.FC<Props> = ({ assignment, onEdit, onDelete, onToggleTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.DONE: return 'bg-green-100 text-green-800';
      case AssignmentStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case AssignmentStatus.ALMOST_DONE: return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.VERY_IMPORTANT: return 'bg-red-100 text-red-800 border-red-200';
      case Priority.IMPORTANT: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.LESS_IMPORTANT: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Calculate days left
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(assignment.dueDate + 'T00:00:00');
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueString = '';
  let dueColorClass = 'text-gray-500';

  if (diffDays < 0) {
    dueString = `Overdue by ${Math.abs(diffDays)} days`;
    dueColorClass = 'text-red-600 font-medium';
  } else if (diffDays === 0) {
    dueString = 'Due today';
    dueColorClass = 'text-red-600 font-medium';
  } else if (diffDays === 1) {
    dueString = 'Due tomorrow';
    dueColorClass = 'text-orange-600';
  } else {
    dueString = `Due in ${diffDays} days`;
  }

  const formattedDueDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const hasTasks = assignment.studyTasks.length > 0;
  const hasDocs = assignment.documents.length > 0;
  const completedTasks = assignment.studyTasks.filter(t => t.isComplete).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{assignment.name}</h3>
            <div className="flex gap-1">
                <button onClick={() => onEdit(assignment)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                <Edit2 size={16} />
                </button>
                <button onClick={() => onDelete(assignment.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
                </button>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-3">{assignment.subject}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {assignment.type}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar size={16} />
              <span>{formattedDueDate}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${dueColorClass}`}>
              {diffDays <= 1 && <AlertCircle size={16} />}
              <span>{dueString}</span>
            </div>
             {assignment.priority !== Priority.NOT_IMPORTANT && (
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${getPriorityColor(assignment.priority)}`}>
                  <AlertCircle size={14} />
                  <span className="text-xs font-medium uppercase">{assignment.priority}</span>
                </div>
             )}
          </div>
        </div>
      </div>

      {(hasTasks || hasDocs) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-primary focus:outline-none"
          >
            <div className="flex items-center gap-2">
                <span>Study Details</span>
                {hasTasks && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {completedTasks}/{assignment.studyTasks.length} steps
                    </span>
                )}
                 {hasDocs && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {assignment.documents.length} docs
                    </span>
                )}
            </div>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {hasDocs && (
                    <div>
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents</h5>
                         <div className="flex flex-wrap gap-2">
                            {assignment.documents.map(doc => (
                                <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                                    <FileText size={14} className="text-blue-500"/>
                                    <span className="truncate max-w-[150px]">{doc.name}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                )}

              {hasTasks && (
                  <div>
                       <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Study Steps</h5>
                       <div className="space-y-2">
                        {assignment.studyTasks.map(task => (
                            <div key={task.id} className="flex items-start gap-3 group">
                            <button 
                                onClick={() => onToggleTask(assignment.id, task.id)}
                                className={`mt-0.5 flex-shrink-0 ${task.isComplete ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                            >
                                {task.isComplete ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <div className="flex-1">
                                <p className={`text-sm ${task.isComplete ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {task.text}
                                </p>
                                {task.dueDate && (
                                <p className="text-xs text-gray-500 mt-0.5">Due: {task.dueDate}</p>
                                )}
                            </div>
                            </div>
                        ))}
                        </div>
                  </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
