
export enum AssignmentStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ALMOST_DONE = 'Almost Done',
  DONE = 'Done',
}

export enum AssignmentType {
  HOMEWORK = 'Homework',
  QUIZ = 'Quiz',
  TEST = 'Test',
  EXAM = 'Exam',
  SUMMATIVE = 'Summative',
  FORMATIVE = 'Formative',
  PROJECT = 'Project',
}

export enum Priority {
  NOT_IMPORTANT = 'Not Important',
  LESS_IMPORTANT = 'Less Important',
  IMPORTANT = 'Important',
  VERY_IMPORTANT = 'Very Important',
}

export interface StudyTask {
  id: string;
  text: string;
  isComplete: boolean;
  dueDate: string;
}

export interface StudyDocument {
  id: string;
  name: string;
  // In a real app, this would have a URL or blob data. 
  // For this demo, we just track the name.
}

export interface Assignment {
  id: string;
  subject: string;
  name: string;
  status: AssignmentStatus;
  type: AssignmentType;
  dueDate: string;
  priority: Priority;
  studyTasks: StudyTask[];
  documents: StudyDocument[];
}

export interface ReviewItem {
  id: string;
  lessonName: string;
  subject: string;
  type: AssignmentType; // Added type to reviews
  createdDate: string; // ISO Date string
  intervals: number[]; // Days after creation to review. e.g., [1, 3, 7, 14]
  completedReviews: string[]; // ISO Date strings of when it was actually reviewed
}

export interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface StreakData {
    count: number;
    lastActivityDate: string; // YYYY-MM-DD
}
