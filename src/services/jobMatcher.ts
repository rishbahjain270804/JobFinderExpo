// Sophisticated Job Matching Algorithm

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

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted: string;
  matchScore?: number;
  matchReasons?: string[];
  applyUrl?: string;
}

// Mock job database - in production this would come from an API
const JOB_DATABASE: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Hybrid',
    salary: '$140k - $180k',
    experience: '6-10 years',
    description: 'Join our team building next-gen cloud infrastructure',
    requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
    benefits: ['Health Insurance', '401k Match', 'Unlimited PTO', 'Remote Flexible'],
    posted: '2 days ago',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateLabs',
    location: 'New York, NY',
    type: 'Hybrid',
    salary: '$120k - $160k',
    experience: '3-5 years',
    description: 'Lead product strategy for our flagship SaaS platform',
    requirements: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management'],
    benefits: ['Equity Options', 'Health Insurance', 'Learning Budget', 'Flexible Hours'],
    posted: '1 week ago',
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'DesignCo',
    location: 'Austin, TX',
    type: 'Remote',
    salary: '$90k - $120k',
    experience: '3-5 years',
    description: 'Create beautiful user experiences for our design platform',
    requirements: ['React', 'TypeScript', 'CSS', 'Figma', 'UI/UX'],
    benefits: ['Remote Work', 'Health Insurance', 'Stock Options', 'Home Office Stipend'],
    posted: '3 days ago',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'AI Dynamics',
    location: 'Boston, MA',
    type: 'On-site',
    salary: '$130k - $170k',
    experience: '6-10 years',
    description: 'Build ML models to power our recommendation engine',
    requirements: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    benefits: ['Competitive Salary', 'Bonus Structure', 'Health Coverage', 'Gym Membership'],
    posted: '5 days ago',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Seattle, WA',
    type: 'Remote',
    salary: '$110k - $150k',
    experience: '3-5 years',
    description: 'Automate and optimize our cloud infrastructure',
    requirements: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Python'],
    benefits: ['Full Remote', 'Unlimited PTO', 'Stock Options', 'Learning Budget'],
    posted: '1 day ago',
  },
  {
    id: '6',
    title: 'UX Designer',
    company: 'UserFirst',
    location: 'Los Angeles, CA',
    type: 'Hybrid',
    salary: '$95k - $130k',
    experience: '3-5 years',
    description: 'Design intuitive interfaces for mobile and web applications',
    requirements: ['Figma', 'User Research', 'Prototyping', 'UI Design', 'Design Systems'],
    benefits: ['Flexible Schedule', 'Health Insurance', 'Creative Freedom', 'Portfolio Projects'],
    posted: '4 days ago',
  },
  {
    id: '7',
    title: 'Full Stack Developer',
    company: 'StartupHub',
    location: 'Remote',
    type: 'Remote',
    salary: '$100k - $140k',
    experience: '3-5 years',
    description: 'Build end-to-end features for our marketplace platform',
    requirements: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'GraphQL'],
    benefits: ['Remote First', 'Equity', 'Health Benefits', 'Flexible Hours'],
    posted: '2 days ago',
  },
  {
    id: '8',
    title: 'Marketing Manager',
    company: 'GrowthCo',
    location: 'Chicago, IL',
    type: 'Hybrid',
    salary: '$85k - $115k',
    experience: '3-5 years',
    description: 'Drive marketing strategy and lead generation campaigns',
    requirements: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Campaign Management'],
    benefits: ['Performance Bonuses', 'Health Insurance', 'PTO', 'Professional Development'],
    posted: '6 days ago',
  },
];

/**
 * Calculate match score between user profile and job
 * Returns score from 0-100
 */
