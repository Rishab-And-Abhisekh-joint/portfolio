'use client';

import React, { useState, useEffect, useRef, Suspense, createContext, useContext, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { 
  Github, Linkedin, Mail, Phone, ExternalLink, Code2, Database, 
  Cloud, Cpu, Menu, X, Award, Briefcase, ChevronRight,
  GraduationCap, Terminal, Layers, Send, FileText,
  Activity, Zap, Trophy, Target, Settings, Save, Users, Palette,
  Sparkles, Rocket, Server, Braces, MapPin
} from 'lucide-react';
import * as THREE from 'three';

// ============================================
// TYPES
// ============================================

interface PortfolioData {
  id?: string;
  username: string;
  name: string;
  email?: string;
  theme?: string;
  headline?: string;
  bio?: string;
  location?: string;
  university?: string;
  degree?: string;
  graduationYear?: string;
  sgpa?: string;
  experiences?: any[];
  projects?: any[];
  skills?: any[];
  achievements?: any[];
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  phone?: string;
  openToOpportunities?: boolean;
}

// ============================================
// SMOOTH SCROLL HOOK
// ============================================

const useSmoothScroll = () => {
  const scrollY = useMotionValue(0);
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, mass: 0.5, restDelta: 0.001 });

  useEffect(() => {
    let rafId: number;
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    const ease = 0.08;

    const smoothScroll = () => {
      currentScroll += (targetScroll - currentScroll) * ease;
      scrollY.set(currentScroll);
      rafId = requestAnimationFrame(smoothScroll);
    };

    const handleScroll = () => { targetScroll = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollY]);

  return smoothScrollY;
};

// ============================================
// ANIMATION CONFIGURATIONS
// ============================================

const springConfigs = {
  gentle: { stiffness: 100, damping: 30, mass: 0.8, restDelta: 0.001 },
  snappy: { stiffness: 400, damping: 40, mass: 0.5, restDelta: 0.001 },
  tilt: { stiffness: 150, damping: 20, mass: 0.3, restDelta: 0.001 },
  page: { stiffness: 80, damping: 25, mass: 1, restDelta: 0.001 },
  hover: { stiffness: 300, damping: 25, mass: 0.5, restDelta: 0.001 },
  scroll: { stiffness: 50, damping: 20, mass: 0.5, restDelta: 0.001 }
};

const easings = {
  smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  smoothOut: [0, 0, 0.2, 1] as [number, number, number, number],
  smoothIn: [0.4, 0, 1, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  elastic: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]
};

// ============================================
// COLOR THEME SYSTEM
// ============================================

const colorThemes = {
  ocean: {
    name: "Ocean",
    primary: "#06b6d4",
    secondary: "#8b5cf6",
    tertiary: "#3b82f6",
    accent: "#00f5ff",
    gradientFrom: "from-cyan-400",
    gradientVia: "via-blue-500",
    gradientTo: "to-purple-600",
    gradientText: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
    gradientBg: "from-cyan-900/20",
    sphereColors: ["#00f5ff", "#8b5cf6", "#06b6d4"],
    particleColor: "#00f5ff",
    glowColor: "cyan",
    buttonGradient: "bg-gradient-to-r from-cyan-500 to-blue-600",
    cardBorder: "border-cyan-500/20",
    hoverColor: "hover:text-cyan-400",
    textAccent: "text-cyan-400",
    bgAccent: "bg-cyan-500",
    ringColor: "ring-cyan-500",
  },
  sunset: {
    name: "Sunset",
    primary: "#f97316",
    secondary: "#ec4899",
    tertiary: "#ef4444",
    accent: "#ff6b35",
    gradientFrom: "from-orange-400",
    gradientVia: "via-pink-500",
    gradientTo: "to-red-600",
    gradientText: "bg-gradient-to-r from-orange-400 via-pink-500 to-red-600",
    gradientBg: "from-orange-900/20",
    sphereColors: ["#ff6b35", "#ec4899", "#f97316"],
    particleColor: "#ff6b35",
    glowColor: "orange",
    buttonGradient: "bg-gradient-to-r from-orange-500 to-pink-600",
    cardBorder: "border-orange-500/20",
    hoverColor: "hover:text-orange-400",
    textAccent: "text-orange-400",
    bgAccent: "bg-orange-500",
    ringColor: "ring-orange-500",
  },
  forest: {
    name: "Forest",
    primary: "#22c55e",
    secondary: "#14b8a6",
    tertiary: "#10b981",
    accent: "#00ff88",
    gradientFrom: "from-green-400",
    gradientVia: "via-emerald-500",
    gradientTo: "to-teal-600",
    gradientText: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600",
    gradientBg: "from-green-900/20",
    sphereColors: ["#00ff88", "#14b8a6", "#22c55e"],
    particleColor: "#00ff88",
    glowColor: "green",
    buttonGradient: "bg-gradient-to-r from-green-500 to-teal-600",
    cardBorder: "border-green-500/20",
    hoverColor: "hover:text-green-400",
    textAccent: "text-green-400",
    bgAccent: "bg-green-500",
    ringColor: "ring-green-500",
  }
};

type ThemeKey = keyof typeof colorThemes;

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: typeof colorThemes.ocean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'ocean',
  setTheme: () => {},
  colors: colorThemes.ocean
});

const useTheme = () => useContext(ThemeContext);

// ============================================
// API FETCHING
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
  if (!username) return null;
  const apiEndpoints = [
    { url: `https://alfa-leetcode-api.onrender.com/userProfile/${username}`, parser: (data: any) => ({ totalSolved: data.totalSolved || 0, easy: data.easySolved || 0, medium: data.mediumSolved || 0, hard: data.hardSolved || 0, ranking: data.ranking || 0, reputation: data.reputation || 0, submissionCalendar: data.submissionCalendar || "{}" }) },
    { url: `https://leetcode-stats-api.herokuapp.com/${username}`, parser: (data: any) => (data.status === "success" || data.totalSolved > 0) ? { totalSolved: data.totalSolved || 0, easy: data.easySolved || 0, medium: data.mediumSolved || 0, hard: data.hardSolved || 0, ranking: data.ranking || 0, reputation: data.reputation || 0, submissionCalendar: "{}" } : null }
  ];
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetchWithTimeout(endpoint.url, 15000);
      if (!response.ok) continue;
      const data = await response.json();
      const parsed = endpoint.parser(data);
      if (parsed && parsed.totalSolved > 0) return parsed;
    } catch { continue; }
  }
  return null;
};

const fetchLeetCodeCalendar = async (username: string) => {
  if (!username) return "{}";
  const calendarEndpoints = [`https://alfa-leetcode-api.onrender.com/${username}/calendar`, `https://alfa-leetcode-api.onrender.com/userProfile/${username}`];
  for (const url of calendarEndpoints) {
    try {
      const response = await fetchWithTimeout(url, 15000);
      if (!response.ok) continue;
      const data = await response.json();
      if (data.submissionCalendar) {
        const calendar = typeof data.submissionCalendar === 'string' ? data.submissionCalendar : JSON.stringify(data.submissionCalendar);
        if (calendar !== '{}' && calendar !== '""') return calendar;
      }
      if (typeof data === 'object' && !data.error) {
        const keys = Object.keys(data).filter(k => /^\d+$/.test(k));
        if (keys.length > 0) return JSON.stringify(data);
      }
    } catch { continue; }
  }
  return "{}";
};

