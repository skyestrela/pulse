'use client';

import { useState, useEffect } from 'react';
import {
  Activity, Check, Clock, Flame, Target, TrendingUp,
  Sparkles, Mic, Lightbulb, Zap, Calendar, ExternalLink,
  AlertCircle, ChevronDown, ChevronUp, X, ArrowRight,
  Play, Brain, Eye, Timer,
} from 'lucide-react';
import { usePulseStore, type PulseAction, type Habit, type Project } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { computeIntelligence, getItemDetail, type NextStep, type SmartInsight, type ItemDetail } from '@/lib/intelligence';

// ─── Helpers ────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const typeColors: Record<string, string> = {
  habit: 'text-emerald-400',
  task: 'text-indigo-400',
  event: 'text-cyan-400',
  project: 'text-amber-400',
  reference: 'text-cyan-400',
};

const statusStyles: Record<string, string> = {
  done: 'border-emerald-500/30 bg-emerald-500/5',
  active: 'border-indigo-500/30 bg-indigo-500/5',
  overdue: 'border-rose-500/30 bg-rose-500/5',
  upcoming: 'border-white/10 bg-white/[0.02]',
};

const urgencyStyles: Record<string, { bg: string; text: string; label: string }> = {
  now: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'NOW' },
  today: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'TODAY' },
  'this-week': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', label: 'THIS WEEK' },
  later: { bg: 'bg-white/5', text: 'text-[var(--text-muted)]', label: 'LATER' },
};

const difficultyBadge: Record<string, { icon: string; color: string }> = {
  trivial: { icon: '○', color: 'text-emerald-400' },
  easy: { icon: '◐', color: 'text-cyan-400' },
  medium: { icon: '●', color: 'text-amber-400' },
  hard: { icon: '◆', color: 'text-rose-400' },
};

// ─── Next Step Hero ─────────────────────────────────────────────────