export function calculateMatchScore(profile: UserProfile, job: Job): number {
  let score = 0;
  const matchReasons: string[] = [];

  // 1. Skills matching (35 points max) - Enhanced with fuzzy matching
  if (profile.skills) {
    const userSkills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
    const jobRequirements = job.requirements.map(r => r.toLowerCase());
    const jobDescription = job.description.toLowerCase();
    
    // Skill synonyms for better matching
    const skillSynonyms: {[key: string]: string[]} = {
      'javascript': ['js', 'ecmascript', 'es6', 'node'],
      'react': ['reactjs', 'react.js', 'jsx'],
      'python': ['py', 'django', 'flask'],
      'java': ['j2ee', 'spring', 'hibernate'],
      'typescript': ['ts'],
      'css': ['scss', 'sass', 'styling'],
      'database': ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql'],
    };
    
    let skillMatches = 0;
    let exactMatches = 0;
    const matchedSkillNames: string[] = [];
    
    userSkills.forEach(skill => {
      // Check exact match in requirements
      const exactMatch = jobRequirements.some(req => 
        req === skill || req.includes(skill) || skill.includes(req)
      );
      
      // Check in job description
      const descMatch = jobDescription.includes(skill);
      
      // Check synonyms
      const synonymMatch = skillSynonyms[skill]?.some(syn => 
        jobRequirements.some(req => req.includes(syn)) || jobDescription.includes(syn)
      );
      
      if (exactMatch || descMatch || synonymMatch) {
        skillMatches++;
        matchedSkillNames.push(skill);
        if (exactMatch) exactMatches++;
      }
    });
    
    // Calculate score with bonus for exact matches
    const baseScore = (skillMatches / Math.max(userSkills.length, 1)) * 30;
    const exactBonus = (exactMatches / Math.max(skillMatches, 1)) * 5;
    const skillScore = Math.min(35, baseScore + exactBonus);
    score += skillScore;
    
    if (skillMatches > 0) {
      matchReasons.push(`${skillMatches} of your skills match`);
    }
  }

  // 2. Experience level matching (20 points max)
  if (profile.experience && job.experience) {
    const expMap: {[key: string]: number} = {
      '0-2 years': 1,
      '3-5 years': 2,
      '6-10 years': 3,
      '10+ years': 4,
    };
    
    const userExp = expMap[profile.experience] || 2;
    const jobExp = expMap[job.experience] || 2;
    const expDiff = Math.abs(userExp - jobExp);
    
    const expScore = Math.max(0, 20 - (expDiff * 7));
    score += expScore;
    
    if (expDiff === 0) {
      matchReasons.push('Perfect experience match');
    }
  }

  // 3. Work mode preference (15 points max)
  if (profile.workMode && job.type) {
    if (profile.workMode === job.type) {
      score += 15;
      matchReasons.push(`${job.type} work preference`);
    } else if (profile.workMode === 'Flexible' || job.type === 'Hybrid') {
      score += 10;
    } else {
      score += 5;
    }
  }

  // 4. Location matching (15 points max)
  if (job.type === 'Remote') {
    score += 15;
    matchReasons.push('Remote position');
  } else if (profile.location && job.location) {
    const userLoc = profile.location.toLowerCase();
    const jobLoc = job.location.toLowerCase();
    
    if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) {
      score += 15;
      matchReasons.push('Location match');
    } else if (profile.preferredLocation) {
      const prefLoc = profile.preferredLocation.toLowerCase();
      if (jobLoc.includes(prefLoc) || prefLoc.includes(jobLoc)) {
        score += 12;
        matchReasons.push('Preferred location match');
      }
    }
  }

  // 5. Role alignment (15 points max)
  if (profile.desiredRole && job.title) {
    const desiredRole = profile.desiredRole.toLowerCase();
    const jobTitle = job.title.toLowerCase();
    
    // Extract key words
    const desiredWords = desiredRole.split(/\s+/);
    const titleWords = jobTitle.split(/\s+/);
    
    let wordMatches = 0;
    desiredWords.forEach(word => {
      if (word.length > 3 && titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
        wordMatches++;
      }
    });
    
    const roleScore = Math.min(15, (wordMatches / Math.max(desiredWords.length, 1)) * 15);
    score += roleScore;
    
    if (roleScore > 8) {
      matchReasons.push('Role aligns with career goals');
    }
  }

  // 6. Salary compatibility (10 points max)
  if (profile.salary && job.salary) {
    const userSalary = parseSalary(profile.salary);
    const jobSalary = parseSalary(job.salary);
    
    if (userSalary && jobSalary) {
      // If job salary meets or exceeds user expectation
      if (jobSalary >= userSalary) {
        score += 10;
        matchReasons.push('Salary meets expectations');
      } else {
        // Partial points if close (within 20%)
        const salaryRatio = jobSalary / userSalary;
        if (salaryRatio >= 0.8) {
          score += 5;
          matchReasons.push('Competitive salary');
        }
      }
    }
  }

  return Math.min(100, Math.round(score));
}

