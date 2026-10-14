import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  GraduationCap,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { EducationLevel, SubjectDifficulty, PreferredTime, BreakPreference } from '../types';

export const OnboardingPage: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const { addSubject, addExam, generateSmartSchedule } = useData();
  const { success } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1: Academic Profile
  const [displayName, setDisplayName] = useState(userProfile.displayName || 'Alex Chen');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    userProfile.educationLevel || 'College / Undergraduate'
  );

  // Step 2: Subjects & Initial Difficulties
  const [subjectsList, setSubjectsList] = useState<Array<{ name: string; difficulty: SubjectDifficulty; color: string }>>([
    { name: 'Data Structures & Algorithms', difficulty: 'Hard', color: '#6366f1' },
    { name: 'Computer Architecture & OS', difficulty: 'Very Hard', color: '#3b82f6' },
    { name: 'Applied Linear Algebra', difficulty: 'Medium', color: '#10b981' },
  ]);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjDiff, setNewSubjDiff] = useState<SubjectDifficulty>('Medium');

  // Step 3: Study Habits & Availability
  const [studyDays, setStudyDays] = useState<string[]>(
    userProfile.availableStudyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [hoursPerDay, setHoursPerDay] = useState(userProfile.preferredStudyHoursPerDay || 4);
  const [sessionDuration, setSessionDuration] = useState(userProfile.typicalSessionDuration || 45);
  const [preferredTime, setPreferredTime] = useState<PreferredTime>(userProfile.preferredStudyTime || 'Evening');
  const [breakPref, setBreakPref] = useState<BreakPreference>(userProfile.breakPreferences || 'Pomodoro (25m / 5m)');

  // Step 4: First Upcoming Exam (Optional)
  const [examTitle, setExamTitle] = useState('Midterm Examination');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [examSubjectIndex, setExamSubjectIndex] = useState(0);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (studyDays.includes(day)) {
      setStudyDays(studyDays.filter(d => d !== day));
    } else {
      setStudyDays([...studyDays, day]);
    }
  };

  const handleAddSubject = () => {
    if (!newSubjName.trim()) return;
    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const color = colors[subjectsList.length % colors.length];
    setSubjectsList([...subjectsList, { name: newSubjName.trim(), difficulty: newSubjDiff, color }]);
    setNewSubjName('');
    setNewSubjDiff('Medium');
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjectsList(subjectsList.filter((_, i) => i !== idx));
  };

  const handleComplete = () => {
    // Save Profile
    updateProfile({
      displayName,
      educationLevel,
      availableStudyDays: studyDays,
      preferredStudyHoursPerDay: Number(hoursPerDay) || 4,
      typicalSessionDuration: Number(sessionDuration) || 45,
      preferredStudyTime: preferredTime,
      breakPreferences: breakPref,
      onboardingCompleted: true,
    });

    // Save initial subjects if they don't already exist
    const createdSubjectIds: string[] = [];
    subjectsList.forEach(s => {
      const created = addSubject({
        name: s.name,
        color: s.color,
        difficulty: s.difficulty,
        notes: '',
        learningGoals: [],
        targetWeeklyHours: 6,
      });
      createdSubjectIds.push(created.id);
    });

    // Save optional initial exam
    if (examTitle && examDate && createdSubjectIds.length > 0) {
      addExam({
        subjectId: createdSubjectIds[examSubjectIndex] || createdSubjectIds[0],
        title: examTitle,
        examDate,
        priority: 'High',
      });
    }

    // Automatically trigger smart plan calculation
    generateSmartSchedule();

    success('Onboarding Completed! 🚀', 'Your personalized academic workspace has been created.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl">
        {/* Brand & Progress Bar */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">StudySmart AI Onboarding</span>
          </div>
          <p className="text-xs text-slate-500">Step {step} of 4 • Set up your personalized study parameters</p>

          <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6 sm:p-8 shadow-md">
          {/* Step 1: Academic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Your Academic Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  How should StudySmart AI address you and calibrate recommendations?
                </p>
              </div>

              <Input
                label="What should we call you?"
                placeholder="e.g. Alex Chen"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />

              <Select
                label="Current Education Level"
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value as EducationLevel)}
              >
                <option value="High School">High School (Grade 9-12)</option>
                <option value="College / Undergraduate">College / Undergraduate Degree</option>
                <option value="University / Graduate">University / Graduate / Masters / PhD</option>
                <option value="Competitive Examinations">Competitive Examinations (MCAT, GRE, UPSC, JEE, etc.)</option>
              </Select>
            </div>
          )}

          {/* Step 2: Subjects & Difficulty Ratings */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Subjects & Self-Reported Difficulty
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Courses marked 'Hard' or 'Very Hard' will automatically receive prioritized prime time slots.
                </p>
              </div>

              {/* Add Subject row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="New course name (e.g. Machine Learning)"
                    value={newSubjName}
                    onChange={e => setNewSubjName(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Select
                    value={newSubjDiff}
                    onChange={e => setNewSubjDiff(e.target.value as SubjectDifficulty)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddSubject} leftIcon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>

              {/* Subject list */}
              <div className="space-y-2.5">
                {subjectsList.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-semibold text-sm text-slate-800">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          s.difficulty === 'Very Hard'
                            ? 'danger'
                            : s.difficulty === 'Hard'
                            ? 'warning'
                            : s.difficulty === 'Medium'
                            ? 'primary'
                            : 'success'
                        }
                      >
                        {s.difficulty}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Habits & Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Study Habits & Time Preferences
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tailor the schedule generator to your circadian rhythms and focus thresholds.
                </p>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Available Study Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => {
                    const active = studyDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Daily Study Hours"
                  type="number"
                  min="1"
                  max="14"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(Number(e.target.value))}
                />

                <Input
                  label="Typical Session Duration (Mins)"
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={sessionDuration}
                  onChange={e => setSessionDuration(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Preferred Study Window"
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value as PreferredTime)}
                >
                  <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                  <option value="Evening">Evening (6:00 PM - 10:00 PM)</option>
                  <option value="Night">Night Owl (9:00 PM - 1:00 AM)</option>
                  <option value="Flexible">Flexible / Distributed</option>
                </Select>

                <Select
                  label="Focus / Break Protocol"
                  value={breakPref}
                  onChange={e => setBreakPref(e.target.value as BreakPreference)}
                >
                  <option value="Pomodoro (25m / 5m)">Classic Pomodoro (25m focus / 5m break)</option>
                  <option value="Extended (50m / 10m)">Extended Sprint (50m focus / 10m break)</option>
                  <option value="Short (20m / 5m)">Short Intervals (20m focus / 5m break)</option>
                  <option value="Custom">Custom Interval</option>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: First Upcoming Exam (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Upcoming Major Exam or Milestone
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Optional. Adding an exam triggers automatic spaced revision blocks leading up to test day.
                </p>
              </div>

              <Input
                label="Exam / Assessment Title"
                placeholder="e.g. Algorithms Midterm"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Subject"
                  value={examSubjectIndex}
                  onChange={e => setExamSubjectIndex(Number(e.target.value))}
                >
                  {subjectsList.map((s, idx) => (
                    <option key={idx} value={idx}>
                      {s.name}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Exam Date"
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  All set! When you finish, StudySmart AI will automatically generate your first adaptive weekly schedule in your planner.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Skip Wizard
              </button>
            )}

            {step < 4 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleComplete}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Study Workspace
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
