import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Pencil,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StudySession, Priority } from '../types';
import { getTodayString, formatDate, formatTime, getWeekDays } from '../utils/dateUtils';

export const PlannerPage: React.FC = () => {
  const { subjects, studySessions, toggleSessionCompleted, deleteStudySession, addStudySession, updateStudySession, generateSmartSchedule } = useData();
  const { userProfile } = useAuth();

  const todayStr = getTodayString();
  const weekDays = getWeekDays(new Date(todayStr));

  // Selected date filter (default 'ALL_WEEK' or specific date)
  const [selectedDate, setSelectedDate] = useState<string>('ALL_WEEK');

  // Manual Session Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [duration, setDuration] = useState('60');
  const [priority, setPriority] = useState<Priority>('High');
  const [sessionType, setSessionType] = useState<StudySession['sessionType']>('Revision');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setEditingSession(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDate(selectedDate === 'ALL_WEEK' ? todayStr : selectedDate);
    setStartTime('17:00');
    setEndTime('18:00');
    setDuration('60');
    setPriority('High');
    setSessionType('Problem Solving');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sess: StudySession) => {
    setEditingSession(sess);
    setTitle(sess.title);
    setSubjectId(sess.subjectId);
    setDate(sess.date);
    setStartTime(sess.startTime);
    setEndTime(sess.endTime);
    setDuration(String(sess.durationMinutes));
    setPriority(sess.priority);
    setSessionType(sess.sessionType);
    setNotes(sess.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingSession) {
      updateStudySession({
        ...editingSession,
        title: title.trim(),
        subjectId,
        date,
        startTime,
        endTime,
        durationMinutes: Number(duration) || 60,
        priority,
        sessionType,
        notes: notes.trim() || undefined,
      });
    } else {
      addStudySession({
        title: title.trim(),
        subjectId: subjectId || subjects[0]?.id || '',
        date,
        startTime,
        endTime,
        durationMinutes: Number(duration) || 60,
        priority,
        sessionType,
        completed: false,
        notes: notes.trim() || undefined,
        aiRecommended: false,
      });
    }

    setIsModalOpen(false);
  };

  // Filter sessions
  const displayedSessions = studySessions.filter(s => {
    if (selectedDate === 'ALL_WEEK') return true;
    return s.date === selectedDate;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const totalMinutes = displayedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = displayedSessions.filter(s => s.completed).reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation Trigger */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adaptive AI Study Scheduling</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Smart Study Planner</h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Schedules optimized study intervals based on your {subjects.length} subjects, exam proximity, self-reported difficulty levels, and preferred daily study hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <Button
            size="sm"
            onClick={generateSmartSchedule}
            className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-xs"
            leftIcon={<Wand2 className="w-4 h-4 text-indigo-600" />}
          >
            Regenerate Smart Plan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenCreate}
            className="border-white/30 text-white hover:bg-white/10"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Custom Block
          </Button>
        </div>
      </div>

      {/* Day Selector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDate('ALL_WEEK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDate === 'ALL_WEEK'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Full Week ({studySessions.length} Blocks)
        </button>

        {weekDays.map(day => {
          const isToday = day.date === todayStr;
          const dayCount = studySessions.filter(s => s.date === day.date).length;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedDate === day.date
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{day.dayName} {day.dayNumber}</span>
              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              {dayCount > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full ${selectedDate === day.date ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {dayCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress Metric Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Scheduled:</span>
            <strong className="text-slate-900 text-sm">{(totalMinutes / 60).toFixed(1)} Hours</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[11px]">Completed:</span>
            <strong className="text-emerald-600 text-sm">{(completedMinutes / 60).toFixed(1)} Hours</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[11px]">Remaining:</span>
            <strong className="text-indigo-600 text-sm">{Math.max(0, (totalMinutes - completedMinutes) / 60).toFixed(1)} Hours</strong>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* Study Sessions List */}
      {displayedSessions.length === 0 ? (
        <EmptyState
          icon={<Wand2 className="w-8 h-8" />}
          title="No study blocks in this view"
          description="Click 'Regenerate Smart Plan' to generate personalized blocks or add custom study sessions."
          actionLabel="Generate Plan"
          onAction={generateSmartSchedule}
        />
      ) : (
        <div className="space-y-3">
          {displayedSessions.map(session => {
            const subj = subjects.find(s => s.id === session.subjectId);

            return (
              <Card
                key={session.id}
                className={`p-4 sm:p-5 transition-all ${
                  session.completed ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Session Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={session.completed}
                      onChange={() => toggleSessionCompleted(session.id)}
                      className="mt-1 h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: subj?.color || '#6366f1' }}
                        >
                          {subj?.name || 'General Coursework'}
                        </span>

                        <Badge
                          variant={
                            session.priority === 'Urgent'
                              ? 'danger'
                              : session.priority === 'High'
                              ? 'warning'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {session.priority}
                        </Badge>

                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {session.sessionType}
                        </span>

                        {session.aiRecommended && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            AI Recommended
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-semibold ${
                          session.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {session.title}
                      </h3>

                      {session.recommendationReason && (
                        <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{session.recommendationReason}</span>
                        </p>
                      )}

                      {session.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">Note: {session.notes}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)} ({session.durationMinutes} mins)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEdit(session)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit study block"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStudySession(session.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete study block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Manual Study Block Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? 'Edit Study Block' : 'Add Study Block'}
        description="Schedule a specific focused work session."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <Input
            label="Session Focus Title"
            placeholder="e.g. Graph Algorithms Deep Focus"
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

            <Select
              label="Session Type"
              value={sessionType}
              onChange={e => setSessionType(e.target.value as any)}
            >
              <option value="Problem Solving">Problem Solving / Homework</option>
              <option value="Exam Prep">Exam Preparation & Drills</option>
              <option value="New Material">New Material Learning</option>
              <option value="Revision">Spaced Revision</option>
              <option value="Assignment Work">Assignment Work</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              min="15"
              step="15"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>
          </div>

          <Input
            label="Notes / Specific Objectives"
            placeholder="e.g. Complete exercises 4 to 8 without checking solution manual."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSession ? 'Save Changes' : 'Schedule Block'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
