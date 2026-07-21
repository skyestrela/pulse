// ─── Intelligence Engine ────────────────────────────────────────────
// Turns stored plan data into actionable NOW guidance.
// No AI — deterministic, instant, context-aware.

import type { PulseAction, Habit, Project } from './store';
import type { MicroStep, ScheduleBlock, Resource } from './achievement';

// ─── Types ──────────────────────────────────────────────────────────

export interface NextStep {
  title: string;
  sourceId: string;
  sourceType: 'action' | 'habit' | 'project';
  sourceTitle: string;
  sourceIcon: string;
  duration: string;
  difficulty: MicroStep['difficulty'];
  detail: string;
  urgency: 'now' | 'today' | 'this-week' | 'later';
  urgencyReason: string;
}

export interface SmartInsight {
  type: 'streak-risk' | 'deadline-approaching' | 'optimal-time' | 'momentum' | 'nudge';
  icon: string;
  message: string;
  sourceId: string;
  sourceTitle: string;
}

export interface ActionIntelligence {
  // The single most important thing to do right now
  topNextStep: NextStep | null;
  // Contextual insights (streaks at risk, optimal times, deadlines)
  insights: SmartInsight[];
  // All pending next steps sorted by urgency
  allNextSteps: NextStep[];
}

// ─── Time Helpers ───────────────────────────────────────────────────

function hourOfDay(): number {
  return new Date().getHours();
}

function isMorning(): boolean {
  return hourOfDay() >= 5 && hourOfDay() < 12;
}

function isAfternoon(): boolean {
  return hourOfDay() >= 12 && hourOfDay() < 17;
}

