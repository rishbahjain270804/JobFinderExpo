export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface UserProfile {
  name?: string;
  purpose?: string;
  currentRole?: string;
  desiredRole?: string;
  experience?: string;
  location?: string;
  workMode?: string;
  preferredLocation?: string;
  skills?: string;
  salary?: string;
  availability?: string;
  education?: string;
  linkedin?: string;
}

export interface JobRecord {
  id: string;
  source: string;
  source_job_id?: string;
  title: string;
  company: string;
  location_city?: string;
  location_region?: string;
  location_country?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  apply_url?: string;
  posted_at: string;
  discovered_at: string;
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface NormalizedJobInput {
  source: string;
  source_job_id?: string;
  title: string;
  company: string;
  location_city?: string;
  location_region?: string;
  location_country?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  apply_url?: string;
  posted_at: string;
}

export interface SearchCriteria {
  query?: string;
  location?: string;
  remote?: boolean;
  seniority?: string;
  tech?: string[];
}