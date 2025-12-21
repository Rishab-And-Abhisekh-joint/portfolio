'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import {
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink,
  Code, Briefcase, GraduationCap, Award, Trophy, Target, TrendingUp,
  Calendar, ChevronDown, Menu, X, Settings, LogOut, Palette,
  Activity, Flame, Zap, Star, Heart, Coffee, Terminal, FileCode,
  BarChart3, PieChart, LineChart, Clock, CheckCircle, XCircle,
  ChevronRight, Link as LinkIcon, Download, Share2, Eye, BookOpen,
  Cpu, Database, Server, Cloud, Layers, GitBranch, Package
} from 'lucide-react';

// ==================== THEME SYSTEM ====================
const colorThemes = {
  ocean: {
    name: 'Ocean',
    primary: '#06b6d4',
    secondary: '#8b5cf6',
    tertiary: '#3b82f6',
    accent: '#22d3ee',
    gradient: 'from-cyan-500 via-blue-500 to-purple-600',
    gradientHover: 'from-cyan-400 via-blue-400 to-purple-500',
    bgGradient: 'from-slate-950 via-slate-900 to-cyan-950',
    cardBorder: 'border-cyan-500/20',
    cardBg: 'bg-slate-900/50',
    cardHover: 'hover:border-cyan-400/40',
    buttonBg: 'bg-cyan-500',
    buttonHover: 'hover:bg-cyan-400',
    textPrimary: 'text-cyan-400',
    textSecondary: 'text-purple-400',
    glowColor: 'shadow-cyan-500/20',
    ringColor: 'ring-cyan-500/50',
  },
  sunset: {
    name: 'Sunset',
    primary: '#f97316',
    secondary: '#ec4899',
    tertiary: '#ef4444',
    accent: '#fb923c',
    gradient: 'from-orange-500 via-pink-500 to-red-600',
    gradientHover: 'from-orange-400 via-pink-400 to-red-500',
    bgGradient: 'from-slate-950 via-slate-900 to-orange-950',
    cardBorder: 'border-orange-500/20',
    cardBg: 'bg-slate-900/50',
    cardHover: 'hover:border-orange-400/40',
    buttonBg: 'bg-orange-500',
    buttonHover: 'hover:bg-orange-400',
    textPrimary: 'text-orange-400',
    textSecondary: 'text-pink-400',
    glowColor: 'shadow-orange-500/20',
    ringColor: 'ring-orange-500/50',
  },
  forest: {
    name: 'Forest',
    primary: '#22c55e',
    secondary: '#14b8a6',
    tertiary: '#10b981',
    accent: '#4ade80',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    gradientHover: 'from-green-400 via-emerald-400 to-teal-500',
    bgGradient: 'from-slate-950 via-slate-900 to-green-950',
    cardBorder: 'border-green-500/20',
    cardBg: 'bg-slate-900/50',
    cardHover: 'hover:border-green-400/40',
    buttonBg: 'bg-green-500',
    buttonHover: 'hover:bg-green-400',
    textPrimary: 'text-green-400',
    textSecondary: 'text-teal-400',
    glowColor: 'shadow-green-500/20',
    ringColor: 'ring-green-500/50',
  }
};

type ThemeKey = keyof typeof colorThemes;

