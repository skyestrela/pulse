import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AchievementPlan, MicroStep, Resource, ScheduleBlock } from './achievement';

// ─── Types ────────────────────────────────────────────────────────────

export type ActionType = 'habit' | 'task' | 'project' | 'event' | 'reference';
export type ActionStatus = 'done' | 'active' | 'upcoming' | 'overdue';
export type HabitFrequency = 'daily' | 'weekdays' | '3x-week' | 'weekly';
export type ThoughtSource = 'text' | 'voice' | 'url' | 'photo';

export interface PulseAction {
  id: string;
  type: ActionType;
  title: string;
  description?: string;
  icon: string;
  schedule?: string;
  status: ActionStatus;
  streak?: number;
  createdAt: string;
  completedAt?: string;
  deadline?: string;
  // Achievement plan data
  motivation?: string;
  nextStep?: string;
  microSteps?: MicroStep[];
}

export interface Habit {
  id: string;
  type: 'habit';
  title: string;
  description?: string;
  icon: string;
  frequency: HabitFrequency;
  trigger?: string;
  schedule?: string;
  currentStreak: number;
  bestStreak: number;
  lastCompleted?: string;
  createdAt: string;
  // Achievement plan data
  motivation?: string;
  methodology?: string;
  bestTime?: string;
  dailySchedule?: ScheduleBlock[];
  resources?: Resource[];
  pitfalls?: string[];
  microSteps?: MicroStep[];
}

export interface Milestone {
  title: string;
  done: boolean;
  targetDate?: string;
  microSteps?: MicroStep[];
  outcome?: string;
}

export interface Project {
  id: string;
  type: 'project';
  title: string;
  description?: string;
  icon: string;
  deadline?: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  milestones: Milestone[];
  createdAt: string;
  // Achievement plan data
  motivation?: string;
  methodology?: string;
  methodSteps?: string[];
  bestTime?: string;
  weeklySchedule?: ScheduleBlock[];
  resources?: Resource[];
  pitfalls?: string[];
  estimatedWeeks?: number;
}

export interface Thought {
  id: string;
  raw: string;
  source: ThoughtSource;
  createdAt: string;
  extractedIds: string[];
}

export interface Stats {
  thoughtsCaptured: number;
  actionsCompleted: number;
  completionRate: number;
  currentStreak: number;
  projectsActive: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function isToday(dateStr: string): boolean {
  return dateStr.startsWith(today());
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart && d <= now;
}

// ─── Store ────────────────────────────────────────────────────────────

interface PulseStore {
  actions: PulseAction[];
  habits: Habit[];
  projects: Project[];
  thoughts: Thought[];
  seeded: boolean;

  // Actions
  addAction: (a: Omit<PulseAction, 'id' | 'createdAt'>) => string;
  toggleAction: (id: string) => void;
  deleteAction: (id: string) => void;

  // Habits
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak'>) => string;
  toggleHabitDay: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => string;
  toggleMilestone: (projectId: string, milestoneIdx: number) => void;
  deleteProject: (id: string) => void;

  // Thoughts
  addThought: (raw: string, source: ThoughtSource, extractedIds: string[]) => string;

  // Seed
  seedDemoData: () => void;
  clearAllData: () => void;

