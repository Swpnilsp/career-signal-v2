'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, CreditCard, Lock, Zap, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsBought: number) => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'plans' | 'checkout' | 'processing' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number; credits: number } | null>(null);
  
  // Countdown timer for FOMO bonus offer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 15 * 60)); // Reset to 15m if it hits 0
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Bundle',
      price: 5,
      credits: 10,
      perScan: '$0.50',
      tagline: '☕ Less than a single Starbucks latte!',
      description: 'Perfect for quick resume health checks and minor edits.',
      features: ['10 detailed evaluations', 'Core keyword matching', 'Never expires'],
      badge: null,
      fomoBonus: '+2 Bonus Scans'
    },
    {
      id: 'pro',
      name: 'Job Seeker Pro',
      price: 10,
      credits: 30,
      perScan: '$0.33',
      tagline: '🔥 Chosen by 88% of successful candidates',
      description: 'Ideal for aligning your resume to multiple job descriptions.',
      features: ['30 detailed evaluations', 'Full skills gap analyzer', 'AI bullet tailoring', 'LinkedIn profile audit', 'Never expires'],
      badge: 'Most Popular',
      fomoBonus: '+5 Bonus Scans'
    },
    {
      id: 'accelerator',
      name: 'Career Accelerator',
      price: 20,
      credits: 80,
      perScan: '$0.25',
      tagline: '🚀 Max Savings — Save 50% per scan!',
      description: 'For active tech job hunts requiring custom resume versions.',
      features: ['80 detailed evaluations', 'Full skills gap analyzer', 'AI bullet tailoring', 'LinkedIn profile audit', 'Priority queue', 'Never expires'],
      badge: 'Best Value',
      fomoBonus: '+15 Bonus Scans'
    }
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        // Calculate total credits awarded (base credits + FOMO bonus if timer is active)
        const bonusMap: Record<string, number> = { starter: 2, pro: 5, accelerator: 15 };
        const baseCredits = selectedPlan?.credits ?? 0;
        const bonusCredits = selectedPlan ? bonusMap[selectedPlan.id] ?? 0 : 0;
        
        onSuccess(baseCredits + bonusCredits);
        onClose();
        // Reset states
        setStep('plans');
        setSelectedPlan(null);
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setName('');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md fade-up">
      <div className={`w-full ${step === 'plans' ? 'max-w-4xl' : 'max-w-xl'} card overflow-hidden border-white/8 bg-zinc-950/95 shadow-2xl relative flex flex-col transition-all duration-300`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── PLANS STEP ─────────────────────────────────────────── */}
        {step === 'plans' && (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3 text-violet-400 fill-violet-400" />
                Pay-As-You-Go Scan Credits
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Get Your Resume Interview-Ready
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm">
                No monthly subscriptions. No auto-renewals. Pay once, use forever. 12,000+ tech job seekers optimize their resumes here.
              </p>
            </div>

            {/* FOMO Countdown Timer Alert */}
            <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-white">FOMO Bonus Offer:</span>{' '}
                  <span className="text-[11px] text-zinc-300">Purchase a package before the timer runs out to get extra bonus scans!</span>
                </div>
              </div>
              <div className="text-xs font-mono font-bold bg-violet-500/25 border border-violet-500/30 px-3 py-1.5 rounded-lg text-violet-300 shrink-0 select-none">
                Time Remaining: {formatTime(timeLeft)}
              </div>
            </div>

            {/* Grid of Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {plans.map((plan) => {
                const isPro = plan.id === 'pro';
                return (
                  <div
                    key={plan.id}
                    className={`card p-5 space-y-5 relative flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-white/14 ${
                      isPro
                        ? 'border-violet-500/40 bg-gradient-to-b from-violet-950/15 via-zinc-950 to-zinc-950 shadow-lg shadow-violet-950/10'
                        : 'bg-zinc-900/10'
                    }`}
                  >
                    {/* Glowing Badges */}
                    {plan.badge && (
                      <span className={`absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow ${
                        isPro ? 'bg-violet-600 text-white animate-pulse' : 'bg-blue-600 text-white'
                      }`}>
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Name & Pricing */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-white tracking-tight">${plan.price}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({plan.perScan}/scan)</span>
                        </div>
                        <p className="text-[10px] font-semibold text-emerald-400 font-mono">{plan.tagline}</p>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[32px]">{plan.description}</p>

                      {/* Promo Bonus Tag */}
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-violet-500/25 bg-violet-950/20 text-violet-300 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-violet-400 fill-violet-400" />
                        {plan.fomoBonus} included!
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2 border-t border-white/5 pt-4">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isPro
                          ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-950/20'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/8'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-3 h-3" />
                    </button>

                  </div>
                );
              })}
            </div>

            {/* Money back guarantee */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Risk-Free. Pass the recruiter screening bar or request a full refund.</span>
            </div>

          </div>
        )}

        {/* ── CHECKOUT STEP ──────────────────────────────────────── */}
        {step === 'checkout' && selectedPlan && (
          <div className="p-6 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/6 pb-3">
              <div>
                <button
                  onClick={() => setStep('plans')}
                  className="text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer"
                >
                  ← Change Package
                </button>
                <h3 className="text-sm font-semibold text-white mt-1">Billing Details</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Total Due:</span>
                <span className="text-sm font-extrabold text-white">${selectedPlan.price}</span>
              </div>
            </div>

            {/* Sandbox Simulation Form */}
            <form onSubmit={handleSimulatePayment} className="space-y-4">
              
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
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-sans">Expiration Date</label>
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
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 font-sans">
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

              {/* Secure sandbox warning */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Sandbox Mode active. Standard Stripe test cards are accepted.</span>
              </div>

              {/* Submit Payment */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-violet-950/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Pay ${selectedPlan.price}.00 Once
              </button>
            </form>
          </div>
        )}

        {/* ── PROCESSING STEP ────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <span className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-white">Securing payment channel...</p>
              <p className="text-[10px] text-zinc-500">Contacting dummy payment gateway...</p>
            </div>
          </div>
        )}

        {/* ── SUCCESS STEP ────────────────────────────────────────── */}
        {step === 'success' && selectedPlan && (
          <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-sm font-bold text-white">Payment Completed successfully!</p>
              <p className="text-xs text-emerald-400">Added to your balance: +{selectedPlan.credits} scans</p>
              {timeLeft > 0 && <p className="text-[10px] text-violet-400 font-semibold">⚡ Timer Bonus applied!</p>}
              <p className="text-[10px] text-zinc-500 pt-2">Redirecting to target scoring board...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
