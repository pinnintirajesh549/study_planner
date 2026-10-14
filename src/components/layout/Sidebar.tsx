import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  GraduationCap,
  CalendarDays,
  Timer,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { userProfile, logout, isDemoMode, isFirebase } = useAuth();
  const { unreadNotificationCount } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/subjects', label: 'My Subjects', icon: BookOpen },
    { to: '/tasks', label: 'Assignments & Tasks', icon: CheckSquare },
    { to: '/exams', label: 'Exams & Deadlines', icon: GraduationCap },
    { to: '/planner', label: 'Smart Planner', icon: Wand2, highlight: true },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/timer', label: 'Focus Timer', icon: Timer },
    { to: '/analytics', label: 'Progress Analytics', icon: BarChart3 },
    { to: '/ai-assistant', label: 'AI Study Coach', icon: Sparkles, badge: 'AI' },
    { to: '/notifications', label: 'Notifications', icon: Bell, count: unreadNotificationCount },
    { to: '/settings', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 md:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-sm shadow-indigo-200">
              <BrainCircuit className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base text-slate-900 tracking-tight block truncate">
                  StudySmart <span className="text-indigo-600 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                  Your Personal Planner
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Mode Indicator Banner */}
        <div className={`px-3 py-2 border-b border-slate-100 bg-slate-50/80 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? (
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isFirebase && !isDemoMode ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={isFirebase && !isDemoMode ? 'Firebase Live Mode' : 'Demo Mode (Local Persistence)'}
            />
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Data Storage:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold ${
                  isFirebase && !isDemoMode
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isFirebase && !isDemoMode ? 'Firebase Live' : 'Demo Mode'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                    item.highlight ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
                {!collapsed && (item.count ?? 0) > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini-Profile & Logout */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
              {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {userProfile.displayName || 'Alex Chen'}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {userProfile.educationLevel}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
