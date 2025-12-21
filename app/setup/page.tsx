'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, PenTool, ArrowRight, ArrowLeft, Check, Plus, Trash2,
  User, Briefcase, Code2, Trophy, Mail, Sparkles, Save, Loader2,
  ChevronRight, GraduationCap, MapPin, ExternalLink, Github
} from 'lucide-react';
import { useTheme } from '@/app/context/Themecontext';

// Step definitions
const STEPS = [
  { id: 'method', title: 'Choose Method', icon: Sparkles },
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'projects', title: 'Projects', icon: Code2 },
  { id: 'skills', title: 'Skills', icon: PenTool },
  { id: 'achievements', title: 'Achievements', icon: Trophy },
  { id: 'contact', title: 'Contact', icon: Mail },
  { id: 'review', title: 'Review', icon: Check }
];

// Initial data templates
const INITIAL_EXPERIENCE = {
  company: '',
  role: '',
  period: '',
  location: '',
  type: 'Completed',
  certificationLink: '',
  highlights: ['']
};

const INITIAL_PROJECT = {
  title: '',
  date: '',
  description: '',
  tech: [],
  highlights: [''],
  github: '',
  demo: '',
  image: '',
  color: 'from-cyan-500 to-blue-600'
};

const INITIAL_ACHIEVEMENT = {
  title: '',
  description: '',
  highlight: '',
  subtext: '',
  icon: 'Trophy',
  color: 'from-cyan-500 to-blue-600'
};

