'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Calendar, BookOpen, Trophy, User, LogIn, LogOut, Settings, Palette, Save } from 'lucide-react';
import { useTheme, colorThemes, ThemeKey } from '@/app/context/Themecontext';
import { useAuth } from '@/app/context/AuthContext';

const GlobalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  const { colors, setTheme, theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { name: 'Portfolio', href: '/', icon: LayoutDashboard },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Sheets', href: '/sheets', icon: BookOpen },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              RA.Dev
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg border border-white/5"
                        style={{ background: `${colors.primary}20` }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} />
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              {/* Sign In / Sign Out Button */}
              {!isLoading && (
                isAuthenticated ? (
                  <motion.button
                    onClick={handleSignOut}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-2 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      color: 'white'
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </motion.button>
                ) : (
                  <Link
                    href="/auth"
                    className="ml-2 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      color: 'white'
                    }}
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium ${
                      pathname === item.href ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={pathname === item.href ? { background: `${colors.primary}20` } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.name}
                    </div>
                  </Link>
                ))}
                
                {/* Mobile Sign In/Out */}
                {!isLoading && (
                  isAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-3 rounded-lg text-base font-medium text-white flex items-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg text-base font-medium text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      <div className="flex items-center gap-3">
                        <LogIn size={18} />
                        Sign In
                      </div>
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Settings Button - Fixed Bottom Right */}
      <motion.button 
        onClick={() => setIsSettingsOpen(true)} 
        className="fixed bottom-6 right-6 z-50 p-3 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-full text-gray-400 shadow-xl"
        style={{ 
          ['--hover-color' as any]: colors.primary 
        }}
        whileHover={{ scale: 1.1, color: colors.primary }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Settings size={24} />
      </motion.button>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentTheme={theme} 
        setCurrentTheme={setTheme}
        colors={colors}
      />
    </>
  );
};

// Settings Modal Component
const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  currentTheme: ThemeKey; 
  setCurrentTheme: (t: ThemeKey) => void;
  colors: typeof colorThemes.ocean;
}> = ({ isOpen, onClose, currentTheme, setCurrentTheme, colors }) => {
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.3 }} 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          transition={{ duration: 0.4 }} 
          className="relative bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings style={{ color: colors.primary }} size={20} /> Settings
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-300">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Palette size={16} />Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(colorThemes) as ThemeKey[]).map((k) => (
                <motion.button 
                  key={k} 
                  onClick={() => setCurrentTheme(k)} 
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    currentTheme === k 
                      ? 'border-white/50 bg-slate-800' 
                      : 'border-white/10 bg-slate-800/30 hover:border-white/20'
                  }`} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="h-8 rounded-lg mb-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${colorThemes[k].primary}, ${colorThemes[k].secondary})` 
                    }}
                  />
                  <span className="text-xs text-gray-400 capitalize">{colorThemes[k].name}</span>
                  {currentTheme === k && (
                    <motion.div 
                      layoutId="activeTheme" 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" 
                      transition={{ type: "spring", stiffness: 400, damping: 35 }} 
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white transition-colors duration-300"
            >
              Close
            </button>
            <motion.button 
              onClick={onClose} 
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalNavbar;