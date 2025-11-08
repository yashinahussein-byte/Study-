import React, { useState, useEffect, useRef } from 'react';
import { Assignment, AssignmentStatus, AssignmentType, Priority, StudyTask, StudyDocument } from '../types';
import { X, Plus, Trash2, Upload, Calendar, FileText, ListTodo } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
  initialData?: Assignment | null;
}

const emptyAssignment: Omit<Assignment, 'id'> = {
  subject: '',
  name: '',
  status: AssignmentStatus.NOT_STARTED,
  type: AssignmentType.HOMEWORK,
  dueDate: '',
  priority: Priority.NOT_IMPORTANT,
  studyTasks: [],
  documents: [],
};

export const AssignmentModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<Assignment, 'id'>>(emptyAssignment);
  const [id, setId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          subject: initialData.subject,
          name: initialData.name,
          status: initialData.status,
          type: initialData.type,
          dueDate: initialData.dueDate,
          priority: initialData.priority,
          studyTasks: [...initialData.studyTasks],
          documents: [...initialData.documents],
        });
        setId(initialData.id);
      } else {
        setFormData(emptyAssignment);
        setId(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Assignment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTask = () => {
    setFormData(prev => ({
      ...prev,
      studyTasks: [...prev.studyTasks, { id: uuidv4(), text: '', isComplete: false, dueDate: '' }]
    }));
  };

  const handleTaskChange = (taskId: string, field: keyof StudyTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      studyTasks: prev.studyTasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      studyTasks: prev.studyTasks.filter(t => t.id !== taskId)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newDocs: StudyDocument[] = Array.from(e.target.files).map(file => ({
            id: uuidv4(),
            name: file.name
        }));
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, ...newDocs]
        }));
    }
  };

  const handleDeleteDoc = (docId: string) => {
      setFormData(prev => ({
          ...prev,
          documents: prev.documents.filter(d => d.id !== docId)
      }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: id || uuidv4(),
      ...formData
    } as Assignment);
    onClose();
  };

  // Determine if we should show the Study Steps section based on type.
  // Show for everything except simple Homework/Project if desired, or all.
  // Prompt implied it's mostly for Summative/Formative/Tests.
  const showStudySteps = [AssignmentType.TEST, AssignmentType.EXAM, AssignmentType.SUMMATIVE, AssignmentType.FORMATIVE, AssignmentType.QUIZ].includes(formData.type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              {id ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 rounded-full hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <p className="text-gray-500 mb-6">Fill in the details for your assignment or test</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics, Physics, English"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Assignment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Chapter 5 Quiz, Final Essay"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as AssignmentStatus)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {Object.values(AssignmentStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value as AssignmentType)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {Object.values(AssignmentType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Due Date *</label>
                  <div className="relative">
                    <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value as Priority)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {Object.values(Priority).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>

               {/* Study Documents Section */}
               <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                    <FileText size={20} className="text-blue-600"/>
                    <h4 className="text-lg font-bold text-gray-900">Study Documents</h4>
                </div>
                <p className="text-gray-500 text-sm mb-4">Upload study guides, notes, or other helpful documents</p>
                
                <div className="space-y-3 mb-4">
                    {formData.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-blue-100 p-2 rounded-md flex-shrink-0">
                                    <FileText size={20} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 truncate">{doc.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Click to upload documents
                </button>
              </div>


              {/* Study Steps Section - conditionally rendered */}
              {showStudySteps && (
                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <ListTodo size={20} className="text-primary"/>
                        <h4 className="text-lg font-bold text-gray-900">Study Steps</h4>
                    </div>
                  <p className="text-gray-500 text-sm mb-4">Add specific steps or mini-tasks to prepare (e.g., Review flashcards, Practice questions)</p>
                  
                  <div className="space-y-3 mb-4">
                    {formData.studyTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                                type="text"
                                value={task.text}
                                onChange={(e) => handleTaskChange(task.id, 'text', e.target.value)}
                                placeholder="e.g., Review flashcards for Ch. 5"
                                className="sm:col-span-2 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                            <input
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="mt-1 text-gray-400 hover:text-red-500 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Study Step
                  </button>
                </div>
              )}

            </div>
          </form>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {id ? 'Save Changes' : 'Add Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
