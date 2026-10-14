import { Subject, Task, Exam, StudySession, UserProfile } from '../types';
import { getTodayString, getWeekDays } from '../utils/dateUtils';

export interface PlanGenerationOptions {
  startDate?: string;
  daysToPlan?: number;
  maxSessionsPerDay?: number;
  sessionDurationMinutes?: number;
}

export function generateSmartStudySchedule(
  profile: UserProfile,
  subjects: Subject[],
  tasks: Task[],
  exams: Exam[],
  existingSessions: StudySession[],
  options: PlanGenerationOptions = {}
): StudySession[] {
  if (subjects.length === 0) return existingSessions;

  const todayStr = getTodayString();
  const weekDays = getWeekDays(new Date(todayStr));
  const newSessions: StudySession[] = [];

  // Determine base starting time according to user's preferredStudyTime
  let baseStartHour = 18; // Default evening
  if (profile.preferredStudyTime === 'Morning') baseStartHour = 9;
  else if (profile.preferredStudyTime === 'Afternoon') baseStartHour = 14;
  else if (profile.preferredStudyTime === 'Night') baseStartHour = 20;

  const sessionDuration = options.sessionDurationMinutes || profile.typicalSessionDuration || 45;
  const maxSessions = options.maxSessionsPerDay || Math.min(3, Math.floor((profile.preferredStudyHoursPerDay * 60) / sessionDuration));

  // Difficulty weights
  const difficultyMultiplier: Record<string, number> = {
    'Very Hard': 2.2,
    Hard: 1.6,
    Medium: 1.1,
    Easy: 0.8,
  };

  weekDays.forEach((dayInfo, dayIdx) => {
    const currentDateStr = dayInfo.date;

    // Check if user studies on this weekday
    const fullDayName = new Date(currentDateStr).toLocaleDateString('en-US', { weekday: 'long' });
    if (profile.availableStudyDays.length > 0 && !profile.availableStudyDays.includes(fullDayName)) {
      return; // Rest day
    }

    // Calculate urgency score for each subject on this specific date
    const subjectScores = subjects.map(subject => {
      let score = 10 * (difficultyMultiplier[subject.difficulty] || 1.0);

      // Check exams for this subject
      const subjectExams = exams.filter(e => e.subjectId === subject.id);
      subjectExams.forEach(exam => {
        const daysUntilExam = Math.round(
          (new Date(exam.examDate).getTime() - new Date(currentDateStr).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExam >= 0 && daysUntilExam <= 14) {
          // Closer exams get higher boost
          const urgencyBoost = Math.max(5, (15 - daysUntilExam) * 8);
          score += urgencyBoost;
        }
      });

      // Check tasks due within 3 days of this date
      const subjectTasks = tasks.filter(t => !t.completed && t.subjectId === subject.id);
      subjectTasks.forEach(task => {
        const daysUntilTask = Math.round(
          (new Date(task.dueDate).getTime() - new Date(currentDateStr).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilTask >= 0 && daysUntilTask <= 3) {
          const taskBoost = task.priority === 'Urgent' ? 35 : task.priority === 'High' ? 25 : 15;
          score += taskBoost;
        }
      });

      return { subject, score };
    });

    // Sort subjects by score descending
    subjectScores.sort((a, b) => b.score - a.score);

    // Schedule up to maxSessions blocks for this day
    const daySessionsCount = Math.min(maxSessions, subjectScores.length);
    for (let slot = 0; slot < daySessionsCount; slot++) {
      const topSubject = subjectScores[slot].subject;

      // Calculate time slot
      const startMinutes = baseStartHour * 60 + slot * (sessionDuration + 15);
      const startH = Math.floor(startMinutes / 60);
      const startM = startMinutes % 60;
      const endMinutes = startMinutes + sessionDuration;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;

      const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // Find closest pending task or exam for title context
      const urgentTask = tasks.find(t => !t.completed && t.subjectId === topSubject.id);
      const upcomingExam = exams.find(e => e.subjectId === topSubject.id);

      let title = `${topSubject.name} Mastery Session`;
      let sessionType: StudySession['sessionType'] = 'Problem Solving';
      let reason = `Recommended based on ${topSubject.difficulty} difficulty rating.`;

      if (upcomingExam) {
        title = `Prep for ${upcomingExam.title}`;
        sessionType = 'Exam Prep';
        reason = `Upcoming exam in ${upcomingExam.title} on ${upcomingExam.examDate}. Prioritizing high-yield topics.`;
      } else if (urgentTask) {
        title = `Work on "${urgentTask.title}"`;
        sessionType = 'Assignment Work';
        reason = `Approaching deadline on ${urgentTask.dueDate}.`;
      } else if (topSubject.difficulty === 'Hard' || topSubject.difficulty === 'Very Hard') {
        sessionType = 'New Material';
        reason = `Allocated dedicated focus time for high difficulty curriculum.`;
      }

      newSessions.push({
        id: `gen-sess-${Date.now()}-${dayIdx}-${slot}`,
        userId: profile.uid,
        title,
        subjectId: topSubject.id,
        date: currentDateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        durationMinutes: sessionDuration,
        priority: subjectScores[slot].score > 30 ? 'High' : 'Medium',
        sessionType,
        completed: false,
        aiRecommended: true,
        recommendationReason: reason,
      });
    }
  });

  return newSessions;
}