const SetupPage = () => {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [setupMethod, setSetupMethod] = useState<'resume' | 'manual' | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [profile, setProfile] = useState({
    headline: '',
    bio: '',
    location: '',
    university: '',
    degree: '',
    graduationYear: '',
    sgpa: '',
    profilePhotoUrl: '',
    resumeUrl: '',
    openToOpportunities: true
  });

  const [experiences, setExperiences] = useState([{ ...INITIAL_EXPERIENCE }]);
  const [projects, setProjects] = useState([{ ...INITIAL_PROJECT }]);
  const [skills, setSkills] = useState<Record<string, { icon: string; items: string[] }>>({
    'Programming': { icon: 'Code2', items: [] },
    'Frameworks': { icon: 'Layers', items: [] },
    'Tools': { icon: 'Briefcase', items: [] }
  });
  const [skillsWithProgress, setSkillsWithProgress] = useState<Record<string, { skills: { name: string; percentage: number }[] }>>({
    'Core Skills': { skills: [{ name: '', percentage: 80 }] }
  });
  const [achievements, setAchievements] = useState([{ ...INITIAL_ACHIEVEMENT }]);
  const [codingProfiles, setCodingProfiles] = useState({
    leetcode: '',
    codeforces: '',
    codechef: '',
    github: ''
  });
  const [contact, setContact] = useState({
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    twitter: '',
    website: ''
  });

  // Check auth on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/auth');
        return;
      }
      const data = await res.json();
      if (data.user.profileComplete) {
        router.push('/');
      }
      // Pre-fill email in contact
      setContact(prev => ({ ...prev, email: data.user.email }));
    } catch (err) {
      router.push('/auth');
    }
  };

  // Parse resume (mock implementation - would use AI service in production)
  const parseResume = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed data - in production, this would come from an AI parsing service
      setProfile({
        headline: 'Software Engineer',
        bio: 'Passionate developer with experience in full-stack development.',
        location: 'San Francisco, CA',
        university: 'Stanford University',
        degree: 'B.S. Computer Science',
        graduationYear: '2024',
        sgpa: '3.8',
        profilePhotoUrl: '',
        resumeUrl: '',
        openToOpportunities: true
      });

      setExperiences([{
        company: 'Tech Company',
        role: 'Software Engineer Intern',
        period: 'Jun 2023 - Aug 2023',
        location: 'San Francisco',
        type: 'Completed',
        certificationLink: '',
        highlights: [
          'Developed features for main product',
          'Collaborated with cross-functional teams'
        ]
      }]);

      setCurrentStep(1); // Move to basic info to review/edit
    } catch (err) {
      setError('Failed to parse resume. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  };

  // Save profile
  const saveProfile = async () => {
    setSaving(true);
    setError('');

    try {
      // Transform coding profiles for API
      const codingProfilesArray = Object.entries(codingProfiles)
        .filter(([_, username]) => username)
        .map(([platform, username]) => ({
          platform,
          username,
          url: getPlatformUrl(platform, username)
        }));

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          experiences: experiences.filter(e => e.company),
          projects: projects.filter(p => p.title),
          skills,
          skillProgress: skillsWithProgress,
          achievements: achievements.filter(a => a.title),
          codingProfiles: codingProfilesArray,
          contact
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getPlatformUrl = (platform: string, username: string) => {
    const urls: Record<string, string> = {
      leetcode: `https://leetcode.com/u/${username}`,
      codeforces: `https://codeforces.com/profile/${username}`,
      codechef: `https://www.codechef.com/users/${username}`,
      github: `https://github.com/${username}`
    };
    return urls[platform] || '';
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Array helpers
  const addItem = (setter: any, template: any) => {
    setter((prev: any[]) => [...prev, { ...template }]);
  };

  const removeItem = (setter: any, index: number) => {
    setter((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (setter: any, index: number, field: string, value: any) => {
    setter((prev: any[]) => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateHighlight = (setter: any, itemIndex: number, highlightIndex: number, value: string) => {
    setter((prev: any[]) => prev.map((item, i) => 
      i === itemIndex 
        ? { ...item, highlights: item.highlights.map((h: string, hi: number) => hi === highlightIndex ? value : h) }
        : item
    ));
  };

  const addHighlight = (setter: any, itemIndex: number) => {
    setter((prev: any[]) => prev.map((item, i) => 
      i === itemIndex ? { ...item, highlights: [...item.highlights, ''] } : item
    ));
  };

  // Render step content
  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'method':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className={`text-3xl font-bold ${colors.gradientText} bg-clip-text text-transparent mb-4`}>
                How would you like to set up your portfolio?
              </h2>
              <p className="text-gray-400">Choose the method that works best for you</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Resume Option */}
              <motion.button
                onClick={() => { setSetupMethod('resume'); parseResume(); }}
                className={`p-8 rounded-2xl border-2 transition-all text-left ${
                  setupMethod === 'resume' 
                    ? `${colors.borderAccent} bg-white/5` 
                    : 'border-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <FileText className={`${colors.textAccent} mb-4`} size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Use My Resume</h3>
                <p className="text-gray-400 text-sm">
                  We&apos;ll automatically extract information from your uploaded resume
                </p>
                {loading && setupMethod === 'resume' && (
                  <div className="flex items-center gap-2 mt-4 text-gray-300">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">Parsing resume...</span>
                  </div>
                )}
              </motion.button>

              {/* Manual Option */}
              <motion.button
                onClick={() => { setSetupMethod('manual'); nextStep(); }}
                className={`p-8 rounded-2xl border-2 transition-all text-left ${
                  setupMethod === 'manual' 
                    ? `${colors.borderAccent} bg-white/5` 
                    : 'border-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <PenTool className={`${colors.textAccent} mb-4`} size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Fill Manually</h3>
                <p className="text-gray-400 text-sm">
                  Enter your information step by step with our guided form
                </p>
              </motion.button>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Professional Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="AI Engineer • Full-Stack Developer"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Bio / About Me</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell your story in a few sentences..."
                rows={4}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">University</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    placeholder="MIT, Stanford, etc."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Degree</label>
                <input
                  type="text"
                  value={profile.degree}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  placeholder="B.Tech CSE"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Graduation Year</label>
                <input
                  type="text"
                  value={profile.graduationYear}
                  onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                  placeholder="2026"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">SGPA / GPA</label>
                <input
                  type="text"
                  value={profile.sgpa}
                  onChange={(e) => setProfile({ ...profile, sgpa: e.target.value })}
                  placeholder="8.78"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="openToOpp"
                checked={profile.openToOpportunities}
                onChange={(e) => setProfile({ ...profile, openToOpportunities: e.target.checked })}
                className={`w-5 h-5 rounded ${colors.bgAccent}`}
              />
              <label htmlFor="openToOpp" className="text-gray-300">
                Open to opportunities
              </label>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
                Work Experience
              </h2>
              <motion.button
                onClick={() => addItem(setExperiences, INITIAL_EXPERIENCE)}
                className={`px-4 py-2 ${colors.buttonGradient} rounded-lg text-white text-sm flex items-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Experience
              </motion.button>
            </div>

            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 rounded-xl p-6 border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${colors.bgAccent}/20 ${colors.textAccent}`}>
                    Experience {index + 1}
                  </span>
                  {experiences.length > 1 && (
                    <button
                      onClick={() => removeItem(setExperiences, index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateItem(setExperiences, index, 'company', e.target.value)}
                    placeholder="Company Name"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateItem(setExperiences, index, 'role', e.target.value)}
                    placeholder="Role / Position"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateItem(setExperiences, index, 'period', e.target.value)}
                    placeholder="Jan 2024 - Present"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateItem(setExperiences, index, 'location', e.target.value)}
                    placeholder="Location"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                  <select
                    value={exp.type}
                    onChange={(e) => updateItem(setExperiences, index, 'type', e.target.value)}
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Current">Current</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Key Highlights (STAR Format)</label>
                  {exp.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(setExperiences, index, hIndex, e.target.value)}
                        placeholder="Situation: ... Task: ... Action: ... Result: ..."
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 text-white text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addHighlight(setExperiences, index)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus size={14} /> Add highlight
                  </button>
                </div>

                <input
                  type="text"
                  value={exp.certificationLink}
                  onChange={(e) => updateItem(setExperiences, index, 'certificationLink', e.target.value)}
                  placeholder="Certificate/Proof Link (optional)"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </motion.div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
                Projects
              </h2>
              <motion.button
                onClick={() => addItem(setProjects, INITIAL_PROJECT)}
                className={`px-4 py-2 ${colors.buttonGradient} rounded-lg text-white text-sm flex items-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Project
              </motion.button>
            </div>

            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 rounded-xl p-6 border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${colors.bgAccent}/20 ${colors.textAccent}`}>
                    Project {index + 1}
                  </span>
                  {projects.length > 1 && (
                    <button
                      onClick={() => removeItem(setProjects, index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateItem(setProjects, index, 'title', e.target.value)}
                    placeholder="Project Title"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                  <input
                    type="text"
                    value={project.date}
                    onChange={(e) => updateItem(setProjects, index, 'date', e.target.value)}
                    placeholder="Date (e.g., Nov 2024)"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                </div>

                <textarea
                  value={project.description}
                  onChange={(e) => updateItem(setProjects, index, 'description', e.target.value)}
                  placeholder="Short description of the project..."
                  rows={2}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white mb-4 resize-none"
                />

                <input
                  type="text"
                  value={project.tech.join(', ')}
                  onChange={(e) => updateItem(setProjects, index, 'tech', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="Technologies (comma-separated): React, Node.js, AWS"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white mb-4"
                />

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Github className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={project.github}
                      onChange={(e) => updateItem(setProjects, index, 'github', e.target.value)}
                      placeholder="GitHub URL"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white"
                    />
                  </div>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={project.demo}
                      onChange={(e) => updateItem(setProjects, index, 'demo', e.target.value)}
                      placeholder="Live Demo URL"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Key Highlights (STAR Format)</label>
                  {project.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(setProjects, index, hIndex, e.target.value)}
                        placeholder="Situation: ... Task: ... Action: ... Result: ..."
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 text-white text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addHighlight(setProjects, index)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus size={14} /> Add highlight
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Skills & Technologies
            </h2>

            <div className="space-y-4">
              {Object.entries(skills).map(([category, data]) => (
                <div key={category} className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                  <input
                    type="text"
                    value={category}
                    className="bg-transparent text-white font-semibold mb-2 focus:outline-none"
                    readOnly
                  />
                  <input
                    type="text"
                    value={data.items.join(', ')}
                    onChange={(e) => setSkills({
                      ...skills,
                      [category]: { ...data, items: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="Enter skills comma-separated: Python, JavaScript, React"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 text-white text-sm"
                  />
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-white mt-8">Skill Progress Bars</h3>
            <p className="text-gray-400 text-sm mb-4">Add skills with proficiency levels for visual display</p>
            
            {Object.entries(skillsWithProgress).map(([category, data]) => (
              <div key={category} className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                <h4 className="text-white font-medium mb-3">{category}</h4>
                {data.skills.map((skill, index) => (
                  <div key={index} className="flex gap-4 mb-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => {
                        const newSkills = [...data.skills];
                        newSkills[index].name = e.target.value;
                        setSkillsWithProgress({ ...skillsWithProgress, [category]: { skills: newSkills } });
                      }}
                      placeholder="Skill name"
                      className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 text-white text-sm"
                    />
                    <input
                      type="number"
                      value={skill.percentage}
                      onChange={(e) => {
                        const newSkills = [...data.skills];
                        newSkills[index].percentage = parseInt(e.target.value) || 0;
                        setSkillsWithProgress({ ...skillsWithProgress, [category]: { skills: newSkills } });
                      }}
                      placeholder="%"
                      min="0"
                      max="100"
                      className="w-20 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-4 text-white text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newSkills = [...data.skills, { name: '', percentage: 80 }];
                    setSkillsWithProgress({ ...skillsWithProgress, [category]: { skills: newSkills } });
                  }}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mt-2"
                >
                  <Plus size={14} /> Add skill
                </button>
              </div>
            ))}

            <h3 className="text-lg font-semibold text-white mt-8">Coding Profiles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(codingProfiles).map(([platform, username]) => (
                <div key={platform}>
                  <label className="block text-sm text-gray-400 mb-2 capitalize">{platform}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, [platform]: e.target.value })}
                    placeholder={`${platform} username`}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
                Achievements
              </h2>
              <motion.button
                onClick={() => addItem(setAchievements, INITIAL_ACHIEVEMENT)}
                className={`px-4 py-2 ${colors.buttonGradient} rounded-lg text-white text-sm flex items-center gap-2`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} /> Add Achievement
              </motion.button>
            </div>

            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 rounded-xl p-6 border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${colors.bgAccent}/20 ${colors.textAccent}`}>
                    Achievement {index + 1}
                  </span>
                  {achievements.length > 1 && (
                    <button
                      onClick={() => removeItem(setAchievements, index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={achievement.title}
                    onChange={(e) => updateItem(setAchievements, index, 'title', e.target.value)}
                    placeholder="Achievement Title"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                  <input
                    type="text"
                    value={achievement.highlight}
                    onChange={(e) => updateItem(setAchievements, index, 'highlight', e.target.value)}
                    placeholder="Highlight (e.g., Top 2%, 500+)"
                    className="bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                  />
                </div>

                <textarea
                  value={achievement.description}
                  onChange={(e) => updateItem(setAchievements, index, 'description', e.target.value)}
                  placeholder="Description..."
                  rows={2}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white mb-4 resize-none"
                />

                <input
                  type="text"
                  value={achievement.subtext}
                  onChange={(e) => updateItem(setAchievements, index, 'subtext', e.target.value)}
                  placeholder="Subtext (e.g., out of 100,000 participants)"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </motion.div>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={contact.linkedin}
                onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">GitHub URL</label>
              <input
                type="url"
                value={contact.github}
                onChange={(e) => setContact({ ...contact, github: e.target.value })}
                placeholder="https://github.com/yourusername"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Twitter/X URL</label>
                <input
                  type="url"
                  value={contact.twitter}
                  onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourusername"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Personal Website</label>
                <input
                  type="url"
                  value={contact.website}
                  onChange={(e) => setContact({ ...contact, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colors.buttonGradient} mb-4`}>
              <Check size={40} className="text-white" />
            </div>
            <h2 className={`text-3xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Ready to Publish!
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your portfolio is ready. Click publish to make it live at your unique URL.
            </p>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-white/5 text-left max-w-md mx-auto">
              <h3 className="text-white font-semibold mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experiences:</span>
                  <span className="text-white">{experiences.filter(e => e.company).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projects:</span>
                  <span className="text-white">{projects.filter(p => p.title).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skill Categories:</span>
                  <span className="text-white">{Object.keys(skills).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Achievements:</span>
                  <span className="text-white">{achievements.filter(a => a.title).length}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <motion.button
              onClick={saveProfile}
              disabled={saving}
              className={`px-8 py-4 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center justify-center gap-2 mx-auto`}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  Publish Portfolio
                </>
              )}
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-6">
      {/* Background */}
      <div className={`fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950 -z-10`} />

      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800">
              <motion.div
                className={`h-full ${colors.buttonGradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <motion.button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`relative z-10 flex flex-col items-center ${
                    index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  whileHover={index <= currentStep ? { scale: 1.05 } : {}}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? `${colors.buttonGradient} text-white`
                      : isCompleted
                        ? `${colors.bgAccent} text-white`
                        : 'bg-slate-800 text-gray-500'
                  }`}>
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs mt-2 hidden md:block ${
                    isActive ? colors.textAccent : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[60vh]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <div className="flex justify-between mt-12">
            <motion.button
              onClick={prevStep}
              className="px-6 py-3 bg-slate-800 rounded-xl text-white flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={18} /> Back
            </motion.button>
            <motion.button
              onClick={nextStep}
              className={`px-6 py-3 ${colors.buttonGradient} rounded-xl text-white flex items-center gap-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next <ArrowRight size={18} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPage;