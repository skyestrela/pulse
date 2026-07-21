import Link from 'next/link';
import {
  Mic, Activity, Layers, Rocket, Calendar, BarChart3,
  ArrowRight, Check, Cloud, Zap, Brain, Play
} from 'lucide-react';

const features = [
  { icon: Mic, title: 'Voice Capture', desc: 'Speak for 10 seconds. Pulse extracts every intent, deadline, and habit automatically.', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { icon: Activity, title: 'Smart Timeline', desc: 'Not a boring list. A living EKG-style timeline that pulses with your day.', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { icon: Layers, title: 'Habit Stacking', desc: 'AI anchors new habits to your existing routines. After coffee? Water plants.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: Rocket, title: 'Project Decomposition', desc: 'Vague goals become weekly milestones. "Learn guitar" → 12 structured steps.', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { icon: Calendar, title: 'Auto Scheduling', desc: 'Pulse finds the best time based on your energy patterns and existing commitments.', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: BarChart3, title: 'Weekly Review', desc: 'Auto-generated summary: what you planned, what you did, what slipped through.', color: 'text-rose-400', bg: 'bg-rose-400/10' },
];

const steps = [
  { num: '01', title: 'Capture', desc: 'Record a voice memo, type a thought, or paste a URL. One tap.', icon: Mic },
  { num: '02', title: 'Process', desc: 'AI extracts intents, recognizes dates and topics, identifies the outcome type.', icon: Brain },
  { num: '03', title: 'Act', desc: 'Actions land on your Pulse timeline, scheduled and organized automatically.', icon: Zap },
];

const plans = [
  {
    name: 'Free', badge: 'badge-free', price: '£0', period: '/month',
    desc: 'Get started with the essentials',
    features: ['50 thoughts per month', 'Basic timeline view', '3 projects', '5 habits', 'Voice capture'],
    cta: 'Start Free', href: '/auth/signup', highlight: false,
  },
  {
    name: 'Plus', badge: 'badge-plus', price: '£3', period: '/month',
    desc: 'For people who think a lot',
    features: ['Unlimited thoughts', 'AI smart scheduling', '20 projects', 'Unlimited habits', 'Weekly review', 'Calendar sync'],
    cta: 'Get Plus', href: '/auth/signup', highlight: true,
  },
  {
    name: 'Pro', badge: 'badge-pro', price: '£19', period: ' lifetime',
    desc: 'Own it forever, no subscription',
    features: ['Everything in Plus', 'Priority AI processing', 'Early access to features', 'Advanced analytics', 'Calendar sync', 'Lifetime updates'],
    cta: 'Go Pro', href: '/auth/signup', highlight: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gradient">PULSE</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Log in</Link>
            <Link href="/auth/signup" className="btn-primary px-4 py-1.5 rounded-lg text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        <div className="hero-blob w-[500px] h-[500px] bg-indigo-500/10 top-1/4 left-1/2 -translate-x-1/2" />
        <div className="hero-blob w-[300px] h-[300px] bg-cyan-500/10 bottom-0 right-1/4" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 badge badge-plus mb-6 text-xs">
            <Zap className="w-3 h-3" /> Now in Early Access
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-gradient">Think It.</span> Pulse It.{' '}
            <span className="text-gradient">Done.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            The personal OS that turns scattered thoughts into structured action plans. 
            Voice a thought, get a timeline.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/auth/signup" className="btn-primary px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#how" className="btn-secondary px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <Play className="w-4 h-4" /> See How It Works
            </Link>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="card-glass p-6 max-w-3xl mx-auto animate-fade-in-scale">
            {/* Fake EKG line */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[var(--text-muted)] font-medium">TODAY&apos;S PULSE</span>
            </div>
            <svg viewBox="0 0 600 80" className="w-full h-20 mb-4">
              <polyline
                points="0,40 30,40 50,40 60,10 70,70 80,40 120,40 150,40 170,40 180,15 190,65 200,40 240,40 270,40 280,5 290,75 300,40 340,40 370,40 380,20 390,60 400,40 440,40 470,40 480,12 490,68 500,40 540,40 600,40"
                fill="none"
                stroke="url(#ekgGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ekg-line"
              />
              <defs>
                <linearGradient id="ekgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              {/* Action labels */}
              <circle cx="70" cy="10" r="4" fill="#6366f1" />
              <text x="70" y="0" textAnchor="middle" fill="#818cf8" fontSize="7" fontFamily="monospace">meeting</text>
              <circle cx="190" cy="15" r="4" fill="#22c55e" />
              <text x="190" y="5" textAnchor="middle" fill="#4ade80" fontSize="7" fontFamily="monospace">gym</text>
              <circle cx="290" cy="5" r="4" fill="#f59e0b" />
              <text x="290" y="-8" textAnchor="middle" fill="#fbbf24" fontSize="7" fontFamily="monospace">taxes</text>
              <circle cx="490" cy="12" r="4" fill="#22d3ee" />
              <text x="490" y="2" textAnchor="middle" fill="#22d3ee" fontSize="7" fontFamily="monospace">read</text>
            </svg>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>8 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>10 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-3">FEATURES</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">Everything you need, nothing you don&apos;t</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mb-12">From thought to action in seconds. No manual scheduling, no forgotten ideas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="card p-6 group animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">HOW IT WORKS</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-gradient">From thought to timeline in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-2">{s.num}</p>
                <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-3">PRICING</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">Pay for what you actually need</h2>
          <p className="text-[var(--text-secondary)] mb-12">Start free. Upgrade when you think more than 50 thoughts a month.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div key={i} className={`card p-6 flex flex-col relative ${p.highlight ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : ''}`}>
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-plus text-[10px]">MOST POPULAR</span>
                )}
                <div className="mb-4">
                  <span className={`badge ${p.badge} mb-2`}>{p.name}</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">{p.price}</span>
                    <span className="text-sm text-[var(--text-muted)]">{p.period}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{p.desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={`${p.highlight ? 'btn-primary' : 'btn-secondary'} w-full py-2.5 rounded-lg text-sm font-medium text-center block`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass p-10 relative overflow-hidden">
            <div className="hero-blob w-[300px] h-[300px] bg-indigo-500/20 -top-1/2 left-1/2 -translate-x-1/2" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 relative z-10">Start thinking, stop forgetting</h2>
            <p className="text-[var(--text-secondary)] mb-6 relative z-10">50 thoughts free every month. No credit card required.</p>
            <Link href="/auth/signup" className="btn-primary px-8 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 relative z-10">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-xs text-gradient">PULSE</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">© 2026 Pulse</p>
        </div>
      </footer>
    </div>
  );
}