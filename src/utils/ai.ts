// AI/ML Service — taxonomy-aware profile extraction, rubric scoring, and mock fallbacks.
// Keyword profiles, weights, and evaluation models are NEVER surfaced to the UI or returned in API responses.

import type { RoleConfig } from './taxonomy';
import { evaluateHeuristic, scoreLinkedIn, type StructuredProfile, type DimensionScore } from './scoring';

export interface ApiKeys {
  provider?: 'openai' | 'gemini' | 'groq' | 'cerebras';
  openaiKey?: string;
  geminiKey?: string;
  groqKey?: string;
  cerebrasKey?: string;
  openaiModel?: string;
  geminiModel?: string;
  groqModel?: string;
  cerebrasModel?: string;
}

export interface DimensionFeedback {
  label: string;           // matches rubric item
  score: number;           // 0–100
  originalPoint: string;   // exact point/phrase from resume with gap
  gap: string;             // gap identified
  whyItMatters: string;    // hiring context
  tailoredRewrite: string; // tailored rewrite of originalPoint
  priority: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  overallScore: number;
  dimensions: DimensionFeedback[];   // ordered to match cluster rubric
  topWeaknesses: string[];
  topImprovements: string[];
  linkedinAnalysis?: {
    score: number;
    improvements: string[];
    rewrittenHeadline: string;
    rewrittenAbout: string;
  };
  jobMatch?: {
    fitScore: number;
    strongMatches: string[];
    missingSkills: string[];
    riskFactors: string[];
  };
  resumeTailoring: {
    bulletRewrites: { original: string; rewritten: string; explanation: string }[];
    missingKeywords: string[];
    reorderingSuggestions: string[];
    optimizedResume: {
      name: string;
      current_role: string;
      summary: string;
      skills: string[];
      work_experience: { company: string; role: string; duration: string; responsibilities: string[] }[];
      projects: { title: string; description: string; technologies: string[] }[];
    };
  };
}

// ── LLM Callers ──────────────────────────────────────────────────────────────

async function callOpenAI(prompt: string, apiKey: string, model = 'gpt-4o-mini'): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 8192,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0]?.message?.content ?? '';
}

async function callGemini(prompt: string, apiKey: string, model = 'gemini-3.5-flash'): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        responseMimeType: 'application/json', 
        temperature: 0.1,
        maxOutputTokens: 8192
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    console.warn(`⚠️ Gemini generation finished with non-STOP reason: ${candidate.finishReason}. Safety ratings: ${JSON.stringify(candidate.safetyRatings)}`);
  }
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Gemini empty response object:', JSON.stringify(data));
    if (candidate?.finishReason) {
      throw new Error(`Gemini generated no text. Finish reason: ${candidate.finishReason}. Safety ratings: ${JSON.stringify(candidate.safetyRatings)}`);
    }
    throw new Error('Gemini response returned no text parts.');
  }
  return text;
}

async function callGroq(prompt: string, apiKey: string, model = 'llama-3.3-70b-versatile'): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 8192,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0]?.message?.content ?? '';
}

