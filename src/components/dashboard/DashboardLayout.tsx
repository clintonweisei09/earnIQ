import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Sparkles,
  LayoutDashboard,
  Brain,
  Briefcase,
  ClipboardList,
  Wallet,
  Phone,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  User,
  Moon,
  Sun,
  AlertCircle,
  Trophy,
  Award,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/learning', icon: Brain, label: 'AI Learning Hub' },
  { to: '/dashboard/tasks', icon: Briefcase, label: 'Task Marketplace' },
  { to: '/dashboard/my-tasks', icon: ClipboardList, label: 'My Tasks' },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/dashboard/withdrawals', icon: Phone, label: 'M-Pesa Withdrawals' },
  { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/dashboard/achievements', icon: Award, label: 'Achievements' },
  { to: '/dashboard/resume', icon: FileText, label: 'Resume Builder' },
  { to: '/dashboard/assistant', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/dashboard/referrals', icon: Users, label: 'Referrals' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadNotifications();

    if (!profile?.id) return;
    let mounted = true;
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => {
          if (mounted) loadNotifications();
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, profile?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    if (!profile?.id) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
      .eq('read', false);
    loadNotifications();
  };

  const handleNotificationClick = async (notif: NotificationRow) => {
    if (!notif.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', notif.id);
      loadNotifications();
    }
    if (notif.link) {
      navigate(notif.link);
      setNotificationsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Wallet className="w-5 h-5 text-green-500" />;
      case 'task':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'course':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-secondary-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transition-colors duration-300">
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-100 dark:border-secondary-700">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-white">
              Earn<span className="text-primary-600">IQ</span>
            </span>
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-secondary-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-100 dark:border-secondary-700">
          <NavLink to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900 dark:text-white">
              Earn<span className="text-primary-600">IQ</span>
            </span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-secondary-500 dark:text-secondary-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 h-16 transition-colors duration-300">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 dark:text-secondary-500" />
                <input
                  type="search"
                  placeholder="Search tasks, skills..."
                  className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:placeholder-secondary-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex gap-3 px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer transition-colors ${
                              !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900 dark:text-white">
                                {notif.title}
                              </p>
                              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                {notif.message}
                              </p>
                              <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                                {timeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-12 text-center">
                          <Bell className="w-10 h-10 text-secondary-300 mx-auto mb-3" />
                          <p className="text-sm text-secondary-500">No notifications yet</p>
                          <p className="text-xs text-secondary-400 mt-1">You'll see updates here as you use EarnIQ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-secondary-900 dark:text-white truncate max-w-[120px]">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate max-w-[120px]">
                      {profile?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-400 dark:text-secondary-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{profile?.full_name}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">{profile?.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded">
                        {profile?.user_type || 'Worker'}
                      </span>
                    </div>
                    <NavLink
                      to="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
