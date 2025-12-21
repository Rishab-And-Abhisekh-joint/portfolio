'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// SHARED COLOR THEME SYSTEM
// ============================================

export const colorThemes = {
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
    // Additional for consistency
    cardBg: "bg-slate-800/50",
    cardHoverBg: "hover:bg-slate-800/70",
    borderAccent: "border-cyan-500/30",
    shadowColor: "shadow-cyan-500/20",
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
    cardBg: "bg-slate-800/50",
    cardHoverBg: "hover:bg-slate-800/70",
    borderAccent: "border-orange-500/30",
    shadowColor: "shadow-orange-500/20",
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
    cardBg: "bg-slate-800/50",
    cardHoverBg: "hover:bg-slate-800/70",
    borderAccent: "border-green-500/30",
    shadowColor: "shadow-green-500/20",
  }
};

export type ThemeKey = keyof typeof colorThemes;
export type ThemeColors = typeof colorThemes.ocean;

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'ocean',
  setTheme: () => {},
  colors: colorThemes.ocean
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>('ocean');

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as ThemeKey;
    if (saved && colorThemes[saved]) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  };

  const colors = colorThemes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;