import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  Wand2,
  CheckCircle2,
  Calendar,
  Timer,
  BarChart2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: Wand2,
      title: 'Smart Study Schedules',
      description:
        'Generates balanced study blocks calculated from your exam dates, subject difficulty, and weekly available hours.',
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      icon: CheckCircle2,
      title: 'Assignment Tracking',
      description:
        'Organize homework, problem sets, and milestones with dynamic priority tags and countdown reminders.',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: GraduationCap,
      title: 'Exam Countdowns',
      description:
        'Track upcoming midterms and finals with automatic syllabus weightings and spaced revision allocation.',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Suggestions',
      description:
        'Break down complex problem sets into digestible 25-minute sprints with an academic coach at your side.',
      color: 'text-violet-600 bg-violet-50',
    },
    {
      icon: Timer,
      title: 'Integrated Focus Timer',
      description:
        'Custom Pomodoro intervals with audio chimes and automatic logging directly to your subject study hours.',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: BarChart2,
      title: 'Progress Analytics',
      description:
        'Visual Recharts analytics tracking weekly study hours, subject allocation balance, and task completion rates.',
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  const faqs = [
    {
      q: 'How does the Smart Study Planner calculate my schedule?',
      a: 'The engine analyzes four core parameters: your self-reported subject difficulty, upcoming exam dates (giving higher priority to tests in the next 14 days), pending assignments, and your preferred study hours and time of day. It then creates balanced, spaced study blocks.',
    },
    {
      q: 'Can I use StudySmart AI without configuring Firebase or an external AI key?',
      a: 'Yes. StudySmart AI includes a fully functional offline demo mode powered by local browser persistence. It features our algorithmic study engine and local assistant out of the box, with zero external setup required.',
    },
    {
      q: 'How are my study hours and tasks stored?',
      a: 'Data is stored securely either in your Cloud Firestore instance (when Firebase is enabled with authenticated ownership rules) or within your browser LocalStorage during Demo Mode.',
    },
    {
      q: 'What types of students benefit most from StudySmart AI?',
      a: 'High school students, undergraduates, graduate researchers, and candidates preparing for competitive examinations who need to balance multiple simultaneous deadlines without cognitive overload.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              StudySmart <span className="text-indigo-600">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#preview" className="hover:text-indigo-600 transition-colors">Preview</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for College Hackathon Demonstration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight md:leading-[1.15]">
            Your Personal <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">AI Study Planner</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Study smarter. Stay organized. Achieve more. An intelligent planner that adapts to your subjects, exam dates, difficulty levels, and available study hours.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Planning for Free
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Interactive Hero Preview Card */}
          <div id="preview" className="mt-12 sm:mt-16 mx-auto max-w-5xl rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xl shadow-slate-200/50 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-400 ml-2">StudySmart AI — Student Dashboard</span>
              </div>
              <Badge variant="success">Active Semester 2026</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Today's Study Plan</span>
                  <Badge variant="primary">3 Sessions</Badge>
                </div>
                <p className="font-semibold text-slate-800 text-sm mt-2">Data Structures: Graph Algorithms</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>4:00 PM - 5:15 PM (75 mins)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Upcoming Exam</span>
                  <Badge variant="danger">In 4 Days</Badge>
                </div>
                <p className="font-semibold text-slate-800 text-sm mt-2">Operating Systems Midterm</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Weight: 25% • Very Hard</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>Weekly Study Goal</span>
                  <span className="font-bold text-indigo-600">76%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full w-3/4" />
                </div>
                <p className="text-xs text-slate-500 mt-2">15.5 hrs completed of 20 hrs target</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete Academic Time Management
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Everything you need to balance assignments, revise effectively, and eliminate academic stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} hoverable className="flex flex-col items-start p-6">
                  <div className={`p-3 rounded-xl mb-4 ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              How StudySmart AI Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Four simple steps from chaotic deadlines to an optimized daily study routine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Add Subjects & Deadlines',
                desc: 'Enter your current courses, difficulty ratings, assignments, and exam schedules.',
              },
              {
                step: '02',
                title: 'Set Available Time',
                desc: 'Configure your preferred daily study hours, study session duration, and break preferences.',
              },
              {
                step: '03',
                title: 'Generate Smart Plan',
                desc: 'The AI scheduling engine computes optimal study blocks prioritized by urgency and difficulty.',
              },
              {
                step: '04',
                title: 'Track & Adjust',
                desc: 'Log focused minutes with the Pomodoro timer, mark completed tasks, and monitor analytics.',
              },
            ].map((step, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <span className="text-3xl font-extrabold text-indigo-200 block mb-2">{step.step}</span>
                <h3 className="text-base font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Answers about StudySmart AI, architecture, and capabilities.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              StudySmart AI
            </span>
            <span className="text-xs text-slate-400 ml-2">
              — "Study smarter. Stay organized. Achieve more."
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/login" className="hover:text-indigo-600">Login</Link>
            <Link to="/signup" className="hover:text-indigo-600">Sign Up</Link>
            <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <Link to="/settings" className="hover:text-indigo-600">Settings</Link>
          </div>

          <p className="text-xs text-slate-400">
            Crafted for College Hackathon • React + Vite + Tailwind + Firebase
          </p>
        </div>
      </footer>
    </div>
  );
};
