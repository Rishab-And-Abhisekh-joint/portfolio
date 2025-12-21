// utils/api.ts
export const fetchUpcomingContests = async () => {
    try {
      // Using kontests.net, a free public API for coding contests
      const response = await fetch('https://kontests.net/api/v1/all');
      const data = await response.json();
      
      // Filter for major platforms and sort by time
      const supportedSites = ['LeetCode', 'CodeForces', 'AtCoder', 'CodeChef'];
      const now = new Date();
      
      return data
        .filter((contest: any) => supportedSites.includes(contest.site))
        .filter((contest: any) => new Date(contest.start_time) > now)
        .slice(0, 6) // Top 6 upcoming
        .map((contest: any) => ({
          name: contest.name,
          site: contest.site,
          start_time: contest.start_time,
          url: contest.url,
          duration: parseInt(contest.duration) / 3600 // duration in hours
        }));
    } catch (error) {
      console.error("Error fetching contests:", error);
      return [];
    }
  };

export const fetchLeetCodeStats = async (username: string) => {
    try {
      // Using a public instance of the unofficial LeetCode API
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching LeetCode stats:", error);
      return null;
    }
  };
  
  export const fetchCodeforcesStats = async (username: string) => {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      const data = await response.json();
      if (data.status === "OK") {
        return data.result[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching Codeforces stats:", error);
      return null;
    }
  };



