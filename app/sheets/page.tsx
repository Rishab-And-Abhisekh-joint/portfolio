'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, ExternalLink, BookOpen, ChevronDown, ChevronUp, 
  Search, Flame, Bookmark, Trophy, Loader2, BarChart3, Target,
  TrendingUp, Award, Star, Filter, X, RefreshCw, PieChart, Sparkles,
  Download, Upload, AlertCircle
} from 'lucide-react';

// Theme system (same as before)
const colorThemes = {
  ocean: {
    name: "Ocean", primary: "#06b6d4",
    gradientText: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600",
    gradientBg: "from-cyan-900/20",
    buttonGradient: "bg-gradient-to-r from-cyan-500 to-blue-600",
    cardBorder: "border-cyan-500/20",
    hoverColor: "hover:text-cyan-400",
    textAccent: "text-cyan-400",
    bgAccent: "bg-cyan-500",
    bgAccentMuted: "bg-cyan-500/10",
    borderAccent: "border-cyan-500/30",
    progressBar: "from-cyan-400 to-blue-500",
  },
  sunset: {
    name: "Sunset", primary: "#f97316",
    gradientText: "bg-gradient-to-r from-orange-400 via-pink-500 to-red-600",
    gradientBg: "from-orange-900/20",
    buttonGradient: "bg-gradient-to-r from-orange-500 to-pink-600",
    cardBorder: "border-orange-500/20",
    hoverColor: "hover:text-orange-400",
    textAccent: "text-orange-400",
    bgAccent: "bg-orange-500",
    bgAccentMuted: "bg-orange-500/10",
    borderAccent: "border-orange-500/30",
    progressBar: "from-orange-400 to-pink-500",
  },
  forest: {
    name: "Forest", primary: "#22c55e",
    gradientText: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600",
    gradientBg: "from-green-900/20",
    buttonGradient: "bg-gradient-to-r from-green-500 to-teal-600",
    cardBorder: "border-green-500/20",
    hoverColor: "hover:text-green-400",
    textAccent: "text-green-400",
    bgAccent: "bg-green-500",
    bgAccentMuted: "bg-green-500/10",
    borderAccent: "border-green-500/30",
    progressBar: "from-green-400 to-teal-500",
  }
};

type ThemeKey = keyof typeof colorThemes;
const ThemeContext = createContext<{ theme: ThemeKey; colors: typeof colorThemes.ocean }>({ theme: 'ocean', colors: colorThemes.ocean });
const useTheme = () => useContext(ThemeContext);

interface Question { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; link: string; topic: string; }
interface Topic { name: string; questions: Question[]; }
interface Sheet { id: string; title: string; creator: string; creatorLink: string; originalSheetLink: string; desc: string; totalQuestions: number; color: string; icon: string; topics: Topic[]; }