async function callCerebras(prompt: string, apiKey: string, model = 'gpt-oss-120b'): Promise<string> {
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 8192,
    }),
  });
  if (!res.ok) throw new Error(`Cerebras ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0]?.message?.content ?? '';
}

function resolveKeys(keys: ApiKeys): { provider: 'openai' | 'gemini' | 'groq' | 'cerebras'; key: string } | null {
  // If provider is explicitly specified, only use that provider's keys
  if (keys.provider === 'openai') {
    const key = keys.openaiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
    if (key) return { provider: 'openai', key };
    return null;
  }
  if (keys.provider === 'gemini') {
    const key = keys.geminiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (key) return { provider: 'gemini', key };
    return null;
  }
  if (keys.provider === 'groq') {
    const key = keys.groqKey?.trim() || process.env.GROQ_API_KEY?.trim();
    if (key) return { provider: 'groq', key };
    return null;
  }
  if (keys.provider === 'cerebras') {
    const key = keys.cerebrasKey?.trim() || process.env.CEREBRAS_API_KEY?.trim();
    if (key) return { provider: 'cerebras', key };
    return null;
  }

  // Fallbacks if provider is not specified
  const openai = keys.openaiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (openai) return { provider: 'openai', key: openai };

  const gemini = keys.geminiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (gemini) return { provider: 'gemini', key: gemini };

  const groq = keys.groqKey?.trim() || process.env.GROQ_API_KEY?.trim();
  if (groq) return { provider: 'groq', key: groq };

  const cerebras = keys.cerebrasKey?.trim() || process.env.CEREBRAS_API_KEY?.trim();
  if (cerebras) return { provider: 'cerebras', key: cerebras };

  return null;
}

async function callLLM(prompt: string, keys: ApiKeys): Promise<string> {
  const resolved = resolveKeys(keys);
  if (!resolved) throw new Error('No API key available');
  
  if (resolved.provider === 'openai') {
    return callOpenAI(prompt, resolved.key, keys.openaiModel || 'gpt-4o-mini');
  }
  if (resolved.provider === 'gemini') {
    return callGemini(prompt, resolved.key, keys.geminiModel || 'gemini-3.5-flash');
  }
  if (resolved.provider === 'groq') {
    return callGroq(prompt, resolved.key, keys.groqModel || 'llama-3.3-70b-versatile');
  }
  if (resolved.provider === 'cerebras') {
    return callCerebras(prompt, resolved.key, keys.cerebrasModel || 'gpt-oss-120b');
  }
  throw new Error('Unsupported provider');
}

function extractJsonString(raw: string): string {
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.substring(firstBrace, lastBrace + 1);
  }
  
  return raw.replace(/```json|```/g, '').trim();
}

function repairJson(jsonStr: string): string {
  let str = jsonStr.trim();

  // 1. Fix raw newlines/tabs inside string literals
  let inString = false;
  let escaped = false;
  let fixedStr = '';
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !escaped) {
      inString = !inString;
      fixedStr += char;
    } else if (char === '\\' && !escaped) {
      escaped = true;
      fixedStr += char;
    } else {
      if (inString) {
        if (char === '\n') {
          fixedStr += '\\n';
        } else if (char === '\r') {
          fixedStr += '\\r';
        } else if (char === '\t') {
          fixedStr += '\\t';
        } else {
          fixedStr += char;
        }
      } else {
        fixedStr += char;
      }
      escaped = false;
    }
  }
  str = fixedStr;

  // 2. Count braces and brackets to repair truncation
  inString = false;
  escaped = false;
  const stack: ('{' | '[')[] = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !escaped) {
      inString = !inString;
    } else if (char === '\\' && !escaped) {
      escaped = true;
    } else if (!inString) {
      if (char === '{') {
        stack.push('{');
      } else if (char === '[') {
        stack.push('[');
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
      escaped = false;
    } else {
      escaped = false;
    }
  }

  // If we ended up inside an unclosed string, close it first
  if (inString) {
    if (str.endsWith('\\')) {
      str = str.slice(0, -1);
    }
    str += '"';
  }

  // Close open arrays and objects in reverse order of appearance
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') {
      str += '}';
    } else if (open === '[') {
      str += ']';
    }
  }

  return str;
}

// ── Profile Extraction ────────────────────────────────────────────────────────

export async function extractProfileFromText(text: string, keys: ApiKeys): Promise<StructuredProfile> {
  const isLive = resolveKeys(keys) !== null;
  if (!isLive) return generateMockProfile(text);

  const prompt = `
You are an expert resume parser. Extract a structured JSON profile from this resume.
Output ONLY valid JSON matching this exact schema — no markdown, no explanation:

{
  "name": "",
  "current_role": "",
  "contact_info": {
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "website": ""
  },
  "years_experience": 0,
  "education": [],
  "skills": [],
  "work_experience": [],
  "projects": [],
  "tools_technologies": [],
  "domains": [],
  "certifications": [],
  "awards_achievements": [],
  "languages": [],
  "publications": [],
  "additional_sections": [],
  "sections": [{ "title": "", "content": [], "type": "" }]
}

Rules:
- Only include facts present in the text. Do NOT hallucinate or add any details.
- years_experience should be a number estimating total years of professional experience.
- Keep the fields "education", "work_experience", "projects", "tools_technologies", "domains", "certifications", "awards_achievements", "languages", "publications", and "additional_sections" as empty arrays [] in your JSON.
- CRITICAL VERBATIM SECTIONS RULE: You must divide the entire raw resume text into sequential sections exactly as they appear in the resume from top to bottom. Use the "sections" array for this.
  - "title": The exact, original section title verbatim as written in the resume (e.g. "PROFESSIONAL SUMMARY", "WORK EXPERIENCE", "ACADEMIC BACKGROUND", "KEY PROJECTS", "VOLUNTEER INVOLVEMENT", etc.).
  - "content": An array of strings representing the verbatim content of this section. Every single line, job title, company name, date, and bullet point must be extracted. Bullet points must be kept as separate strings, starting with their original bullet character (like "-", "*", or "•"). Job headers, dates, and plain paragraphs must also be copied verbatim as strings in the correct sequence. Do NOT summarize, shorten, paraphrase, or clean any words or details. Copy everything verbatim.
  - "type": Classify the section type into one of: "summary", "skills", "experience", "projects", "education", "other".
  - Make sure the "sections" array covers the entire resume from top to bottom, in the exact order it is written, without omitting any text or details.
- Strict Schema Compliance: You MUST match the JSON keys exactly as defined in the schema.
- CRITICAL ESCAPING & JSON FORMATTING RULES:
  1. Ensure all backslashes inside JSON string values are properly escaped as double backslashes \\\\ (e.g. "C:\\\\Program Files" or "pattern \\\\w"). A single backslash \\ inside string values is strictly forbidden as it is invalid JSON.
  2. Ensure that any double-quotes occurring inside JSON string values are properly escaped as \\\" (e.g. "He said \\\"Hello\\\"").
  3. Do NOT output raw literal newlines in JSON string values. Use \\n instead.

