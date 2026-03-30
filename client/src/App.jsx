import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import PublicView from './pages/PublicView';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { leetcodeService, profileService, skillService, projectService, portfolioService } from './services/api';

// --- DEFAULT DARK THEME ---
const defaultTheme = {
  primary: '#6366f1',
  secondary: '#0a0a0c',
  accent: '#f59e0b'
};

// --- INITIAL DATA (fallback only — real data comes from MongoDB Atlas) ---
const initialData = {
  hero: {
    name: "Vignesh",
    roles: ["Software Engineer", "Full Stack Developer", "Creative Coder"],
    bio: "Crafting digital experiences that merge exceptional design with flawless engineering. I specialize in building scalable MERN stack applications with pixel-perfect user interfaces.",
    avatar: "https://ui-avatars.com/api/?name=Vignesh&background=4f46e5&color=fff&size=256&font-size=0.4"
  },
  leetcode: {
    solved: 124,
    easy: 55,
    medium: 6,
    hard: 1,
    streak: 24,
    ranking: "Unranked",
    topPercentage: "N/A",
    acceptanceRate: "N/A",
    languages: "Java",
    leetcodeLink: "https://leetcode.com/u/Joy_boy485"
  },
  skills: [],
  projects: [],
  resumeHighlights: [
    "Specialized in scalable MERN stack architectures",
    "Track record of improving web performance metrics by 40%+",
    "Passionate about responsive, pixel-perfect UI/UX design",
    "Strong background in Agile development and CI/CD pipelines"
  ],
  resumeUrl: "#", 
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "vignesh@example.com"
  },
  theme: {
    ...defaultTheme
  }
};

// --- ENTRY ---
export default function App() {
  const [view, setView] = useState('portfolio');
  const [portfolioData, setPortfolioData] = useState(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Load ALL data from MongoDB Atlas on mount ───
  const loadPortfolio = async () => {
    try {
      // 1. Load portfolio blob (has theme, leetcode, resumeHighlights, socials)
      let baseData = { ...initialData };
      try {
        const portfolioRes = await portfolioService.getPortfolio();
        const remoteData = portfolioRes.data;
        if (remoteData && Object.keys(remoteData).length > 0) {
          baseData = { ...baseData, ...remoteData };
        }
      } catch (err) {
        console.warn('Could not fetch portfolio blob from MongoDB Atlas:', err.message);
      }

      // 2. Load Profile from MongoDB Atlas (dedicated collection)
      try {
        const profileRes = await profileService.getProfile();
        const profile = profileRes.data;
        if (profile) {
          baseData.hero = {
            ...baseData.hero,
            name: profile.name || baseData.hero.name,
            roles: profile.roles || baseData.hero.roles,
            bio: profile.bio || baseData.hero.bio,
            avatar: profile.avatar || baseData.hero.avatar,
            backgroundImage: profile.backgroundImage || baseData.hero.backgroundImage,
          };
          if (profile.socials) {
            baseData.socials = { ...baseData.socials, ...profile.socials };
          }
          if (profile.resumeUrl) {
            baseData.resumeUrl = profile.resumeUrl;
          }
        }
      } catch (err) {
        console.warn('Could not fetch profile from MongoDB Atlas:', err.message);
      }

      // 3. Load Skills from MongoDB Atlas (dedicated collection)
      try {
        const skillsRes = await skillService.getSkills();
        const skills = skillsRes.data;
        if (Array.isArray(skills) && skills.length > 0) {
          baseData.skills = skills.map(s => ({
            id: s._id,
            name: s.name,
            category: s.category,
            level: s.level,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch skills from MongoDB Atlas:', err.message);
      }

      // 4. Load Projects from MongoDB Atlas (dedicated collection)
      try {
        const projectsRes = await projectService.getProjects();
        const projects = projectsRes.data;
        if (Array.isArray(projects) && projects.length > 0) {
          baseData.projects = projects.map(p => ({
            id: p._id,
            title: p.title,
            description: p.description,
            image: p.image,
            liveLink: p.liveLink,
            githubLink: p.githubLink,
            tags: p.tags || [],
            category: p.category,
            featured: p.featured,
            status: p.status,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch projects from MongoDB Atlas:', err.message);
      }

      // 5. Load live LeetCode stats
      try {
        const response = await leetcodeService.getStats('Joy_boy485');
        const stats = response.data;
        baseData.leetcode = {
          ...baseData.leetcode,
          solved: stats.totalSolved,
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          acceptanceRate: stats.acceptanceRate,
          ranking: stats.ranking,
          topPercentage: stats.topPercentage,
          languages: stats.languages,
          leetcodeLink: `https://leetcode.com/u/Joy_boy485`,
        };
      } catch (err) {
        console.warn('Could not fetch LeetCode stats:', err.message);
      }

      setPortfolioData(baseData);
      setIsLoaded(true);
      console.log('✅ All data loaded from MongoDB Atlas');
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      setIsLoaded(true);
    }
  };

  // Persist the portfolio blob (theme, leetcode, resumeHighlights, socials)
  const persistPortfolioBlobOnly = async (data) => {
    try {
      await portfolioService.updatePortfolio({
        hero: data.hero,
        leetcode: data.leetcode,
        resumeHighlights: data.resumeHighlights,
        resumeUrl: data.resumeUrl,
        socials: data.socials,
        theme: data.theme,
      });
    } catch (err) {
      console.warn('Failed to persist portfolio blob to MongoDB Atlas:', err.message);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const updateData = (newData) => {
    setPortfolioData(newData);
    // Debounced save of the blob data (theme, leetcode, etc.)
    persistPortfolioBlobOnly(newData);
  };

  return (
    <div className="dark bg-[#030303] min-h-screen text-zinc-300">
      {view === 'login' && <AdminLogin onLogin={() => setView('admin')} onCancel={() => setView('portfolio')} />}
      {view === 'admin' && (
        <AdminDashboard
          data={portfolioData}
          updateData={updateData}
          onLogout={() => {
            // Reload data from MongoDB Atlas when leaving admin to reflect changes
            loadPortfolio();
            setView('portfolio');
          }}
        />
      )}
      {view === 'portfolio' && <PublicView data={portfolioData} onLoginClick={() => setView('login')} />}
    </div>
  );
}
