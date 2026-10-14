import React, { useState } from 'react';
import {
  User,
  Settings,
  Sparkles,
  Key,
  ShieldCheck,
  Bell,
  RotateCcw,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { EducationLevel, PreferredTime, BreakPreference } from '../types';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateProfile, isFirebase, isDemoMode, setDemoMode } = useAuth();
  const { resetAllData } = useData();
  const { success, info } = useToast();

  // Profile State
  const [displayName, setDisplayName] = useState(userProfile.displayName || 'Alex Chen');
  const [email, setEmail] = useState(userProfile.email || 'alex.chen@university.edu');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    userProfile.educationLevel || 'College / Undergraduate'
  );
  const [hoursPerDay, setHoursPerDay] = useState(String(userProfile.preferredStudyHoursPerDay || 4));
  const [sessionDuration, setSessionDuration] = useState(String(userProfile.typicalSessionDuration || 45));
  const [preferredTime, setPreferredTime] = useState<PreferredTime>(userProfile.preferredStudyTime || 'Evening');
  const [breakPref, setBreakPref] = useState<BreakPreference>(userProfile.breakPreferences || 'Pomodoro (25m / 5m)');

  // AI Key state
  const [apiKey, setApiKey] = useState(userProfile.aiApiKey || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local_smart_engine'>(
    userProfile.aiProvider || 'local_smart_engine'
  );

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      email,
      educationLevel,
      preferredStudyHoursPerDay: Number(hoursPerDay) || 4,
      typicalSessionDuration: Number(sessionDuration) || 45,
      preferredStudyTime: preferredTime,
      breakPreferences: breakPref,
      aiApiKey: apiKey.trim() || undefined,
      aiProvider,
    });
    success('Settings Saved', 'Your study preferences have been updated.');
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        success('Notifications Enabled!', 'Browser deadline reminders are now active.');
      } else {
        info('Notifications Declined', 'Browser notifications were not granted.');
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all coursework, tasks, exams, and logs back to the default demo student dataset?')) {
      resetAllData();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Profile & System Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure academic preferences, AI API credentials, notifications, and storage modes.
        </p>
      </div>

      {/* 1. Academic Profile & Study Parameters Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Student Profile Information
            </h3>
            <Badge variant="primary">{educationLevel}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="Student Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <Select
            label="Education Level"
            value={educationLevel}
            onChange={e => setEducationLevel(e.target.value as EducationLevel)}
          >
            <option value="High School">High School (Grade 9-12)</option>
            <option value="College / Undergraduate">College / Undergraduate Degree</option>
            <option value="University / Graduate">University / Graduate / Masters / PhD</option>
            <option value="Competitive Examinations">Competitive Examinations (GRE, MCAT, UPSC, JEE, etc.)</option>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Input
              label="Target Daily Study Hours"
              type="number"
              min="1"
              max="14"
              value={hoursPerDay}
              onChange={e => setHoursPerDay(e.target.value)}
            />
            <Input
              label="Typical Session Duration (Mins)"
              type="number"
              min="15"
              max="120"
              step="15"
              value={sessionDuration}
              onChange={e => setSessionDuration(e.target.value)}
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
              label="Break Protocol"
              value={breakPref}
              onChange={e => setBreakPref(e.target.value as BreakPreference)}
            >
              <option value="Pomodoro (25m / 5m)">Classic Pomodoro (25m focus / 5m break)</option>
              <option value="Extended (50m / 10m)">Extended Sprint (50m focus / 10m break)</option>
              <option value="Short (20m / 5m)">Short Intervals (20m focus / 5m break)</option>
              <option value="Custom">Custom Interval</option>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">
              Save Profile Preferences
            </Button>
          </div>
        </Card>

        {/* 2. AI Engine Configuration */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Engine & LLM Configuration
            </h3>
            <Badge variant={apiKey ? 'success' : 'purple'}>
              {apiKey ? 'Live API Configured' : 'Offline Heuristic Engine'}
            </Badge>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            StudySmart AI operates completely offline by default using an algorithmic heuristic study scheduler. To enable live LLM generation for chat coaching and task breakdown, paste an optional Google Gemini API key below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="AI Provider"
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value as any)}
              >
                <option value="local_smart_engine">Local Heuristic Engine (Offline)</option>
                <option value="gemini">Google Gemini 1.5 Flash</option>
                <option value="openai">OpenAI GPT-4o-mini</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Input
                label="API Key (Optional / Private)"
                type="password"
                placeholder="AIzaSy... (Stored only locally in browser session)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                leftIcon={<Key className="w-4 h-4" />}
                helperText="Keys are never transmitted to unauthorized third parties."
              />
            </div>
          </div>
        </Card>

        {/* 3. Database & System Integrations */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Database Storage & Persistence Mode
            </h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isFirebase && !isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isFirebase && !isDemoMode ? 'Firebase Live' : 'Demo Mode (Local Persistence)'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Firebase Auth & Firestore Status:</span>
              <span>{isFirebase ? 'Configured in Environment' : 'Not Connected (.env empty)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Firestore Security Rules:</span>
              <span className="text-emerald-700 font-medium">Included in project root (`firestore.rules`)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Demo Mode Toggle</p>
              <p className="text-[11px] text-slate-400">Switch between local simulated dataset and Firebase mode.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDemoMode(!isDemoMode)}
            >
              {isDemoMode ? 'Switch to Firebase' : 'Switch to Demo Mode'}
            </Button>
          </div>
        </Card>

        {/* 4. Browser Notifications */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Browser Notifications
            </h3>
            <Badge variant={notifPermission === 'granted' ? 'success' : 'default'}>
              {notifPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <p className="text-xs text-slate-500">
            Allow StudySmart AI to deliver desktop chimes and visual alerts when Pomodoro timers conclude or task deadlines approach.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRequestNotifications}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            {notifPermission === 'granted' ? 'Notifications Active' : 'Request Notification Permission'}
          </Button>
        </Card>

        {/* 5. Demo Data Management (Reset Data) */}
        <Card className="p-6 border-rose-100 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Reset Demo Student Dataset
            </h3>
            <Badge variant="danger">Hackathon Demo Control</Badge>
          </div>

          <p className="text-xs text-slate-500">
            Restore the pre-populated starter dataset for Alex Chen (Undergraduate Computer Science courses, assignments, exams, and weekly study blocks).
          </p>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleResetData}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset All Data to Demo Defaults
          </Button>
        </Card>
      </form>
    </div>
  );
};