Resume:
"""
${text.slice(0, 20000)}
"""`.trim();

  try {
    const raw = await callLLM(prompt, keys);
    const clean = extractJsonString(raw);
    let repaired = clean;
    try {
      repaired = repairJson(clean);
      const parsed = JSON.parse(repaired) as StructuredProfile;
      // Ensure all arrays are initialized to avoid undefined errors downstream
      parsed.education = parsed.education || [];
      parsed.skills = parsed.skills || [];
      parsed.work_experience = parsed.work_experience || [];
      parsed.projects = parsed.projects || [];
      parsed.tools_technologies = parsed.tools_technologies || [];
      parsed.domains = parsed.domains || [];
      parsed.sections = parsed.sections || [];
      return parsed;
    } catch (parseErr: any) {
      console.error('Profile extraction JSON parse error:', parseErr.message);
      console.error('Clean response was:', clean);
      console.error('Repaired response was:', repaired);
      console.error('Raw response was:', raw);
      throw new Error(`JSON Parse Error during profile extraction: ${parseErr.message}`);
    }
  } catch (err) {
    if (isLive) {
      console.error('Profile extraction failed:', err);
      throw err;
    }
    return generateMockProfile(text);
  }
}

// ── Main Analysis ─────────────────────────────────────────────────────────────

export async function analyzeProfile(
  profile: StructuredProfile,
  roleConfig: RoleConfig,
  linkedinText: string,
  jobDescription: string,
  keys: ApiKeys,
): Promise<AnalysisResult> {
  const heuristic   = evaluateHeuristic(profile, roleConfig);
  const liHeuristic = linkedinText ? scoreLinkedIn(linkedinText, roleConfig) : null;
  const isLive      = resolveKeys(keys) !== null;

  if (!isLive) {
    return generateMockAnalysis(profile, roleConfig, linkedinText, jobDescription, heuristic, liHeuristic);
  }

  const rubricList = roleConfig.scoring_rubric.map((r, i) => `${i + 1}. "${r}"`).join('\n');

  const prompt = `
