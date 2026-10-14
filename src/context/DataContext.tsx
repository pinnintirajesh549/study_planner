import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Subject, Task, Exam, StudySession, FocusLog, AppNotification } from '../types';
import { StorageService } from '../services/storageService';
import { generateSmartStudySchedule } from '../services/plannerEngine';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface DataContextType {
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  studySessions: StudySession[];
  focusLogs: FocusLog[];
  notifications: AppNotification[];
  unreadNotificationCount: number;

  // Subjects
  addSubject: (subject: Omit<Subject, 'id' | 'userId' | 'createdAt'>) => Subject;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Task;
  updateTask: (task: Task) => void;
  toggleTaskCompleted: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Exams
  addExam: (exam: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => Exam;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;

  // Study Sessions
  addStudySession: (session: Omit<StudySession, 'id' | 'userId'>) => StudySession;
  updateStudySession: (session: StudySession) => void;
  toggleSessionCompleted: (sessionId: string) => void;
  deleteStudySession: (sessionId: string) => void;
  generateSmartSchedule: () => void;

  // Focus Logs
  addFocusLog: (log: Omit<FocusLog, 'id' | 'userId' | 'timestamp'>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, message: string, type: AppNotification['type'], link?: string) => void;

  // Data reset
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile, currentUser } = useAuth();
  const { success, info } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [exams, setExams] = useState<Exam[]>(() => StorageService.getExams());
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => StorageService.getStudySessions());
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>(() => StorageService.getFocusLogs());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Subjects
  const addSubject = (data: Omit<Subject, 'id' | 'userId' | 'createdAt'>): Subject => {
    const newSubject: Subject = {
      ...data,
      id: `subj-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
      createdAt: new Date().toISOString(),
    };
    const updated = StorageService.saveSubject(newSubject);
    setSubjects(updated);
    success('Subject Added', `Created ${newSubject.name} successfully.`);
    return newSubject;
  };

  const updateSubject = (subject: Subject) => {
    const updated = StorageService.saveSubject(subject);
    setSubjects(updated);
    success('Subject Updated', `Updated ${subject.name} details.`);
  };

  const deleteSubject = (subjectId: string) => {
    const target = subjects.find(s => s.id === subjectId);
    const updated = StorageService.deleteSubject(subjectId);
    setSubjects(updated);
    setTasks(StorageService.getTasks());
    setStudySessions(StorageService.getStudySessions());
    info('Subject Deleted', `Removed ${target?.name || 'subject'} and related sessions.`);
  };

  // Tasks
  const addTask = (data: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
      createdAt: new Date().toISOString(),
    };
    const updated = StorageService.saveTask(newTask);
    setTasks(updated);
    success('Task Created', `Added "${newTask.title}".`);
    return newTask;
  };

  const updateTask = (task: Task) => {
    const updated = StorageService.saveTask(task);
    setTasks(updated);
    success('Task Updated', `Saved changes to "${task.title}".`);
  };

  const toggleTaskCompleted = (taskId: string) => {
    const updated = StorageService.toggleTaskCompleted(taskId);
    setTasks(updated);
    const t = updated.find(item => item.id === taskId);
    if (t?.completed) {
      success('Task Completed! 🎉', `Marked "${t.title}" as done.`);
    }
  };

  const deleteTask = (taskId: string) => {
    const updated = StorageService.deleteTask(taskId);
    setTasks(updated);
    info('Task Removed', 'The task was deleted from your list.');
  };

  // Exams
  const addExam = (data: Omit<Exam, 'id' | 'userId' | 'createdAt'>): Exam => {
    const newExam: Exam = {
      ...data,
      id: `exam-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
      createdAt: new Date().toISOString(),
    };
    const updated = StorageService.saveExam(newExam);
    setExams(updated);
    success('Exam Added', `Scheduled "${newExam.title}".`);
    return newExam;
  };

  const updateExam = (exam: Exam) => {
    const updated = StorageService.saveExam(exam);
    setExams(updated);
    success('Exam Updated', `Updated "${exam.title}" schedule.`);
  };

  const deleteExam = (examId: string) => {
    const updated = StorageService.deleteExam(examId);
    setExams(updated);
    info('Exam Deleted', 'Exam removed from your schedule.');
  };

  // Study Sessions
  const addStudySession = (data: Omit<StudySession, 'id' | 'userId'>): StudySession => {
    const newSession: StudySession = {
      ...data,
      id: `sess-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
    };
    const updated = StorageService.saveStudySession(newSession);
    setStudySessions(updated);
    success('Study Block Added', `Scheduled "${newSession.title}".`);
    return newSession;
  };

  const updateStudySession = (session: StudySession) => {
    const updated = StorageService.saveStudySession(session);
    setStudySessions(updated);
    success('Session Updated', 'Study session adjusted.');
  };

  const toggleSessionCompleted = (sessionId: string) => {
    const updated = StorageService.toggleSessionCompleted(sessionId);
    setStudySessions(updated);
    const s = updated.find(item => item.id === sessionId);
    if (s?.completed) {
      success('Session Complete! ⭐', `Logged "${s.title}" as completed.`);
    }
  };

  const deleteStudySession = (sessionId: string) => {
    const updated = StorageService.deleteStudySession(sessionId);
    setStudySessions(updated);
    info('Session Deleted', 'Study session removed.');
  };

  const generateSmartSchedule = useCallback(() => {
    const smartBlocks = generateSmartStudySchedule(
      userProfile,
      subjects,
      tasks,
      exams,
      studySessions
    );
    // Combine smart blocks while preserving manually completed ones
    const preservedCompleted = studySessions.filter(s => s.completed);
    const combined = [...preservedCompleted, ...smartBlocks.filter(b => !preservedCompleted.some(p => p.id === b.id))];

    StorageService.setAllStudySessions(combined);
    setStudySessions(combined);
    success('Smart Schedule Generated! 🚀', `Calculated ${smartBlocks.length} adaptive study sessions.`);
  }, [userProfile, subjects, tasks, exams, studySessions, success]);

  // Focus Logs
  const addFocusLog = (logData: Omit<FocusLog, 'id' | 'userId' | 'timestamp'>) => {
    const newLog: FocusLog = {
      ...logData,
      id: `foc-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
      timestamp: new Date().toISOString(),
    };
    const updated = StorageService.addFocusLog(newLog);
    setFocusLogs(updated);
    success('Focus Logged! ⏱️', `Recorded ${logData.durationMinutes} minutes of focused study.`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const updated = StorageService.markNotificationRead(id);
    setNotifications(updated);
  };

  const clearAllNotifications = () => {
    const updated = StorageService.clearAllNotifications();
    setNotifications(updated);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type'], link?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || userProfile.uid,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      link,
    };
    const updated = StorageService.addNotification(newNotif);
    setNotifications(updated);
  };

  const resetAllData = () => {
    StorageService.resetToDemoData();
    setSubjects(StorageService.getSubjects());
    setTasks(StorageService.getTasks());
    setExams(StorageService.getExams());
    setStudySessions(StorageService.getStudySessions());
    setFocusLogs(StorageService.getFocusLogs());
    setNotifications(StorageService.getNotifications());
    info('Data Reset', 'All study data has been reloaded to default mock demo state.');
  };

  return (
    <DataContext.Provider
      value={{
        subjects,
        tasks,
        exams,
        studySessions,
        focusLogs,
        notifications,
        unreadNotificationCount,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        toggleTaskCompleted,
        deleteTask,
        addExam,
        updateExam,
        deleteExam,
        addStudySession,
        updateStudySession,
        toggleSessionCompleted,
        deleteStudySession,
        generateSmartSchedule,
        addFocusLog,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
