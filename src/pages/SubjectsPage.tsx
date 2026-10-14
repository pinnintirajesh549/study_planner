import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Target,
  Clock,
  CheckSquare,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { useData } from '../context/DataContext';
import { Subject, SubjectDifficulty } from '../types';

export const SubjectsPage: React.FC = () => {
  const { subjects, tasks, studySessions, addSubject, updateSubject, deleteSubject } = useData();

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [difficulty, setDifficulty] = useState<SubjectDifficulty>('Medium');
  const [credits, setCredits] = useState('3');
  const [instructor, setInstructor] = useState('');
  const [notes, setNotes] = useState('');
  const [learningGoalsInput, setLearningGoalsInput] = useState('');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState('6');

  // Delete Confirmation State
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  const colorPalette = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#ef4444', // Red
  ];

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setColor(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
    setDifficulty('Medium');
    setCredits('3');
    setInstructor('');
    setNotes('');
    setLearningGoalsInput('');
    setTargetWeeklyHours('6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setName(subj.name);
    setCode(subj.code || '');
    setColor(subj.color);
    setDifficulty(subj.difficulty);
    setCredits(subj.credits ? String(subj.credits) : '3');
    setInstructor(subj.instructor || '');
    setNotes(subj.notes || '');
    setLearningGoalsInput(subj.learningGoals ? subj.learningGoals.join('\n') : '');
    setTargetWeeklyHours(String(subj.targetWeeklyHours || 6));
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const goalsArray = learningGoalsInput
      .split('\n')
      .map(g => g.trim())
      .filter(Boolean);

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name: name.trim(),
        code: code.trim() || undefined,
        color,
        difficulty,
        credits: Number(credits) || 3,
        instructor: instructor.trim() || undefined,
        notes: notes.trim(),
        learningGoals: goalsArray,
        targetWeeklyHours: Number(targetWeeklyHours) || 6,
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim() || undefined,
        color,
        difficulty,
        credits: Number(credits) || 3,
        instructor: instructor.trim() || undefined,
        notes: notes.trim(),
        learningGoals: goalsArray,
        targetWeeklyHours: Number(targetWeeklyHours) || 6,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirmSubject) {
      deleteSubject(deleteConfirmSubject.id);
      setDeleteConfirmSubject(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Academic Subjects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your courses, learning goals, target weekly hours, and difficulty calibrations.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Subject
        </Button>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No courses registered yet"
          description="Add your first subject to allow the AI planner to schedule dedicated study slots."
          actionLabel="Add Course"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map(subj => {
            const subjTasks = tasks.filter(t => t.subjectId === subj.id);
            const pendingTasks = subjTasks.filter(t => !t.completed);
            const subjSessions = studySessions.filter(s => s.subjectId === subj.id);
            const totalLoggedMinutes = subjSessions
              .filter(s => s.completed)
              .reduce((acc, s) => acc + (s.actualMinutesLogged || s.durationMinutes), 0);

            return (
              <Card key={subj.id} hoverable className="flex flex-col justify-between p-6">
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: subj.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{subj.name}</h3>
                          {subj.code && (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {subj.code}
                            </span>
                          )}
                        </div>
                        {subj.instructor && (
                          <p className="text-xs text-slate-500 mt-0.5">{subj.instructor}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={
                          subj.difficulty === 'Very Hard'
                            ? 'danger'
                            : subj.difficulty === 'Hard'
                            ? 'warning'
                            : subj.difficulty === 'Medium'
                            ? 'primary'
                            : 'success'
                        }
                      >
                        {subj.difficulty}
                      </Badge>
                      <button
                        onClick={() => handleOpenEdit(subj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit course"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSubject(subj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes / Syllabus highlight */}
                  {subj.notes && (
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 my-3 leading-relaxed">
                      {subj.notes}
                    </div>
                  )}

                  {/* Learning Goals */}
                  {subj.learningGoals && subj.learningGoals.length > 0 && (
                    <div className="my-3 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        Learning Goals
                      </span>
                      <ul className="space-y-1">
                        {subj.learningGoals.map((goal, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Stats Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong className="text-slate-800">{pendingTasks.length}</strong> pending assignments
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      <strong className="text-slate-800">{(totalLoggedMinutes / 60).toFixed(1)}h</strong> logged / {subj.targetWeeklyHours}h goal
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        description="Configure course details, difficulty level, and goals for the smart scheduler."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Course Name"
                placeholder="e.g. Distributed Operating Systems"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Input
                label="Course Code (Optional)"
                placeholder="CS 401"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Difficulty Level"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as SubjectDifficulty)}
              >
                <option value="Easy">Easy (0.8x weight)</option>
                <option value="Medium">Medium (1.1x weight)</option>
                <option value="Hard">Hard (1.6x weight)</option>
                <option value="Very Hard">Very Hard (2.2x weight)</option>
              </Select>
            </div>

            <div>
              <Input
                label="Course Credits"
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={e => setCredits(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Weekly Study Goal (Hours)"
                type="number"
                min="1"
                max="30"
                value={targetWeeklyHours}
                onChange={e => setTargetWeeklyHours(e.target.value)}
              />
            </div>
          </div>

          {/* Color palette selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Course Tag Color
            </label>
            <div className="flex items-center gap-3">
              {colorPalette.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Instructor / Professor Name"
            placeholder="e.g. Dr. Jennifer Wu"
            value={instructor}
            onChange={e => setInstructor(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Course Notes & High-Yield Focus Topics
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="e.g. Focus on graph algorithms, Dijkstra, and Dynamic Programming."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Key Learning Goals (One per line)
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Master shortest path algorithms&#10;Implement memory virtualization in C++"
              value={learningGoalsInput}
              onChange={e => setLearningGoalsInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmSubject)}
        onClose={() => setDeleteConfirmSubject(null)}
        title="Confirm Subject Deletion"
        description="Are you sure you want to delete this course?"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Deleting <strong>{deleteConfirmSubject?.name}</strong> will also remove its associated tasks, study blocks, and focus sessions. This action cannot be undone.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmSubject(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