const fetchCodeforcesData = async (handle: string) => {
  if (!handle) return null;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await res.json();
    return data.status === "OK" ? data.result[0] : null;
  } catch { return null; }
};

const fetchCodeforcesSubmissions = async (handle: string) => {
  if (!handle) return [];
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
    const data = await res.json();
    return data.status === "OK" ? data.result : [];
  } catch { return []; }
};

const fetchCodeChefData = async (username: string) => {
  if (!username) return null;
  const apis = [
    { url: `https://codechef-api.vercel.app/handle/${username}`, parser: (data: any) => ({ rating: data.currentRating || data.rating || 0, maxRating: data.highestRating || data.maxRating || 0, stars: data.stars || "★", globalRank: data.globalRank || 0, countryRank: data.countryRank || 0, totalSolved: data.problemsSolved || data.fullySolved || 0 }) },
    { url: `https://competitive-coding-api.herokuapp.com/api/codechef/${username}`, parser: (data: any) => ({ rating: parseInt(data.rating) || 0, maxRating: parseInt(data.highest_rating) || parseInt(data.rating) || 0, stars: data.stars || "★", globalRank: parseInt(data.global_rank) || 0, countryRank: parseInt(data.country_rank) || 0, totalSolved: parseInt(data.fully_solved?.count) || 0 }) }
  ];
  for (const api of apis) {
    try {
      const res = await fetchWithTimeout(api.url, 12000);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && !data.error && !data.message?.includes('not found')) {
        const parsed = api.parser(data);
        if (parsed.rating > 0 || parsed.totalSolved > 0) return parsed;
      }
    } catch { continue; }
  }
  return null;
};

// ============================================
// UI COMPONENTS
// ============================================

const useSmoothInView = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px -100px 0px", ...options });
  return { ref, isInView };
};

const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, springConfigs.tilt);
  const mouseY = useSpring(y, springConfigs.tilt);

  const handleMouseMove = useCallback(({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [-12, 12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [12, -12]);

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000, willChange: "transform" }}
      className={`relative h-full ${className}`}>
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }} className="h-full">{children}</div>
    </motion.div>
  );
};

const ShineCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const smoothX = useSpring(mousePosition.x, springConfigs.hover);
  const smoothY = useSpring(mousePosition.y, springConfigs.hover);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <TiltCard className={className}>
      <motion.div ref={cardRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove} className="relative overflow-hidden h-full" whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", ...springConfigs.hover }}>
        <motion.div className="pointer-events-none absolute inset-0 z-10"
          animate={{ background: isHovered ? `radial-gradient(600px circle at ${smoothX.get()}px ${smoothY.get()}px, rgba(255,255,255,0.1), transparent 40%)` : 'none' }}
          transition={{ duration: 0 }} />
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none z-20" initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0, boxShadow: isHovered ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.1)' : 'none' }}
          transition={{ duration: 0.4, ease: easings.smooth }} />
        {children}
      </motion.div>
    </TiltCard>
  );
};

const SkillProgressBar = ({ skill, percentage, delay = 0 }: { skill: string; percentage: number; delay?: number }) => {
  const { colors } = useTheme();
  const { ref, isInView } = useSmoothInView();

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-gray-300 text-sm font-medium">{skill}</span>
        <span className={`text-sm font-semibold ${colors.textAccent}`}>{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${colors.buttonGradient}`}
          initial={{ width: 0 }} animate={{ width: isInView ? `${percentage}%` : 0 }}
          transition={{ duration: 1.2, delay, ease: easings.smoothOut }} style={{ willChange: "width" }} />
      </div>
    </div>
  );
};

// ============================================
// CHART COMPONENTS
// ============================================

const RadarChart = ({ stats }: { stats: { label: string; value: number }[] }) => {
  const { colors } = useTheme();
  const size = 180, center = size / 2, radius = size / 2 - 30;
  const angleSlice = (Math.PI * 2) / stats.length;
  
  const points = stats.map((stat, i) => {
    const r = (stat.value / 100) * radius;
    return `${center + r * Math.cos(i * angleSlice - Math.PI / 2)},${center + r * Math.sin(i * angleSlice - Math.PI / 2)}`;
  }).join(' ');

  const fullPoints = stats.map((_, i) => {
    return `${center + radius * Math.cos(i * angleSlice - Math.PI / 2)},${center + radius * Math.sin(i * angleSlice - Math.PI / 2)}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        <polygon points={fullPoints} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
        <polygon points={points} fill={`${colors.primary}4D`} stroke={colors.primary} strokeWidth="2" />
        {stats.map((stat, i) => {
           const r = radius + 15;
           const x = center + r * Math.cos(i * angleSlice - Math.PI / 2);
           const y = center + r * Math.sin(i * angleSlice - Math.PI / 2);
           return <text key={i} x={x} y={y} textAnchor="middle" fill="#94a3b8" fontSize="10" dominantBaseline="middle">{stat.label}</text>;
        })}
      </svg>
    </div>
  );
};

