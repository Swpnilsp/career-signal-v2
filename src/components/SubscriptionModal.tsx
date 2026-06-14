import React, { useState } from 'react';
import { X, Sparkles, Check, CreditCard, Lock, Zap, CheckCircle2 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
  const [step, setStep] = useState<'details' | 'paying' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('paying');

    // Simulate payment call
    setTimeout(() => {
      setStep('success');
      // Success call after delay
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset modal state
        setStep('details');
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setName('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md fade-up">
      <div className="w-full max-w-xl card overflow-hidden border-white/8 bg-zinc-950/95 shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Left Side: Value Prop (Vibrant Purple-Blue Gradient) */}
        <div className="w-full md:w-1/2 p-6 bg-gradient-to-br from-violet-900/40 to-blue-950/30 border-b md:border-b-0 md:border-r border-white/6 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-violet-400 fill-violet-400" />
              Pro Member
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white leading-tight tracking-tight">
                Unlock Unlimited <br/>Resume Scans
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Supercharge your job search with unrestricted, deep technical scoring and AI-tailoring.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                'Unlimited detailed evaluations',
                'Deep Tech-Fit & System Design checks',
                'Advanced job-matching gap analysis',
                'Instant bullet-point tailor optimizer',
                'Zero query limits'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 relative z-10 border-t border-white/5 mt-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">$9</span>
              <span className="text-zinc-400 text-xs">/ month</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Billed monthly. Cancel anytime.</p>
          </div>
        </div>

        {/* Right Side: Checkout Simulation / Success Form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center relative bg-zinc-950">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 'details' && (
            <form onSubmit={handleSimulatePayment} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Billing Information</h3>
                <p className="text-[10px] text-zinc-500">Secure checkout sandbox simulation</p>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.02] border border-white/6 rounded-lg text-xs text-white placeholder-zinc-600 focus:border-violet-500/50 outline-none transition-all"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-zinc-500" />
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9\s]{13,19}"
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.02] border border-white/6 rounded-lg text-xs text-white placeholder-zinc-600 focus:border-violet-500/50 outline-none transition-all font-mono"
                />
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Expiration Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.02] border border-white/6 rounded-lg text-xs text-white placeholder-zinc-600 focus:border-violet-500/50 outline-none transition-all font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    CVC
                    <Lock className="w-2.5 h-2.5 text-zinc-600" />
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.02] border border-white/6 rounded-lg text-xs text-white placeholder-zinc-600 focus:border-violet-500/50 outline-none transition-all font-mono text-center"
                  />
                </div>
              </div>

              {/* Secure note */}
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-white/5 text-[10px] text-zinc-400">
                <Lock className="w-3 h-3 text-violet-400 shrink-0" />
                <span>Simulated Sandbox mode. No actual charges apply.</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-950/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Activate Pro Membership
              </button>
            </form>
          )}

          {step === 'paying' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <span className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-white">Processing Simulated Payment</p>
                <p className="text-[10px] text-zinc-500">Contacting sandbox processor...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Payment Successful!</p>
                <p className="text-xs text-emerald-400">Welcome to CareerSignal Pro!</p>
                <p className="text-[10px] text-zinc-500 pt-2">Unlocking scans quota...</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
