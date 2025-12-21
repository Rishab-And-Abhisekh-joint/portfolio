'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
  const users = [
    { rank: 1, name: "Pratham Lashkari", score: 887, institute: "SDBCT", solved: 1205 },
    { rank: 2, name: "Rajat Joshi", score: 885, institute: "GEHU", solved: 1150 },
    { rank: 3, name: "Saqlain Ansari", score: 885, institute: "HIT", solved: 1120 },
    { rank: 4, name: "Rishab Acharjee (You)", score: 882, institute: "NIT Durgapur", solved: 850 },
    { rank: 5, name: "Aditya Paul", score: 881, institute: "VIT", solved: 900 },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent mb-2 flex justify-center gap-2 items-center"><Trophy className="text-yellow-500" /> Leaderboard</h1>
        <p className="text-gray-400">Top performers ranked by Codolio Score.</p>
      </div>

      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-5 bg-slate-900/80 border-b border-white/10 text-gray-400 font-semibold text-sm uppercase">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-3 hidden md:block">Institute</div>
          <div className="col-span-2 text-right">Score</div>
        </div>
        <div className="divide-y divide-white/5">
          {users.map((u, i) => (
            <motion.div key={u.rank} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}} className={`grid grid-cols-12 gap-4 p-5 items-center ${u.name.includes("You") ? "bg-cyan-500/10 border-l-4 border-cyan-500" : "hover:bg-white/5"}`}>
              <div className="col-span-2 flex justify-center items-center">
                {u.rank===1?<Medal size={28} className="text-yellow-400"/>:u.rank===2?<Medal size={28} className="text-gray-300"/>:u.rank===3?<Medal size={28} className="text-amber-600"/>:<span className="font-mono text-gray-500">#{u.rank}</span>}
              </div>
              <div className="col-span-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">{u.name[0]}</div>
                <div><div className={`font-bold ${u.name.includes("You")?"text-cyan-400":"text-white"}`}>{u.name}</div><div className="text-xs text-gray-500 md:hidden">{u.institute}</div></div>
              </div>
              <div className="col-span-3 hidden md:block text-sm text-gray-400">{u.institute}</div>
              <div className="col-span-2 text-right"><span className="font-mono font-bold text-white text-lg">{u.score}</span><div className="text-[10px] text-gray-500">{u.solved} Solved</div></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;