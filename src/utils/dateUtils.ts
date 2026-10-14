export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getDaysRemaining(targetDateStr: string): {
  days: number;
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isUrgent: boolean;
} {
  const todayStr = getTodayString();
  const today = new Date(todayStr);
  const target = new Date(targetDateStr);
  
  const diffTime = target.getTime() - today.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      days,
      label: `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`,
      isOverdue: true,
      isToday: false,
      isUrgent: true,
    };
  } else if (days === 0) {
    return {
      days: 0,
      label: 'Due today',
      isOverdue: false,
      isToday: true,
      isUrgent: true,
    };
  } else if (days === 1) {
    return {
      days: 1,
      label: 'Tomorrow',
      isOverdue: false,
      isToday: false,
      isUrgent: true,
    };
  } else {
    return {
      days,
      label: `in ${days} days`,
      isOverdue: false,
      isToday: false,
      isUrgent: days <= 3,
    };
  }
}

export function getWeekDays(referenceDate: Date = new Date()): { date: string; dayName: string; dayNumber: number }[] {
  const current = new Date(referenceDate);
  const day = current.getDay();
  // Adjust so Monday is 0
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(nextDate.getDate()).padStart(2, '0');
    
    week.push({
      date: `${year}-${month}-${dayOfMonth}`,
      dayName: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: nextDate.getDate(),
    });
  }
  return week;
}
