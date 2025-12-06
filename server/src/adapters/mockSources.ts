import { NormalizedJobInput, SearchCriteria } from '../types';
import dayjs from 'dayjs';

function gen(company: string, title: string, location: string, count: number, source: string): NormalizedJobInput[] {
  const out: NormalizedJobInput[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      source,
      source_job_id: `${company}-${title}-${i}`,
      title: `${title} ${i}`,
      company,
      location_city: location,
      remote: Math.random() > 0.5,
      salary_min: 80000 + Math.floor(Math.random() * 40000),
      salary_max: 120000 + Math.floor(Math.random() * 60000),
      salary_currency: 'USD',
      description: 'Job description',
      requirements: ['React', 'TypeScript', 'Node.js'],
      benefits: ['Health', 'PTO'],
      apply_url: 'https://example.com/apply',
      posted_at: dayjs().subtract(Math.floor(Math.random() * 29), 'day').toISOString(),
    });
  }
  return out;
}

export const GreenhouseAdapter = {
  name: 'greenhouse',
  async fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]> {
    const q = criteria.query || 'Developer';
    const loc = criteria.location || 'Remote';
    return gen('CompanyA', q, loc, 800, 'greenhouse');
  },
};

export const LeverAdapter = {
  name: 'lever',
  async fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]> {
    const q = criteria.query || 'Engineer';
    const loc = criteria.location || 'Remote';
    return gen('CompanyB', q, loc, 700, 'lever');
  },
};

export const SmartRecruitersAdapter = {
  name: 'smartrecruiters',
  async fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]> {
    const q = criteria.query || 'Software';
    const loc = criteria.location || 'Remote';
    return gen('CompanyC', q, loc, 600, 'smartrecruiters');
  },
};

export const WorkdayAdapter = {
  name: 'workday',
  async fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]> {
    const q = criteria.query || 'Developer';
    const loc = criteria.location || 'Remote';
    return gen('CompanyD', q, loc, 900, 'workday');
  },
};

export const AggregatorAdapter = {
  name: 'aggregator',
  async fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]> {
    const q = criteria.query || 'Developer';
    const loc = criteria.location || 'Remote';
    return gen('CompanyE', q, loc, 1000, 'aggregator');
  },
};