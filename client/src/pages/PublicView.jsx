import React, { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Lock,
  ArrowRight,
  Sparkles,
  Download,
  Send,
  ChevronUp,
  FileText,
  CheckCircle2,
  Mail,
  Terminal,
  Flame,
  Trophy,
  Target,
  Activity,
  Code2,
  Database,
  Layout,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import BentoCard from '../components/BentoCard';
import CircularProgress from '../components/CircularProgress';
import { useTypingEffect } from '../components/TypingAnimation';

const hexToRgba = (hex, alpha = 1) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PublicView = ({ data, onLoginClick }) => {
  useEffect(() => {
    // Track visitor
    fetch('http://localhost:5001/api/visitors/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: window.location.pathname })
    }).catch(() => console.log('Tracking failed'));
  }, []);
  const typedRole = useTypingEffect(data.hero.roles);
  const themeColors = data.theme || { primary: '#6366f1', secondary: '#0a0a0c', accent: '#f59e0b' };
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus({ type: 'success', text: 'Message sent successfully! We will get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus({ type: 'error', text: 'Failed to send message. Please try again.' });
      }
    } catch {
      setSubmitStatus({ type: 'error', text: 'Error sending message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'LeetCode', href: '#leetcode' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Resume', href: '#resume' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div
      className="min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden"
      style={{
        backgroundColor: themeColors.secondary,
        color: '#e2e8f0'
      }}
    >
      
      {/* Floating Navbar */}
      <nav className="fixed top-6 inset-x-0 mx-auto w-max z-50 px-4">
        <div
          className="backdrop-blur-xl border rounded-full px-4 md:px-6 py-3 flex items-center gap-4 md:gap-6 shadow-2xl overflow-x-auto hide-scrollbar max-w-full transition-colors duration-300"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.12)'
          }}
        >
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 tracking-tight shrink-0">
            Vignesh.
          </span>
          <div className="h-4 w-[1px] bg-white/10 shrink-0"></div>
          <div className="flex items-center gap-4 md:gap-5 shrink-0">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-xs md:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-white/10 shrink-0 ml-2"></div>
            <button onClick={onLoginClick} className="text-zinc-400 hover:text-indigo-400 transition-colors ml-1" title="Admin Access">
              <Lock size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Background Ambient Glows */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[120px] opacity-50 pointer-events-none transition-opacity duration-300"
        style={{ backgroundColor: hexToRgba(themeColors.primary, 0.16) }}
      ></div>
      <div
        className="fixed bottom-0 right-0 w-[800px] h-[600px] rounded-full blur-[150px] opacity-30 pointer-events-none transition-opacity duration-300"
        style={{ backgroundColor: hexToRgba(themeColors.accent, 0.18) }}
      ></div>
      {data.hero.backgroundImage && (
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <img src={data.hero.backgroundImage} alt="background" className="w-full h-full object-cover" />
        </div>
      )}

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24">
        
        {/* HERO SECTION */}
        <section id="home" className="flex flex-col items-center text-center mb-32 scroll-mt-40">
          <div className="relative mb-8 group cursor-default">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur-lg group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative w-28 h-28 rounded-full border-2 border-white/10 overflow-hidden shadow-lg bg-[#0a0a0c]">
              <img src={data.hero.avatar} alt="Vignesh" className="w-full h-full object-cover" />
              {data.hero.backgroundImage && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <img src={data.hero.backgroundImage} alt="bg" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div
              className="absolute -bottom-2 -right-2 text-white text-xs px-3 py-1 rounded-full border-2 border-[#030303] flex items-center gap-1 shadow-lg"
              style={{ backgroundColor: themeColors.accent }}
            >
              <Sparkles size={12} /> Open to work
            </div>
          </div>

          <h1
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 transition-colors duration-300"
            style={{
              background: `linear-gradient(to bottom, ${themeColors.primary}, #ffffff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {data.hero.name}
          </h1>
          
          <div className="text-xl md:text-2xl font-medium h-8 mb-8 flex items-center justify-center gap-2">
            <span>Building</span>
            <span style={{ color: '#ffffff' }} className="transition-colors duration-300">{typedRole}</span>
            <span className="w-1 h-6 animate-pulse" style={{ backgroundColor: themeColors.primary }}></span>
          </div>

          <p className="max-w-2xl text-lg text-zinc-400 leading-relaxed mb-10 transition-colors duration-300">
            {data.hero.bio}
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#projects"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all"
              style={{
                backgroundColor: themeColors.primary,
                color: '#fff'
              }}
            >
              View Projects <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="flex gap-2">
              <a href={data.socials.github} target="_blank" rel="noreferrer" className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
                <Github size={20} />
              </a>
              <a href={data.socials.linkedin} target="_blank" rel="noreferrer" className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </section>

        {/* LEETCODE SECTION */}
        <section id="leetcode" className="mb-32 scroll-mt-32">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Problem Solving</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Stats Card */}
            <BentoCard className="lg:col-span-2 flex flex-col justify-between relative overflow-hidden border-amber-500/10 hover:border-amber-500/30">
              {/* Subtle background glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">LeetCode Profile</h3>
                  <p className="text-zinc-500">Algorithmic proficiency & stats</p>
                </div>
                <div className="flex items-center gap-3">
                  {data.leetcode.leetcodeLink && (
                    <a href={data.leetcode.leetcodeLink} target="_blank" rel="noreferrer" className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-sm hover:bg-amber-500/20 transition-colors">
                      <ExternalLink className="text-amber-500" size={24} />
                    </a>
                  )}
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-sm">
                    <Terminal className="text-amber-500" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                {/* Big Ring */}
                <div className="shrink-0 relative">
                   <CircularProgress value={data.leetcode.solved} percentage={100} label="Total Solved" color="text-amber-500" />
                </div>
                
                {/* Detailed Stat Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 text-sm mb-1 flex items-center gap-2 font-medium"><Trophy size={14} className="text-amber-500"/> Global Rank</div>
                    <div className="text-xl font-bold text-white">{data.leetcode.ranking}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 text-sm mb-1 flex items-center gap-2 font-medium"><Target size={14} style={{ color: themeColors.primary }} /> Top %</div>
                    <div className="text-xl font-bold text-white">{data.leetcode.topPercentage}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 text-sm mb-1 flex items-center gap-2 font-medium"><Activity size={14} className="text-emerald-500"/> Acceptance</div>
                    <div className="text-xl font-bold text-white">{data.leetcode.acceptanceRate}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-zinc-500 text-sm mb-1 flex items-center gap-2 font-medium"><Code2 size={14} className="text-purple-500"/> Languages</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.leetcode.languages && data.leetcode.languages !== 'N/A' ? (
                        data.leetcode.languages.split(',').map((lang, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs font-semibold text-purple-300">
                            {lang.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-400">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Difficulty Breakdown Card */}
            <BentoCard className="flex flex-col justify-between border-amber-500/10 hover:border-amber-500/30">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Difficulty</h3>
                <p className="text-zinc-500 text-sm">Problems solved by level</p>
              </div>
              
              <div className="space-y-6 mt-auto">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-emerald-500">Easy</span>
                    <span className="text-zinc-400 font-mono"><span className="text-white font-bold">{data.leetcode.easy}</span> / 800</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${(data.leetcode.easy/800)*100}%` }}></div>
                  </div>
                </div>
                {/* Medium */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-amber-500">Medium</span>
                    <span className="text-zinc-400 font-mono"><span className="text-white font-bold">{data.leetcode.medium}</span> / 1600</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-1000 ease-out" style={{ width: `${(data.leetcode.medium/1600)*100}%` }}></div>
                  </div>
                </div>
                {/* Hard */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-rose-500">Hard</span>
                    <span className="text-zinc-400 font-mono"><span className="text-white font-bold">{data.leetcode.hard}</span> / 700</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-out" style={{ width: `${(data.leetcode.hard/700)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Streak & Activity Card */}
            <BentoCard className="lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#0a0a0c] to-amber-950/20 border border-amber-500/10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Flame className="text-amber-500" size={40} />
                </div>
                <div>
                  <div className="text-4xl font-black text-white tracking-tighter mb-1">
                    {data.leetcode.streak} <span className="text-xl text-amber-500">Days</span>
                  </div>
                  <div className="text-sm font-semibold text-amber-500 uppercase tracking-widest">Active Streak</div>
                </div>
              </div>

              {/* Interactive Mock Activity Graph */}
              <div className="hidden sm:flex items-end gap-1.5 opacity-90 p-4 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                {Array.from({ length: 28 }).map((_, i) => {
                  const level = Math.floor(Math.random() * 4);
                  const colors = [
                    'bg-white/5', 
                    'bg-amber-500/40', 
                    'bg-amber-500/70', 
                    'bg-amber-500', 
                  ];
                  // Ensure recent days are active to reflect the current streak
                  const isActive = i > 15 ? (level === 0 ? 1 : level) : level; 
                  
                  return (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-[4px] ${colors[isActive]} transition-all duration-300 hover:scale-125 cursor-pointer shadow-sm`}
                      title={`${isActive * 2} submissions`}
                    ></div>
                  );
                })}
              </div>
            </BentoCard>

          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="mb-32 scroll-mt-32">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Technical Arsenal</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <BentoCard className="flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Tech Stack</h3>
                <p className="text-zinc-500">The tools and technologies I use to build scalable products.</p>
              </div>
              <Code2 className="text-indigo-400" size={32} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {data.skills.map(skill => (
                <div key={skill.id} className="relative group overflow-hidden p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 hover:-translate-y-1 cursor-default"
                 style={{ borderColor: hexToRgba(themeColors.primary, 0.4) }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{ background: `linear-gradient(135deg, ${hexToRgba(themeColors.primary, 0.15)}, ${hexToRgba(themeColors.accent, 0.12)})` }}></div>
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                      <Database size={16} className="text-zinc-500 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-200 text-sm group-hover:text-indigo-300 transition-colors">{skill.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{skill.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="mb-32 scroll-mt-32">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Selected Works</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          {/* Project Count Badge */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-400">{data.projects.length} Projects</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.projects.map((project, index) => (
              <div 
                key={project.id} 
                className="group relative h-[420px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0a0a0c] to-[#050505] border border-white/10 shadow-lg hover:shadow-indigo-500/30 transition-all duration-700 hover:-translate-y-3 flex flex-col"
              >
                {/* Gradient Background Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Background Image */}
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-30"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-transparent opacity-95"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay"></div>
                
                {/* Content Container */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  
                  {/* Top Action Section */}
                  <div className="flex justify-between items-start">
                    {/* Index Badge */}
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-400">0{index + 1}</span>
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="flex gap-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg hover:scale-110">
                        <ExternalLink size={16} />
                      </a>
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg hover:scale-110">
                        <Github size={16} />
                      </a>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-3 space-y-3">
                    {/* Featured Badge */}
                    <div className="flex items-center gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Sparkles size={13} className="text-indigo-400" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Featured</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                      {project.title}
                    </h3>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm shadow-sm">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/10 text-zinc-400 border border-white/10 backdrop-blur-sm">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Description - Only on Hover */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                      <div className="overflow-hidden">
                        <p className="text-zinc-400 leading-relaxed text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Bottom Border Glow */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:w-full transition-all duration-700 ease-out"></div>
                
                {/* Corner Accent */}
                <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </section>

        {/* ENHANCED RESUME SECTION */}
        <section id="resume" className="mb-32 scroll-mt-32 relative">
          <BentoCard className="flex flex-col md:flex-row items-center justify-between gap-12 !p-8 md:!p-12">
            <div className="flex-1 w-full">
              <h2 className="text-4xl font-bold text-white mb-4">Professional Overview</h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-xl">
                Ready to dive deeper into my professional journey? Grab my resume to explore my complete technical experience, educational background, and major accomplishments.
              </p>
              
              <ul className="space-y-4 mb-10">
                {data.resumeHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-indigo-500 mt-1 shrink-0" size={20} />
                    <span className="text-zinc-300 font-medium">{highlight}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={data.resumeUrl}
                download
                className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25 shrink-0"
              >
                <Download size={20} /> Download Complete Resume
              </a>
            </div>

            {/* Stylized Document Graphic */}
            <div className="relative w-full md:w-1/3 aspect-[3/4] max-w-sm bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-8 bg-white/5 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-white/5 rounded"></div>
              <div className="w-full h-32 bg-white/5 rounded mt-4"></div>
              <div className="w-5/6 h-4 bg-white/5 rounded"></div>
              <div className="w-4/6 h-4 bg-white/5 rounded"></div>
              <div className="w-full h-4 bg-white/5 rounded"></div>
              
              {/* Floating Icon */}
              <div className="absolute -bottom-6 -left-6 bg-indigo-500 text-white p-5 rounded-full shadow-2xl border-4 border-[#0a0a0c]">
                <FileText size={32} />
              </div>
              <div className="absolute -top-4 -right-4 bg-purple-500 text-white p-2 rounded-full shadow-xl">
                <Sparkles size={16} />
              </div>
            </div>
          </BentoCard>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="mb-12 scroll-mt-32">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <h2 className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Let's Connect</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <div className="max-w-2xl mx-auto">
            <BentoCard>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Get In Touch</h3>
                <p className="text-zinc-500">Have a project in mind or just want to say hi? Send me a message.</p>
              </div>

              <form className="space-y-5" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Message</label>
                  <textarea 
                    rows="4" 
                    placeholder="Hello Vignesh, I would like to discuss..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  ></textarea>
                </div>
                
                {submitStatus && (
                  <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    submitStatus.type === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  }`}>
                    <CheckCircle2 size={18} />
                    {submitStatus.text}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} /> {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </BentoCard>
          </div>
        </section>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/6381902628"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          title="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with me!
          </div>
        </a>

      </main>
    </div>
  );
};

export default PublicView;
