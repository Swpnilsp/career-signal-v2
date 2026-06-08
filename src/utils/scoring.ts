// Taxonomy-driven heuristic scoring engine.
// Scores are computed per-rubric dimension using keyword matches, penalties, and boost signals.
// NEVER exposes keyword profiles, weights, or evaluation models to the UI.

import type { RoleConfig, KeywordProfile } from './taxonomy';

export interface StructuredProfile {
  name: string;
  current_role: string;
  years_experience: string | number;
  contact_info?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  education: { degree?: string; field?: string; school?: string; year?: string }[];
  skills: string[];
  work_experience: {
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
    impact_metrics?: string[];
  }[];
  projects: { title: string; description: string; technologies?: string[] }[];
  tools_technologies: string[];
  domains: string[];
  certifications?: string[];
  awards_achievements?: string[];
  languages?: string[];
  publications?: string[];
  additional_sections?: { title: string; content: string[] }[];
  summary?: string;
  sections?: { title: string; content: string[]; type: string }[];
}

/** Build a single searchable text corpus from the profile */
function buildCorpus(profile: StructuredProfile): string {
  const parts: string[] = [
    profile.name,
    profile.current_role,
    ...(profile.skills || []),
    ...(profile.tools_technologies || []),
    ...(profile.domains || []),
  ];

  if (profile.sections && profile.sections.length > 0) {
    parts.push(...profile.sections.flatMap(s => s.content || []));
  } else {
    // Fallback if sections is not present (e.g. mock profile)
    if (profile.work_experience) {
      parts.push(...profile.work_experience.flatMap(w => [
        w.company, w.role, w.duration,
        ...(w.responsibilities || []),
        ...(w.impact_metrics ?? []),
      ]));
    }
    if (profile.projects) {
      parts.push(...profile.projects.flatMap(p => [
        p.title, p.description, ...(p.technologies ?? []),
      ]));
    }
    if (profile.education) {
      parts.push(...profile.education.flatMap(e => [
        e.degree ?? '', e.field ?? '', e.school ?? '',
      ]));
    }
  }

  return parts.filter(Boolean).join(' ').toLowerCase();
}

/** Count substring occurrences (case-insensitive) */
function countMatches(corpus: string, keywords: string[]): number {
  return keywords.reduce((total, kw) => {
    const escaped = kw.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const matches = corpus.match(new RegExp(escaped, 'g'));
    return total + (matches ? matches.length : 0);
  }, 0);
}

/** Returns true if at least one variant of keyword phrase appears */
function hasKeyword(corpus: string, keyword: string): boolean {
  // Support "A or B" patterns in keyword definitions
  const variants = keyword.toLowerCase().split(' or ').map(v => v.trim());
  return variants.some(v => corpus.includes(v));
}

export interface DimensionScore {
  label: string;     // Human-readable rubric label (from cluster.rubric)
  score: number;     // 0–100
}

export interface HeuristicResult {
  overallScore: number;
  dimensions: DimensionScore[];
}

/**
 * Compute heuristic scores for each rubric dimension in the given RoleConfig.
 *
 * Strategy:
 * - Each rubric dimension gets an equal share of the must_have + preferred keyword signal.
 * - Missing penalty keywords apply a flat deduction.
 * - Boost signals add a bonus.
 * - Experience years shift the base.
 */
