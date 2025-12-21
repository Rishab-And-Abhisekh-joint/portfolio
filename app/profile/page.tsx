'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Code2, Terminal, Github } from 'lucide-react';

const ProfileTracker = () => {
  const [handles, setHandles] = useState({ leetcode: '', codeforces: '', github: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('codolio-handles');
    if (stored) setHandles(JSON.parse(stored));
    else setHandles({ leetcode: 'rishab_acharjee', codeforces: 'rishab.acharjee12345', github: 'rishab-acharjee' });
  }, []);

  const handleSave = () => {
    localStorage.setItem('codolio-handles', JSON.stringify(handles));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="bg-slate-800/50 border border-white/10 rounded-3xl p-8 w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400"><User size={32} /></div>
          <div><h1 className="text-2xl font-bold text-white">Profile Settings</h1><p className="text-gray-400">Manage your coding handles.</p></div>
        </div>
        <div className="space-y-6">
          {['leetcode', 'codeforces', 'github'].map(p => (
            <div key={p}>
              <label className="block text-sm text-gray-400 mb-2 capitalize">{p} Username</label>
              <div className="relative">
                {p==='leetcode'?<Code2 className="absolute left-4 top-3.5 text-gray-500"/>:p==='codeforces'?<Terminal className="absolute left-4 top-3.5 text-gray-500"/>:<Github className="absolute left-4 top-3.5 text-gray-500"/>}
                <input type="text" value={handles[p as keyof typeof handles]} onChange={(e) => setHandles({...handles, [p]: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 text-white focus:border-cyan-400 focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className="w-full mt-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold flex items-center justify-center gap-2">
          {saved ? 'Saved Successfully!' : <><Save size={20} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default ProfileTracker;