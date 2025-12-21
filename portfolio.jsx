import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Mail, Phone, ExternalLink, Code2, Database, Cloud, Cpu, ChevronDown, Menu, X, Award, Briefcase, GraduationCap, Terminal, Layers, Send } from 'lucide-react';

// ============================================
// PERFORMANCE-OPTIMIZED EASING & TRANSITIONS
// ============================================

// Simple, GPU-friendly easing
const smoothEase = [0.33, 1, 0.68, 1]; // CSS ease-out equivalent
const gentleEase = [0.25, 0.46, 0.45, 0.94]; // Smooth deceleration

// Minimal transition config - only transform & opacity (GPU accelerated)
const fastTransition = {
  duration: 0.5,
  ease: smoothEase,
};

const smoothTransition = {
  duration: 0.7,
  ease: gentleEase,
};

// ============================================
// OPTIMIZED 3D COMPONENTS
// ============================================

const AnimatedSphere = React.memo(({ position, color, speed = 1, distort = 0.4 }) => {
  const meshRef = useRef();
  const rotationSpeed = useRef({ x: 0.1 * speed, y: 0.15 * speed });
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed.current.x * delta;
      meshRef.current.rotation.y += rotationSpeed.current.y * delta;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={1.5}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={1}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>
    </Float>
  );
});

const ParticleField = React.memo(() => {
  const particlesRef = useRef();
  const count = 300;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 25;
      pos[i + 1] = (Math.random() - 0.5) * 25;
      pos[i + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01 * delta;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#00f5ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
});

const Scene3D = React.memo(() => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 6], fov: 70 }} 
      style={{ position: 'absolute', top: 0, left: 0 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      frameloop="always"
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#00f5ff" />
      <Suspense fallback={null}>
        <AnimatedSphere position={[-3.5, 1, -3]} color="#00f5ff" speed={0.5} distort={0.25} />
        <AnimatedSphere position={[3.5, -1, -4]} color="#8b5cf6" speed={0.7} distort={0.35} />
        <AnimatedSphere position={[0, 2.5, -5]} color="#06b6d4" speed={0.6} distort={0.3} />
        <ParticleField />
        <Stars radius={80} depth={40} count={1500} factor={3} saturation={0} fade speed={0.3} />
      </Suspense>
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.2}
        enableDamping
        dampingFactor={0.02}
      />
    </Canvas>
  );
});

// ============================================
// OPTIMIZED ANIMATION VARIANTS
// ============================================

// Simple fade up - no filters, just transform and opacity
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: smoothTransition
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: smoothTransition
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.12,
      delayChildren: 0.05,
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: smoothTransition
  }
};

// ============================================
// DATA
// ============================================

const experiences = [
  {
    company: "Zluri",
    role: "SDE Intern (Incoming)",
    period: "Expected Jan 2026",
    location: "Bangalore",
    type: "Upcoming",
    highlights: []
  },
  {
    company: "Infinity Analytics Consultancy",
    role: "Data Engineer Intern",
    period: "Oct 2025 - Dec 2025",
    location: "Remote",
    type: "Current",
    highlights: [
      "Architected real-time data ingestion pipelines using Apache Kafka on Kubernetes with elastic auto-scaling",
      "Restructured database schemas for petabyte-scale datasets with AWS S3 integration",
      "Executed large-scale data validation using AWS EMR with Apache Spark",
      "Established unified Data Lake architecture with automated monitoring dashboards"
    ]
  },
  {
    company: "BOSCH (BGSW) Pvt. Ltd",
    role: "AI Engineer Intern",
    period: "May 2025 - Jul 2025",
    location: "Bangalore",
    type: "Completed",
    highlights: [
      "Built Gen AI-powered Data Governance Platform integrating Kafka, IoT sensors, and cloud pipelines",
      "Orchestrated distributed workflows on Apache Spark, Ray, and Databricks with Agentic RAG",
      "Reduced data errors by 40% and processing time by 30% on petabyte-scale datasets",
      "Collaborated with 5 engineers ensuring compliance across 10+ departments"
    ]
  },
  {
    company: "NIT Durgapur Research",
    role: "Research Intern - Hardware-Accelerated AI",
    period: "Jan 2025 - Apr 2025",
    location: "Durgapur",
    type: "Completed",
    highlights: [
      "Engineered VLSI-based AI system achieving 98.9% accuracy with 60 FPS on FPGA",
      "Integrated Q-learning agent boosting accuracy by 30% across varying conditions",
      "Optimized with HLS C++ and Verilog, reducing power by 25% with sub-15ms latency"
    ]
  }
];

