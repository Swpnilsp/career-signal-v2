import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, FileText, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Keyword Matcher | CareerSignal AI",
  description: "Test your resume against applicant tracking systems. Scan for keyword matching, format compatibility, and missing tech skills with our free AI scanner.",
  keywords: ["ATS Resume Checker", "ATS Resume Scanner", "Free ATS scanner", "Resume keyword matcher", "ATS friendly resume checker"],
};

export default function AtsResumeScannerPage() {
  return (
    <div className="min-h-screen text-[var(--text-1)] relative overflow-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
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
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Advanced ATS Calibration Engine
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white">
            Is Your Resume <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400">
              ATS-Friendly?
            </span>
          </h1>
          <p className="text-[var(--text-2)] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Most Applicant Tracking Systems (like Greenhouse, Workday, and Lever) filter out up to 75% of candidates due to formatting issues or missing key technical skills. Test yours in 30 seconds.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/?upload=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-900/30 transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4" />
              Scan Your Resume Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Features / Why Us Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Why use our ATS Resume Checker?</h2>
            <p className="text-xs text-[var(--text-3)] uppercase tracking-wider font-semibold">How it compares to traditional parsers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Intelligent Keyword Matcher</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                We don't just do dumb keyword matching. Our AI reads the context of your achievements and maps them to required skills.
              </p>
            </div>

            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Red Flag Detection</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Scan for recruiter turn-offs like task-focused descriptions, vague metrics, weak verbs, or bad formatting before you submit.
              </p>
            </div>

            <div className="card p-6 space-y-3 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Tailored Rewrite Suggestions</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Get bullet-by-bullet rewrites optimized with action verbs and quantifiable metrics grounded in your actual experience.
              </p>
            </div>
          </div>
        </section>

        {/* ATS Optimization Tips */}
        <section className="card p-8 bg-zinc-900/40 border-white/6 space-y-6">
          <h3 className="text-lg font-bold text-white">Quick ATS Optimization Tips</h3>
          <ul className="space-y-4 text-xs text-[var(--text-2)]">
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-400 shrink-0 font-bold">01.</span>
              <span><strong>Use Standard Section Headers:</strong> Stick to traditional headers like "Work Experience" or "Skills". Unconventional titles can confuse parsing scripts.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-400 shrink-0 font-bold">02.</span>
              <span><strong>Quantify Your Milestones:</strong> Frame achievements with metrics. Instead of "Responsible for server performance", write "Optimized Postgres indices, reducing load latency by 35%."</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="text-emerald-400 shrink-0 font-bold">03.</span>
              <span><strong>Keep the Layout Simple:</strong> Avoid text boxes, tables, or columns. While they look nice to humans, many parsing engines convert them into garbled, unreadable blocks.</span>
            </li>
          </ul>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 py-6 text-center text-xs text-[var(--text-3)]">
        <p>&copy; {new Date().getFullYear()} CareerSignal AI. Optimize your resume for top-tier tech roles.</p>
      </footer>
    </div>
  );
}
