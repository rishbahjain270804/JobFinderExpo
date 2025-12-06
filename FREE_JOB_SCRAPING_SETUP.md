# 🆓 Free Real-Time Job Scraping Setup Guide

## Overview
This guide shows you how to replace hardcoded job data with **free** real-time job scraping.

---

## 📊 Free Options Comparison

| Service | Free Tier | Data Quality | Setup Time | Best For |
|---------|-----------|--------------|------------|----------|
| **Adzuna API** ⭐ | 1000 calls/month | ⭐⭐⭐⭐⭐ | 5 min | **BEST CHOICE** |
| JSearch (RapidAPI) | 250 calls/month | ⭐⭐⭐⭐ | 10 min | Multiple sources |
| GitHub Jobs | Unlimited | ⭐⭐⭐ | 2 min | Tech jobs only |
| Web Scraping | Unlimited | ⭐⭐⭐⭐ | 1-2 hours | Maximum control |

---

## 🎯 Recommended: Adzuna API Setup (5 Minutes)

### Step 1: Get Free API Key

1. Go to: https://developer.adzuna.com/signup
2. Sign up (no credit card needed)
3. You'll receive:
   - `app_id`
   - `api_key`
4. Free tier: **1000 API calls/month**

### Step 2: Add API Keys to Project

Create a `.env` file:
```bash
# .env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_API_KEY=your_api_key_here
```

Install dotenv:
```bash
npm install react-native-dotenv
npm install --save-dev @types/react-native-dotenv
```

### Step 3: Update TypeScript Config

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["react-native-dotenv"]
  }
}
```

Create `types/env.d.ts`:
```typescript
declare module '@env' {
  export const ADZUNA_APP_ID: string;
  export const ADZUNA_API_KEY: string;
}
```

### Step 4: Update jobMatcher.ts

Replace the entire file with this integration:

```typescript
import {fetchRealTimeJobs, RealTimeJob, getCachedOrFetchJobs} from './realTimeJobScraper';
import {ADZUNA_APP_ID, ADZUNA_API_KEY} from '@env';

export interface UserProfile {
  name: string;
  email: string;
  currentRole?: string;
  desiredRole: string;
  experience: string;
  skills: string;
  workMode: string;
  location?: string;
  preferredLocation?: string;
  // ... other fields
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type: string;
  requirements: string[];
  benefits?: string[];
  workMode: string;
  matchScore?: number;
  matchReasons?: string[];
  applyUrl?: string;
}

/**
 * Convert Adzuna job to our Job interface
 */
function convertRealTimeJob(realTimeJob: RealTimeJob): Job {
  return {
    id: realTimeJob.id,
    title: realTimeJob.title,
    company: realTimeJob.company,
    location: realTimeJob.location,
    description: realTimeJob.description,
    salary: realTimeJob.salary_min && realTimeJob.salary_max
      ? `$${realTimeJob.salary_min.toLocaleString()} - $${realTimeJob.salary_max.toLocaleString()}`
      : 'Competitive',
    type: realTimeJob.contract_type === 'full_time' ? 'Full-time' : 
          realTimeJob.contract_type === 'part_time' ? 'Part-time' : 'Contract',
    requirements: extractRequirements(realTimeJob.description),
    benefits: [],
    workMode: inferWorkMode(realTimeJob.description, realTimeJob.location),
    applyUrl: realTimeJob.redirect_url,
  };
}

/**
 * Extract requirements from job description using keywords
 */
function extractRequirements(description: string): string[] {
  const requirements: string[] = [];
  const commonKeywords = ['react', 'typescript', 'javascript', 'python', 'java', 'node', 
                          'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'api', 'rest',
                          'years experience', 'bachelor', 'degree', 'agile', 'scrum'];
  
  const descLower = description.toLowerCase();
  
  commonKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) {
      requirements.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  return requirements.slice(0, 5); // Limit to 5 requirements
}

/**
 * Infer work mode from description and location
 */
function inferWorkMode(description: string, location: string): string {
  const descLower = description.toLowerCase();
  const locLower = location.toLowerCase();
  
  if (descLower.includes('remote') || locLower.includes('remote')) {
    return 'Remote';
  }
  if (descLower.includes('hybrid')) {
    return 'Hybrid';
  }
  return 'On-site';
}

/**
 * Main function: Match real-time jobs to user profile
 */
