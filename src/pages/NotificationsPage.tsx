import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  Trash2,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/dateUtils';
import { AppNotification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications } = useData();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType !== 'ALL') return n.type === filterType;
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'deadline':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'ai_tip':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deadline alerts, exam countdown reminders, AI schedule updates, and milestone achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAllNotifications} leftIcon={<Trash2 className="w-4 h-4" />}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Notifications' },
          { id: 'UNREAD', label: 'Unread Only' },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'reminder', label: 'Reminders' },
          { id: 'ai_tip', label: 'AI Updates' },
          { id: 'achievement', label: 'Achievements' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications to show"
          description="You are completely caught up! We will alert you when deadlines or exams approach."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map(notif => (
            <Card
              key={notif.id}
              className={`p-4 transition-all flex items-start gap-3.5 ${
                notif.read ? 'bg-white border-slate-200/90' : 'bg-indigo-50/30 border-indigo-200 shadow-xs'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDate(notif.timestamp.split('T')[0])}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                <div className="flex items-center gap-4 mt-2 pt-1">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => markNotificationRead(notif.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