function NextStepHero({ step, onDismiss }: { step: NextStep; onDismiss: () => void }) {
  const urgency = urgencyStyles[step.urgency] || urgencyStyles.today;
  const diff = difficultyBadge[step.difficulty] || difficultyBadge.easy;

  return (
    <div className="card-glass p-6 border-l-4 border-indigo-500 animate-fade-in-scale relative">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-indigo-400" />
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Your Next Step</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${urgency.bg} ${urgency.text}`}>{urgency.label}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
          {step.sourceIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{step.detail}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Timer className="w-3 h-3" /> {step.duration}
            </span>
            <span className={`text-xs flex items-center gap-1 ${diff.color}`}>
              {diff.icon} {step.difficulty}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              from <span className="text-white">{step.sourceTitle}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button className="btn-primary px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 flex-1 justify-center">
          <Play className="w-4 h-4" /> Start Now
        </button>
        <span className="text-[10px] text-[var(--text-muted)]">{step.urgencyReason}</span>
      </div>
    </div>
  );
}

// ─── Insight Banner ────────────────────────────────────────────────

function InsightBanner({ insight }: { insight: SmartInsight }) {
  const typeStyles: Record<string, string> = {
    'streak-risk': 'border-amber-500/30 bg-amber-500/5',
    'deadline-approaching': 'border-rose-500/30 bg-rose-500/5',
    'optimal-time': 'bg-emerald-500/5 border-emerald-500/30',
    'momentum': 'border-indigo-500/30 bg-indigo-500/5',
    'nudge': 'border-cyan-500/30 bg-cyan-500/5',
  };

  const typeIcons: Record<string, React.ElementType> = {
    'streak-risk': Flame,
    'deadline-approaching': AlertCircle,
    'optimal-time': Target,
    'momentum': TrendingUp,
    'nudge': Lightbulb,
  };

  const Icon = typeIcons[insight.type] || Sparkles;

  return (
    <div className={`card p-3 flex items-start gap-3 border ${typeStyles[insight.type] || 'border-white/10'}`}>
      <Icon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{insight.message}</p>
    </div>
  );
}

// ─── Smart Action Card ─────────────────────────────────────────────

function SmartActionCard({ action, onToggle, onViewDetail }: {
  action: PulseAction;
  onToggle: () => void;
  onViewDetail: () => void;
}) {
  const isDone = action.status === 'done';

  return (
    <div
      className={`card-glass p-4 border ${statusStyles[action.status]} transition-all`}
    >
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all ${
          isDone ? 'bg-emerald-500/10' :
          action.status === 'overdue' ? 'bg-rose-500/10' :
          'bg-indigo-500/10'
        }`}>
          {action.icon}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-white'}`}>
            {action.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs ${typeColors[action.type]}`}>{action.type}</span>
            {action.schedule && (
              <>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-muted)]">{action.schedule}</span>
              </>
            )}
            {action.streak && action.streak > 1 && (
              <>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-amber-400">🔥 {action.streak}d</span>
              </>
            )}
          </div>
          {/* Next step preview */}
          {!isDone && action.nextStep && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <ArrowRight className="w-3 h-3 text-indigo-400" />
              <span className="text-[11px] text-indigo-400 font-medium">{action.nextStep}</span>
            </div>
          )}
          {!isDone && !action.nextStep && action.motivation && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">{action.motivation.split('.')[0]}.</p>
          )}
        </div>

        {/* View detail button */}
        {!isDone && (
          <button onClick={onViewDetail} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 hover:border-indigo-500/40 transition-all" title="View plan">
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
          isDone ? 'border-emerald-400 text-emerald-400' :
          action.status === 'overdue' ? 'border-rose-400 text-rose-400' :
          action.status === 'active' ? 'border-indigo-400 text-indigo-400' :
          'border-white/20 text-[var(--text-muted)]'
        }`}>
          {isDone ? '✓' : action.status === 'overdue' ? '!' : action.status === 'active' ? '●' : '○'}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel (Slide-out) ──────────────────────────────────────

function DetailPanel({ detail, onClose }: { detail: ItemDetail; onClose: () => void }) {
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
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
          {detail.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{detail.title}</h3>
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{detail.type}</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Next step */}
      {detail.nextStep && (
        <div className="px-5 py-3 bg-indigo-500/5 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Play className="w-3 h-3" /> Next Step
          </div>
          <p className="text-sm text-white font-medium">{detail.nextStep}</p>
        </div>
      )}

      {/* Streak / Progress */}
      {(detail.streak !== undefined || detail.progress !== undefined) && (
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-4">
          {detail.streak !== undefined && (
            <div>
              <span className="text-xs text-amber-400 font-medium">🔥 {detail.streak} day streak</span>
              {detail.bestStreak && <span className="text-xs text-[var(--text-muted)] ml-1">/ {detail.bestStreak} best</span>}
            </div>
          )}
          {detail.progress !== undefined && (
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--text-muted)]">Progress</span>
                <span className="text-white font-medium">{Math.round(detail.progress * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all" style={{ width: `${detail.progress * 100}%` }} />
              </div>
            </div>
          )}
          {detail.deadline && (
            <span className="text-xs text-[var(--text-muted)]">Due {new Date(detail.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id ? `${t.color} border-current` : 'text-[var(--text-muted)] border-transparent hover:text-white'
            }`}
          >
            <t.icon className="w-3 h-3" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {tab === 'why' && (
          <div className="space-y-4">
            {detail.motivation ? (
              <div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{detail.motivation}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No motivation recorded yet.</p>
            )}
            {detail.successVision && (
              <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Success Vision</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{detail.successVision}</p>
              </div>
            )}
            {detail.milestones && detail.milestones.length > 0 && (
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">Milestones</div>
                {detail.milestones.map((m, i) => (
                  <div key={i} className={`ml-2 mb-2 border-l-2 ${m.done ? 'border-emerald-500/40' : 'border-white/10'} pl-3`}>
                    <p className={`text-xs font-medium ${m.done ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                    {m.targetDate && <span className="text-[10px] text-[var(--text-muted)]">{m.targetDate}</span>}
                    {m.outcome && !m.done && (
                      <p className="text-[11px] text-emerald-400/70 mt-0.5">✨ {m.outcome}</p>
                    )}
                  </div>
                ))}
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

// ─── Main Dashboard ─────────────────────────────────────────────────

export default function DashboardPage() {
  const store = usePulseStore();
  const { user } = useAuth();
  const [dismissedNextStep, setDismissedNextStep] = useState(false);
  const [detailItem, setDetailItem] = useState<ItemDetail | null>(null);

  // Seed demo data on first load
  useEffect(() => {
    store.seedDemoData();
  }, []);

  const actions = store.getTodayActions();
  const stats = store.getStats();

  // Compute intelligence
  const intel = computeIntelligence(store.actions, store.habits, store.projects);

  const pendingCount = actions.filter(a => a.status !== 'done').length;
  const maxStreak = Math.max(...store.habits.map(h => h.currentStreak), 0);

  // EKG visualization
  const ekgPoints = actions.slice(0, 8).map((a, i) => {
    const x = 60 + i * 100;
    const y = a.status === 'done' ? 15 : a.status === 'overdue' ? 90 : 40;
    return { x, y, label: a.title.split(' ').slice(0, 2).join(' ').slice(0, 10), color: a.status === 'done' ? '#22c55e' : a.status === 'overdue' ? '#f43f5e' : a.type === 'habit' ? '#10b981' : a.type === 'project' ? '#f59e0b' : '#6366f1' };
  });

  const ekgLine = ekgPoints.length > 0
    ? ekgPoints.map((p, i) => {
        const prevX = i === 0 ? 0 : ekgPoints[i - 1].x;
        return `${prevX},60 ${p.x - 20},60 ${p.x - 10},${p.y < 50 ? p.y + 15 : p.y - 15} ${p.x},${p.y} ${p.x + 10},${p.y < 50 ? p.y + 15 : p.y - 15} ${p.x + 20},60`;
      }).join(' ')
    : '0,60 800,60';

  const statsData = [
    { label: 'Thoughts captured', value: String(stats.thoughtsCaptured), trend: `+${store.thoughts.filter(t => { const d = new Date(t.createdAt); const now = new Date(); return d > new Date(now.getTime() - 7 * 86400000); }).length} this week`, icon: Sparkles },
    { label: 'Actions completed', value: String(stats.actionsCompleted), trend: `${stats.completionRate}% rate`, icon: Check },
    { label: 'Current streak', value: String(maxStreak), trend: 'days', icon: Flame },
    { label: 'Projects active', value: String(stats.projectsActive), trend: `${stats.projectsActive} on track`, icon: Target },
  ];

  function handleViewActionDetail(actionId: string) {
    const action = store.actions.find(a => a.id === actionId);
    const detail = getItemDetail(action, null, null);
    if (detail) setDetailItem(detail);
  }

  function handleViewHabitDetail(habitId: string) {
    const habit = store.habits.find(h => h.id === habitId);
    const detail = getItemDetail(null, habit, null);
    if (detail) setDetailItem(detail);
  }

  function handleViewProjectDetail(projectId: string) {
    const project = store.projects.find(p => p.id === projectId);
    const detail = getItemDetail(null, null, project);
    if (detail) setDetailItem(detail);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gradient text-2xl font-bold">{getGreeting()}, {user?.name || 'there'}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {pendingCount > 0
            ? `You have ${pendingCount} action${pendingCount !== 1 ? 's' : ''} pending today.`
            : 'All done for today! 🎉'}
          {maxStreak > 0 && ` Your ${maxStreak}-day streak is on fire.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger animate-fade-in">
        {statsData.map(({ label, value, trend, icon: Icon }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
            </div>
            <p className="stat-number text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{trend}</p>
          </div>
        ))}
      </div>

      {/* Intelligence: Next Step Hero */}
      {intel.topNextStep && !dismissedNextStep && (
        <NextStepHero step={intel.topNextStep} onDismiss={() => setDismissedNextStep(true)} />
      )}

      {/* Intelligence: Insights */}
      {intel.insights.length > 0 && (
        <div className="space-y-2 stagger">
          {intel.insights.slice(0, 3).map((insight, i) => (
            <InsightBanner key={i} insight={insight} />
          ))}
        </div>
      )}

      {/* EKG Timeline */}
      {actions.length > 0 && (
        <div className="card-glass p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-white">Today&apos;s Pulse</h2>
            <span className="text-xs text-[var(--text-muted)] ml-auto">{actions.length} action{actions.length !== 1 ? 's' : ''}</span>
          </div>
          <svg viewBox="0 0 800 120" className="w-full h-24 mb-2">
            {[0, 30, 60, 90].map(y => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(99,102,241,0.05)" strokeWidth="1" />
            ))}
            <polyline
              points={ekgLine}
              fill="none"
              stroke="url(#ekgMain)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ekg-line"
            />
            {ekgPoints.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={p.color} stroke="#0c0f1a" strokeWidth="2" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill={p.color} fontSize="8" fontFamily="monospace">{p.label}</text>
              </g>
            ))}
            <defs>
              <linearGradient id="ekgMain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>9 PM</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {actions.length === 0 && (
        <div className="card-glass p-12 text-center">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No actions yet</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Capture a thought and Pulse will create your achievement plan</p>
          <button onClick={() => window.location.href = '/dashboard/capture'} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium">
            <Mic className="w-4 h-4 inline mr-2" />Capture a Thought
          </button>
        </div>
      )}

      {/* Up Next — All next steps */}
      {intel.allNextSteps.length > 0 && !dismissedNextStep && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Up Next</h2>
            <span className="text-xs text-[var(--text-muted)] ml-auto">{intel.allNextSteps.length} step{intel.allNextSteps.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {intel.allNextSteps.slice(0, 5).map((step, i) => {
              const urg = urgencyStyles[step.urgency] || urgencyStyles.today;
              const diff = difficultyBadge[step.difficulty] || difficultyBadge.easy;
              return (
                <div key={i} className="card-glass p-3 flex items-center gap-3 hover:border-indigo-500/30 transition-all cursor-pointer"
                  onClick={() => {
                    if (step.sourceType === 'action') handleViewActionDetail(step.sourceId);
                    else if (step.sourceType === 'habit') handleViewHabitDetail(step.sourceId);
                    else if (step.sourceType === 'project') handleViewProjectDetail(step.sourceId);
                  }}>
                  <span className="text-lg">{step.sourceIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{step.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">from {step.sourceTitle} · {step.duration}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${urg.bg} ${urg.text}`}>{urg.label}</span>
                  <span className={`${diff.color} text-xs`}>{diff.icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions List — with smart cards */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white mb-3">Today&apos;s Actions</h2>
          {actions.map((action, i) => (
            <SmartActionCard
              key={action.id}
              action={action}
              onToggle={() => store.toggleAction(action.id)}
              onViewDetail={() => handleViewActionDetail(action.id)}
            />
          ))}
        </div>
      )}

      {/* Detail Panel Overlay */}
      {detailItem && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDetailItem(null)} />
          <DetailPanel detail={detailItem} onClose={() => setDetailItem(null)} />
        </>
      )}
    </div>
  );
}