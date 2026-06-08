// Verification script for CareerSignal AI MVP Scoring and Profile Extraction Logic
import { buildRoleConfig } from './taxonomy';
import { generateMockProfile, generateMockAnalysis } from './ai';
import { evaluateHeuristic } from './scoring';

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Verification Tests for CareerSignal AI Logic');
  console.log('----------------------------------------------------');

  // Test 1: Profile Generation from Raw Text
  console.log('\nTesting: Profile Extraction from Raw Resume Text...');
  const sampleResumeText = `
  Jane Doe
  Senior Software Engineer
  San Francisco, CA | jane.doe@email.com
  
  SUMMARY:
  Senior engineer with 5 years experience designing scalable backend APIs and microservices.
  Expertise in Python, TypeScript, React, SQL, and system design.
  
  EXPERIENCE:
  Tech Corp - Senior Software Engineer (2023 - Present)
  - Designed and built a microservices API gateway handling 10k RPS, reducing latency by 35%.
  - Optimized database SQL schemas and Postgres indexes, shaving 1.2s off response times.
  - Refactored frontend using Next.js, and introduced unit testing coverage (Jest) to 85%.
  
  Enterprise LLC - Software Engineer II (2021 - 2023)
  - Developed and launched full stack features using Django and React.
  - Built event processing queue using Redis and celery to optimize background jobs.
  
  EDUCATION:
  BS in Computer Science, State University (2021)
  
  SKILLS:
  Python, JavaScript, TypeScript, Django, React, Next.js, Postgres, Redis, System Design, Jest
  `;

  const profile = generateMockProfile(sampleResumeText);
  console.log('✓ Successfully extracted profile:');
  console.log(`  - Candidate Name: ${profile.name}`);
  console.log(`  - Detected Role: ${profile.current_role}`);
  console.log(`  - Years of Experience: ${profile.years_experience}`);
  console.log(`  - Extracted Skills: [${profile.skills.slice(0, 5).join(', ')}, ...]`);

  // Test 2: Heuristic Scoring Verification for SWE Backend
  console.log('\nTesting: Heuristic Scoring Calculation...');
  
  console.log('\nEvaluating for Software Engineer (SWE - Backend Engineer):');
  const roleConfig = buildRoleConfig('swe', 'backend_engineer');
  const heuristics = evaluateHeuristic(profile, roleConfig);
  console.log(`  - Overall SWE Backend Score: ${heuristics.overallScore}`);
  console.log('  - Dimension Scores:');
  for (const d of heuristics.dimensions) {
    console.log(`    * ${d.label}: ${d.score}/100`);
    if (d.score < 0 || d.score > 100) throw new Error(`Score for ${d.label} out of bounds: ${d.score}`);
  }

  // Test 3: Analysis Pipeline Mock Output Structure
  console.log('\nTesting: Analysis Report Schema Generation...');
  const linkedinText = 'Senior Software Engineer at Tech Corp. Passionate about system design and distributed scaling.';
  const jobDesc = 'Seeking a Senior Backend Engineer to design scalable REST APIs, write tests, and optimize databases.';
  
  const analysis = generateMockAnalysis(profile, roleConfig, linkedinText, jobDesc, heuristics, { score: 80, improvements: [] });
  
  if (!analysis.overallScore || !analysis.dimensions || !analysis.resumeTailoring) {
    throw new Error('Analysis report missing critical properties');
  }

  console.log('✓ Successfully generated mock analysis structures.');
  console.log(`  - LinkedIn Analysis Score: ${analysis.linkedinAnalysis?.score}`);
  console.log(`  - Job Match Fit Score: ${analysis.jobMatch?.fitScore}%`);
  console.log(`  - Bullet Rewrites Count: ${analysis.resumeTailoring.bulletRewrites.length}`);
  console.log(`  - Optimized Resume Name: ${analysis.resumeTailoring.optimizedResume.name}`);
  
  console.log('\n----------------------------------------------------');
  console.log('🎉 All verification tests PASSED successfully!');
  console.log('----------------------------------------------------');
}

runTests().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
