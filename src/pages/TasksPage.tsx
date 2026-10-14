import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  Layers,
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
import { useAuth } from '../context/AuthContext';
import { Task, TaskType, Priority } from '../types';
import { formatDate, getDaysRemaining } from '../utils/dateUtils';
import { AiService, AiTaskSubstep } from '../services/aiService';

export const TasksPage: React.FC = () => {
  const { subjects, tasks, addTask, updateTask, toggleTaskCompleted, deleteTask, addStudySession } = useData();
  const { userProfile } = useAuth();
  const { success, info } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [duration, setDuration] = useState('45');

  // AI Breakdown Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [breakdownTargetTask, setBreakdownTargetTask] = useState<Task | null>(null);
  const [breakdownSteps, setBreakdownSteps] = useState<AiTaskSubstep[]>([]);
  const [breakdownEngine, setBreakdownEngine] = useState('');
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);

  // Open Create
  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setDescription('');
    setType('Assignment');
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
    setDueTime('23:59');
    setPriority('Medium');
    setDuration('45');
    setIsModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setTitle(t.title);
    setSubjectId(t.subjectId);
    setDescription(t.description || '');
    setType(t.type);
    setDueDate(t.dueDate);
    setDueTime(t.dueTime || '23:59');
    setPriority(t.priority);
    setDuration(String(t.estimatedDurationMinutes));
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: title.trim(),
        subjectId,
        description: description.trim() || undefined,
        type,
        dueDate,
        dueTime,
        priority,
        estimatedDurationMinutes: Number(duration) || 45,
      });
    } else {
      addTask({
        title: title.trim(),
        subjectId: subjectId || subjects[0]?.id || '',
        description: description.trim() || undefined,
        type,
        dueDate,
        dueTime,
        priority,
        estimatedDurationMinutes: Number(duration) || 45,
        completed: false,
        status: 'Pending',
      });
    }

    setIsModalOpen(false);
  };

  // AI Task Breakdown
  const handleTriggerBreakdown = async (task: Task) => {
    setBreakdownTargetTask(task);
    setBreakdownSteps([]);
    setIsBreakdownLoading(true);
    setBreakdownModalOpen(true);

    const subj = subjects.find(s => s.id === task.subjectId);
    const result = await AiService.breakdownTask(
      task.title,
      subj?.name || 'General Coursework',
      userProfile.aiApiKey
    );

    setBreakdownSteps(result.steps);
    setBreakdownEngine(result.engine);
    setIsBreakdownLoading(false);
  };

  const handleAddStepsToPlanner = () => {
    if (!breakdownTargetTask) return;
    const today = new Date().toISOString().split('T')[0];

    breakdownSteps.forEach((step, idx) => {
      addStudySession({
        title: `[Sprint] ${step.title}`,
        subjectId: breakdownTargetTask.subjectId,
        date: today,
        startTime: `${14 + idx}:00`,
        endTime: `${14 + idx}:${step.durationMinutes}`,
        durationMinutes: step.durationMinutes,
        priority: 'High',
        sessionType: 'Assignment Work',
        completed: false,
        aiRecommended: true,
        recommendationReason: `Generated step for "${breakdownTargetTask.title}": ${step.objective}`,
      });
    });

    setBreakdownModalOpen(false);
    success('Study Blocks Scheduled! 🚀', `Added ${breakdownSteps.length} actionable focus blocks to your planner.`);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    // Search
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Subject
    if (filterSubject !== 'ALL' && t.subjectId !== filterSubject) {
      return false;
    }
    // Status
    if (filterStatus === 'PENDING' && t.completed) return false;
    if (filterStatus === 'COMPLETED' && !t.completed) return false;
    // Priority
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Assignments & Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track deliverables, estimate effort, and break down complex tasks with AI.
          </p>
        </div>

        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          New Task
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="ALL">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Only</option>
            <option value="COMPLETED">Completed Only</option>
          </Select>

          <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No tasks match your criteria"
          description="Clear filters or create a new assignment to keep your study schedule populated."
          actionLabel="Create Task"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const subj = subjects.find(s => s.id === task.subjectId);
            const remaining = getDaysRemaining(task.dueDate);

            return (
              <Card
                key={task.id}
                className={`p-4 sm:p-5 transition-all ${
                  task.completed ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompleted(task.id)}
                      className="mt-1 h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: subj?.color || '#6366f1' }}
                        >
                          {subj?.name || 'General'}
                        </span>

                        <Badge
                          variant={
                            task.priority === 'Urgent'
                              ? 'danger'
                              : task.priority === 'High'
                              ? 'warning'
                              : task.priority === 'Medium'
                              ? 'primary'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>

                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {task.type}
                        </span>

                        <Badge variant={remaining.isUrgent ? 'danger' : 'default'} size="sm">
                          {remaining.label}
                        </Badge>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-semibold ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due {formatDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ~{task.estimatedDurationMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!task.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerBreakdown(task)}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50/70"
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        AI Breakdown
                      </Button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task or Assignment'}
        description="Fill in assignment guidelines, priorities, and deadlines."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement Dijkstra & A* Graph Pathfinding"
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
              label="Task Type"
              value={type}
              onChange={e => setType(e.target.value as TaskType)}
            >
              <option value="Assignment">Assignment</option>
              <option value="Homework">Homework</option>
              <option value="Project">Project Milestone</option>
              <option value="Reading">Reading / Prep</option>
              <option value="Revision">Revision</option>
              <option value="Practice">Practice Problem Set</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Due Time"
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Est. Duration (Mins)"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Task Notes / Problem Details
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="e.g. Exercises 14.1 through 14.12 on two-tailed hypothesis testing."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Task Breakdown Modal */}
      <Modal
        isOpen={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        title="AI Task Breakdown"
        description={`Deconstructing "${breakdownTargetTask?.title}" into actionable study sprints.`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
            <span>Engine: <strong className="text-indigo-600">{breakdownEngine || 'Analyzing...'}</strong></span>
            <span>Total Steps: {breakdownSteps.length}</span>
          </div>

          {isBreakdownLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Deconstructing curriculum into bite-sized Pomodoro sprints...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {breakdownSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">
                      Step {idx + 1}: {step.title}
                    </span>
                    <Badge variant="primary" size="sm">
                      {step.durationMinutes} mins
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{step.objective}</p>
                  <p className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-lg font-medium">
                    💡 <strong>Pro-Tip:</strong> {step.tips}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setBreakdownModalOpen(false)}>
              Close
            </Button>
            {breakdownSteps.length > 0 && (
              <Button onClick={handleAddStepsToPlanner} leftIcon={<Wand2 className="w-4 h-4" />}>
                Schedule Steps in Planner
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
