import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useData } from '../context/DataContext';
import { formatDate, formatTime, getTodayString } from '../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { subjects, tasks, exams, studySessions } = useData();

  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayString(todayStr);
  };

  // Calendar matrix calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array
  const calendarCells: { dayNumber: number; dateString: string; isCurrentMonth: boolean }[] = [];

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    calendarCells.push({
      dayNumber: i,
      dateString: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
    });
  }

  // Prepend blanks for padding
  const totalSlots = adjustedFirstDay + daysInMonth;
  const paddingFront = adjustedFirstDay;

  // Selected Day Items
  const dayTasks = tasks.filter(t => t.dueDate === selectedDayString);
  const dayExams = exams.filter(e => e.examDate === selectedDayString);
  const daySessions = studySessions.filter(s => s.date === selectedDayString);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unified monthly timeline of assignments, exams, and scheduled study sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <Card className="lg:col-span-2 p-5 sm:p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: paddingFront }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/40 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {calendarCells.map(cell => {
              const isToday = cell.dateString === todayStr;
              const isSelected = cell.dateString === selectedDayString;

              const cellTasks = tasks.filter(t => t.dueDate === cell.dateString);
              const cellExams = exams.filter(e => e.examDate === cell.dateString);
              const cellSessions = studySessions.filter(s => s.date === cell.dateString);
              const totalItems = cellTasks.length + cellExams.length + cellSessions.length;

              return (
                <button
                  key={cell.dateString}
                  type="button"
                  onClick={() => setSelectedDayString(cell.dateString)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cellExams.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Exam scheduled" />
                    )}
                  </div>

                  {/* Micro indicators */}
                  <div className="space-y-0.5 overflow-hidden">
                    {cellExams.slice(0, 1).map(e => (
                      <div
                        key={e.id}
                        className="truncate text-[10px] bg-rose-100 text-rose-800 font-bold px-1 rounded"
                      >
                        {e.title}
                      </div>
                    ))}
                    {cellTasks.slice(0, 1).map(t => (
                      <div
                        key={t.id}
                        className="truncate text-[10px] bg-amber-100 text-amber-800 font-medium px-1 rounded"
                      >
                        {t.title}
                      </div>
                    ))}
                    {cellSessions.slice(0, 1).map(s => (
                      <div
                        key={s.id}
                        className="truncate text-[10px] bg-indigo-100 text-indigo-800 font-medium px-1 rounded"
                      >
                        {s.title}
                      </div>
                    ))}
                    {totalItems > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block">
                        +{totalItems - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Agenda (1 col) */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block">
                Day Schedule
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {formatDate(selectedDayString)}
              </h3>
            </div>

            {dayExams.length === 0 && dayTasks.length === 0 && daySessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No events or study blocks scheduled for this date.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Exams */}
                {dayExams.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Examinations
                    </span>
                    {dayExams.map(e => (
                      <div key={e.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                        <span className="font-semibold text-xs text-rose-950 block">{e.title}</span>
                        <span className="text-[11px] text-rose-700">Weight: {e.weightPercentage}% • Time: {e.examTime}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Deadlines */}
                {dayTasks.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Tasks Due
                    </span>
                    {dayTasks.map(t => (
                      <div key={t.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-amber-950 block">{t.title}</span>
                          <span className="text-[11px] text-amber-700">{t.type} • {t.priority}</span>
                        </div>
                        {t.completed && <Badge variant="success" size="sm">Completed</Badge>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Study Blocks */}
                {daySessions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Study Sessions
                    </span>
                    {daySessions.map(s => (
                      <div key={s.id} className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                        <span className="font-semibold text-xs text-indigo-950 block">{s.title}</span>
                        <div className="flex items-center justify-between text-[11px] text-indigo-700 mt-1">
                          <span>{formatTime(s.startTime)} - {formatTime(s.endTime)}</span>
                          <span>{s.durationMinutes} mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
