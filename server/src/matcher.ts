import { UserProfile } from './types';
import { JobRecord } from './types';

export function calculateMatchScore(profile: UserProfile, job: JobRecord): number {
  let score = 0;
  const reqs = job.requirements || [];
  if (profile.skills) {
    const userSkills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
    const jobRequirements = reqs.map(r => r.toLowerCase());
    let skillMatches = 0;
    for (const skill of userSkills) {
      if (jobRequirements.some(req => req.includes(skill) || skill.includes(req))) skillMatches++;
    }
    const skillScore = Math.min(30, (skillMatches / Math.max(jobRequirements.length, 1)) * 30);
    score += skillScore;
  }
  if (profile.experience) {
    const expMap: Record<string, number> = { '0-2 years': 1, '3-5 years': 2, '6-10 years': 3, '10+ years': 4 };
    const userExp = expMap[profile.experience] || 2;
    const jobExp = expMap[(job as any).experience] || 2;
    const expDiff = Math.abs(userExp - jobExp);
    const expScore = Math.max(0, 20 - expDiff * 7);
    score += expScore;
  }
  if (profile.workMode) {
    const type = job.remote ? 'Remote' : 'Hybrid';
    if (profile.workMode === type) score += 15; else if (profile.workMode === 'Flexible' || type === 'Hybrid') score += 10; else score += 5;
  }
  if (profile.location) {
    const userLoc = profile.location.toLowerCase();
    const jobLoc = (job.location_city || '').toLowerCase();
    if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) score += 15;
    else if (profile.preferredLocation) {
      const prefLoc = profile.preferredLocation.toLowerCase();
      if (jobLoc.includes(prefLoc) || prefLoc.includes(jobLoc)) score += 12;
    }
  } else if (job.remote) {
    score += 15;
  }
  if (profile.desiredRole && job.title) {
    const desiredWords = profile.desiredRole.toLowerCase().split(/\s+/);
    const titleWords = job.title.toLowerCase().split(/\s+/);
    let wordMatches = 0;
    for (const w of desiredWords) {
      if (w.length > 3 && titleWords.some(tw => tw.includes(w) || w.includes(tw))) wordMatches++;
    }
    const roleScore = Math.min(20, (wordMatches / Math.max(desiredWords.length, 1)) * 20);
    score += roleScore;
  }
  return Math.min(100, Math.round(score));
}

export function sortByMatch(profile: UserProfile, jobs: JobRecord[]): JobRecord[] {
  return jobs
    .map(j => ({ job: j, score: calculateMatchScore(profile, j) }))
    .sort((a, b) => b.score - a.score)
    .map(j => j.job);
}