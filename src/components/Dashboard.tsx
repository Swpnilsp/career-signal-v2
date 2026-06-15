'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, Sparkles, Settings, AlertTriangle,
  CheckCircle, ArrowRight, RefreshCw, Briefcase, Info,
  Copy, Check, Printer, Code, X, ChevronDown, User, Gauge, Zap,
} from 'lucide-react';
import { CLUSTERS, type ClusterId, buildRoleConfig } from '@/utils/taxonomy';
import { evaluateHeuristic } from '@/utils/scoring';
import { generateMockAnalysis, type ApiKeys } from '@/utils/ai';
import ScoreGauge from './ScoreGauge';
import SettingsModal from './SettingsModal';
import TailoredResume from './TailoredResume';
import AuthModal from './AuthModal';
import PaymentModal from './PaymentModal';
import { createClient } from '@/utils/supabase/client';
import { staticTestCases } from '@/utils/test-cases';

// ── Cluster accent → CSS colour map ──────────────────────────────────────────
const CLUSTER_COLORS: Record<ClusterId, { text: string; bar: string; dot: string; glow: string }> = {
  data_ai:        { text: 'text-blue-400',    bar: 'bg-blue-500',    dot: 'bg-blue-500',    glow: 'rgba(59,130,246,0.35)' },
  swe:            { text: 'text-emerald-400', bar: 'bg-emerald-500', dot: 'bg-emerald-500', glow: 'rgba(16,185,129,0.35)' },
  product:        { text: 'text-amber-400',   bar: 'bg-amber-500',   dot: 'bg-amber-500',   glow: 'rgba(245,158,11,0.35)' },
  ai_builder:     { text: 'text-rose-400',    bar: 'bg-rose-500',    dot: 'bg-rose-500',    glow: 'rgba(244,63,94,0.35)'  },
  design_research:{ text: 'text-fuchsia-400', bar: 'bg-fuchsia-500', dot: 'bg-fuchsia-500', glow: 'rgba(217,70,239,0.35)' },
  entry:          { text: 'text-stone-400',   bar: 'bg-stone-400',   dot: 'bg-stone-400',   glow: 'rgba(168,162,158,0.3)' },
  other:          { text: 'text-slate-400',   bar: 'bg-slate-400',   dot: 'bg-slate-400',   glow: 'rgba(148,163,184,0.3)' },
};

// Score → colour
function scoreColor(s: number) {
  if (s >= 78) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (s >= 58) return { text: 'text-amber-400',   bar: 'bg-amber-500'   };
  return              { text: 'text-rose-400',    bar: 'bg-rose-500'    };
}

function priorityBadge(p: 'High'|'Medium'|'Low') {
  if (p === 'High')   return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
  if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
}

// ── Mini components ───────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                 border border-white/8 text-[var(--text-2)] hover:text-[var(--text-1)]
                 hover:border-white/14 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Hero Scorecard Mockup Component ───────────────────────────────────────────
