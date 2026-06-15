import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, FileText, CheckCircle, ArrowRight, Code, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: "Tech Resume Grader & Score Calculator | CareerSignal AI",
  description: "Grade your technical resume against top-tier tech standards. Calculate your score across software engineering, product, data science, and design roles.",
  keywords: ["Tech resume grader", "Software engineer resume checker", "Resume score calculator", "Resume reviewer for tech", "FAANG resume checker free"],
};

export default function TechResumeGraderPage() {
  return (
    <div className="min-h-screen text-[var(--text-1)] relative overflow-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="no-print border-b border-white/6 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">CareerSignal<span className="text-violet-400"> AI</span></span>
          </Link>
          <Link href="/?start=true" className="px-4 py-1.5 rounded-lg border border-white/8 hover:border-white/14 text-xs font-semibold hover:bg-white/[0.02] transition-all">
            Open App
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-12 md:py-20 space-y-20 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/8 bg-white/[0.02] text-[11px] text-[var(--text-2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Rigorous Role-Specific Scoring
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white">
            Grade Your Tech Resume <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
              against Elite Bars
            </span>
          </h1>
          <p className="text-[var(--text-2)] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Traditional ATS software scanners only look for matching words. CareerSignal AI evaluates your resume on technical depth, quantitative metrics, leadership, and system design capability.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/?upload=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-950/30 transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4" />
              Calculate My Resume Score
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Features / Why Us Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Advanced Evaluation Metrics</h2>
            <p className="text-xs text-[var(--text-3)] uppercase tracking-wider font-semibold">How your score is calculated</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Technical Depth Check</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Measures whether you specify exact framework components, system choices, and technical trade-offs instead of generic lists.
              </p>
            </div>

            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Quantified Business Impact</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Checks if your bullets follow standard achievement formats (e.g. Google's XYZ formula) to show the concrete outcomes of your work.
              </p>
            </div>

            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Role-Specific Rubrics</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                We score you against custom, role-specific rubrics for Front-end, Back-end, PM, AI/ML, System Design, and Entry Level positions.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 py-6 text-center text-xs text-[var(--text-3)]">
        <p>&copy; {new Date().getFullYear()} CareerSignal AI. Calculate your score against top-tier tech standards.</p>
      </footer>
    </div>
  );
}
