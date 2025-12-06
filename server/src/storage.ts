import { JobRecord, NormalizedJobInput } from './types';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

class InMemoryStore {
  jobs: Map<string, JobRecord> = new Map();
  bySourceId: Map<string, string> = new Map();
  byHash: Map<string, string> = new Map();
  cache: Map<string, { jobIds: string[]; expiresAt: number }> = new Map();

  upsert(job: NormalizedJobInput): JobRecord {
    const key = job.source + ':' + (job.source_job_id || '');
    const hash = this.computeHash(job);
    let id = this.bySourceId.get(key) || this.byHash.get(hash);
    const now = dayjs().toISOString();
    if (id && this.jobs.has(id)) {
      const existing = this.jobs.get(id)!;
      const updated: JobRecord = {
        ...existing,
        title: job.title,
        company: job.company,
        location_city: job.location_city,
        location_region: job.location_region,
        location_country: job.location_country,
        remote: job.remote,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_currency: job.salary_currency,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        apply_url: job.apply_url,
        posted_at: job.posted_at,
        updated_at: now,
        hash,
      };
      this.jobs.set(id, updated);
      return updated;
    }
    id = randomUUID();
    const rec: JobRecord = {
      id,
      source: job.source,
      source_job_id: job.source_job_id,
      title: job.title,
      company: job.company,
      location_city: job.location_city,
      location_region: job.location_region,
      location_country: job.location_country,
      remote: job.remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: job.salary_currency,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      apply_url: job.apply_url,
      posted_at: job.posted_at,
      discovered_at: now,
      hash,
      created_at: now,
      updated_at: now,
    };
    this.jobs.set(id, rec);
    if (job.source_job_id) this.bySourceId.set(key, id);
    this.byHash.set(hash, id);
    return rec;
  }

  computeHash(job: NormalizedJobInput): string {
    const base = [job.title, job.company, job.location_city, job.location_region, job.location_country, job.apply_url]
      .map(v => (v || '').toLowerCase().trim())
      .join('|');
    let h = 0;
    for (let i = 0; i < base.length; i++) h = (h << 5) - h + base.charCodeAt(i);
    return String(h);
  }

  query(limit = 1000): JobRecord[] {
    return Array.from(this.jobs.values()).slice(0, limit);
  }

  queryRecent(days = 30, limit = 5000): JobRecord[] {
    const cutoff = dayjs().subtract(days, 'day');
    const arr = Array.from(this.jobs.values()).filter(j => dayjs(j.posted_at).isAfter(cutoff));
    return arr.slice(0, limit);
  }

  cacheSet(key: string, jobIds: string[], ttlDays = 30): void {
    const expiresAt = dayjs().add(ttlDays, 'day').valueOf();
    this.cache.set(key, { jobIds, expiresAt });
  }

  cacheGet(key: string): string[] | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.jobIds;
  }

  purgeOldJobs(days = 30): number {
    const cutoff = dayjs().subtract(days, 'day');
    let removed = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (dayjs(job.posted_at).isBefore(cutoff)) {
        this.jobs.delete(id);
        removed++;
      }
    }
    for (const [key, v] of this.cache.entries()) {
      if (Date.now() > v.expiresAt) this.cache.delete(key);
    }
    return removed;
  }
}

export const store = new InMemoryStore();