import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  Target,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
  MapPin,
  AlertTriangle,
  Wand2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Exam } from '../types';
import { formatDate, getDaysRemaining } from '../utils/dateUtils';

export const ExamsPage: React.FC = () => {
  const { subjects, exams, addExam, updateExam, deleteExam, addStudySession } = useData();
  const { success, info } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [weightPercentage, setWeightPercentage] = useState('25');
  const [targetScore, setTargetScore] = useState('90%');
  const [syllabus, setSyllabus] = useState('');
  const [priority, setPriority] = useState<'Medium' | 'High' | 'Critical'>('High');

  const handleOpenCreate = () => {
    setEditingExam(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setExamDate(d.toISOString().split('T')[0]);
    setExamTime('10:00');
    setLocation('');
    setWeightPercentage('25');
    setTargetScore('90%');
    setSyllabus('');
    setPriority('High');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSubjectId(exam.subjectId);
    setExamDate(exam.examDate);
    setExamTime(exam.examTime || '10:00');
    setLocation(exam.location || '');
    setWeightPercentage(exam.weightPercentage ? String(exam.weightPercentage) : '25');
    setTargetScore(exam.targetScore || '90%');
    setSyllabus(exam.syllabus || '');
    setPriority(exam.priority);
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examDate) return;

    if (editingExam) {
      updateExam({
        ...editingExam,
        title: title.trim(),
        subjectId,
        examDate,
        examTime,
        location: location.trim() || undefined,
        weightPercentage: Number(weightPercentage) || 25,
        targetScore: targetScore.trim() || undefined,
        syllabus: syllabus.trim() || undefined,
        priority,
      });
    } else {
      addExam({
        title: title.trim(),
        subjectId: subjectId || subjects[0]?.id || '',
        examDate,
        examTime,
        location: location.trim() || undefined,
        weightPercentage: Number(weightPercentage) || 25,
        targetScore: targetScore.trim() || undefined,
        syllabus: syllabus.trim() || undefined,
        priority,
      });
    }

    setIsModalOpen(false);
  };

  // Generate spaced revision blocks leading up to the exam date
  const handleGenerateRevisionBlocks = (exam: Exam) => {
    const examD = new Date(exam.examDate);
    const todayD = new Date();
    const diffDays = Math.max(1, Math.round((examD.getTime() - todayD.getTime()) / (1000 * 60 * 60 * 24)));

    // Create 3 spaced revision sessions
    const intervals = [Math.floor(diffDays * 0.2), Math.floor(diffDays * 0.5), Math.max(0, diffDays - 1)];

    intervals.forEach((dayOffset, i) => {
      const sessDate = new Date();
      sessDate.setDate(sessDate.getDate() + dayOffset);
      const sessDateStr = sessDate.toISOString().split('T')[0];

      addStudySession({
        title: `[Exam Sprint ${i + 1}] ${exam.title} Revision`,
        subjectId: exam.subjectId,
        date: sessDateStr,
        startTime: '19:00',
        endTime: '20:15',
        durationMinutes: 75,
        priority: 'High',
        sessionType: 'Exam Prep',
        completed: false,
        aiRecommended: true,
        recommendationReason: `Spaced repetition block ${i + 1} of 3 for ${exam.title} on ${exam.examDate}.`,
      });
    });

    success('Revision Sprints Scheduled!', `Generated 3 spaced exam preparation sessions in your planner.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Exams & Critical Deadlines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor countdowns, syllabus scope, and generate spaced revision sprints ahead of assessments.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Schedule Exam
        </Button>
      </div>

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No upcoming examinations scheduled"
          description="Add your midterms, finals, or certification tests to unlock automated spaced revision scheduling."
          actionLabel="Schedule Exam"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => {
            const subj = subjects.find(s => s.id === exam.subjectId);
            const remaining = getDaysRemaining(exam.examDate);

            return (
              <Card key={exam.id} hoverable className="flex flex-col justify-between p-6">
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: subj?.color || '#6366f1' }}
                      >
                        {subj?.name || 'General'}
                      </span>
                      <Badge
                        variant={
                          exam.priority === 'Critical'
                            ? 'danger'
                            : exam.priority === 'High'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {exam.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>

                  {/* Countdown Banner */}
                  <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>{formatDate(exam.examDate)}</span>
                      {exam.examTime && <span className="text-slate-400">• {exam.examTime}</span>}
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        remaining.days <= 3
                          ? 'bg-rose-100 text-rose-800'
                          : remaining.days <= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {remaining.days === 0 ? 'Today!' : `${remaining.days} days left`}
                    </span>
                  </div>

                  {/* Syllabus / Notes */}
                  {exam.syllabus && (
                    <div className="my-3 text-xs text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block">
                        Syllabus Scope:
                      </span>
                      <p className="line-clamp-3 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                        {exam.syllabus}
                      </p>
                    </div>
                  )}

                  {/* Location & Weight */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    {exam.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span>Weight: <strong className="text-slate-800">{exam.weightPercentage}%</strong></span>
                      {exam.targetScore && (
                        <span>Target: <strong className="text-indigo-600">{exam.targetScore}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateRevisionBlocks(exam)}
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50/70"
                    leftIcon={<Wand2 className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Generate Spaced Revision
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Examination' : 'Schedule Examination'}
        description="Add assessment details to trigger automated spaced repetition revision."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <Input
            label="Assessment Title"
            placeholder="e.g. Operating Systems Midterm Exam"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Course / Subject"
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
              label="Priority Level"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
            >
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical (High Weight Final/Midterm)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Exam Date"
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              required
            />
            <Input
              label="Time of Day"
              type="time"
              value={examTime}
              onChange={e => setExamTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Weight (%)"
                type="number"
                min="5"
                max="100"
                value={weightPercentage}
                onChange={e => setWeightPercentage(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Target Score"
                placeholder="e.g. 95%"
                value={targetScore}
                onChange={e => setTargetScore(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Location / Room"
                placeholder="Hall 301"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Syllabus Outline & Key Topics
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="e.g. Chapters 1-6: Process Scheduling, Virtual Memory Paging, Deadlock Prevention."
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingExam ? 'Save Changes' : 'Schedule Exam'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