// ==================== 3D COMPONENTS ====================
function AnimatedSphere({ theme }: { theme: typeof colorThemes.ocean }) {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 200]} scale={2.4}>
        <MeshDistortMaterial
          color={theme.primary}
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Scene3D({ theme }: { theme: typeof colorThemes.ocean }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color={theme.secondary} intensity={0.5} />
      <AnimatedSphere theme={theme} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

// ==================== SECTION COMPONENTS ====================
function HeroSection({ 
  profile, 
  theme, 
  isAuthenticated 
}: { 
  profile: any; 
  theme: typeof colorThemes.ocean;
  isAuthenticated: boolean;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D theme={theme} />
      </div>
      
      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${theme.gradient} p-1`}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            {profile?.name || 'Developer'}
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-400 mb-8"
        >
          {profile?.headline || 'Full Stack Developer | Open Source Enthusiast'}
        </motion.p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          {profile?.github && (
            <a
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full ${theme.cardBg} ${theme.cardBorder} border backdrop-blur-sm transition-all duration-300 hover:scale-110`}
            >
              <Github className={theme.textPrimary} size={24} />
            </a>
          )}
          {profile?.linkedin && (
            <a
              href={`https://linkedin.com/in/${profile.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full ${theme.cardBg} ${theme.cardBorder} border backdrop-blur-sm transition-all duration-300 hover:scale-110`}
            >
              <Linkedin className={theme.textPrimary} size={24} />
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className={`p-3 rounded-full ${theme.cardBg} ${theme.cardBorder} border backdrop-blur-sm transition-all duration-300 hover:scale-110`}
            >
              <Mail className={theme.textPrimary} size={24} />
            </a>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className={`${theme.textPrimary} w-8 h-8`} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function AboutSection({ profile, theme }: { profile: any; theme: typeof colorThemes.ocean }) {
  return (
    <section id="about" className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl font-bold mb-12 text-center bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            About Me
          </h2>
          
          <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-8 backdrop-blur-sm`}>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {profile?.bio || 'Passionate developer with a love for creating innovative solutions. I specialize in building scalable web applications and enjoy exploring new technologies.'}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className={theme.textPrimary} size={20} />
                  <span className="text-gray-400">{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-3">
                  <Mail className={theme.textPrimary} size={20} />
                  <span className="text-gray-400">{profile.email}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className={theme.textPrimary} size={20} />
                  <span className="text-gray-400">{profile.phone}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-3">
                  <Globe className={theme.textPrimary} size={20} />
                  <a href={profile.website} target="_blank" className="text-gray-400 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CodingStatsSection({ 
  handles, 
  theme,
  isAuthenticated 
}: { 
  handles: any; 
  theme: typeof colorThemes.ocean;
  isAuthenticated: boolean;
}) {
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
  const [codeforcesStats, setCodeforcesStats] = useState<any>(null);
  const [codechefStats, setCodechefStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch LeetCode stats
        if (handles?.leetcode) {
          try {
            const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handles.leetcode}/solved`);
            const data = await res.json();
            setLeetcodeStats(data);
          } catch (e) {
            console.error('LeetCode fetch error:', e);
          }
        }

        // Fetch Codeforces stats
        if (handles?.codeforces) {
          try {
            const res = await fetch(`https://codeforces.com/api/user.info?handles=${handles.codeforces}`);
            const data = await res.json();
            if (data.status === 'OK') {
              setCodeforcesStats(data.result[0]);
            }
          } catch (e) {
            console.error('Codeforces fetch error:', e);
          }
        }

        // Fetch CodeChef stats
        if (handles?.codechef) {
          try {
            const res = await fetch(`https://codechef-api.vercel.app/handle/${handles.codechef}`);
            const data = await res.json();
            setCodechefStats(data);
          } catch (e) {
            console.error('CodeChef fetch error:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [handles]);

  if (!handles?.leetcode && !handles?.codeforces && !handles?.codechef) {
    return null;
  }

  return (
    <section id="coding-stats" className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl font-bold mb-12 text-center bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            Coding Profiles
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* LeetCode Card */}
            {handles?.leetcode && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Code className="text-yellow-400" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">LeetCode</h3>
                  </div>
                  <a
                    href={`https://leetcode.com/${handles.leetcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="text-gray-400 hover:text-white" size={20} />
                  </a>
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                ) : leetcodeStats ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-yellow-400">
                      {leetcodeStats.solvedProblem || 0} Solved
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 rounded bg-green-500/20">
                        <div className="text-green-400 font-semibold">{leetcodeStats.easySolved || 0}</div>
                        <div className="text-gray-500">Easy</div>
                      </div>
                      <div className="text-center p-2 rounded bg-yellow-500/20">
                        <div className="text-yellow-400 font-semibold">{leetcodeStats.mediumSolved || 0}</div>
                        <div className="text-gray-500">Medium</div>
                      </div>
                      <div className="text-center p-2 rounded bg-red-500/20">
                        <div className="text-red-400 font-semibold">{leetcodeStats.hardSolved || 0}</div>
                        <div className="text-gray-500">Hard</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Could not load stats</div>
                )}
              </motion.div>
            )}

            {/* Codeforces Card */}
            {handles?.codeforces && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Terminal className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Codeforces</h3>
                  </div>
                  <a
                    href={`https://codeforces.com/profile/${handles.codeforces}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="text-gray-400 hover:text-white" size={20} />
                  </a>
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                ) : codeforcesStats ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-blue-400">
                      {codeforcesStats.rating || 'Unrated'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rank</span>
                        <span className="text-white capitalize">{codeforcesStats.rank || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Rating</span>
                        <span className="text-white">{codeforcesStats.maxRating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Could not load stats</div>
                )}
              </motion.div>
            )}

            {/* CodeChef Card */}
            {handles?.codechef && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Coffee className="text-amber-400" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">CodeChef</h3>
                  </div>
                  <a
                    href={`https://www.codechef.com/users/${handles.codechef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="text-gray-400 hover:text-white" size={20} />
                  </a>
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                ) : codechefStats ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-amber-400">
                      {codechefStats.currentRating || 'Unrated'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stars</span>
                        <span className="text-white">{codechefStats.stars || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Highest Rating</span>
                        <span className="text-white">{codechefStats.highestRating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Could not load stats</div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ExperienceSection({ experiences, theme }: { experiences: any[]; theme: typeof colorThemes.ocean }) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience" className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl font-bold mb-12 text-center bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            Experience
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className={`absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b ${theme.gradient}`}></div>

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative pl-20"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full bg-gradient-to-br ${theme.gradient} border-4 border-slate-900`}></div>

                  <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 backdrop-blur-sm ${theme.cardHover} transition-all duration-300`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
                        <p className={theme.textPrimary}>{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{exp.description}</p>
                    {exp.technologies && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.technologies.map((tech: string, i: number) => (
                          <span
                            key={i}
                            className={`px-3 py-1 text-sm rounded-full ${theme.cardBorder} border ${theme.textPrimary}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectsSection({ projects, theme }: { projects: any[]; theme: typeof colorThemes.ocean }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl font-bold mb-12 text-center bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            Projects
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl overflow-hidden backdrop-blur-sm group`}
              >
                {project.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                  
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 4).map((tech: string, i: number) => (
                        <span
                          key={i}
                          className={`px-2 py-1 text-xs rounded ${theme.cardBorder} border ${theme.textSecondary}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm ${theme.textPrimary} hover:underline`}
                      >
                        <Github size={16} /> Code
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm ${theme.textPrimary} hover:underline`}
                      >
                        <ExternalLink size={16} /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SkillsSection({ skills, theme }: { skills: any[]; theme: typeof colorThemes.ocean }) {
  if (!skills || skills.length === 0) return null;

  const skillCategories = skills.reduce((acc: any, skill: any) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  const categoryIcons: { [key: string]: any } = {
    'Languages': Code,
    'Frontend': Layers,
    'Backend': Server,
    'Database': Database,
    'DevOps': Cloud,
    'Tools': Package,
    'Other': Cpu
  };

  return (
    <section id="skills" className="py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl font-bold mb-12 text-center bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            Skills
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skillCategories).map(([category, categorySkills]: [string, any], index) => {
              const IconComponent = categoryIcons[category] || Cpu;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-6 backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <IconComponent className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill: any, i: number) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1.5 text-sm rounded-lg ${theme.cardBorder} border bg-slate-800/50 text-gray-300 hover:${theme.textPrimary} transition-colors`}
                      >
                        {skill.name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection({ profile, theme }: { profile: any; theme: typeof colorThemes.ocean }) {
  return (
    <section id="contact" className="py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className={`text-4xl font-bold mb-6 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            Get In Touch
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl ${theme.buttonBg} text-white font-semibold transition-all duration-300 hover:scale-105 ${theme.glowColor} shadow-lg`}
              >
                <Mail size={20} />
                Email Me
              </a>
            )}
            {profile?.linkedin && (
              <a
                href={`https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-6 py-3 rounded-xl ${theme.cardBg} ${theme.cardBorder} border text-white font-semibold transition-all duration-300 hover:scale-105`}
              >
                <Linkedin size={20} />
                LinkedIn
              </a>
            )}
            {profile?.github && (
              <a
                href={`https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-6 py-3 rounded-xl ${theme.cardBg} ${theme.cardBorder} border text-white font-semibold transition-all duration-300 hover:scale-105`}
              >
                <Github size={20} />
                GitHub
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== SETTINGS MODAL ====================
function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  handles,
  onHandlesChange
}: {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeKey;
  onThemeChange: (theme: ThemeKey) => void;
  handles: any;
  onHandlesChange: (handles: any) => void;
}) {
  const [localHandles, setLocalHandles] = useState(handles || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onHandlesChange(localHandles);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(colorThemes) as ThemeKey[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => onThemeChange(themeKey)}
                  className={`p-3 rounded-xl border transition-all ${
                    currentTheme === themeKey
                      ? `border-2 ${colorThemes[themeKey].cardBorder.replace('/20', '')}`
                      : 'border-slate-700'
                  }`}
                >
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${colorThemes[themeKey].gradient} mb-2`}></div>
                  <span className="text-sm text-gray-300">{colorThemes[themeKey].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coding Handles */}
          <div className="space-y-4">
            <label className="block text-gray-400">Coding Profiles</label>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">LeetCode Username</label>
              <input
                type="text"
                value={localHandles.leetcode || ''}
                onChange={(e) => setLocalHandles({ ...localHandles, leetcode: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="your-leetcode-username"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Codeforces Handle</label>
              <input
                type="text"
                value={localHandles.codeforces || ''}
                onChange={(e) => setLocalHandles({ ...localHandles, codeforces: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="your-codeforces-handle"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">CodeChef Username</label>
              <input
                type="text"
                value={localHandles.codechef || ''}
                onChange={(e) => setLocalHandles({ ...localHandles, codechef: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="your-codechef-username"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full mt-6 py-3 rounded-xl bg-gradient-to-r ${colorThemes[currentTheme].gradient} text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==================== NAVBAR ====================
function Navbar({
  theme,
  isAuthenticated,
  onSettingsClick,
  onLogout
}: {
  theme: typeof colorThemes.ocean;
  isAuthenticated: boolean;
  onSettingsClick: () => void;
  onLogout: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            className={`text-2xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}
            whileHover={{ scale: 1.05 }}
          >
            Portfolio
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onSettingsClick}
                  className={`p-2 rounded-lg ${theme.cardBg} ${theme.cardBorder} border transition-all hover:scale-105`}
                >
                  <Settings className={theme.textPrimary} size={20} />
                </button>
                <button
                  onClick={onLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme.cardBg} ${theme.cardBorder} border text-gray-300 hover:text-white transition-all`}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${theme.gradient} text-white font-semibold transition-all hover:opacity-90`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {isAuthenticated ? (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { onSettingsClick(); setMenuOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${theme.cardBg} ${theme.cardBorder} border`}
                  >
                    <Settings className={theme.textPrimary} size={18} />
                    Settings
                  </button>
                  <button
                    onClick={() => { onLogout(); setMenuOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${theme.cardBg} ${theme.cardBorder} border text-gray-300`}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { router.push('/auth'); setMenuOpen(false); }}
                  className={`w-full mt-4 py-2 rounded-lg bg-gradient-to-r ${theme.gradient} text-white font-semibold`}
                >
                  Sign In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

// ==================== MAIN PORTFOLIO COMPONENT ====================
interface PortfolioProps {
  isAuthenticated: boolean;
  user: any;
}

export default function Portfolio({ isAuthenticated, user }: PortfolioProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeKey>('ocean');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [handles, setHandles] = useState<any>({});

  const currentTheme = colorThemes[theme];

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (user?.theme && colorThemes[user.theme as ThemeKey]) {
      setTheme(user.theme as ThemeKey);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.username) {
        const res = await fetch(`/api/portfolio/${user.username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setHandles({
            leetcode: data.leetcode,
            codeforces: data.codeforces,
            codechef: data.codechef
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleThemeChange = async (newTheme: ThemeKey) => {
    setTheme(newTheme);
    if (isAuthenticated) {
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  };

  const handleHandlesChange = async (newHandles: any) => {
    setHandles(newHandles);
    if (isAuthenticated) {
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newHandles)
        });
      } catch (error) {
        console.error('Failed to save handles:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 ${currentTheme.cardBorder} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient}`}>
      <Navbar
        theme={currentTheme}
        isAuthenticated={isAuthenticated}
        onSettingsClick={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        <HeroSection
          profile={profile}
          theme={currentTheme}
          isAuthenticated={isAuthenticated}
        />
        
        <AboutSection profile={profile} theme={currentTheme} />
        
        <CodingStatsSection
          handles={handles}
          theme={currentTheme}
          isAuthenticated={isAuthenticated}
        />
        
        <ExperienceSection
          experiences={profile?.experiences || []}
          theme={currentTheme}
        />
        
        <ProjectsSection
          projects={profile?.projects || []}
          theme={currentTheme}
        />
        
        <SkillsSection
          skills={profile?.skills || []}
          theme={currentTheme}
        />
        
        <ContactSection profile={profile} theme={currentTheme} />
      </main>

      <footer className="py-8 text-center text-gray-500 border-t border-slate-800">
        <p>© {new Date().getFullYear()} {profile?.name || 'Portfolio'}. All rights reserved.</p>
      </footer>

      {isAuthenticated && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          handles={handles}
          onHandlesChange={handleHandlesChange}
        />
      )}
    </div>
  );
}