'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarPlus, ExternalLink, ChevronLeft, ChevronRight,
  Clock, Trophy, Loader2, Calendar as CalendarIcon, Check, X,
  Bell, Filter, CheckCircle2, Circle, Sparkles, AlertCircle,
  Star, ThumbsUp, RefreshCw
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, addMonths, subMonths, isAfter, isBefore,
  differenceInHours, differenceInMinutes, differenceInDays
} from 'date-fns';

// ============================================
// SHARED COLOR THEME SYSTEM
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
    buttonGradient: "bg-gradient-to-r from-cyan-500 to-blue-600",
    cardBorder: "border-cyan-500/20",
    hoverColor: "hover:text-cyan-400",
    textAccent: "text-cyan-400",
    bgAccent: "bg-cyan-500",
    ringColor: "ring-cyan-500",
    borderAccent: "border-cyan-500/30",
    bgAccentMuted: "bg-cyan-500/10",
    bgAccentStrong: "bg-cyan-500/20",
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
    buttonGradient: "bg-gradient-to-r from-orange-500 to-pink-600",
    cardBorder: "border-orange-500/20",
    hoverColor: "hover:text-orange-400",
    textAccent: "text-orange-400",
    bgAccent: "bg-orange-500",
    ringColor: "ring-orange-500",
    borderAccent: "border-orange-500/30",
    bgAccentMuted: "bg-orange-500/10",
    bgAccentStrong: "bg-orange-500/20",
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
    buttonGradient: "bg-gradient-to-r from-green-500 to-teal-600",
    cardBorder: "border-green-500/20",
    hoverColor: "hover:text-green-400",
    textAccent: "text-green-400",
    bgAccent: "bg-green-500",
    ringColor: "ring-green-500",
    borderAccent: "border-green-500/30",
    bgAccentMuted: "bg-green-500/10",
    bgAccentStrong: "bg-green-500/20",
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
// TYPES & DATA
// ============================================

interface Contest {
  id: string;
  name: string;
  site: string;
  start_time: string;
  end_time: string;
  url: string;
  duration: string;
  in_24_hours?: string;
  status?: string;
}

interface RegisteredContest {
  id: string;
  registeredAt: string;
  addedToCalendar: boolean;
  contestUrl: string;
  contestName: string;
}