You are an elite top-tier tech hiring manager, technical interviewer, and senior recruiter combined.

Evaluate this candidate for the role: **${roleConfig.sub_role_label}** (${roleConfig.cluster_label})

PROFILE:
${JSON.stringify(profile, null, 2)}

${linkedinText ? `LINKEDIN:\n"""\n${linkedinText.slice(0, 10000)}\n"""` : ''}
${jobDescription ? `JOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 10000)}\n"""` : ''}

Score this candidate on EXACTLY these rubric dimensions (in this order):
${rubricList}

Output ONLY valid JSON (no markdown) matching this exact structure:
{
  "dimensions": [
    {
      "label": "<exact rubric label>",
      "score": <0-100>,
      "originalPoint": "<the exact sentence or bullet point from candidate's resume that has this gap/weakness. Must match word-for-word.>",
      "gap": "<the gap identified in this point relative to the rubric dimension>",
      "whyItMatters": "<why recruiters care about this gap>",
      "tailoredRewrite": "<tailored rewrite of originalPoint to address the gap using ONLY actual facts from candidate's experience>",
      "priority": "<High|Medium|Low>"
    }
  ],
  "topWeaknesses": ["<5 specific weaknesses>"],
  "topImprovements": ["<5 specific improvements>"],
  ${linkedinText ? `"linkedinAnalysis": {
    "score": <0-100>,
    "improvements": ["<5 improvements>"],
    "rewrittenHeadline": "<optimized headline>",
    "rewrittenAbout": "<engaging About section>"
  },` : ''}
  ${jobDescription ? `"jobMatch": {
    "fitScore": <0-100>,
    "strongMatches": ["<match areas>"],
    "missingSkills": ["<gaps>"],
    "riskFactors": ["<recruiter red flags>"]
  },` : ''}
  "resumeTailoring": {
    "bulletRewrites": [
      { "original": "<actual bullet>", "rewritten": "<improved version>", "explanation": "<why>" }
    ],
    "missingKeywords": ["<keywords to add>"],
    "reorderingSuggestions": ["<structural suggestions>"],
    "optimizedResume": {
      "name": "<name>",
      "current_role": "<optimized title>",
      "summary": "<3-sentence executive summary>",
      "skills": ["<updated skill list>"]
    }
  }
}

CRITICAL INSTRUCTIONS & GROUNDING RULES:
1. Dimensions array MUST be in the exact same order as the rubric list above.
2. Scores must be realistic and demanding — this is a top-tier tech hiring bar evaluation.
3. Every rewritten bullet, summary, and work experience responsibility must be strictly grounded in the candidate's actual profile.
4. You are allowed to rephrase, reword, reorder, and optimize styling to emphasize keywords.
5. YOU MUST NOT INVENT, HALLUCINATE, OR ADD ANY:
   - Fake companies they did not work for.
   - Fake schools or degrees they did not earn.
   - Fake projects they did not build.
   - Fake achievements, performance metrics, or responsibilities that are not present or implied in the input profile.
   - For example, if they did not work at Google, Meta, or Stripe, do not list those. Keep their real companies.
6. The "optimizedResume" must represent the candidate's real profile, optimized for presentation, NOT a hypothetical ideal candidate.
7. For each dimension, the "originalPoint" property must be a string copied EXACTLY (word-for-word) from the candidate's profile's sections content lines. Do not modify or summarize it. This is critical so that the client UI can locate and highlight this bullet point in the resume. If the candidate's resume lacks a point for this dimension, select the most relevant bullet point they have that could be improved to cover it.
8. Every "original" bullet in the "bulletRewrites" array must be copied EXACTLY word-for-word from the sections content lines in the candidate's profile. Do not abbreviate, modify, or summarize it.
9. CRITICAL ESCAPING & JSON FORMATTING RULES:
   - Ensure all backslashes inside JSON string values are properly escaped as double backslashes \\\\ (e.g. "C:\\\\Program Files" or "pattern \\\\w"). A single backslash \\ inside string values is strictly forbidden as it is invalid JSON.
   - Ensure that any double-quotes occurring inside JSON string values are properly escaped as \\\" (e.g. "He said \\\"Hello\\\"").
   - Do NOT output raw literal newlines in JSON string values. Use \\n instead.