const projects = [
  {
    title: "Supply Chain Platform: Agentic Approach",
    date: "Nov 2024",
    tech: ["NestJS", "Next.js", "AWS", "CrewAI", "Autogen", "Docker", "LangChain", "Firebase", "Mapbox"],
    description: "Cloud-native logistics optimization platform for 200+ retail outlets with 25% improved demand forecasting",
    highlights: [
      "SARIMAX time-series models and Digital Twin simulations",
      "Multi-agent last-mile routing reducing delivery delays by 20%",
      "Hybrid PostgreSQL-Firestore with RBAC/ReBAC security"
    ],
    link: "#",
    color: "from-cyan-500 to-blue-600"
  },
  {
    title: "RAG Chatbot with Document + Video Support",
    date: "Aug 2023",
    tech: ["LangChain", "Streamlit", "Python", "ChromaDB", "Generative AI"],
    description: "Retrieval-Augmented Generation chatbot with vector database supporting 50+ PDFs and YouTube links weekly",
    highlights: [
      "Vector database integration with ChromaDB",
      "Arxiv/Wikipedia API integration",
      "60% enhanced retrieval efficiency"
    ],
    link: "https://github.com",
    color: "from-purple-500 to-pink-600"
  }
];

const skills = {
  "Programming": {
    icon: Code2,
    items: ["C", "C++", "Python", "Java", "JavaScript", "SQL", "HLS C++", "Verilog"]
  },
  "AI/ML & Gen AI": {
    icon: Cpu,
    items: ["PyTorch", "TensorFlow", "Keras", "RAG", "LangChain", "LangGraph", "Vision Transformers", "GANs", "NLP", "ONNX"]
  },
  "Big Data & Cloud": {
    icon: Cloud,
    items: ["Apache Spark", "Kafka", "Ray", "Hadoop", "AWS", "Azure", "Databricks", "ETL Pipelines"]
  },
  "Databases": {
    icon: Database,
    items: ["PostgreSQL", "MongoDB", "MySQL", "Firebase", "Pinecone", "ChromaDB", "FAISS"]
  },
  "Web & DevOps": {
    icon: Layers,
    items: ["React", "Next.js", "Node.js", "NestJS", "Docker", "Kubernetes", "CI/CD", "GraphQL", "gRPC"]
  },
  "Core CS": {
    icon: Terminal,
    items: ["DSA", "System Design", "DBMS", "OS", "Computer Networks", "OOPS", "SDLC"]
  }
};

const codingProfiles = [
  {
    platform: "LeetCode",
    username: "rishab_acharjee",
    stats: "150+ Solutions",
    color: "#FFA116",
    link: "https://leetcode.com"
  },
  {
    platform: "Codeforces",
    username: "Specialist",
    stats: "Max Rating: 1447",
    color: "#1F8ACB",
    link: "https://codeforces.com"
  },
  {
    platform: "GitHub",
    username: "rishab-acharjee",
    stats: "Active Contributor",
    color: "#6e5494",
    link: "https://github.com"
  }
];

// ============================================
// OPTIMIZED INTERSECTION OBSERVER HOOK
// ============================================

const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '-50px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// ============================================
// COMPONENTS
// ============================================