// Platform-specific styling
const PLATFORM_STYLES: Record<string, { color: string; bg: string; border: string; hex: string; displayName: string }> = {
  LeetCode: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', hex: '#facc15', displayName: 'LeetCode' },
  CodeForces: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', hex: '#60a5fa', displayName: 'Codeforces' },
  Codeforces: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', hex: '#60a5fa', displayName: 'Codeforces' },
  CodeChef: { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', hex: '#d97706', displayName: 'CodeChef' },
  AtCoder: { color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30', hex: '#9ca3af', displayName: 'AtCoder' },
  HackerRank: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', hex: '#4ade80', displayName: 'HackerRank' },
  HackerEarth: { color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30', hex: '#818cf8', displayName: 'HackerEarth' },
  TopCoder: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', hex: '#fb923c', displayName: 'TopCoder' },
  GeeksforGeeks: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', hex: '#22c55e', displayName: 'GFG' },
  geeks_for_geeks: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', hex: '#22c55e', displayName: 'GFG' },
  GFG: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', hex: '#22c55e', displayName: 'GFG' },
  Kick_Start: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', hex: '#f87171', displayName: 'Kick Start' },
  Default: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', hex: '#c084fc', displayName: 'Other' }
};

// Normalize platform names
const normalizePlatformName = (site: string): string => {
  const lower = site.toLowerCase().replace(/[_\s]/g, '');
  if (lower === 'codeforces' || lower === 'codeforces.com') return 'CodeForces';
  if (lower === 'leetcode' || lower === 'leetcode.com') return 'LeetCode';
  if (lower === 'codechef' || lower === 'codechef.com') return 'CodeChef';
  if (lower === 'atcoder' || lower === 'atcoder.jp') return 'AtCoder';
  if (lower === 'hackerrank' || lower === 'hackerrank.com') return 'HackerRank';
  if (lower === 'hackerearth' || lower === 'hackerearth.com') return 'HackerEarth';
  if (lower === 'topcoder' || lower === 'topcoder.com') return 'TopCoder';
  if (lower === 'geeksforgeeks' || lower === 'gfg' || lower === 'geeksforgeeks.org') return 'GeeksforGeeks';
  if (lower === 'kickstart' || lower === 'googlekickstart') return 'Kick_Start';
  return site;
};

// Generate Google Calendar Link
const getGoogleCalendarLink = (contest: Contest) => {
  const formatGCalDate = (date: string) => new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const start = formatGCalDate(contest.start_time);
  const end = formatGCalDate(contest.end_time);
  const details = `Platform: ${contest.site}\nContest Link: ${contest.url}\n\nGood luck! 🚀`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.name)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=Online&sf=true&output=xml`;
};

// Get time until contest
const getTimeUntil = (startTime: string, endTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now > end) {
    const daysAgo = differenceInDays(now, end);
    if (daysAgo === 0) return 'Ended today';
    if (daysAgo === 1) return 'Yesterday';
    return `${daysAgo}d ago`;
  }
  
  if (now >= start && now <= end) {
    return 'Live Now!';
  }
  
  const hours = differenceInHours(start, now);
  const minutes = differenceInMinutes(start, now) % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (hours < 24) return `${hours}h ${minutes}m`;
  if (hours < 48) return 'Tomorrow';
  return `${Math.floor(hours / 24)}d`;
};

const isContestPast = (endTime: string) => new Date(endTime) < new Date();
const isContestLive = (startTime: string, endTime: string) => {
  const now = new Date();
  return now >= new Date(startTime) && now <= new Date(endTime);
};

// ============================================
// REGISTRATION CONFIRMATION MODAL
// ============================================

const RegistrationModal = ({ 
  isOpen, 
  contest, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  contest: Contest | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const { colors } = useTheme();
  
  if (!isOpen || !contest) return null;
  
  const styles = PLATFORM_STYLES[contest.site] || PLATFORM_STYLES.Default;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-slate-900 border ${colors.borderAccent} rounded-2xl p-6 max-w-md w-full shadow-2xl`}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${colors.bgAccentMuted} flex items-center justify-center`}>
              <CheckCircle2 size={32} style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Did you register?</h3>
            <p className="text-gray-400 text-sm">
              Did you successfully register for this contest on the website?
            </p>
          </div>
          
          <div className={`p-4 rounded-xl ${styles.bg} border ${styles.border} mb-6`}>
            <span className={`text-xs font-bold ${styles.color}`}>{styles.displayName}</span>
            <h4 className="text-white font-semibold mt-1 line-clamp-2">{contest.name}</h4>
            <p className="text-gray-400 text-xs mt-1">
              {format(new Date(contest.start_time), 'MMM d, yyyy • HH:mm')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-semibold transition-all"
            >
              No, Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 ${colors.buttonGradient} text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2`}
            >
              <Check size={18} />
              Yes, Registered!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// CONTEST CARD COMPONENT
// ============================================

const ContestCard = ({ 
  contest, 
  isRegistered, 
  onRegisterClick,
  onUnregister,
  onAddToCalendar,
  addedToCalendar
}: { 
  contest: Contest; 
  isRegistered: boolean;
  onRegisterClick: () => void;
  onUnregister: () => void;
  onAddToCalendar: () => void;
  addedToCalendar: boolean;
}) => {
  const { colors } = useTheme();
  const startDate = new Date(contest.start_time);
  const isPast = isContestPast(contest.end_time);
  const isLive = isContestLive(contest.start_time, contest.end_time);
  const styles = PLATFORM_STYLES[contest.site] || PLATFORM_STYLES.Default;
  const durationHrs = (parseInt(contest.duration) / 3600).toFixed(1);
  const timeUntil = getTimeUntil(contest.start_time, contest.end_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col gap-3 p-4 bg-slate-800/40 border rounded-xl transition-all group
        ${isRegistered ? `${colors.borderAccent} ${colors.bgAccentMuted}` : 'border-white/5 hover:border-white/10'}
        ${isPast ? 'opacity-60' : ''}
        ${isLive ? 'ring-2 ring-green-500/50' : ''}
      `}
    >
      {/* Registration indicator */}
      {isRegistered && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 ${colors.bgAccent} rounded-full flex items-center justify-center shadow-lg`}>
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Live indicator */}
      {isLive && (
        <div className="absolute -top-1 -left-1 px-2 py-0.5 bg-green-500 rounded-full flex items-center gap-1 shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex justify-between w-full items-center">
            <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold border ${styles.bg} ${styles.color} ${styles.border}`}>
              {styles.displayName}
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                isLive ? 'bg-green-500/20 text-green-400 animate-pulse' :
                isPast ? 'bg-slate-700/50 text-gray-500' :
                timeUntil.includes('h') || timeUntil.includes('m') ? `${colors.bgAccentMuted} ${colors.textAccent}` :
                'bg-slate-700/50 text-gray-400'
              }`}>
                {timeUntil}
              </span>
            </div>
          </div>
          <h3 className={`font-bold text-white ${colors.hoverColor} transition-colors line-clamp-2 text-sm`} title={contest.name}>
            {contest.name}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-gray-400 text-xs">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={12} style={{ color: colors.primary }}/>
          <span>{format(startDate, 'MMM d, HH:mm')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-purple-400"/>
          <span>{durationHrs === 'NaN' ? '—' : `${durationHrs}h`}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        {/* For PAST contests - only show View button */}
        {isPast ? (
          <a
            href={contest.url}
            target="_blank"
            rel="noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 ${colors.hoverColor} text-gray-300 rounded-lg text-xs font-semibold transition-all`}
          >
            View Problems <ExternalLink size={12} />
          </a>
        ) : (
          <>
            {/* Register/Unregister button for future contests */}
            {isRegistered ? (
              <button
                onClick={onUnregister}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${colors.buttonGradient} text-white`}
              >
                <CheckCircle2 size={14} />
                Registered
              </button>
            ) : (
              <button
                onClick={onRegisterClick}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold transition-all"
              >
                <ExternalLink size={14} />
                Register →
              </button>
            )}
            
            {/* External link */}
            <a
              href={contest.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 ${colors.hoverColor} text-gray-300 rounded-lg text-xs font-semibold transition-all`}
              title="Open contest page"
            >
              <ExternalLink size={12} />
            </a>

            {/* Calendar button */}
            <button
              onClick={onAddToCalendar}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                ${addedToCalendar 
                  ? 'bg-green-500/20 text-green-400' 
                  : `bg-white/5 hover:bg-white/10 ${colors.hoverColor} text-gray-300`
                }`}
              title="Add to Google Calendar"
            >
              <CalendarPlus size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// CALENDAR VIEW
// ============================================

const CalendarView = ({ 
  contests, 
  registeredIds,
  onSelectDate 
}: { 
  contests: Contest[];
  registeredIds: Set<string>;
  onSelectDate: (date: Date) => void;
}) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const onToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'd');
      const cloneDay = new Date(day);
      const dayContests = contests.filter(c => isSameDay(new Date(c.start_time), cloneDay));
      const isToday = isSameDay(day, new Date());
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isPastDay = isBefore(day, new Date()) && !isToday;
      
      days.push(
        <div
          key={day.toString()}
          onClick={() => onSelectDate(cloneDay)}
          className={`min-h-[90px] md:min-h-[100px] p-1.5 md:p-2 border border-white/5 flex flex-col gap-1 relative transition-all cursor-pointer
            ${!isCurrentMonth ? "text-gray-700 bg-slate-900/50" : "text-white hover:bg-white/5"}
            ${isToday ? `${colors.bgAccentMuted} ${colors.borderAccent}` : ""}
            ${isPastDay && isCurrentMonth ? "bg-slate-900/30" : ""}
          `}
        >
          <span className={`text-xs font-bold mb-0.5 ${isToday ? colors.textAccent : isPastDay ? "text-gray-600" : "text-gray-400"}`}>
            {formattedDate}
          </span>
          <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[60px] md:max-h-[70px] custom-scrollbar">
            {dayContests.slice(0, 3).map((contest, idx) => {
              const styles = PLATFORM_STYLES[contest.site] || PLATFORM_STYLES.Default;
              const isRegistered = registeredIds.has(contest.id);
              const isPastContest = isContestPast(contest.end_time);
              const isLive = isContestLive(contest.start_time, contest.end_time);
              
              return (
                <a 
                  key={`${contest.id}-${idx}`}
                  href={contest.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`relative block px-1 py-0.5 rounded text-[8px] md:text-[9px] font-medium border truncate cursor-pointer hover:opacity-80 transition-all
                    ${styles.bg} ${styles.color} ${styles.border}
                    ${isPastContest ? 'opacity-50' : ''}
                    ${isLive ? 'ring-1 ring-green-500' : ''}
                  `}
                  title={`${contest.name} - ${format(new Date(contest.start_time), 'HH:mm')}`}
                >
                  {isRegistered && (
                    <span className="absolute -left-0.5 -top-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                  )}
                  {isLive && (
                    <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  )}
                  <span className="opacity-70">{format(new Date(contest.start_time), 'HH:mm')}</span> {styles.displayName.slice(0, 2)}
                </a>
              );
            })}
            {dayContests.length > 3 && (
              <span className="text-[8px] text-gray-500 pl-1">+{dayContests.length - 3} more</span>
            )}
          </div>
        </div>
      );
      day = new Date(day); 
      day.setDate(day.getDate() + 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className={`bg-slate-800/30 border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-xl h-full`}>
      <div className="flex items-center justify-between p-4 md:p-6 bg-slate-900/50 border-b border-white/10">
        <h2 className={`text-lg md:text-2xl font-bold ${colors.gradientText} bg-clip-text text-transparent flex items-center gap-3`}>
          <Trophy style={{ color: colors.primary }} />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onToday} 
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border border-white/10 ${colors.hoverColor} text-gray-400 hover:bg-white/5`}
          >
            Today
          </button>
          <button onClick={onPrevMonth} className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white border border-white/5`}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={onNextMonth} className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white border border-white/5`}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-slate-900/80 text-gray-400 font-semibold text-[10px] md:text-xs uppercase tracking-wider text-center py-2 md:py-3 border-b border-white/10">
        {weekDays.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="bg-slate-900/20">{rows}</div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 p-3 bg-slate-900/50 border-t border-white/10 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: colors.primary }}></div>
          <span className="text-gray-400">Registered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-400">Live</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <span className="text-gray-400">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FILTER BAR
// ============================================

type FilterMode = 'all' | 'upcoming' | 'registered' | 'past' | 'recommended';

const FilterBar = ({ 
  platforms, 
  selectedPlatforms, 
  onTogglePlatform,
  filterMode,
  onSetFilterMode
}: {
  platforms: string[];
  selectedPlatforms: Set<string>;
  onTogglePlatform: (platform: string) => void;
  filterMode: FilterMode;
  onSetFilterMode: (mode: FilterMode) => void;
}) => {
  const { colors } = useTheme();

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800/30 rounded-xl border border-white/5">
      {/* Platform filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-gray-500" />
        {platforms.map(platform => {
          const styles = PLATFORM_STYLES[platform] || PLATFORM_STYLES.Default;
          const isSelected = selectedPlatforms.has(platform);
          return (
            <button
              key={platform}
              onClick={() => onTogglePlatform(platform)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all
                ${isSelected ? `${styles.bg} ${styles.color} ${styles.border}` : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
              `}
            >
              {styles.displayName}
            </button>
          );
        })}
      </div>
      
      {/* Filter mode tabs - mutually exclusive */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => onSetFilterMode('all')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all
            ${filterMode === 'all' ? `${colors.bgAccentMuted} ${colors.textAccent} ${colors.borderAccent}` : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
          `}
        >
          All
        </button>
        <button
          onClick={() => onSetFilterMode('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1
            ${filterMode === 'upcoming' ? `${colors.bgAccentMuted} ${colors.textAccent} ${colors.borderAccent}` : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
          `}
        >
          <Clock size={10} /> Upcoming
        </button>
        <button
          onClick={() => onSetFilterMode('registered')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1
            ${filterMode === 'registered' ? `${colors.bgAccentMuted} ${colors.textAccent} ${colors.borderAccent}` : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
          `}
        >
          <CheckCircle2 size={10} /> Registered
        </button>
        <button
          onClick={() => onSetFilterMode('past')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1
            ${filterMode === 'past' ? `${colors.bgAccentMuted} ${colors.textAccent} ${colors.borderAccent}` : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
          `}
        >
          <Clock size={10} /> Past
        </button>
        <button
          onClick={() => onSetFilterMode('recommended')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1
            ${filterMode === 'recommended' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-slate-700/30 text-gray-500 border-transparent hover:border-white/10'}
          `}
        >
          <Star size={10} /> For You
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const EventsPage = () => {
  const [theme, setTheme] = useState<ThemeKey>('ocean');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredContests, setRegisteredContests] = useState<Map<string, RegisteredContest>>(new Map());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('upcoming');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [pendingContest, setPendingContest] = useState<Contest | null>(null);

  const colors = colorThemes[theme];

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as ThemeKey;
    if (saved && colorThemes[saved]) {
      setTheme(saved);
    }
  }, []);

  // Load registered contests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('registered-contests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate the data - only keep valid entries
        const validEntries = Object.entries(parsed).filter(([key, value]: [string, any]) => {
          return value && typeof value === 'object' && value.id && value.contestName;
        });
        setRegisteredContests(new Map(validEntries as [string, RegisteredContest][]));
      } catch (e) {
        console.error('Failed to parse registered contests');
        // Clear invalid data
        localStorage.removeItem('registered-contests');
        setRegisteredContests(new Map());
      }
    }
  }, []);

  // Save registered contests
  const saveRegisteredContests = (newMap: Map<string, RegisteredContest>) => {
    const obj = Object.fromEntries(newMap);
    localStorage.setItem('registered-contests', JSON.stringify(obj));
    setRegisteredContests(newMap);
  };

  // Handle registration click - opens URL and shows confirmation
  const handleRegisterClick = (contest: Contest) => {
    window.open(contest.url, '_blank');
    setPendingContest(contest);
    setShowRegModal(true);
  };

  // Confirm registration
  const confirmRegistration = () => {
    if (pendingContest) {
      const newMap = new Map(registeredContests);
      newMap.set(pendingContest.id, {
        id: pendingContest.id,
        registeredAt: new Date().toISOString(),
        addedToCalendar: false,
        contestUrl: pendingContest.url,
        contestName: pendingContest.name
      });
      saveRegisteredContests(newMap);
    }
    setShowRegModal(false);
    setPendingContest(null);
  };

  // Cancel registration
  const cancelRegistration = () => {
    setShowRegModal(false);
    setPendingContest(null);
  };

  // Unregister from contest
  const unregisterContest = (contestId: string) => {
    const newMap = new Map(registeredContests);
    newMap.delete(contestId);
    saveRegisteredContests(newMap);
  };

  // Add to calendar
  const addToCalendar = (contest: Contest) => {
    window.open(getGoogleCalendarLink(contest), '_blank');
    const newMap = new Map(registeredContests);
    const existing = newMap.get(contest.id);
    if (existing) {
      newMap.set(contest.id, { ...existing, addedToCalendar: true });
      saveRegisteredContests(newMap);
    }
  };

  // Fetch contests from our API route
  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use our server-side API route
        const response = await fetch('/api/contests');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }
        
        const data = await response.json();
        
        if (data.contests && Array.isArray(data.contests)) {
          setContests(data.contests);
          
          // Set platforms from fetched data
          const availablePlatforms = new Set<string>(data.contests.map((c: Contest) => c.site));
          setSelectedPlatforms(availablePlatforms);
          
          if (!data.fetchedFromApi) {
            setError('Some APIs unavailable. Showing available contests. Check platform websites for latest updates.');
          }
          
          console.log('✅ Loaded', data.contests.length, 'contests');
          console.log('Platforms:', data.platforms);
        }
      } catch (e) {
        console.error('Failed to fetch contests:', e);
        setError('Failed to load contests. Please refresh the page.');
        
        // Load fallback data
        const now = new Date();
        const getNextDayOfWeek = (dayOfWeek: number, hour: number, minute: number = 0, weeksAhead: number = 0) => {
          const date = new Date(now);
          let diff = (dayOfWeek - date.getDay() + 7) % 7;
          if (diff === 0 && (date.getHours() > hour || (date.getHours() === hour && date.getMinutes() >= minute))) {
            diff = 7;
          }
          date.setDate(date.getDate() + diff + (weeksAhead * 7));
          date.setHours(hour, minute, 0, 0);
          return date;
        };
        
        const fallbackContests: Contest[] = [
          {
            id: 'leetcode-weekly',
            name: 'LeetCode Weekly Contest',
            site: 'LeetCode',
            start_time: getNextDayOfWeek(0, 8, 0).toISOString(),
            end_time: new Date(getNextDayOfWeek(0, 8, 0).getTime() + 5400000).toISOString(),
            url: 'https://leetcode.com/contest/',
            duration: '5400'
          },
          {
            id: 'codeforces-round',
            name: 'Codeforces Round',
            site: 'CodeForces',
            start_time: getNextDayOfWeek(5, 14, 35).toISOString(),
            end_time: new Date(getNextDayOfWeek(5, 14, 35).getTime() + 7200000).toISOString(),
            url: 'https://codeforces.com/contests',
            duration: '7200'
          },
          {
            id: 'codechef-starters',
            name: 'CodeChef Starters',
            site: 'CodeChef',
            start_time: getNextDayOfWeek(3, 14, 30).toISOString(),
            end_time: new Date(getNextDayOfWeek(3, 14, 30).getTime() + 7200000).toISOString(),
            url: 'https://www.codechef.com/contests',
            duration: '7200'
          }
        ];
        
        setContests(fallbackContests);
        setSelectedPlatforms(new Set(['LeetCode', 'CodeForces', 'CodeChef']));
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchContests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter contests based on mode
  const getFilteredContests = useCallback(() => {
    let filtered = contests.filter(c => selectedPlatforms.has(c.site));
    
    switch (filterMode) {
      case 'upcoming':
        return filtered.filter(c => !isContestPast(c.end_time));
      case 'past':
        return filtered.filter(c => isContestPast(c.end_time))
          .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());
      case 'registered':
        return filtered.filter(c => registeredContests.has(c.id));
      case 'recommended':
        // Recommend based on popular platforms
        const recommendedPlatforms = ['LeetCode', 'CodeForces', 'CodeChef', 'GeeksforGeeks'];
        return filtered
          .filter(c => !isContestPast(c.end_time) && recommendedPlatforms.includes(c.site))
          .slice(0, 10);
      default:
        return filtered;
    }
  }, [contests, selectedPlatforms, filterMode, registeredContests]);

  const filteredContests = getFilteredContests();
  
  // Stats
  const registeredIds = new Set(registeredContests.keys());
  const platforms = Array.from(new Set(contests.map(c => c.site)));
  const liveCount = contests.filter(c => isContestLive(c.start_time, c.end_time)).length;
  const upcomingCount = contests.filter(c => !isContestPast(c.end_time)).length;
  const actualRegisteredCount = registeredContests.size;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      <div className="min-h-screen bg-slate-950">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950`} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${colors.gradientText} bg-clip-text text-transparent mb-2 flex items-center gap-3`}>
                <Sparkles style={{ color: colors.primary }} />
                Contest Calendar
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Track and register for coding contests across all platforms</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {liveCount > 0 && (
                <div className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
                  {liveCount} Live
                </div>
              )}
              <div className={`px-3 py-1.5 rounded-full bg-slate-800 border ${colors.cardBorder} text-xs text-gray-400 flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></span> 
                {upcomingCount} Upcoming
              </div>
              <div className={`px-3 py-1.5 rounded-full bg-slate-800 border ${colors.cardBorder} text-xs ${colors.textAccent} flex items-center gap-2`}>
                <CheckCircle2 size={12} />
                {actualRegisteredCount} Registered
                {actualRegisteredCount > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('registered-contests');
                      setRegisteredContests(new Map());
                    }}
                    className="ml-1 hover:text-red-400 transition-colors"
                    title="Clear all registrations"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <FilterBar
            platforms={platforms}
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={(p) => {
              const newSet = new Set(selectedPlatforms);
              if (newSet.has(p)) newSet.delete(p);
              else newSet.add(p);
              setSelectedPlatforms(newSet);
            }}
            filterMode={filterMode}
            onSetFilterMode={setFilterMode}
          />

          {/* Warning/Error State */}
          {error && !loading && (
            <div className={`flex items-center gap-3 p-4 mt-4 rounded-xl ${
              error.includes('sample') 
                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[500px]">
              <Loader2 className="animate-spin" size={48} style={{ color: colors.primary }} />
              <p className="text-gray-500">Syncing contest schedules from all platforms...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6 mt-6">
              
              {/* LEFT SIDEBAR */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Section title based on filter mode */}
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    {filterMode === 'past' ? (
                      <Clock className="text-gray-500" size={20} />
                    ) : filterMode === 'registered' ? (
                      <CheckCircle2 style={{ color: colors.primary }} size={20} />
                    ) : filterMode === 'recommended' ? (
                      <Star className="text-yellow-400" size={20} />
                    ) : (
                      <Clock style={{ color: colors.primary }} size={20} />
                    )}
                    <h2 className="text-lg font-bold text-white">
                      {filterMode === 'past' ? 'Past Contests' : 
                       filterMode === 'registered' ? 'My Registered' :
                       filterMode === 'recommended' ? 'For You' :
                       'Up Next'}
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded-full">
                    {filteredContests.length} events
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-350px)] pr-2 custom-scrollbar">
                  {filteredContests.length > 0 ? filteredContests.map((contest) => (
                    <ContestCard 
                      key={contest.id} 
                      contest={contest}
                      isRegistered={registeredContests.has(contest.id)}
                      onRegisterClick={() => handleRegisterClick(contest)}
                      onUnregister={() => unregisterContest(contest.id)}
                      onAddToCalendar={() => addToCalendar(contest)}
                      addedToCalendar={registeredContests.get(contest.id)?.addedToCalendar || false}
                    />
                  )) : (
                    <div className="text-center text-gray-500 py-10 bg-slate-800/20 rounded-xl border border-white/5">
                      <CalendarIcon className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No contests found</p>
                      <p className="text-xs mt-1">
                        {filterMode === 'registered' ? 'Register for some contests!' :
                         filterMode === 'past' ? 'No past contests in selected platforms' :
                         'Check back later or adjust filters!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Date Contests */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`p-4 bg-slate-800/50 border ${colors.borderAccent} rounded-xl`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-semibold ${colors.textAccent} text-sm`}>
                          {format(selectedDate, 'MMM d, yyyy')}
                        </h3>
                        <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {contests
                          .filter(c => isSameDay(new Date(c.start_time), selectedDate))
                          .map(contest => {
                            const styles = PLATFORM_STYLES[contest.site] || PLATFORM_STYLES.Default;
                            const isPast = isContestPast(contest.end_time);
                            return (
                              <a 
                                key={contest.id} 
                                href={contest.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`p-2 rounded-lg ${styles.bg} border ${styles.border} hover:opacity-80 transition-all ${isPast ? 'opacity-50' : ''}`}
                              >
                                <div className={`text-xs font-bold ${styles.color}`}>{styles.displayName}</div>
                                <div className="text-white text-sm truncate">{contest.name}</div>
                                <div className="text-gray-400 text-xs flex items-center gap-2">
                                  <span>{format(new Date(contest.start_time), 'HH:mm')}</span>
                                  {isPast && <span className="text-gray-600">(Ended)</span>}
                                </div>
                              </a>
                            );
                          })}
                        {contests.filter(c => isSameDay(new Date(c.start_time), selectedDate)).length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-2">No contests on this day</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT SIDE: CALENDAR VIEW */}
              <div className="lg:col-span-9">
                <CalendarView 
                  contests={contests.filter(c => selectedPlatforms.has(c.site))} 
                  registeredIds={registeredIds}
                  onSelectDate={setSelectedDate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Registration Confirmation Modal */}
        <RegistrationModal
          isOpen={showRegModal}
          contest={pendingContest}
          onConfirm={confirmRegistration}
          onCancel={cancelRegistration}
        />

        {/* Custom scrollbar styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export default EventsPage;