export async function matchJobsToProfile(profile: UserProfile): Promise<Job[]> {
  try {
    console.log('Fetching real-time jobs for:', profile.desiredRole);
    
    // Get real-time jobs (with caching to save API calls)
    const realTimeJobs = await getCachedOrFetchJobs(profile);
    
    console.log(`Found ${realTimeJobs.length} real-time jobs`);
    
    // Convert to our Job format
    const jobs = realTimeJobs.map(convertRealTimeJob);
    
    // Calculate match scores
    const scoredJobs = jobs.map(job => {
      const matchScore = calculateMatchScore(profile, job);
      const matchReasons = getMatchReasons(profile, job, matchScore);
      
      return {
        ...job,
        matchScore,
        matchReasons,
      };
    });
    
    // Sort by match score
    return scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
  } catch (error) {
    console.error('Error matching jobs:', error);
    // Fallback to empty array
    return [];
  }
}

/**
 * Calculate match score (0-100)
 */
export function calculateMatchScore(profile: UserProfile, job: Job): number {
  let score = 0;
  
  // 1. Skills matching (30 points max)
  const userSkills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
  const jobRequirements = job.requirements.map(r => r.toLowerCase());
  const jobDescription = job.description.toLowerCase();
  
  let skillMatches = 0;
  userSkills.forEach(skill => {
    if (jobRequirements.some(req => req.includes(skill) || skill.includes(req)) ||
        jobDescription.includes(skill)) {
      skillMatches++;
    }
  });
  
  const skillScore = Math.min(30, (skillMatches / Math.max(userSkills.length, 1)) * 30);
  score += skillScore;
  
  // 2. Experience level (20 points)
  const expMap: {[key: string]: number} = {
    'entry': 1,
    'intermediate': 2,
    'senior': 3,
    'expert': 4,
  };
  
  const userExpLevel = expMap[profile.experience.toLowerCase()] || 2;
  const jobDescLower = job.description.toLowerCase();
  
  let jobExpLevel = 2;
  if (jobDescLower.includes('entry') || jobDescLower.includes('junior')) jobExpLevel = 1;
  if (jobDescLower.includes('senior') || jobDescLower.includes('lead')) jobExpLevel = 3;
  if (jobDescLower.includes('principal') || jobDescLower.includes('staff')) jobExpLevel = 4;
  
  const expDiff = Math.abs(userExpLevel - jobExpLevel);
  const expScore = Math.max(0, 20 - (expDiff * 7));
  score += expScore;
  
  // 3. Work mode preference (15 points)
  const userMode = profile.workMode.toLowerCase();
  const jobMode = job.workMode.toLowerCase();
  
  let workModeScore = 0;
  if (userMode === jobMode) {
    workModeScore = 15;
  } else if ((userMode === 'flexible' || userMode === 'hybrid') || 
             (jobMode === 'flexible' || jobMode === 'hybrid')) {
    workModeScore = 10;
  } else {
    workModeScore = 5;
  }
  score += workModeScore;
  
  // 4. Location matching (15 points)
  let locationScore = 0;
  if (jobMode === 'remote') {
    locationScore = 15;
  } else {
    const userLocation = (profile.location || profile.preferredLocation || '').toLowerCase();
    const jobLocation = job.location.toLowerCase();
    
    if (userLocation && jobLocation.includes(userLocation)) {
      locationScore = 15;
    } else if (userLocation && (profile.preferredLocation || '').toLowerCase().includes(jobLocation)) {
      locationScore = 12;
    } else {
      locationScore = 5;
    }
  }
  score += locationScore;
  
  // 5. Role alignment (20 points)
  const userRole = (profile.desiredRole || profile.currentRole || '').toLowerCase();
  const jobTitle = job.title.toLowerCase();
  
  const roleWords = userRole.split(/\s+/);
  const titleWords = jobTitle.split(/\s+/);
  
  let roleMatches = 0;
  roleWords.forEach(word => {
    if (word.length > 2 && titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
      roleMatches++;
    }
  });
  
  const roleScore = Math.min(20, (roleMatches / Math.max(roleWords.length, 1)) * 20);
  score += roleScore;
  
  return Math.min(100, Math.round(score));
}

/**
 * Generate human-readable match reasons
 */
