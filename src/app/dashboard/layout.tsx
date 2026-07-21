'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Activity, Mic, Calendar, Layers, BarChart3,
  Settings, LogOut, Menu, X, Sparkles, Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Today', icon: Activity },
  { href: '/dashboard/habits', label: 'Habits', icon: Layers },
  { href: '/dashboard/projects', label: 'Projects', icon: BarChart3 },
  { href: '/dashboard/review', label: 'Review', icon: Calendar },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function PlanBadge({ plan }: { plan: string }) {
  const cls = plan === 'pro' ? 'badge-pro' : plan === 'plus' ? 'badge-plus' : 'badge-free';
  const label = plan === 'pro' ? 'PRO' : plan === 'plus' ? 'PLUS' : 'FREE';
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [captureText, setCaptureText] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  async function handleCapture() {
    if (!captureText.trim()) return;
    const text = captureText.trim();
    setCaptureText('');
    router.push(`/dashboard/capture?q=${encodeURIComponent(text)}&mode=text`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenu(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-full flex flex-col glass border-r border-white/5 transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-sm text-gradient">PULSE</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href} href={href}
                onClick={() => setMobileMenu(false)}
                className={`nav-item flex items-center gap-3 ${active ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-3' : 'px-3'}`}
                title={label}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Capture shortcut */}
        {sidebarOpen && (
          <div className="px-4 pb-3">
            <button onClick={() => router.push('/dashboard/capture')} className="w-full btn-primary py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Mic className="w-4 h-4" /> Capture Thought
            </button>
          </div>
        )}

        {/* User section */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <PlanBadge plan={user.plan} />
              </div>
            )}
            {sidebarOpen && (
              <button onClick={logout} className="text-[var(--text-muted)] hover:text-white transition-colors p-1" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-white/5 glass">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-[var(--text-secondary)] hover:text-white transition-colors">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-[var(--text-muted)] hover:text-white transition-colors">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1 max-w-md">
            <div className="glass flex items-center gap-2 px-3 py-2 rounded-lg">
              <Search className="w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" placeholder="Search thoughts, actions…" className="bg-transparent text-sm text-white placeholder-[var(--text-muted)] outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <PlanBadge plan={user.plan} />
          </div>
        </header>

        {/* Content area with bottom padding for capture bar */}
        <main className="flex-1 overflow-auto pb-24">{children}</main>

        {/* Floating Capture Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
          <div className="capture-bar flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <input
              type="text"
              value={captureText}
              onChange={e => setCaptureText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCapture()}
              placeholder="Type a thought, paste a link, or press 🎤 to speak…"
              className="flex-1 bg-transparent text-sm text-white placeholder-[var(--text-muted)] outline-none"
            />
            <button
              onClick={() => router.push('/dashboard/capture')}
              className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
              title="Voice capture"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleCapture}
              disabled={!captureText.trim()}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            >
              Pulse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}