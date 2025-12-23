// app/api/contests/route.ts
import { NextResponse } from 'next/server';

interface Contest {
  id: string;
  name: string;
  site: string;
  start_time: string;
  end_time: string;
  url: string;
  duration: string;
}

// Normalize platform names
const normalizePlatformName = (site: string): string => {
  const lower = site.toLowerCase().replace(/[_\s]/g, '');
  if (lower === 'codeforces' || lower === 'codeforces.com') return 'CodeForces';
  if (lower === 'leetcode' || lower === 'leetcode.com') return 'LeetCode';
  if (lower === 'codechef' || lower === 'codechef.com') return 'CodeChef';
  if (lower === 'atcoder' || lower === 'atcoder.jp') return 'AtCoder';
  if (lower === 'hackerrank' || lower === 'hackerrank.com') return 'HackerRank';
  if (lower === 'hackerearth' || lower === 'hackerearth.com') return 'HackerEarth';
  if (lower === 'topcoder' || lower === 'topcoder.com') return 'TopCoder';
  if (lower === 'geeksforgeeks' || lower === 'gfg' || lower === 'geeksforgeeks.org') return 'GeeksforGeeks';
  if (lower === 'kickstart' || lower === 'googlekickstart') return 'Kick_Start';
  return site;
};

export async function GET() {
  const allContests: Contest[] = [];
  const supported = ['LeetCode', 'CodeForces', 'Codeforces', 'AtCoder', 'CodeChef', 'HackerRank', 'HackerEarth', 'TopCoder', 'GeeksforGeeks', 'geeks_for_geeks', 'GFG', 'Kick_Start'];
  
  let kontestsFetched = false;
  let codeforcesData: Contest[] = [];

  // 1. Try kontests.net API (server-side, no CORS issues)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://kontests.net/api/v1/all', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Portfolio-Contest-Tracker/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data
          .filter((c: any) => {
            const normalizedSite = normalizePlatformName(c.site || '');
            return supported.includes(c.site) || supported.includes(normalizedSite);
          })
          .map((c: any) => ({
            name: c.name,
            site: normalizePlatformName(c.site),
            start_time: c.start_time,
            end_time: c.end_time,
            url: c.url,
            duration: c.duration,
            id: `${normalizePlatformName(c.site)}-${c.name}-${c.start_time}`.replace(/\s+/g, '-').toLowerCase()
          }));
        
        if (filtered.length > 0) {
          allContests.push(...filtered);
          kontestsFetched = true;
          console.log('✅ Fetched', filtered.length, 'contests from kontests.net');
        }
      }
    }
  } catch (e) {
    console.log('❌ kontests.net failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 2. Try Codeforces API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const cfResponse = await fetch('https://codeforces.com/api/contest.list', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (cfResponse.ok) {
      const cfData = await cfResponse.json();
      
      if (cfData.status === 'OK' && Array.isArray(cfData.result)) {
        codeforcesData = cfData.result.slice(0, 50).map((c: any) => ({
          name: c.name,
          site: 'CodeForces',
          start_time: new Date(c.startTimeSeconds * 1000).toISOString(),
          end_time: new Date((c.startTimeSeconds + c.durationSeconds) * 1000).toISOString(),
          url: `https://codeforces.com/contest/${c.id}`,
          duration: c.durationSeconds.toString(),
          id: `codeforces-${c.id}`.toLowerCase()
        }));
        
        // Merge without duplicates
        const existingNames = new Set(allContests.map(c => c.name.toLowerCase().replace(/\s+/g, '')));
        
        codeforcesData.forEach((cf: Contest) => {
          const cfNameNormalized = cf.name.toLowerCase().replace(/\s+/g, '');
          if (!existingNames.has(cfNameNormalized)) {
            allContests.push(cf);
            existingNames.add(cfNameNormalized);
          }
        });
        
        console.log('✅ Added Codeforces contests');
      }
    }
  } catch (e) {
    console.log('❌ Codeforces API failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 3. Try LeetCode contests API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const lcResponse = await fetch('https://alfa-leetcode-api.onrender.com/problems?limit=0', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Try to get LeetCode contest info from alternative endpoint
    const lcContestResponse = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            allContests {
              title
              startTime
              duration
              titleSlug
            }
          }
        `
      })
    });
    
    if (lcContestResponse.ok) {
      const lcContestData = await lcContestResponse.json();
      if (lcContestData?.data?.allContests) {
        const now = Date.now();
        const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
        const sixtyDaysAhead = now + 60 * 24 * 60 * 60 * 1000;
        
        const lcContests = lcContestData.data.allContests
          .filter((c: any) => {
            const startTime = c.startTime * 1000;
            return startTime > sixtyDaysAgo && startTime < sixtyDaysAhead;
          })
          .slice(0, 20)
          .map((c: any) => ({
            name: c.title,
            site: 'LeetCode',
            start_time: new Date(c.startTime * 1000).toISOString(),
            end_time: new Date((c.startTime + c.duration) * 1000).toISOString(),
            url: `https://leetcode.com/contest/${c.titleSlug}/`,
            duration: c.duration.toString(),
            id: `leetcode-${c.titleSlug}`.toLowerCase()
          }));
        
        const existingIds = new Set(allContests.map(c => c.id));
        lcContests.forEach((lc: Contest) => {
          if (!existingIds.has(lc.id)) {
            allContests.push(lc);
          }
        });
        
        console.log('✅ Added LeetCode contests from GraphQL');
      }
    }
  } catch (e) {
    console.log('❌ LeetCode API failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 4. Try CodeChef API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const ccResponse = await fetch('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (ccResponse.ok) {
      const ccData = await ccResponse.json();
      
      // Process future contests
      const processContests = (contests: any[], type: string) => {
        if (!Array.isArray(contests)) return [];
        return contests.map((c: any) => ({
          name: c.contest_name || c.name,
          site: 'CodeChef',
          start_time: new Date(c.contest_start_date || c.start_date).toISOString(),
          end_time: new Date(c.contest_end_date || c.end_date).toISOString(),
          url: `https://www.codechef.com/${c.contest_code}`,
          duration: ((new Date(c.contest_end_date || c.end_date).getTime() - new Date(c.contest_start_date || c.start_date).getTime()) / 1000).toString(),
          id: `codechef-${c.contest_code}`.toLowerCase()
        }));
      };
      
      const futureContests = processContests(ccData.future_contests || [], 'future');
      const presentContests = processContests(ccData.present_contests || [], 'present');
      const pastContests = processContests((ccData.past_contests || []).slice(0, 10), 'past');
      
      const ccContests = [...presentContests, ...futureContests, ...pastContests];
      
      const existingIds = new Set(allContests.map(c => c.id));
      ccContests.forEach((cc: Contest) => {
        if (!existingIds.has(cc.id)) {
          allContests.push(cc);
        }
      });
      
      console.log('✅ Added CodeChef contests');
    }
  } catch (e) {
    console.log('❌ CodeChef API failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 5. Add fallback data if we don't have enough contests
  const platformsInData = new Set(allContests.map(c => c.site));
  
  if (allContests.length < 5 || !kontestsFetched) {
    console.log('Adding fallback contests...');
    const now = new Date();
    
    const getNextDayOfWeek = (dayOfWeek: number, hour: number, minute: number = 0, weeksAhead: number = 0) => {
      const date = new Date(now);
      let diff = (dayOfWeek - date.getDay() + 7) % 7;
      if (diff === 0 && (date.getHours() > hour || (date.getHours() === hour && date.getMinutes() >= minute))) {
        diff = 7;
      }
      date.setDate(date.getDate() + diff + (weeksAhead * 7));
      date.setHours(hour, minute, 0, 0);
      return date;
    };
    
    const fallbackContests: Contest[] = [];
    
    // LeetCode fallback
    if (!platformsInData.has('LeetCode')) {
      fallbackContests.push(
        {
          id: 'leetcode-weekly-next',
          name: 'Weekly Contest',
          site: 'LeetCode',
          start_time: getNextDayOfWeek(0, 8, 0).toISOString(),
          end_time: new Date(getNextDayOfWeek(0, 8, 0).getTime() + 5400000).toISOString(),
          url: 'https://leetcode.com/contest/',
          duration: '5400'
        },
        {
          id: 'leetcode-biweekly-next',
          name: 'Biweekly Contest',
          site: 'LeetCode',
          start_time: getNextDayOfWeek(6, 14, 30).toISOString(),
          end_time: new Date(getNextDayOfWeek(6, 14, 30).getTime() + 5400000).toISOString(),
          url: 'https://leetcode.com/contest/',
          duration: '5400'
        }
      );
    }
    
    // GFG fallback
    if (!platformsInData.has('GeeksforGeeks')) {
      fallbackContests.push({
        id: 'gfg-weekly-next',
        name: 'GFG Weekly Coding Contest',
        site: 'GeeksforGeeks',
        start_time: getNextDayOfWeek(0, 13, 30).toISOString(),
        end_time: new Date(getNextDayOfWeek(0, 13, 30).getTime() + 5400000).toISOString(),
        url: 'https://practice.geeksforgeeks.org/contests',
        duration: '5400'
      });
    }
    
    // AtCoder fallback
    if (!platformsInData.has('AtCoder')) {
      fallbackContests.push({
        id: 'atcoder-abc-next',
        name: 'AtCoder Beginner Contest',
        site: 'AtCoder',
        start_time: getNextDayOfWeek(6, 12, 0).toISOString(),
        end_time: new Date(getNextDayOfWeek(6, 12, 0).getTime() + 6000000).toISOString(),
        url: 'https://atcoder.jp/contests',
        duration: '6000'
      });
    }
    
    const existingIds = new Set(allContests.map(c => c.id));
    fallbackContests.forEach(fc => {
      if (!existingIds.has(fc.id)) {
        allContests.push(fc);
      }
    });
  }

  // Filter by date range and sort
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const filteredContests = allContests
    .filter(c => new Date(c.end_time) > sixtyDaysAgo)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  console.log('Total contests:', filteredContests.length);

  return NextResponse.json({
    contests: filteredContests,
    fetchedFromApi: kontestsFetched,
    platforms: Array.from(new Set(filteredContests.map(c => c.site)))
  });
}