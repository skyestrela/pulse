'use client';

import { useAuth } from '@/lib/auth';
import { usePulseStore } from '@/lib/store';
import { User, HardDrive, CreditCard, Shield, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const store = usePulseStore();
  const stats = store.getStats();

  const planDetails: Record<string, Record<string, string | number>> = {
    free: { thoughts: '50/mo', projects: '3', habits: '5', aiScheduling: '—', calendarSync: '—' },
    plus: { thoughts: 'Unlimited', projects: '20', habits: 'Unlimited', aiScheduling: '✓', calendarSync: '—' },
    pro: { thoughts: 'Unlimited', projects: 'Unlimited', habits: 'Unlimited', aiScheduling: '✓', calendarSync: '✓' },
  };

  const plan = planDetails[user?.plan || 'free'] || planDetails.free;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-gradient text-2xl font-bold">Settings</h1>

      {/* Account */}
      <div className="card-glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Account
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-lg font-bold">
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            <span className={`badge ${user?.plan === 'pro' ? 'badge-pro' : user?.plan === 'plus' ? 'badge-plus' : 'badge-free'} mt-1`}>
              {user?.plan?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="card-glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" /> Plan
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {user?.plan === 'pro' ? 'Pro — Lifetime' : user?.plan === 'plus' ? 'Plus' : 'Free'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user?.plan === 'pro' ? 'Early access · £19 one-time' : 'Upgrade for unlimited access'}
            </p>
          </div>
          {user?.plan !== 'pro' && (
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 pt-4 border-t border-white/5">
          {Object.entries(plan).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div className="card-glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" /> Usage This Month
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Thoughts captured', value: stats.thoughtsCaptured, limit: user?.plan === 'free' ? '50' : '∞' },
            { label: 'Actions completed', value: stats.actionsCompleted, limit: '—' },
            { label: 'Active habits', value: store.habits.length, limit: user?.plan === 'free' ? '5' : '∞' },
            { label: 'Active projects', value: stats.projectsActive, limit: user?.plan === 'free' ? '3' : '∞' },
            { label: 'Completion rate', value: `${stats.completionRate}%`, limit: '—' },
          ].map(({ label, value, limit }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
              <span className="text-xs text-white font-medium">
                {value}{limit !== '—' ? ` / ${limit}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="card-glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-400" /> Data
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Your data is stored locally in this browser. Clear demo data to start fresh.</p>
        <div className="flex gap-3">
          <button
            onClick={() => store.clearAllData()}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            Clear All Data
          </button>
          <button
            onClick={() => { store.clearAllData(); store.seedDemoData(); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/[0.03] transition-all"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card-glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" /> Security
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">Password</p>
              <p className="text-xs text-[var(--text-muted)]">Last changed: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
            </div>
            <button className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium" disabled>Change</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white">Two-factor auth</p>
              <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security</p>
            </div>
            <button className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium" disabled>Enable</button>
          </div>
        </div>
      </div>
    </div>
  );
}