const Navbar = React.memo(({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['About', 'Experience', 'Projects', 'Skills', 'Profiles', 'Contact'];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled ? 'bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a
            href="#hero"
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            RA
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`relative text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  activeSection === item.toLowerCase() ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'
                }`}
              >
                {item}
                <span 
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 ${
                    activeSection === item.toLowerCase() ? 'w-full' : 'w-0'
                  }`}
                />
              </a>
            ))}
            <a
              href="/resume.pdf"
              target="_blank"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
            >
              Resume
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'top-3 rotate-45' : 'top-1'}`} />
              <span className={`absolute left-0 top-3 w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'top-3 -rotate-45' : 'top-5'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          {navItems.map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block py-3 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
});

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: gentleEase }}
        >
          <motion.span
            className="inline-block px-4 py-2 mb-6 text-sm font-medium text-cyan-400 border border-cyan-400/30 rounded-full bg-cyan-400/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: gentleEase }}
          >
            🚀 Open to Opportunities
          </motion.span>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: gentleEase }}
          >
            <span className="text-white">Hi, I'm </span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Rishab
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-4 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: gentleEase }}
          >
            AI Engineer • Data Engineer • Full-Stack Developer
          </motion.p>

          <motion.p
            className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: gentleEase }}
          >
            Final Year CSE @ NIT Durgapur | Building intelligent systems at scale | 
            Ex-BOSCH AI • Ex-Infinity Analytics
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: gentleEase }}
          >
            <a
              href="#contact"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold flex items-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              Get In Touch
              <Send size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a
              href="#projects"
              className="px-8 py-4 border border-gray-600 rounded-xl text-gray-300 font-semibold hover:border-cyan-400 hover:text-cyan-400 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
            >
              View Projects
            </a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="flex justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: gentleEase }}
          >
            {[
              { icon: Github, href: "https://github.com", label: "GitHub" },
              { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: Mail, href: "mailto:rishab.acharjee12345@gmail.com", label: "Email" }
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                <Icon size={24} />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-gray-500" size={32} />
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="about" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          {/* Left - Image/Visual */}
          <motion.div variants={fadeInLeft} className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-center hover:border-cyan-500/30 transition-colors duration-500">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1 hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        RA
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">Rishab Acharjee</h3>
                  <p className="text-cyan-400 font-medium mb-4">B.Tech CSE '26</p>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <GraduationCap size={18} />
                    <span>NIT Durgapur</span>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-cyan-400">8.78</div>
                        <div className="text-xs text-gray-500">SGPA</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">4+</div>
                        <div className="text-xs text-gray-500">Internships</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">250+</div>
                        <div className="text-xs text-gray-500">DSA Problems</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div variants={fadeInRight}>
            <span className="text-cyan-400 font-mono text-sm mb-4 block">&lt;about&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Crafting AI Solutions{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                at Scale
              </span>
            </h2>
            
            <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
              <p>
                I'm a final-year Computer Science student at NIT Durgapur with a passion for building 
                intelligent systems that solve real-world problems. My journey spans across AI/ML, 
                data engineering, and full-stack development.
              </p>
              <p>
                From architecting petabyte-scale data pipelines at BOSCH to engineering FPGA-accelerated 
                AI systems, I've consistently pushed the boundaries of what's possible with technology.
              </p>
              <p>
                When I'm not coding, you'll find me solving competitive programming challenges or 
                exploring the latest in Generative AI and Agentic Systems.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:scale-105 transition-transform duration-300">
                <Award size={18} />
                <span className="text-sm">Top 2% - Juspay Challenge</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:scale-105 transition-transform duration-300">
                <Code2 size={18} />
                <span className="text-sm">Codeforces Specialist</span>
              </div>
            </div>
            <span className="text-cyan-400 font-mono text-sm mt-6 block">&lt;/about&gt;</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const ExperienceSection = () => {
  const [activeExp, setActiveExp] = useState(0);
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="experience" className="py-32 px-6 relative bg-slate-900/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm">&lt;experience&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Where I've{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Worked
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            {/* Company Tabs */}
            <motion.div variants={fadeInLeft} className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
              {experiences.map((exp, index) => (
                <button
                  key={exp.company}
                  onClick={() => setActiveExp(index)}
                  className={`px-6 py-4 text-left rounded-xl whitespace-nowrap hover:translate-x-1 transition-all duration-300 ${
                    activeExp === index
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white'
                      : 'bg-slate-800/30 border border-transparent text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="font-semibold">{exp.company}</div>
                  <div className="text-sm opacity-70">{exp.period}</div>
                </button>
              ))}
            </motion.div>

            {/* Experience Details */}
            <motion.div variants={fadeInRight}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeExp}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: gentleEase }}
                  className="bg-slate-800/30 rounded-2xl p-8 border border-white/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {experiences[activeExp].role}
                      </h3>
                      <p className="text-cyan-400 font-medium mt-1">
                        @ {experiences[activeExp].company}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="px-3 py-1 bg-slate-700/50 rounded-full">
                        {experiences[activeExp].location}
                      </span>
                      <span className={`px-3 py-1 rounded-full ${
                        experiences[activeExp].type === 'Current' 
                          ? 'bg-green-500/20 text-green-400'
                          : experiences[activeExp].type === 'Upcoming'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {experiences[activeExp].type}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {experiences[activeExp].highlights.length > 0 ? (
                      experiences[activeExp].highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-gray-300 animate-fadeIn"
                          style={{ 
                            animationDelay: `${i * 100}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <span className="text-cyan-400 mt-1.5 flex-shrink-0">▹</span>
                          <span>{highlight}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">
                        Exciting things coming soon! 🚀
                      </li>
                    )}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </section>
  );
};

