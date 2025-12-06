// Real-time Job Scraping Service using Adzuna API
// Free tier: 1000 API calls/month - No credit card required

import {UserProfile} from './jobMatcher';
import {ADZUNA_APP_ID, ADZUNA_API_KEY} from '@env';

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

// Verify environment variables are loaded
console.log('Environment variables check:', {
  ADZUNA_APP_ID: ADZUNA_APP_ID ? `${ADZUNA_APP_ID.substring(0, 4)}...` : 'NOT SET',
  ADZUNA_API_KEY: ADZUNA_API_KEY ? `${ADZUNA_API_KEY.substring(0, 4)}...` : 'NOT SET',
});

export interface RealTimeJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string; // full_time, part_time, contract
  category: string;
  created: string;
  redirect_url: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Fetch real-time jobs from Adzuna API
 */
export async function fetchRealTimeJobs(
  profile: UserProfile,
  page: number = 1,
  resultsPerPage: number = 20
): Promise<RealTimeJob[]> {
  try {
    // Build search query from user profile
    const searchQuery = buildSearchQuery(profile);
    const userLocation = profile.location || profile.preferredLocation || '';
    
    // Determine country code from location
    const countryCode = getCountryCode(userLocation);
    const locationQuery = userLocation || 'remote';
    
    // Construct API URL
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: resultsPerPage.toString(),
      what: searchQuery,
      where: locationQuery,
    });
    
    const url = `${ADZUNA_BASE_URL}/${countryCode}/search/${page}?${params.toString()}`;

    console.log('Fetching jobs from Adzuna API...');
    console.log('API Credentials:', {
      hasAppId: !!ADZUNA_APP_ID && ADZUNA_APP_ID !== 'YOUR_APP_ID_HERE',
      hasApiKey: !!ADZUNA_API_KEY && ADZUNA_API_KEY !== 'YOUR_API_KEY_HERE',
      searchQuery,
      locationQuery,
      countryCode
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Adzuna API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Adzuna API Error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    console.log('API Response Data:', {
      count: data.count,
      resultsLength: data.results?.length,
      mean: data.mean,
      hasResults: !!data.results
    });
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Unexpected API response format:', JSON.stringify(data).substring(0, 500));
      throw new Error('Invalid API response: missing results array');
    }
    
    console.log(`Successfully fetched ${data.results.length} jobs from Adzuna (out of ${data.count} total)`);
    
    return data.results.map((job: any) => ({
      id: String(job.id || Math.random()),
      title: job.title || 'Untitled Position',
      company: job.company?.display_name || 'Company',
      location: job.location?.display_name || locationQuery || 'Location not specified',
      description: job.description || '',
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contract_type: job.contract_type,
      category: job.category?.label || 'General',
      created: job.created || new Date().toISOString(),
      redirect_url: job.redirect_url || '',
      latitude: job.latitude,
      longitude: job.longitude,
    }));
  } catch (error) {
    console.error('Error fetching real-time jobs:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get country code from location string
 */
function getCountryCode(location: string): string {
  const locationLower = location.toLowerCase();
  
  // Indian cities and regions
  if (locationLower.includes('india') || locationLower.includes('delhi') || 
      locationLower.includes('mumbai') || locationLower.includes('bangalore') || 
      locationLower.includes('bengaluru') || locationLower.includes('hyderabad') || 
      locationLower.includes('chennai') || locationLower.includes('pune') || 
      locationLower.includes('jaipur') || locationLower.includes('kolkata') ||
      locationLower.includes('noida') || locationLower.includes('gurugram') ||
      locationLower.includes('gurgaon') || locationLower.includes('ahmedabad') ||
      locationLower.includes('chandigarh') || locationLower.includes('kochi') ||
      locationLower.includes('nagpur') || locationLower.includes('lucknow')) {
    return 'in';
  }
  
  // UK cities
  if (locationLower.includes('uk') || locationLower.includes('london') || 
      locationLower.includes('manchester') || locationLower.includes('birmingham')) {
    return 'gb';
  }
  
  // Canada cities
  if (locationLower.includes('canada') || locationLower.includes('toronto') || 
      locationLower.includes('vancouver') || locationLower.includes('montreal')) {
    return 'ca';
  }
  
  // Australia cities
  if (locationLower.includes('australia') || locationLower.includes('sydney') || 
      locationLower.includes('melbourne') || locationLower.includes('brisbane')) {
    return 'au';
  }
  
  // Default to US
  return 'us';
}

/**
 * Build search query from user profile
 */
function buildSearchQuery(profile: UserProfile): string {
  const queryParts: string[] = [];

  // Add desired role as primary search term
  if (profile.desiredRole) {
    queryParts.push(profile.desiredRole);
  } else if (profile.currentRole) {
    queryParts.push(profile.currentRole);
  } else if (profile.skills) {
    // If no role, use primary skill
    const primarySkill = profile.skills.split(/[,\s]+/).filter(s => s.length > 2)[0];
    if (primarySkill) {
      queryParts.push(primarySkill);
    }
  }

  return queryParts.join(' ') || 'software developer';
}

/**
 * Alternative: Free GitHub Jobs API (Tech jobs only)
 */
export async function fetchGitHubJobs(
  description: string = '',
  location: string = ''
): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (description) params.append('description', description);
    if (location) params.append('location', location);

    const response = await fetch(
      `https://jobs.github.com/positions.json?${params}`
    );

    if (!response.ok) {
      throw new Error('GitHub Jobs API error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub jobs:', error);
    return [];
  }
}

/**
 * Alternative: Free RapidAPI Integration
 * Get API key from: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 */
export async function fetchJSearchJobs(
  query: string,
  location: string = 'United States',
  rapidApiKey: string
): Promise<any[]> {
  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error('JSearch API error');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching JSearch jobs:', error);
    return [];
  }
}