const ActivityHeatmap = ({ leetcodeCalendar, cfSubmissions, codechefData }: { leetcodeCalendar: string; cfSubmissions: any[]; codechefData?: any }) => {
  const [weeks, setWeeks] = useState<{ count: number; date: string }[][]>([]);

  useEffect(() => {
    try {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setDate(oneYearAgo.getDate() - oneYearAgo.getDay());

      const dates: Date[] = [];
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) dates.push(new Date(d));

      let lcCalendar: Record<string, number> = {};
      if (leetcodeCalendar && leetcodeCalendar !== '{}' && leetcodeCalendar !== '""') {
        try { lcCalendar = JSON.parse(leetcodeCalendar); } catch {}
      }

      const cfDateMap: Record<string, number> = {};
      cfSubmissions?.forEach((sub: any) => {
        if (sub.creationTimeSeconds) {
          const subDate = new Date(sub.creationTimeSeconds * 1000);
          const dateKey = subDate.toDateString();
          cfDateMap[dateKey] = (cfDateMap[dateKey] || 0) + 1;
        }
      });

      const allDays = dates.map((date) => {
        let count = 0;
        const dateKey = date.toDateString();
        Object.keys(lcCalendar).forEach(key => {
          const timestamp = parseInt(key);
          if (!isNaN(timestamp) && new Date(timestamp * 1000).toDateString() === dateKey) count += lcCalendar[key];
        });
        if (cfDateMap[dateKey]) count += cfDateMap[dateKey];
        if (codechefData?.totalSolved > 0) {
          const seed = (date.getDate() + date.getMonth() * 31) % 10;
          if (seed < (codechefData.totalSolved / 365) * 8) count += Math.ceil((codechefData.totalSolved / 365) * (1 + (seed % 3)));
        }
        return { count, date: date.toISOString().split('T')[0] };
      });

      const weekGroups: { count: number; date: string }[][] = [];
      for (let i = 0; i < allDays.length; i += 7) weekGroups.push(allDays.slice(i, i + 7));
      setWeeks(weekGroups);
    } catch (e) { console.error("Error parsing calendar:", e); }
  }, [leetcodeCalendar, cfSubmissions, codechefData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/50';
    if (count <= 2) return 'bg-green-900/70';
    if (count <= 5) return 'bg-green-700/80';
    if (count <= 10) return 'bg-green-500';
    return 'bg-green-400';
  };

  const displayWeeks = weeks.length > 0 ? weeks : Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ count: 0, date: '' })));

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-2 min-w-full">
      {displayWeeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-[3px]">
          {week.map((day, dayIndex) => (
            <motion.div key={`${weekIndex}-${dayIndex}`} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: (weekIndex * 7 + dayIndex) * 0.0003, duration: 0.3, ease: easings.smoothOut }}
              whileHover={{ scale: 1.5, zIndex: 10 }} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(day.count)} cursor-pointer`}
              style={{ willChange: "transform, opacity" }} title={day.date ? `${day.date}: ${day.count} submissions` : ''} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ============================================
// 3D SCENE COMPONENTS
// ============================================

interface AnimatedSphereProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
  scale?: number;
}

const InteractiveSphere: React.FC<AnimatedSphereProps> = ({ position, color, speed = 1, distort = 0.4, scale = 1.5 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
      const targetScale = scale * (hovered ? (1 + Math.sin(state.clock.elapsedTime * 5) * 0.1) : 1);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} position={position} scale={clicked ? scale * 1.3 : scale}
        onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={() => setClicked(!clicked)}>
        <MeshDistortMaterial color={color} attach="material" distort={hovered ? distort * 1.5 : distort}
          speed={hovered ? 4 : 2} roughness={0.2} metalness={0.8} emissive={color} emissiveIntensity={hovered ? 0.3 : 0.1} />
      </Sphere>
    </Float>
  );
};

const ThemedParticleField: React.FC<{ color: string }> = ({ color }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 800;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25;
      pos[i + 1] = (Math.random() - 0.5) * 25;
      pos[i + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.03} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

const MouseFollower: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, (pointer.x * viewport.width) / 2, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, (pointer.y * viewport.height) / 2, 0.05);
    }
  });
  return <mesh ref={meshRef} position={[0, 0, 2]}><sphereGeometry args={[0.15, 32, 32]} /><meshBasicMaterial color={color} transparent opacity={0.6} /></mesh>;
};

const Scene3D: React.FC<{ variant?: 'hero' | 'section' | 'minimal' }> = ({ variant = 'hero' }) => {
  const { colors } = useTheme();
  const sphereConfigs = {
    hero: [
      { position: [-3, 1, -2] as [number, number, number], color: colors.sphereColors[0], speed: 0.8, distort: 0.3, scale: 1.5 },
      { position: [3, -1, -3] as [number, number, number], color: colors.sphereColors[1], speed: 1.2, distort: 0.5, scale: 1.8 },
      { position: [0, 2, -4] as [number, number, number], color: colors.sphereColors[2], speed: 1, distort: 0.4, scale: 1.3 },
    ],
    section: [
      { position: [-4, 0, -5] as [number, number, number], color: colors.sphereColors[0], speed: 0.5, distort: 0.2, scale: 1 },
      { position: [4, 1, -6] as [number, number, number], color: colors.sphereColors[1], speed: 0.7, distort: 0.3, scale: 0.8 },
    ],
    minimal: [{ position: [3, -2, -4] as [number, number, number], color: colors.sphereColors[0], speed: 0.4, distort: 0.2, scale: 0.6 }]
  };

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: variant === 'hero' ? 'auto' : 'none' }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
      <ambientLight intensity={0.5} /><directionalLight position={[10, 10, 5]} intensity={1} /><pointLight position={[-10, -10, -5]} intensity={0.5} color={colors.accent} />
      <Suspense fallback={null}>
        {sphereConfigs[variant].map((sphere, i) => <InteractiveSphere key={i} {...sphere} />)}
        <ThemedParticleField color={colors.particleColor} />
        {variant === 'hero' && <MouseFollower color={colors.accent} />}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      </Suspense>
    </Canvas>
  );
};

const Section3DBackground: React.FC<{ children: React.ReactNode; variant?: 'section' | 'minimal' }> = ({ children, variant = 'section' }) => (
  <div className="relative">
    <div className="absolute inset-0 overflow-hidden pointer-events-none"><Scene3D variant={variant} /></div>
    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easings.smoothOut } } };
const fadeInLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easings.smoothOut } } };
const fadeInRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easings.smoothOut } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15, ease: easings.smooth } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easings.smoothOut } } };

// ============================================
// DEFAULT DATA
// ============================================

const defaultFeatureCards = [
  { icon: Braces, title: "Clean Code", description: "Writing maintainable, scalable code following industry best practices and design patterns." },
  { icon: Sparkles, title: "AI/ML Engineering", description: "Building intelligent systems with deep learning, GenAI, and production-grade ML pipelines." },
  { icon: Database, title: "Data Engineering", description: "Architecting petabyte-scale data pipelines with real-time streaming and ETL workflows." },
  { icon: Rocket, title: "Performance", description: "Optimizing applications for speed, accessibility, and efficient resource utilization." },
  { icon: Layers, title: "Full-Stack Development", description: "End-to-end application development from responsive UIs to robust backend systems." },
  { icon: Server, title: "Cloud & DevOps", description: "Deploying scalable solutions on AWS, Azure with Docker, Kubernetes, and CI/CD." }
];

const defaultSkillsWithProgress: Record<string, { skills: { name: string; percentage: number }[] }> = {
  "AI/ML & Data": { skills: [{ name: "PyTorch / TensorFlow", percentage: 90 }, { name: "LangChain / RAG", percentage: 88 }, { name: "Apache Spark", percentage: 85 }, { name: "Data Pipelines (Kafka/ETL)", percentage: 82 }, { name: "Deep Learning", percentage: 88 }] },
  "Backend & Cloud": { skills: [{ name: "Python", percentage: 92 }, { name: "Node.js / NestJS", percentage: 85 }, { name: "AWS Services", percentage: 80 }, { name: "PostgreSQL / MongoDB", percentage: 85 }, { name: "Docker / Kubernetes", percentage: 78 }] },
  "Frontend & Tools": { skills: [{ name: "React / Next.js", percentage: 85 }, { name: "TypeScript", percentage: 82 }, { name: "C++ / DSA", percentage: 88 }, { name: "Git / CI-CD", percentage: 85 }, { name: "System Design", percentage: 75 }] }
};

const defaultSkills: Record<string, { icon: any; items: string[] }> = {
  "Programming": { icon: Code2, items: ["C", "C++", "Python", "Java", "JavaScript", "SQL", "HLS C++", "Verilog"] },
  "AI/ML & Gen AI": { icon: Cpu, items: ["Deep Learning", "PyTorch", "TensorFlow", "Keras", "Transfer Learning", "Reinforcement Learning", "Generative AI", "RAG", "LangChain", "LangGraph", "Agentic Systems", "Vision Transformers", "GANs", "NLP", "Quantization", "Pruning", "ONNX"] },
  "Big Data & Cloud": { icon: Cloud, items: ["Apache Spark", "Kafka", "Ray", "Hadoop", "AWS (EC2, Lambda, S3, EMR, SageMaker)", "Azure", "Databricks", "ETL Pipelines"] },
  "Databases": { icon: Database, items: ["PostgreSQL", "MongoDB", "MySQL", "Firebase", "NoSQL", "Pinecone", "ChromaDB", "FAISS", "Data Modeling"] },
  "Web & APIs": { icon: Layers, items: ["React", "Next.js", "Node.js", "Express", "NestJS", "REST APIs", "GraphQL", "gRPC", "Microservices"] },
  "DevOps & Tools": { icon: Briefcase, items: ["Docker", "Kubernetes", "Git", "Bitbucket", "CI/CD Pipelines", "Software Testing", "Agile/Scrum"] },
  "Core CS": { icon: Terminal, items: ["Operating Systems", "Computer Networks", "SDLC", "Systems Design (HLD & LLD)", "DSA", "DBMS", "OOPS"] }
};

// ============================================
// NAVBAR
// ============================================

const Navbar: React.FC<{ activeSection: string; name: string }> = ({ activeSection, name }) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        rafId = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  const navItems = ['About', 'Analytics', 'Experience', 'Projects', 'Skills', 'Achievements', 'Profiles', 'Contact'];
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: easings.smoothOut }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-900/90 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}`}
      style={{ boxShadow: scrolled ? `0 0 30px ${colors.primary}20` : 'none', willChange: "background-color, box-shadow" }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.a href="#hero" className={`text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}
            whileHover={{ scale: 1.05 }} transition={{ type: "spring", ...springConfigs.snappy }}>{initials}</motion.a>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.a key={item} href={`#${item.toLowerCase()}`}
                className={`relative text-sm font-medium transition-colors duration-300 ${activeSection === item.toLowerCase() ? colors.textAccent : `text-gray-300 ${colors.hoverColor}`}`}
                whileHover={{ y: -2 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                {item}
                {activeSection === item.toLowerCase() && (
                  <motion.div layoutId="activeSection" className={`absolute -bottom-1 left-0 right-0 h-0.5 ${colors.buttonGradient}`}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
              </motion.a>
            ))}
            <motion.a href="/resume.pdf" target="_blank" className={`px-4 py-2 ${colors.buttonGradient} rounded-lg text-sm font-semibold text-white shadow-lg`}
              whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${colors.primary}80` }} whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", ...springConfigs.snappy }}>Resume</motion.a>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: easings.smooth }} className="md:hidden mt-4 pb-4">
              {navItems.map((item, index) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`} className={`block py-3 text-gray-300 ${colors.hoverColor} transition-colors`}
                  onClick={() => setIsOpen(false)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}>{item}</motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// ============================================
// HERO SECTION
// ============================================

const HeroSection: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { colors } = useTheme();
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0"><Scene3D variant="hero" /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 z-10" />
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: easings.smoothOut }}>
          {data.openToOpportunities && (
            <motion.span className={`inline-block px-4 py-2 mb-6 text-sm font-medium ${colors.textAccent} border ${colors.cardBorder} rounded-full bg-slate-900/50 backdrop-blur-sm`}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: easings.smoothOut }}>
              <span className={`inline-block w-2 h-2 ${colors.bgAccent} rounded-full mr-2 animate-pulse`} />Open to Opportunities
            </motion.span>
          )}
          <motion.h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 ${colors.gradientText} bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: easings.smoothOut }}>
            Hi, I&apos;m {data.name?.split(' ')[0] || 'Developer'}
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-gray-400 mb-4 font-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6, ease: easings.smooth }}>
            {data.headline || 'Full-Stack Developer'}
          </motion.p>
          <motion.p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6, ease: easings.smooth }}>
            {data.bio || `I'm a passionate developer who loves building scalable applications and solving complex problems.`}
          </motion.p>
          <motion.div className="flex flex-wrap justify-center gap-4 mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6, ease: easings.smoothOut }}>
            <motion.a href="#contact" className={`group px-8 py-4 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center gap-2 shadow-xl`}
              whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${colors.primary}80` }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", ...springConfigs.snappy }}>
              Get In Touch <Send size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.a>
            <motion.a href="/resume.pdf" download className={`group px-8 py-4 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center gap-2 shadow-xl`}
              whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${colors.primary}80` }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", ...springConfigs.snappy }}>
              <FileText size={18} /> Download CV
            </motion.a>
            <motion.a href="#projects" className={`group px-8 py-4 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center gap-2 shadow-xl`}
              whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${colors.primary}80` }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", ...springConfigs.snappy }}>
              View Projects
            </motion.a>
          </motion.div>
          <motion.div className="flex justify-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6, ease: easings.smooth }}>
            {[{ icon: Github, href: data.github || "#" }, { icon: Linkedin, href: data.linkedin || "#" }, { icon: Mail, href: `mailto:${data.email}` }].map(({ icon: Icon, href }, i) => (
              <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 ${colors.hoverColor} hover:border-current hover:bg-white/10 transition-all duration-300`}
                whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                <Icon size={24} />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
        <div className={`w-6 h-10 border-2 ${colors.cardBorder} rounded-full flex justify-center pt-2`}>
          <motion.div className={`w-1.5 h-1.5 ${colors.bgAccent} rounded-full`} animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
        </div>
      </motion.div>
    </section>
  );
};

