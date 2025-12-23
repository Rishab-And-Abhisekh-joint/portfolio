'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Linkedin, Mail, ExternalLink, Code2, Terminal, 
  Sparkles, ChevronDown, Award, BookOpen, Briefcase,
  Globe, Server, Database, Cpu, Lock, ArrowRight, LogIn, LayoutDashboard,
  Calendar, Target, CheckCircle, Circle, Clock, Flame, Trophy,
  TrendingUp, Zap, Sun, Coffee, Users, Layers
} from 'lucide-react';
import { useTheme, colorThemes, ThemeKey } from '../context/Themecontext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// ============================================
// API FETCHING FUNCTIONS
// ============================================

const fetchWithTimeout = async (url: string, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const fetchLeetCodeData = async (username: string) => {
  const apiEndpoints = [
    {
      url: `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
      parser: (data: any) => ({
        totalSolved: data.totalSolved || 0,
        easy: data.easySolved || 0,
        medium: data.mediumSolved || 0,
        hard: data.hardSolved || 0,
        ranking: data.ranking || 0,
      })
    },
    {
      url: `https://leetcode-stats-api.herokuapp.com/${username}`,
      parser: (data: any) => {
        if (data.status === "success" || data.totalSolved > 0) {
          return {
            totalSolved: data.totalSolved || 0,
            easy: data.easySolved || 0,
            medium: data.mediumSolved || 0,
            hard: data.hardSolved || 0,
            ranking: data.ranking || 0,
          };
        }
        return null;
      }
    }
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetchWithTimeout(endpoint.url, 15000);
      if (!response.ok) continue;
      const data = await response.json();
      const parsed = endpoint.parser(data);
      if (parsed && parsed.totalSolved > 0) return parsed;
    } catch (error: any) {
      continue;
    }
  }
  return null;
};

const fetchCodeforcesData = async (handle: string) => {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await res.json();
    if (data.status === "OK") return data.result[0];
    return null;
  } catch (e) {
    return null;
  }
};

const fetchCodeforcesSubmissions = async (handle: string) => {
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
    const data = await res.json();
    if (data.status === "OK") return data.result;
    return [];
  } catch (e) {
    return [];
  }
};

// ============================================
// DATA CONSTANTS
// ============================================

const USER_PROFILES = {
  leetcode: 'Rishab_Acharjee',
  codeforces: 'rishab.acharjee12345',
};

const skills = [
  { name: 'React/Next.js', level: 90, icon: Globe },
  { name: 'TypeScript', level: 85, icon: Code2 },
  { name: 'Node.js', level: 85, icon: Server },
  { name: 'Python', level: 80, icon: Terminal },
  { name: 'PostgreSQL', level: 75, icon: Database },
  { name: 'System Design', level: 70, icon: Cpu },
];

// Real projects from your portfolio
const projects = [
  {
    title: 'Supply Chain Platform: Agentic Approach',
    description: 'Cloud-native logistics optimization platform for 200+ retail outlets with AI-powered demand forecasting and intelligent routing.',
    tags: ['NestJS', 'Next.js', 'AWS', 'CrewAI', 'Docker', 'LangChain'],
    link: 'https://supply-chain-orcin.vercel.app',
    github: 'https://github.com/Rishab-And-Abhisekh-joint/Supply-Chain',
    date: 'Nov 2024',
  },
  {
    title: 'RAG Chatbot with Document + Video Support',
    description: 'Advanced multi-modal RAG chatbot supporting PDF documents, YouTube videos, and research papers with intelligent retrieval.',
    tags: ['LangChain', 'Python', 'ChromaDB', 'Generative AI'],
    link: '',
    github: 'https://github.com/Rishab-And-Abhisekh-joint/Search_Engine_LLM',
    date: 'Aug 2023',
  },
  {
    title: 'Portfolio Dashboard',
    description: 'Full-stack portfolio with admin dashboard, real-time analytics, and competitive programming tracker.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind'],
    link: '#',
    github: '#',
    date: '2024',
  },
];

