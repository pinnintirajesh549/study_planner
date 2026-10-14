export type EducationLevel = 
  | 'High School' 
  | 'College / Undergraduate' 
  | 'University / Graduate' 
  | 'Competitive Examinations';

export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskType = 
  | 'Assignment' 
  | 'Homework' 
  | 'Reading' 
  | 'Project' 
  | 'Revision' 
  | 'Practice';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type PreferredTime = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Flexible';

export type BreakPreference = 'Pomodoro (25m / 5m)' | 'Extended (50m / 10m)' | 'Short (20m / 5m)' | 'Custom';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  educationLevel: EducationLevel;
  availableStudyDays: string[];
  preferredStudyHoursPerDay: number;
  typicalSessionDuration: number; // minutes
  preferredStudyTime: PreferredTime;
  breakPreferences: BreakPreference;
  onboardingCompleted: boolean;
  aiApiKey?: string;
  aiProvider?: 'gemini' | 'openai' | 'local_smart_engine';
  enableBrowserNotifications: boolean;
  avatarSeed?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  difficulty: SubjectDifficulty;
  credits?: number;
  instructor?: string;
  notes: string;
  learningGoals: string[];
  targetWeeklyHours: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description?: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  estimatedDurationMinutes: number;
  completed: boolean;
  completedAt?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:mm
  location?: string;
  weightPercentage?: number;
  targetScore?: string;
  syllabus?: string;
  priority: 'Medium' | 'High' | 'Critical';
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  actualMinutesLogged?: number;
  priority: Priority;
  sessionType: 'New Material' | 'Revision' | 'Problem Solving' | 'Exam Prep' | 'Assignment Work';
  completed: boolean;
  completedAt?: string;
  notes?: string;
  aiRecommended: boolean;
  recommendationReason?: string;
}

export interface FocusLog {
  id: string;
  userId: string;
  subjectId?: string;
  durationMinutes: number;
  mode: 'Pomodoro' | 'Short Break' | 'Long Break' | 'Custom';
  timestamp: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'achievement' | 'ai_tip' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: {
    label: string;
    actionType: 'create_task' | 'create_session' | 'view_plan';
    payload?: any;
  }[];
}