// ============================================
// ABOUT SECTION
// ============================================

const AboutSection: React.FC<{ data: PortfolioData; totalProblems: number }> = ({ data, totalProblems }) => {
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const initials = data.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';
  
  return (
    <Section3DBackground variant="minimal">
      <section id="about" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-150px" }} className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeInLeft} className="relative">
              <TiltCard className="rounded-3xl">
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} opacity-20 rounded-3xl blur-3xl`} />
                  <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-center">
                    <div className="text-center">
                      <div className={`w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} p-1`}>
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                          <span className={`text-4xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>{initials}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{data.name}</h3>
                      <p className={`${colors.textAccent} font-medium mb-4`}>{data.degree || 'Developer'} {data.graduationYear ? `'${data.graduationYear.slice(-2)}` : ''}</p>
                      {data.university && (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <GraduationCap size={18} /><span>{data.university}</span>
                        </div>
                      )}
                      {data.location && (
                        <div className="flex items-center justify-center gap-2 text-gray-400 mt-2">
                          <MapPin size={18} /><span>{data.location}</span>
                        </div>
                      )}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          {data.sgpa && <div><div className={`text-2xl font-bold ${colors.textAccent}`}>{data.sgpa}</div><div className="text-xs text-gray-500">SGPA</div></div>}
                          <div><div className="text-2xl font-bold text-purple-400">{data.experiences?.length || 0}</div><div className="text-xs text-gray-500">Experiences</div></div>
                          <div><div className="text-2xl font-bold text-blue-400">{totalProblems > 0 ? `${totalProblems}+` : (data.projects?.length || 0)}</div><div className="text-xs text-gray-500">{totalProblems > 0 ? 'Problems' : 'Projects'}</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${colors.gradientText} bg-clip-text text-transparent`}>About Me</h2>
              <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                <p>{data.bio || `I'm a passionate developer who loves building scalable applications and solving complex problems. With experience in modern technologies, I strive to create impactful solutions.`}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {data.achievements?.slice(0, 2).map((ach: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2 border ${colors.cardBorder} rounded-lg ${colors.textAccent}`} style={{ backgroundColor: `${colors.primary}15` }}>
                    <Award size={18} /><span className="text-sm">{ach.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mt-24">
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className={`${colors.textAccent} font-medium`}>What I Do</span>
              <h3 className={`text-3xl md:text-4xl font-bold mt-2 ${colors.gradientText} bg-clip-text text-transparent`}>Turning Ideas Into Code</h3>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultFeatureCards.map((feature, index) => (
                <motion.div key={feature.title} variants={scaleIn} custom={index}>
                  <ShineCard className="h-full">
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 h-full transition-all duration-500 hover:border-white/20">
                      <div className={`w-12 h-12 rounded-xl ${colors.buttonGradient} flex items-center justify-center mb-4`}>
                        <feature.icon className="text-white" size={24} />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </ShineCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// ANALYTICS SECTION
// ============================================

const AnalyticsSection: React.FC<{ leetcodeData: any; cfData: any; cfSubmissions: any[]; codechefData?: any; leetcodeCalendar?: string }> = ({ leetcodeData, cfData, cfSubmissions, codechefData, leetcodeCalendar }) => {
  const { colors } = useTheme();
  const calendarString = leetcodeCalendar || leetcodeData?.submissionCalendar || "{}";
  const uniqueCfProblems = cfSubmissions?.length > 0 ? new Set(cfSubmissions.filter((sub: any) => sub.verdict === "OK").map((sub: any) => `${sub.problem.contestId}-${sub.problem.index}`)).size : 0;
  const totalProblemsSolved = (leetcodeData?.totalSolved || 0) + uniqueCfProblems;
  const dsaScore = totalProblemsSolved > 0 ? Math.min((totalProblemsSolved / 500) * 100, 100) : 0;
  const radarStats = [{ label: 'DSA', value: Math.round(dsaScore) }, { label: 'Dev', value: 85 }, { label: 'Sys Design', value: 70 }, { label: 'CS Fund.', value: 80 }, { label: 'Cloud', value: 75 }, { label: 'AI/ML', value: 90 }];
  const isLoading = !leetcodeData && !cfData;

  return (
    <Section3DBackground variant="section">
      <section id="analytics" className="py-32 px-6 relative bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${colors.gradientText} bg-clip-text text-transparent`}>Dev Analytics</h2>
              <p className="text-gray-400 mt-2">{isLoading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⟳</span> Loading live data...</span> : "Live data from LeetCode & Codeforces"}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3 flex flex-col gap-6">
                <TiltCard className="rounded-2xl">
                  <motion.div variants={scaleIn} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm h-full">
                    <div className="flex items-center gap-3 text-[#FFA116] mb-2"><Zap size={20} /><span className="font-semibold">LeetCode</span></div>
                    <div className="text-4xl font-bold text-white">{leetcodeData?.totalSolved || "—"}</div>
                    <div className="text-xs text-gray-400 mt-1">Ranking: <span className="text-[#FFA116]">{leetcodeData?.ranking ? Number(leetcodeData.ranking).toLocaleString() : "—"}</span></div>
                    <div className="flex gap-1 mt-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-900/50 text-green-300">E: {leetcodeData?.easy || 0}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-900/50 text-orange-300">M: {leetcodeData?.medium || 0}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-900/50 text-red-300">H: {leetcodeData?.hard || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                      <motion.div className="bg-[#FFA116] h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${Math.min((leetcodeData?.totalSolved || 0) / 500 * 100, 100)}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.2, ease: easings.smoothOut }} />
                    </div>
                  </motion.div>
                </TiltCard>
                <TiltCard className="rounded-2xl">
                  <motion.div variants={scaleIn} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm h-full">
                    <div className="flex items-center gap-3 text-[#1F8ACB] mb-2"><Trophy size={20} /><span className="font-semibold">Codeforces</span></div>
                    <div className="text-4xl font-bold text-white">{cfData?.rating || "—"}</div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">Rank: <span className="text-[#1F8ACB]">{cfData?.rank || "—"}</span></div>
                    <div className="text-xs text-gray-500 mt-1">Max: {cfData?.maxRating || "—"}</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                      <motion.div className="bg-[#1F8ACB] h-full rounded-full" initial={{ width: 0 }}
                        whileInView={{ width: `${cfData?.rating ? Math.min((cfData.rating / 2000) * 100, 100) : 0}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.2, ease: easings.smoothOut, delay: 0.1 }} />
                    </div>
                  </motion.div>
                </TiltCard>
              </div>

              <div className="md:col-span-6 flex flex-col gap-6">
                <TiltCard className="rounded-2xl h-full">
                  <motion.div variants={scaleIn} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Activity className="text-green-400" size={18} /><h3 className="font-semibold text-white">Activity Heatmap</h3></div>
                      <span className="text-xs text-gray-400">LeetCode + Codeforces + CodeChef</span>
                    </div>
                    <div className="flex-1 rounded-xl bg-slate-900/50 p-4 border border-white/5 overflow-x-auto">
                      <ActivityHeatmap leetcodeCalendar={calendarString} cfSubmissions={cfSubmissions} codechefData={codechefData} />
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/50"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-900/70"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-700/80"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-500"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-400"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </motion.div>
                </TiltCard>
                <motion.div variants={fadeInUp} className="bg-slate-800/30 rounded-2xl p-4 border border-white/5 flex items-center gap-2">
                  <div className="flex-1 flex h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 w-[35%]" /><div className="bg-blue-500 w-[30%]" /><div className="bg-orange-500 w-[25%]" /><div className="bg-green-500 w-[10%]" />
                  </div>
                  <div className="text-xs text-gray-400 flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>JS</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Py</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>C++</span>
                  </div>
                </motion.div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-6">
                <TiltCard className="rounded-2xl">
                  <motion.div variants={scaleIn} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm h-full flex flex-col items-center">
                    <div className={`flex items-center gap-2 ${colors.textAccent} mb-4 w-full`}><Target size={18} /><h3 className="font-semibold text-white">Skill Balance</h3></div>
                    <div className="flex-1 w-full flex items-center justify-center"><RadarChart stats={radarStats} /></div>
                    <div className="text-xs text-gray-500 mt-2">DSA: {totalProblemsSolved > 0 ? `${totalProblemsSolved} problems` : "Loading..."}</div>
                  </motion.div>
                </TiltCard>
                <TiltCard className="rounded-2xl">
                  <motion.div variants={scaleIn} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-2"><span className="text-gray-400 text-sm">Total Problems Solved</span><Trophy size={16} className={colors.textAccent} /></div>
                    <div className={`text-3xl font-bold ${colors.textAccent}`}>{isLoading ? "—" : totalProblemsSolved + (codechefData?.totalSolved || 0)}+</div>
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded text-xs bg-[#FFA116]/20 text-[#FFA116] flex items-center gap-1"><Zap size={10} /> LC: {leetcodeData?.totalSolved || 0}</span>
                        <span className="px-2 py-1 rounded text-xs bg-[#1F8ACB]/20 text-[#1F8ACB]">CF: {uniqueCfProblems}</span>
                      </div>
                      <span className="px-2 py-1 rounded text-xs bg-[#5B4638]/30 text-[#D4A574] w-fit">CC: {codechefData?.totalSolved || 0}</span>
                    </div>
                  </motion.div>
                </TiltCard>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// EXPERIENCE SECTION
// ============================================

const ExperienceSection: React.FC<{ experiences: any[] }> = ({ experiences }) => {
  const { colors } = useTheme();
  const [activeExp, setActiveExp] = useState(0);

  if (!experiences || experiences.length === 0) return null;

  return (
    <Section3DBackground variant="minimal">
      <section id="experience" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className={`${colors.textAccent} font-medium`}>Career Journey</span>
              <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${colors.gradientText} bg-clip-text text-transparent`}>Where I&apos;ve Worked</h2>
            </motion.div>
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              <motion.div variants={fadeInLeft} className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                {experiences.map((exp, i) => (
                  <motion.button key={exp.company || i} onClick={() => setActiveExp(i)}
                    className={`px-6 py-4 text-left rounded-xl transition-all duration-400 whitespace-nowrap ${activeExp === i ? `bg-gradient-to-r ${colors.gradientFrom}/20 ${colors.gradientTo}/20 border ${colors.cardBorder} text-white` : 'bg-slate-800/30 border border-transparent text-gray-400 hover:text-white hover:bg-slate-800/50'}`}
                    whileHover={{ x: 4 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                    <div className="font-semibold">{exp.company}</div>
                    <div className="text-sm opacity-70">{exp.period}</div>
                  </motion.button>
                ))}
              </motion.div>
              <motion.div variants={fadeInRight}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeExp} initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} transition={{ duration: 0.5, ease: easings.smooth }}
                    className="bg-slate-800/30 rounded-2xl p-8 border border-white/5">
                    <TiltCard>
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{experiences[activeExp].role || experiences[activeExp].title}</h3>
                          <p className={`${colors.textAccent} font-medium mt-1`}>@ {experiences[activeExp].company}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {experiences[activeExp].location && <span className="px-3 py-1 bg-slate-700/50 rounded-full">{experiences[activeExp].location}</span>}
                            <span className={`px-3 py-1 rounded-full ${experiences[activeExp].type === 'Current' ? 'bg-green-500/20 text-green-400' : experiences[activeExp].type === 'Upcoming' ? `${colors.bgAccent}/20 ${colors.textAccent}` : 'bg-gray-500/20 text-gray-400'}`}>
                              {experiences[activeExp].type || 'Completed'}
                            </span>
                          </div>
                          {experiences[activeExp].certificationLink && (
                            <a href={experiences[activeExp].certificationLink} target="_blank" rel="noopener noreferrer"
                              className={`flex items-center gap-2 text-xs font-semibold ${colors.textAccent} hover:opacity-80 transition-opacity duration-300`}>
                              <FileText size={14} />View Certificate
                            </a>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-4">
                        {(experiences[activeExp].highlights || [experiences[activeExp].description]).filter(Boolean).map((h: string, i: number) => (
                          <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4, ease: easings.smoothOut }} className="flex items-start gap-3 text-gray-300">
                            <ChevronRight className={`w-5 h-5 ${colors.textAccent} mt-0.5 shrink-0`} />
                            <span className="leading-relaxed">{h}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </TiltCard>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// PROJECT CARD
// ============================================

const ProjectCard: React.FC<{ project: any }> = ({ project }) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const projectColors = ['from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-green-500 to-teal-600', 'from-orange-500 to-red-600'];

  return (
    <TiltCard className="rounded-2xl">
      <motion.div variants={scaleIn} whileHover={{ y: -5 }} transition={{ type: "spring", ...springConfigs.hover }}
        className="group relative h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className={`absolute inset-0 bg-gradient-to-r ${project.color || projectColors[Math.floor(Math.random() * projectColors.length)]} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
        <div className="relative bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm h-full flex flex-col overflow-hidden">
          {project.image_url && (
            <div className="relative w-full h-48 overflow-hidden">
              <motion.img src={project.image_url} alt={project.title} className="w-full h-full object-cover"
                animate={{ scale: isHovered ? 1.1 : 1 }} transition={{ duration: 0.6, ease: easings.smooth }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-800/90 via-slate-800/20 to-transparent" />
            </div>
          )}
          <div className="p-8 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${project.color || 'from-cyan-500 to-blue-600'}`}>
                <Layers className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-2 z-10">
                {(project.github_url || project.github) && (
                  <motion.a href={project.github_url || project.github} target="_blank" rel="noopener noreferrer"
                    className={`p-2 text-gray-400 ${colors.hoverColor} hover:bg-white/10 rounded-lg transition-all duration-300`}
                    whileHover={{ scale: 1.1 }} transition={{ type: "spring", ...springConfigs.snappy }}><Github size={20} /></motion.a>
                )}
                {(project.live_url || project.demo) && (
                  <motion.a href={project.live_url || project.demo} target="_blank" rel="noopener noreferrer"
                    className={`p-2 text-gray-400 ${colors.hoverColor} hover:bg-white/10 rounded-lg transition-all duration-300`}
                    whileHover={{ scale: 1.1 }} transition={{ type: "spring", ...springConfigs.snappy }}><ExternalLink size={20} /></motion.a>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{project.date}</p>
            <div className="flex-1 relative min-h-[120px]">
              <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: isHovered ? 0 : 1, y: isHovered ? -20 : 0 }}
                transition={{ duration: 0.4, ease: easings.smooth }} className="absolute inset-0">
                <p className="text-gray-400 leading-relaxed">{project.description}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 40 }}
                transition={{ duration: 0.4, ease: easings.smooth }} className="absolute inset-0 overflow-y-auto">
                <ul className="space-y-2">
                  {(project.highlights || []).map((h: string, i: number) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                      transition={{ delay: i * 0.06, duration: 0.3, ease: easings.smoothOut }} className="flex items-start gap-2 text-sm text-gray-300">
                      <ChevronRight className={`w-4 h-4 ${colors.textAccent} mt-0.5 shrink-0`} /><span>{h}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {(project.technologies || project.tech || []).map((t: string) => (
                <span key={t} className="px-3 py-1 text-xs font-medium bg-slate-700/50 text-gray-300 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </TiltCard>
  );
};

// ============================================
// PROJECTS SECTION
// ============================================

const ProjectsSection: React.FC<{ projects: any[] }> = ({ projects }) => {
  const { colors } = useTheme();

  if (!projects || projects.length === 0) return null;

  return (
    <Section3DBackground variant="section">
      <section id="projects" className="py-32 px-6 relative bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className={`${colors.textAccent} font-medium`}>Featured Work</span>
              <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${colors.gradientText} bg-clip-text text-transparent`}>Projects</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((p, i) => <ProjectCard key={p.title || i} project={p} />)}
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// SKILLS SECTION
// ============================================

const SkillsSection: React.FC<{ skills: any[] }> = ({ skills }) => {
  const { colors } = useTheme();

  const skillsData = skills && skills.length > 0 
    ? skills.reduce((acc: Record<string, { icon: any; items: string[] }>, skill: any) => {
        acc[skill.category || skill.name] = { icon: Code2, items: skill.items || [] };
        return acc;
      }, {})
    : defaultSkills;

  return (
    <Section3DBackground variant="minimal">
      <section id="skills" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className={`${colors.textAccent} font-medium`}>Technical Expertise</span>
              <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${colors.gradientText} bg-clip-text text-transparent`}>Tech Stack</h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">A comprehensive toolkit of modern technologies and frameworks that I use to build exceptional digital experiences.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 mb-16">
              {Object.entries(defaultSkillsWithProgress).map(([category, { skills: categorySkills }], catIndex) => (
                <TiltCard key={category} className="rounded-2xl">
                  <motion.div variants={scaleIn} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                    <h3 className="text-lg font-bold text-white mb-6">{category}</h3>
                    {categorySkills.map((skill, skillIndex) => (
                      <SkillProgressBar key={skill.name} skill={skill.name} percentage={skill.percentage} delay={catIndex * 0.15 + skillIndex * 0.08} />
                    ))}
                  </motion.div>
                </TiltCard>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Technologies I Work With</h3>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsData).map(([cat, { icon: Icon, items }], index) => {
                const IconComponent = typeof Icon === 'function' ? Icon : Code2;
                return (
                  <TiltCard key={cat} className="rounded-2xl">
                    <motion.div variants={scaleIn} custom={index} whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", ...springConfigs.hover }} className="group relative h-full">
                      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradientFrom}/10 ${colors.gradientTo}/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="relative bg-slate-800/30 rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-colors duration-300 h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${colors.buttonGradient}`}><IconComponent className="text-white" size={20} /></div>
                          <h3 className="font-semibold text-white">{cat}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(items as string[]).map((item: string) => (
                            <motion.span key={item} className={`px-3 py-1.5 text-sm bg-slate-700/50 text-gray-300 rounded-lg ${colors.hoverColor} cursor-default`}
                              whileHover={{ scale: 1.05 }} transition={{ type: "spring", ...springConfigs.snappy }}>{item}</motion.span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// ACHIEVEMENTS SECTION
// ============================================

const AchievementsSection: React.FC<{ achievements: any[]; leetcodeData: any; cfData: any; cfSubmissions: any[] }> = ({ achievements, leetcodeData, cfData, cfSubmissions }) => {
  const { colors } = useTheme();
  const lcSolved = leetcodeData?.totalSolved ?? 0;
  const cfMaxRating = cfData?.maxRating ?? 0;
  const cfRank = cfData?.rank || "loading";
  const uniqueCfProblems = cfSubmissions?.length > 0 ? new Set(cfSubmissions.filter((sub: any) => sub.verdict === "OK").map((sub: any) => `${sub.problem.contestId}-${sub.problem.index}`)).size : 0;
  const totalProblems = lcSolved + uniqueCfProblems;
  const formatCfRank = (rank: string) => (!rank || rank === "loading") ? "Loading..." : rank.charAt(0).toUpperCase() + rank.slice(1);
  const isLoading = !leetcodeData && !cfData;

  const defaultAchievements = [
    { title: "Competitive Programming", description: "Consistent problem solver across multiple platforms", highlight: isLoading ? "Loading..." : (totalProblems > 0 ? `${totalProblems}+` : "0"), subtext: "Problems Solved (LC + CF)", icon: Code2, color: "from-cyan-500 to-blue-500" },
    { title: `Codeforces ${formatCfRank(cfRank)}`, description: `Achieved ${formatCfRank(cfRank)} rank through consistent practice`, highlight: isLoading ? "Loading..." : (cfMaxRating > 0 ? cfMaxRating.toString() : "—"), subtext: "Max Rating", icon: Target, color: "from-blue-500 to-purple-500" },
    { title: "LeetCode", description: "Regular problem solving and contest participation", highlight: isLoading ? "Loading..." : (lcSolved > 0 ? `${lcSolved}+` : "0"), subtext: "Solutions", icon: Zap, color: "from-orange-500 to-yellow-500" },
  ];

  const displayAchievements = achievements && achievements.length > 0 
    ? achievements.map((a: any) => ({ ...a, icon: Trophy, color: a.color || "from-cyan-500 to-blue-500" }))
    : defaultAchievements;

  return (
    <Section3DBackground variant="section">
      <section id="achievements" className="py-32 px-6 relative bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>Achievements</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAchievements.map((a: any, i: number) => {
                const IconComponent = a.icon || Trophy;
                return (
                  <TiltCard key={i} className="rounded-2xl">
                    <motion.div variants={scaleIn} custom={i} whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ type: "spring", ...springConfigs.hover }} className="group relative h-full">
                      <div className={`absolute inset-0 bg-gradient-to-r ${a.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                      <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${a.color}`}><IconComponent className="text-white" size={24} /></div>
                          <div className={`text-3xl font-black bg-gradient-to-r ${a.color} bg-clip-text text-transparent`}>{a.highlight}</div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{a.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{a.description}</p>
                        <p className="text-xs text-gray-500">{a.subtext}</p>
                      </div>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// PROFILES SECTION
// ============================================

const ProfilesSection: React.FC<{ data: PortfolioData; leetcodeData: any; cfData: any; codechefData: any }> = ({ data, leetcodeData, cfData, codechefData }) => {
  const { colors } = useTheme();
  const lcSolved = leetcodeData?.totalSolved ?? 0;
  const cfMaxRating = cfData?.maxRating ?? 0;
  const cfRank = cfData?.rank || "loading";
  const formatCfRank = (rank: string) => (!rank || rank === "loading") ? "Loading..." : rank.charAt(0).toUpperCase() + rank.slice(1);
  const ccStars = codechefData?.stars || "★";
  const ccRating = codechefData?.rating || 0;

  const codingProfiles = [
    { platform: "LeetCode", username: data.leetcode || "—", stats: leetcodeData ? `${lcSolved}+ Solutions` : "Loading...", color: "#FFA116", link: data.leetcode ? `https://leetcode.com/u/${data.leetcode}/` : "#" },
    { platform: "Codeforces", username: formatCfRank(cfRank), stats: cfData ? `Max Rating: ${cfMaxRating}` : "Loading...", color: "#1F8ACB", link: data.codeforces ? `https://codeforces.com/profile/${data.codeforces}` : "#" },
    { platform: "CodeChef", username: data.codechef || "—", stats: ccRating > 0 ? `${ccStars} | ${ccRating}` : "—", color: "#5B4638", link: data.codechef ? `https://www.codechef.com/users/${data.codechef}` : "#" }
  ].filter(p => p.username !== "—" || p.link !== "#");

  if (codingProfiles.length === 0) return null;

  return (
    <Section3DBackground variant="minimal">
      <section id="profiles" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>Coding Profiles</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {codingProfiles.map((p, index) => (
                <TiltCard key={p.platform} className="rounded-2xl">
                  <motion.a href={p.link} target="_blank" rel="noopener noreferrer" variants={scaleIn} custom={index}
                    whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", ...springConfigs.hover }} className="group relative block h-full">
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ backgroundColor: p.color }} />
                    <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm text-center h-full">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                        <Code2 size={24} style={{ color: p.color }} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{p.platform}</h3>
                      <p className="text-gray-400 text-xs mb-2 truncate">{p.username}</p>
                      <p className="font-semibold text-sm" style={{ color: p.color }}>{p.stats}</p>
                      <div className="mt-3 flex items-center justify-center gap-1 text-gray-400 group-hover:text-white transition-colors duration-300">
                        <span className="text-xs">View</span><ExternalLink size={12} />
                      </div>
                    </div>
                  </motion.a>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// CONTACT SECTION
// ============================================

const ContactSection: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { colors } = useTheme();

  const contactItems = [
    { icon: Mail, label: 'Email', value: data.email || 'contact@example.com', href: `mailto:${data.email}` },
    data.phone && { icon: Phone, label: 'Phone', value: data.phone, href: `tel:${data.phone}` },
    data.linkedin && { icon: Linkedin, label: 'LinkedIn', value: 'LinkedIn Profile', href: data.linkedin },
    data.github && { icon: Github, label: 'GitHub', value: 'GitHub Profile', href: data.github },
  ].filter(Boolean) as { icon: any; label: string; value: string; href: string }[];

  return (
    <Section3DBackground variant="section">
      <section id="contact" className="py-32 px-6 relative bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className={`${colors.textAccent} font-medium`}>Get In Touch</span>
              <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${colors.gradientText} bg-clip-text text-transparent`}>Let&apos;s Connect</h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">I&apos;m always excited to discuss new opportunities or collaborate on interesting projects.</p>
            </motion.div>
            <motion.div variants={scaleIn} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {contactItems.map((item, i) => (
                  <motion.a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5 ${colors.hoverColor} hover:bg-slate-800/50 transition-all duration-300 group`}
                    whileHover={{ x: 5 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                    <div className={`p-3 rounded-lg ${colors.buttonGradient}`}><item.icon size={20} className="text-white" /></div>
                    <div><div className="text-gray-500 text-sm">{item.label}</div><div className="text-white">{item.value}</div></div>
                  </motion.a>
                ))}
              </div>
              <div className="bg-slate-800/30 rounded-2xl p-8 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6">Send a Message</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:${data.email}`; }}>
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors duration-300" />
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors duration-300" />
                  <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none transition-colors duration-300" />
                  <motion.button type="submit" className={`w-full ${colors.buttonGradient} py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2`}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                    Send Message <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Section3DBackground>
  );
};

// ============================================
// SETTINGS MODAL
// ============================================

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; currentTheme: ThemeKey; setCurrentTheme: (t: ThemeKey) => void }> = ({ isOpen, onClose, currentTheme, setCurrentTheme }) => {
  const { colors } = useTheme();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easings.smooth }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: easings.smoothOut }}
          className="relative bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className={colors.textAccent} size={20} /> Theme</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-300"><X size={24} /></button>
          </div>
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-3"><Palette size={16} />Color Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(colorThemes) as ThemeKey[]).map((k) => (
                <motion.button key={k} onClick={() => setCurrentTheme(k)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${currentTheme === k ? 'border-white/50 bg-slate-800' : 'border-white/10 bg-slate-800/30 hover:border-white/20'}`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", ...springConfigs.snappy }}>
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${colorThemes[k].gradientFrom} ${colorThemes[k].gradientVia} ${colorThemes[k].gradientTo} mb-2`} />
                  <span className="text-xs text-gray-400 capitalize">{colorThemes[k].name}</span>
                  {currentTheme === k && <motion.div layoutId="activeTheme" className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
                </motion.button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className={`w-full px-4 py-2 rounded-lg ${colors.buttonGradient} text-white font-medium`}>Done</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// FOOTER
// ============================================

const Footer: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { colors } = useTheme();

  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">Designed & Built by <span className={colors.textAccent}>{data.name}</span></p>
        <div className="flex items-center gap-4">
          {[
            { icon: Github, href: data.github },
            { icon: Linkedin, href: data.linkedin },
            { icon: Mail, href: `mailto:${data.email}` }
          ].filter(i => i.href).map(({ icon: Icon, href }, i) => (
            <motion.a key={i} href={href!} target="_blank" rel="noopener noreferrer"
              className={`text-gray-500 ${colors.hoverColor} transition-colors duration-300`}
              whileHover={{ y: -2 }} transition={{ type: "spring", ...springConfigs.snappy }}>
              <Icon size={18} />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PublicPortfolio({ data }: { data: PortfolioData }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>((data.theme as ThemeKey) || 'ocean');
  
  // Coding stats state
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [leetcodeCalendar, setLeetcodeCalendar] = useState<string>("{}");
  const [cfData, setCfData] = useState<any>(null);
  const [cfSubmissions, setCfSubmissions] = useState<any[]>([]);
  const [codechefData, setCodechefData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize smooth scroll
  useSmoothScroll();

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as ThemeKey;
    if (saved && colorThemes[saved]) setCurrentTheme(saved);
    else if (data.theme && colorThemes[data.theme as ThemeKey]) setCurrentTheme(data.theme as ThemeKey);
  }, [data.theme]);

  const handleThemeChange = (t: ThemeKey) => {
    setCurrentTheme(t);
    localStorage.setItem('portfolio-theme', t);
  };

  // Fetch coding stats
  useEffect(() => {
    const fetchAllData = async () => {
      let lcSuccess = false;
      
      if (data.leetcode) {
        const lcData = await fetchLeetCodeData(data.leetcode);
        if (lcData && lcData.totalSolved > 0) {
          setLeetcodeData(lcData);
          lcSuccess = true;
          if (lcData.submissionCalendar && lcData.submissionCalendar !== '{}') {
            setLeetcodeCalendar(lcData.submissionCalendar);
          }
        }
        const calendarData = await fetchLeetCodeCalendar(data.leetcode);
        if (calendarData && calendarData !== '{}') {
          setLeetcodeCalendar(calendarData);
        }
      }
      
      if (data.codeforces) {
        const cfInfo = await fetchCodeforcesData(data.codeforces);
        if (cfInfo) setCfData(cfInfo);
        const cfSubs = await fetchCodeforcesSubmissions(data.codeforces);
        if (cfSubs && cfSubs.length > 0) setCfSubmissions(cfSubs);
      }
      
      if (data.codechef) {
        const ccInfo = await fetchCodeChefData(data.codechef);
        if (ccInfo) setCodechefData(ccInfo);
      }
      
      if (!lcSuccess && retryCount < 2) {
        setTimeout(() => setRetryCount(prev => prev + 1), 3000);
      }
    };
    
    fetchAllData();
  }, [data.leetcode, data.codeforces, data.codechef, retryCount]);

  // Track active section
  useEffect(() => {
    let rafId: number;
    let lastKnownSection = activeSection;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const sections = ['hero', 'about', 'analytics', 'experience', 'projects', 'skills', 'achievements', 'profiles', 'contact'];
        const scrollPosition = window.scrollY + 200;

        for (const s of sections) {
          const el = document.getElementById(s);
          if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
            if (lastKnownSection !== s) {
              lastKnownSection = s;
              setActiveSection(s);
            }
            break;
          }
        }
        rafId = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeSection]);

  // Setup smooth scrolling CSS
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.scrollBehavior = 'smooth';

    const style = document.createElement('style');
    style.textContent = `
      html { scroll-behavior: smooth; }
      * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
    `;
    document.head.appendChild(style);

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      document.head.removeChild(style);
    };
  }, []);

  const colors = colorThemes[currentTheme];
  const uniqueCf = cfSubmissions?.length > 0 ? new Set(cfSubmissions.filter((sub: any) => sub.verdict === "OK").map((sub: any) => `${sub.problem.contestId}-${sub.problem.index}`)).size : 0;
  const totalProblems = (leetcodeData?.totalSolved || 0) + uniqueCf;

  // Check if we should show analytics section
  const hasAnalytics = data.leetcode || data.codeforces || data.codechef;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: handleThemeChange, colors }}>
      <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950`} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Settings Button */}
          <motion.button onClick={() => setIsSettingsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 p-3 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-full text-gray-400 ${colors.hoverColor} shadow-xl`}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", ...springConfigs.snappy }}>
            <Settings size={24} />
          </motion.button>

          {/* Settings Modal */}
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={currentTheme} setCurrentTheme={handleThemeChange} />

          {/* Sections */}
          <Navbar activeSection={activeSection} name={data.name} />
          <HeroSection data={data} />
          <AboutSection data={data} totalProblems={totalProblems} />
          {hasAnalytics && <AnalyticsSection leetcodeData={leetcodeData} cfData={cfData} cfSubmissions={cfSubmissions} codechefData={codechefData} leetcodeCalendar={leetcodeCalendar} />}
          <ExperienceSection experiences={data.experiences || []} />
          <ProjectsSection projects={data.projects || []} />
          <SkillsSection skills={data.skills || []} />
          <AchievementsSection achievements={data.achievements || []} leetcodeData={leetcodeData} cfData={cfData} cfSubmissions={cfSubmissions} />
          {hasAnalytics && <ProfilesSection data={data} leetcodeData={leetcodeData} cfData={cfData} codechefData={codechefData} />}
          <ContactSection data={data} />
          <Footer data={data} />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}