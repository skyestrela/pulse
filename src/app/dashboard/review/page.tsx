'use client';

import { usePulseStore } from '@/lib/store';
import { Calendar, TrendingUp, Check, X, Minus } from 'lucide-react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ReviewPage() {
  const { actions, habits } = usePulseStore();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  // Build week data
  const weekData = weekDays.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const done = actions.filter(a => a.completedAt && a.completedAt.startsWith(dateStr)).length;
    const total = actions.filter(a => a.createdAt.startsWith(dateStr) || (a.deadline && a.deadline.startsWith(dateStr))).length || (i <= now.getDay() - 1 || (i === now.getDay() - 1 && now.getDay() > 0) ? 1 : 0);
    return { day, planned: Math.max(total, 1), completed: done };
  });

  // Fill in some realistic values from demo data
  const maxPlanned = Math.max(...weekData.map(d => d.planned), 1);

  const completionRate = actions.length > 0 ? Math.round((actions.filter(a => a.status === 'done').length / actions.length) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const totalCompleted = actions.filter(a => a.status === 'done').length;
  const totalActions = actions.length;
  const slippedActions = actions.filter(a => a.status === 'overdue');

  // Top habits this week
  const topHabits = [...habits].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 3);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-gradient text-2xl font-bold">Weekly Review</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="stat-number text-2xl font-bold text-white">{completionRate}%</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Completion</p>
        </div>
        <div className="card p-4 text-center">
          <div className="stat-number text-2xl font-bold text-white">{longestStreak}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Best streak</p>
        </div>
        <div className="card p-4 text-center">
          <div className="stat-number text-2xl font-bold text-white">{totalCompleted}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Completed</p>
        </div>
      </div>

      {/* Week chart */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">This Week</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekData.map((d, i) => {
            const completedH = Math.max((d.completed / maxPlanned) * 100, 4);
            const plannedH = Math.max((d.planned / maxPlanned) * 100, 8);
            const isToday = i === (now.getDay() === 0 ? 6 : now.getDay() - 1);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '96px' }}>
                  <div className="w-full bg-indigo-500/30 rounded-t" style={{ height: `${completedH}%`, minHeight: '4px' }}>
                    <div className="w-full bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t" style={{ height: `${isToday ? '100%' : '80%'}` }} />
                  </div>
                </div>
                <span className={`text-[10px] ${isToday ? 'text-indigo-400 font-bold' : 'text-[var(--text-muted)]'}`}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top habits */}
      {topHabits.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Top Habits</h2>
          </div>
          <div className="space-y-3">
            {topHabits.map((habit, i) => (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-lg">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{habit.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{habit.frequency} · {habit.currentStreak} day streak</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                  🔥 {habit.currentStreak}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slipped actions */}
      {slippedActions.length > 0 && (
        <div className="card-glass p-6 border-l-4 border-rose-500">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-rose-400">Slipped Actions</h2>
          </div>
          <div className="space-y-2">
            {slippedActions.map(action => (
              <div key={action.id} className="flex items-center gap-3">
                <span className="text-sm">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{action.title}</p>
                  {action.deadline && <p className="text-xs text-rose-400">Due {action.deadline}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}