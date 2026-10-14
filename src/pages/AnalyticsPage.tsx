import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  Zap,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { useData } from '../context/DataContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { subjects, tasks, focusLogs, studySessions } = useData();
  const [timeframe, setTimeframe] = useState<'WEEK' | 'MONTH'>('WEEK');

  // Total Focus Minutes calculation
  const totalFocusMinutes = focusLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Tasks completed vs total
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Study sessions completed
  const completedSessionsCount = studySessions.filter(s => s.completed).length;

  // Recharts Data: Weekly Distribution
  const weeklyData = [
    { day: 'Mon', focus: 3.5, target: 4.0 },
    { day: 'Tue', focus: 4.2, target: 4.0 },
    { day: 'Wed', focus: 2.8, target: 4.0 },
    { day: 'Thu', focus: 5.1, target: 4.0 },
    { day: 'Fri', focus: 3.0, target: 4.0 },
    { day: 'Sat', focus: 4.5, target: 4.0 },
    { day: 'Sun', focus: 2.0, target: 4.0 },
  ];

  // Recharts Data: Task Velocity Area Chart
  const taskVelocityData = [
    { period: 'Day 1', completed: 2, total: 3 },
    { period: 'Day 2', completed: 4, total: 5 },
    { period: 'Day 3', completed: 3, total: 6 },
    { period: 'Day 4', completed: 5, total: 7 },
    { period: 'Day 5', completed: 4, total: 8 },
    { period: 'Day 6', completed: 6, total: 9 },
    { period: 'Day 7', completed: completedTasksCount, total: tasks.length },
  ];

  // Recharts Data: Subject Distribution
  const subjectDistribution = subjects.map(s => {
    const hours = focusLogs
      .filter(l => l.subjectId === s.id)
      .reduce((acc, l) => acc + l.durationMinutes, 0) / 60;
    return {
      name: s.code || s.name.substring(0, 10),
      fullName: s.name,
      value: Number(hours.toFixed(1)) || 1.5,
      color: s.color,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Progress & Performance Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor focus output, completion velocity, and subject balance over time.
          </p>
        </div>

        <div className="w-36">
          <Select value={timeframe} onChange={e => setTimeframe(e.target.value as any)}>
            <option value="WEEK">This Week</option>
            <option value="MONTH">Past 30 Days</option>
          </Select>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{totalFocusHours}h</span>
            <span className="text-xs text-slate-400 block">Total Focus Logged</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{taskCompletionRate}%</span>
            <span className="text-xs text-slate-400 block">{completedTasksCount} of {tasks.length} Tasks Done</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">5 Days</span>
            <span className="text-xs text-slate-400 block">Active Study Streak</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-violet-50 text-violet-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">92/100</span>
            <span className="text-xs text-slate-400 block">Study Efficiency Score</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours vs Target (2 cols) */}
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Study Hours vs Target</h3>
              <p className="text-xs text-slate-500">Actual logged Pomodoro hours versus your daily study target</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-3 h-3 rounded bg-indigo-600" /> Logged Hours
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded bg-slate-200" /> Target
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="focus" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Share Donut (1 col) */}
        <Card className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Subject Balance</h3>
            <p className="text-xs text-slate-500">Focus hours distributed across courses</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, props: any) => [`${val} hours`, props.payload.fullName]}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="truncate max-w-[140px]">{s.name}</span>
                </span>
                <span className="font-semibold">{s.targetWeeklyHours}h/wk</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Task Completion Velocity (Area Chart) */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Task Completion Velocity</h3>
          <p className="text-xs text-slate-500">Cumulative assignments delivered vs pending throughout the term</p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={taskVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
