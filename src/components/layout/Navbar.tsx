import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Plus,
  Wand2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const { subjects, addTask, generateSmartSchedule, unreadNotificationCount } = useData();

  // Quick Task Modal
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [taskDuration, setTaskDuration] = useState('45');

  const pageTitles: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Academic Overview & Daily Priorities' },
    '/subjects': { title: 'My Subjects', subtitle: 'Coursework, Difficulty Ratings & Learning Goals' },
    '/tasks': { title: 'Assignments & Tasks', subtitle: 'Deadlines, Deliverables & Priorities' },
    '/exams': { title: 'Exams & Deadlines', subtitle: 'Countdowns, Syllabi & Prep Schedules' },
    '/planner': { title: 'Smart Study Planner', subtitle: 'Adaptive AI-Generated Study Schedule' },
    '/calendar': { title: 'Study Calendar', subtitle: 'Monthly & Weekly Academic Timeline' },
    '/timer': { title: 'Focus Timer', subtitle: 'Pomodoro Interval Study & Focus Logging' },
    '/analytics': { title: 'Progress Analytics', subtitle: 'Study Trends, Completion Rates & Hours' },
    '/ai-assistant': { title: 'AI Study Assistant', subtitle: 'Personalized Study Coaching & Advice' },
    '/notifications': { title: 'Notifications', subtitle: 'Reminders, Deadlines & Academic Alerts' },
    '/settings': { title: 'Profile & Settings', subtitle: 'Preferences, Integrations & Data Management' },
  };

  const currentInfo = pageTitles[location.pathname] || { title: 'StudySmart AI', subtitle: 'Personal Study Planner' };

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId || subjects[0]?.id || '',
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      priority: taskPriority,
      estimatedDurationMinutes: Number(taskDuration) || 45,
      type: 'Assignment',
      completed: false,
      status: 'Pending',
    });

    setTaskTitle('');
    setQuickTaskOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-8 backdrop-blur-md">
        {/* Left: Mobile menu button + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {currentInfo.title}
            </h1>
            {currentInfo.subtitle && (
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                {currentInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick actions & notification icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Smart Plan Generator button */}
          <Button
            variant="outline"
            size="sm"
            onClick={generateSmartSchedule}
            className="hidden lg:inline-flex border-indigo-200 text-indigo-700 hover:bg-indigo-50/80"
            leftIcon={<Wand2 className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Smart Schedule
          </Button>

          {/* Quick Task Button */}
          <Button
            size="sm"
            onClick={() => setQuickTaskOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex shadow-xs"
          >
            New Task
          </Button>

          {/* Mobile icon quick-add */}
          <button
            onClick={() => setQuickTaskOpen(true)}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs"
            title="Create task"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Notification Bell */}
          <Link
            to="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </Link>

          {/* Settings icon */}
          <Link
            to="/settings"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={quickTaskOpen}
        onClose={() => setQuickTaskOpen(false)}
        title="Quick Add Task"
        description="Add a new academic deliverable to your schedule."
      >
        <form onSubmit={handleCreateQuickTask} className="space-y-4">
          <Input
            label="Task or Assignment Title"
            placeholder="e.g. Implement Dijkstra Algorithm"
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Subject"
              value={taskSubjectId}
              onChange={e => setTaskSubjectId(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={e => setTaskDueDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={taskPriority}
              onChange={e => setTaskPriority(e.target.value as any)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>

            <Input
              label="Est. Duration (Minutes)"
              type="number"
              min="15"
              step="15"
              value={taskDuration}
              onChange={e => setTaskDuration(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
