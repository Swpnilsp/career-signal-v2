import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type View = 'signin' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [view, setView] = useState<View>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const resetState = (nextView: View) => {
    setView(nextView);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'forgot') {
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        );
        if (resetError) throw resetError;
        setMessage('Check your email — we sent a password reset link.');
        return;
      }

      if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          onSuccess();
        } else {
          setMessage('Account created! Please check your email inbox to confirm your account and sign in.');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) throw signInError;

        if (data.session) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<View, string> = {
    signin: 'Sign in to CareerSignal',
    signup: 'Create your account',
    forgot: 'Reset your password',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-up">
      <div className="w-full max-w-md card overflow-hidden border-white/8 bg-zinc-950/95 shadow-2xl relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <div className="flex items-center gap-2 text-white font-semibold">
            {view === 'forgot' ? (
              <button
                onClick={() => resetState('signin')}
                className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer -ml-1"
                aria-label="Back to sign in"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span>{titles[view]}</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {view === 'forgot' && !message && (
            <p className="text-zinc-400 text-xs leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/8 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input — hidden on forgot view */}
          {view !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                {view === 'signin' && (
                  <button
                    type="button"
                    onClick={() => resetState('forgot')}
                    className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/8 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!message && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-950/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : view === 'signup' ? (
                'Sign Up'
              ) : view === 'forgot' ? (
                'Send Reset Link'
              ) : (
                'Sign In'
              )}
            </button>
          )}

          {/* Toggle signin/signup */}
          {view !== 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => resetState(view === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer"
              >
                {view === 'signup'
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          )}

          {view === 'forgot' && message && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => resetState('signin')}
                className="text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
