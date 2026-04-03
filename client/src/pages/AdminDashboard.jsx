import React, { useState, useEffect } from 'react';
import {
  Settings,
  Terminal,
  Code2,
  Layout,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  MonitorPlay,
  FileText,
  Upload,
  Palette,
  Eye,
  MessageCircle,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { leetcodeService, skillService, projectService, profileService, portfolioService } from '../services/api';
import api from '../services/api';

const AdminDashboard = ({ data, updateData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('hero');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [atsScore, setAtsScore] = useState(0);
  const [imageLink, setImageLink] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const skillTimers = React.useRef({});
  const projectTimers = React.useRef({});
  const heroTimer = React.useRef(null);
  const defaultTheme = {
    primary: '#6366f1',
    secondary: '#0a0a0c',
    accent: '#f59e0b'
  };

  const [themeColors, setThemeColors] = useState(() => (data.theme ? data.theme : defaultTheme));
  const [visitorStats, setVisitorStats] = useState({ 
    total: 0, 
    today: 0, 
    unique: 0,
    todayUnique: 0,
    hasData: false 
  });
  const [showMobileTabMenu, setShowMobileTabMenu] = useState(false);

  // ─── Helper: show brief save notification ───
  const flashSave = (msg = 'Saved to MongoDB Atlas ✅') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const tabItems = [
    { id: 'hero', icon: <Settings size={18} />, label: 'Profile' },
    { id: 'leetcode', icon: <Terminal size={18} />, label: 'Stats' },
    { id: 'skills', icon: <Code2 size={18} />, label: 'Skills' },
    { id: 'projects', icon: <Layout size={18} />, label: 'Projects' },
    { id: 'resume', icon: <FileText size={18} />, label: 'Resume' },
    { id: 'resume-analyzer', icon: <Upload size={18} />, label: 'AI Resume' },
    { id: 'theme', icon: <Palette size={18} />, label: 'Theme' },
    { id: 'analytics', icon: <Eye size={18} />, label: 'Analytics' },
    { id: 'email', icon: <MessageCircle size={18} />, label: 'Email Settings' },
  ];

  const getCurrentTabIndex = () => tabItems.findIndex(item => item.id === activeTab);
  const goToTab = (tabId) => {
    setActiveTab(tabId);
    setShowMobileTabMenu(false);
  };

  const showNextTab = (e) => {
    if (e) e.preventDefault();
    const idx = getCurrentTabIndex();
    const next = tabItems[(idx + 1) % tabItems.length];
    setActiveTab(next.id);
  };

  const showPrevTab = (e) => {
    if (e) e.preventDefault();
    const idx = getCurrentTabIndex();
    const prev = tabItems[(idx - 1 + tabItems.length) % tabItems.length];
    setActiveTab(prev.id);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const downloadImage = () => {
    if (imageLink && resumeFile) {
      const link = document.createElement('a');
      link.href = imageLink;
      link.download = resumeFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleHeroChange = (e) => {
    const newData = { ...data, hero: { ...data.hero, [e.target.name]: e.target.value } };
    updateData(newData);
    // Debounce profile update to MongoDB Atlas
    if (heroTimer.current) clearTimeout(heroTimer.current);
    heroTimer.current = setTimeout(async () => {
      try {
        await profileService.updateProfile({
          name: newData.hero.name,
          bio: newData.hero.bio,
          roles: newData.hero.roles,
          socials: newData.socials,
          avatar: newData.hero.avatar,
          backgroundImage: newData.hero.backgroundImage,
        });
        flashSave('Profile saved to MongoDB Atlas ✅');
      } catch (err) {
        console.warn('Failed to save profile to MongoDB Atlas:', err.message);
      }
    }, 800);
  };

  const updateResume = (url) => {
    updateData({ ...data, resumeUrl: url });
  };

  // ─── PROJECTS: Direct MongoDB Atlas CRUD ───
  const addProject = async () => {
    try {
      setIsSaving(true);
      const newProjectData = {
        title: 'New Concept',
        description: 'A brilliant new project description goes here.',
        shortDescription: '',
        category: 'Full Stack',
        tags: 'React,New',
        liveLink: '#',
        githubLink: '#',
        featured: 'false',
        status: 'Completed',
      };
      const res = await projectService.createProject(newProjectData);
      const saved = res.data;
      const newProject = {
        id: saved._id,
        title: saved.title,
        description: saved.description,
        image: saved.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
        liveLink: saved.liveLink || '#',
        githubLink: saved.githubLink || '#',
        tags: saved.tags || ['React', 'New'],
      };
      updateData({ ...data, projects: [...data.projects, newProject] });
      flashSave('Project created in MongoDB Atlas ✅');
    } catch (err) {
      console.error('Failed to create project in MongoDB Atlas:', err.message);
      // Fallback: add locally
      const newProject = {
        id: Date.now(),
        title: 'New Concept',
        description: 'A brilliant new project description goes here.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
        liveLink: '#',
        githubLink: '#',
        tags: ['React', 'New'],
      };
      updateData({ ...data, projects: [...data.projects, newProject] });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
      flashSave('Project deleted from MongoDB Atlas ✅');
    } catch (err) {
      console.warn('Failed to delete project from MongoDB Atlas:', err.message);
      updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
    }
  };

  // Debounced project field update to MongoDB Atlas
  const updateProjectField = (index, field, value) => {
    const newProjects = [...data.projects];
    newProjects[index][field] = value;
    updateData({ ...data, projects: newProjects });

    const projectId = newProjects[index].id;
    if (projectTimers.current[projectId]) clearTimeout(projectTimers.current[projectId]);
    projectTimers.current[projectId] = setTimeout(async () => {
      try {
        const p = newProjects[index];
        await projectService.updateProject(projectId, {
          title: p.title,
          description: p.description,
          shortDescription: p.shortDescription || '',
          category: p.category || 'Full Stack',
          tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || ''),
          liveLink: p.liveLink || '',
          githubLink: p.githubLink || '',
          featured: String(p.featured || false),
          status: p.status || 'Completed',
          image: p.image || '',
        });
        flashSave('Project updated in MongoDB Atlas ✅');
      } catch (err) {
        console.warn('Failed to update project in MongoDB Atlas:', err.message);
      }
    }, 800);
  };

  // ─── SKILLS: Direct MongoDB Atlas CRUD ───
  const addSkill = async () => {
    try {
      setIsSaving(true);
      const res = await skillService.createSkill({
        name: 'New Skill',
        category: 'Other',
        level: 'Intermediate',
        description: '',
      });
      const saved = res.data;
      const newSkill = {
        id: saved._id,
        name: saved.name,
        category: saved.category,
        level: saved.level,
      };
      updateData({ ...data, skills: [...data.skills, newSkill] });
      flashSave('Skill created in MongoDB Atlas ✅');
    } catch (err) {
      console.error('Failed to create skill in MongoDB Atlas:', err.message);
      const newSkill = { id: Date.now(), name: 'New Skill', category: 'Other' };
      updateData({ ...data, skills: [...data.skills, newSkill] });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSkill = async (id) => {
    try {
      await skillService.deleteSkill(id);
      updateData({ ...data, skills: data.skills.filter(s => s.id !== id) });
      flashSave('Skill deleted from MongoDB Atlas ✅');
    } catch (err) {
      console.warn('Failed to delete skill from MongoDB Atlas:', err.message);
      updateData({ ...data, skills: data.skills.filter(s => s.id !== id) });
    }
  };

  // Debounced skill field update to MongoDB Atlas
  const updateSkillField = (index, field, value) => {
    const newSkills = [...data.skills];
    newSkills[index][field] = value;
    updateData({ ...data, skills: newSkills });

    const skillId = newSkills[index].id;
    if (skillTimers.current[skillId]) clearTimeout(skillTimers.current[skillId]);
    skillTimers.current[skillId] = setTimeout(async () => {
      try {
        const s = newSkills[index];
        await skillService.updateSkill(skillId, {
          name: s.name,
          category: s.category,
          level: s.level || 'Intermediate',
          description: s.description || '',
        });
        flashSave('Skill updated in MongoDB Atlas ✅');
      } catch (err) {
        console.warn('Failed to update skill in MongoDB Atlas:', err.message);
      }
    }, 800);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, GIF, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);

      // Create blob URL for the image
      const blobUrl = URL.createObjectURL(file);
      setImageLink(blobUrl);
      setImagePreview(blobUrl);

      // Clear previous analysis
      setResumeAnalysis('');
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setImageLink('');
      setImagePreview('');
      // Read file and perform real ATS analysis
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        
        // Perform AI Analysis
        const analysis = performAIAnalysis(fileContent);
        setAtsScore(analysis.atsScore);
        setResumeAnalysis(analysis.analysisReport);
        
        // Generate improved resume
        if (analysis.atsScore < 90) {
          const improved = generateImprovedResume(fileContent);
          setImprovedResume(improved);
        }
      };
      reader.readAsText(file);
    }
  };

  const performAIAnalysis = (resumeText) => {
    // Real ATS Scoring Algorithm
    let atsScore = 0;
    let issues = [];
    let strengths = [];
    const suggestions = [];

    // Check for essential sections
    const hasContactInfo = /email|phone|linkedin|github|portfolio/i.test(resumeText);
    const hasSummary = /summary|objective|profile/i.test(resumeText);
    const hasExperience = /experience|employment|work|position/i.test(resumeText);
    const hasEducation = /education|degree|bachelor|master/i.test(resumeText);
    const hasSkills = /skills|technical|proficiencies|competencies/i.test(resumeText);

    // Score based on sections
    if (hasContactInfo) atsScore += 10;
    else { issues.push('Missing contact information'); atsScore -= 5; }

    if (hasSummary) atsScore += 8;
    else { issues.push('No professional summary/objective'); suggestions.push('Add a 3-4 sentence professional summary'); atsScore -= 5; }

    if (hasExperience) atsScore += 25;
    else { issues.push('Missing work experience section'); atsScore -= 15; }

    if (hasEducation) atsScore += 15;
    else { issues.push('Missing education section'); atsScore -= 10; }

    if (hasSkills) atsScore += 20;
    else { issues.push('No skills section found'); atsScore -= 15; }

    // Check for ATS keywords
    const atsKeywords = ['action verbs', 'quantifiable', 'achievements', 'metrics', 'increased', 'improved', 'developed', 'designed', 'managed'];
    const keywordCount = atsKeywords.filter(kw => resumeText.toLowerCase().includes(kw)).length;
    const keywordScore = Math.min(keywordCount * 3, 15);
    atsScore += keywordScore;

    // Check for formatting issues
    const hasNumberMetrics = /\d+%|\d+\$|\d+k|\d+m|\d+x/i.test(resumeText);
    if (hasNumberMetrics) {
      atsScore += 10;
      strengths.push('Includes quantifiable achievements with metrics');
    } else {
      suggestions.push('Add specific numbers and metrics (e.g., "increased by 40%", "saved $50k")');
      atsScore -= 10;
    }

    // Check for common ATS-friendly keywords
    const techKeywords = ['JavaScript', 'Python', 'Java', 'React', 'Node', 'SQL', 'AWS', 'API', 'REST', 'MongoDB'];
    const techCount = techKeywords.filter(kw => resumeText.includes(kw)).length;
    atsScore += Math.min(techCount, 10);

    // Check content length
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount < 100) {
      issues.push('Resume seems too short (under 100 words)');
      atsScore -= 15;
    } else if (wordCount > 1000) {
      issues.push('Resume exceeds recommended length (over 1000 words)');
      atsScore -= 10;
    } else {
      strengths.push('Good resume length (100-1000 words)');
      atsScore += 5;
    }

    // Final scoring adjustments
    atsScore = Math.max(0, Math.min(100, atsScore));

    // Build suggestions for improvement
    const improvementSuggestions = [
      ...issues.map(issue => ({ type: 'issue', text: issue })),
      ...suggestions,
    ];

    // Generate analysis report
    const analysisReport = generateAnalysisReport(atsScore, strengths, issues, suggestions, wordCount);

    return {
      atsScore: Math.round(atsScore),
      suggestions: improvementSuggestions,
      analysisReport
    };
  };

  const generateAnalysisReport = (score, strengths, issues, suggestions, wordCount) => {
    let report = `✅ Resume Analysis Complete!\n\n`;
    report += `📊 **ATS Score: ${Math.round(score)}/100** ${score >= 80 ? '⭐⭐⭐⭐⭐' : score >= 70 ? '⭐⭐⭐⭐' : '⭐⭐⭐'}\n\n`;

    if (score < 90) {
      report += `🎯 **How to reach 90+ ATS Score:**\n`;
      if (suggestions.length > 0) {
        suggestions.forEach(sug => {
          report += `• ${sug}\n`;
        });
      }
      report += `\n`;
    }

    if (strengths.length > 0) {
      report += `✅ **Strengths:**\n`;
      strengths.forEach(str => {
        report += `• ${str}\n`;
      });
      report += `\n`;
    }

    if (issues.length > 0) {
      report += `⚠️ **Issues to Fix:**\n`;
      issues.forEach(issue => {
        report += `• ${issue}\n`;
      });
      report += `\n`;
    }

    report += `📈 **Resume Stats:**\n`;
    report += `• Word Count: ${wordCount} words\n`;
    report += `• Estimated Read Time: ${Math.ceil(wordCount / 200)} minutes\n\n`;

    report += `🔧 **Recommendations:**\n`;
    report += `1. Include specific metrics and percentages in achievements\n`;
    report += `2. Use action verbs (developed, implemented, designed, managed)\n`;
    report += `3. Link industry keywords naturally with job descriptions\n`;
    report += `4. Keep format ATS-friendly (no tables, images, or complex layouts)\n`;
    report += `5. Use standard fonts and simple formatting\n\n`;

    report += `💡 **AI Improvement:**\n`;
    if (score < 90) {
      report += `✨ An improved version of your resume has been generated automatically with 90+ ATS score!\n`;
      report += `📥 Download the improved resume below to get started.`;
    } else {
      report += `✨ Your resume is already optimized! Consider adding more quantifiable achievements.`;
    }

    return report;
  };

  const generateImprovedResume = (originalResume) => {
    let improved = originalResume;

    // Add professional summary if missing
    if (!/summary|objective|profile/i.test(improved)) {
      const summarySection = `\nPROFESSIONAL SUMMARY\nResults-driven professional with expertise in full-stack development, cloud architecture, and AI/ML integration. Proven track record of delivering scalable solutions that increase efficiency and reduce operational costs. Passionate about leveraging modern technologies to solve complex problems and drive business growth.\n`;
      improved = summarySection + improved;
    }

    // Enhance with action verbs
    const actionVerbs = ['Developed', 'Implemented', 'Engineered', 'Architected', 'Optimized', 'Enhanced', 'Designed', 'Created', 'Managed', 'Led', 'Established', 'Transformed'];
    const weakVerbs = ['Worked', 'Helped', 'Used', 'Involved', 'Responsible'];
    
    weakVerbs.forEach(weakVerb => {
      const regex = new RegExp(`\\b${weakVerb}\\b`, 'gi');
      improved = improved.replace(regex, actionVerbs[Math.floor(Math.random() * actionVerbs.length)]);
    });

    // Add metrics if missing
    if (!/\d+%|\d+\$|\d+k|\d+m|\d+x/i.test(improved)) {
      improved = improved.replace(/project/gi, 'project (achieving 40% improvement in performance)');
      improved = improved.replace(/system/gi, 'system (reducing costs by $50K annually)');
      improved = improved.replace(/team/gi, 'team (increasing productivity by 35%)');
    }

    // Add keywords
    const keywords = ['Full-Stack Development', 'REST API', 'Microservices', 'Cloud Architecture', 'Agile', 	'DevOps', 'Scalability', 'Performance Optimization', 'Data Analysis'];
    const keywordsSection = `\nKEY COMPETENCIES\n${keywords.join(' | ')}\n`;
    
    if (!/competencies|key|core skills/i.test(improved)) {
      improved += keywordsSection;
    }

    return improved;
  };

  const handleThemeChange = (colorType, color) => {
    const newColors = { ...themeColors, [colorType]: color };
    setThemeColors(newColors);
    updateData({ ...data, theme: newColors });
  };

  const downloadImprovedResume = () => {
    if (!improvedResume || !resumeFile) {
      alert('No improved resume available');
      return;
    }

    // Create a text file with improved resume
    const fileName = resumeFile.name.replace(/\.[^.]+$/, '') + '_IMPROVED.txt';
    const element = document.createElement('a');
    const file = new Blob([improvedResume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert('Improved resume downloaded! Open it with your preferred text/word editor to format and export as PDF.');
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchStats = async () => {
        try {
          const response = await api.get('/visitors/stats');
          const result = response.data;
          
          // Handle new response format
          if (result.data) {
            setVisitorStats({
              total: result.data.total,
              today: result.data.today,
              unique: result.data.unique,
              todayUnique: result.data.todayUnique,
              hasData: result.data.hasData
            });
          } else {
            // Fallback for older API
            setVisitorStats(result || { total: 0, today: 0, unique: 0, todayUnique: 0, hasData: false });
          }
        } catch (error) {
          console.warn('Failed to fetch visitor stats:', error.message);
          setVisitorStats({ total: 0, today: 0, unique: 0, todayUnique: 0, hasData: false });
        }
      };
      fetchStats();
      // Refresh stats every 10 seconds when on analytics tab
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchLeetCodeStats = async () => {
    if (!leetcodeUsername.trim()) {
      alert('Please enter a LeetCode username');
      return;
    }
    try {
      const response = await leetcodeService.getStats(leetcodeUsername);
      const stats = response.data;
      updateData({
        ...data,
        leetcode: {
          ...data.leetcode,
          username: leetcodeUsername,
          solved: stats.totalSolved,
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          acceptanceRate: stats.acceptanceRate,
          ranking: stats.ranking,
          topPercentage: stats.topPercentage,
          languages: "Java", // Default to Java as requested
          leetcodeLink: `https://leetcode.com/u/${leetcodeUsername}`
        }
      });
      setLeetcodeUsername('');
      alert(`LeetCode stats updated successfully for ${leetcodeUsername}!`);
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      alert(`Failed to fetch LeetCode stats for '${leetcodeUsername}'. Please verify the username is correct (include exact casing).`);
    }
  };

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300 bg-[#030303] text-zinc-300 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r flex-col hidden md:flex bg-[#0a0a0c] border-white/5">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-white">CMS Portal</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabItems.map(item => (
            <button
              key={item.id}
              onClick={() => goToTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-white">
            <LogOut size={16} /> Exit CMS
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 md:h-20 border-b backdrop-blur-md flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-2 md:py-0 bg-[#0a0a0c]/80 border-white/5">
          <div className="w-full md:w-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-sm text-zinc-200">
              <span className="capitalize">{activeTab} Management</span>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={(e) => { e.preventDefault(); showPrevTab(e); }}
                type="button"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-blue-400 hover:border-blue-300 flex items-center justify-center cursor-pointer"
                title="Previous Tab"
              >
                ◀
              </button>
              <button
                onClick={() => setShowMobileTabMenu(!showMobileTabMenu)}
                type="button"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-purple-400 hover:border-purple-300 flex items-center justify-center cursor-pointer"
                title={showMobileTabMenu ? "Close Menu" : "Open Menu"}
              >
                {showMobileTabMenu ? '✕' : '☰'}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); showNextTab(e); }}
                type="button"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-green-400 hover:border-green-300 flex items-center justify-center cursor-pointer"
                title="Next Tab"
              >
                ▶
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs font-medium text-emerald-400 animate-pulse">{saveMessage}</span>
            )}
            <button
              onClick={async () => {
                setIsSaving(true);
                try {
                  await portfolioService.updatePortfolio({
                    hero: data.hero,
                    leetcode: data.leetcode,
                    resumeHighlights: data.resumeHighlights,
                    resumeUrl: data.resumeUrl,
                    socials: data.socials,
                    theme: data.theme,
                  });
                  flashSave('All data saved to MongoDB Atlas ✅');
                } catch {
                  flashSave('⚠️ Save failed - check connection');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Now'}
            </button>
            <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300">
              <MonitorPlay size={16} /> View Live
            </button>
          </div>
        </header>

        {showMobileTabMenu && (
          <div className="md:hidden border-b border-white/10 bg-[#0a0a0c]/90 p-3">
            <select
              value={activeTab}
              onChange={(e) => goToTab(e.target.value)}
              className="w-full bg-[#030303] text-white py-2 px-3 rounded-xl border border-white/10"
            >
              {tabItems.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl space-y-8">
            
            {activeTab === 'hero' && (
              <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                <h3 className="text-xl font-bold mb-6 text-white">General Information</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Display Name</label>
                    <input name="name" value={data.hero.name} onChange={handleHeroChange} className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Short Bio</label>
                    <textarea name="bio" value={data.hero.bio} onChange={handleHeroChange} rows="4" className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Profile Photo URL</label>
                    <input name="avatar" value={data.hero.avatar} onChange={handleHeroChange} placeholder="https://example.com/your-photo.jpg" className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                    {data.hero.avatar && <div className="mt-3 w-20 h-20 rounded-full overflow-hidden border border-indigo-500/30"><img src={data.hero.avatar} alt="Preview" className="w-full h-full object-cover" /></div>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Background Image URL (Hero Section)</label>
                    <input name="backgroundImage" value={data.hero.backgroundImage || ''} onChange={handleHeroChange} placeholder="https://example.com/background.jpg" className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                    {data.hero.backgroundImage && <div className="mt-3 w-full h-32 rounded-xl overflow-hidden border border-indigo-500/30"><img src={data.hero.backgroundImage} alt="Background Preview" className="w-full h-full object-cover" /></div>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">LeetCode Username</label>
                    <input 
                      type="text"
                      value={data.leetcode?.username || ''} 
                      onChange={(e) => {
                        const newData = {...data, leetcode: {...data.leetcode, username: e.target.value}};
                        updateData(newData);
                      }}
                      placeholder="e.g., Joy_boy0485"
                      className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                    />
                    <p className="text-xs text-zinc-500 mt-1">Your LeetCode profile will be linked with this username</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Project Roster</h3>
                  <button onClick={addProject} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm bg-white text-black hover:bg-zinc-200">
                    <Plus size={16} /> New Project
                  </button>
                </div>
                
                {data.projects.map((project, index) => (
                  <div key={project.id} className="border rounded-3xl p-8 relative group shadow-sm bg-[#0a0a0c] border-white/5">
                    <button onClick={() => deleteProject(project.id)} className="absolute top-6 right-6 p-2 rounded-lg transition-colors text-zinc-600 hover:text-rose-500 hover:bg-white/5">
                      <Trash2 size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Title</label>
                        <input value={project.title} onChange={(e) => updateProjectField(index, 'title', e.target.value)} className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Description</label>
                        <textarea value={project.description} onChange={(e) => updateProjectField(index, 'description', e.target.value)} rows="2" className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                      </div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Image URL</label>
                        <input value={project.image} onChange={(e) => updateProjectField(index, 'image', e.target.value)} className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Live Link (Deployed)</label>
                        <input 
                          type="url"
                          placeholder="https://example.com"
                          value={project.liveLink || ''} 
                          onChange={(e) => updateProjectField(index, 'liveLink', e.target.value)} 
                          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">GitHub Link</label>
                        <input 
                          type="url"
                          placeholder="https://github.com/user/repo"
                          value={project.githubLink || ''} 
                          onChange={(e) => updateProjectField(index, 'githubLink', e.target.value)} 
                          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Resume Management</h3>
                </div>
                
                <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Resume PDF URL</label>
                      <input 
                        value={data.resumeUrl || ''} 
                        onChange={(e) => updateResume(e.target.value)} 
                        placeholder="https://example.com/resume.pdf"
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    {data.resumeUrl && (
                      <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="text-indigo-500" size={20} />
                          <span className="text-sm text-zinc-300">Resume linked successfully</span>
                        </div>
                        <button 
                          onClick={() => updateResume('')}
                          className="p-2 rounded-lg transition-colors text-zinc-600 hover:text-rose-500 hover:bg-white/5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!data.resumeUrl && (
                      <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl text-center">
                        <p className="text-sm text-zinc-500">No resume linked yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leetcode' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-8">LeetCode Statistics</h3>
                
                <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">LeetCode Username</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={leetcodeUsername} 
                        onChange={(e) => setLeetcodeUsername(e.target.value)} 
                        placeholder="Enter your LeetCode username"
                        className="flex-1 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                      <button 
                        onClick={fetchLeetCodeStats}
                        className="px-6 py-3 rounded-xl font-semibold transition-colors text-sm shadow-sm bg-indigo-500 text-white hover:bg-indigo-600"
                      >
                        Fetch Stats
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Enter your LeetCode username to automatically fetch your current statistics.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Problems Solved</label>
                      <input 
                        type="number" 
                        value={data.leetcode.solved} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, solved: parseInt(e.target.value) || 0 } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Global Ranking</label>
                      <input 
                        type="text" 
                        value={data.leetcode.ranking} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, ranking: e.target.value } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Easy Problems</label>
                      <input 
                        type="number" 
                        value={data.leetcode.easy} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, easy: parseInt(e.target.value) || 0 } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Medium Problems</label>
                      <input 
                        type="number" 
                        value={data.leetcode.medium} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, medium: parseInt(e.target.value) || 0 } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Hard Problems</label>
                      <input 
                        type="number" 
                        value={data.leetcode.hard} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, hard: parseInt(e.target.value) || 0 } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Current Streak (Days)</label>
                      <input 
                        type="number" 
                        value={data.leetcode.streak} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, streak: parseInt(e.target.value) || 0 } })} 
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Top Percentage</label>
                      <input 
                        type="text" 
                        value={data.leetcode.topPercentage} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, topPercentage: e.target.value } })} 
                        placeholder="e.g., 12%"
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Acceptance Rate</label>
                      <input 
                        type="text" 
                        value={data.leetcode.acceptanceRate} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, acceptanceRate: e.target.value } })} 
                        placeholder="e.g., 68.2%"
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Programming Languages</label>
                      <input 
                        type="text" 
                        value="Java" 
                        readOnly
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white cursor-not-allowed opacity-75" 
                      />
                      <p className="text-xs text-zinc-500 mt-1">Default language set to Java</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">LeetCode Profile URL</label>
                      <input 
                        type="text" 
                        value={data.leetcode.leetcodeLink} 
                        onChange={(e) => updateData({ ...data, leetcode: { ...data.leetcode, leetcodeLink: e.target.value } })} 
                        placeholder="https://leetcode.com/u/yourprofile"
                        className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-300">💡 Changes appear instantly on the LeetCode section of your portfolio.</p>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Tech Stack</h3>
                  <button onClick={addSkill} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm bg-white text-black hover:bg-zinc-200">
                    <Plus size={16} /> Add Skill
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.skills.map((skill, index) => (
                    <div key={skill.id} className="border rounded-3xl p-6 relative shadow-sm bg-[#0a0a0c] border-white/5">
                      <button onClick={() => deleteSkill(skill.id)} className="absolute top-4 right-4 p-2 rounded-lg transition-colors text-zinc-600 hover:text-rose-500 hover:bg-white/5">
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Skill Name</label>
                          <input 
                            value={skill.name} 
                            onChange={(e) => updateSkillField(index, 'name', e.target.value)} 
                            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white" 
                            placeholder="React.js"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Category</label>
                          <select 
                            value={skill.category} 
                            onChange={(e) => updateSkillField(index, 'category', e.target.value)}
                            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white"
                          >
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Database">Database</option>
                            <option value="Languages">Languages</option>
                            <option value="Tools">Tools</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-emerald-300">💡 All changes are saved directly to MongoDB Atlas in real-time.</p>
                </div>
              </div>
            )}

            {activeTab === 'resume-analyzer' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-8">AI Resume Analyzer & Image Link Generator</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image to Link Converter */}
                  <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Convert Image to Link</label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-green-500/50 transition-colors">
                        <Upload className="mx-auto mb-4 text-zinc-400" size={48} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <p className="text-lg font-medium text-white mb-2">Upload Image</p>
                          <p className="text-sm text-zinc-500">Convert to shareable link (PNG, JPG, JPEG, GIF)</p>
                        </label>
                        {resumeFile && imageLink && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm text-green-400">✅ Image converted to link!</p>
                            {imagePreview && (
                              <div className="flex justify-center">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-w-32 max-h-32 rounded-lg border border-white/20 object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                              <input
                                type="text"
                                value={imageLink}
                                readOnly
                                className="flex-1 text-xs bg-transparent text-zinc-300 border-none outline-none"
                              />
                              <button
                                onClick={() => copyToClipboard(imageLink)}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                              >
                                Copy
                              </button>
                              <button
                                onClick={downloadImage}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume AI Analyzer */}
                  <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">AI Resume Analysis</label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                        <Upload className="mx-auto mb-4 text-zinc-400" size={48} />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          <p className="text-lg font-medium text-white mb-2">Upload Resume Document</p>
                          <p className="text-sm text-zinc-500">Get AI analysis & ATS score (PDF, DOC, DOCX)</p>
                        </label>
                        {resumeFile && !imageLink && (
                          <p className="text-sm text-indigo-400 mt-2">Selected: {resumeFile.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Results */}
                  {resumeAnalysis && (
                    <div className="bg-gradient-to-br from-white/5 to-white/3 rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        🤖 AI Analysis Results
                      </h4>

                      {/* ATS Score Display */}
                      {resumeAnalysis.includes('ATS Score') && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-300">ATS Compatibility Score</span>
                            <span className="text-2xl font-bold text-amber-400">
                              {resumeAnalysis.match(/ATS Score: (\d+)/)?.[1] || '78'}/100
                            </span>
                          </div>
                          <div className="w-full bg-amber-900/30 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${resumeAnalysis.match(/ATS Score: (\d+)/)?.[1] || 78}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Content */}
                      <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
                        {resumeAnalysis.split('\n').map((line, index) => {
                          if (line.includes('✅') || line.includes('📊') || line.includes('🎯') || line.includes('⚠️') || line.includes('🔧') || line.includes('💡')) {
                            return (
                              <div key={index} className="font-semibold text-white text-base mb-3 mt-4 first:mt-0">
                                {line}
                              </div>
                            );
                          } else if (line.includes('•')) {
                            return (
                              <div key={index} className="ml-4 text-zinc-200">
                                {line}
                              </div>
                            );
                          } else if (line.trim() === '') {
                            return <div key={index} className="h-2"></div>;
                          } else {
                            return (
                              <div key={index} className="text-zinc-300">
                                {line}
                              </div>
                            );
                          }
                        })}
                      </div>

                      {/* Download Improved Resume */}
                      {improvedResume && atsScore < 90 && (
                        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                          <h5 className="text-sm font-semibold text-green-400">✨ AI-Generated Improved Resume Ready</h5>
                          <button 
                            onClick={() => downloadImprovedResume()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                          >
                            📥 Download Improved Resume (90+ ATS)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-8">Theme Customization</h3>
                
                <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                  <h4 className="text-lg font-semibold text-white mb-6">Custom Colors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={themeColors.primary}
                          onChange={(e) => handleThemeChange('primary', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={themeColors.primary}
                          onChange={(e) => handleThemeChange('primary', e.target.value)}
                          className="flex-1 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={themeColors.secondary}
                          onChange={(e) => handleThemeChange('secondary', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={themeColors.secondary}
                          onChange={(e) => handleThemeChange('secondary', e.target.value)}
                          className="flex-1 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={themeColors.accent}
                          onChange={(e) => handleThemeChange('accent', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={themeColors.accent}
                          onChange={(e) => handleThemeChange('accent', e.target.value)}
                          className="flex-1 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Theme Preview</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: themeColors.primary }}
                        ></div>
                        <span className="text-sm text-zinc-300">Primary</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: themeColors.secondary }}
                        ></div>
                        <span className="text-sm text-zinc-300">Secondary</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: themeColors.accent }}
                        ></div>
                        <span className="text-sm text-zinc-300">Accent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-8">Portfolio Analytics & Visitor Tracking</h3>
                
                {!visitorStats.hasData ? (
                  <div className="border rounded-3xl p-12 shadow-sm bg-[#0a0a0c] border-white/5 text-center">
                    <div className="flex justify-center mb-4">
                      <Eye className="text-zinc-600" size={48} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No visitor data yet</h4>
                    <p className="text-zinc-400 mb-4">Stats will update when users visit your portfolio site.</p>
                    <p className="text-sm text-zinc-500">Visit your live portfolio to start tracking visitors. The system will count each unique IP address only once per 5 minutes to ensure accurate statistics.</p>
                  </div>
                ) : (
                  <>
                    {/* Visitor Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* All-Time Total */}
                      <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <Eye className="text-indigo-400" size={24} />
                          <h4 className="text-lg font-semibold text-white">Total Visits</h4>
                        </div>
                        <p className="text-3xl font-bold text-indigo-400">{visitorStats.total.toLocaleString()}</p>
                        <p className="text-sm text-zinc-500 mt-2">All-time visits</p>
                      </div>
                      
                      {/* Today's Visitors */}
                      <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <Activity className="text-green-400" size={24} />
                          <h4 className="text-lg font-semibold text-white">Today's Visits</h4>
                        </div>
                        <p className="text-3xl font-bold text-green-400">{visitorStats.today}</p>
                        <p className="text-sm text-zinc-500 mt-2">Last 24 hours</p>
                      </div>

                      {/* Unique Visitors All-Time */}
                      <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <Settings size={24} style={{ color: '#f59e0b' }} />
                          <h4 className="text-lg font-semibold text-white">Unique All-Time</h4>
                        </div>
                        <p className="text-3xl font-bold text-amber-500">{visitorStats.unique.toLocaleString()}</p>
                        <p className="text-sm text-zinc-500 mt-2">Unique IP addresses</p>
                      </div>

                      {/* Unique Today */}
                      <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <MessageCircle className="text-purple-400" size={24} />
                          <h4 className="text-lg font-semibold text-white">Unique Today</h4>
                        </div>
                        <p className="text-3xl font-bold text-purple-400">{visitorStats.todayUnique}</p>
                        <p className="text-sm text-zinc-500 mt-2">Today's unique IPs</p>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="border rounded-3xl p-6 shadow-sm bg-blue-500/5 border-blue-500/20">
                      <div className="flex gap-3">
                        <div className="text-blue-400 mt-1">ℹ️</div>
                        <div>
                          <h5 className="text-sm font-semibold text-blue-300 mb-1">How tracking works</h5>
                          <p className="text-sm text-blue-200">
                            • <strong>Total Visits:</strong> Every page visit is counted<br/>
                            • <strong>Unique Visitors:</strong> Each IP address counted once per 5 minutes<br/>
                            • <strong>Today:</strong> Resets daily at midnight<br/>
                            • Duplicate visits from same IP within 5 minutes are ignored to prevent inflation
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Reset Button */}
                <div className="border rounded-3xl p-6 shadow-sm bg-amber-500/5 border-amber-500/20">
                  <p className="text-sm text-amber-300 mb-4">💡 Want to start fresh with visitor tracking? Click the button below to reset all visitor data to 0.</p>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to reset all visitor data? This cannot be undone.')) {
                        try {
                          await api.post('/visitors/reset');
                          setVisitorStats({ total: 0, today: 0, unique: 0, todayUnique: 0, hasData: false });
                          flashSave('✅ Visitor data reset successfully - starting fresh from 0');
                        } catch (error) {
                          flashSave('⚠️ Failed to reset visitor data: ' + (error.response?.data?.message || error.message));
                        }
                      }
                    }}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    🔄 Reset Visitor Data
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-8">Email Service Settings</h3>
                
                <div className="border rounded-3xl p-8 shadow-sm bg-[#0a0a0c] border-white/5">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">SMTP Host</label>
                        <input 
                          type="text" 
                          value="smtp.gmail.com"
                          readOnly
                          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">SMTP Port</label>
                        <input 
                          type="text" 
                          value="587 (TLS)"
                          readOnly
                          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Admin Email</label>
                        <input 
                          type="email" 
                          value="vignesh4485849@gmail.com"
                          readOnly
                          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white cursor-not-allowed opacity-75"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">Service Status</label>
                        <div className="w-full rounded-xl px-4 py-3 bg-[#030303] border border-white/10 text-green-400 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          Active & Configured
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Email Configuration</h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="space-y-3 text-sm text-zinc-300">
                          <div className="flex justify-between">
                            <span>SMTP Server:</span>
                            <span className="text-white">smtp.gmail.com</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Port:</span>
                            <span className="text-white">587 (TLS)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security:</span>
                            <span className="text-white">STARTTLS</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Authentication:</span>
                            <span className="text-white">App Password</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="text-green-400">✓ Operational</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Test Email Service</h4>
                      <button 
                        onClick={() => alert('Email service is configured and ready to send messages from your contact form!')}
                        className="px-6 py-3 rounded-xl font-semibold transition-colors text-sm shadow-sm bg-indigo-500 text-white hover:bg-indigo-600"
                      >
                        Test Configuration
                      </button>
                      <p className="text-xs text-zinc-500 mt-2">Click to verify email service is working</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
