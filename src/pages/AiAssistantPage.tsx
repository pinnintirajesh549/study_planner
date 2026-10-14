import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Wand2,
  BookOpen,
  HelpCircle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AiService, Flashcard } from '../services/aiService';
import { AiChatMessage } from '../types';

export const AiAssistantPage: React.FC = () => {
  const { subjects, tasks, exams, studySessions, addStudySession } = useData();
  const { userProfile } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'CHAT' | 'FLASHCARDS'>('CHAT');

  // Chat State
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${userProfile.displayName || 'Alex'}! I'm your **StudySmart AI Academic Coach**.\n\nI can analyze your active course load, break down tough assignments, recommend revision sequences, or help you structure today's study sprints. What would you like to focus on?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentEngine, setCurrentEngine] = useState('StudySmart Heuristic Engine');

  // Flashcards State
  const [fcSubject, setFcSubject] = useState(subjects[0]?.name || 'Data Structures');
  const [fcTopic, setFcTopic] = useState('Graph Algorithms & Dijkstra');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() =>
    AiService.generateFlashcards(subjects[0]?.name || 'Data Structures', 'Graph Algorithms & Dijkstra')
  );

  const quickPrompts = [
    'How should I structure my revision for upcoming exams?',
    'I feel overwhelmed with assignments due this week.',
    'Create an optimal 3-step study routine for today.',
    'What are effective active recall techniques for hard subjects?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const historyForAi = messages.map(m => ({ sender: m.sender, text: m.text }));

    const res = await AiService.chatAssistant(
      text,
      historyForAi,
      { subjects, tasks, exams, studySessions },
      userProfile.aiApiKey
    );

    setCurrentEngine(res.engine);

    const botMsg: AiChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'assistant',
      text: res.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleGenerateFlashcards = () => {
    if (!fcTopic.trim()) return;
    const cards = AiService.generateFlashcards(fcSubject, fcTopic.trim());
    setFlashcards(cards);
    success('Flashcards Generated!', `Created ${cards.length} active recall cards.`);
  };

  const handleScheduleSprintFromAi = () => {
    const today = new Date().toISOString().split('T')[0];
    addStudySession({
      title: 'AI Coaching Study Sprint',
      subjectId: subjects[0]?.id || '',
      date: today,
      startTime: '19:00',
      endTime: '19:45',
      durationMinutes: 45,
      priority: 'High',
      sessionType: 'Problem Solving',
      completed: false,
      aiRecommended: true,
      recommendationReason: 'Suggested by AI Academic Coach during chat consultation.',
    });
    success('Sprint Added!', 'Scheduled a 45-minute focus block in your planner.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Coach</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Academic Assistant
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Active Engine: <strong className="text-indigo-600">{currentEngine}</strong>
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'CHAT' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Coach Chat
          </button>
          <button
            onClick={() => setActiveTab('FLASHCARDS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'FLASHCARDS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revision Flashcards
          </button>
        </div>
      </div>

      {activeTab === 'CHAT' ? (
        <Card className="flex flex-col h-[650px] p-0 overflow-hidden shadow-md">
          {/* Chat header bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">StudySmart Tutor Bot</h3>
                <span className="text-[10px] text-emerald-600 font-medium">● Online & Context-Aware</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleSprintFromAi}
              leftIcon={<Clock className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs"
            >
              Add 45m Sprint to Planner
            </Button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map(m => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs ${
                      isUser ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <span
                      className={`block text-[10px] mt-2 ${
                        isUser ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-indigo-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="text-[11px] font-medium text-slate-600 hover:text-indigo-700 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input form */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Ask your study coach anything (e.g. How to prepare for my upcoming exam?)..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" disabled={isTyping || !inputMessage.trim()} leftIcon={<Send className="w-4 h-4" />}>
                Send
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        /* Flashcards Generator View */
        <div className="space-y-6">
          <Card className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Active Recall Flashcard Generator
            </h3>
            <p className="text-xs text-slate-500">
              Generate test questions and conceptual summaries for any subject or topic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Subject"
                value={fcSubject}
                onChange={e => setFcSubject(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </Select>

              <div className="sm:col-span-2">
                <Input
                  label="Topic / Chapter / Theory"
                  placeholder="e.g. Virtual Memory Paging & Multi-Level Page Tables"
                  value={fcTopic}
                  onChange={e => setFcTopic(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleGenerateFlashcards} leftIcon={<Sparkles className="w-4 h-4" />}>
              Generate Flashcard Deck
            </Button>
          </Card>

          {/* Flashcards Deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashcards.map((card, idx) => (
              <Card key={idx} className="p-5 flex flex-col justify-between border-indigo-100 hover:shadow-md transition-shadow">
                <div>
                  <Badge variant="purple" size="sm" className="mb-3">
                    {card.concept}
                  </Badge>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">
                    Q: {card.question}
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <strong>A:</strong> {card.answer}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Card {idx + 1} of {flashcards.length}</span>
                  <span className="text-indigo-600 font-semibold">Active Recall</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
