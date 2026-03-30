const LeetCodeStats = require('../models/LeetCodeStats');
const axios = require('axios');

const fetchLeetCodeStats = async (username) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            ranking
            userAvatar
            starRating
            reputation
            solutionCount
            scoreRanking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
          languageProblemCount {
            languageName
            problemsSolved
          }
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', 
      { query, variables: { username } },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    const data = response.data.data.matchedUser;
    if (!data) throw new Error('User not found');

    // Check if submitStats exists
    if (!data.submitStats || !data.submitStats.acSubmissionNum) {
      throw new Error('No submission stats available');
    }

    const acStats = data.submitStats.acSubmissionNum;
    const totalStats = data.submitStats.totalSubmissionNum;

    // Get easy, medium, hard counts
    const easy = acStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const medium = acStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard = acStats.find(s => s.difficulty === 'Hard')?.count || 0;
    const totalSolved = easy + medium + hard;

    // Calculate acceptance rate
    const easyTotal = totalStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const mediumTotal = totalStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hardTotal = totalStats.find(s => s.difficulty === 'Hard')?.count || 0;
    const grandTotal = easyTotal + mediumTotal + hardTotal;
    
    const acceptanceRate = grandTotal > 0 ? ((totalSolved / grandTotal) * 100).toFixed(1) : 0;

    // Get ranking
    const ranking = data.profile?.ranking || 0;
    const rankingStr = ranking > 0 ? ranking.toLocaleString() : 'Unranked';

    // Get top percentage from problemsSolvedBeatsStats
    let topPercentage = 'N/A';
    if (data.problemsSolvedBeatsStats && data.problemsSolvedBeatsStats.length > 0) {
      const allBeats = data.problemsSolvedBeatsStats.find(b => b.difficulty === 'All');
      if (allBeats) {
        topPercentage = `${(100 - allBeats.percentage).toFixed(1)}%`;
      }
    }

    // Get languages
    let languages = 'Java'; // Default to Java as requested
    try {
      if (data.languageProblemCount && Array.isArray(data.languageProblemCount) && data.languageProblemCount.length > 0) {
        // Sort by problems solved and take top languages, but ensure Java is included if used
        const sortedLanguages = data.languageProblemCount
          .sort((a, b) => (b.problemsSolved || 0) - (a.problemsSolved || 0));
        
        // Check if Java is in the user's languages
        const hasJava = sortedLanguages.some(lang => lang.languageName === 'Java');
        if (hasJava) {
          languages = 'Java';
        } else {
          // If no Java, use the top language but still show Java as default in UI
          languages = sortedLanguages[0]?.languageName || 'Java';
        }
      }
    } catch (error) {
      console.warn('Error parsing languages:', error.message);
      languages = 'Java';
    }

    const result = {
      username,
      totalSolved,
      easy,
      medium,
      hard,
      acceptanceRate: `${acceptanceRate}%`,
      ranking: rankingStr,
      topPercentage: topPercentage,
      languages: languages,
    };
    
    console.log('Fetched stats for', username, ':', result);
    return result;
  } catch (error) {
    console.error('LeetCode API error:', error.message);
    return null;
  }
};

const getLeetCodeStats = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    let stats = await LeetCodeStats.findOne({ username });
    const now = new Date();

    if (!stats || (stats.nextFetchTime && now > stats.nextFetchTime)) {
      const freshStats = await fetchLeetCodeStats(username);
      
      if (freshStats) {
        if (stats) {
          stats.totalSolved = freshStats.totalSolved;
          stats.easy = freshStats.easy;
          stats.medium = freshStats.medium;
          stats.hard = freshStats.hard;
          stats.acceptanceRate = freshStats.acceptanceRate;
          stats.ranking = freshStats.ranking;
          stats.topPercentage = freshStats.topPercentage;
          stats.languages = freshStats.languages;
          stats.lastFetched = now;
          stats.nextFetchTime = new Date(now.getTime() + 3600000);
        } else {
          stats = new LeetCodeStats({
            username,
            ...freshStats,
            lastFetched: now,
            nextFetchTime: new Date(now.getTime() + 3600000),
          });
        }
        await stats.save();
      }
    }

    if (!stats) {
      return res.status(404).json({ message: 'Could not fetch LeetCode stats' });
    }

    res.json({
      username: stats.username,
      totalSolved: stats.totalSolved,
      easy: stats.easy,
      medium: stats.medium,
      hard: stats.hard,
      acceptanceRate: stats.acceptanceRate,
      ranking: stats.ranking,
      topPercentage: stats.topPercentage,
      languages: stats.languages || 'Java',
      lastFetched: stats.lastFetched,
      nextFetchTime: stats.nextFetchTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeetCodeStats, fetchLeetCodeStats };
