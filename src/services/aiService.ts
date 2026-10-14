import { Subject, Task, Exam, StudySession } from '../types';

export interface AiTaskSubstep {
  title: string;
  durationMinutes: number;
  objective: string;
  tips: string;
}

export interface Flashcard {
  question: string;
  answer: string;
  concept: string;
}

export const AiService = {
  // Break down an assignment or study topic into bite-sized actionable blocks
  breakdownTask: async (
    taskTitle: string,
    subjectName: string,
    apiKey?: string
  ): Promise<{ steps: AiTaskSubstep[]; engine: string }> => {
    // If user provided a Gemini key, attempt live call
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (key) {
      try {
        const prompt = `You are an expert academic tutor. Break down the student task: "${taskTitle}" for subject "${subjectName}" into 3 to 4 sequential, actionable study steps. Return ONLY valid JSON array with keys: title, durationMinutes (number), objective, tips.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const steps = JSON.parse(jsonMatch[0]);
            return { steps, engine: 'Google Gemini 1.5 Flash (Live API)' };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local academic engine', err);
      }
    }

    // Heuristic Academic Breakdown Engine
    const lower = taskTitle.toLowerCase();
    let steps: AiTaskSubstep[] = [];

    if (lower.includes('code') || lower.includes('implement') || lower.includes('algorithm') || lower.includes('project')) {
      steps = [
        {
          title: 'Requirements & Architecture Specification',
          durationMinutes: 20,
          objective: 'Clarify data structures, inputs/outputs, and edge cases on paper before typing.',
          tips: 'Draw the state diagram or flow table first.',
        },
        {
          title: 'Core Implementation & Logic Scaffold',
          durationMinutes: 45,
          objective: 'Write the fundamental algorithms, data structures, and functions.',
          tips: 'Use small function signatures and test incrementally.',
        },
        {
          title: 'Edge-Case Testing & Boundary Validation',
          durationMinutes: 25,
          objective: 'Test empty inputs, negative numbers, large datasets, and error branches.',
          tips: 'Log time complexities and verify memory leaks.',
        },
      ];
    } else if (lower.includes('exam') || lower.includes('quiz') || lower.includes('test') || lower.includes('midterm')) {
      steps = [
        {
          title: 'Syllabus High-Yield Topic Audit',
          durationMinutes: 25,
          objective: 'Review past exam patterns and mark 3 weakest high-weight areas.',
          tips: 'Focus on topics that appeared frequently in past quizzes.',
        },
        {
          title: 'Active Recall & Formula Drilling',
          durationMinutes: 40,
          objective: 'Solve 4-6 representative numerical or theoretical problems without notes.',
          tips: 'Write out derivations without looking at solutions.',
        },
        {
          title: 'Timed Simulation & Blind Spots Review',
          durationMinutes: 30,
          objective: 'Complete a timed practice problem set under strict exam conditions.',
          tips: 'Immediately document any missed nuances in your cheat sheet notes.',
        },
      ];
    } else {
      steps = [
        {
          title: 'Phase 1: Conceptual Foundation & Outline',
          durationMinutes: 25,
          objective: 'Review reference readings, lecture notes, and rubric guidelines.',
          tips: 'Highlight non-negotiable grading criteria.',
        },
        {
          title: 'Phase 2: Deep Focus Execution',
          durationMinutes: 45,
          objective: 'Complete the main body of work in an uninterrupted Pomodoro sprint.',
          tips: 'Mute phone notifications and close irrelevant browser tabs.',
        },
        {
          title: 'Phase 3: Verification & Formatting Polish',
          durationMinutes: 20,
          objective: 'Verify against rubrics, double-check references, and submit cleanly.',
          tips: 'Read text backwards or aloud to catch subtle grammatical errors.',
        },
      ];
    }

    return { steps, engine: 'StudySmart Heuristic Engine (Local & Offline)' };
  },

  // Generate revision flashcards for any subject/topic
  generateFlashcards: (subjectName: string, topic: string): Flashcard[] => {
    return [
      {
        concept: `${topic} — Core Principle`,
        question: `What is the primary objective of ${topic} in ${subjectName}?`,
        answer: `It provides an optimized framework to structure logic, minimize computational or cognitive overhead, and ensure predictable behavior under scale.`,
      },
      {
        concept: `${topic} — Trade-offs & Limitations`,
        question: `What are the common trade-offs when applying ${topic}?`,
        answer: `Often involves a balance between space/memory consumption versus time complexity, or developer simplicity versus execution speed.`,
      },
      {
        concept: `${topic} — Real-world Application`,
        question: `Give a standard practical scenario where ${topic} is indispensable.`,
        answer: `Used in mission-critical subsystems where worst-case guarantees and clear invariants are required to prevent cascading system failures.`,
      },
    ];
  },

  // Conversational AI Study Coach
  chatAssistant: async (
    userMessage: string,
    history: { sender: 'user' | 'assistant'; text: string }[],
    context: { subjects: Subject[]; tasks: Task[]; exams: Exam[]; studySessions: StudySession[] },
    apiKey?: string
  ): Promise<{ text: string; engine: string }> => {
    const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (key) {
      try {
        const sysContext = `You are StudySmart AI, an encouraging, sharp, and structured academic mentor. Student currently has ${context.subjects.length} subjects: ${context.subjects.map(s => `${s.name} (${s.difficulty})`).join(', ')}. Upcoming exams: ${context.exams.map(e => `${e.title} on ${e.examDate}`).join(', ')}. Tasks due: ${context.tasks.filter(t => !t.completed).length}. Provide brief, structured, highly motivating advice with bullet points where appropriate.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `${sysContext}\n\nUser: ${userMessage}` }] }
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return { text: reply, engine: 'Google Gemini 1.5 Flash (Live API)' };
          }
        }
      } catch (err) {
        console.warn('Gemini chat failed, using local coaching engine', err);
      }
    }

    // High quality local conversational logic
    const lower = userMessage.toLowerCase();
    let reply = '';

    if (lower.includes('schedule') || lower.includes('plan') || lower.includes('today')) {
      const urgentTasks = context.tasks.filter(t => !t.completed);
      const urgentExams = context.exams.slice(0, 2);
      reply = `### 📅 Recommended Focus Strategy for Today\n\nBased on your active workload:\n\n1. **First Priority (Deep Work)**: Allocate a **45-minute sprint** to your highest priority task: *${urgentTasks[0]?.title || 'Key Subject Review'}*.\n2. **Upcoming Exam Spacing**: ${urgentExams[0] ? `Your **${urgentExams[0].title}** is approaching on ${urgentExams[0].examDate}. Do 30 minutes of active recall drilling.` : 'Review your weekly summary in the Planner tab.'}\n3. **Recovery Buffer**: Take a structured 10-minute walk or screen-free break between focus blocks.\n\n*💡 Tip: Use the **Focus Timer** page to log your sessions straight into your weekly analytics!*`;
    } else if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('anxious') || lower.includes('tired')) {
      reply = `### 🌿 Take a Deep Breath\n\nIt is completely normal to feel stretched when balancing exams and assignments. Here is how to regain calm control:\n\n- **Triage (Rule of 3)**: Don't look at the entire semester today. Pick exactly **three** small, manageable tasks to complete.\n- **Lower the Activation Energy**: Tell yourself you'll only study for **15 minutes**. Starting is 80% of the friction.\n- **Sleep & Hydration**: Cramming through sleep deprivation reduces recall by up to 40%. Rest is a non-negotiable part of academic performance.\n\nWhich single task can we tackle together right now?`;
    } else if (lower.includes('pomodoro') || lower.includes('timer') || lower.includes('technique')) {
      reply = `### ⏱️ The StudySmart Focus Technique\n\nWe recommend the modified **50/10 or 25/5 interval**:\n\n1. **Step 1 - Define the target**: Write down a single, clear outcome before starting the countdown (e.g., "Complete 3 problem set questions").\n2. **Step 2 - Eliminate friction**: Turn off secondary notifications, open only necessary course tabs.\n3. **Step 3 - The Sprint**: Stay locked in until the chime sounds.\n4. **Step 4 - Real Rest**: Stand up, stretch, drink water. Avoid social media scrolling during breaks as it prevents dopamine reset.\n\nHead to the **Focus Timer** in the sidebar to start your session!`;
    } else {
      reply = `### 🎯 Academic Mentor Insight\n\nYou're making great progress managing your coursework! Across your **${context.subjects.length} subjects**, you have **${context.tasks.filter(t => !t.completed).length} pending tasks** and **${context.exams.length} scheduled exams**.\n\n**Actionable Suggestions:**\n- **Space your revision**: Spaced repetition delivers 2.5x better retention than last-minute cramming.\n- **Prioritize by difficulty**: Tackle hard subjects like *${context.subjects.find(s => s.difficulty === 'Very Hard' || s.difficulty === 'Hard')?.name || 'your toughest courses'}* earlier in the day when mental energy is at its peak.\n\nHow else can I assist your study routine today? You can ask me to break down an assignment, create revision questions, or build a daily study routine!`;
    }

    return { text: reply, engine: 'StudySmart Heuristic Engine (Local & Offline)' };
  },
};
