'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  Mic, Type, Link as LinkIcon, Camera, Sparkles, 
  ArrowRight, CheckCircle, Clock, AlertCircle,
  Layers, Rocket, Lightbulb, Calendar, ExternalLink,
  ChevronDown, ChevronUp, Zap, Target,
} from 'lucide-react';
import { usePulseStore } from '@/lib/store';
import { parseThought, type ParsedAction } from '@/lib/parser';
import { generatePlan, type AchievementPlan } from '@/lib/achievement';

const captureTypes = [
  { id: 'voice', icon: Mic, label: 'Voice', desc: 'Speak for up to 10 seconds', color: 'text-cyan-400 bg-cyan-400/10' },
  { id: 'text', icon: Type, label: 'Text', desc: 'Type a thought or idea', color: 'text-indigo-400 bg-indigo-400/10' },
  { id: 'url', icon: LinkIcon, label: 'Link', desc: 'Paste a URL to save', color: 'text-amber-400 bg-amber-400/10' },
  { id: 'photo', icon: Camera, label: 'Photo', desc: 'Snap or upload an image', color: 'text-rose-400 bg-rose-400/10' },
];

function getTypeBadge(type: string) {
  switch (type) {
    case 'habit': return { label: 'HABIT', cls: 'bg-emerald-500/20 text-emerald-400' };
    case 'task': return { label: 'TASK', cls: 'bg-indigo-500/20 text-indigo-400' };
    case 'project': return { label: 'PROJECT', cls: 'bg-amber-500/20 text-amber-400' };
    case 'reference': return { label: 'LINK', cls: 'bg-cyan-500/20 text-cyan-400' };
    default: return { label: 'TASK', cls: 'bg-white/10 text-white/60' };
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'habit': return Layers;
    case 'project': return Rocket;
    case 'reference': return LinkIcon;
    default: return CheckCircle;
  }
}