function isEvening(): boolean {
  return hourOfDay() >= 17 && hourOfDay() < 22;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ─── Next Step Extraction ───────────────────────────────────────────

function extractNextStepFromAction(action: PulseAction): NextStep | null {
  if (action.status === 'done') return null;

  // If action has microSteps, find first incomplete
  if (action.microSteps && action.microSteps.length > 0) {
    const step = action.microSteps[0]; // first micro-step is always "next"
    return {
      title: step.title,
      sourceId: action.id,
      sourceType: 'action',
      sourceTitle: action.title,
      sourceIcon: action.icon,
      duration: step.duration,
      difficulty: step.difficulty,
      detail: step.detail,
      urgency: action.status === 'overdue' ? 'now' : action.deadline && daysUntil(action.deadline) <= 3 ? 'today' : 'this-week',
      urgencyReason: action.status === 'overdue' ? 'Overdue' : action.deadline ? `Due in ${daysUntil(action.deadline)} days` : 'Scheduled',
    };
  }

  // If action has nextStep text
  if (action.nextStep) {
    return {
      title: action.nextStep,
      sourceId: action.id,
      sourceType: 'action',
      sourceTitle: action.title,
      sourceIcon: action.icon,
      duration: '5 min',
      difficulty: 'easy',
      detail: action.motivation || `Take the next step on "${action.title}"`,
      urgency: action.status === 'overdue' ? 'now' : 'today',
      urgencyReason: action.status === 'overdue' ? 'Overdue' : action.deadline ? `Due in ${daysUntil(action.deadline)} days` : 'Next action',
    };
  }

  // Generic: the action itself IS the next step
  return {
    title: action.title,
    sourceId: action.id,
    sourceType: 'action',
    sourceTitle: action.title,
    sourceIcon: action.icon,
    duration: action.schedule || '15 min',
    difficulty: 'medium',
    detail: action.motivation || `Complete this task`,
    urgency: action.status === 'overdue' ? 'now' : 'today',
    urgencyReason: action.status === 'overdue' ? 'Overdue' : 'On your list',
  };
}

function extractNextStepFromHabit(habit: Habit): NextStep | null {
  const completedToday = habit.lastCompleted === today();
  if (completedToday) return null;

  // If habit has micro-steps, show first
  const step = habit.microSteps?.[0];
  const isRightTime = isOptimalTimeForHabit(habit);

  return {
    title: step?.title || habit.title,
    sourceId: habit.id,
    sourceType: 'habit',
    sourceTitle: habit.title,
    sourceIcon: habit.icon,
    duration: step?.duration || '5 min',
    difficulty: step?.difficulty || 'easy',
    detail: step?.detail || (habit.trigger ? `After ${habit.trigger}, ${habit.title.toLowerCase()}` : `Do your ${habit.title.toLowerCase()} habit`),
    urgency: !completedToday && isRightTime ? 'now' : 'today',
    urgencyReason: !completedToday
      ? isRightTime
        ? `Optimal time right now${habit.trigger ? ` — after ${habit.trigger}` : ''}`
        : habit.currentStreak > 0
          ? `Keep your ${habit.currentStreak}-day streak alive!`
          : `Daily habit`
      : 'Done for today',
  };
}

function extractNextStepFromProject(project: Project): NextStep | null {
  if (project.status === 'completed') return null;

  // Find first incomplete milestone
  const nextMilestone = project.milestones.find(m => !m.done);
  if (!nextMilestone) return null;

  const nextStep = nextMilestone.microSteps?.[0];

  return {
    title: nextStep?.title || nextMilestone.title,
    sourceId: project.id,
    sourceType: 'project',
    sourceTitle: project.title,
    sourceIcon: project.icon,
    duration: nextStep?.duration || '30 min',
    difficulty: nextStep?.difficulty || 'medium',
    detail: nextStep?.detail || nextMilestone.outcome || `Work on milestone: ${nextMilestone.title}`,
    urgency: project.deadline && daysUntil(project.deadline) <= 7 ? 'today' : 'this-week',
    urgencyReason: project.deadline
      ? daysUntil(project.deadline) <= 0
        ? 'Deadline passed!'
        : daysUntil(project.deadline) <= 7
          ? `Deadline in ${daysUntil(project.deadline)} days`
          : `~${project.estimatedWeeks || '?'} weeks remaining`
      : nextMilestone.targetDate
        ? `Target: ${nextMilestone.targetDate}`
        : 'Next milestone',
  };
}

// ─── Optimal Time Detection ─────────────────────────────────────────

export function isOptimalTimeForHabit(habit: Habit): boolean {
  const bestTime = habit.bestTime?.toLowerCase() || '';
  if (bestTime.includes('morning') && isMorning()) return true;
  if (bestTime.includes('afternoon') && isAfternoon()) return true;
  if ((bestTime.includes('evening') || bestTime.includes('night')) && isEvening()) return true;
  // Default: morning habits before noon, evening habits after 5pm
  if (!bestTime && habit.trigger) {
    if (habit.trigger.toLowerCase().includes('morning') && isMorning()) return true;
    if (habit.trigger.toLowerCase().includes('bed') && isEvening()) return true;
  }
  return false;
}

// ─── Insight Generation ─────────────────────────────────────────────

function generateInsights(
  actions: PulseAction[],
  habits: Habit[],
  projects: Project[],
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const todayStr = today();

  // Streaks at risk — habits not done today with streak > 3
  for (const h of habits) {
    if (h.lastCompleted !== todayStr && h.currentStreak >= 3) {
      insights.push({
        type: 'streak-risk',
        icon: '🔥',
        message: `Your ${h.currentStreak}-day "${h.title}" streak is at risk! Do it now to keep the chain alive.`,
        sourceId: h.id,
        sourceTitle: h.title,
      });
    }
  }

  // Deadline approaching
  for (const p of projects) {
    if (p.deadline && p.status === 'active') {
      const days = daysUntil(p.deadline);
      if (days <= 7 && days > 0) {
        insights.push({
          type: 'deadline-approaching',
          icon: '⏰',
          message: `"${p.title}" deadline in ${days} day${days !== 1 ? 's' : ''}. ${Math.round(p.progress * 100)}% done — push to finish?`,
          sourceId: p.id,
          sourceTitle: p.title,
        });
      } else if (days <= 0) {
        insights.push({
          type: 'deadline-approaching',
          icon: '🚨',
          message: `"${p.title}" is past deadline. Re-evaluate or extend the date.`,
          sourceId: p.id,
          sourceTitle: p.title,
        });
      }
    }
  }

  // Overdue actions
  for (const a of actions) {
    if (a.status === 'overdue') {
      insights.push({
        type: 'deadline-approaching',
        icon: '⚠️',
        message: `"${a.title}" is overdue. ${a.motivation ? 'Remember: ' + a.motivation.split('.')[0] + '.' : 'Clear this to free mental space.'}`,
        sourceId: a.id,
        sourceTitle: a.title,
      });
    }
  }

  // Optimal time suggestions
  for (const h of habits) {
    if (h.lastCompleted !== todayStr && isOptimalTimeForHabit(h)) {
      insights.push({
        type: 'optimal-time',
        icon: '🎯',
        message: `Perfect time for "${h.title}"${h.bestTime ? ' — ' + h.bestTime : ''}. Your brain is primed for it right now.`,
        sourceId: h.id,
        sourceTitle: h.title,
      });
    }
  }

  // Momentum — completed 3+ things today
  const completedToday = actions.filter(a => a.status === 'done' && a.completedAt?.startsWith(todayStr)).length;
  if (completedToday >= 3) {
    insights.push({
      type: 'momentum',
      icon: '🚀',
      message: `${completedToday} completed today! You're on fire — ride this momentum.`,
      sourceId: '',
      sourceTitle: '',
    });
  }

  // Gentle nudge if nothing done yet
  if (completedToday === 0 && hourOfDay() >= 10) {
    const pending = actions.filter(a => a.status !== 'done').length;
    if (pending > 0) {
      insights.push({
        type: 'nudge',
        icon: '💡',
        message: `${pending} thing${pending !== 1 ? 's' : ''} waiting. Start with the easiest one — momentum builds from action, not planning.`,
        sourceId: '',
        sourceTitle: '',
      });
    }
  }

  return insights;
}

// ─── Urgency Sorting ────────────────────────────────────────────────

const URGENCY_ORDER: Record<string, number> = {
  'now': 0,
  'today': 1,
  'this-week': 2,
  'later': 3,
};

const DIFFICULTY_EASE: Record<string, number> = {
  'trivial': 0,
  'easy': 1,
  'medium': 2,
  'hard': 3,
};

function sortNextSteps(steps: NextStep[]): NextStep[] {
  return [...steps].sort((a, b) => {
    // First by urgency
    const uDiff = (URGENCY_ORDER[a.urgency] ?? 2) - (URGENCY_ORDER[b.urgency] ?? 2);
    if (uDiff !== 0) return uDiff;
    // Then by ease (easier first for momentum)
    return (DIFFICULTY_EASE[a.difficulty] ?? 2) - (DIFFICULTY_EASE[b.difficulty] ?? 2);
  });
}

// ─── Main Export ────────────────────────────────────────────────────

export function computeIntelligence(
  actions: PulseAction[],
  habits: Habit[],
  projects: Project[],
): ActionIntelligence {
  const allSteps: NextStep[] = [];

  for (const a of actions) {
    const step = extractNextStepFromAction(a);
    if (step) allSteps.push(step);
  }

  for (const h of habits) {
    const step = extractNextStepFromHabit(h);
    if (step) allSteps.push(step);
  }

  for (const p of projects) {
    const step = extractNextStepFromProject(p);
    if (step) allSteps.push(step);
  }

  const sorted = sortNextSteps(allSteps);
  const insights = generateInsights(actions, habits, projects);

  return {
    topNextStep: sorted[0] || null,
    insights,
    allNextSteps: sorted,
  };
}

// ─── Per-Item Detail Panels ─────────────────────────────────────────

export interface ItemDetail {
  type: 'action' | 'habit' | 'project';
  id: string;
  title: string;
  icon: string;
  // WHY
  motivation?: string;
  successVision?: string;
  // HOW
  methodology?: string;
  methodSteps?: string[];
  // WHEN
  schedule?: ScheduleBlock[];
  bestTime?: string;
  // RESOURCES
  resources?: Resource[];
  // PITFALLS
  pitfalls?: string[];
  // MILESTONES
  milestones?: { title: string; done: boolean; targetDate?: string; outcome?: string; microSteps?: MicroStep[] }[];
  // META
  nextStep?: string;
  streak?: number;
  bestStreak?: number;
  deadline?: string;
  progress?: number;
}

export function getItemDetail(
  action?: PulseAction | null,
  habit?: Habit | null,
  project?: Project | null,
): ItemDetail | null {
  if (habit) {
    return {
      type: 'habit',
      id: habit.id,
      title: habit.title,
      icon: habit.icon,
      motivation: habit.motivation,
      methodology: habit.methodology,
      bestTime: habit.bestTime,
      schedule: habit.dailySchedule,
      resources: habit.resources,
      pitfalls: habit.pitfalls,
      milestones: habit.microSteps?.map(s => ({ title: s.title, done: false, outcome: s.detail, microSteps: [s] })),
      nextStep: habit.microSteps?.[0]?.title || habit.title,
      streak: habit.currentStreak,
      bestStreak: habit.bestStreak,
    };
  }

  if (project) {
    return {
      type: 'project',
      id: project.id,
      title: project.title,
      icon: project.icon,
      motivation: project.motivation,
      methodology: project.methodology,
      methodSteps: project.methodSteps,
      bestTime: project.bestTime,
      schedule: project.weeklySchedule,
      resources: project.resources,
      pitfalls: project.pitfalls,
      milestones: project.milestones.map(m => ({ title: m.title, done: m.done, targetDate: m.targetDate, outcome: m.outcome, microSteps: m.microSteps })),
      nextStep: project.milestones.find(m => !m.done)?.microSteps?.[0]?.title || project.milestones.find(m => !m.done)?.title,
      deadline: project.deadline,
      progress: project.progress,
    };
  }

  if (action) {
    return {
      type: 'action',
      id: action.id,
      title: action.title,
      icon: action.icon,
      motivation: action.motivation,
      nextStep: action.nextStep || action.microSteps?.[0]?.title,
      milestones: action.microSteps?.map(s => ({ title: s.title, done: false, outcome: s.detail, microSteps: [s] })),
      deadline: action.deadline,
    };
  }

  return null;
}