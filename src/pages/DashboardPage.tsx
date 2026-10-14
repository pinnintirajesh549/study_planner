import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  Plus,
  Wand2,
  AlertCircle,
  Timer,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getGreeting, getTodayString, formatDate, formatTime, getDaysRemaining } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const {
    subjects,
    tasks,
    exams,
    studySessions,
    focusLogs,
    toggleTaskCompleted,
    toggleSessionCompleted,
    addTask,
    generateSmartSchedule,
  } = useData();

  const todayStr = getTodayString();
  const greeting = getGreeting();

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [duration, setDuration] = useState('45');

  // Calculations
  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr && !t.completed);
  const pendingAssignments = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Today's study sessions
  const todaysSessions = studySessions.filter(s => s.date === todayStr);
  const completedSessions = studySessions.filter(s => s.completed);

  // Planned study time today in hours
  const plannedMinutesToday = todaysSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutesToday = todaysSessions.filter(s => s.completed).reduce((acc, s) => acc + (s.actualMinutesLogged || s.durationMinutes), 0);

  // Weekly completion rate
  const totalTasks = tasks.length;
  const weeklyCompletionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Upcoming deadlines (next 4)
  const upcomingDeadlines = [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Upcoming exams (next 3)
  const upcomingExamsList = [...exams]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3);

  // Weekly study hours chart data
  const weekChartData = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 4.0 },
    { day: 'Wed', hours: 2.5 },
    { day: 'Thu', hours: 5.0 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 4.5 },
    { day: 'Sun', hours: 2.0 },
  ];

  // Subject distribution data
  const subjectColors: Record<string, string> = {};
  subjects.forEach(s => {
    subjectColors[s.id] = s.color;
  });

  const subjectChartData = subjects.map(s => {
    const count = tasks.filter(t => t.subjectId === s.id).length;
    return {
      name: s.code || s.name.substring(0, 12),
      fullName: s.name,
      value: Math.max(1, count),
      color: s.color,
    };
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subjectId: subjectId || subjects[0]?.id || '',
      dueDate,
      priority,
      estimatedDurationMinutes: Number(duration) || 45,
      type: 'Assignment',
      completed: false,
      status: 'Pending',
    });

    setTitle('');
    setTaskModalOpen(false);
  };

  const getSubject = (subId: string) => subjects.find(s => s.id === subId);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, {userProfile.displayName || 'Alex'}!
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            You have <strong className="text-white underline">{tasksDueToday.length} tasks due today</strong> and <strong className="text-white underline">{todaysSessions.length} study blocks</strong> planned. Keep up the great momentum!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
          <Button
            size="sm"
            onClick={() => setTaskModalOpen(true)}
            className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-xs"
            leftIcon={<Plus className="w-4 h-4 text-indigo-700" />}
          >
            Create Task
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={generateSmartSchedule}
            className="border-indigo-300 text-white hover:bg-white/10"
            leftIcon={<Wand2 className="w-4 h-4 text-indigo-300" />}
          >
            Generate Study Plan
          </Button>
        </div>
      </div>

      {/* 2. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Due Today</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{tasksDueToday.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Urgent deliverables</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{pendingAssignments.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active assignments</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Exams</span>
            <GraduationCap className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{exams.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Scheduled tests</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Done Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">
              {todaysSessions.filter(s => s.completed).length}/{todaysSessions.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Study blocks</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Planned Time</span>
            <Clock className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">
              {(plannedMinutesToday / 60).toFixed(1)}h
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Scheduled for today</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Completion</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{weeklyCompletionRate}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Weekly task rate</span>
          </div>
        </Card>
      </div>

      {/* 3. Today's Study Plan & Upcoming Deadlines (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Today's Study Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Scheduled Study Plan</h3>
            </div>
            <Link to="/planner" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaysSessions.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No study blocks scheduled today"
              description="Click 'Generate Study Plan' to have AI assemble an adaptive schedule for today."
              actionLabel="Generate Plan Now"
              onAction={generateSmartSchedule}
            />
          ) : (
            <div className="space-y-3">
              {todaysSessions.map(session => {
                const subj = getSubject(session.subjectId);
                return (
                  <Card
                    key={session.id}
                    className={`p-4 transition-all ${
                      session.completed ? 'bg-slate-50/80 border-slate-200 opacity-75' : 'hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={session.completed}
                          onChange={() => toggleSessionCompleted(session.id)}
                          className="mt-1 h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: subj?.color || '#6366f1' }}>
                              {subj?.name || 'General'}
                            </span>
                            <Badge variant={session.priority === 'Urgent' ? 'danger' : session.priority === 'High' ? 'warning' : 'default'}>
                              {session.priority}
                            </Badge>
                            {session.aiRecommended && (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                                AI Suggested
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-semibold mt-1.5 ${session.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {session.title}
                          </h4>
                          {session.recommendationReason && (
                            <p className="text-xs text-slate-500 mt-0.5">{session.recommendationReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-slate-700">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {session.durationMinutes} mins
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (1 col): Upcoming Deadlines & Exams */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines</h3>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View All
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 border border-dashed rounded-xl text-center">
                No active pending deadlines. Great job!
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(task => {
                  const remaining = getDaysRemaining(task.dueDate);
                  const subj = getSubject(task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span style={{ color: subj?.color }}>● {subj?.name || 'General'}</span>
                          <span>• Due {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <Badge variant={remaining.isUrgent ? 'danger' : 'default'} size="sm">
                        {remaining.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Exams Countdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Exam Countdown</h3>
              </div>
              <Link to="/exams" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                All Exams
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingExamsList.map(exam => {
                const remaining = getDaysRemaining(exam.examDate);
                const subj = getSubject(exam.subjectId);
                return (
                  <div
                    key={exam.id}
                    className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800 truncate">{exam.title}</span>
                      <Badge variant={remaining.days <= 5 ? 'danger' : 'primary'} size="sm">
                        {remaining.days === 0 ? 'Today!' : `${remaining.days}d left`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{subj?.name}</span>
                      <span>{formatDate(exam.examDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Progress Visualizations (Charts & Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours (Bar Chart) */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Study Hours</h3>
              <p className="text-xs text-slate-500">Actual focus hours recorded this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Flame className="w-3.5 h-3.5" />
              <span>5 Day Streak</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Course Workload Distribution (Donut Chart) */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Subject Task Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of assignments by course</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, props: any) => [`${val} tasks`, props.payload.fullName]}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="truncate max-w-[100px]">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="Add Academic Task"
        description="Schedule a homework assignment, reading, or project milestone."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Chapter 6 Problem Set"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Subject"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.difficulty})
                </option>
              ))}
            </Select>

            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>

            <Input
              label="Estimated Minutes"
              type="number"
              min="15"
              step="15"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
