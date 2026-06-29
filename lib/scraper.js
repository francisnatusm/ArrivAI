import { getCityCode } from './cities.js';

export function parseJobListings(html) {
  const jobs = [];
  const titleRegex = /<[^>]*class="[^"]*job_tit[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi;
  const companyRegex = /<[^>]*class="[^"]*corp_name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi;

  const titles = [...html.matchAll(titleRegex)].map((m) => m[1].trim()).slice(0, 10);
  const companies = [...html.matchAll(companyRegex)].map((m) => m[1].trim());

  titles.forEach((title, i) => {
    jobs.push({
      id: `scraped-${i}`,
      title,
      company: companies[i] || 'Unknown',
      location: '',
      source: 'saramin',
      url: 'https://www.saramin.co.kr',
    });
  });

  if (jobs.length === 0) {
    const fallback = [...html.matchAll(/<a[^>]+href="([^"]*recruit[^"]*)"[^>]*>([^<]{10,80})<\/a>/gi)];
    fallback.slice(0, 5).forEach((m, i) => {
      jobs.push({
        id: `fb-${i}`,
        title: m[2].trim(),
        company: 'Saramin listing',
        location: '',
        source: 'saramin',
        url: m[1].startsWith('http') ? m[1] : `https://www.saramin.co.kr${m[1]}`,
      });
    });
  }

  return jobs.slice(0, 5);
}

export async function scrapeJobsFromSaramin(city, skill) {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) return null;

  const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchword=${encodeURIComponent(skill)}&loc_cd=${getCityCode(city)}`;

  const response = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      zone: 'web_unlocker1',
      url,
      format: 'raw',
    }),
  });

  if (!response.ok) {
    throw new Error(`Bright Data error: ${response.status}`);
  }

  const html = await response.text();
  return parseJobListings(html);
}
