// Quick test script to see Adzuna API response
const ADZUNA_APP_ID = '615f03a9';
const ADZUNA_API_KEY = 'f5659ee98e3c45b6f915d9d2e4314820';

async function testAdzunaAPI() {
  try {
    console.log('Testing Adzuna API...\n');
    
    // Test 1: Software jobs in India
    console.log('1. Searching for Software Developer jobs in India...');
    const params1 = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: '5',
      what: 'software developer',
      where: 'India',
    });
    
    const url1 = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params1.toString()}`;
    console.log('URL:', url1, '\n');
    
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    
    console.log(`Status: ${response1.status}`);
    console.log(`Total results: ${data1.count || 0}`);
    console.log(`Jobs returned: ${data1.results?.length || 0}\n`);
    
    if (data1.results && data1.results.length > 0) {
      console.log('Sample jobs:');
      data1.results.forEach((job, i) => {
        console.log(`\n${i + 1}. ${job.title}`);
        console.log(`   Company: ${job.company.display_name}`);
        console.log(`   Location: ${job.location.display_name}`);
        console.log(`   Salary: ${job.salary_min ? `$${job.salary_min}-$${job.salary_max}` : 'Not specified'}`);
        console.log(`   Posted: ${job.created}`);
      });
    } else {
      console.log('No jobs found for this search.\n');
    }
    
    // Test 2: Java jobs in Jaipur
    console.log('\n\n2. Searching for Java jobs in Jaipur...');
    const params2 = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: '5',
      what: 'Java',
      where: 'Jaipur',
    });
    
    const url2 = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params2.toString()}`;
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    
    console.log(`Status: ${response2.status}`);
    console.log(`Total results: ${data2.count || 0}`);
    console.log(`Jobs returned: ${data2.results?.length || 0}\n`);
    
    if (data2.results && data2.results.length > 0) {
      console.log('Sample jobs:');
      data2.results.slice(0, 3).forEach((job, i) => {
        console.log(`\n${i + 1}. ${job.title}`);
        console.log(`   Company: ${job.company.display_name}`);
        console.log(`   Location: ${job.location.display_name}`);
      });
    }
    
    // Test 3: Remote jobs
    console.log('\n\n3. Searching for remote developer jobs...');
    const params3 = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: '5',
      what: 'developer',
      where: 'remote',
    });
    
    const url3 = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params3.toString()}`;
    const response3 = await fetch(url3);
    const data3 = await response3.json();
    
    console.log(`Status: ${response3.status}`);
    console.log(`Total results: ${data3.count || 0}`);
    console.log(`Jobs returned: ${data3.results?.length || 0}\n`);
    
    if (data3.results && data3.results.length > 0) {
      console.log('Sample jobs:');
      data3.results.slice(0, 3).forEach((job, i) => {
        console.log(`\n${i + 1}. ${job.title}`);
        console.log(`   Company: ${job.company.display_name}`);
        console.log(`   Location: ${job.location.display_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdzunaAPI();