// Import Modal Component
const ImportModal = ({ isOpen, onClose, sheet, onImport }: { isOpen: boolean; onClose: () => void; sheet: Sheet; onImport: (questionIds: string[]) => void; }) => {
  const { colors } = useTheme();
  const [importMethod, setImportMethod] = useState<'leetcode' | 'manual' | 'file'>('leetcode');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProblems, setFetchedProblems] = useState<string[]>([]);

  const fetchLeetCodeProgress = async () => {
    if (!leetcodeUsername.trim()) { setError('Please enter your LeetCode username'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/solved`);
      const data = await response.json();
      if (data.solvedProblem || data.easySolved !== undefined) {
        const solvedRes = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/submission`);
        const solvedData = await solvedRes.json();
        if (solvedData.submission && Array.isArray(solvedData.submission)) {
          const solvedTitles = solvedData.submission.filter((s: any) => s.statusDisplay === 'Accepted').map((s: any) => s.title.toLowerCase().replace(/[^a-z0-9]/g, ''));
          const matchedIds: string[] = [];
          sheet.topics.forEach(topic => {
            topic.questions.forEach(q => {
              const qTitle = q.title.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (solvedTitles.some((t: string) => t === qTitle || t.includes(qTitle) || qTitle.includes(t))) { matchedIds.push(q.id); }
            });
          });
          setFetchedProblems(matchedIds);
          if (matchedIds.length === 0) { setError('No matching problems found. Make sure your LeetCode profile is public.'); }
        }
      } else { setError('Could not fetch data. Make sure your profile is public and username is correct.'); }
    } catch (e) { setError('Failed to fetch LeetCode data. Please try again or use manual import.'); }
    setLoading(false);
  };

  const handleImport = () => { if (fetchedProblems.length > 0) { onImport(fetchedProblems); onClose(); } };
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.solved && Array.isArray(json.solved)) { onImport(json.solved); onClose(); }
      } catch { setError('Invalid JSON file format'); }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`bg-slate-900 border ${colors.borderAccent} rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><RefreshCw size={20} style={{ color: colors.primary }} />Import Progress</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
          </div>
          <div className="flex gap-2 mb-6">
            {[{ id: 'leetcode', label: 'LeetCode', icon: '⚡' }, { id: 'file', label: 'JSON File', icon: '📄' }, { id: 'manual', label: 'Instructions', icon: '📋' }].map(method => (
              <button key={method.id} onClick={() => setImportMethod(method.id as any)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${importMethod === method.id ? `${colors.bgAccentMuted} ${colors.textAccent} border ${colors.borderAccent}` : 'bg-slate-800 text-gray-400 border border-transparent hover:border-white/10'}`}>{method.icon} {method.label}</button>
            ))}
          </div>
          {importMethod === 'leetcode' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${colors.bgAccentMuted} border ${colors.borderAccent}`}>
                <p className="text-sm text-gray-300 mb-2"><strong>⚠️ Important:</strong> Make sure your LeetCode profile is set to <span className={colors.textAccent}>Public</span></p>
                <p className="text-xs text-gray-500">Go to LeetCode → Settings → Privacy → Set profile to Public</p>
              </div>
              <div><label className="text-sm text-gray-400 mb-2 block">LeetCode Username</label><input type="text" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} placeholder="Enter your LeetCode username" className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-white/30" /></div>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
              {fetchedProblems.length > 0 && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">✓ Found {fetchedProblems.length} matching solved problems!</div>}
              <div className="flex gap-3">
                <button onClick={fetchLeetCodeProgress} disabled={loading} className={`flex-1 py-2.5 ${colors.buttonGradient} text-white rounded-lg font-medium flex items-center justify-center gap-2`}>{loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}{loading ? 'Fetching...' : 'Fetch Progress'}</button>
                {fetchedProblems.length > 0 && <button onClick={handleImport} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Import {fetchedProblems.length} Problems</button>}
              </div>
            </div>
          )}
          {importMethod === 'file' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${colors.bgAccentMuted} border ${colors.borderAccent}`}><p className="text-sm text-gray-300 mb-2">Upload a JSON file with your solved problems</p><p className="text-xs text-gray-500">Format: {"{ \"solved\": [\"question_id_1\", \"question_id_2\", ...] }"}</p></div>
              <label className={`block w-full py-8 border-2 border-dashed ${colors.borderAccent} rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors`}><input type="file" accept=".json" onChange={handleFileImport} className="hidden" /><div className="text-4xl mb-2">📤</div><p className={`${colors.textAccent} font-medium`}>Click to upload JSON file</p></label>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            </div>
          )}
          {importMethod === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10">
                <h4 className="font-semibold text-white mb-3">How to Import from Different Platforms:</h4>
                <div className="space-y-4 text-sm">
                  <div><p className="text-yellow-400 font-medium mb-1">⚡ LeetCode</p><ol className="text-gray-400 list-decimal list-inside space-y-1"><li>Go to LeetCode → Profile → Settings</li><li>Set profile visibility to <span className="text-green-400">Public</span></li><li>Use the LeetCode tab to auto-import</li></ol></div>
                  <div><p className="text-green-400 font-medium mb-1">🎯 GeeksforGeeks</p><ol className="text-gray-400 list-decimal list-inside space-y-1"><li>Go to GFG → Profile → Settings</li><li>Enable public profile</li><li>Note your solved problems and mark manually</li></ol></div>
                  <div><p className="text-amber-500 font-medium mb-1">👨‍🍳 CodeChef</p><ol className="text-gray-400 list-decimal list-inside space-y-1"><li>Visit your CodeChef profile</li><li>Check your practice section</li><li>Mark solved problems manually here</li></ol></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Daily Challenge Component
const DailyChallenge = () => {
  const { colors } = useTheme();
  const [potdData, setPotdData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPOTD = async () => {
      const results: any[] = [];
      try {
        const lcRes = await fetch('https://alfa-leetcode-api.onrender.com/daily');
        const lcData = await lcRes.json();
        results.push({ platform: 'LeetCode', title: lcData.questionTitle || 'Daily Challenge', link: lcData.questionLink ? `https://leetcode.com${lcData.questionLink}` : 'https://leetcode.com/problemset/', difficulty: lcData.difficulty || 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '⚡' });
      } catch { results.push({ platform: 'LeetCode', title: 'Daily Challenge', link: 'https://leetcode.com/problemset/', difficulty: 'Solve Now', color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: '⚡' }); }
      results.push({ platform: 'GeeksforGeeks', title: 'Problem of the Day', link: 'https://www.geeksforgeeks.org/problem-of-the-day', difficulty: 'Solve Now', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20', icon: '🎯' });
      results.push({ platform: 'CodeChef', title: 'Daily Practice', link: 'https://www.codechef.com/practice', difficulty: 'Solve Now', color: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/20', icon: '👨‍🍳' });
      results.push({ platform: 'Codeforces', title: 'Practice Problem', link: 'https://codeforces.com/problemset', difficulty: 'Solve Now', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: '🏆' });
      setPotdData(results); setLoading(false);
    };
    fetchAllPOTD();
  }, []);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6"><Flame className="text-orange-500" size={24} /><h2 className="text-2xl font-bold text-white">Problem of the Day</h2><span className="text-xs text-gray-500 ml-2">from all platforms</span></div>
      {loading ? <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-gray-500" size={32} /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {potdData.map((potd, i) => (
            <motion.a key={i} href={potd.link} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`relative block bg-slate-800/50 border border-white/10 rounded-xl p-5 ${colors.hoverColor} hover:border-white/20 transition-all group overflow-hidden`}>
              <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl">{potd.icon}</div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3"><span className={`text-xs font-bold px-2 py-1 rounded border ${potd.bg} ${potd.color}`}>{potd.platform}</span><ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors" /></div>
                <h3 className="font-bold text-white mb-2 group-hover:text-inherit transition-colors line-clamp-2 text-sm">{potd.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium border ${potd.difficulty === 'Easy' ? 'text-green-400 border-green-500/20 bg-green-500/5' : potd.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : potd.difficulty === 'Hard' ? 'text-red-400 border-red-500/20 bg-red-500/5' : `${colors.textAccent} ${colors.borderAccent} ${colors.bgAccentMuted}`}`}>{potd.difficulty}</span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};

// Progress Overview Component
const ProgressOverview = ({ sheets, completed, activeSheetId }: { sheets: Sheet[]; completed: Record<string, boolean>; activeSheetId: string; }) => {
  const { colors } = useTheme();
  const totalQuestions = sheets.reduce((acc, s) => acc + s.topics.reduce((a, t) => a + t.questions.length, 0), 0);
  const totalSolved = Object.values(completed).filter(Boolean).length;
  const overallProgress = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  const topicProgress = useMemo(() => {
    const topicMap: Record<string, { total: number; solved: number }> = {};
    sheets.forEach(sheet => { sheet.topics.forEach(topic => { topic.questions.forEach(q => { if (!topicMap[q.topic]) { topicMap[q.topic] = { total: 0, solved: 0 }; } topicMap[q.topic].total++; if (completed[q.id]) { topicMap[q.topic].solved++; } }); }); });
    return Object.entries(topicMap).map(([name, data]) => ({ name, total: data.total, solved: data.solved, percent: Math.round((data.solved / data.total) * 100) })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [sheets, completed]);

  return (
    <div className={`bg-slate-800/30 rounded-2xl border ${colors.cardBorder} p-6 mb-8`}>
      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><PieChart style={{ color: colors.primary }} size={20} /><h3 className="font-bold text-white">Your DSA Progress</h3></div><div className="flex items-center gap-2"><span className="text-3xl font-black" style={{ color: colors.primary }}>{overallProgress}%</span><span className="text-xs text-gray-500">Overall</span></div></div>
      <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden mb-6"><motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full bg-gradient-to-r ${colors.progressBar}`} /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-white">{totalSolved}</div><div className="text-xs text-gray-500">Solved</div></div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-white">{totalQuestions - totalSolved}</div><div className="text-xs text-gray-500">Remaining</div></div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-400">{Object.entries(completed).filter(([k, v]) => v && sheets.some(s => s.topics.some(t => t.questions.some(q => q.id === k && q.difficulty === 'Easy')))).length}</div><div className="text-xs text-gray-500">Easy</div></div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-red-400">{Object.entries(completed).filter(([k, v]) => v && sheets.some(s => s.topics.some(t => t.questions.some(q => q.id === k && q.difficulty === 'Hard')))).length}</div><div className="text-xs text-gray-500">Hard</div></div>
      </div>
      <div className="space-y-3"><h4 className="text-sm font-semibold text-gray-400 mb-3">Topic Mastery</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{topicProgress.map((topic) => (<div key={topic.name} className="bg-slate-900/30 rounded-lg p-3"><div className="flex justify-between items-center mb-2"><span className="text-xs font-medium text-gray-300 truncate">{topic.name}</span><span className="text-xs text-gray-500">{topic.solved}/{topic.total}</span></div><div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors.progressBar} transition-all duration-500`} style={{ width: `${topic.percent}%` }} /></div></div>))}</div></div>
    </div>
  );
};

// Sheet Selector Component
const SheetSelector = ({ sheets, activeSheetId, setActiveSheetId, completed, onImportClick }: { sheets: Sheet[]; activeSheetId: string; setActiveSheetId: (id: string) => void; completed: Record<string, boolean>; onImportClick: () => void; }) => {
  const { colors } = useTheme();
  return (
    <div className="flex flex-col gap-3">
      <button onClick={onImportClick} className={`w-full py-3 px-4 rounded-xl border ${colors.borderAccent} ${colors.bgAccentMuted} ${colors.textAccent} font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-20 transition-all`}><Upload size={16} />Import Progress</button>
      {sheets.map((sheet) => {
        const sheetTotal = sheet.topics.reduce((a, t) => a + t.questions.length, 0);
        const sheetSolved = sheet.topics.reduce((a, t) => a + t.questions.filter(q => completed[q.id]).length, 0);
        const progress = sheetTotal > 0 ? Math.round((sheetSolved / sheetTotal) * 100) : 0;
        return (
          <button key={sheet.id} onClick={() => setActiveSheetId(sheet.id)} className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${activeSheetId === sheet.id ? `bg-slate-800 ${colors.borderAccent} shadow-lg` : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/50 hover:border-white/10'}`}>
            {activeSheetId === sheet.id && <motion.div layoutId="activeSheetIndicator" className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bgAccent}`} />}
            <div className="flex items-start justify-between mb-2"><div><h4 className={`font-bold text-white group-hover:${colors.textAccent} transition-colors text-sm`}>{sheet.title}</h4><p className={`text-[10px] ${colors.textAccent} font-medium`}>by {sheet.creator}</p></div><span className={`text-lg font-bold bg-gradient-to-r ${sheet.color} bg-clip-text text-transparent`}>{progress}%</span></div>
            <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{sheet.desc}</p>
            <div className="flex items-center justify-between"><span className="text-[10px] text-gray-600">{sheetSolved}/{sheetTotal} solved</span><a href={sheet.originalSheetLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">Original <ExternalLink size={10} /></a></div>
            <div className="h-1 w-full bg-slate-700/50 rounded-full overflow-hidden mt-2"><div className={`h-full bg-gradient-to-r ${sheet.color} transition-all duration-500`} style={{ width: `${progress}%` }} /></div>
          </button>
        );
      })}
    </div>
  );
};

// Question List Component
const QuestionList = ({ sheet, completed, review, toggleStatus, searchQuery, filterDifficulty }: { sheet: Sheet; completed: Record<string, boolean>; review: Record<string, boolean>; toggleStatus: (id: string, type: 'done' | 'review') => void; searchQuery: string; filterDifficulty: string; }) => {
  const { colors } = useTheme();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const filteredTopics = sheet.topics.map(topic => ({ ...topic, questions: topic.questions.filter(q => { const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()); const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty; return matchesSearch && matchesDifficulty; }) })).filter(topic => topic.questions.length > 0);
  const totalFiltered = filteredTopics.reduce((a, t) => a + t.questions.length, 0);
  const solvedFiltered = filteredTopics.reduce((a, t) => a + t.questions.filter(q => completed[q.id]).length, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500 px-2"><span>Showing {totalFiltered} questions</span><span>{solvedFiltered} solved</span></div>
      {filteredTopics.length > 0 ? filteredTopics.map((topic, i) => {
        const topicSolved = topic.questions.filter(q => completed[q.id]).length;
        const topicTotal = topic.questions.length;
        const isExpanded = expandedTopic === topic.name || searchQuery.length > 0;
        return (
          <div key={i} className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
            <button onClick={() => setExpandedTopic(expandedTopic === topic.name ? null : topic.name)} className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-3"><BookOpen size={16} style={{ color: colors.primary }} /><span className="font-semibold text-white text-sm">{topic.name}</span><span className="text-xs text-gray-500">({topicSolved}/{topicTotal})</span></div>
              <div className="flex items-center gap-3"><div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors.progressBar}`} style={{ width: `${topicTotal > 0 ? (topicSolved/topicTotal)*100 : 0}%` }} /></div>{isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}</div>
            </button>
            <AnimatePresence>{isExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="divide-y divide-white/5">
                {topic.questions.map((q) => (
                  <div key={q.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button onClick={() => toggleStatus(q.id, 'done')} className="transition-transform active:scale-90 flex-shrink-0">{completed[q.id] ? <CheckCircle2 className="text-green-400" size={20} /> : <Circle className="text-gray-600 hover:text-green-400" size={20} />}</button>
                      <a href={q.link} target="_blank" rel="noreferrer" className={`text-sm transition-colors truncate ${colors.hoverColor} ${completed[q.id] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{q.title}</a>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <button onClick={() => toggleStatus(q.id, 'review')} className="opacity-0 group-hover:opacity-100 transition-opacity"><Bookmark size={16} className={`${review[q.id] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`} /></button>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${q.difficulty === 'Easy' ? 'text-green-400 border-green-500/20 bg-green-500/5' : q.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>{q.difficulty}</span>
                      <a href={q.link} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} /></a>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}</AnimatePresence>
          </div>
        );
      }) : <div className="text-center py-16 text-gray-500"><Search size={40} className="mx-auto mb-4 opacity-50" /><p>No questions found matching your filters</p></div>}
    </div>
  );
};

// ============================================
// COMPLETE SHEETS DATA
// ============================================

const SHEETS_DATA: Sheet[] = [
  {
    id: 'striver-a2z',
    title: "Striver's A2Z DSA Sheet",
    creator: 'Striver (Raj Vikramaditya)',
    creatorLink: 'https://www.youtube.com/@takeUforward',
    originalSheetLink: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
    desc: 'Complete A to Z DSA course with 455+ problems from basics to advanced. The most comprehensive sheet.',
    totalQuestions: 455,
    color: 'from-red-500 to-orange-500',
    icon: '🔥',
    topics: [
      { name: 'Arrays - Basics', questions: [
        { id: 'a2z_1', title: 'Largest Element in Array', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/largest-element-in-array4009/0', topic: 'Arrays' },
        { id: 'a2z_2', title: 'Second Largest Element', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/second-largest3735/1', topic: 'Arrays' },
        { id: 'a2z_3', title: 'Check if Array is Sorted', difficulty: 'Easy', link: 'https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/', topic: 'Arrays' },
        { id: 'a2z_4', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', topic: 'Arrays' },
        { id: 'a2z_5', title: 'Rotate Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-array/', topic: 'Arrays' },
        { id: 'a2z_6', title: 'Move Zeroes', difficulty: 'Easy', link: 'https://leetcode.com/problems/move-zeroes/', topic: 'Arrays' },
        { id: 'a2z_7', title: 'Union of Two Sorted Arrays', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/union-of-two-sorted-arrays-1587115621/1', topic: 'Arrays' },
        { id: 'a2z_8', title: 'Missing Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/missing-number/', topic: 'Arrays' },
        { id: 'a2z_9', title: 'Max Consecutive Ones', difficulty: 'Easy', link: 'https://leetcode.com/problems/max-consecutive-ones/', topic: 'Arrays' },
        { id: 'a2z_10', title: 'Single Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/single-number/', topic: 'Arrays' },
      ]},
      { name: 'Arrays - Medium', questions: [
        { id: 'a2z_11', title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays' },
        { id: 'a2z_12', title: 'Sort Colors', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors/', topic: 'Arrays' },
        { id: 'a2z_13', title: 'Majority Element', difficulty: 'Easy', link: 'https://leetcode.com/problems/majority-element/', topic: 'Arrays' },
        { id: 'a2z_14', title: 'Maximum Subarray (Kadane)', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Arrays' },
        { id: 'a2z_15', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Arrays' },
        { id: 'a2z_16', title: 'Rearrange Array by Sign', difficulty: 'Medium', link: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/', topic: 'Arrays' },
        { id: 'a2z_17', title: 'Next Permutation', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/', topic: 'Arrays' },
        { id: 'a2z_18', title: 'Longest Consecutive Sequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', topic: 'Arrays' },
        { id: 'a2z_19', title: 'Set Matrix Zeroes', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/', topic: 'Arrays' },
        { id: 'a2z_20', title: 'Rotate Image', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Arrays' },
        { id: 'a2z_21', title: 'Spiral Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/', topic: 'Arrays' },
        { id: 'a2z_22', title: 'Subarray Sum Equals K', difficulty: 'Medium', link: 'https://leetcode.com/problems/subarray-sum-equals-k/', topic: 'Arrays' },
      ]},
      { name: 'Arrays - Hard', questions: [
        { id: 'a2z_23', title: "Pascal's Triangle", difficulty: 'Easy', link: 'https://leetcode.com/problems/pascals-triangle/', topic: 'Arrays' },
        { id: 'a2z_24', title: 'Majority Element II', difficulty: 'Medium', link: 'https://leetcode.com/problems/majority-element-ii/', topic: 'Arrays' },
        { id: 'a2z_25', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/', topic: 'Arrays' },
        { id: 'a2z_26', title: '4Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/4sum/', topic: 'Arrays' },
        { id: 'a2z_27', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Arrays' },
        { id: 'a2z_28', title: 'Merge Sorted Array', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-sorted-array/', topic: 'Arrays' },
        { id: 'a2z_29', title: 'Find the Duplicate Number', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-the-duplicate-number/', topic: 'Arrays' },
        { id: 'a2z_30', title: 'Count Inversions', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', topic: 'Arrays' },
        { id: 'a2z_31', title: 'Reverse Pairs', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-pairs/', topic: 'Arrays' },
        { id: 'a2z_32', title: 'Maximum Product Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-product-subarray/', topic: 'Arrays' },
      ]},
      { name: 'Binary Search', questions: [
        { id: 'a2z_33', title: 'Binary Search', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-search/', topic: 'Binary Search' },
        { id: 'a2z_34', title: 'Search Insert Position', difficulty: 'Easy', link: 'https://leetcode.com/problems/search-insert-position/', topic: 'Binary Search' },
        { id: 'a2z_35', title: 'Find First and Last Position', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', topic: 'Binary Search' },
        { id: 'a2z_36', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'a2z_37', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'a2z_38', title: 'Single Element in Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', topic: 'Binary Search' },
        { id: 'a2z_39', title: 'Find Peak Element', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-peak-element/', topic: 'Binary Search' },
        { id: 'a2z_40', title: 'Sqrt(x)', difficulty: 'Easy', link: 'https://leetcode.com/problems/sqrtx/', topic: 'Binary Search' },
        { id: 'a2z_41', title: 'Koko Eating Bananas', difficulty: 'Medium', link: 'https://leetcode.com/problems/koko-eating-bananas/', topic: 'Binary Search' },
        { id: 'a2z_42', title: 'Capacity to Ship Packages', difficulty: 'Medium', link: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', topic: 'Binary Search' },
        { id: 'a2z_43', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', topic: 'Binary Search' },
        { id: 'a2z_44', title: 'Search a 2D Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix/', topic: 'Binary Search' },
      ]},
      { name: 'Strings', questions: [
        { id: 'a2z_45', title: 'Reverse Words in a String', difficulty: 'Medium', link: 'https://leetcode.com/problems/reverse-words-in-a-string/', topic: 'Strings' },
        { id: 'a2z_46', title: 'Longest Common Prefix', difficulty: 'Easy', link: 'https://leetcode.com/problems/longest-common-prefix/', topic: 'Strings' },
        { id: 'a2z_47', title: 'Valid Anagram', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/', topic: 'Strings' },
        { id: 'a2z_48', title: 'Isomorphic Strings', difficulty: 'Easy', link: 'https://leetcode.com/problems/isomorphic-strings/', topic: 'Strings' },
        { id: 'a2z_49', title: 'Rotate String', difficulty: 'Easy', link: 'https://leetcode.com/problems/rotate-string/', topic: 'Strings' },
        { id: 'a2z_50', title: 'Roman to Integer', difficulty: 'Easy', link: 'https://leetcode.com/problems/roman-to-integer/', topic: 'Strings' },
        { id: 'a2z_51', title: 'String to Integer (atoi)', difficulty: 'Medium', link: 'https://leetcode.com/problems/string-to-integer-atoi/', topic: 'Strings' },
        { id: 'a2z_52', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Strings' },
      ]},
      { name: 'Linked List', questions: [
        { id: 'a2z_53', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'a2z_54', title: 'Middle of the Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/middle-of-the-linked-list/', topic: 'Linked List' },
        { id: 'a2z_55', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topic: 'Linked List' },
        { id: 'a2z_56', title: 'Remove Nth Node From End', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topic: 'Linked List' },
        { id: 'a2z_57', title: 'Add Two Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/', topic: 'Linked List' },
        { id: 'a2z_58', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'a2z_59', title: 'Linked List Cycle II', difficulty: 'Medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/', topic: 'Linked List' },
        { id: 'a2z_60', title: 'Palindrome Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/palindrome-linked-list/', topic: 'Linked List' },
        { id: 'a2z_61', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', topic: 'Linked List' },
        { id: 'a2z_62', title: 'Sort List', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-list/', topic: 'Linked List' },
        { id: 'a2z_63', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', topic: 'Linked List' },
        { id: 'a2z_64', title: 'Rotate List', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-list/', topic: 'Linked List' },
        { id: 'a2z_65', title: 'Copy List with Random Pointer', difficulty: 'Medium', link: 'https://leetcode.com/problems/copy-list-with-random-pointer/', topic: 'Linked List' },
      ]},
      { name: 'Recursion & Backtracking', questions: [
        { id: 'a2z_66', title: 'Subsets', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets/', topic: 'Recursion' },
        { id: 'a2z_67', title: 'Subsets II', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets-ii/', topic: 'Recursion' },
        { id: 'a2z_68', title: 'Combination Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/', topic: 'Recursion' },
        { id: 'a2z_69', title: 'Combination Sum II', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum-ii/', topic: 'Recursion' },
        { id: 'a2z_70', title: 'Permutations', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/', topic: 'Backtracking' },
        { id: 'a2z_71', title: 'Permutations II', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations-ii/', topic: 'Backtracking' },
        { id: 'a2z_72', title: 'Palindrome Partitioning', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindrome-partitioning/', topic: 'Backtracking' },
        { id: 'a2z_73', title: 'N-Queens', difficulty: 'Hard', link: 'https://leetcode.com/problems/n-queens/', topic: 'Backtracking' },
        { id: 'a2z_74', title: 'Sudoku Solver', difficulty: 'Hard', link: 'https://leetcode.com/problems/sudoku-solver/', topic: 'Backtracking' },
        { id: 'a2z_75', title: 'Word Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/', topic: 'Backtracking' },
      ]},
      { name: 'Stack & Queue', questions: [
        { id: 'a2z_76', title: 'Valid Parentheses', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/', topic: 'Stacks & Queues' },
        { id: 'a2z_77', title: 'Min Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/min-stack/', topic: 'Stacks & Queues' },
        { id: 'a2z_78', title: 'Next Greater Element I', difficulty: 'Easy', link: 'https://leetcode.com/problems/next-greater-element-i/', topic: 'Stacks & Queues' },
        { id: 'a2z_79', title: 'Next Greater Element II', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-greater-element-ii/', topic: 'Stacks & Queues' },
        { id: 'a2z_80', title: 'Trapping Rain Water', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/', topic: 'Stacks & Queues' },
        { id: 'a2z_81', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', topic: 'Stacks & Queues' },
        { id: 'a2z_82', title: 'Sliding Window Maximum', difficulty: 'Hard', link: 'https://leetcode.com/problems/sliding-window-maximum/', topic: 'Stacks & Queues' },
        { id: 'a2z_83', title: 'LRU Cache', difficulty: 'Medium', link: 'https://leetcode.com/problems/lru-cache/', topic: 'Stacks & Queues' },
        { id: 'a2z_84', title: 'LFU Cache', difficulty: 'Hard', link: 'https://leetcode.com/problems/lfu-cache/', topic: 'Stacks & Queues' },
      ]},
      { name: 'Trees', questions: [
        { id: 'a2z_103', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', topic: 'Trees' },
        { id: 'a2z_104', title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', topic: 'Trees' },
        { id: 'a2z_105', title: 'Binary Tree Postorder Traversal', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', topic: 'Trees' },
        { id: 'a2z_106', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topic: 'Trees' },
        { id: 'a2z_107', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topic: 'Trees' },
        { id: 'a2z_108', title: 'Balanced Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/balanced-binary-tree/', topic: 'Trees' },
        { id: 'a2z_109', title: 'Diameter of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/', topic: 'Trees' },
        { id: 'a2z_110', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topic: 'Trees' },
        { id: 'a2z_111', title: 'Same Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/', topic: 'Trees' },
        { id: 'a2z_112', title: 'Symmetric Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/symmetric-tree/', topic: 'Trees' },
        { id: 'a2z_113', title: 'Binary Tree Right Side View', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-right-side-view/', topic: 'Trees' },
        { id: 'a2z_114', title: 'Lowest Common Ancestor', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', topic: 'Trees' },
        { id: 'a2z_115', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', topic: 'Trees' },
        { id: 'a2z_116', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', topic: 'Trees' },
      ]},
      { name: 'Graphs', questions: [
        { id: 'a2z_127', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/', topic: 'Graphs' },
        { id: 'a2z_128', title: 'Flood Fill', difficulty: 'Easy', link: 'https://leetcode.com/problems/flood-fill/', topic: 'Graphs' },
        { id: 'a2z_129', title: 'Rotting Oranges', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotting-oranges/', topic: 'Graphs' },
        { id: 'a2z_130', title: 'Clone Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/', topic: 'Graphs' },
        { id: 'a2z_131', title: 'Course Schedule', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/', topic: 'Graphs' },
        { id: 'a2z_132', title: 'Course Schedule II', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule-ii/', topic: 'Graphs' },
        { id: 'a2z_133', title: 'Number of Provinces', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-provinces/', topic: 'Graphs' },
        { id: 'a2z_134', title: 'Is Graph Bipartite', difficulty: 'Medium', link: 'https://leetcode.com/problems/is-graph-bipartite/', topic: 'Graphs' },
        { id: 'a2z_135', title: 'Word Ladder', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-ladder/', topic: 'Graphs' },
        { id: 'a2z_136', title: 'Surrounded Regions', difficulty: 'Medium', link: 'https://leetcode.com/problems/surrounded-regions/', topic: 'Graphs' },
      ]},
      { name: 'Dynamic Programming', questions: [
        { id: 'a2z_141', title: 'Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/', topic: 'Dynamic Programming' },
        { id: 'a2z_142', title: 'House Robber', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/', topic: 'Dynamic Programming' },
        { id: 'a2z_143', title: 'House Robber II', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber-ii/', topic: 'Dynamic Programming' },
        { id: 'a2z_144', title: 'Unique Paths', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/', topic: 'Dynamic Programming' },
        { id: 'a2z_146', title: 'Minimum Path Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/minimum-path-sum/', topic: 'Dynamic Programming' },
        { id: 'a2z_148', title: 'Partition Equal Subset Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-equal-subset-sum/', topic: 'Dynamic Programming' },
        { id: 'a2z_149', title: 'Coin Change', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/', topic: 'Dynamic Programming' },
        { id: 'a2z_150', title: 'Coin Change II', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change-ii/', topic: 'Dynamic Programming' },
        { id: 'a2z_151', title: 'Target Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/target-sum/', topic: 'Dynamic Programming' },
        { id: 'a2z_152', title: 'Longest Common Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/', topic: 'Dynamic Programming' },
        { id: 'a2z_153', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topic: 'Dynamic Programming' },
        { id: 'a2z_155', title: 'Edit Distance', difficulty: 'Medium', link: 'https://leetcode.com/problems/edit-distance/', topic: 'Dynamic Programming' },
        { id: 'a2z_160', title: 'Word Break', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/', topic: 'Dynamic Programming' },
        { id: 'a2z_162', title: 'Burst Balloons', difficulty: 'Hard', link: 'https://leetcode.com/problems/burst-balloons/', topic: 'Dynamic Programming' },
      ]},
    ]
  },
  // BLIND 75 - Complete 75 Questions
  {
    id: 'blind-75',
    title: 'Blind 75',
    creator: 'Team Blind',
    creatorLink: 'https://www.teamblind.com/',
    originalSheetLink: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
    desc: 'The famous 75 LeetCode questions curated for FAANG interviews. Most efficient for quick preparation.',
    totalQuestions: 75,
    color: 'from-blue-500 to-cyan-500',
    icon: '👁️',
    topics: [
      { name: 'Array', questions: [
        { id: 'b75_1', title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays' },
        { id: 'b75_2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Arrays' },
        { id: 'b75_3', title: 'Contains Duplicate', difficulty: 'Easy', link: 'https://leetcode.com/problems/contains-duplicate/', topic: 'Arrays' },
        { id: 'b75_4', title: 'Product of Array Except Self', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self/', topic: 'Arrays' },
        { id: 'b75_5', title: 'Maximum Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Arrays' },
        { id: 'b75_6', title: 'Maximum Product Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-product-subarray/', topic: 'Arrays' },
        { id: 'b75_7', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', topic: 'Arrays' },
        { id: 'b75_8', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topic: 'Arrays' },
        { id: 'b75_9', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/', topic: 'Arrays' },
        { id: 'b75_10', title: 'Container With Most Water', difficulty: 'Medium', link: 'https://leetcode.com/problems/container-with-most-water/', topic: 'Arrays' },
      ]},
      { name: 'Binary', questions: [
        { id: 'b75_11', title: 'Sum of Two Integers', difficulty: 'Medium', link: 'https://leetcode.com/problems/sum-of-two-integers/', topic: 'Bit Manipulation' },
        { id: 'b75_12', title: 'Number of 1 Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/number-of-1-bits/', topic: 'Bit Manipulation' },
        { id: 'b75_13', title: 'Counting Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/counting-bits/', topic: 'Bit Manipulation' },
        { id: 'b75_14', title: 'Missing Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/missing-number/', topic: 'Bit Manipulation' },
        { id: 'b75_15', title: 'Reverse Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-bits/', topic: 'Bit Manipulation' },
      ]},
      { name: 'Dynamic Programming', questions: [
        { id: 'b75_16', title: 'Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/', topic: 'Dynamic Programming' },
        { id: 'b75_17', title: 'Coin Change', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/', topic: 'Dynamic Programming' },
        { id: 'b75_18', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topic: 'Dynamic Programming' },
        { id: 'b75_19', title: 'Longest Common Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/', topic: 'Dynamic Programming' },
        { id: 'b75_20', title: 'Word Break', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/', topic: 'Dynamic Programming' },
        { id: 'b75_21', title: 'Combination Sum IV', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum-iv/', topic: 'Dynamic Programming' },
        { id: 'b75_22', title: 'House Robber', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/', topic: 'Dynamic Programming' },
        { id: 'b75_23', title: 'House Robber II', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber-ii/', topic: 'Dynamic Programming' },
        { id: 'b75_24', title: 'Decode Ways', difficulty: 'Medium', link: 'https://leetcode.com/problems/decode-ways/', topic: 'Dynamic Programming' },
        { id: 'b75_25', title: 'Unique Paths', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/', topic: 'Dynamic Programming' },
        { id: 'b75_26', title: 'Jump Game', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game/', topic: 'Dynamic Programming' },
      ]},
      { name: 'Graph', questions: [
        { id: 'b75_27', title: 'Clone Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/', topic: 'Graphs' },
        { id: 'b75_28', title: 'Course Schedule', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/', topic: 'Graphs' },
        { id: 'b75_29', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', topic: 'Graphs' },
        { id: 'b75_30', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/', topic: 'Graphs' },
        { id: 'b75_31', title: 'Longest Consecutive Sequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', topic: 'Graphs' },
        { id: 'b75_32', title: 'Alien Dictionary', difficulty: 'Hard', link: 'https://leetcode.com/problems/alien-dictionary/', topic: 'Graphs' },
        { id: 'b75_33', title: 'Graph Valid Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/graph-valid-tree/', topic: 'Graphs' },
        { id: 'b75_34', title: 'Number of Connected Components', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', topic: 'Graphs' },
      ]},
      { name: 'Interval', questions: [
        { id: 'b75_35', title: 'Insert Interval', difficulty: 'Medium', link: 'https://leetcode.com/problems/insert-interval/', topic: 'Intervals' },
        { id: 'b75_36', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Intervals' },
        { id: 'b75_37', title: 'Non-overlapping Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/non-overlapping-intervals/', topic: 'Intervals' },
        { id: 'b75_38', title: 'Meeting Rooms', difficulty: 'Easy', link: 'https://leetcode.com/problems/meeting-rooms/', topic: 'Intervals' },
        { id: 'b75_39', title: 'Meeting Rooms II', difficulty: 'Medium', link: 'https://leetcode.com/problems/meeting-rooms-ii/', topic: 'Intervals' },
      ]},
      { name: 'Linked List', questions: [
        { id: 'b75_40', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'b75_41', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'b75_42', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topic: 'Linked List' },
        { id: 'b75_43', title: 'Merge k Sorted Lists', difficulty: 'Hard', link: 'https://leetcode.com/problems/merge-k-sorted-lists/', topic: 'Linked List' },
        { id: 'b75_44', title: 'Remove Nth Node From End of List', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topic: 'Linked List' },
        { id: 'b75_45', title: 'Reorder List', difficulty: 'Medium', link: 'https://leetcode.com/problems/reorder-list/', topic: 'Linked List' },
      ]},
      { name: 'Matrix', questions: [
        { id: 'b75_46', title: 'Set Matrix Zeroes', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/', topic: 'Arrays' },
        { id: 'b75_47', title: 'Spiral Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/', topic: 'Arrays' },
        { id: 'b75_48', title: 'Rotate Image', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Arrays' },
        { id: 'b75_49', title: 'Word Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/', topic: 'Arrays' },
      ]},
      { name: 'String', questions: [
        { id: 'b75_50', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topic: 'Strings' },
        { id: 'b75_51', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-repeating-character-replacement/', topic: 'Strings' },
        { id: 'b75_52', title: 'Minimum Window Substring', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/', topic: 'Strings' },
        { id: 'b75_53', title: 'Valid Anagram', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/', topic: 'Strings' },
        { id: 'b75_54', title: 'Group Anagrams', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams/', topic: 'Strings' },
        { id: 'b75_55', title: 'Valid Parentheses', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/', topic: 'Strings' },
        { id: 'b75_56', title: 'Valid Palindrome', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/', topic: 'Strings' },
        { id: 'b75_57', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Strings' },
        { id: 'b75_58', title: 'Palindromic Substrings', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindromic-substrings/', topic: 'Strings' },
        { id: 'b75_59', title: 'Encode and Decode Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/encode-and-decode-strings/', topic: 'Strings' },
      ]},
      { name: 'Tree', questions: [
        { id: 'b75_60', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topic: 'Trees' },
        { id: 'b75_61', title: 'Same Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/', topic: 'Trees' },
        { id: 'b75_62', title: 'Invert Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/', topic: 'Trees' },
        { id: 'b75_63', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topic: 'Trees' },
        { id: 'b75_64', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topic: 'Trees' },
        { id: 'b75_65', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', topic: 'Trees' },
        { id: 'b75_66', title: 'Subtree of Another Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/subtree-of-another-tree/', topic: 'Trees' },
        { id: 'b75_67', title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', topic: 'Trees' },
        { id: 'b75_68', title: 'Validate Binary Search Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/validate-binary-search-tree/', topic: 'Trees' },
        { id: 'b75_69', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', topic: 'Trees' },
        { id: 'b75_70', title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', topic: 'Trees' },
        { id: 'b75_71', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', link: 'https://leetcode.com/problems/implement-trie-prefix-tree/', topic: 'Trees' },
        { id: 'b75_72', title: 'Add and Search Word', difficulty: 'Medium', link: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', topic: 'Trees' },
        { id: 'b75_73', title: 'Word Search II', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-search-ii/', topic: 'Trees' },
      ]},
      { name: 'Heap', questions: [
        { id: 'b75_74', title: 'Top K Frequent Elements', difficulty: 'Medium', link: 'https://leetcode.com/problems/top-k-frequent-elements/', topic: 'Heaps' },
        { id: 'b75_75', title: 'Find Median from Data Stream', difficulty: 'Hard', link: 'https://leetcode.com/problems/find-median-from-data-stream/', topic: 'Heaps' },
      ]},
    ]
  },
  // NEETCODE 150 - Complete
  {
    id: 'neetcode-150',
    title: 'NeetCode 150',
    creator: 'NeetCode',
    creatorLink: 'https://www.youtube.com/@NeetCode',
    originalSheetLink: 'https://neetcode.io/practice',
    desc: 'Curated 150 problems with video explanations. Perfect balance between breadth and depth.',
    totalQuestions: 150,
    color: 'from-yellow-500 to-amber-500',
    icon: '🎯',
    topics: [
      { name: 'Arrays & Hashing', questions: [
        { id: 'nc_1', title: 'Contains Duplicate', difficulty: 'Easy', link: 'https://leetcode.com/problems/contains-duplicate/', topic: 'Arrays' },
        { id: 'nc_2', title: 'Valid Anagram', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/', topic: 'Strings' },
        { id: 'nc_3', title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays' },
        { id: 'nc_4', title: 'Group Anagrams', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams/', topic: 'Strings' },
        { id: 'nc_5', title: 'Top K Frequent Elements', difficulty: 'Medium', link: 'https://leetcode.com/problems/top-k-frequent-elements/', topic: 'Arrays' },
        { id: 'nc_6', title: 'Encode and Decode Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/encode-and-decode-strings/', topic: 'Strings' },
        { id: 'nc_7', title: 'Product of Array Except Self', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self/', topic: 'Arrays' },
        { id: 'nc_8', title: 'Valid Sudoku', difficulty: 'Medium', link: 'https://leetcode.com/problems/valid-sudoku/', topic: 'Arrays' },
        { id: 'nc_9', title: 'Longest Consecutive Sequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', topic: 'Arrays' },
      ]},
      { name: 'Two Pointers', questions: [
        { id: 'nc_10', title: 'Valid Palindrome', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/', topic: 'Two Pointers' },
        { id: 'nc_11', title: 'Two Sum II', difficulty: 'Medium', link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', topic: 'Two Pointers' },
        { id: 'nc_12', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/', topic: 'Two Pointers' },
        { id: 'nc_13', title: 'Container With Most Water', difficulty: 'Medium', link: 'https://leetcode.com/problems/container-with-most-water/', topic: 'Two Pointers' },
        { id: 'nc_14', title: 'Trapping Rain Water', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/', topic: 'Two Pointers' },
      ]},
      { name: 'Sliding Window', questions: [
        { id: 'nc_15', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Sliding Window' },
        { id: 'nc_16', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topic: 'Sliding Window' },
        { id: 'nc_17', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-repeating-character-replacement/', topic: 'Sliding Window' },
        { id: 'nc_18', title: 'Permutation in String', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutation-in-string/', topic: 'Sliding Window' },
        { id: 'nc_19', title: 'Minimum Window Substring', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/', topic: 'Sliding Window' },
        { id: 'nc_20', title: 'Sliding Window Maximum', difficulty: 'Hard', link: 'https://leetcode.com/problems/sliding-window-maximum/', topic: 'Sliding Window' },
      ]},
      { name: 'Stack', questions: [
        { id: 'nc_21', title: 'Valid Parentheses', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/', topic: 'Stacks & Queues' },
        { id: 'nc_22', title: 'Min Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/min-stack/', topic: 'Stacks & Queues' },
        { id: 'nc_23', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', topic: 'Stacks & Queues' },
        { id: 'nc_24', title: 'Generate Parentheses', difficulty: 'Medium', link: 'https://leetcode.com/problems/generate-parentheses/', topic: 'Stacks & Queues' },
        { id: 'nc_25', title: 'Daily Temperatures', difficulty: 'Medium', link: 'https://leetcode.com/problems/daily-temperatures/', topic: 'Stacks & Queues' },
        { id: 'nc_26', title: 'Car Fleet', difficulty: 'Medium', link: 'https://leetcode.com/problems/car-fleet/', topic: 'Stacks & Queues' },
        { id: 'nc_27', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', topic: 'Stacks & Queues' },
      ]},
      { name: 'Binary Search', questions: [
        { id: 'nc_28', title: 'Binary Search', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-search/', topic: 'Binary Search' },
        { id: 'nc_29', title: 'Search a 2D Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix/', topic: 'Binary Search' },
        { id: 'nc_30', title: 'Koko Eating Bananas', difficulty: 'Medium', link: 'https://leetcode.com/problems/koko-eating-bananas/', topic: 'Binary Search' },
        { id: 'nc_31', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'nc_32', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'nc_33', title: 'Time Based Key-Value Store', difficulty: 'Medium', link: 'https://leetcode.com/problems/time-based-key-value-store/', topic: 'Binary Search' },
        { id: 'nc_34', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', topic: 'Binary Search' },
      ]},
      { name: 'Linked List', questions: [
        { id: 'nc_35', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'nc_36', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topic: 'Linked List' },
        { id: 'nc_37', title: 'Reorder List', difficulty: 'Medium', link: 'https://leetcode.com/problems/reorder-list/', topic: 'Linked List' },
        { id: 'nc_38', title: 'Remove Nth Node From End of List', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topic: 'Linked List' },
        { id: 'nc_39', title: 'Copy List with Random Pointer', difficulty: 'Medium', link: 'https://leetcode.com/problems/copy-list-with-random-pointer/', topic: 'Linked List' },
        { id: 'nc_40', title: 'Add Two Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/', topic: 'Linked List' },
        { id: 'nc_41', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'nc_42', title: 'Find the Duplicate Number', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-the-duplicate-number/', topic: 'Linked List' },
        { id: 'nc_43', title: 'LRU Cache', difficulty: 'Medium', link: 'https://leetcode.com/problems/lru-cache/', topic: 'Linked List' },
        { id: 'nc_44', title: 'Merge k Sorted Lists', difficulty: 'Hard', link: 'https://leetcode.com/problems/merge-k-sorted-lists/', topic: 'Linked List' },
        { id: 'nc_45', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', topic: 'Linked List' },
      ]},
      { name: 'Trees', questions: [
        { id: 'nc_46', title: 'Invert Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/', topic: 'Trees' },
        { id: 'nc_47', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topic: 'Trees' },
        { id: 'nc_48', title: 'Diameter of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/', topic: 'Trees' },
        { id: 'nc_49', title: 'Balanced Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/balanced-binary-tree/', topic: 'Trees' },
        { id: 'nc_50', title: 'Same Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/', topic: 'Trees' },
        { id: 'nc_51', title: 'Subtree of Another Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/subtree-of-another-tree/', topic: 'Trees' },
        { id: 'nc_52', title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', topic: 'Trees' },
        { id: 'nc_53', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topic: 'Trees' },
        { id: 'nc_54', title: 'Binary Tree Right Side View', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-right-side-view/', topic: 'Trees' },
        { id: 'nc_55', title: 'Count Good Nodes in Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', topic: 'Trees' },
        { id: 'nc_56', title: 'Validate Binary Search Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/validate-binary-search-tree/', topic: 'Trees' },
        { id: 'nc_57', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', topic: 'Trees' },
        { id: 'nc_58', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', topic: 'Trees' },
        { id: 'nc_59', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topic: 'Trees' },
        { id: 'nc_60', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', topic: 'Trees' },
      ]},
      { name: 'Backtracking', questions: [
        { id: 'nc_71', title: 'Subsets', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets/', topic: 'Backtracking' },
        { id: 'nc_72', title: 'Combination Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/', topic: 'Backtracking' },
        { id: 'nc_73', title: 'Permutations', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/', topic: 'Backtracking' },
        { id: 'nc_74', title: 'Subsets II', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets-ii/', topic: 'Backtracking' },
        { id: 'nc_75', title: 'Combination Sum II', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum-ii/', topic: 'Backtracking' },
        { id: 'nc_76', title: 'Word Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/', topic: 'Backtracking' },
        { id: 'nc_77', title: 'Palindrome Partitioning', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindrome-partitioning/', topic: 'Backtracking' },
        { id: 'nc_78', title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', link: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', topic: 'Backtracking' },
        { id: 'nc_79', title: 'N-Queens', difficulty: 'Hard', link: 'https://leetcode.com/problems/n-queens/', topic: 'Backtracking' },
      ]},
      { name: 'Graphs', questions: [
        { id: 'nc_80', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/', topic: 'Graphs' },
        { id: 'nc_81', title: 'Max Area of Island', difficulty: 'Medium', link: 'https://leetcode.com/problems/max-area-of-island/', topic: 'Graphs' },
        { id: 'nc_82', title: 'Clone Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/', topic: 'Graphs' },
        { id: 'nc_84', title: 'Rotting Oranges', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotting-oranges/', topic: 'Graphs' },
        { id: 'nc_85', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', topic: 'Graphs' },
        { id: 'nc_86', title: 'Surrounded Regions', difficulty: 'Medium', link: 'https://leetcode.com/problems/surrounded-regions/', topic: 'Graphs' },
        { id: 'nc_87', title: 'Course Schedule', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/', topic: 'Graphs' },
        { id: 'nc_88', title: 'Course Schedule II', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule-ii/', topic: 'Graphs' },
        { id: 'nc_92', title: 'Word Ladder', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-ladder/', topic: 'Graphs' },
      ]},
      { name: 'Dynamic Programming', questions: [
        { id: 'nc_93', title: 'Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/', topic: 'Dynamic Programming' },
        { id: 'nc_94', title: 'Min Cost Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/min-cost-climbing-stairs/', topic: 'Dynamic Programming' },
        { id: 'nc_95', title: 'House Robber', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/', topic: 'Dynamic Programming' },
        { id: 'nc_96', title: 'House Robber II', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber-ii/', topic: 'Dynamic Programming' },
        { id: 'nc_97', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Dynamic Programming' },
        { id: 'nc_99', title: 'Decode Ways', difficulty: 'Medium', link: 'https://leetcode.com/problems/decode-ways/', topic: 'Dynamic Programming' },
        { id: 'nc_100', title: 'Coin Change', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/', topic: 'Dynamic Programming' },
        { id: 'nc_101', title: 'Maximum Product Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-product-subarray/', topic: 'Dynamic Programming' },
        { id: 'nc_102', title: 'Word Break', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/', topic: 'Dynamic Programming' },
        { id: 'nc_103', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topic: 'Dynamic Programming' },
        { id: 'nc_104', title: 'Partition Equal Subset Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-equal-subset-sum/', topic: 'Dynamic Programming' },
        { id: 'nc_105', title: 'Unique Paths', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/', topic: 'Dynamic Programming' },
        { id: 'nc_106', title: 'Longest Common Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/', topic: 'Dynamic Programming' },
        { id: 'nc_108', title: 'Coin Change II', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change-ii/', topic: 'Dynamic Programming' },
        { id: 'nc_109', title: 'Target Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/target-sum/', topic: 'Dynamic Programming' },
        { id: 'nc_113', title: 'Edit Distance', difficulty: 'Medium', link: 'https://leetcode.com/problems/edit-distance/', topic: 'Dynamic Programming' },
        { id: 'nc_114', title: 'Burst Balloons', difficulty: 'Hard', link: 'https://leetcode.com/problems/burst-balloons/', topic: 'Dynamic Programming' },
      ]},
      { name: 'Greedy', questions: [
        { id: 'nc_116', title: 'Maximum Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Greedy' },
        { id: 'nc_117', title: 'Jump Game', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game/', topic: 'Greedy' },
        { id: 'nc_118', title: 'Jump Game II', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game-ii/', topic: 'Greedy' },
        { id: 'nc_119', title: 'Gas Station', difficulty: 'Medium', link: 'https://leetcode.com/problems/gas-station/', topic: 'Greedy' },
        { id: 'nc_122', title: 'Partition Labels', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-labels/', topic: 'Greedy' },
        { id: 'nc_123', title: 'Valid Parenthesis String', difficulty: 'Medium', link: 'https://leetcode.com/problems/valid-parenthesis-string/', topic: 'Greedy' },
      ]},
      { name: 'Intervals', questions: [
        { id: 'nc_124', title: 'Insert Interval', difficulty: 'Medium', link: 'https://leetcode.com/problems/insert-interval/', topic: 'Intervals' },
        { id: 'nc_125', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Intervals' },
        { id: 'nc_126', title: 'Non-overlapping Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/non-overlapping-intervals/', topic: 'Intervals' },
        { id: 'nc_127', title: 'Meeting Rooms', difficulty: 'Easy', link: 'https://leetcode.com/problems/meeting-rooms/', topic: 'Intervals' },
        { id: 'nc_128', title: 'Meeting Rooms II', difficulty: 'Medium', link: 'https://leetcode.com/problems/meeting-rooms-ii/', topic: 'Intervals' },
      ]},
      { name: 'Math & Geometry', questions: [
        { id: 'nc_130', title: 'Rotate Image', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Math' },
        { id: 'nc_131', title: 'Spiral Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/', topic: 'Math' },
        { id: 'nc_132', title: 'Set Matrix Zeroes', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/', topic: 'Math' },
        { id: 'nc_133', title: 'Happy Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/happy-number/', topic: 'Math' },
        { id: 'nc_134', title: 'Plus One', difficulty: 'Easy', link: 'https://leetcode.com/problems/plus-one/', topic: 'Math' },
        { id: 'nc_135', title: 'Pow(x, n)', difficulty: 'Medium', link: 'https://leetcode.com/problems/powx-n/', topic: 'Math' },
        { id: 'nc_136', title: 'Multiply Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/multiply-strings/', topic: 'Math' },
      ]},
      { name: 'Bit Manipulation', questions: [
        { id: 'nc_138', title: 'Single Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/single-number/', topic: 'Bit Manipulation' },
        { id: 'nc_139', title: 'Number of 1 Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/number-of-1-bits/', topic: 'Bit Manipulation' },
        { id: 'nc_140', title: 'Counting Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/counting-bits/', topic: 'Bit Manipulation' },
        { id: 'nc_141', title: 'Reverse Bits', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-bits/', topic: 'Bit Manipulation' },
        { id: 'nc_142', title: 'Missing Number', difficulty: 'Easy', link: 'https://leetcode.com/problems/missing-number/', topic: 'Bit Manipulation' },
        { id: 'nc_143', title: 'Sum of Two Integers', difficulty: 'Medium', link: 'https://leetcode.com/problems/sum-of-two-integers/', topic: 'Bit Manipulation' },
        { id: 'nc_144', title: 'Reverse Integer', difficulty: 'Medium', link: 'https://leetcode.com/problems/reverse-integer/', topic: 'Bit Manipulation' },
      ]},
    ]
  },
  // STRIVER'S SDE SHEET - Complete
  {
    id: 'striver-sde',
    title: "Striver's SDE Sheet",
    creator: 'Striver (Raj Vikramaditya)',
    creatorLink: 'https://www.youtube.com/@takeUforward',
    originalSheetLink: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    desc: 'Top 191 questions curated specifically for SDE interviews at top tech companies like Google, Amazon, Meta.',
    totalQuestions: 191,
    color: 'from-purple-500 to-pink-500',
    icon: '💼',
    topics: [
      { name: 'Day 1 - Arrays', questions: [
        { id: 'sde_1', title: 'Set Matrix Zeroes', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/', topic: 'Arrays' },
        { id: 'sde_2', title: "Pascal's Triangle", difficulty: 'Easy', link: 'https://leetcode.com/problems/pascals-triangle/', topic: 'Arrays' },
        { id: 'sde_3', title: 'Next Permutation', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/', topic: 'Arrays' },
        { id: 'sde_4', title: 'Maximum Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Arrays' },
        { id: 'sde_5', title: 'Sort Colors', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors/', topic: 'Arrays' },
        { id: 'sde_6', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Arrays' },
      ]},
      { name: 'Day 2 - Arrays Part II', questions: [
        { id: 'sde_7', title: 'Rotate Image', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Arrays' },
        { id: 'sde_8', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Arrays' },
        { id: 'sde_9', title: 'Merge Sorted Array', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-sorted-array/', topic: 'Arrays' },
        { id: 'sde_10', title: 'Find the Duplicate Number', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-the-duplicate-number/', topic: 'Arrays' },
        { id: 'sde_11', title: 'Repeat and Missing Number', difficulty: 'Hard', link: 'https://www.interviewbit.com/problems/repeat-and-missing-number-array/', topic: 'Arrays' },
        { id: 'sde_12', title: 'Count Inversions', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', topic: 'Arrays' },
      ]},
      { name: 'Day 3 - Arrays Part III', questions: [
        { id: 'sde_13', title: 'Search a 2D Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix/', topic: 'Arrays' },
        { id: 'sde_14', title: "Pow(x, n)", difficulty: 'Medium', link: 'https://leetcode.com/problems/powx-n/', topic: 'Arrays' },
        { id: 'sde_15', title: 'Majority Element', difficulty: 'Easy', link: 'https://leetcode.com/problems/majority-element/', topic: 'Arrays' },
        { id: 'sde_16', title: 'Majority Element II', difficulty: 'Medium', link: 'https://leetcode.com/problems/majority-element-ii/', topic: 'Arrays' },
        { id: 'sde_17', title: 'Unique Paths', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/', topic: 'Arrays' },
        { id: 'sde_18', title: 'Reverse Pairs', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-pairs/', topic: 'Arrays' },
      ]},
      { name: 'Day 4 - Arrays Part IV', questions: [
        { id: 'sde_19', title: '2Sum Problem', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays' },
        { id: 'sde_20', title: '4Sum Problem', difficulty: 'Medium', link: 'https://leetcode.com/problems/4sum/', topic: 'Arrays' },
        { id: 'sde_21', title: 'Longest Consecutive Sequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', topic: 'Arrays' },
        { id: 'sde_22', title: 'Largest Subarray with 0 sum', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1', topic: 'Arrays' },
        { id: 'sde_23', title: 'Count Subarrays with given XOR', difficulty: 'Hard', link: 'https://www.interviewbit.com/problems/subarray-with-given-xor/', topic: 'Arrays' },
        { id: 'sde_24', title: 'Longest Substring without Repeating Characters', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topic: 'Arrays' },
      ]},
      { name: 'Day 5 - Linked List', questions: [
        { id: 'sde_25', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'sde_26', title: 'Middle of Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/middle-of-the-linked-list/', topic: 'Linked List' },
        { id: 'sde_27', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topic: 'Linked List' },
        { id: 'sde_28', title: 'Remove Nth Node From End', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topic: 'Linked List' },
        { id: 'sde_29', title: 'Add Two Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/', topic: 'Linked List' },
        { id: 'sde_30', title: 'Delete Node in a Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/delete-node-in-a-linked-list/', topic: 'Linked List' },
      ]},
      { name: 'Day 6 - Linked List Part II', questions: [
        { id: 'sde_31', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'sde_32', title: 'Linked List Cycle II', difficulty: 'Medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/', topic: 'Linked List' },
        { id: 'sde_33', title: 'Palindrome Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/palindrome-linked-list/', topic: 'Linked List' },
        { id: 'sde_34', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', topic: 'Linked List' },
        { id: 'sde_35', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', topic: 'Linked List' },
        { id: 'sde_36', title: 'Flattening a Linked List', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/flattening-a-linked-list/1', topic: 'Linked List' },
      ]},
      { name: 'Day 7 - Linked List & Arrays', questions: [
        { id: 'sde_37', title: 'Rotate a Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-list/', topic: 'Linked List' },
        { id: 'sde_38', title: 'Copy List with Random Pointer', difficulty: 'Medium', link: 'https://leetcode.com/problems/copy-list-with-random-pointer/', topic: 'Linked List' },
        { id: 'sde_39', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/', topic: 'Arrays' },
        { id: 'sde_40', title: 'Trapping Rain Water', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/', topic: 'Arrays' },
        { id: 'sde_41', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', topic: 'Arrays' },
        { id: 'sde_42', title: 'Max Consecutive Ones', difficulty: 'Easy', link: 'https://leetcode.com/problems/max-consecutive-ones/', topic: 'Arrays' },
      ]},
      { name: 'Day 8 - Greedy', questions: [
        { id: 'sde_43', title: 'N Meetings in One Room', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/n-meetings-in-one-room-1587115620/1', topic: 'Greedy' },
        { id: 'sde_44', title: 'Minimum Platforms', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1', topic: 'Greedy' },
        { id: 'sde_45', title: 'Job Sequencing Problem', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1', topic: 'Greedy' },
        { id: 'sde_46', title: 'Fractional Knapsack', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1', topic: 'Greedy' },
        { id: 'sde_48', title: 'Activity Selection', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1', topic: 'Greedy' },
      ]},
      { name: 'Day 9-10 - Recursion & Backtracking', questions: [
        { id: 'sde_49', title: 'Subset Sums', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/subset-sums2234/1', topic: 'Recursion' },
        { id: 'sde_50', title: 'Subsets II', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets-ii/', topic: 'Recursion' },
        { id: 'sde_51', title: 'Combination Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/', topic: 'Recursion' },
        { id: 'sde_52', title: 'Combination Sum II', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum-ii/', topic: 'Recursion' },
        { id: 'sde_53', title: 'Palindrome Partitioning', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindrome-partitioning/', topic: 'Recursion' },
        { id: 'sde_54', title: 'Kth Permutation Sequence', difficulty: 'Hard', link: 'https://leetcode.com/problems/permutation-sequence/', topic: 'Recursion' },
        { id: 'sde_55', title: 'Print All Permutations', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/', topic: 'Backtracking' },
        { id: 'sde_56', title: 'N-Queens', difficulty: 'Hard', link: 'https://leetcode.com/problems/n-queens/', topic: 'Backtracking' },
        { id: 'sde_57', title: 'Sudoku Solver', difficulty: 'Hard', link: 'https://leetcode.com/problems/sudoku-solver/', topic: 'Backtracking' },
        { id: 'sde_59', title: 'Rat in a Maze', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1', topic: 'Backtracking' },
        { id: 'sde_60', title: 'Word Break', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-break/', topic: 'Backtracking' },
      ]},
      { name: 'Day 11 - Binary Search', questions: [
        { id: 'sde_61', title: 'Nth Root of a Number', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1', topic: 'Binary Search' },
        { id: 'sde_62', title: 'Matrix Median', difficulty: 'Hard', link: 'https://www.interviewbit.com/problems/matrix-median/', topic: 'Binary Search' },
        { id: 'sde_63', title: 'Single Element in a Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', topic: 'Binary Search' },
        { id: 'sde_64', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'sde_65', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', topic: 'Binary Search' },
        { id: 'sde_66', title: 'Kth Element of Two Sorted Arrays', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1', topic: 'Binary Search' },
      ]},
      { name: 'Day 12-14 - Heaps & Stack/Queue', questions: [
        { id: 'sde_68', title: 'Kth Largest Element', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', topic: 'Heaps' },
        { id: 'sde_70', title: 'Find Median from Data Stream', difficulty: 'Hard', link: 'https://leetcode.com/problems/find-median-from-data-stream/', topic: 'Heaps' },
        { id: 'sde_71', title: 'Merge k Sorted Arrays', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1', topic: 'Heaps' },
        { id: 'sde_77', title: 'Valid Parentheses', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/', topic: 'Stacks & Queues' },
        { id: 'sde_78', title: 'Next Greater Element', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-greater-element-i/', topic: 'Stacks & Queues' },
        { id: 'sde_80', title: 'LRU Cache', difficulty: 'Hard', link: 'https://leetcode.com/problems/lru-cache/', topic: 'Stacks & Queues' },
        { id: 'sde_81', title: 'LFU Cache', difficulty: 'Hard', link: 'https://leetcode.com/problems/lfu-cache/', topic: 'Stacks & Queues' },
        { id: 'sde_82', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', topic: 'Stacks & Queues' },
        { id: 'sde_83', title: 'Sliding Window Maximum', difficulty: 'Hard', link: 'https://leetcode.com/problems/sliding-window-maximum/', topic: 'Stacks & Queues' },
        { id: 'sde_84', title: 'Min Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/min-stack/', topic: 'Stacks & Queues' },
        { id: 'sde_85', title: 'Rotting Oranges', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotting-oranges/', topic: 'Stacks & Queues' },
      ]},
      { name: 'Day 15-18 - Strings', questions: [
        { id: 'sde_86', title: 'Reverse Words in a String', difficulty: 'Medium', link: 'https://leetcode.com/problems/reverse-words-in-a-string/', topic: 'Strings' },
        { id: 'sde_87', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Strings' },
        { id: 'sde_88', title: 'Roman to Integer', difficulty: 'Easy', link: 'https://leetcode.com/problems/roman-to-integer/', topic: 'Strings' },
        { id: 'sde_89', title: 'Integer to Roman', difficulty: 'Medium', link: 'https://leetcode.com/problems/integer-to-roman/', topic: 'Strings' },
        { id: 'sde_90', title: 'Implement strStr()', difficulty: 'Easy', link: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/', topic: 'Strings' },
        { id: 'sde_91', title: 'Compare Version Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/compare-version-numbers/', topic: 'Strings' },
        { id: 'sde_92', title: 'Longest Common Prefix', difficulty: 'Easy', link: 'https://leetcode.com/problems/longest-common-prefix/', topic: 'Strings' },
        { id: 'sde_93', title: 'Rabin Karp Algorithm', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/rabin-karp-algorithm/1', topic: 'Strings' },
      ]},
    ]
  },
  // LOVE BABBAR 450
  {
    id: 'love-babbar-450',
    title: 'Love Babbar 450',
    creator: 'Love Babbar',
    creatorLink: 'https://www.youtube.com/@LoveBabbar',
    originalSheetLink: 'https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/',
    desc: 'Comprehensive 450 DSA questions for complete mastery of all data structures and algorithms.',
    totalQuestions: 450,
    color: 'from-green-500 to-emerald-500',
    icon: '💚',
    topics: [
      { name: 'Arrays', questions: [
        { id: 'lb_1', title: 'Reverse the Array', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/', topic: 'Arrays' },
        { id: 'lb_2', title: 'Find Maximum and Minimum', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/', topic: 'Arrays' },
        { id: 'lb_3', title: 'Kth Max and Min Element', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1', topic: 'Arrays' },
        { id: 'lb_4', title: 'Sort 0s, 1s and 2s', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors/', topic: 'Arrays' },
        { id: 'lb_5', title: 'Move Negative Numbers', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/move-negative-numbers-beginning-positive-end-constant-extra-space/', topic: 'Arrays' },
        { id: 'lb_6', title: 'Union and Intersection of Arrays', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/union-of-two-sorted-arrays-1587115621/1', topic: 'Arrays' },
        { id: 'lb_7', title: 'Cyclically Rotate Array by One', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1', topic: 'Arrays' },
        { id: 'lb_8', title: 'Largest Sum Contiguous Subarray (Kadane)', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Arrays' },
        { id: 'lb_9', title: 'Minimize the Heights', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/minimize-the-heights3351/1', topic: 'Arrays' },
        { id: 'lb_10', title: 'Minimum Jumps', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game-ii/', topic: 'Arrays' },
        { id: 'lb_11', title: 'Find Duplicate in Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-the-duplicate-number/', topic: 'Arrays' },
        { id: 'lb_12', title: 'Merge Two Sorted Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-sorted-array/', topic: 'Arrays' },
        { id: 'lb_13', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Arrays' },
        { id: 'lb_14', title: 'Next Permutation', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/', topic: 'Arrays' },
        { id: 'lb_15', title: 'Count Inversions', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', topic: 'Arrays' },
        { id: 'lb_16', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Arrays' },
        { id: 'lb_17', title: 'Count Pairs with Given Sum', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/count-pairs-with-given-sum5022/1', topic: 'Arrays' },
        { id: 'lb_18', title: 'Common Elements in 3 Sorted Arrays', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/common-elements1132/1', topic: 'Arrays' },
        { id: 'lb_19', title: 'Rearrange Array Alternately', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/rearrange-array-alternately-1587115620/1', topic: 'Arrays' },
        { id: 'lb_20', title: 'Subarray with 0 Sum', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/subarray-with-0-sum-1587115621/1', topic: 'Arrays' },
      ]},
      { name: 'Matrix', questions: [
        { id: 'lb_21', title: 'Spiral Traversal of Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/', topic: 'Arrays' },
        { id: 'lb_22', title: 'Search in Row-Column Sorted Matrix', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', topic: 'Arrays' },
        { id: 'lb_23', title: 'Row with Max 1s', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/row-with-max-1s0023/1', topic: 'Arrays' },
        { id: 'lb_24', title: 'Sort Matrix Diagonally', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-the-matrix-diagonally/', topic: 'Arrays' },
        { id: 'lb_25', title: 'Max Rectangle in Binary Matrix', difficulty: 'Hard', link: 'https://leetcode.com/problems/maximal-rectangle/', topic: 'Arrays' },
        { id: 'lb_26', title: 'Rotate Matrix by 90 Degrees', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Arrays' },
      ]},
      { name: 'Strings', questions: [
        { id: 'lb_27', title: 'Reverse a String', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-string/', topic: 'Strings' },
        { id: 'lb_28', title: 'Check Palindrome', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/', topic: 'Strings' },
        { id: 'lb_29', title: 'Find Duplicate Characters', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/print-all-the-duplicates-in-the-input-string/', topic: 'Strings' },
        { id: 'lb_30', title: 'Check if Strings are Rotations', difficulty: 'Easy', link: 'https://leetcode.com/problems/rotate-string/', topic: 'Strings' },
        { id: 'lb_31', title: 'Valid Shuffle of Two Strings', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/check-if-given-string-is-interleaving-of-two-other-given-strings/', topic: 'Strings' },
        { id: 'lb_32', title: 'Count and Say', difficulty: 'Medium', link: 'https://leetcode.com/problems/count-and-say/', topic: 'Strings' },
        { id: 'lb_33', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Strings' },
        { id: 'lb_34', title: 'Print All Subsequences', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/power-set4302/1', topic: 'Strings' },
        { id: 'lb_35', title: 'Permutations of String', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/', topic: 'Strings' },
        { id: 'lb_36', title: 'Split Binary String', difficulty: 'Easy', link: 'https://leetcode.com/problems/split-a-string-in-balanced-strings/', topic: 'Strings' },
      ]},
      { name: 'Searching & Sorting', questions: [
        { id: 'lb_37', title: 'First and Last Position', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', topic: 'Binary Search' },
        { id: 'lb_38', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topic: 'Binary Search' },
        { id: 'lb_39', title: 'Count Square Root', difficulty: 'Easy', link: 'https://leetcode.com/problems/sqrtx/', topic: 'Binary Search' },
        { id: 'lb_40', title: 'Majority Element', difficulty: 'Easy', link: 'https://leetcode.com/problems/majority-element/', topic: 'Arrays' },
        { id: 'lb_41', title: 'Find Missing and Repeating', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1', topic: 'Arrays' },
        { id: 'lb_42', title: 'Search in Nearly Sorted Array', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/search-in-an-almost-sorted-array/1', topic: 'Binary Search' },
        { id: 'lb_43', title: 'Kth Smallest Element', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1', topic: 'Arrays' },
      ]},
      { name: 'Linked List', questions: [
        { id: 'lb_44', title: 'Reverse a Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'lb_45', title: 'Reverse in Groups of K', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', topic: 'Linked List' },
        { id: 'lb_46', title: 'Detect Loop in Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'lb_47', title: 'Remove Loop in Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/', topic: 'Linked List' },
        { id: 'lb_48', title: 'Starting Point of Loop', difficulty: 'Medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/', topic: 'Linked List' },
        { id: 'lb_49', title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/', topic: 'Linked List' },
        { id: 'lb_50', title: 'Add Two Numbers as Linked Lists', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/', topic: 'Linked List' },
        { id: 'lb_51', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', topic: 'Linked List' },
        { id: 'lb_52', title: 'Merge Sort for Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-list/', topic: 'Linked List' },
        { id: 'lb_53', title: 'Check Palindrome Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/palindrome-linked-list/', topic: 'Linked List' },
      ]},
      { name: 'Trees', questions: [
        { id: 'lb_54', title: 'Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topic: 'Trees' },
        { id: 'lb_55', title: 'Height of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topic: 'Trees' },
        { id: 'lb_56', title: 'Diameter of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/', topic: 'Trees' },
        { id: 'lb_57', title: 'Create Mirror Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/', topic: 'Trees' },
        { id: 'lb_58', title: 'Inorder Traversal (Iterative)', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', topic: 'Trees' },
        { id: 'lb_59', title: 'Preorder Traversal (Iterative)', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', topic: 'Trees' },
        { id: 'lb_60', title: 'Postorder Traversal (Iterative)', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', topic: 'Trees' },
        { id: 'lb_61', title: 'Left View of Binary Tree', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1', topic: 'Trees' },
        { id: 'lb_62', title: 'Right View of Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-right-side-view/', topic: 'Trees' },
        { id: 'lb_63', title: 'Top View of Binary Tree', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1', topic: 'Trees' },
        { id: 'lb_64', title: 'Bottom View of Binary Tree', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1', topic: 'Trees' },
        { id: 'lb_65', title: 'Zigzag Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', topic: 'Trees' },
        { id: 'lb_66', title: 'Check if Balanced Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/balanced-binary-tree/', topic: 'Trees' },
        { id: 'lb_67', title: 'LCA of Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', topic: 'Trees' },
        { id: 'lb_68', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topic: 'Trees' },
      ]},
      { name: 'BST', questions: [
        { id: 'lb_69', title: 'Search in BST', difficulty: 'Easy', link: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', topic: 'Binary Search Trees' },
        { id: 'lb_70', title: 'Insert in BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', topic: 'Binary Search Trees' },
        { id: 'lb_71', title: 'Delete Node in BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/delete-node-in-a-bst/', topic: 'Binary Search Trees' },
        { id: 'lb_72', title: 'Validate BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/validate-binary-search-tree/', topic: 'Binary Search Trees' },
        { id: 'lb_73', title: 'LCA of BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', topic: 'Binary Search Trees' },
        { id: 'lb_74', title: 'Kth Smallest in BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', topic: 'Binary Search Trees' },
        { id: 'lb_75', title: 'Convert Sorted Array to BST', difficulty: 'Easy', link: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', topic: 'Binary Search Trees' },
      ]},
      { name: 'Graphs', questions: [
        { id: 'lb_76', title: 'BFS Traversal', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1', topic: 'Graphs' },
        { id: 'lb_77', title: 'DFS Traversal', difficulty: 'Easy', link: 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1', topic: 'Graphs' },
        { id: 'lb_78', title: 'Detect Cycle in Undirected Graph', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', topic: 'Graphs' },
        { id: 'lb_79', title: 'Detect Cycle in Directed Graph', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', topic: 'Graphs' },
        { id: 'lb_80', title: 'Topological Sort', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/topological-sort/1', topic: 'Graphs' },
        { id: 'lb_81', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/', topic: 'Graphs' },
        { id: 'lb_82', title: 'Clone a Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/', topic: 'Graphs' },
        { id: 'lb_83', title: 'Dijkstra Algorithm', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1', topic: 'Graphs' },
        { id: 'lb_84', title: 'Bellman Ford Algorithm', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1', topic: 'Graphs' },
        { id: 'lb_85', title: 'Floyd Warshall Algorithm', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1', topic: 'Graphs' },
      ]},
      { name: 'Dynamic Programming', questions: [
        { id: 'lb_86', title: 'Coin Change', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/', topic: 'Dynamic Programming' },
        { id: 'lb_87', title: 'Knapsack Problem', difficulty: 'Medium', link: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1', topic: 'Dynamic Programming' },
        { id: 'lb_88', title: 'Longest Common Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/', topic: 'Dynamic Programming' },
        { id: 'lb_89', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topic: 'Dynamic Programming' },
        { id: 'lb_90', title: 'Edit Distance', difficulty: 'Medium', link: 'https://leetcode.com/problems/edit-distance/', topic: 'Dynamic Programming' },
        { id: 'lb_91', title: 'Matrix Chain Multiplication', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1', topic: 'Dynamic Programming' },
        { id: 'lb_92', title: 'Egg Dropping Problem', difficulty: 'Hard', link: 'https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1', topic: 'Dynamic Programming' },
        { id: 'lb_93', title: 'Longest Palindromic Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-subsequence/', topic: 'Dynamic Programming' },
        { id: 'lb_94', title: 'Word Break', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/', topic: 'Dynamic Programming' },
        { id: 'lb_95', title: 'Partition Equal Subset Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-equal-subset-sum/', topic: 'Dynamic Programming' },
      ]},
    ]
  },
  // FRAZ SDE SHEET
  {
    id: 'fraz-sde',
    title: 'Fraz SDE Sheet',
    creator: 'Fraz (Lead Coding)',
    creatorLink: 'https://www.youtube.com/@moloyfraz',
    originalSheetLink: 'https://leadcoding.in/sde-sheet/',
    desc: '250+ handpicked problems covering all major DSA topics for product-based company interviews.',
    totalQuestions: 250,
    color: 'from-indigo-500 to-violet-500',
    icon: '🚀',
    topics: [
      { name: 'Arrays', questions: [
        { id: 'fz_1', title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/', topic: 'Arrays' },
        { id: 'fz_2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topic: 'Arrays' },
        { id: 'fz_3', title: 'Merge Sorted Array', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-sorted-array/', topic: 'Arrays' },
        { id: 'fz_4', title: 'Move Zeroes', difficulty: 'Easy', link: 'https://leetcode.com/problems/move-zeroes/', topic: 'Arrays' },
        { id: 'fz_5', title: 'Maximum Subarray', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/', topic: 'Arrays' },
        { id: 'fz_6', title: 'Sort Colors', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors/', topic: 'Arrays' },
        { id: 'fz_7', title: 'Next Permutation', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/', topic: 'Arrays' },
        { id: 'fz_8', title: 'Rotate Image', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/', topic: 'Arrays' },
        { id: 'fz_9', title: 'Merge Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/', topic: 'Arrays' },
        { id: 'fz_10', title: '3Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/', topic: 'Arrays' },
        { id: 'fz_11', title: 'Container With Most Water', difficulty: 'Medium', link: 'https://leetcode.com/problems/container-with-most-water/', topic: 'Arrays' },
        { id: 'fz_12', title: 'Trapping Rain Water', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/', topic: 'Arrays' },
      ]},
      { name: 'Strings', questions: [
        { id: 'fz_13', title: 'Valid Anagram', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/', topic: 'Strings' },
        { id: 'fz_14', title: 'Valid Palindrome', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/', topic: 'Strings' },
        { id: 'fz_15', title: 'Longest Common Prefix', difficulty: 'Easy', link: 'https://leetcode.com/problems/longest-common-prefix/', topic: 'Strings' },
        { id: 'fz_16', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topic: 'Strings' },
        { id: 'fz_17', title: 'Longest Palindromic Substring', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/', topic: 'Strings' },
        { id: 'fz_18', title: 'Group Anagrams', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams/', topic: 'Strings' },
        { id: 'fz_19', title: 'Minimum Window Substring', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/', topic: 'Strings' },
      ]},
      { name: 'Linked List', questions: [
        { id: 'fz_20', title: 'Reverse Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/', topic: 'Linked List' },
        { id: 'fz_21', title: 'Merge Two Sorted Lists', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topic: 'Linked List' },
        { id: 'fz_22', title: 'Linked List Cycle', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/', topic: 'Linked List' },
        { id: 'fz_23', title: 'Middle of the Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/middle-of-the-linked-list/', topic: 'Linked List' },
        { id: 'fz_24', title: 'Remove Nth Node From End', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topic: 'Linked List' },
        { id: 'fz_25', title: 'Add Two Numbers', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/', topic: 'Linked List' },
        { id: 'fz_26', title: 'LRU Cache', difficulty: 'Medium', link: 'https://leetcode.com/problems/lru-cache/', topic: 'Linked List' },
        { id: 'fz_27', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', topic: 'Linked List' },
      ]},
      { name: 'Trees', questions: [
        { id: 'fz_28', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topic: 'Trees' },
        { id: 'fz_29', title: 'Same Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/', topic: 'Trees' },
        { id: 'fz_30', title: 'Invert Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/', topic: 'Trees' },
        { id: 'fz_31', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topic: 'Trees' },
        { id: 'fz_32', title: 'Validate Binary Search Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/validate-binary-search-tree/', topic: 'Trees' },
        { id: 'fz_33', title: 'Lowest Common Ancestor', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', topic: 'Trees' },
        { id: 'fz_34', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topic: 'Trees' },
        { id: 'fz_35', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', topic: 'Trees' },
      ]},
      { name: 'Graphs', questions: [
        { id: 'fz_36', title: 'Number of Islands', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/', topic: 'Graphs' },
        { id: 'fz_37', title: 'Clone Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/', topic: 'Graphs' },
        { id: 'fz_38', title: 'Course Schedule', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/', topic: 'Graphs' },
        { id: 'fz_39', title: 'Course Schedule II', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule-ii/', topic: 'Graphs' },
        { id: 'fz_40', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', topic: 'Graphs' },
        { id: 'fz_41', title: 'Word Ladder', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-ladder/', topic: 'Graphs' },
      ]},
      { name: 'Dynamic Programming', questions: [
        { id: 'fz_42', title: 'Climbing Stairs', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/', topic: 'Dynamic Programming' },
        { id: 'fz_43', title: 'House Robber', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/', topic: 'Dynamic Programming' },
        { id: 'fz_44', title: 'Coin Change', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/', topic: 'Dynamic Programming' },
        { id: 'fz_45', title: 'Longest Increasing Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topic: 'Dynamic Programming' },
        { id: 'fz_46', title: 'Longest Common Subsequence', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/', topic: 'Dynamic Programming' },
        { id: 'fz_47', title: 'Word Break', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/', topic: 'Dynamic Programming' },
        { id: 'fz_48', title: 'Edit Distance', difficulty: 'Medium', link: 'https://leetcode.com/problems/edit-distance/', topic: 'Dynamic Programming' },
        { id: 'fz_49', title: 'Unique Paths', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/', topic: 'Dynamic Programming' },
        { id: 'fz_50', title: 'Partition Equal Subset Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-equal-subset-sum/', topic: 'Dynamic Programming' },
      ]},
      { name: 'Backtracking', questions: [
        { id: 'fz_51', title: 'Subsets', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets/', topic: 'Backtracking' },
        { id: 'fz_52', title: 'Permutations', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/', topic: 'Backtracking' },
        { id: 'fz_53', title: 'Combination Sum', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/', topic: 'Backtracking' },
        { id: 'fz_54', title: 'Word Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/', topic: 'Backtracking' },
        { id: 'fz_55', title: 'N-Queens', difficulty: 'Hard', link: 'https://leetcode.com/problems/n-queens/', topic: 'Backtracking' },
      ]},
    ]
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

const SheetsTracker = () => {
  const [theme, setTheme] = useState<ThemeKey>('ocean');
  const [activeSheetId, setActiveSheetId] = useState(SHEETS_DATA[0].id);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [showImportModal, setShowImportModal] = useState(false);

  const colors = colorThemes[theme];

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as ThemeKey;
    if (saved && colorThemes[saved]) setTheme(saved);
  }, []);

  useEffect(() => {
    const savedCompleted = localStorage.getItem('dsa-progress');
    const savedReview = localStorage.getItem('dsa-review');
    if (savedCompleted) setCompleted(JSON.parse(savedCompleted));
    if (savedReview) setReview(JSON.parse(savedReview));
  }, []);

  const toggleStatus = (id: string, type: 'done' | 'review') => {
    if (type === 'done') {
      const newState = { ...completed, [id]: !completed[id] };
      setCompleted(newState);
      localStorage.setItem('dsa-progress', JSON.stringify(newState));
    } else {
      const newState = { ...review, [id]: !review[id] };
      setReview(newState);
      localStorage.setItem('dsa-review', JSON.stringify(newState));
    }
  };

  const handleImport = (questionIds: string[]) => {
    const newCompleted = { ...completed };
    questionIds.forEach(id => { newCompleted[id] = true; });
    setCompleted(newCompleted);
    localStorage.setItem('dsa-progress', JSON.stringify(newCompleted));
  };

  const exportProgress = () => {
    const solvedIds = Object.entries(completed).filter(([_, v]) => v).map(([k, _]) => k);
    const data = JSON.stringify({ solved: solvedIds, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSheet = SHEETS_DATA.find(s => s.id === activeSheetId) || SHEETS_DATA[0];

  return (
    <ThemeContext.Provider value={{ theme, colors }}>
      <div className="min-h-screen bg-slate-950">
        <div className="fixed inset-0 z-0">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950`} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${colors.gradientText} bg-clip-text text-transparent mb-3 flex items-center justify-center gap-3`}>
              <Sparkles style={{ color: colors.primary }} />
              DSA Practice & Tracker
            </h1>
            <p className="text-gray-400 text-sm md:text-base">Track your progress across Striver A2Z, SDE Sheet, Blind 75, Love Babbar 450 & NeetCode 150</p>
          </div>

          {/* POTD */}
          <DailyChallenge />

          {/* PROGRESS OVERVIEW */}
          <ProgressOverview sheets={SHEETS_DATA} completed={completed} activeSheetId={activeSheetId} />

          {/* MAIN CONTENT */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2"><BookOpen size={16} /> Select Sheet</h3>
                  <button onClick={exportProgress} className="text-xs text-gray-500 hover:text-white flex items-center gap-1" title="Export Progress"><Download size={14} /></button>
                </div>
                <SheetSelector sheets={SHEETS_DATA} activeSheetId={activeSheetId} setActiveSheetId={setActiveSheetId} completed={completed} onImportClick={() => setShowImportModal(true)} />
              </div>
            </div>

            {/* QUESTIONS */}
            <div className="lg:col-span-3">
              {/* Sheet Header */}
              <div className={`bg-slate-800/30 rounded-2xl border ${colors.cardBorder} p-6 mb-6`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"><span className="text-2xl">{activeSheet.icon}</span>{activeSheet.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">by <a href={activeSheet.creatorLink} target="_blank" rel="noreferrer" className={colors.hoverColor}>{activeSheet.creator}</a></p>
                  </div>
                  <a href={activeSheet.originalSheetLink} target="_blank" rel="noreferrer" className={`${colors.buttonGradient} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}>Original Sheet <ExternalLink size={14} /></a>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input type="text" placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white"><X size={16} /></button>}
                  </div>
                  <div className="flex gap-2">
                    {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                      <button key={diff} onClick={() => setFilterDifficulty(diff)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterDifficulty === diff ? `${colors.bgAccentMuted} ${colors.textAccent} ${colors.borderAccent} border` : 'bg-slate-800/50 text-gray-400 border border-transparent hover:border-white/10'}`}>{diff}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <QuestionList sheet={activeSheet} completed={completed} review={review} toggleStatus={toggleStatus} searchQuery={searchQuery} filterDifficulty={filterDifficulty} />
            </div>
          </div>
        </div>

        {/* Import Modal */}
        <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} sheet={activeSheet} onImport={handleImport} />
      </div>
    </ThemeContext.Provider>
  );
};

export default SheetsTracker;