export function getMatchReasons(profile: UserProfile, job: Job, score: number): string[] {
  const reasons: string[] = [];
  
  // Skills
  const userSkills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
  const matchedSkills = userSkills.filter(skill => 
    job.description.toLowerCase().includes(skill) ||
    job.requirements.some(req => req.toLowerCase().includes(skill))
  );
  
  if (matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length} matching skills: ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  
  // Work mode
  if (profile.workMode.toLowerCase() === job.workMode.toLowerCase()) {
    reasons.push(`${job.workMode} work arrangement matches your preference`);
  }
  
  // Location
  if (job.workMode.toLowerCase() === 'remote') {
    reasons.push('Remote position - work from anywhere');
  }
  
  // Experience
  if (score >= 75) {
    reasons.push('Strong overall fit for your experience level');
  }
  
  return reasons;
}

export function getRecommendationMessage(matchScore: number): string {
  if (matchScore >= 75) {
    return "🎯 Excellent Match! This role aligns perfectly with your profile.";
  } else if (matchScore >= 50) {
    return "✨ Good Match! This could be a great opportunity for you.";
  } else {
    return "💡 Potential Match! Consider if you're interested in growing these skills.";
  }
}
```

### Step 5: Test the Integration

```bash
npm start
```

The app will now fetch real jobs from Adzuna instead of using hardcoded data!

---

## 💰 Making Your Free Tier Last Longer

### Caching Strategy (Included in code above)

The `getCachedOrFetchJobs()` function caches results for 6 hours, extending your 1000 calls to:
- **1000 calls × 4 times per day = 4000 user sessions per month**

### Additional Tips:

1. **Increase cache duration** to 12-24 hours for less active apps
2. **Lazy load** - Only fetch when user navigates to jobs screen
3. **Pagination** - Fetch 20 jobs at a time instead of 100

---

## 🌐 Alternative Free Options

### Option 2: GitHub Jobs API (Unlimited, Tech Only)

```typescript
import {fetchGitHubJobs} from './realTimeJobScraper';

const techJobs = await fetchGitHubJobs('React Developer', 'San Francisco');
```

**Pros:** Completely free, no limit
**Cons:** Tech jobs only, less data

### Option 3: RapidAPI JSearch (250/month)

1. Sign up: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Get API key (free tier: 250 calls/month)
3. Use:

```typescript
import {fetchJSearchJobs} from './realTimeJobScraper';

const jobs = await fetchJSearchJobs(
  'Software Engineer',
  'United States',
  'YOUR_RAPIDAPI_KEY'
);
```

### Option 4: Web Scraping (Unlimited but Requires Backend)

For truly unlimited free data, set up a backend scraper:

#### Quick Backend Setup with Node.js:

```bash
mkdir job-scraper-backend
cd job-scraper-backend
npm init -y
npm install express puppeteer cors
```

```javascript
// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/jobs', async (req, res) => {
  const {query, location} = req.query;
  
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  // Scrape Indeed
  await page.goto(`https://www.indeed.com/jobs?q=${query}&l=${location}`);
  
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.job_seen_beacon')).map(job => ({
      title: job.querySelector('.jobTitle span')?.textContent || '',
      company: job.querySelector('.companyName')?.textContent || '',
      location: job.querySelector('.companyLocation')?.textContent || '',
      description: job.querySelector('.job-snippet')?.textContent || '',
      salary: job.querySelector('.salary-snippet')?.textContent || '',
    }));
  });
  
  await browser.close();
  res.json(jobs);
});

app.listen(3000, () => console.log('Scraper running on http://localhost:3000'));
```

Then update your React Native app to call this backend:

```typescript
const response = await fetch(`http://localhost:3000/api/jobs?query=${profile.desiredRole}&location=${profile.location}`);
const jobs = await response.json();
```

**Pros:** Unlimited, always free, full control
**Cons:** Need to maintain backend, scrapers can break

---

## 📈 Scaling Strategy

1. **Start:** Adzuna API (1000 free calls)
2. **If you need more:** Add GitHub Jobs for tech roles
3. **If you need even more:** Implement web scraping backend
4. **Production:** Consider paid tiers (Adzuna Premium: $99/month for 100k calls)

---

## 🎉 You're All Set!

Your app now fetches **real-time job data** completely free! 

**Next Steps:**
1. Get Adzuna API keys (5 min)
2. Add keys to `.env`
3. Run `npm start`
4. Watch real jobs appear!

Need help? Check the code comments in `realTimeJobScraper.ts` 🚀