/**
 * Parse salary string to numeric value (annual)
 * Handles formats like "50000", "50k", "$50,000", "50000-60000"
 */
function parseSalary(salaryStr: string): number | null {
  if (!salaryStr) return null;
  
  // Remove currency symbols and commas
  let cleaned = salaryStr.toLowerCase().replace(/[$,£€]/g, '');
  
  // Handle ranges - take the midpoint
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(s => s.trim());
    const minVal = parseSingleSalary(min);
    const maxVal = parseSingleSalary(max);
    if (minVal && maxVal) {
      return (minVal + maxVal) / 2;
    }
  }
  
  return parseSingleSalary(cleaned);
}

function parseSingleSalary(str: string): number | null {
  if (!str) return null;
  
  // Handle "k" notation (50k = 50000)
  if (str.includes('k')) {
    const num = parseFloat(str.replace('k', ''));
    return isNaN(num) ? null : num * 1000;
  }
  
  // Handle "lpa" (lakhs per annum - Indian notation)
  if (str.includes('lpa') || str.includes('lakh')) {
    const num = parseFloat(str.replace(/lpa|lakh/g, ''));
    return isNaN(num) ? null : num * 100000;
  }
  
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Get personalized match reasons
 */
export function getMatchReasons(profile: UserProfile, job: Job): string[] {
  const reasons: string[] = [];

  // Skills
  if (profile.skills) {
    const userSkills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
    const jobRequirements = job.requirements.map(r => r.toLowerCase());
    const matchedSkills = userSkills.filter(skill => 
      jobRequirements.some(req => req.includes(skill) || skill.includes(req))
    );
    
    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} of your skills match`);
    }
  }

  // Experience
  if (profile.experience === job.experience) {
    reasons.push('Perfect experience level');
  }

  // Work mode
  if (profile.workMode === job.type) {
    reasons.push(`${job.type} work available`);
  } else if (job.type === 'Remote' || job.type === 'Flexible') {
    reasons.push('Flexible work options');
  }

  // Salary (if provided)
  if (profile.salary && job.salary) {
    reasons.push('Competitive salary');
  }

  // Recent posting
  if (job.posted.includes('day') || job.posted.includes('1 week')) {
    reasons.push('Recently posted');
  }

  return reasons.slice(0, 3); // Top 3 reasons
}

/**
 * Match user profile with jobs and return sorted results
 * Now uses real-time job data from Adzuna API
 */
export async function matchJobsToProfile(profile: UserProfile): Promise<Job[]> {
  try {
    // Import the real-time scraper dynamically
    const {getCachedOrFetchJobs} = await import('./realTimeJobScraper');
    
    console.log('Fetching real-time jobs for profile:', profile.desiredRole || profile.currentRole);
    
    // Fetch real jobs from Adzuna API (with caching)
    const realTimeJobs = await getCachedOrFetchJobs(profile);
    
    console.log(`Found ${realTimeJobs.length} real-time jobs from Adzuna`);
    
    // Convert Adzuna jobs to our Job format and calculate match scores
    const jobsWithScores = realTimeJobs.map(rtJob => {
      // Convert to our Job interface
      const job: Job & {applyUrl?: string} = {
        id: rtJob.id,
        title: rtJob.title,
        company: rtJob.company,
        location: rtJob.location,
        type: inferWorkMode(rtJob.description, rtJob.location),
        salary: rtJob.salary_min && rtJob.salary_max
          ? `$${Math.round(rtJob.salary_min/1000)}k - $${Math.round(rtJob.salary_max/1000)}k`
          : 'Competitive',
        experience: inferExperienceLevel(rtJob.description),
        description: rtJob.description,
        requirements: extractRequirements(rtJob.description),
        benefits: [],
        posted: calculatePostedTime(rtJob.created),
        applyUrl: rtJob.redirect_url,
      };
      
      return {
        ...job,
        matchScore: calculateMatchScore(profile, job),
        matchReasons: getMatchReasons(profile, job),
      };
    });

    // Sort by match score (descending)
    const sorted = jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    console.log(`Matched and sorted ${sorted.length} jobs. Top score: ${sorted[0]?.matchScore}%`);
    
    return sorted;
    
  } catch (error) {
    console.error('Error in matchJobsToProfile:', error);
    
    // Fallback to mock data if API fails
    console.log('Falling back to mock data due to error');
    const jobsWithScores = JOB_DATABASE.map(job => ({
      ...job,
      matchScore: calculateMatchScore(profile, job),
      matchReasons: getMatchReasons(profile, job),
    }));
    
    return jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }
}

/**
 * Helper: Infer work mode from job description and location
 */
function inferWorkMode(description: string, location: string): 'Remote' | 'Hybrid' | 'On-site' {
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
 * Helper: Extract requirements from job description
 */
function extractRequirements(description: string): string[] {
  const requirements: string[] = [];
  const commonKeywords = [
    'react', 'typescript', 'javascript', 'python', 'java', 'node', 
    'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'api', 'rest',
    'years experience', 'bachelor', 'degree', 'agile', 'scrum',
    'css', 'html', 'vue', 'angular', 'git', 'ci/cd', 'testing'
  ];
  
  const descLower = description.toLowerCase();
  
  commonKeywords.forEach(keyword => {
    if (descLower.includes(keyword)) {
      const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      if (!requirements.includes(capitalized)) {
        requirements.push(capitalized);
      }
    }
  });
  
  return requirements.slice(0, 8); // Limit to 8 requirements
}

/**
 * Helper: Infer experience level from description
 */
function inferExperienceLevel(description: string): string {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('entry') || descLower.includes('junior') || descLower.includes('0-2 years')) {
    return '0-2 years';
  }
  if (descLower.includes('senior') || descLower.includes('lead') || descLower.includes('7+ years')) {
    return '6-10 years';
  }
  if (descLower.includes('principal') || descLower.includes('staff')) {
    return '10+ years';
  }
  
  return '3-5 years'; // Default to mid-level
}

/**
 * Helper: Calculate how long ago job was posted
 */
function calculatePostedTime(created: string): string {
  try {
    const postedDate = new Date(created);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return '1+ month ago';
  } catch {
    return 'Recently';
  }
}

/**
 * Get job recommendations based on user purpose
 */
export function getRecommendationMessage(profile: UserProfile, matchCount: number): string {
  const name = profile.name || 'there';
  
  if (profile.purpose === 'Looking for a job') {
    return `Great news, ${name}! We found ${matchCount} opportunities that match your profile perfectly.`;
  } else if (profile.purpose === 'Just exploring') {
    return `Hey ${name}! Here are ${matchCount} interesting opportunities you might like.`;
  } else if (profile.purpose === 'Career change') {
    return `${name}, we've identified ${matchCount} roles that align with your career transition goals.`;
  }
  
  return `We found ${matchCount} great opportunities for you!`;
}