`.trim();

  try {
    const raw = await callLLM(prompt, keys);
    const clean = extractJsonString(raw);
    let ai;
    let repaired = clean;
    try {
      repaired = repairJson(clean);
      ai = JSON.parse(repaired) as Omit<AnalysisResult, 'overallScore'>;
    } catch (parseErr: any) {
      console.error('Profile analysis JSON parse error:', parseErr.message);
      console.error('Clean response was:', clean);
      console.error('Repaired response was:', repaired);
      console.error('Raw response was:', raw);
      throw new Error(`JSON Parse Error during profile analysis: ${parseErr.message}`);
    }

    // Blend LLM + heuristic scores (60/40)
    const blendedDims: DimensionFeedback[] = (ai.dimensions ?? []).map((d, i) => {
      const hScore = heuristic.dimensions[i]?.score ?? d.score;
      return { ...d, score: Math.min(100, Math.round(d.score * 0.6 + hScore * 0.4)) };
    });

    const overallScore = blendedDims.length
      ? Math.round(blendedDims.reduce((a, d) => a + d.score, 0) / blendedDims.length)
      : heuristic.overallScore;

    // Blend LinkedIn
    if (ai.linkedinAnalysis && liHeuristic) {
      ai.linkedinAnalysis.score = Math.round(ai.linkedinAnalysis.score * 0.6 + liHeuristic.score * 0.4);
      ai.linkedinAnalysis.improvements = Array.from(new Set([
        ...ai.linkedinAnalysis.improvements,
        ...liHeuristic.improvements,
      ])).slice(0, 5);
    }

    return { ...ai, overallScore, dimensions: blendedDims };
  } catch (err) {
    if (isLive) {
      console.error('AI Profile analysis failed:', err);
      throw err;
    }
    return generateMockAnalysis(profile, roleConfig, linkedinText, jobDescription, heuristic, liHeuristic);
  }
}

// ── Mock Generators ───────────────────────────────────────────────────────────

export function generateMockProfile(text: string): StructuredProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] ?? 'Alex Johnson';

  const knownSkills = [
    'Python', 'JavaScript', 'TypeScript', 'SQL', 'React', 'Node.js', 'Next.js',
    'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Machine Learning',
    'TensorFlow', 'PyTorch', 'A/B Testing', 'Figma', 'dbt', 'Airflow', 'Kafka',
    'Spark', 'MLflow', 'LLM', 'RAG', 'embeddings',
  ];
  const skills = knownSkills.filter(s =>
    new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );
  if (skills.length < 3) skills.push('Python', 'SQL', 'Git');

  const knownCompanies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Stripe',
    'Airbnb', 'Uber', 'Netflix', 'OpenAI', 'Anthropic', 'Databricks'];
  const companies = knownCompanies.filter(c => new RegExp(`\\b${c}\\b`, 'i').test(text));

  const workExp = companies.length
    ? companies.slice(0, 2).map((company, i) => ({
        company,
        role: i === 0 ? 'Senior Engineer' : 'Software Engineer',
        duration: i === 0 ? '2023 – Present' : '2021 – 2023',
        responsibilities: [
          'Designed and implemented scalable systems serving millions of users.',
          'Collaborated cross-functionally to deliver high-impact product features.',
          'Improved system performance by 30% through optimization of data pipelines.',
        ],
        impact_metrics: ['30% performance improvement', 'Served 5M+ users'],
      }))
    : [{
        company: 'Tech Company',
        role: 'Software Engineer',
        duration: '2022 – Present',
        responsibilities: [
          'Built and maintained production APIs handling 50k+ daily requests.',
          'Led migration of monolithic services to microservices architecture.',
          'Reduced deployment cycle time by 40% via CI/CD automation.',
        ],
        impact_metrics: ['50k+ daily requests', '40% faster deployments'],
      }];

  return {
    name,
    current_role: workExp[0].role,
    contact_info: {
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
      website: 'alexjohnson.dev'
    },
    years_experience: workExp.length * 2 + 1,
    education: [{ degree: 'BS', field: 'Computer Science', school: 'State University', year: '2021' }],
    skills,
    work_experience: workExp,
    projects: [{
      title: 'Open Source Contribution',
      description: 'Contributed performance improvements to a popular data processing library.',
      technologies: skills.slice(0, 3),
    }],
    tools_technologies: skills.slice(0, 6),
    domains: ['Software Engineering', 'Distributed Systems'],
    certifications: ['AWS Certified Solutions Architect - Associate', 'Google Cloud Certified Professional'],
    awards_achievements: ['1st Place - Tech Hackathon 2023', 'Engineering Achievement Award 2022'],
    languages: ['English (Native)', 'Spanish (Conversational)'],
    additional_sections: [
      {
        title: 'Volunteering',
        content: ['Volunteer Mentor at local code camps, introducing Python to high schoolers.']
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
        title: 'Core Skills',
        type: 'skills',
        content: [
          'Languages: Python, TypeScript, React, SQL',
          'Tools: Docker, Redis, Kubernetes, AWS'
        ]
      },
      {
        title: 'Experience',
        type: 'experience',
        content: workExp.flatMap(w => [
          `${w.company} - ${w.role} (${w.duration})`,
          ...w.responsibilities.map(r => `• ${r}`)
        ])
      },
      {
        title: 'Projects',
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
          'State University - BS in Computer Science (2021)'
        ]
      },
      {
        title: 'Certifications',
        type: 'other',
        content: [
          'AWS Certified Solutions Architect - Associate',
          'Google Cloud Certified Professional'
        ]
      }
    ]
  };
}

export function generateMockAnalysis(
  profile: StructuredProfile,
  roleConfig: RoleConfig,
  linkedinText: string,
  jobDescription: string,
  heuristic: { overallScore: number; dimensions: DimensionScore[] },
  liHeuristic: { score: number; improvements: string[] } | null,
): AnalysisResult {
  const { scoring_rubric, sub_role_label, keyword_profile } = roleConfig;

  // Priority cycling for variety
  const priorities: ('High' | 'Medium' | 'Low')[] = ['High', 'High', 'Medium', 'Medium', 'Low'];

  const dimensions: DimensionFeedback[] = scoring_rubric.map((label, i) => {
    const dim = heuristic.dimensions[i] ?? { label, score: 62 };
    const score = dim.score;
    const priority = priorities[i % priorities.length];

    const firstBullet = profile.work_experience[0]?.responsibilities[0] ?? 'Designed and built systems at scale.';
    const secondBullet = profile.work_experience[0]?.responsibilities[1] ?? 'Collaborated cross-functionally.';

    const genericFeedback = [
      {
        originalPoint: firstBullet,
        gap: `Insufficient evidence of explicit metric tracking for ${label.toLowerCase()} on this point.`,
        whyItMatters: `Recruiters for ${sub_role_label} roles specifically probe for ${label.toLowerCase()} and key metrics during initial screening.`,
        tailoredRewrite: `${firstBullet.replace(/\.$/, '')}, demonstrating strong ${label.toLowerCase()} which improved system throughput by 30%.`,
      },
      {
        originalPoint: secondBullet,
        gap: `Bullets describe tasks but lack the outcome-oriented depth expected for top-tier ${label.toLowerCase()} benchmarks.`,
        whyItMatters: `Top-tier companies assess ${label.toLowerCase()} through engineering outcomes; task-only bullets are often filtered out.`,
        tailoredRewrite: `${secondBullet.replace(/\.$/, '')}, directly addressing ${label.toLowerCase()} needs and reducing latency by 45%.`,
      },
    ];

    const fb = genericFeedback[i % genericFeedback.length];
    return { label, score, priority, ...fb };
  });

  const topWeaknesses = dimensions
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(d => `${d.label}: ${d.gap}`);

  const topImprovements = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(d => `${d.label}: Update to '${d.tailoredRewrite}'`);

  const linkedinAnalysis = linkedinText ? {
    score: liHeuristic?.score ?? 68,
    improvements: liHeuristic?.improvements ?? [
      'Add role-specific keywords in your headline.',
      'Quantify achievements with numbers and percentages.',
      'Expand your About section with a clear narrative arc.',
      'List tools and technologies your target roles require.',
      'Include links to portfolio, GitHub, or published work.',
    ],
    rewrittenHeadline: `${profile.name} | ${sub_role_label} | ${keyword_profile.must_have.slice(0, 3).join(' · ')}`,
    rewrittenAbout: `${sub_role_label} with ${profile.years_experience}+ years building high-impact systems. I specialize in ${keyword_profile.must_have.slice(0, 4).join(', ')} — translating complex technical work into measurable business outcomes.\n\nCurrently: ${profile.current_role} at ${profile.work_experience[0]?.company ?? 'a leading tech company'}. Previously shipped products used by millions.\n\nSkills: ${profile.skills.slice(0, 8).join(', ')}`,
  } : undefined;

  const jobMatch = jobDescription ? {
    fitScore: Math.min(92, heuristic.overallScore + 8),
    strongMatches: [
      `Core skills align: ${profile.skills.slice(0, 4).join(', ')}`,
      `${profile.years_experience} years of relevant experience maps to role requirements`,
    ],
    missingSkills: keyword_profile.missing_penalty_keywords.slice(0, 3),
    riskFactors: [
      'Resume bullets are task-focused — add outcome metrics to stand out.',
      `Missing explicit mention of: ${keyword_profile.must_have.slice(0, 2).join(', ')}`,
    ],
  } : undefined;

  const firstRole = profile.work_experience[0];
  const firstBullet = firstRole?.responsibilities[0] ?? 'Contributed to core product features.';

  return {
    overallScore: heuristic.overallScore,
    dimensions: scoring_rubric.map((label, i) => dimensions[i] ?? { label, score: 60, originalPoint: '', gap: '', whyItMatters: '', tailoredRewrite: '', priority: 'Medium' }),
    topWeaknesses,
    topImprovements,
    linkedinAnalysis,
    jobMatch,
    resumeTailoring: {
      bulletRewrites: [
        {
          original: firstBullet,
          rewritten: `${firstBullet.replace(/\.$/, '')} — resulting in measurable improvements to team velocity and system reliability.`,
          explanation: 'Adding outcome context transforms a task description into an achievement statement.',
        },
        {
          original: firstRole?.responsibilities[1] ?? 'Worked with the team on various projects.',
          rewritten: `Led cross-functional initiative that ${roleConfig.job_matching_config.boost_signals?.[0] ?? 'delivered measurable business impact'} — reducing time-to-market by 25%.`,
          explanation: 'Specificity and numbers make recruiters stop scrolling.',
        },
      ],
      missingKeywords: keyword_profile.must_have.filter(k =>
        !profile.skills.some(s => s.toLowerCase().includes(k.toLowerCase()))
      ).slice(0, 6),
      reorderingSuggestions: [
        'Move Skills section directly below Summary for fast recruiter parsing.',
        'Lead each bullet with an active verb (Built, Designed, Reduced, Shipped).',
        'Place most impactful metrics in the first 2 lines of each role.',
      ],
      optimizedResume: {
        name: profile.name,
        current_role: sub_role_label,
        summary: `${sub_role_label} with ${profile.years_experience}+ years of experience building ${keyword_profile.must_have.slice(0,3).join(', ')}-powered systems at scale. Proven track record of shipping high-impact work and driving measurable outcomes across ${profile.domains.slice(0,2).join(' and ')}.`,
        skills: [...new Set([...profile.skills, ...keyword_profile.preferred.slice(0, 4)])],
        work_experience: profile.work_experience.map((w, i) => ({
          company: w.company,
          role: i === 0 ? sub_role_label : w.role,
          duration: w.duration,
          responsibilities: w.responsibilities.map(r =>
            r.endsWith('.') ? r : r + '.'
          ),
        })),
        projects: profile.projects.map(p => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies ?? [],
        })),
      },
    },
  };
}
