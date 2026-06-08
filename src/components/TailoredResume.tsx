import React, { useState } from 'react';
import { Copy, FileText, Printer, Check, Code, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface StructuredProfile {
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
  tools_technologies?: string[];
  domains?: string[];
  certifications?: string[];
  awards_achievements?: string[];
  languages?: string[];
  publications?: string[];
  additional_sections?: { title: string; content: string[] }[];
  summary?: string;
  sections?: { title: string; content: string[]; type: string }[];
}

interface DimensionFeedback {
  label: string;
  score: number;
  originalPoint: string;
  gap: string;
  whyItMatters: string;
  tailoredRewrite: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface AnalysisResult {
  dimensions: DimensionFeedback[];
  resumeTailoring: {
    bulletRewrites: { original: string; rewritten: string; explanation: string }[];
    missingKeywords: string[];
    reorderingSuggestions: string[];
    optimizedResume?: {
      name?: string;
      current_role?: string;
      summary?: string;
      skills?: string[];
      work_experience?: { company: string; role: string; duration: string; responsibilities: string[] }[];
      projects?: { title: string; description: string; technologies: string[] }[];
    };
  };
}

interface TailoredResumeProps {
  profile: StructuredProfile;
  analysis: AnalysisResult;
}

const normalizeStr = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

export default function TailoredResume({ profile, analysis }: TailoredResumeProps) {
  const [viewMode, setViewMode] = useState<'sheet' | 'markdown'>('sheet');
  const [isCopied, setIsCopied] = useState(false);
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});

  // Unified rewrite reconstruction mapping
  const getRebuiltResume = () => {
    const normalizedRewriteMap = new Map<string, { original: string; rewritten: string; explanation?: string }>();

    // 1. Gather from dimension feedback
    analysis.dimensions?.forEach(d => {
      if (d.originalPoint && d.tailoredRewrite) {
        const key = normalizeStr(d.originalPoint);
        normalizedRewriteMap.set(key, {
          original: d.originalPoint,
          rewritten: d.tailoredRewrite,
          explanation: `Rubric: ${d.label}. ${d.gap}`
        });
      }
    });

    // 2. Gather from dedicated bullet rewrites (which may overwrite dimensions with more specific explanations)
    analysis.resumeTailoring?.bulletRewrites?.forEach(bw => {
      if (bw.original && bw.rewritten) {
        const key = normalizeStr(bw.original);
        normalizedRewriteMap.set(key, {
          original: bw.original,
          rewritten: bw.rewritten,
          explanation: bw.explanation
        });
      }
    });

    // Reconstruct sections in exact order they appear in profile.sections
    const rebuiltSections = (profile.sections || []).map(sec => {
      const content = (sec.content || []).map(item => {
        // Check if this string looks like a bullet point
        const bulletRegex = /^[\s]*[•\-*▸o+]/;
        const isBullet = bulletRegex.test(item);
        const cleanText = item.replace(bulletRegex, '').trim();

        const key = normalizeStr(cleanText);
        const match = normalizedRewriteMap.get(key);

        return {
          original: item,
          cleanOriginal: cleanText,
          rewritten: match ? (item.match(bulletRegex)?.[0] || '•') + ' ' + match.rewritten : item,
          isAltered: !!match,
          explanation: match?.explanation,
          isBullet
        };
      });

      return {
        title: sec.title,
        type: sec.type,
        content
      };
    });

    return {
      name: profile.name,
      current_role: analysis.resumeTailoring?.optimizedResume?.current_role || profile.current_role,
      contact_info: profile.contact_info,
      sections: rebuiltSections
    };
  };

  const resumeData = getRebuiltResume();

  // Generate markdown string for copying
  const generateMarkdown = () => {
    let md = `# ${resumeData.name}\n`;
    md += `**${resumeData.current_role}**\n\n`;

    if (resumeData.contact_info) {
      const infoList = [];
      if (resumeData.contact_info.email) infoList.push(resumeData.contact_info.email);
      if (resumeData.contact_info.phone) infoList.push(resumeData.contact_info.phone);
      if (resumeData.contact_info.location) infoList.push(resumeData.contact_info.location);
      if (resumeData.contact_info.linkedin) infoList.push(resumeData.contact_info.linkedin);
      if (resumeData.contact_info.github) infoList.push(resumeData.contact_info.github);
      if (resumeData.contact_info.website) infoList.push(resumeData.contact_info.website);
      if (infoList.length > 0) {
        md += `${infoList.join(' | ')}\n\n`;
      }
    }
    
    resumeData.sections?.forEach(sec => {
      md += `## ${sec.title}\n`;
      sec.content?.forEach(item => {
        if (item.isBullet) {
          md += `- ${item.rewritten.replace(/^[\s]*[•\-*▸o+]/, '').trim()}\n`;
        } else {
          md += `${item.original}\n`;
        }
      });
      md += `\n`;
    });

    return md;
  };

  const handleCopy = () => {
    const text = generateMarkdown();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleDiff = (key: string) => {
    setExpandedDiffs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Controls - Hide on print */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 p-4 border border-zinc-800 rounded-2xl no-print">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-violet" />
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Optimized Resume Draft</h4>
            <p className="text-xs text-zinc-500">Matched 1:1 with original layout structure, styling, and verbatim sections.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Mode Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'sheet'
                  ? 'bg-zinc-850 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Resume Sheet
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'markdown'
                  ? 'bg-zinc-850 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Markdown
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-medium transition-all"
            title="Copy as Markdown"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Copied' : 'Copy MD'}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-brand-violet/10"
            title="Print Resume"
          >
            <Printer className="w-3.5 h-3.5" />
            Print/PDF
          </button>
        </div>
      </div>

      {/* Sheet View (A4 Mimic) */}
      {viewMode === 'sheet' ? (
        <div 
          id="print-resume-sheet"
          className="mx-auto w-full max-w-[800px] glass-panel border-zinc-800 rounded-2xl p-8 sm:p-12 shadow-2xl glass-panel-glow text-zinc-300 select-text 
                     print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:bg-white print:text-black"
        >
          {/* Header */}
          <div className="text-center border-b border-zinc-800 print:border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-white print:text-black mb-1">
              {resumeData.name}
            </h1>
            <p className="text-brand-cyan print:text-indigo-700 font-semibold tracking-wide text-sm uppercase">
              {resumeData.current_role}
            </p>
            {/* Contact Details */}
            {resumeData.contact_info && (
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-zinc-400 print:text-gray-600 mt-2 font-sans font-medium">
                {resumeData.contact_info.email && (
                  <span>{resumeData.contact_info.email}</span>
                )}
                {resumeData.contact_info.phone && (
                  <>
                    <span className="text-zinc-700 print:text-gray-400 select-none">•</span>
                    <span>{resumeData.contact_info.phone}</span>
                  </>
                )}
                {resumeData.contact_info.location && (
                  <>
                    <span className="text-zinc-700 print:text-gray-400 select-none">•</span>
                    <span>{resumeData.contact_info.location}</span>
                  </>
                )}
                {resumeData.contact_info.linkedin && (
                  <>
                    <span className="text-zinc-700 print:text-gray-400 select-none">•</span>
                    <span>{resumeData.contact_info.linkedin}</span>
                  </>
                )}
                {resumeData.contact_info.github && (
                  <>
                    <span className="text-zinc-700 print:text-gray-400 select-none">•</span>
                    <span>{resumeData.contact_info.github}</span>
                  </>
                )}
                {resumeData.contact_info.website && (
                  <>
                    <span className="text-zinc-700 print:text-gray-400 select-none">•</span>
                    <span>{resumeData.contact_info.website}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="space-y-6 text-sm leading-relaxed">
            {resumeData.sections?.map((sec, sIdx) => {
              if (!sec.content || sec.content.length === 0) return null;
              
              return (
                <div key={sIdx} className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-violet print:text-black border-b border-zinc-800 print:border-gray-200 pb-1 mb-2">
                    {sec.title}
                  </h2>
                  
                  <div className="space-y-2">
                    {sec.content.map((item, iIdx) => {
                      const uniqueKey = `sec-${sIdx}-${iIdx}`;
                      
                      if (item.isBullet) {
                        const bulletRegex = /^[\s]*[•\-*▸o+]/;
                        const originalPrefix = item.original.match(bulletRegex)?.[0] || '•';
                        
                        if (item.isAltered) {
                          const rewrittenClean = item.rewritten.replace(bulletRegex, '').trim();
                          
                          return (
                            <div key={iIdx} className="group relative">
                              <div className="flex items-start gap-1">
                                <span className="text-emerald-400 print:text-black select-none mr-2 mt-2 print:mt-0.5">{originalPrefix}</span>
                                <div className="flex-1 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 rounded-xl p-3.5 my-0.5 text-zinc-100 print:bg-transparent print:border-none print:p-0 print:m-0 print:text-black">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-medium text-emerald-200 print:text-gray-800 leading-relaxed">
                                      {rewrittenClean}
                                    </span>
                                    <span className="no-print shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 select-none">
                                      <Sparkles className="w-2.5 h-2.5" /> Tailored
                                    </span>
                                  </div>
                                  
                                  {item.explanation && (
                                    <p className="no-print text-[10px] text-zinc-400 mt-2 font-sans flex items-start gap-1">
                                      <HelpCircle className="w-3.5 h-3.5 text-emerald-500/80 mt-0.5 shrink-0" />
                                      <span>
                                        <span className="font-semibold text-emerald-400">Context:</span> {item.explanation}
                                      </span>
                                    </p>
                                  )}
                                  
                                  <div className="no-print mt-3 pt-2 border-t border-emerald-500/10 text-xs">
                                    <button 
                                      onClick={() => toggleDiff(uniqueKey)} 
                                      className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold hover:text-zinc-400 uppercase tracking-wider"
                                    >
                                      {expandedDiffs[uniqueKey] ? 'Hide Original Point' : 'View Original Point'}
                                    </button>
                                    {expandedDiffs[uniqueKey] && (
                                      <p className="mt-1.5 italic text-[11px] text-zinc-400 bg-black/25 rounded p-2.5 border border-zinc-800 leading-relaxed">
                                        "{item.cleanOriginal}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={iIdx} className="flex items-start gap-1">
                              <span className="text-zinc-500 print:text-black select-none mr-2 mt-0.5">{originalPrefix}</span>
                              <span className="text-zinc-355 print:text-gray-800 leading-relaxed">
                                {item.cleanOriginal}
                              </span>
                            </div>
                          );
                        }
                      } else {
                        const isHeaderLike = /-|–|present|20\d\d/i.test(item.original) || item.original.length < 100;
                        return (
                          <div key={iIdx} className={`text-zinc-100 print:text-gray-900 leading-relaxed ${isHeaderLike ? 'font-bold text-sm mt-3 first:mt-0' : 'text-zinc-300 print:text-gray-800 text-[13px]'}`}>
                            {item.original}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Raw Markdown View */
        <div className="w-full max-w-[800px] mx-auto glass-panel border-zinc-800 rounded-2xl p-6 bg-zinc-950/60 font-mono text-zinc-300 text-sm">
          <pre className="whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-4 select-all">
            {generateMarkdown()}
          </pre>
        </div>
      )}
    </div>
  );
}