  // Computed
  getTodayActions: () => PulseAction[];
  getStats: () => Stats;
}

export const usePulseStore = create<PulseStore>()(
  persist(
    (set, get) => ({
      actions: [],
      habits: [],
      projects: [],
      thoughts: [],
      seeded: false,

      // ─── Actions ──────────────────────────────

      addAction: (a) => {
        const id = uid();
        const action: PulseAction = { ...a, id, createdAt: new Date().toISOString() };
        set((s) => ({ actions: [...s.actions, action] }));
        return id;
      },

      toggleAction: (id) => {
        set((s) => ({
          actions: s.actions.map((a) => {
            if (a.id !== id) return a;
            const done = a.status !== 'done';
            return {
              ...a,
              status: done ? 'done' : 'active',
              completedAt: done ? new Date().toISOString() : undefined,
            };
          }),
        }));
      },

      deleteAction: (id) => {
        set((s) => ({ actions: s.actions.filter((a) => a.id !== id) }));
      },

      // ─── Habits ───────────────────────────────

      addHabit: (h) => {
        const id = uid();
        const habit: Habit = { ...h, id, currentStreak: 0, bestStreak: 0, createdAt: new Date().toISOString() };
        set((s) => ({ habits: [...s.habits, habit] }));
        return id;
      },

      toggleHabitDay: (id) => {
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const todayStr = today();
            if (h.lastCompleted === todayStr) {
              // Undo today's completion
              return {
                ...h,
                currentStreak: Math.max(0, h.currentStreak - 1),
                lastCompleted: undefined,
              };
            }
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const isConsecutive = h.lastCompleted === yesterdayStr || h.lastCompleted === todayStr;
            const newStreak = isConsecutive ? h.currentStreak + 1 : 1;
            return {
              ...h,
              currentStreak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
              lastCompleted: todayStr,
            };
          }),
        }));
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      },

      // ─── Projects ─────────────────────────────

      addProject: (p) => {
        const id = uid();
        const project: Project = { ...p, id, createdAt: new Date().toISOString() };
        set((s) => ({ projects: [...s.projects, project] }));
        return id;
      },

      toggleMilestone: (projectId, milestoneIdx) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            const milestones = p.milestones.map((m, i) =>
              i === milestoneIdx ? { ...m, done: !m.done } : m
            );
            const doneCount = milestones.filter((m) => m.done).length;
            const progress = milestones.length > 0 ? doneCount / milestones.length : 0;
            const status: Project['status'] = progress === 1 ? 'completed' : 'active';
            return { ...p, milestones, progress, status };
          }),
        }));
      },

      deleteProject: (id) => {
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      },

      // ─── Thoughts ─────────────────────────────

      addThought: (raw, source, extractedIds) => {
        const id = uid();
        const thought: Thought = { id, raw, source, createdAt: new Date().toISOString(), extractedIds };
        set((s) => ({ thoughts: [...s.thoughts, thought] }));
        return id;
      },

      // ─── Seed ─────────────────────────────────

      seedDemoData: () => {
        const state = get();
        if (state.seeded) return;

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const habits: Habit[] = [
          { id: uid(), type: 'habit', title: 'Morning meditation', icon: '🧘', frequency: 'daily', currentStreak: 12, bestStreak: 21, lastCompleted: today(), createdAt: twoDaysAgo.toISOString(), description: '10 minutes of mindfulness' },
          { id: uid(), type: 'habit', title: 'Water plants', icon: '🌿', frequency: 'daily', trigger: 'after morning coffee', currentStreak: 5, bestStreak: 8, lastCompleted: today(), createdAt: twoDaysAgo.toISOString() },
          { id: uid(), type: 'habit', title: 'Read 20 pages', icon: '📖', frequency: 'daily', currentStreak: 30, bestStreak: 30, lastCompleted: today(), createdAt: twoDaysAgo.toISOString(), description: 'Before bed' },
          { id: uid(), type: 'habit', title: 'Exercise', icon: '💪', frequency: '3x-week', currentStreak: 3, bestStreak: 12, lastCompleted: yesterday.toISOString().split('T')[0], createdAt: twoDaysAgo.toISOString() },
          { id: uid(), type: 'habit', title: 'Journal', icon: '📝', frequency: 'daily', currentStreak: 7, bestStreak: 14, lastCompleted: today(), createdAt: twoDaysAgo.toISOString() },
          { id: uid(), type: 'habit', title: 'Drink 8 glasses of water', icon: '💧', frequency: 'daily', currentStreak: 2, bestStreak: 5, lastCompleted: yesterday.toISOString().split('T')[0], createdAt: twoDaysAgo.toISOString() },
        ];

        const actions: PulseAction[] = [
          { id: uid(), type: 'habit', title: 'Morning meditation', icon: '🧘', schedule: '7:00 AM', status: 'done', streak: 12, createdAt: new Date(now.getTime() - 3600000 * 5).toISOString(), completedAt: new Date(now.getTime() - 3600000 * 4).toISOString() },
          { id: uid(), type: 'task', title: 'Review Q2 financials', icon: '📊', schedule: '9:00 AM', status: 'done', createdAt: new Date(now.getTime() - 3600000 * 3).toISOString(), completedAt: new Date(now.getTime() - 3600000 * 2).toISOString() },
          { id: uid(), type: 'event', title: 'Team standup', icon: '👥', schedule: '10:00 AM', status: 'done', createdAt: new Date(now.getTime() - 3600000 * 2).toISOString() },
          { id: uid(), type: 'habit', title: 'Water plants', icon: '🌿', schedule: 'After coffee', status: 'active', streak: 5, createdAt: new Date(now.getTime() - 3600000).toISOString() },
          { id: uid(), type: 'task', title: 'File tax extension', icon: '📋', schedule: 'Due Apr 15', status: 'overdue', createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(), deadline: '2026-04-15' },
          { id: uid(), type: 'project', title: 'Learn bass guitar — Week 3', icon: '🎸', schedule: '6:00 PM', status: 'upcoming', createdAt: now.toISOString() },
          { id: uid(), type: 'habit', title: 'Read 20 pages', icon: '📖', schedule: '9:00 PM', status: 'upcoming', streak: 30, createdAt: now.toISOString() },
        ];

        const projects: Project[] = [
          {
            id: uid(), type: 'project', title: 'Learn Bass Guitar', icon: '🎸', deadline: '2026-09-01',
            progress: 0.28, status: 'active', createdAt: twoDaysAgo.toISOString(),
            description: 'Master the bass guitar from beginner to intermediate',
            milestones: [
              { title: 'Buy a bass guitar', done: true },
              { title: 'Learn basic notes (E string)', done: true },
              { title: 'Practice 1-finger scales', done: false },
              { title: 'Learn root notes for 10 songs', done: true },
              { title: 'Play along with a metronome at 80 BPM', done: false },
              { title: 'Learn the 12-bar blues pattern', done: false },
              { title: 'Play first full song start to finish', done: false },
              { title: 'Record a practice session', done: false },
            ],
          },
          {
            id: uid(), type: 'project', title: 'Build Emergency Fund', icon: '🏦', deadline: '2026-12-31',
            progress: 0.6, status: 'active', createdAt: twoDaysAgo.toISOString(),
            description: 'Save 3 months of living expenses',
            milestones: [
              { title: 'Calculate monthly expenses', done: true },
              { title: 'Open high-yield savings account', done: true },
              { title: 'Set up automatic transfers', done: true },
              { title: 'Save month 1 expenses', done: true },
              { title: 'Save month 2 expenses', done: true },
              { title: 'Save month 3 expenses', done: false },
              { title: 'Review and adjust plan quarterly', done: false },
            ],
          },
          {
            id: uid(), type: 'project', title: 'Launch Side Project', icon: '🚀', deadline: '2026-07-01',
            progress: 0.15, status: 'active', createdAt: yesterday.toISOString(),
            description: 'Ship a product people want to use',
            milestones: [
              { title: 'Validate idea with 5 potential users', done: true },
              { title: 'Design MVP wireframes', done: true },
              { title: 'Build core feature', done: false },
              { title: 'Create landing page', done: false },
              { title: 'Get 10 beta testers', done: false },
              { title: 'Launch v1.0', done: false },
            ],
          },
        ];

        set({ actions, habits, projects, seeded: true });
      },

      clearAllData: () => {
        set({ actions: [], habits: [], projects: [], thoughts: [], seeded: false });
      },

      // ─── Computed ─────────────────────────────

      getTodayActions: () => {
        const { actions } = get();
        return actions.filter((a) => isToday(a.createdAt) || a.status === 'active' || a.status === 'overdue');
      },

      getStats: () => {
        const { actions, habits, projects, thoughts } = get();
        const doneCount = actions.filter((a) => a.status === 'done').length;
        const total = actions.length || 1;
        const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
        const activeProjects = projects.filter((p) => p.status === 'active').length;
        return {
          thoughtsCaptured: thoughts.length,
          actionsCompleted: doneCount,
          completionRate: Math.round((doneCount / total) * 100),
          currentStreak: maxStreak,
          projectsActive: activeProjects,
        };
      },
    }),
    { name: 'pulse_data' }
  )
);