import {
  UserProfile,
  Subject,
  Task,
  Exam,
  StudySession,
  FocusLog,
  AppNotification,
} from '../types';
import {
  initialUserProfile,
  initialSubjects,
  initialTasks,
  initialExams,
  initialStudySessions,
  initialFocusLogs,
  initialNotifications,
} from '../data/mockData';

const STORAGE_KEYS = {
  USER_PROFILE: 'studysmart_user_profile',
  SUBJECTS: 'studysmart_subjects',
  TASKS: 'studysmart_tasks',
  EXAMS: 'studysmart_exams',
  SESSIONS: 'studysmart_sessions',
  FOCUS_LOGS: 'studysmart_focus_logs',
  NOTIFICATIONS: 'studysmart_notifications',
  AUTH_STATE: 'studysmart_auth_state',
};

// LocalStorage helpers with type safety
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const StorageService = {
  // Reset all data to rich demo dataset
  resetToDemoData: () => {
    setLocalItem(STORAGE_KEYS.USER_PROFILE, initialUserProfile);
    setLocalItem(STORAGE_KEYS.SUBJECTS, initialSubjects);
    setLocalItem(STORAGE_KEYS.TASKS, initialTasks);
    setLocalItem(STORAGE_KEYS.EXAMS, initialExams);
    setLocalItem(STORAGE_KEYS.SESSIONS, initialStudySessions);
    setLocalItem(STORAGE_KEYS.FOCUS_LOGS, initialFocusLogs);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  },

  // User Profile
  getUserProfile: (): UserProfile => {
    return getLocalItem<UserProfile>(STORAGE_KEYS.USER_PROFILE, initialUserProfile);
  },

  saveUserProfile: (profile: UserProfile): void => {
    setLocalItem(STORAGE_KEYS.USER_PROFILE, profile);
  },

  // Subjects
  getSubjects: (): Subject[] => {
    return getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, initialSubjects);
  },

  saveSubject: (subject: Subject): Subject[] => {
    const list = StorageService.getSubjects();
    const index = list.findIndex(s => s.id === subject.id);
    let updated: Subject[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = subject;
    } else {
      updated = [subject, ...list];
    }
    setLocalItem(STORAGE_KEYS.SUBJECTS, updated);
    return updated;
  },

  deleteSubject: (subjectId: string): Subject[] => {
    const list = StorageService.getSubjects();
    const updated = list.filter(s => s.id !== subjectId);
    setLocalItem(STORAGE_KEYS.SUBJECTS, updated);
    // Also remove or clean up associated tasks and sessions
    const tasks = StorageService.getTasks().filter(t => t.subjectId !== subjectId);
    setLocalItem(STORAGE_KEYS.TASKS, tasks);
    const sessions = StorageService.getStudySessions().filter(s => s.subjectId !== subjectId);
    setLocalItem(STORAGE_KEYS.SESSIONS, sessions);
    return updated;
  },

  // Tasks
  getTasks: (): Task[] => {
    return getLocalItem<Task[]>(STORAGE_KEYS.TASKS, initialTasks);
  },

  saveTask: (task: Task): Task[] => {
    const list = StorageService.getTasks();
    const index = list.findIndex(t => t.id === task.id);
    let updated: Task[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = task;
    } else {
      updated = [task, ...list];
    }
    setLocalItem(STORAGE_KEYS.TASKS, updated);
    return updated;
  },

  toggleTaskCompleted: (taskId: string): Task[] => {
    const list = StorageService.getTasks();
    const updated = list.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: (nextCompleted ? 'Completed' : 'Pending') as any,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setLocalItem(STORAGE_KEYS.TASKS, updated);
    return updated;
  },

  deleteTask: (taskId: string): Task[] => {
    const list = StorageService.getTasks();
    const updated = list.filter(t => t.id !== taskId);
    setLocalItem(STORAGE_KEYS.TASKS, updated);
    return updated;
  },

  // Exams
  getExams: (): Exam[] => {
    return getLocalItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
  },

  saveExam: (exam: Exam): Exam[] => {
    const list = StorageService.getExams();
    const index = list.findIndex(e => e.id === exam.id);
    let updated: Exam[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = exam;
    } else {
      updated = [exam, ...list];
    }
    setLocalItem(STORAGE_KEYS.EXAMS, updated);
    return updated;
  },

  deleteExam: (examId: string): Exam[] => {
    const list = StorageService.getExams();
    const updated = list.filter(e => e.id !== examId);
    setLocalItem(STORAGE_KEYS.EXAMS, updated);
    return updated;
  },

  // Study Sessions
  getStudySessions: (): StudySession[] => {
    return getLocalItem<StudySession[]>(STORAGE_KEYS.SESSIONS, initialStudySessions);
  },

  saveStudySession: (session: StudySession): StudySession[] => {
    const list = StorageService.getStudySessions();
    const index = list.findIndex(s => s.id === session.id);
    let updated: StudySession[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = session;
    } else {
      updated = [session, ...list];
    }
    setLocalItem(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  },

  setAllStudySessions: (sessions: StudySession[]): void => {
    setLocalItem(STORAGE_KEYS.SESSIONS, sessions);
  },

  toggleSessionCompleted: (sessionId: string): StudySession[] => {
    const list = StorageService.getStudySessions();
    const updated = list.map(s => {
      if (s.id === sessionId) {
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });
    setLocalItem(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  },

  deleteStudySession: (sessionId: string): StudySession[] => {
    const list = StorageService.getStudySessions();
    const updated = list.filter(s => s.id !== sessionId);
    setLocalItem(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  },

  // Focus Logs
  getFocusLogs: (): FocusLog[] => {
    return getLocalItem<FocusLog[]>(STORAGE_KEYS.FOCUS_LOGS, initialFocusLogs);
  },

  addFocusLog: (log: FocusLog): FocusLog[] => {
    const list = StorageService.getFocusLogs();
    const updated = [log, ...list];
    setLocalItem(STORAGE_KEYS.FOCUS_LOGS, updated);
    return updated;
  },

  // Notifications
  getNotifications: (): AppNotification[] => {
    return getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  },

  addNotification: (notification: AppNotification): AppNotification[] => {
    const list = StorageService.getNotifications();
    const updated = [notification, ...list];
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  markNotificationRead: (id: string): AppNotification[] => {
    const list = StorageService.getNotifications();
    const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  clearAllNotifications: (): AppNotification[] => {
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, []);
    return [];
  },

  // Auth helper for demo
  getStoredAuthUser: () => {
    return getLocalItem<{ email: string; displayName: string; uid: string } | null>(
      STORAGE_KEYS.AUTH_STATE,
      {
        email: initialUserProfile.email,
        displayName: initialUserProfile.displayName,
        uid: initialUserProfile.uid,
      }
    );
  },

  setStoredAuthUser: (user: { email: string; displayName: string; uid: string } | null) => {
    setLocalItem(STORAGE_KEYS.AUTH_STATE, user);
  },
};
