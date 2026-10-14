import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { playNotificationSound } from '../utils/helpers';
import { formatDate } from '../utils/dateUtils';

type TimerMode = 'Pomodoro' | 'Short Break' | 'Long Break' | 'Custom';

export const FocusTimerPage: React.FC = () => {
  const { subjects, addFocusLog, focusLogs } = useData();
  const { success, info } = useToast();

  const [mode, setMode] = useState<TimerMode>('Pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer durations in minutes
  const durations: Record<TimerMode, number> = {
    'Pomodoro': 25,
    'Short Break': 5,
    'Long Break': 15,
    'Custom': 45,
  };

  const [customMinutes, setCustomMinutes] = useState(45);
  const [totalSeconds, setTotalSeconds] = useState(durations['Pomodoro'] * 60);
  const [secondsLeft, setSecondsLeft] = useState(durations['Pomodoro'] * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<any>(null);

  // Switch timer mode
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    const mins = newMode === 'Custom' ? customMinutes : durations[newMode];
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  // Custom minutes update
  const handleCustomChange = (mins: number) => {
    setCustomMinutes(mins);
    if (mode === 'Custom') {
      setIsRunning(false);
      setTotalSeconds(mins * 60);
      setSecondsLeft(mins * 60);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle completion
  const handleTimerComplete = () => {
    setIsRunning(false);

    // Audio chime
    if (soundEnabled) {
      playNotificationSound('timer');
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if confetti fails in headless env
    }

    // HTML5 browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('StudySmart AI Focus Session Finished! 🎉', {
        body: `Great focus! You completed ${Math.round(totalSeconds / 60)} minutes in ${mode} mode.`,
      });
    }

    // Log to Focus Logs
    const completedMins = Math.round(totalSeconds / 60);
    addFocusLog({
      subjectId: selectedSubjectId || undefined,
      durationMinutes: completedMins,
      mode,
      notes: sessionNotes || undefined,
    });

    success(
      'Session Complete! 🏆',
      `Awesome job! Logged ${completedMins} focus minutes to your study analytics.`
    );
  };

  const handleTogglePlay = () => {
    // Request notification permission on first interaction if not asked
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const mins = mode === 'Custom' ? customMinutes : durations[mode];
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  // Formatting MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Circular progress math
  const progressPercent = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = 565.48 * (1 - progressPercent);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Focus Session Timer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lock into deep work intervals. Sessions are automatically logged to your subject progress analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Display (2 cols) */}
        <Card className="lg:col-span-2 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-md">
          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-8">
            {(['Pomodoro', 'Short Break', 'Long Break', 'Custom'] as TimerMode[]).map(m => (
              <button
                key={m}
                onClick={() => handleSwitchMode(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  mode === m
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m} {m !== 'Custom' && `(${durations[m]}m)`}
              </button>
            ))}
          </div>

          {/* Circular SVG Timer Ring */}
          <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="transition-all duration-500 ease-linear"
                stroke={currentSubject ? currentSubject.color : '#6366f1'}
                strokeWidth="9"
                strokeDasharray="565.48"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Timer Details */}
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 font-mono">
                {timeDisplay}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wider">
                {mode} Mode
              </span>
              {currentSubject && (
                <span
                  className="mt-2 text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: currentSubject.color }}
                >
                  {currentSubject.name}
                </span>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <Button
              size="lg"
              onClick={handleTogglePlay}
              className="px-8 shadow-md"
              leftIcon={isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            >
              {isRunning ? 'Pause Focus' : 'Start Focus'}
            </Button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title={soundEnabled ? 'Mute sound chime' : 'Enable sound chime'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
          </div>

          {/* Custom Duration Slider */}
          {mode === 'Custom' && (
            <div className="mt-6 w-full max-w-xs text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Duration: {customMinutes} Minutes
              </label>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={customMinutes}
                onChange={e => handleCustomChange(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          )}
        </Card>

        {/* Sidebar Context & Recent Focus Logs (1 col) */}
        <div className="space-y-6">
          {/* Target Course Tagging */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Tag Focus to Course
            </h3>

            <Select
              label="Subject / Class"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Input
              label="Session Goal (Optional)"
              placeholder="e.g. Solve 3 DP practice problems"
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
            />
          </Card>

          {/* Recent Completed Sessions */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Recent Completed Sessions
            </h3>

            <div className="space-y-2.5">
              {focusLogs.slice(0, 4).map(log => {
                const subj = subjects.find(s => s.id === log.subjectId);
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {subj?.name || 'General Focus'}
                      </span>
                      {log.notes && (
                        <span className="text-[11px] text-slate-500 line-clamp-1">{log.notes}</span>
                      )}
                    </div>
                    <Badge variant="success" size="sm">
                      {log.durationMinutes}m
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