/**
 * Alternative: Web Scraping (100% Free but requires backend)
 * 
 * Example scraping targets:
 * - Indeed: https://www.indeed.com/jobs?q=developer&l=San+Francisco
 * - LinkedIn: https://www.linkedin.com/jobs/search/?keywords=developer
 * - Glassdoor: https://www.glassdoor.com/Job/jobs.htm?sc.keyword=developer
 * 
 * NOTE: Web scraping requires a backend server (Node.js/Python)
 * React Native cannot scrape directly due to CORS and browser restrictions
 */

export const SCRAPING_SETUP_GUIDE = `
# Web Scraping Setup (For Backend)

## Option 1: Node.js Backend with Puppeteer

\`\`\`bash
npm install puppeteer cheerio express
\`\`\`

\`\`\`javascript
// server.js
const express = require('express');
const puppeteer = require('puppeteer');

app.get('/api/scrape-jobs', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.indeed.com/jobs?q=developer');
  
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.job_seen_beacon')).map(job => ({
      title: job.querySelector('.jobTitle')?.textContent,
      company: job.querySelector('.companyName')?.textContent,
      location: job.querySelector('.companyLocation')?.textContent,
    }));
  });
  
  await browser.close();
  res.json(jobs);
});
\`\`\`

## Option 2: Python Backend with BeautifulSoup

\`\`\`bash
pip install beautifulsoup4 requests flask
\`\`\`

\`\`\`python
from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

@app.route('/api/scrape-jobs')
def scrape_jobs():
    url = 'https://www.indeed.com/jobs?q=developer'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    jobs = []
    for job_card in soup.find_all('div', class_='job_seen_beacon'):
        jobs.append({
            'title': job_card.find('h2', class_='jobTitle').text,
            'company': job_card.find('span', class_='companyName').text,
        })
    
    return jsonify(jobs)
\`\`\`
`;

/**
 * Cost-Free Job Data Strategy
 * 
 * Recommended Approach:
 * 1. Start with Adzuna API (1000 free calls/month)
 * 2. Supplement with GitHub Jobs for tech roles
 * 3. If you need more data, implement web scraping backend
 * 4. Cache results in AsyncStorage to reduce API calls
 * 
 * Cache Strategy:
 * - Cache jobs for 6-12 hours
 * - Only fetch new data when cache expires
 * - This extends free tier significantly
 */

export async function getCachedOrFetchJobs(
  profile: UserProfile
): Promise<RealTimeJob[]> {
  const CACHE_KEY = 'cached_jobs';
  const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  try {
    // Try to get cached data
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    
    if (cachedData) {
      const {jobs, timestamp} = JSON.parse(cachedData);
      const now = Date.now();
      
      console.log(`Cache check: ${jobs.length} jobs, age: ${Math.round((now - timestamp) / 1000 / 60)} minutes`);
      
      // Validate cache: must have jobs and be within duration
      if (jobs.length > 0 && now - timestamp < CACHE_DURATION) {
        console.log('Using cached job data');
        return jobs;
      } else {
        console.log('Cache invalid or empty, fetching fresh data...');
      }
    }

    // Fetch fresh data
    console.log('Fetching fresh job data...');
    const freshJobs = await fetchRealTimeJobs(profile);
    
    console.log(`Fetched ${freshJobs.length} fresh jobs from API`);
    
    // Only cache if we got jobs
    if (freshJobs.length > 0) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        jobs: freshJobs,
        timestamp: Date.now(),
      }));
      console.log('Jobs cached successfully');
    } else {
      console.log('Not caching empty results');
    }
    
    return freshJobs;
  } catch (error) {
    console.error('Error in getCachedOrFetchJobs:', error);
    return [];
  }
}

/**
 * Clear the job cache (useful for testing)
 */
export async function clearJobCache(): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('cached_jobs');
    console.log('Job cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
