import fs from 'fs';
import path from 'path';
import { extractProfileFromText, analyzeProfile, type ApiKeys } from './ai';
import { buildRoleConfig } from './taxonomy';

// ── Simple Env Loader ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPaths = ['.env', '.env.local', '.env.development.local'];
  for (const envPath of envPaths) {
    const fullPath = path.resolve(process.cwd(), envPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
    }
  }
}

// ── Normalized string helper (same as TailoredResume) ─────────────────────────
const normalizeStr = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

// ── Main Execution ────────────────────────────────────────────────────────────
async function run() {
  loadEnv();

  const args = process.argv.slice(2);
  const testCaseArg = args[0];

  let testCase;
  const testCaseFile = path.resolve(process.cwd(), 'test-case.json');

  if (testCaseArg && (testCaseArg.toLowerCase() === 'swapnil' || testCaseArg.toLowerCase() === 'swapnil_ds')) {
    const { staticTestCases } = require('./test-cases');
    testCase = staticTestCases.swapnil_ds;
    console.log(`📦 Loaded static test case: "${testCase.name}"`);
  } else if (testCaseArg) {
    const customPath = path.resolve(process.cwd(), testCaseArg);
    if (fs.existsSync(customPath)) {
      testCase = JSON.parse(fs.readFileSync(customPath, 'utf8'));
      console.log(`📂 Loaded custom test case file: "${testCaseArg}"`);
    } else {
      console.error(`❌ Error: Specified test case file does not exist: ${testCaseArg}`);
      return;
    }
  } else {
    // Create template if it doesn't exist
    if (!fs.existsSync(testCaseFile)) {
      const template = {
        resumeText: "PASTE YOUR ENTIRE ORIGINAL RESUME TEXT HERE",
        jobDescription: "PASTE TARGET JOB DESCRIPTION HERE (Optional)",
        linkedinText: "PASTE LINKEDIN PROFILE TEXT HERE (Optional)",
        clusterId: "swe",
        subRoleId: "backend_engineer"
      };
      fs.writeFileSync(testCaseFile, JSON.stringify(template, null, 2), 'utf8');
      console.log('\n================================================================');
      console.log('📝 Created "test-case.json" template in the root directory.');
      console.log('Please open it, paste your resume/job-description, and rerun:');
      console.log('  npm run test-case');
      console.log('================================================================\n');
      return;
    }
    testCase = JSON.parse(fs.readFileSync(testCaseFile, 'utf8'));
    console.log(`📂 Loaded default testcase file: "test-case.json"`);
  }

  const { resumeText, jobDescription, linkedinText, clusterId, subRoleId } = testCase;

  if (!resumeText || resumeText.startsWith('PASTE YOUR')) {
    console.error('❌ Error: Please populate "resumeText" with actual resume content.');
    return;
  }

  // Bind keys
  const keys: ApiKeys = {
    provider: (process.env.CS_AI_PROVIDER || 'gemini') as any,
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
    groqKey: process.env.GROQ_API_KEY,
    cerebrasKey: process.env.CEREBRAS_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    cerebrasModel: process.env.CEREBRAS_MODEL || 'gpt-oss-120b'
  };

  const hasKey = keys.openaiKey || keys.geminiKey || keys.groqKey || keys.cerebrasKey;
  if (!hasKey) {
    console.log('\n⚠️  No API keys detected in environment or .env files.');
    console.log('We will execute in MOCK mode. To run live LLM inferences, please add:');
    console.log('  GEMINI_API_KEY or OPENAI_API_KEY to your .env or .env.local file.\n');
  } else {
    console.log(`\n🔑 Live API keys detected! Running parser & analysis via provider: ${keys.provider || 'default fallback'}...\n`);
  }

  console.log('⏳ Step 1/3: Extracting structured profile (Verbatim)...');
  const profile = await extractProfileFromText(resumeText, keys);

  console.log('⏳ Step 2/3: Evaluating scoring rubrics and tailoring suggestions...');
  const roleConfig = buildRoleConfig(clusterId || 'swe', subRoleId || 'backend_engineer');
  const analysis = await analyzeProfile(profile, roleConfig, linkedinText || '', jobDescription || '', keys);

  console.log('⏳ Step 3/3: Reconstructing Tailored Resume (100% complete draft)...');

  // programmatically reconstruct tailored resume
  const normalizedRewriteMap = new Map<string, { original: string; rewritten: string; explanation?: string }>();
  analysis.dimensions?.forEach(d => {
    if (d.originalPoint && d.tailoredRewrite) {
      normalizedRewriteMap.set(normalizeStr(d.originalPoint), {
        original: d.originalPoint,
        rewritten: d.tailoredRewrite,
        explanation: `Addresses Dimension: ${d.label}`
      });
    }
  });
  analysis.resumeTailoring?.bulletRewrites?.forEach(bw => {
    if (bw.original && bw.rewritten) {
      normalizedRewriteMap.set(normalizeStr(bw.original), {
        original: bw.original,
        rewritten: bw.rewritten,
        explanation: bw.explanation
      });
    }
  });

  const rebuiltSections = (profile.sections || []).map(sec => {
    const content = (sec.content || []).map(item => {
      const bulletRegex = /^[\s]*[•\-*▸o+]/;
      const isBullet = bulletRegex.test(item);
      const cleanText = item.replace(bulletRegex, '').trim();

      const key = normalizeStr(cleanText);
      const match = normalizedRewriteMap.get(key);

      return {
        original: item,
        rewritten: match ? (item.match(bulletRegex)?.[0] || '•') + ' ' + match.rewritten : item,
        isBullet
      };
    });

    return {
      title: sec.title,
      content
    };
  });

  // Generate markdown output
  let md = `# ${profile.name}\n`;
  md += `**${analysis.resumeTailoring?.optimizedResume?.current_role || profile.current_role}**\n\n`;

  if (profile.contact_info) {
    const infoList = [];
    if (profile.contact_info.email) infoList.push(profile.contact_info.email);
    if (profile.contact_info.phone) infoList.push(profile.contact_info.phone);
    if (profile.contact_info.location) infoList.push(profile.contact_info.location);
    if (profile.contact_info.linkedin) infoList.push(profile.contact_info.linkedin);
    if (profile.contact_info.github) infoList.push(profile.contact_info.github);
    if (profile.contact_info.website) infoList.push(profile.contact_info.website);
    if (infoList.length > 0) md += `${infoList.join(' | ')}\n\n`;
  }

  rebuiltSections.forEach(sec => {
    md += `## ${sec.title}\n`;
    sec.content.forEach(item => {
      if (item.isBullet) {
        md += `- ${item.rewritten.replace(/^[\s]*[•\-*▸o+]/, '').trim()}\n`;
      } else {
        md += `${item.original}\n`;
      }
    });
    md += `\n`;
  });

  // Write outputs
  const outputDir = path.resolve(process.cwd(), 'test-case-output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  fs.writeFileSync(path.join(outputDir, 'extracted-profile.json'), JSON.stringify(profile, null, 2), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'analysis-report.json'), JSON.stringify(analysis, null, 2), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'tailored-resume.md'), md, 'utf8');

  console.log('\n================================================================');
  console.log(`🎉 Test Case Analysis Complete!`);
  console.log(`📊 Overall Score: ${analysis.overallScore}/100`);
  console.log(`📁 Saved files to "test-case-output/" folder:`);
  console.log(`   - extracted-profile.json  (Verbatim profile keys)`);
  console.log(`   - analysis-report.json    (Full rubric audit)`);
  console.log(`   - tailored-resume.md      (100% complete tailored markdown)`);
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('❌ Test Case script failed:', err);
});