// ============================================
// HELPER FUNCTION TO BUILD LEETCODE URL
// ============================================

const buildLeetCodeUrl = (questionLink: string | undefined): string => {
  if (!questionLink) {
    return 'https://leetcode.com/problemset/';
  }
  
  // If it's already a full URL, return as is
  if (questionLink.startsWith('http://') || questionLink.startsWith('https://')) {
    return questionLink;
  }
  
  // If it starts with /problems/, prepend the domain
  if (questionLink.startsWith('/')) {
    return `https://leetcode.com${questionLink}`;
  }
  
  // Otherwise, assume it's a problem slug and build the URL
  return `https://leetcode.com/problems/${questionLink}/`;
};

// ============================================
// DAILY OVERVIEW COMPONENT
// ============================================

const DailyOverview = ({ colors, leetcodeData, cfData, totalProblems }: { colors: any; leetcodeData: any; cfData: any; totalProblems: number }) => {
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, task: 'Solve 2 LeetCode problems', completed: false, priority: 'high' },
    { id: 2, task: 'Review Codeforces editorial', completed: false, priority: 'medium' },
    { id: 3, task: 'Practice Dynamic Programming', completed: false, priority: 'high' },
    { id: 4, task: 'Read System Design chapter', completed: false, priority: 'low' },
    { id: 5, task: 'Attend Codeforces contest', completed: false, priority: 'high' },
  ]);

  const [stats, setStats] = useState({
    streak: 7,
    todaySolved: 0,
    weekSolved: 12,
    pendingReview: 5,
  });

  const [potd, setPotd] = useState<any[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('daily_tasks');
    const savedDate = localStorage.getItem('daily_tasks_date');
    const today = new Date().toDateString();

    if (savedTasks && savedDate === today) {
      setDailyTasks(JSON.parse(savedTasks));
    } else {
      localStorage.setItem('daily_tasks_date', today);
    }

    const savedStats = localStorage.getItem('daily_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    fetchPOTD();
  }, []);

  const fetchPOTD = async () => {
    try {
      const lcRes = await fetch('https://alfa-leetcode-api.onrender.com/daily');
      const lcData = await lcRes.json();
      
      setPotd([
        {
          platform: 'LeetCode',
          title: lcData.questionTitle || 'Daily Challenge',
          link: buildLeetCodeUrl(lcData.questionLink),
          difficulty: lcData.difficulty || 'Medium',
          color: '#ffa116',
        },
        {
          platform: 'GFG',
          title: 'Problem of the Day',
          link: 'https://www.geeksforgeeks.org/problem-of-the-day',
          difficulty: 'Solve Now',
          color: '#2f8d46',
        },
        {
          platform: 'CodeChef',
          title: 'Daily Practice',
          link: 'https://www.codechef.com/practice',
          difficulty: 'Solve Now',
          color: '#5b4638',
        },
      ]);
    } catch (e) {
      setPotd([
        { platform: 'LeetCode', title: 'Daily Challenge', link: 'https://leetcode.com/problemset/', difficulty: 'Solve Now', color: '#ffa116' },
        { platform: 'GFG', title: 'Problem of the Day', link: 'https://www.geeksforgeeks.org/problem-of-the-day', difficulty: 'Solve Now', color: '#2f8d46' },
      ]);
    }
  };

  const toggleTask = (id: number) => {
    const newTasks = dailyTasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setDailyTasks(newTasks);
    localStorage.setItem('daily_tasks', JSON.stringify(newTasks));
    
    const completedToday = newTasks.filter(t => t.completed).length;
    const newStats = { ...stats, todaySolved: completedToday };
    setStats(newStats);
    localStorage.setItem('daily_stats', JSON.stringify(newStats));
  };

  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const progressPercent = (completedTasks / dailyTasks.length) * 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 17) return { text: 'Good Afternoon', icon: Coffee };
    return { text: 'Good Evening', icon: Sparkles };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-red-500 bg-red-500/10';
    if (priority === 'medium') return 'border-yellow-500 bg-yellow-500/10';
    return 'border-green-500 bg-green-500/10';
  };

  return (
    <section className="py-20 px-6 border-b border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        {/* Greeting Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <GreetingIcon className="w-8 h-8" style={{ color: colors.primary }} />
            <h2 className="text-3xl md:text-4xl font-bold">
              {greeting.text}, <span style={{ color: colors.primary }}>Rishab</span>
            </h2>
          </div>
          <p className="text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Daily Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="p-6 rounded-2xl glass">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: colors.primary }} />
                Today's Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl glass text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold" style={{ color: colors.primary }}>{stats.streak}</span>
                  </div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div className="p-4 rounded-xl glass text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.todaySolved}</div>
                  <div className="text-xs text-gray-500">Tasks Done</div>
                </div>
                <div className="p-4 rounded-xl glass text-center">
                  <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {totalProblems > 0 ? totalProblems : '—'}
                  </div>
                  <div className="text-xs text-gray-500">Total Solved</div>
                </div>
                <div className="p-4 rounded-xl glass text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingReview}</div>
                  <div className="text-xs text-gray-500">To Review</div>
                </div>
              </div>
            </div>

            {/* Problem of the Day */}
            <div className="p-6 rounded-2xl glass">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: colors.primary }} />
                Problem of the Day
              </h3>
              
              <div className="space-y-3">
                {potd.map((p, i) => (
                  <motion.a
                    key={i}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="block p-3 rounded-xl glass hover:bg-gray-800/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: `${p.color}20`, color: p.color }}
                        >
                          {p.platform.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium truncate max-w-[150px]">{p.title}</div>
                          <div className="text-xs text-gray-500">{p.platform}</div>
                        </div>
                      </div>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: `${p.color}20`, color: p.color }}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center Column - Daily Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="p-6 rounded-2xl glass h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: colors.primary }} />
                  Today's Tasks
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{completedTasks}/{dailyTasks.length}</span>
                  <div className="w-20 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {dailyTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all hover:bg-gray-800/30 ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.task}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/leaderboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-gray-800/50 transition-all text-sm"
                  >
                    <Trophy className="w-4 h-4" style={{ color: colors.primary }} />
                    Leaderboard
                  </Link>
                  <Link
                    href="/sheets"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-gray-800/50 transition-all text-sm"
                  >
                    <BookOpen className="w-4 h-4" style={{ color: colors.primary }} />
                    DSA Sheets
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-gray-800/50 transition-all text-sm"
                  >
                    <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                    Events
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// DYNAMIC ACHIEVEMENTS COMPONENT
// ============================================

const AchievementsSection = ({ colors, leetcodeData, cfData, totalProblems }: { colors: any; leetcodeData: any; cfData: any; totalProblems: number }) => {
  const lcSolved = leetcodeData?.totalSolved ?? 0;
  const cfMaxRating = cfData?.maxRating ?? 0;
  const cfRank = cfData?.rank || "loading";
  
  const formatCfRank = (rank: string) => {
    if (!rank || rank === "loading") return "Loading...";
    return rank.charAt(0).toUpperCase() + rank.slice(1);
  };

  const isLoading = !leetcodeData && !cfData;

  const achievements = [
    { 
      title: 'Juspay Hiring Challenge', 
      value: 'Top 2%', 
      subtitle: 'Semi-Finals out of 1L+',
      icon: Trophy,
      color: 'text-yellow-400'
    },
    { 
      title: 'Problems Solved', 
      value: isLoading ? '—' : `${totalProblems}+`, 
      subtitle: 'LeetCode + Codeforces',
      icon: Code2,
      color: 'text-cyan-400'
    },
    { 
      title: `Codeforces ${formatCfRank(cfRank)}`, 
      value: isLoading ? '—' : (cfMaxRating > 0 ? cfMaxRating.toString() : '—'), 
      subtitle: 'Max Rating',
      icon: Target,
      color: 'text-blue-400'
    },
    { 
      title: 'LeetCode', 
      value: isLoading ? '—' : (lcSolved > 0 ? `${lcSolved}+` : '—'), 
      subtitle: 'Solutions',
      icon: Zap,
      color: 'text-orange-400'
    },
    { 
      title: 'Leadership', 
      value: '3+', 
      subtitle: 'National Tournaments',
      icon: Users,
      color: 'text-green-400'
    },
    { 
      title: 'Internships', 
      value: '4', 
      subtitle: 'BOSCH, Infinity & more',
      icon: Briefcase,
      color: 'text-purple-400'
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          My <span style={{ color: colors.primary }}>Achievements</span>
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl glass text-center group hover:scale-105 transition-transform"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div 
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: colors.primary }}
              >
                {stat.value}
              </div>
              <div className="font-medium text-sm">{stat.title}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Portfolio() {
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // API Data States
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [cfData, setCfData] = useState<any>(null);
  const [cfSubmissions, setCfSubmissions] = useState<any[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch coding profile data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch LeetCode
      const lcData = await fetchLeetCodeData(USER_PROFILES.leetcode);
      if (lcData) setLeetcodeData(lcData);

      // Fetch Codeforces
      const cfInfo = await fetchCodeforcesData(USER_PROFILES.codeforces);
      if (cfInfo) setCfData(cfInfo);

      const cfSubs = await fetchCodeforcesSubmissions(USER_PROFILES.codeforces);
      if (cfSubs && cfSubs.length > 0) setCfSubmissions(cfSubs);
    };

    fetchData();
  }, []);

  // Calculate total problems
  useEffect(() => {
    const uniqueCf = cfSubmissions?.length > 0 
      ? new Set(cfSubmissions.filter((sub: any) => sub.verdict === "OK").map((sub: any) => `${sub.problem.contestId}-${sub.problem.index}`)).size 
      : 0;
    const total = (leetcodeData?.totalSolved || 0) + uniqueCf;
    setTotalProblems(total);
  }, [leetcodeData, cfSubmissions]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${colors.primary}, transparent)` }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-10"
          style={{ background: `radial-gradient(circle, ${colors.secondary}, transparent)` }}
        />
      </div>

      {/* Daily Overview Section - Added padding for GlobalNavbar */}
      <div className="pt-20">
        <DailyOverview 
          colors={colors} 
          leetcodeData={leetcodeData} 
          cfData={cfData} 
          totalProblems={totalProblems} 
        />
      </div>

      {/* Dynamic Achievements Section */}
      <AchievementsSection 
        colors={colors} 
        leetcodeData={leetcodeData} 
        cfData={cfData} 
        totalProblems={totalProblems} 
      />

      {/* Skills Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            Technical{' '}
            <span style={{ color: colors.primary }}>Skills</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass"
              >
                <div className="flex items-center gap-3 mb-3">
                  <skill.icon className="w-5 h-5" style={{ color: colors.primary }} />
                  <span className="font-medium">{skill.name}</span>
                  <span className="ml-auto text-sm text-gray-400">{skill.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section - Using Real Projects */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            Featured{' '}
            <span style={{ color: colors.primary }}>Projects</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group p-6 rounded-2xl glass overflow-hidden relative"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}
                />
                
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="p-2 rounded-lg" style={{ background: `${colors.primary}20` }}>
                    <Layers className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <span className="text-xs text-gray-500">{project.date}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-3 relative z-10">{project.title}</h3>
                <p className="text-gray-400 mb-4 relative z-10 text-sm">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ 
                        background: `${colors.primary}20`,
                        color: colors.primary
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-400">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 relative z-10">
                  <a 
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Code
                  </a>
                  {project.link && (
                    <a 
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                      style={{ color: colors.primary }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Work{' '}
              <span style={{ color: colors.primary }}>Together</span>
            </h2>
            <p className="text-gray-400 mb-8">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="mailto:rishab.acharjee12345@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 30px ${colors.primary}40`
              }}
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Rishab Acharjee. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/Rishab-And-Abhisekh-joint" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/rishab-acharjee-a317011b9/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}