function PlanCard({ plan, action, index, included, onToggle }: {
  plan: AchievementPlan;
  action: ParsedAction;
  index: number;
  included: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = getTypeBadge(action.type);
  const Icon = getTypeIcon(action.type);

  return (
    <div className={`card transition-all ${included ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'opacity-50'}`}
      style={{ animationDelay: `${index * 80}ms` }}>
      {/* Header */}
      <div className="flex items-start gap-4 p-4 pb-2">
        <button onClick={onToggle} className={`w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center transition-all ${
          included ? 'border-emerald-500/40 bg-emerald-500/10' : 'bg-white/[0.02] border-white/10'
        }`}>
          {included ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border-2 border-white/20" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
            <span className="text-sm font-semibold text-white">{action.title}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{plan.motivation.split('.')[0]}.</p>
        </div>
      </div>

      {/* Why — motivation */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
          <Lightbulb className="w-3 h-3" /> WHY
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{plan.motivation}</p>
      </div>

      {/* How — methodology */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
          <Zap className="w-3 h-3" /> HOW — {plan.methodology.split('.')[0]}
        </div>
        <ul className="mt-1 space-y-1">
          {plan.methodSteps.slice(0, expanded ? undefined : 2).map((step, i) => (
            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
              <span className="text-indigo-400/60 mt-0.5">•</span> {step}
            </li>
          ))}
        </ul>
      </div>

      {/* When — schedule */}
      {plan.schedule.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Calendar className="w-3 h-3" /> WHEN
          </div>
          <div className="mt-1 space-y-1">
            {plan.schedule.slice(0, expanded ? undefined : 1).map((s, i) => (
              <div key={i} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <span className="text-amber-400/80">{s.when}</span>
                <span className="text-[var(--text-muted)]">→</span>
                <span>{s.what}</span>
                <span className="text-[var(--text-muted)]">({s.duration})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show milestones, resources & pitfalls</>}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Milestones */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-2">
              <Target className="w-3 h-3" /> MILESTONES
            </div>
            {plan.milestones.map((m, i) => (
              <div key={i} className="ml-2 mb-2 border-l-2 border-emerald-500/20 pl-3">
                <p className="text-xs font-medium text-white">{m.title} <span className="text-[var(--text-muted)]">— {m.targetDate}</span></p>
                {m.microSteps.map((step, j) => (
                  <p key={j} className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                    <span className="text-indigo-400">{step.difficulty === 'trivial' ? '○' : step.difficulty === 'easy' ? '◐' : step.difficulty === 'medium' ? '●' : '◆'}</span>
                    {step.title} <span className="text-[var(--text-muted)]">({step.duration})</span>
                  </p>
                ))}
                <p className="text-[11px] text-emerald-400/80 mt-1">✨ Outcome: {m.outcome}</p>
              </div>
            ))}
          </div>

          {/* Resources */}
          {plan.resources.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold mb-2">
                <ExternalLink className="w-3 h-3" /> RESOURCES
              </div>
              {plan.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--text-secondary)] hover:text-indigo-400 transition-colors mb-1">
                  <span className="text-violet-400 mr-1">→</span>{r.title} <span className="text-[var(--text-muted)]">({r.cost})</span> — {r.pitch}
                </a>
              ))}
            </div>
          )}

          {/* Pitfalls */}
          {plan.pitfalls.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-2">
                <AlertCircle className="w-3 h-3" /> PITFALLS TO AVOID
              </div>
              {plan.pitfalls.map((p, i) => (
                <p key={i} className="text-xs text-[var(--text-secondary)] mb-1">✗ {p}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CapturePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialText = searchParams.get('q') || '';
  const initialMode = searchParams.get('mode') || 'text';

  const [activeType, setActiveType] = useState(initialMode === 'voice' ? 'voice' : initialMode === 'url' ? 'url' : 'text');
  const [input, setInput] = useState(initialText);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Array<{ action: ParsedAction; plan: AchievementPlan }>>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [toggled, setToggled] = useState<Record<number, boolean>>({});

  const store = usePulseStore();

  function handleProcess() {
    if (!input.trim()) return;
    setProcessing(true);
    const parsed = parseThought(input);
    const withPlans = parsed.map(action => ({
      action,
      plan: generatePlan(action.title, ['habit', 'task', 'project', 'reference'].includes(action.type) ? action.type as 'habit' | 'task' | 'project' | 'reference' : 'task'),
    }));
    setResults(withPlans);
    setToggled(withPlans.reduce<Record<number, boolean>>((acc, _, i) => ({ ...acc, [i]: true }), {}));
    setProcessing(false);
  }

  function handleToggleResult(idx: number) {
    setToggled((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function handleConfirm() {
    if (results.length === 0) return;
    const activeResults = results.filter((_, i) => toggled[i]);

    for (const { action, plan } of activeResults) {
      switch (action.type) {
        case 'habit':
          store.addHabit({
            type: 'habit',
            title: action.title,
            description: action.description,
            icon: action.icon,
            frequency: action.frequency || 'daily',
            trigger: action.trigger,
            schedule: action.schedule,
            motivation: plan.motivation,
            methodology: plan.methodology,
            bestTime: plan.bestTimeOfDay,
            dailySchedule: plan.schedule,
            resources: plan.resources,
            pitfalls: plan.pitfalls,
            microSteps: plan.milestones[0]?.microSteps,
          });
          break;
        case 'project':
          store.addProject({
            type: 'project',
            title: action.title,
            description: action.description,
            icon: action.icon,
            deadline: action.deadline,
            progress: 0,
            status: 'active',
            milestones: plan.milestones.map(m => ({
              title: m.title,
              done: false,
              targetDate: m.targetDate,
              microSteps: m.microSteps,
              outcome: m.outcome,
            })),
            motivation: plan.motivation,
            methodology: plan.methodology,
            methodSteps: plan.methodSteps,
            bestTime: plan.bestTimeOfDay,
            weeklySchedule: plan.schedule,
            resources: plan.resources,
            pitfalls: plan.pitfalls,
            estimatedWeeks: plan.estimatedWeeks,
          });
          break;
        default:
          store.addAction({
            type: action.type,
            title: action.title,
            description: action.description,
            icon: action.icon,
            schedule: action.schedule,
            status: action.deadline ? (new Date(action.deadline) < new Date() ? 'overdue' as const : 'upcoming' as const) : 'active' as const,
            deadline: action.deadline,
            motivation: plan.motivation,
            nextStep: plan.milestones[0]?.microSteps?.[0]?.title,
            microSteps: plan.milestones[0]?.microSteps,
          });
          break;
      }
    }

    store.addThought(input, activeType as 'text' | 'voice' | 'url' | 'photo', activeResults.map(r => r.action.title));
    setConfirmed(true);

    // Redirect to dashboard after showing success
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  }

  const includedCount = Object.values(toggled).filter(Boolean).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-gradient text-2xl font-bold">Capture</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Drop a thought. Pulse turns it into a plan.</p>
      </div>

      {/* Capture type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {captureTypes.map(({ id, icon: Icon, label, desc, color }) => (
          <button
            key={id}
            onClick={() => { setActiveType(id); setResults([]); setConfirmed(false); }}
            className={`card p-4 text-left transition-all ${activeType === id ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' : 'hover:border-white/20'}`}
          >
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-[var(--text-muted)]">{desc}</p>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="card-glass p-6">
        {activeType === 'voice' ? (
          <div className="flex flex-col items-center py-8">
            <button className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all animate-pulse-glow">
              <Mic className="w-8 h-8 text-white" />
            </button>
            <p className="text-sm text-[var(--text-secondary)] mt-4">Tap to start recording</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Or type your thought below</p>
          </div>
        ) : activeType === 'url' ? (
          <input
            type="url"
            value={input}
            onChange={e => { setInput(e.target.value); setResults([]); setConfirmed(false); }}
            placeholder="https://..."
            className="w-full bg-transparent text-white placeholder-[var(--text-muted)] outline-none text-lg"
          />
        ) : (
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResults([]); setConfirmed(false); }}
            placeholder={activeType === 'text' ? "I want to learn piano, or I need to gym 3x a week, or I want to start a podcast..." : "Describe what's in the image..."}
            rows={4}
            className="w-full bg-transparent text-white placeholder-[var(--text-muted)] outline-none resize-none text-lg"
          />
        )}

        {activeType === 'voice' && (
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResults([]); setConfirmed(false); }}
            placeholder="Or type your thought here..."
            rows={2}
            className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-lg p-3 mt-3 text-white placeholder-[var(--text-muted)] outline-none resize-none text-sm"
          />
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--text-muted)]">Pulse creates a personal achievement plan for each thought</p>
          <button
            onClick={handleProcess}
            disabled={processing || !input.trim()}
            className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-40"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Pulse It
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmed success */}
      {confirmed && (
        <div className="card p-6 text-center animate-fade-in-scale">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">Achievement plan added!</h2>
          <p className="text-sm text-[var(--text-secondary)]">Your personalized plan is ready. Redirecting to dashboard…</p>
        </div>
      )}

      {/* Results — Achievement Plan Cards */}
      {results.length > 0 && !confirmed && (
        <div className="space-y-4 animate-fade-in-scale">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Pulse created {results.length} achievement plan{results.length !== 1 ? 's' : ''}
            </h2>
          </div>
          {results.map(({ action, plan }, i) => (
            <PlanCard
              key={i}
              plan={plan}
              action={action}
              index={i}
              included={toggled[i]}
              onToggle={() => handleToggleResult(i)}
            />
          ))}
          <button
            onClick={handleConfirm}
            className="btn-primary w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            Start {includedCount} Achievement Plan{includedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-3xl mx-auto"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" /></div>}>
      <CapturePageInner />
    </Suspense>
  );
}