export function evaluateHeuristic(
  profile: StructuredProfile,
  roleConfig: RoleConfig,
): HeuristicResult {
  const corpus = buildCorpus(profile);
  const kp: KeywordProfile = roleConfig.keyword_profile;
  const rubric = roleConfig.scoring_rubric;

  const expYears = typeof profile.years_experience === 'number'
    ? profile.years_experience
    : parseFloat(String(profile.years_experience)) || 1;

  // ── Keyword signal (0–1) ──────────────────────────────────────────────────
  const mustTotal   = kp.must_have.length || 1;
  const prefTotal   = kp.preferred.length || 1;
  const mustMatches = kp.must_have.filter(k => hasKeyword(corpus, k)).length;
  const prefMatches = kp.preferred.filter(k => hasKeyword(corpus, k)).length;
  const keywordSignal = (mustMatches / mustTotal) * 0.65 + (prefMatches / prefTotal) * 0.35;

  // ── Penalty for missing critical keywords ─────────────────────────────────
  const penaltyCount = kp.missing_penalty_keywords.filter(k => !hasKeyword(corpus, k)).length;
  const penaltyFraction = kp.missing_penalty_keywords.length
    ? penaltyCount / kp.missing_penalty_keywords.length
    : 0;

  // ── Boost signals ─────────────────────────────────────────────────────────
  const boostSignals = roleConfig.job_matching_config.boost_signals ?? [];
  const boostMatches = countMatches(corpus, boostSignals);
  const boostBonus = Math.min(boostMatches * 3, 12); // cap at +12

  // ── Experience alignment bonus ────────────────────────────────────────────
  const expBonus = Math.min(expYears * 2.5, 20); // cap at +20

  // ── Base score per dimension ──────────────────────────────────────────────
  const baseScore = Math.round(
    keywordSignal * 68           // keyword signal contributes up to 68
    - penaltyFraction * 18       // missing keywords knock up to 18 points off
    + expBonus                   // experience adds up to 20
    + boostBonus                 // boost signals add up to 12
  );

  // ── Per-dimension variance (simulated spread so not all bars are identical) ─
  const dimensions: DimensionScore[] = rubric.map((label, i) => {
    // Add a pseudo-deterministic small variance per dimension
    const variance = ((i * 7) % 15) - 7;  // range: -7..+7
    const raw = Math.max(18, Math.min(100, baseScore + variance));
    return { label, score: raw };
  });

  // Overall = weighted average with slight recency bias toward first dimensions
  const weights = rubric.map((_, i) => 1 - i * 0.04);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const overallScore = Math.round(
    dimensions.reduce((acc, d, i) => acc + d.score * weights[i], 0) / weightSum
  );

  return { overallScore, dimensions };
}

/** LinkedIn heuristic scorer — role-aware but cluster-agnostic */
export function scoreLinkedIn(
  linkedinText: string,
  roleConfig: RoleConfig,
): { score: number; improvements: string[] } {
  if (!linkedinText?.trim()) return { score: 0, improvements: [] };

  const lower = linkedinText.toLowerCase();
  const kp = roleConfig.keyword_profile;
  let score = 48;

  // Length signal
  if (linkedinText.length > 1200) score += 14;
  else if (linkedinText.length > 500) score += 7;

  // Must-have keyword hits
  const mustHits = kp.must_have.filter(k => lower.includes(k.toLowerCase().split(' or ')[0])).length;
  score += Math.min(mustHits * 5, 18);

  // Quantitative impact signal
  const hasImpact = /\d+%|increased|decreased|reduced|improved|revenue|shipped|launched/.test(lower);
  if (hasImpact) score += 8;

  // Storytelling markers
  const hasStory = /passionate|led|built|spearheaded|founded|scaled|solving/.test(lower);
  if (hasStory) score += 6;

  const improvements: string[] = [];
  if (!hasImpact) improvements.push('Add quantifiable impact metrics (%, revenue, user counts) to each role description.');
  if (!hasStory) improvements.push('Use active verbs (led, built, scaled, shipped) to tell a stronger narrative.');
  if (linkedinText.length < 500) improvements.push('Expand your About section and job descriptions to improve keyword depth.');

  const fallbacks = [
    `Add role-specific keywords to your headline: ${kp.must_have.slice(0,3).join(', ')}.`,
    'Ensure your current title matches your target role for recruiter search matching.',
    'List tools and technologies explicitly — recruiters filter by stack.',
    'Include links to GitHub, portfolio, or published work.',
    'Convert paragraph descriptions into bullet points for faster recruiter scanning.',
  ];
  for (const f of fallbacks) {
    if (improvements.length >= 5) break;
    if (!improvements.includes(f)) improvements.push(f);
  }

  return { score: Math.min(98, Math.max(28, score)), improvements: improvements.slice(0, 5) };
}
