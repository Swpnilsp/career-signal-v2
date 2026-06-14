'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Supabase fires an auth state change when the user arrives via the reset link.
  // We wait for the PASSWORD_RECOVERY event before allowing the form to submit.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (user was already signed in)
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      // Redirect to home after a short delay
      setTimeout(() => router.push('/'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strengthScore];
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#eab308', '#10b981', '#22d3ee'][strengthScore];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-950/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CareerSignal</span>
        </div>

        <div className="card border-white/8 bg-zinc-950/95 shadow-2xl overflow-hidden">
          {/* Ambient top glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-white/6">
            <h1 className="text-white font-semibold text-base">Set a new password</h1>
            <p className="text-zinc-400 text-xs mt-1">
              Choose a strong password to secure your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Password updated! Redirecting you to the app…</span>
              </div>
            )}

            {!success && (
              <>
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-white/[0.03] border border-white/8 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: i <= strengthScore ? strengthColor : 'rgba(255,255,255,0.06)',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px]" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-white/[0.03] border border-white/8 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-violet-500/50 outline-none transition-all"
                      style={{
                        borderColor:
                          confirmPassword && confirmPassword !== password
                            ? 'rgba(244,63,94,0.5)'
                            : confirmPassword && confirmPassword === password
                            ? 'rgba(16,185,129,0.5)'
                            : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[10px] text-rose-400">Passwords don't match</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-[10px] text-emerald-400">Passwords match ✓</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !sessionReady}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-950/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>

                {!sessionReady && (
                  <p className="text-center text-zinc-500 text-[10px]">
                    Verifying reset link…
                  </p>
                )}
              </>
            )}
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
            ← Back to CareerSignal
          </a>
        </p>
      </div>
    </div>
  );
}
