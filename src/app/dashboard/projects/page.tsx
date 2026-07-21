'use client';

import { useState } from 'react';
import { usePulseStore, type Project } from '@/lib/store';
import { Rocket, Plus, Check, ExternalLink, Lightbulb, AlertCircle, Calendar, Target, Zap } from 'lucide-react';

function ProjectCard({ project, onToggleMilestone }: { project: Project; onToggleMilestone: (idx: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const doneMilestones = project.milestones.filter(m => m.done).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? doneMilestones / totalMilestones : 0;

  const deadline = project.deadline
    ? (() => {
        const diff = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000);
        if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, urgent: true };
        if (diff <= 7) return { text: `${diff} days left`, urgent: true };
        if (diff <= 30) return { text: `${diff} days left`, urgent: false };
        return { text: new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false };
      })()
    : null;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl flex-shrink-0">
          {project.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{project.title}</h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {project.status === 'completed' ? 'DONE' : 'ACTIVE'}
            </span>
            {project.estimatedWeeks && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                ~{project.estimatedWeeks}w
              </span>
            )}
          </div>
          {project.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{project.description}</p>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[var(--text-muted)]">{doneMilestones}/{totalMilestones} milestones</span>
            {deadline && <span className={`text-xs ${deadline.urgent ? 'text-rose-400' : 'text-[var(--text-muted)]'}`}>
              {deadline.text}
            </span>}
          </div>
        </div>
      </div>

      {/* Why — motivation */}
      {project.motivation && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Lightbulb className="w-3 h-3" /> Why this matters
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{project.motivation}</p>
        </div>
      )}

      {/* How — methodology */}
      {project.methodology && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3" /> {project.methodology.split('.')[0]}.
          </div>
          {project.methodSteps && (
            <ul className="space-y-0.5">
              {project.methodSteps.slice(0, 3).map((step, i) => (
                <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                  <span className="text-cyan-400/60 mt-0.5">•</span> {step}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full mb-3 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Milestones */}
      <div className="space-y-1">
        {project.milestones.slice(0, expanded ? undefined : 3).map((milestone, idx) => (
          <div key={idx}>
            <button
              onClick={() => onToggleMilestone(idx)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all text-left"
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                milestone.done
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border border-white/10 text-transparent hover:border-indigo-500/40'
              }`}>
                <Check className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${milestone.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
                  {milestone.title}
                </span>
                {milestone.targetDate && <span className="text-[10px] text-[var(--text-muted)] ml-1.5">{milestone.targetDate}</span>}
              </div>
            </button>
            {/* Show micro-steps for first incomplete milestone */}
            {milestone.microSteps && milestone.microSteps.length > 0 && !milestone.done && (
              <div className="ml-8 mt-1 space-y-1">
                {milestone.microSteps.slice(0, expanded ? undefined : 2).map((step, j) => (
                  <div key={j} className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span className={`${
                      step.difficulty === 'trivial' ? 'text-emerald-400/60' :
                      step.difficulty === 'easy' ? 'text-cyan-400/60' :
                      step.difficulty === 'medium' ? 'text-amber-400/60' : 'text-rose-400/60'
                    }`}>{step.difficulty === 'trivial' ? '○' : step.difficulty === 'easy' ? '◐' : step.difficulty === 'medium' ? '●' : '◆'}</span>
                    <span>{step.title}</span>
                    <span className="text-[var(--text-muted)] text-[10px]">({step.duration})</span>
                  </div>
                ))}
              </div>
            )}
            {milestone.outcome && !milestone.done && (
              <p className="ml-8 mt-1 text-[10px] text-emerald-400/70">✨ {milestone.outcome}</p>
            )}
          </div>
        ))}
      </div>

      {/* Expand/collapse */}
      {(project.milestones.length > 3 || project.resources || project.pitfalls) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-indigo-400 hover:text-indigo-300 py-2 flex items-center justify-center gap-1"
        >
          {expanded ? 'Show less' : `Show all ${project.milestones.length} milestones, resources & pitfalls`}
        </button>
      )}

      {/* Expanded: Resources + Pitfalls */}
      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {project.resources && project.resources.length > 0 && (
            <div className="px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
              <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-2">
                <ExternalLink className="w-3 h-3" /> Resources
              </div>
              {project.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[var(--text-secondary)] hover:text-indigo-400 transition-colors mb-1.5">
                  <span className="text-violet-400 mr-1">→</span>{r.title} <span className="text-[var(--text-muted)]">({r.cost})</span> — {r.pitch}
                </a>
              ))}
            </div>
          )}
          {project.pitfalls && project.pitfalls.length > 0 && (
            <div className="px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
              <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-2">
                <AlertCircle className="w-3 h-3" /> Avoid
              </div>
              {project.pitfalls.map((p, i) => (
                <p key={i} className="text-xs text-[var(--text-secondary)] mb-1">✗ {p}</p>
              ))}
            </div>
          )}
          {project.bestTime && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Calendar className="w-3 h-3 text-amber-400" /> Best time: <span className="text-white">{project.bestTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, toggleMilestone } = usePulseStore();

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gradient text-2xl font-bold">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} · {activeProjects.length} active</p>
        </div>
        <a href="/dashboard/capture" className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </a>
      </div>

      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Active</h2>
          {activeProjects.map(project => (
            <ProjectCard key={project.id} project={project} onToggleMilestone={(idx) => toggleMilestone(project.id, idx)} />
          ))}
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Completed</h2>
          {completedProjects.map(project => (
            <ProjectCard key={project.id} project={project} onToggleMilestone={(idx) => toggleMilestone(project.id, idx)} />
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div className="card-glass p-12 text-center">
          <Rocket className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-sm text-[var(--text-secondary)]">Capture a thought like &ldquo;I want to learn guitar&rdquo; to get a personalized achievement plan</p>
        </div>
      )}
    </div>
  );
}