function HeroScorecard() {
  const [checklistActive, setChecklistActive] = useState([false, false, false, false]);
  const [progress, setProgress] = useState(0); // 0 to 1

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Step 0: Impact & Outcomes
    timers.push(setTimeout(() => {
      setChecklistActive([true, false, false, false]);
    }, 300));
    
    // Step 1: Technical Depth
    timers.push(setTimeout(() => {
      setChecklistActive([true, true, false, false]);
    }, 600));
    
    // Step 2: Role-fit reasoning
    timers.push(setTimeout(() => {
      setChecklistActive([true, true, true, false]);
    }, 900));
    
    // Step 3: Seniority calibration
    timers.push(setTimeout(() => {
      setChecklistActive([true, true, true, true]);
    }, 1200));

    // Step 4: Overall score & bars animation starts
    timers.push(setTimeout(() => {
      const duration = 1200; // 1.2 seconds
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const p = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutCubic
        const easeP = 1 - Math.pow(1 - p, 3);
        setProgress(easeP);
        
        if (p < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, 1500));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const interpolate = (start: number, end: number) => {
    return Math.round(start + (end - start) * progress);
  };

  const currentScore = interpolate(60, 90);

  const checklistItems = [
    'Impact & outcomes',
    'Technical depth',
    'Role-fit reasoning',
    'Seniority calibration'
  ];

  const dimensions = [
    { label: 'Resume Strength', before: 55, after: 88 },
    { label: 'Technical Depth', before: 50, after: 86 },
    { label: 'System Design', before: 45, after: 84 },
    { label: 'Product Thinking', before: 62, after: 92 },
    { label: 'Communication', before: 68, after: 94 }
  ];

  return (
    <div className="card p-6 sm:p-7 border-white/8 bg-gradient-to-br from-zinc-950 to-zinc-900/50 shadow-2xl relative overflow-hidden">
      {/* Top right gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Mockup header */}
      <div className="flex items-center justify-between mb-5 border-b border-white/6 pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-3)] font-bold">Career Signal Score</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Role-Aware Scoring Model</span>
          </div>
        </div>
        {/* Crescent/arc-style speed gauge icon on top right */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400/80 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-zinc-800/80 fill-none"
              strokeWidth="3.5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-blue-400 fill-none transition-all duration-300 ease-out"
              strokeWidth="3.5"
              strokeDasharray="75, 100"
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Gauge className="absolute w-3.5 h-3.5 text-blue-400/80" />
        </div>
      </div>

      {/* Score Block */}
      <div className="flex items-end gap-3 mb-5">
        <span className="text-6xl font-bold tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300">
          {currentScore}
        </span>
        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold pb-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up size-3">
            <path d="M16 7h6v6"></path>
            <path d="m22 7-8.5 8.5-5-5L2 17"></path>
          </svg>
          <span>+30 with AI insights</span>
        </div>
      </div>

      {/* Evaluating Checklist */}
      <div className="mb-5 p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-3)] font-bold">Evaluating</div>
        <div className="grid grid-cols-2 gap-2">
          {checklistItems.map((item, idx) => {
            const isActive = checklistActive[idx];
            return (
              <div key={idx} className={`flex items-center gap-1.5 text-[11px] transition-all duration-500 ${
                isActive ? 'opacity-100 text-white' : 'opacity-40 text-zinc-400'
              }`}>
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 transition-colors duration-500 ${
                  isActive ? 'text-emerald-400' : 'text-zinc-700'
                }`} />
                <span className="truncate">{item}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dimensions progress bars */}
      <div className="space-y-4 mb-6 border-b border-white/5 pb-6">
        {dimensions.map((dim, idx) => {
          const currentVal = interpolate(dim.before, dim.after);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-2)]">{dim.label}</span>
                <span className="font-semibold text-[var(--text-1)] tabular-nums">{currentVal}</span>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill bg-gradient-to-r from-blue-500 to-cyan-400" 
                  style={{ width: `${currentVal}%`, transition: 'none' }}
                />
              </div>
            </div>
          );
        })}
        <div className="text-[9px] text-[var(--text-3)] text-center font-medium uppercase tracking-wider pt-2">
          Weighted across 12+ role-specific signals · not keyword matching
        </div>
      </div>

      {/* How You Compare */}
      <div className="space-y-4 mb-6">
        <div className="text-[9px] uppercase tracking-widest text-[var(--text-3)] font-bold">How You Compare</div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[var(--text-1)]">You</span>
              <span className="font-bold text-blue-400 tabular-nums">{currentScore}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill bg-gradient-to-r from-blue-500 to-cyan-400" 
                style={{ width: `${currentScore}%`, transition: 'none' }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-2)]">Top candidates</span>
              <span className="text-[var(--text-1)]">92</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '92%' }}/>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-2)]">Average candidates</span>
              <span className="text-[var(--text-1)]">64</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill bg-white/10" style={{ width: '64%' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Top gaps found alert */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <AlertTriangle className="w-4 h-4"/>
          Top gaps found
        </div>
        <ul className="space-y-1.5 text-[11px] text-[var(--text-2)]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Weak quantified impact
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Low system design depth
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Role alignment unclear
          </li>
        </ul>
      </div>
    </div>
  );
}

// ── History Modal Component ───────────────────────────────────────────────────
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scans: any[];
  onSelectScan: (scan: any) => void;
}

function HistoryModal({ isOpen, onClose, scans, onSelectScan }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-up">
      <div className="w-full max-w-lg card overflow-hidden border-white/8 bg-zinc-950/95 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
          <div className="flex items-center gap-2 text-white font-semibold">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Your Scans History</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {scans.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              You haven't run any evaluations yet. Logged-in scans will show up here.
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-sm font-semibold text-white truncate pr-4">
                      {scan.filename}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded border border-white/5 text-zinc-300 font-medium">
                        {scan.role_cluster.toUpperCase().replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300">
                        {scan.score}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Match Score</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'feedback' | 'linkedin' | 'jobmatch' | 'tailored';

export default function Dashboard() {
  /* ── State ─────────────────────────────────────────────── */
  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      process.env.NODE_ENV === 'development';
      setIsDev(isLocal);
    }
  }, []);

  const [resumeFile, setResumeFile]         = useState<File|null>(null);
  const [resumeText, setResumeText]         = useState('');
  const [linkedinText, setLinkedinText]     = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [clusterId, setClusterId]   = useState<ClusterId>('swe');
  const [subRoleId, setSubRoleId]   = useState<string>('backend_engineer');

  const [dragging, setDragging]     = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadStep, setLoadStep]     = useState('');
  const [error, setError]           = useState<string|null>(null);

  const [profile, setProfile]       = useState<any|null>(null);
  const [analysis, setAnalysis]     = useState<any|null>(null);
  const [roleMeta, setRoleMeta]     = useState<any|null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>('feedback');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys]           = useState<ApiKeys>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [jdUrl, setJdUrl]                 = useState('');
  const [fetchingJd, setFetchingJd]       = useState(false);

  const [session, setSession] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scansHistory, setScansHistory] = useState<any[]>([]);
  const [monthlyScansCount, setMonthlyScansCount] = useState<number>(0);

  const isExcludedUser = session?.user?.email === "swappatil123@gmail.com";
  const remainingScans = profileData ? profileData.max_scans - profileData.scans_used : 5;
  const isLimitReached = !!session && !isExcludedUser && remainingScans <= 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('upload') === 'true' || params.get('cta') || params.get('start') === 'true') {
        setShowInputForm(true);
      }
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then((res: any) => {
      const session = res.data?.session;
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMonthlyScansCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMonthlyScansCount(session.user.id);
      } else {
        setProfileData(null);
        setMonthlyScansCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfileData(data);
    }
  };

  const fetchMonthlyScansCount = async (userId: string) => {
    const supabase = createClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (!error && count !== null) {
      setMonthlyScansCount(count);
      return count;
    }
    return 0;
  };

  const fetchScansHistory = async () => {
    if (!session?.user) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('scans')
      .select('id, filename, role_cluster, score, analysis, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setScansHistory(data);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchScansHistory();
    } else {
      setScansHistory([]);
    }
  }, [session]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setProfileData(null);
    setAnalysis(null);
  };

  const handleCreditPurchaseSuccess = async (creditsBought: number) => {
    if (!session?.user) return;
    const supabase = createClient();
    const currentMax = profileData?.max_scans ?? 5;
    const nextMax = currentMax + creditsBought;

    const { error } = await supabase
      .from('profiles')
      .update({ max_scans: nextMax })
      .eq('id', session.user.id);
    if (!error) {
      fetchProfile(session.user.id);
      fetchMonthlyScansCount(session.user.id);
    }
  };

  const handleLoadPastScan = (scan: any) => {
    const payload = scan.analysis;
    setProfile(payload.structuredProfile);
    setAnalysis(payload.analysisReport);
    setRoleMeta(payload.roleConfig);
    setHistoryOpen(false);
    setShowInputForm(true);
    setActiveTab('feedback');
  };



  const fetchJobDescription = async () => {
    if (!jdUrl.trim()) return;
    setFetchingJd(true);
    setError(null);
    try {
      const r = await fetch('/api/fetch-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jdUrl.trim() }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed to fetch job description.');
      const data = await r.json();
      setJobDescription(data.text);
      setJdUrl('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch job description.');
    } finally {
      setFetchingJd(false);
    }
  };

  const loadSampleReport = () => {
    setIsLoading(true);
    setError(null);
    setLoadStep('Extracting mock profile…');
    setTimeout(() => {
      setLoadStep('Calculating score rubrics…');
      setTimeout(() => {
        const mockProfile = {
          name: 'Jane Doe',
          current_role: 'Senior Software Engineer',
          contact_info: {
            email: 'jane.doe@example.com',
            phone: '+1 (555) 019-2834',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/janedoe',
            github: 'github.com/janedoe',
            website: 'janedoe.dev'
          },
          years_experience: 5,
          education: [{ degree: 'BS', field: 'Computer Science', school: 'State University', year: '2021' }],
          skills: ['Python', 'TypeScript', 'React', 'SQL', 'PostgreSQL', 'System Design', 'Redis', 'Docker'],
          work_experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Software Engineer',
              duration: '2023 - Present',
              responsibilities: [
                'Designed and built a microservices API gateway handling 10k RPS, reducing latency by 35%.',
                'Optimized database SQL schemas and Postgres indexes, shaving 1.2s off response times.',
                'Refactored frontend using Next.js, and introduced unit testing coverage (Jest) to 85%.'
              ],
              impact_metrics: ['35% latency reduction', '10k RPS handled']
            },
            {
              company: 'Enterprise LLC',
              role: 'Software Engineer II',
              duration: '2021 - 2023',
              responsibilities: [
                'Developed and launched full stack features using Django and React.',
                'Built event processing queue using Redis and celery to optimize background jobs.'
              ],
              impact_metrics: []
            }
          ],
          projects: [
            {
              title: 'Open Source Contribution',
              description: 'Contributed performance improvements to a popular data processing library.',
              technologies: ['TypeScript', 'Node.js']
            }
          ],
          tools_technologies: ['Python', 'TypeScript', 'React', 'SQL', 'PostgreSQL', 'Redis', 'Docker', 'Django'],
          domains: ['Backend Engineering', 'Distributed Systems'],
          certifications: [
            'AWS Certified Solutions Architect - Associate',
            'Certified ScrumMaster (CSM)'
          ],
          awards_achievements: [
            'Winner of Tech Corp Hackathon 2024 (Best AI Hack)',
            'Summa Cum Laude Graduate - State University'
          ],
          languages: ['English (Native)', 'French (Conversational)'],
          additional_sections: [
            {
              title: 'Volunteering & Community',
              content: [
                'Technical Mentor at local high school coding club, teaching Python & Javascript basics to 20+ students.',
                'Open-source contributor to Next.js community docs and local code brigades.'
              ]
            }
          ],
          sections: [
            {
              title: 'Professional Summary',
              type: 'summary',
              content: [
                'Senior Software Engineer with 5+ years of experience building high-performance systems at scale.'
              ]
            },
            {
              title: 'Core Skills & Technologies',
              type: 'skills',
              content: [
                'Python  •  TypeScript  •  React  •  SQL  •  PostgreSQL  •  System Design  •  Redis  •  Docker'
              ]
            },
            {
              title: 'Professional Experience',
              type: 'experience',
              content: [
                'Tech Corp - Senior Software Engineer (2023 - Present)',
                '• Designed and built a microservices API gateway handling 10k RPS, reducing latency by 35%.',
                '• Optimized database SQL schemas and Postgres indexes, shaving 1.2s off response times.',
                '• Refactored frontend using Next.js, and introduced unit testing coverage (Jest) to 85%.',
                'Enterprise LLC - Software Engineer II (2021 - 2023)',
                '• Developed and launched full stack features using Django and React.',
                '• Built event processing queue using Redis and celery to optimize background jobs.'
              ]
            },
            {
              title: 'Key Projects',
              type: 'projects',
              content: [
                'Open Source Contribution',
                '• Contributed performance improvements to a popular data processing library.'
              ]
            },
            {
              title: 'Education',
              type: 'education',
              content: [
                'BS in Computer Science - State University (2021)'
              ]
            },
            {
              title: 'Certifications',
              type: 'other',
              content: [
                'AWS Certified Solutions Architect - Associate',
                'Certified ScrumMaster (CSM)'
              ]
            },
            {
              title: 'Volunteering & Community',
              type: 'other',
              content: [
                '• Technical Mentor at local high school coding club, teaching Python & Javascript basics to 20+ students.',
                '• Open-source contributor to Next.js community docs and local code brigades.'
              ]
            }
          ]
        };

        const roleConfig = buildRoleConfig('swe', 'backend_engineer');
        const heuristic = evaluateHeuristic(mockProfile, roleConfig);
        
        const analysisData = generateMockAnalysis(
          mockProfile,
          roleConfig,
          'Senior Software Engineer at Tech Corp. Passionate about system design and distributed scaling.',
          'Seeking a Senior Backend Engineer to design scalable REST APIs, write tests, and optimize databases.',
          heuristic,
          null
        );
        
        analysisData.overallScore = 81;
        analysisData.dimensions[0].score = 78;
        analysisData.dimensions[1].score = 69;
        analysisData.dimensions[2].score = 84;
        analysisData.dimensions[3].score = 62;
        analysisData.dimensions[4].score = 76;
        
        analysisData.resumeTailoring.optimizedResume = {
          name: 'Jane Doe',
          current_role: 'Senior Backend Engineer',
          summary: 'Senior Backend Engineer with 5+ years of experience designing scalable REST APIs and microservices. Expert in TypeScript, Python, and SQL, with a track record of shaving 1.2s off database responses and handling 10k RPS gateways.',
          skills: ['Python', 'TypeScript', 'React', 'SQL', 'PostgreSQL', 'System Design', 'Redis', 'Docker', 'Django'],
          work_experience: [
            {
              company: 'Tech Corp',
              role: 'Senior Backend Engineer',
              duration: '2023 - Present',
              responsibilities: [
                'Designed and built a microservices API gateway handling 10k RPS, reducing latency by 35% using Node.js.',
                'Optimized Postgres database schemas and indexes, shaving 1.2s off response times.',
                'Refactored frontend interfaces using Next.js and React, increasing test coverage to 85%.'
              ]
            },
            {
              company: 'Enterprise LLC',
              role: 'Software Engineer II',
              duration: '2021 - 2023',
              responsibilities: [
                'Developed and launched full stack features using Django and React.',
                'Built event processing queue using Redis and celery to optimize background jobs.'
              ]
            }
          ],
          projects: [
            {
              title: 'Open Source Contribution',
              description: 'Contributed performance improvements to a popular data processing library.',
              technologies: ['TypeScript', 'Node.js']
            }
          ]
        };

        setProfile(mockProfile);
        setAnalysis(analysisData);
        setRoleMeta({
          sub_role_label: 'Backend Engineer',
          cluster_label: 'Software Engineering',
          scoring_rubric: roleConfig.scoring_rubric
        });
        setClusterId('swe');
        setSubRoleId('backend_engineer');
        setJobDescription('Seeking a Senior Backend Engineer to design scalable REST APIs, write tests, and optimize databases.');
        setLinkedinText('Senior Software Engineer at Tech Corp. Passionate about system design and distributed scaling.');
        
        setIsLoading(false);
        setLoadStep('');
        setShowInputForm(true);
        setActiveTab('feedback');
      }, 500);
    }, 500);
  };

  // Load keys on mount
  useEffect(() => {
    const provider  = localStorage.getItem('cs_ai_provider') as 'openai'|'gemini'|'groq'|'cerebras'|null;
    const openaiKey = localStorage.getItem('cs_openai_key')  ?? '';
    const geminiKey = localStorage.getItem('cs_gemini_key')  ?? '';
    const groqKey   = localStorage.getItem('cs_groq_key')    ?? '';
    const cerebrasKey = localStorage.getItem('cs_cerebras_key') ?? '';
    const openaiModel = localStorage.getItem('cs_openai_model') ?? 'gpt-4o-mini';
    const geminiModel = localStorage.getItem('cs_gemini_model') ?? 'gemini-3.5-flash';
    const groqModel   = localStorage.getItem('cs_groq_model')   ?? 'llama-3.3-70b-versatile';
    const cerebrasModel = localStorage.getItem('cs_cerebras_model') ?? 'llama-3.3-70b';
    if (provider) {
      setApiKeys({
        provider,
        openaiKey,
        geminiKey,
        groqKey,
        cerebrasKey,
        openaiModel,
        geminiModel,
        groqModel,
        cerebrasModel,
      });
    }
  }, []);

  // When cluster changes, default to first sub-role
  useEffect(() => {
    const cluster = CLUSTERS.find(c => c.id === clusterId);
    if (cluster) setSubRoleId(cluster.sub_roles[0].id);
  }, [clusterId]);

  const activeCluster  = CLUSTERS.find(c => c.id === clusterId)!;
  const activeSubRole  = activeCluster.sub_roles.find(s => s.id === subRoleId)!;
  const clusterColors  = CLUSTER_COLORS[clusterId];

  /* ── File handling ─────────────────────────────────────── */
  const handleFile = (f: File) => { setResumeFile(f); setError(null); };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  /* ── Analysis ──────────────────────────────────────────── */
  const runAnalysis = async (
    overrideProfile?: any,
    overrideInputs?: {
      resumeText: string;
      linkedinText: string;
      jobDescription: string;
      clusterId: ClusterId;
      subRoleId: string;
    }
  ) => {
    // ── Authentication & Limits Guards ───────────────────────────
    const isDeveloperSandbox = isDev && overrideInputs?.resumeText.includes("SWAPNIL PATIL");
    const isExcludedUser = session?.user?.email === "swappatil123@gmail.com";
    const currentRemaining = profileData ? profileData.max_scans - profileData.scans_used : 5;
    const isLimitReached = !isDeveloperSandbox && !isExcludedUser && currentRemaining <= 0;

    if (!isDeveloperSandbox && !session) {
      setAuthModalOpen(true);
      return;
    }

    if (isLimitReached) {
      setCreditModalOpen(true);
      return;
    }

    setIsLoading(true); setError(null); setAnalysis(null);

    try {
      let activeText = overrideInputs ? overrideInputs.resumeText : resumeText.trim();
      const activeLinkedin = overrideInputs ? overrideInputs.linkedinText : linkedinText;
      const activeJd = overrideInputs ? overrideInputs.jobDescription : jobDescription;
      const activeClusterId = overrideInputs ? overrideInputs.clusterId : clusterId;
      const activeSubRoleId = overrideInputs ? overrideInputs.subRoleId : subRoleId;

      if (!overrideInputs && resumeFile && !overrideProfile) {
        setLoadStep('Parsing document…');
        const fd = new FormData();
        fd.append('file', resumeFile);
        const r = await fetch('/api/parse', { method: 'POST', body: fd });
        if (!r.ok) throw new Error((await r.json()).error ?? 'File parse failed.');
        activeText = (await r.json()).text;
        setResumeText(activeText);
      }

      if (!overrideProfile && !activeText) {
        throw new Error('Please upload a resume or paste your resume text first.');
      }

      setLoadStep('Scoring profile…');
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: activeText,
          structuredProfile: overrideProfile ?? null,
          linkedinText: activeLinkedin,
          jobDescription: activeJd,
          clusterId: activeClusterId,
          subRoleId: activeSubRoleId,
          keys: apiKeys,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? 'Analysis failed.');

      const data = await r.json();
      setProfile(data.structuredProfile);
      setAnalysis(data.analysis);
      setRoleMeta(data.roleConfig);
      setShowInputForm(true);
      setActiveTab('feedback');

      // Save scan to database and increment scan count
      if (session?.user && !isDeveloperSandbox) {
        const supabase = createClient();
        
        // 1. Insert scan record
        const { error: insertError } = await supabase
          .from('scans')
          .insert({
            user_id: session.user.id,
            filename: resumeFile ? resumeFile.name : 'Pasted Text.txt',
            role_cluster: activeClusterId,
            score: data.analysis.overallScore,
            analysis: {
              analysisReport: data.analysis,
              structuredProfile: data.structuredProfile,
              roleConfig: data.roleConfig
            }
          });
        
        if (insertError) {
          console.error('Failed to save scan result:', insertError);
        } else {
          // Refresh history list
          fetchScansHistory();
          fetchMonthlyScansCount(session.user.id);
        }

        // 2. Increment profile scans count (only if user is not excluded from quota)
        if (!isExcludedUser) {
          const nextScansUsed = (profileData?.scans_used ?? 0) + 1;
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ scans_used: nextScansUsed })
            .eq('id', session.user.id);
          
          if (updateError) {
            console.error('Failed to update scans usage count:', updateError);
          } else {
            setProfileData((prev: any) => prev ? { ...prev, scans_used: nextScansUsed } : null);
          }
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Unexpected error.');
    } finally {
      setIsLoading(false); setLoadStep('');
    }
  };

  const handleLoadTestCase = (testCaseKey: string) => {
    const tc = staticTestCases[testCaseKey];
    if (!tc) return;

    setResumeFile(null);
    setResumeText(tc.resumeText);
    setLinkedinText(tc.linkedinText);
    setJobDescription(tc.jobDescription);
    setClusterId(tc.clusterId as ClusterId);
    setSubRoleId(tc.subRoleId);
    
    runAnalysis(null, {
      resumeText: tc.resumeText,
      linkedinText: tc.linkedinText,
      jobDescription: tc.jobDescription,
      clusterId: tc.clusterId as ClusterId,
      subRoleId: tc.subRoleId,
    });
  };

  const recalculate = () => profile ? runAnalysis(profile) : runAnalysis();

  const reset = () => {
    setResumeFile(null); setResumeText(''); setLinkedinText('');
    setJobDescription(''); setProfile(null); setAnalysis(null);
    setRoleMeta(null); setError(null); setShowInputForm(false);
  };

  const renderLandingPage = () => {
    return (
      <div className="fade-up space-y-24 pt-6 pb-20">
        {/* Side-by-side Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto relative">
          <div className="absolute inset-0 -z-10 opacity-30 blur-3xl pointer-events-none" 
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />

          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/8 bg-white/[0.02] text-[11px] text-[var(--text-2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Role-specific scoring model · not a keyword scanner
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.08] text-white">
              Know how strong <br />
              your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 animate-pulse">career signal</span> <br />
              really is
            </h1>
            
            <p className="text-[var(--text-2)] text-base sm:text-lg leading-relaxed max-w-xl">
              AI analyzes your resume, role fit, interview readiness, and technical depth — then shows exactly what's holding you back.
            </p>

            <div className="space-y-6">
              {/* Primary Conversion Button: Sample Report */}
              <div className="space-y-3 max-w-md">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Most Users Start Here
                </div>
                
                <button onClick={loadSampleReport}
                  className="w-full text-left p-4 sm:p-5 rounded-xl border border-blue-500/30 bg-zinc-950/70 hover:bg-zinc-900/60
                             shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]
                             transition-all flex items-center gap-4 cursor-pointer group border border-blue-500/25">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Gauge className="w-5 h-5"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      See a Sample Report
                    </div>
                    <div className="text-[11px] text-[var(--text-2)] leading-relaxed mt-0.5">
                      Score, dimension breakdown, gaps and fixes — 30 sec preview
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3 max-w-md text-[9px] text-[var(--text-3)] uppercase tracking-widest font-bold">
                <div className="h-px bg-white/5 flex-1" />
                <span>OR</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {/* Secondary CTA: Upload Resume */}
              <button onClick={() => setShowInputForm(true)}
                className="w-full max-w-md px-6 py-3.5 rounded-xl font-semibold text-xs text-white border border-white/8 hover:border-white/14
                           bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0"/>
                Analyze My Resume Free
              </button>
            </div>

            {isDev && (
              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10 inline-flex flex-col items-start gap-2.5 max-w-md">
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 flex items-center gap-1">
                  <Code className="w-3 h-3"/> Developer Sandbox
                </span>
                <button onClick={() => handleLoadTestCase('swapnil_ds')}
                  className="px-5 py-2.5 rounded-lg font-semibold text-xs text-white
                             bg-violet-900/50 hover:bg-violet-800 border border-violet-500/30 hover:border-violet-500/50
                             transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  🧪 Test Swapnil DS Resume (Microsoft Copilot JD)
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Scorecard Mockup */}
          <div className="lg:col-span-6 w-full lg:justify-self-end max-w-md mx-auto lg:mr-0">
            <HeroScorecard />
          </div>
        </section>

        {/* How CareerSignal AI analyzes your profile */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-widest text-[var(--text-3)] font-bold">Hiring Intelligence</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How CareerSignal AI analyzes your profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {([
              { num: '01', title: 'Parse Resume', desc: 'Converts your PDF/DOCX to structured nodes' },
              { num: '02', title: 'Infer Role', desc: 'Calibrates fit for 7 role clusters and archetypes' },
              { num: '03', title: 'Detect Gaps', desc: 'Screens against dynamic sub-role scoring rubrics' },
              { num: '04', title: 'Benchmark', desc: 'Compares your profile to top-of-cohort distributions' },
              { num: '05', title: 'Ground Tailoring', desc: 'Rewrites wording using your real milestones' }
            ]).map((step, idx) => (
              <div key={idx} className="card p-5 relative space-y-2 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                <span className="absolute top-3 right-3 text-lg font-mono text-[var(--text-3)] opacity-40 font-bold">{step.num}</span>
                <h4 className="text-sm font-semibold text-[var(--text-1)] pr-8">{step.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Here's what you'll get */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-widest text-[var(--text-3)] font-bold">Key Benefits</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Here's what you'll get</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              { title: 'Overall Score & Breakdown', desc: 'A rigorous tech-hiring-bar grading across 5 core competency dimensions.' },
              { title: 'Strengths & Weakspots', desc: 'Direct, uncensored hiring manager critiques highlighting your red flags.' },
              { title: 'Role Fit Analysis', desc: 'Deep alignment comparison mapping your resume content directly to sub-role rubrics.' },
              { title: 'Market Competitiveness', desc: 'See how your experience stack, metrics, and leadership signals rank in the market.' },
              { title: 'Personalized Recommendations', desc: 'Interactive, grounded bullet-by-bullet rewrites optimized with action verbs and XYZ metrics.' },
              { title: 'Interview Readiness Insights', desc: 'Identify system design, product thinking, or communication gaps before you chat with a recruiter.' }
            ]).map((item, idx) => (
              <div key={idx} className="card p-6 space-y-3 bg-white/[0.01] hover:bg-white/[0.02] transition-all card-hover">
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Check className="w-4 h-4"/>
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-1)]">{item.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button onClick={loadSampleReport}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-500
                         text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-900/20 transition-all cursor-pointer border border-violet-400/20">
              See Full Sample Report
              <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>
        </section>

        {/* See the difference Comparison */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-widest text-[var(--text-3)] font-bold">Transformation</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">See the difference</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Before */}
            <div className="md:col-span-3 card p-5 border-rose-500/20 bg-rose-500/[0.01] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-rose-400">Before CareerSignal AI</span>
                <span className="text-xl font-bold text-rose-400">58</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[var(--text-2)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Unclear impact / Task-focused descriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Missing key skills for target roles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Weak alignment to role cluster definition
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Low interview signal & ATS screen risk
                </li>
              </ul>
            </div>

            {/* Transition Arrow */}
            <div className="md:col-span-1 flex flex-col items-center justify-center text-violet-400 py-2">
              <div className="w-10 h-10 rounded-full bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
                <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0"/>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-3)] mt-2 font-bold">AI Tailor</span>
            </div>

            {/* After */}
            <div className="md:col-span-3 card p-5 border-emerald-500/20 bg-emerald-500/[0.01] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-400">After CareerSignal AI</span>
                <span className="text-xl font-bold text-emerald-400">86</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[var(--text-2)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Quantified impact (XYZ formulas, latency/traffic gains)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Stronger technical depth & explicit systems scope
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Better role alignment & optimized keyword densities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Higher interview readiness & ATS screening pass rate
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benchmarking Comparison */}
        <section className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-widest text-[var(--text-3)] font-bold">Benchmarking</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How strong is your hiring signal?</h2>
            <p className="text-[var(--text-2)] text-sm max-w-xl mx-auto leading-relaxed">
              Understand how your profile compares to stronger, interview-ready candidates. Most resumes get filtered out within 6 seconds.
            </p>
          </div>

          <div className="card p-6 sm:p-8 bg-gradient-to-br from-zinc-950 to-zinc-900/50 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="space-y-3 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Needs Work</span>
                  <span className="text-xs text-[var(--text-3)] font-bold">&lt; 65</span>
                </div>
                <div className="text-2xl font-bold text-zinc-300">Filtered Out</div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Weak keyword density, lack of outcome-oriented metrics, and poor sub-role alignment. High risk of ATS rejection.
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-xl bg-white/[0.02] border border-white/8 relative">
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-violet-600 text-[9px] text-white font-bold uppercase tracking-wider">
                  Average Candidate
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Competitive</span>
                  <span className="text-xs text-[var(--text-3)] font-bold">65 - 80</span>
                </div>
                <div className="text-2xl font-bold text-zinc-300">Manager Review</div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Solid experience but misses the high-bar accomplishments. Relies too much on task listings instead of leadership or system depth.
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-xl bg-violet-950/10 border border-violet-500/25 shadow-lg shadow-violet-950/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tech-Bar Ready</span>
                  <span className="text-xs text-[var(--text-3)] font-bold">80+</span>
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">
                  Fast-Track Interview
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Rigorous quantified metrics, explicit system design depth, precise role cluster keyword indexing, and clear leadership indicators.
                </p>
              </div>
            </div>

            {/* Visual indicator bar */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex justify-between text-[10px] text-[var(--text-3)] uppercase tracking-wider mb-2 font-bold">
                <span>0 Score</span>
                <span>50</span>
                <span>75</span>
                <span>100 Score</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 p-0.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" style={{ width: '100%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--text-2)] mt-2">
                <span>⚠️ High Risk</span>
                <span>⚖️ Average</span>
                <span>🚀 Top 10% (Tech Hiring Bar)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to boost your career signal? */}
        <section className="text-center max-w-3xl mx-auto space-y-6 py-10">
          <h2 className="text-3xl font-bold tracking-tight">Ready to boost your career signal?</h2>
          <p className="text-[var(--text-2)] text-sm max-w-md mx-auto">
            Run your first analysis free. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button onClick={() => setShowInputForm(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white
                         bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
                         shadow-lg shadow-violet-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-violet-400/10">
              <Sparkles className="w-4 h-4"/>
              Analyze My Resume Free
            </button>
            <button onClick={loadSampleReport}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-[var(--text-2)]
                         border border-white/8 hover:border-white/14 hover:text-[var(--text-1)]
                         bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2 cursor-pointer">
              See a Sample Report
            </button>
          </div>
        </section>
      </div>
    );
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Nav bar ──────────────────────────────────────── */}
      <header className="no-print sticky top-0 z-40 border-b border-white/6
                         bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setShowInputForm(false); setAnalysis(null); }}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600
                            flex items-center justify-center shadow-lg">
               <Sparkles className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">CareerSignal<span className="text-violet-400"> AI</span></span>
          </div>
 
          <div className="flex items-center gap-4">
            <button onClick={loadSampleReport}
              className="text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] transition-all cursor-pointer">
              See sample
            </button>
            
            {session ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-white/5">
                    {profileData ? (
                      session.user.email === 'swappatil123@gmail.com' ? 'Unlimited (Tester)' :
                      profileData.max_scans >= 1000 ? 'Pro Unlimited' :
                      `${Math.max(0, profileData.max_scans - profileData.scans_used)} / ${profileData.max_scans} Scans Left`
                    ) : 'Checking Scans...'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono hidden md:inline truncate max-w-[120px]">
                    {session.user.email}
                  </span>
                </div>
                <button onClick={() => setHistoryOpen(true)}
                  className="text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] transition-all cursor-pointer">
                  History
                </button>
                <button onClick={handleSignOut}
                  className="text-xs font-semibold text-[var(--text-2)] hover:text-rose-400 transition-all cursor-pointer">
                  Sign out
                </button>
              </>
            ) : (
              <button onClick={() => setAuthModalOpen(true)}
                className="text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text-1)] transition-all cursor-pointer">
                Sign in
              </button>
            )}
            
            <button onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         border border-white/8 text-[var(--text-2)] hover:text-[var(--text-1)]
                         hover:border-white/14 transition-all cursor-pointer">
              <Settings className="w-3.5 h-3.5"/>
              {apiKeys.provider ? apiKeys.provider.toUpperCase() : 'Demo Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-10">

        {/* ── Error banner ───────────────────────────────── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl
                          bg-rose-500/8 border border-rose-500/20 text-rose-300 text-sm fade-up">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto shrink-0">
              <X className="w-4 h-4 opacity-60 hover:opacity-100"/>
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            LOADING STATE
        ══════════════════════════════════════════════════ */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 fade-up">
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-full border-2 border-white/8 border-t-violet-500 spinning"/>
              <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-violet-400 pulsing"/>
            </div>
            <p className="text-[var(--text-1)] font-semibold">{loadStep || 'Processing…'}</p>
            <p className="text-[var(--text-3)] text-sm mt-1 max-w-xs text-center">
              Our AI hiring manager is evaluating your profile against top-tier tech hiring criteria.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            LANDING PAGE VIEW
        ══════════════════════════════════════════════════ */}
        {!isLoading && !analysis && !showInputForm && renderLandingPage()}

        {/* ══════════════════════════════════════════════════
            INPUT PHASE
        ══════════════════════════════════════════════════ */}
        {!isLoading && !analysis && showInputForm && (
          <div className="fade-up space-y-8">
            {isLimitReached && (
              <div className="card p-6 border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-blue-950/30 to-zinc-950 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-violet-400">
                      <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
                      Out of Scan Credits
                    </div>
                    <h3 className="text-sm font-bold text-white">Add Scan Credits to Continue</h3>
                    <p className="text-xs text-zinc-400 max-w-xl">
                      You've used all of your available scans. Unlock more scans instantly starting at less than the cost of a coffee to get deep technical calibration and tailoring.
                    </p>
                  </div>
                  <button
                    onClick={() => setCreditModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-violet-950/20 shrink-0 cursor-pointer"
                  >
                    Add Credits
                  </button>
                </div>
              </div>
            )}

            {/* ── Hero ─────────────────────────────────── */}
            <div className="text-center space-y-3 pb-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                How strong is your profile<br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                  {' '}for the roles you want?
                </span>
              </h1>
              <p className="text-[var(--text-2)] text-base max-w-lg mx-auto">
                Upload your resume, select your target role, and get a rigorous
                top-tier tech hiring bar evaluation with actionable improvements.
              </p>
              {isDev && (
                <div className="flex justify-center pt-2">
                  <div className="inline-flex items-center gap-2 p-2 px-3.5 rounded-lg border border-violet-500/20 bg-violet-950/10 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 flex items-center gap-1">
                      <Code className="w-3 h-3"/> Dev:
                    </span>
                    <button onClick={() => handleLoadTestCase('swapnil_ds')}
                      className="text-violet-300 hover:text-violet-200 underline font-semibold transition-all cursor-pointer">
                      Run Swapnil DS Resume (Experimentation Cluster)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* ── LEFT: Resume + LinkedIn + JD ──────── */}
              <div className="lg:col-span-7 space-y-4">

                {/* Resume upload */}
                <div className="card p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-400"/> Resume
                  </h2>

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 py-8 rounded-xl
                                border-2 border-dashed cursor-pointer transition-all
                                ${dragging
                                  ? 'border-violet-500/60 bg-violet-500/5'
                                  : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt"
                           className="hidden" onChange={onFileChange}/>
                    <Upload className={`w-6 h-6 transition-colors ${dragging ? 'text-violet-400' : 'text-[var(--text-3)]'}`}/>
                    <div className="text-center">
                      <p className="text-sm font-medium text-[var(--text-2)]">
                        {resumeFile ? resumeFile.name : 'Drop PDF, DOCX, or TXT'}
                      </p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">or click to browse</p>
                    </div>
                    {resumeFile && (
                      <button onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                        className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/8 text-[var(--text-3)]">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </div>

                  {/* Or paste */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/6"/>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">or paste text</span>
                    <div className="flex-1 h-px bg-white/6"/>
                  </div>
                  <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here…"
                    rows={6}
                    className="w-full px-3.5 py-3 text-sm resize-none rounded-xl"/>
                </div>

                {/* LinkedIn (optional) */}
                <div className="card p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn profile <span className="text-[var(--text-3)] font-normal ml-1">optional</span>
                  </h2>
                  <textarea value={linkedinText} onChange={e => setLinkedinText(e.target.value)}
                    placeholder="Paste your LinkedIn About section or full profile export…"
                    rows={3}
                    className="w-full px-3.5 py-3 text-sm resize-none rounded-xl"/>
                </div>

                {/* Job description (optional) */}
                <div className="card p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400"/>
                    Job description <span className="text-[var(--text-3)] font-normal ml-1">optional — unlocks gap analysis</span>
                  </h2>

                  {/* URL Scraper input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste Job posting URL to fetch..."
                      value={jdUrl}
                      onChange={e => setJdUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-[var(--text-1)] outline-none"
                    />
                    <button
                      type="button"
                      disabled={fetchingJd || !jdUrl.trim()}
                      onClick={fetchJobDescription}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {fetchingJd ? <RefreshCw className="w-3.5 h-3.5 spinning" /> : 'Fetch Link'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/6"/>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-3)]">or paste text</span>
                    <div className="flex-1 h-px bg-white/6"/>
                  </div>

                  <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description to see fit score and missing skills…"
                    rows={4}
                    className="w-full px-3.5 py-3 text-sm resize-none rounded-xl"/>
                </div>
              </div>

              {/* ── RIGHT: Cluster + Sub-role ─────────── */}
              <div className="lg:col-span-5 space-y-4">
                <div className="card p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-[var(--text-1)]">Target role</h2>

                  {/* Cluster grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {CLUSTERS.map(c => {
                      const colors = CLUSTER_COLORS[c.id];
                      const isActive = clusterId === c.id;
                      return (
                        <button key={c.id}
                          onClick={() => setClusterId(c.id)}
                          className={`card card-hover text-left p-3.5 rounded-xl transition-all
                                      ${isActive ? `cluster-selected-${c.id}` : ''}`}>
                          <div className={`flex items-center gap-2 mb-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`}/>
                            <span className={`text-xs font-semibold leading-tight ${isActive ? colors.text : 'text-[var(--text-1)]'}`}>
                              {c.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-3)] leading-snug line-clamp-2">
                            {c.tagline}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-role selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)]">
                      Specific role
                    </label>
                    <div className="relative">
                      <select
                        value={subRoleId}
                        onChange={e => setSubRoleId(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-sm rounded-xl appearance-none cursor-pointer">
                        {activeCluster.sub_roles.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4
                                              text-[var(--text-3)] pointer-events-none"/>
                    </div>
                    {/* Blurb */}
                    <p className="text-xs text-[var(--text-2)] italic">{activeSubRole?.blurb}</p>
                  </div>

                  {/* Rubric preview */}
                  <div className="space-y-1.5 pt-2 border-t border-white/6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-2">
                      Evaluated on
                    </p>
                    {activeCluster.rubric.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full shrink-0 ${clusterColors.dot}`}/>
                        <span className="text-xs text-[var(--text-2)]">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {isLimitReached ? (
                  <button onClick={() => setCreditModalOpen(true)}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                               bg-gradient-to-r from-violet-600 to-blue-600
                               hover:from-violet-500 hover:to-blue-500
                               shadow-lg shadow-violet-900/30
                               flex items-center justify-center gap-2 transition-all group cursor-pointer">
                    <Zap className="w-4 h-4 fill-white" />
                    Get Scan Credits to Score Profile
                  </button>
                ) : (
                  <button onClick={() => runAnalysis()}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white
                               bg-gradient-to-r from-violet-600 to-blue-600
                               hover:from-violet-500 hover:to-blue-500
                               shadow-lg shadow-violet-900/30
                               flex items-center justify-center gap-2 transition-all group cursor-pointer">
                    Score My Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
                  </button>
                )}
                <p className="text-[10px] text-[var(--text-3)] text-center">
                  No API key? Runs in demo mode with realistic mock scores.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            RESULTS PHASE
        ══════════════════════════════════════════════════ */}
        {!isLoading && analysis && (
          <div className="fade-up grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── LEFT SIDEBAR ──────────────────────────── */}
            <aside className="lg:col-span-4 space-y-4 no-print">

              {/* Score card */}
              <div className="card p-6 flex flex-col items-center gap-5">
                <ScoreGauge score={analysis.overallScore} label="Profile Score" size={140}/>

                <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-white/6 text-center">
                  <div>
                    <p className={`text-xl font-bold ${clusterColors.text}`}>{profile?.years_experience ?? '—'}</p>
                    <p className="text-[10px] text-[var(--text-3)] uppercase tracking-wider mt-0.5">Yrs Exp</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-wide ${clusterColors.text}`}>
                      {roleMeta?.cluster_label?.split('/')[0]?.trim() ?? clusterId}
                    </p>
                    <p className="text-[10px] text-[var(--text-3)] uppercase tracking-wider mt-0.5">Cluster</p>
                  </div>
                </div>

                {/* Role label */}
                <div className={`w-full px-3 py-2 rounded-xl border text-center text-xs font-medium
                                cluster-selected-${clusterId}`}>
                  <span className={clusterColors.text}>{roleMeta?.sub_role_label}</span>
                </div>
              </div>

              {/* Rubric mini-bars */}
              <div className="card p-5 space-y-3">
                <p className="text-xs font-semibold text-[var(--text-1)] mb-1">Dimension Overview</p>
                {analysis.dimensions.map((d: any, i: number) => {
                  const sc = scoreColor(d.score);
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-[var(--text-2)] leading-tight">{d.label}</span>
                        <span className={`text-[11px] font-bold tabular-nums ${sc.text}`}>{d.score}</span>
                      </div>
                      <div className="bar-track">
                        <div className={`bar-fill ${sc.bar}`} style={{ width: `${d.score}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick adjustments */}
              <div className="card p-5 space-y-4">
                <p className="text-xs font-semibold text-[var(--text-1)]">Re-evaluate</p>

                {/* Cluster mini-grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {CLUSTERS.map(c => {
                    const cc = CLUSTER_COLORS[c.id];
                    const active = clusterId === c.id;
                    return (
                      <button key={c.id}
                        onClick={() => setClusterId(c.id)}
                        title={c.label}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border
                                    ${active
                                      ? `${cc.text} border-current bg-white/5`
                                      : 'text-[var(--text-3)] border-white/6 hover:border-white/12'}`}>
                        {c.id === 'data_ai' ? 'Data' :
                         c.id === 'ai_builder' ? 'AI/LLM' :
                         c.id === 'design_research' ? 'Design' :
                         c.label.split('/')[0].trim()}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-role */}
                <div className="relative">
                  <select value={subRoleId} onChange={e => setSubRoleId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs rounded-xl appearance-none">
                    {activeCluster.sub_roles.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                                          text-[var(--text-3)] pointer-events-none"/>
                </div>

                {/* JD area with url scraper */}
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <input
                      type="url"
                      placeholder="Fetch job link..."
                      value={jdUrl}
                      onChange={e => setJdUrl(e.target.value)}
                      className="flex-1 px-2 py-1 text-[11px] rounded-lg bg-white/[0.04] border border-white/10 text-[var(--text-1)] outline-none"
                    />
                    <button
                      type="button"
                      disabled={fetchingJd || !jdUrl.trim()}
                      onClick={fetchJobDescription}
                      className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-40 transition-colors shrink-0"
                    >
                      {fetchingJd ? '...' : 'Fetch'}
                    </button>
                  </div>
                  <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                    placeholder="Or paste job description…" rows={3}
                    className="w-full px-3 py-2 text-xs resize-none rounded-xl"/>
                </div>

                <button onClick={recalculate}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white
                             bg-violet-600 hover:bg-violet-500 transition-colors
                             flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5"/> Recalculate
                </button>

                <button onClick={reset}
                  className="w-full py-2 rounded-xl text-xs font-medium text-[var(--text-2)]
                             border border-white/8 hover:border-white/14 hover:text-[var(--text-1)] transition-all">
                  ← Upload new resume
                </button>
              </div>
            </aside>

            {/* ── RIGHT CONTENT ──────────────────────────── */}
            <div className="lg:col-span-8 space-y-5">

              {/* Tab bar */}
              <div className="no-print flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/6 overflow-x-auto">
                {([
                  { id: 'feedback',  label: 'Evaluation',      icon: Sparkles },
                  { id: 'linkedin',  label: 'LinkedIn Audit',   icon: User, disabled: !analysis.linkedinAnalysis },
                  { id: 'jobmatch',  label: 'Job Match',        icon: Briefcase, disabled: !analysis.jobMatch },
                  { id: 'tailored',  label: 'Tailored Resume',  icon: FileText },
                ] as {id:Tab; label:string; icon:any; disabled?:boolean}[]).map(tab => (
                  <button key={tab.id}
                    disabled={tab.disabled}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold
                                whitespace-nowrap transition-all
                                ${tab.disabled ? 'opacity-25 cursor-not-allowed' : ''}
                                ${activeTab === tab.id
                                  ? 'bg-white/8 text-[var(--text-1)] shadow-sm'
                                  : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}>
                    {tab.icon && <tab.icon className="w-3.5 h-3.5 shrink-0"/>}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: Evaluation & Feedback ──────────── */}
              {activeTab === 'feedback' && (
                <div className="space-y-5 fade-up">

                  {/* Top strengths / weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5"/> Top weaknesses
                      </h3>
                      <ul className="space-y-2">
                        {analysis.topWeaknesses.slice(0,5).map((w: string, i: number) => (
                          <li key={i} className="text-[11px] text-[var(--text-2)] leading-snug flex gap-2">
                            <span className="text-rose-500 mt-0.5 shrink-0">▸</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5"/> Top improvements
                      </h3>
                      <ul className="space-y-2">
                        {analysis.topImprovements.slice(0,5).map((t: string, i: number) => (
                          <li key={i} className="text-[11px] text-[var(--text-2)] leading-snug flex gap-2">
                            <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Per-dimension deep cards */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--text-1)]">Dimension breakdown</h3>
                    {analysis.dimensions.map((d: any, i: number) => {
                      const sc = scoreColor(d.score);
                      return (
                        <div key={i} className="card p-5 space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${clusterColors.dot}`}/>
                              <h4 className="text-sm font-semibold text-[var(--text-1)]">{d.label}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold
                                              uppercase tracking-wide ${priorityBadge(d.priority)}`}>
                                {d.priority}
                              </span>
                              <span className={`text-sm font-bold tabular-nums ${sc.text}`}>{d.score}/100</span>
                            </div>
                          </div>

                          {/* Bar */}
                          <div className="bar-track">
                            <div className={`bar-fill ${sc.bar}`} style={{ width: `${d.score}%` }}/>
                          </div>

                          {/* Content grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-4">
                              {d.originalPoint && (
                                <div className="rounded-xl bg-rose-500/[0.02] border border-rose-500/10 p-3.5">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400 mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Current Resume Point
                                  </p>
                                  <p className="text-[var(--text-2)] leading-relaxed italic">"{d.originalPoint}"</p>
                                </div>
                              )}
                              
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-1">Gap identified</p>
                                <p className="text-[var(--text-2)] leading-relaxed">{d.gap || 'No significant gap identified in this dimension.'}</p>
                              </div>
                              
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)] mb-1">Why recruiters care</p>
                                <p className="text-[var(--text-2)] leading-relaxed">{d.whyItMatters}</p>
                              </div>
                            </div>
                            
                            {d.tailoredRewrite && (
                              <div className="rounded-xl bg-emerald-500/[0.03] border border-emerald-500/15 p-4 flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Tailored Rewrite Suggestion
                                  </p>
                                  <p className="text-zinc-100 font-medium leading-relaxed font-sans">"{d.tailoredRewrite}"</p>
                                </div>
                                <div className="flex justify-end">
                                  <CopyBtn text={d.tailoredRewrite} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TAB: Tailored Resume ─────────────────── */}
              {activeTab === 'tailored' && analysis.resumeTailoring && (
                <div className="fade-up space-y-5">
                  {/* Missing keywords */}
                  {analysis.resumeTailoring.missingKeywords?.length > 0 && (
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5"/> Missing keywords to add
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.resumeTailoring.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-medium
                                                   bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bullet rewrites */}
                  {analysis.resumeTailoring.bulletRewrites?.length > 0 && (
                    <div className="card p-5 space-y-4">
                      <h3 className="text-xs font-semibold text-[var(--text-1)]">Bullet rewrites</h3>
                      {analysis.resumeTailoring.bulletRewrites.map((bw: any, i: number) => (
                        <div key={i} className="space-y-2 pb-4 border-b border-white/6 last:border-0 last:pb-0">
                          <div className="text-[11px] bg-rose-500/5 border border-rose-500/15 rounded-lg p-3 text-[var(--text-3)]">
                            <span className="text-[9px] font-bold uppercase text-rose-400 block mb-1">Before</span>
                            {bw.original}
                          </div>
                          <div className="text-[11px] bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3 text-[var(--text-2)]">
                            <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-1">After</span>
                            {bw.rewritten}
                          </div>
                          <p className="text-[10px] text-[var(--text-3)] italic">{bw.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optimised resume */}
                  {profile && analysis && (
                    <TailoredResume profile={profile} analysis={analysis} />
                  )}
                </div>
              )}

              {/* ── TAB: LinkedIn Audit ──────────────────── */}
              {activeTab === 'linkedin' && analysis.linkedinAnalysis && (
                <div className="fade-up space-y-4">
                  <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
                    <ScoreGauge score={analysis.linkedinAnalysis.score} label="LinkedIn Strength" size={110}/>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[var(--text-1)]">Profile Visibility Audit</h3>
                      <p className="text-xs text-[var(--text-2)] leading-relaxed max-w-sm">
                        Measures keyword density, headline strength, narrative clarity, and recruiter discoverability for <em>{roleMeta?.sub_role_label}</em> roles.
                      </p>
                    </div>
                  </div>
                  <div className="card p-5 space-y-3">
                    <h3 className="text-xs font-semibold text-blue-400">5 optimisations</h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {analysis.linkedinAnalysis.improvements.map((imp: string, i: number) => (
                        <li key={i} className="text-[11px] text-[var(--text-2)] leading-snug">{imp}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)]">Optimised headline</p>
                      <CopyBtn text={analysis.linkedinAnalysis.rewrittenHeadline}/>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-1)] bg-white/[0.025] rounded-lg px-3 py-2 font-mono">
                      {analysis.linkedinAnalysis.rewrittenHeadline}
                    </p>
                  </div>
                  <div className="card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-3)]">Optimised About</p>
                      <CopyBtn text={analysis.linkedinAnalysis.rewrittenAbout}/>
                    </div>
                    <pre className="text-xs text-[var(--text-2)] leading-relaxed whitespace-pre-wrap
                                   bg-white/[0.025] rounded-lg p-3 max-h-64 overflow-y-auto">
                      {analysis.linkedinAnalysis.rewrittenAbout}
                    </pre>
                  </div>
                </div>
              )}

              {/* ── TAB: Job Match ───────────────────────── */}
              {activeTab === 'jobmatch' && analysis.jobMatch && (
                <div className="fade-up space-y-4">
                  <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
                    <ScoreGauge score={analysis.jobMatch.fitScore} label="Job Fit" size={110}/>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-[var(--text-1)]">Profile × JD Gap Analysis</h3>
                      <p className="text-xs text-[var(--text-2)] leading-relaxed max-w-sm">
                        Measures how tightly your resume aligns with the required skills, experience signals, and role language in the pasted JD.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5"/> Strong matches
                      </h3>
                      <ul className="space-y-2">
                        {analysis.jobMatch.strongMatches.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-[var(--text-2)] flex gap-2">
                            <span className="text-emerald-500 shrink-0">✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5"/> Missing skills
                      </h3>
                      <ul className="space-y-2">
                        {analysis.jobMatch.missingSkills.map((s: string, i: number) => (
                          <li key={i} className="text-[11px] text-[var(--text-2)] flex gap-2">
                            <span className="text-rose-500 shrink-0">✗</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="card p-5 space-y-3">
                    <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5"/> Recruiter red flags
                    </h3>
                    <ul className="space-y-2">
                      {analysis.jobMatch.riskFactors.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] text-[var(--text-2)] flex gap-2">
                          <span className="text-amber-500 shrink-0">⚠</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}


            </div>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={keys => setApiKeys(keys)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        scans={scansHistory}
        onSelectScan={handleLoadPastScan}
      />

      <PaymentModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        onSuccess={handleCreditPurchaseSuccess}
      />
    </div>
  );
}
