'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 300);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">PULSE</span>
        </div>
        <div className="card-glass p-8 animate-fade-in-scale">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Sign in to your Pulse</p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Email</label>
              <input
                id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full glass bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full glass bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-300 text-center">
              Early access: all accounts get <span className="font-semibold text-indigo-200">Pro</span> for free
            </p>
          </div>
        </div>
        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}