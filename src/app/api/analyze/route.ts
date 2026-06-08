import { NextRequest, NextResponse } from 'next/server';
import { buildRoleConfig } from '@/utils/taxonomy';
import { extractProfileFromText, analyzeProfile } from '@/utils/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeText,
      structuredProfile: clientProfile,
      linkedinText,
      jobDescription,
      clusterId,
      subRoleId,
      keys,
    } = body;

    if (!clusterId || !subRoleId) {
      return NextResponse.json(
        { error: 'clusterId and subRoleId are required.' },
        { status: 400 },
      );
    }

    let roleConfig;
    try {
      roleConfig = buildRoleConfig(clusterId, subRoleId);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    let structuredProfile = clientProfile;

    if (!structuredProfile) {
      if (!resumeText?.trim()) {
        return NextResponse.json(
          { error: 'Either resumeText or structuredProfile must be provided.' },
          { status: 400 },
        );
      }
      structuredProfile = await extractProfileFromText(resumeText, keys ?? {});
    }

    const analysis = await analyzeProfile(
      structuredProfile,
      roleConfig,
      linkedinText ?? '',
      jobDescription ?? '',
      keys ?? {},
    );

    return NextResponse.json({ structuredProfile, analysis, roleConfig: {
      sub_role_label: roleConfig.sub_role_label,
      cluster_label: roleConfig.cluster_label,
      scoring_rubric: roleConfig.scoring_rubric,
    }});
  } catch (err: any) {
    console.error('Analyze route error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Analysis pipeline failed.' },
      { status: 500 },
    );
  }
}