const ProjectsSection = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="projects" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm">&lt;projects&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Featured{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                variants={scaleIn}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${project.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                
                <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm h-full group-hover:border-white/20 group-hover:-translate-y-2 transition-all duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${project.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Layers className="text-white" size={24} />
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-cyan-400 hover:rotate-12 transition-all duration-300"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{project.date}</p>
                  <p className="text-gray-400 mb-6">{project.description}</p>

                  <ul className="space-y-2 mb-6">
                    {project.highlights.map((highlight, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-cyan-400">▹</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-medium bg-slate-700/50 text-gray-300 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SkillsSection = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="skills" className="py-32 px-6 relative bg-slate-900/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm">&lt;skills&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Tech{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Arsenal
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(skills).map(([category, { icon: Icon, items }], index) => (
              <motion.div
                key={category}
                variants={scaleIn}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-slate-800/30 rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 group-hover:scale-[1.02] transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-cyan-400" size={20} />
                    </div>
                    <h3 className="font-semibold text-white">{category}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 text-sm bg-slate-700/50 text-gray-300 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 hover:scale-105 transition-all duration-300 cursor-default"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ProfilesSection = () => {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section id="profiles" className="py-32 px-6 relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm">&lt;profiles&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Coding{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Profiles
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {codingProfiles.map((profile, index) => (
              <motion.a
                key={profile.platform}
                href={profile.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={scaleIn}
                className="group relative block"
              >
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                  style={{ backgroundColor: profile.color }}
                />
                
                <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm text-center group-hover:border-white/20 group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-500">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${profile.color}20` }}
                  >
                    <Code2 size={32} style={{ color: profile.color }} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">{profile.platform}</h3>
                  <p className="text-gray-400 text-sm mb-3">{profile.username}</p>
                  <p 
                    className="font-semibold"
                    style={{ color: profile.color }}
                  >
                    {profile.stats}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 group-hover:text-white transition-colors duration-300">
                    <span className="text-sm">View Profile</span>
                    <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Achievement Banner */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-white/10 backdrop-blur-sm hover:border-yellow-500/30 transition-colors duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                    <Award className="text-yellow-400" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Juspay Hiring Challenge 2025</h3>
                    <p className="text-gray-400">Qualified for Semi-Finals</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Top 2%
                  </div>
                  <div className="text-sm text-gray-400">out of 1,00,000 participants</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { ref, isVisible } = useIntersectionObserver();

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:rishab.acharjee12345@gmail.com?subject=Portfolio Contact from ${formData.name}&body=${formData.message}`;
  };

  return (
    <section id="contact" className="py-32 px-6 relative bg-slate-900/50" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="text-cyan-400 font-mono text-sm">&lt;contact&gt;</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
              Let's{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Connect
              </span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              I'm currently looking for new opportunities. Whether you have a question or just want to say hi, 
              I'll do my best to get back to you!
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            
            <div className="relative bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
                    placeholder="Your message..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-wrap justify-center gap-6">
                  <a
                    href="mailto:rishab.acharjee12345@gmail.com"
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 hover:scale-105 transition-all duration-300"
                  >
                    <Mail size={18} />
                    <span>rishab.acharjee12345@gmail.com</span>
                  </a>
                  <a
                    href="tel:+917432031131"
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 hover:scale-105 transition-all duration-300"
                  >
                    <Phone size={18} />
                    <span>+91-7432031131</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Designed & Built by <span className="text-cyan-400">Rishab Acharjee</span>
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: Github, href: "https://github.com" },
              { icon: Linkedin, href: "https://linkedin.com" },
              { icon: Mail, href: "mailto:rishab.acharjee12345@gmail.com" }
            ].map(({ icon: Icon, href }, index) => (
              <a
                key={index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'profiles', 'contact'];
          const scrollPosition = window.scrollY + 200;

          for (const section of sections) {
            const element = document.getElementById(section);
            if (element) {
              const { offsetTop, offsetHeight } = element;
              if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                setActiveSection(section);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative z-10">
        <Navbar activeSection={activeSection} />
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ProfilesSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}