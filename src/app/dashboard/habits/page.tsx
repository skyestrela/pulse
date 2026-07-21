'use client';

import { useState } from 'react';
import { usePulseStore, type Habit } from '@/lib/store';
import { Flame, Plus, Check, Eye, Lightbulb, ArrowRight, Calendar, Zap, Clock, X, ExternalLink, AlertCircle } from 'lucide-react';
import { getItemDetail, isOptimalTimeForHabit, type ItemDetail } from '@/lib/intelligence';

function RingProgress({ current, best, size = 80 }: { current: number; best: number; size?: number }) {
  const pct = Math.min(current / Math.max(best, 30, 1), 1);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const categoryColors: Record<string, string> = {
  '🧘': 'border-indigo-500/30',
  '💧': 'border-cyan-500/30',
  '📖': 'border-amber-500/30',
  '💪': 'border-emerald-500/30',
  '📝': 'border-rose-500/30',
  '🌿': 'border-emerald-500/30',
  '🎵': 'border-violet-500/30',
  '💻': 'border-blue-500/30',
  '🙏': 'border-purple-500/30',
  '🧹': 'border-teal-500/30',
  '📱': 'border-pink-500/30',
  '💰': 'border-amber-500/30',
};

// ─── Smart Habit Detail Panel ──────────────────────────────────────

function HabitDetailPanel({ detail, onClose }: { detail: ItemDetail; onClose: () => void }) {
  const [tab, setTab] = useState<'why' | 'how' | 'when' | 'resources' | 'pitfalls'>('why');

  const tabs = [
    { id: 'why' as const, label: 'WHY', icon: Lightbulb, color: 'text-indigo-400' },
    { id: 'how' as const, label: 'HOW', icon: Zap, color: 'text-cyan-400' },
    { id: 'when' as const, label: 'WHEN', icon: Calendar, color: 'text-amber-400' },
    { id: 'resources' as const, label: 'TOOLS', icon: ExternalLink, color: 'text-violet-400' },
    { id: 'pitfalls' as const, label: 'AVOID', icon: AlertCircle, color: 'text-rose-400' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--bg-surface)] border-l border-white/10 z-50 flex flex-col animate-slide-in-right shadow-2xl">
      <div className="flex items-center gap-3 p-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
          {detail.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{detail.title}</h3>
          {detail.streak !== undefined && (
            <span className="text-xs text-amber-400 font-medium">🔥 {detail.streak} day streak {detail.bestStreak ? `/ ${detail.bestStreak} best` : ''}</span>
          )}
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {detail.nextStep && (
        <div className="px-5 py-3 bg-emerald-500/5 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <ArrowRight className="w-3 h-3" /> Next Step
          </div>
          <p className="text-sm text-white font-medium">{detail.nextStep}</p>
        </div>
      )}

      <div className="flex border-b border-white/5 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id ? `${t.color} border-current` : 'text-[var(--text-muted)] border-transparent hover:text-white'
            }`}>
            <t.icon className="w-3 h-3" />{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">
        {tab === 'why' && (
          <div className="space-y-4">
            {detail.motivation ? (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail.motivation}</p>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No motivation recorded.</p>
            )}
            {detail.successVision && (
              <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Success Vision</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{detail.successVision}</p>
              </div>
            )}
          </div>
        )}
        {tab === 'how' && (
          <div className="space-y-4">
            {detail.methodology ? (
              <div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{detail.methodology}</p>
                {detail.methodSteps && (
                  <div className="space-y-2">
                    {detail.methodSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="text-cyan-400/80 mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No methodology yet.</p>
            )}
          </div>
        )}
        {tab === 'when' && (
          <div className="space-y-4">
            {detail.bestTime && (
              <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Best Time</div>
                <p className="text-xs text-[var(--text-secondary)]">{detail.bestTime}</p>
              </div>
            )}
            {detail.schedule && detail.schedule.length > 0 ? (
              <div className="space-y-2">
                {detail.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-amber-400/80 w-32 flex-shrink-0">{s.when}</span>
                    <span className="text-white flex-1">{s.what}</span>
                    <span className="text-[var(--text-muted)]">({s.duration})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No schedule set.</p>
            )}
          </div>
        )}
        {tab === 'resources' && (
          <div className="space-y-3">
            {detail.resources && detail.resources.length > 0 ? (
              detail.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="block card p-3 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-white">{r.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-auto">({r.cost})</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">{r.pitch}</p>
                </a>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No resources yet.</p>
            )}
          </div>
        )}
        {tab === 'pitfalls' && (
          <div className="space-y-2">
            {detail.pitfalls && detail.pitfalls.length > 0 ? (
              detail.pitfalls.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-rose-500/5 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No pitfalls recorded.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Smart Habit Card ──────────────────────────────────────────────

function HabitCard({ habit, onToggle, onViewDetail }: { habit: Habit; onToggle: () => void; onViewDetail: () => void }) {
  const completedToday = habit.lastCompleted === new Date().toISOString().split('T')[0];
  const borderColor = categoryColors[habit.icon] || 'border-white/10';
  const isRightTime = isOptimalTimeForHabit(habit);

  return (
    <div className={`card p-4 border ${borderColor} ${completedToday ? 'bg-emerald-500/5' : isRightTime ? 'bg-indigo-500/5' : ''} transition-all`}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <RingProgress current={habit.currentStreak} best={habit.bestStreak} size={64} />
          <span className="absolute inset-0 flex items-center justify-center text-lg">{habit.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${completedToday ? 'text-emerald-400' : 'text-white'}`}>{habit.title}</p>
            {isRightTime && !completedToday && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">NOW</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--text-muted)]">
              {habit.frequency === 'daily' ? 'Every day' : habit.frequency === 'weekdays' ? 'Mon–Fri' : habit.frequency === '3x-week' ? '3× per week' : 'Once a week'}
            </span>
            {habit.trigger && (
              <>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-indigo-400">after {habit.trigger}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-amber-400 flex items-center gap-1"><Flame className="w-3 h-3" /> {habit.currentStreak}</span>
            <span className="text-xs text-[var(--text-muted)]">/ {habit.bestStreak} best</span>
            {habit.bestTime && !completedToday && (
              <>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-amber-400/70 flex items-center gap-1"><Clock className="w-3 h-3" /> {habit.bestTime.split('—')[0].trim()}</span>
              </>
            )}
          </div>

          {/* Micro-step preview */}
          {!completedToday && habit.microSteps && habit.microSteps.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">{habit.microSteps[0].title}</span>
              <span className="text-[10px] text-[var(--text-muted)]">({habit.microSteps[0].duration})</span>
            </div>
          )}

          {/* Motivation preview */}
          {!completedToday && !habit.microSteps?.length && habit.motivation && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">{habit.motivation.split('.')[0]}.</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button onClick={onViewDetail} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/40 transition-all" title="View plan">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              completedToday
                ? 'bg-emerald-500/20 border border-emerald-500/40'
                : 'bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10'
            }`}
          >
            {completedToday ? <Check className="w-5 h-5 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-white/20" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Habits Page ────────────────────────────────────────────────────

export default function HabitsPage() {
  const { habits, toggleHabitDay, deleteHabit } = usePulseStore();
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekdays' | '3x-week' | 'weekly'>('all');
  const [detailItem, setDetailItem] = useState<ItemDetail | null>(null);

  const filtered = filter === 'all' ? habits : habits.filter(h => h.frequency === filter);
  const completedToday = habits.filter(h => h.lastCompleted === new Date().toISOString().split('T')[0]).length;

  function handleViewDetail(habitId: string) {
    const habit = habits.find(h => h.id === habitId);
    const detail = getItemDetail(null, habit, null);
    if (detail) setDetailItem(detail);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gradient text-2xl font-bold">Habits</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{completedToday}/{habits.length} completed today</p>
        </div>
        <a href="/dashboard/capture" className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Habit
        </a>
      </div>

      {/* Optimal time suggestion */}
      {habits.some(h => h.lastCompleted !== new Date().toISOString().split('T')[0] && isOptimalTimeForHabit(h)) && (
        <div className="card p-3 border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <p className="text-xs text-[var(--text-secondary)]">
            Perfect time right now for: {habits
              .filter(h => h.lastCompleted !== new Date().toISOString().split('T')[0] && isOptimalTimeForHabit(h))
              .map(h => h.title)
              .join(', ')}
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'daily', 'weekdays', '3x-week', 'weekly'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === f ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-[var(--text-muted)] border border-white/10 hover:border-white/20'
            }`}
          >
            {f === 'all' ? 'All' : f === '3x-week' ? '3× per week' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Habit cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabitDay(habit.id)}
              onViewDetail={() => handleViewDetail(habit.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card-glass p-12 text-center">
          <Flame className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No habits yet</h2>
          <p className="text-sm text-[var(--text-secondary)]">Capture a thought like &ldquo;I should meditate every day&rdquo; to create a habit with a full achievement plan</p>
        </div>
      )}

      {/* Detail Panel Overlay */}
      {detailItem && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDetailItem(null)} />
          <HabitDetailPanel detail={detailItem} onClose={() => setDetailItem(null)} />
        </>
      )}
    </div>
  );
}