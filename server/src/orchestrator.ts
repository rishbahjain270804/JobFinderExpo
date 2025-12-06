import { SearchCriteria, NormalizedJobInput, UserProfile } from './types';
import { store } from './storage';
import { sortByMatch } from './matcher';
import { GreenhouseAdapter, LeverAdapter, SmartRecruitersAdapter, WorkdayAdapter, AggregatorAdapter } from './adapters/mockSources';

const adapters = [GreenhouseAdapter, LeverAdapter, SmartRecruitersAdapter, WorkdayAdapter, AggregatorAdapter];

export async function ingest(criteria: SearchCriteria): Promise<string[]> {
  const results: NormalizedJobInput[] = [];
  await Promise.all(adapters.map(a => a.fetch(criteria))).then(groups => {
    for (const g of groups) results.push(...g);
  });
  const ids: string[] = [];
  for (const j of results) {
    const rec = store.upsert(j);
    ids.push(rec.id);
  }
  return ids;
}

export function cacheKeyForCriteria(criteria: SearchCriteria): string {
  const base = [criteria.query || '', criteria.location || '', String(!!criteria.remote), criteria.seniority || '', (criteria.tech || []).join(',')].join('|').toLowerCase();
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h << 5) - h + base.charCodeAt(i);
  return 'q:' + String(h);
}

export function cacheKeyForProfile(profile: UserProfile): string {
  const base = [profile.desiredRole || '', profile.location || '', profile.workMode || '', profile.skills || ''].join('|').toLowerCase();
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h << 5) - h + base.charCodeAt(i);
  return 'p:' + String(h);
}

export async function searchAndCache(criteria: SearchCriteria): Promise<string[]> {
  const key = cacheKeyForCriteria(criteria);
  const cached = store.cacheGet(key);
  if (cached) return cached;
  const ids = await ingest(criteria);
  store.cacheSet(key, ids, 30);
  return ids;
}

export async function recommendedForProfile(profile: UserProfile, criteria: SearchCriteria): Promise<string[]> {
  const key = cacheKeyForProfile(profile);
  const cached = store.cacheGet(key);
  if (cached) return cached;
  const ids = await ingest(criteria);
  store.cacheSet(key, ids, 30);
  return ids;
}

export function getRecommendedJobs(profile: UserProfile): any[] {
  const jobs = store.queryRecent(30, 5000);
  return sortByMatch(profile, jobs).slice(0, 2000);
}