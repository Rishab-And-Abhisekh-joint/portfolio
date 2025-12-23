'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Save, Loader2, Check, User, MapPin, GraduationCap,
  Code2, Github, Linkedin, Mail, Phone, ExternalLink, ArrowLeft
} from 'lucide-react';
import { useTheme } from '@/app/context/Themecontext';

const AdminSetupPage = () => {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile data
  const [profile, setProfile] = useState({
    headline: 'AI Engineer • Data Engineer • Full-Stack Developer',
    bio: '',
    location: 'Durgapur, India',
    university: 'NIT Durgapur',
    degree: 'B.Tech CSE',
    graduationYear: '2026',
    sgpa: '8.78',
    openToOpportunities: true
  });

  // Coding profiles
  const [codingProfiles, setCodingProfiles] = useState({
    leetcode: 'Rishab_Acharjee',
    codeforces: 'rishab.acharjee12345',
    codechef: 'rishabacharjee',
    github: 'Rishab-And-Abhisekh-joint'
  });

  // Contact info
  const [contact, setContact] = useState({
    email: 'rishab.acharjee12345@gmail.com',
    phone: '+91-7432031131',
    linkedin: 'https://www.linkedin.com/in/rishab-acharjee-a317011b9/',
    github: 'https://github.com/Rishab-And-Abhisekh-joint'
  });

  // Check auth
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/auth');
        return;
      }
      setLoading(false);
    } catch (err) {
      router.push('/auth');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          codingProfiles,
          contact
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      setSuccess('Profile saved successfully!');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-6">
      <div className={`fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950 -z-10`} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
                Portfolio Settings
              </h1>
              <p className="text-gray-400 text-sm mt-1">Configure your portfolio display</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Error/Success */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2"
          >
            <Check size={18} /> {success}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Basic Info Section */}
          <section className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className={colors.textAccent} size={20} />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Brief introduction about yourself..."
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white resize-none focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">University</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Degree</label>
                <input
                  type="text"
                  value={profile.degree}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Graduation Year</label>
                <input
                  type="text"
                  value={profile.graduationYear}
                  onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">SGPA</label>
                <input
                  type="text"
                  value={profile.sgpa}
                  onChange={(e) => setProfile({ ...profile, sgpa: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="openToOpp"
                checked={profile.openToOpportunities}
                onChange={(e) => setProfile({ ...profile, openToOpportunities: e.target.checked })}
                className={`w-5 h-5 rounded ${colors.bgAccent}`}
              />
              <label htmlFor="openToOpp" className="text-gray-300">
                Show "Open to Opportunities" badge
              </label>
            </div>
          </section>

          {/* Coding Profiles Section */}
          <section className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Code2 className={colors.textAccent} size={20} />
              Coding Profiles
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(codingProfiles).map(([platform, username]) => (
                <div key={platform}>
                  <label className="block text-sm text-gray-400 mb-2 capitalize">{platform} Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setCodingProfiles({ ...codingProfiles, [platform]: e.target.value })}
                    placeholder={`Your ${platform} username`}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Mail className={colors.textAccent} size={20} />
              Contact Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="url"
                    value={contact.linkedin}
                    onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">GitHub URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input
                    type="url"
                    value={contact.github}
                    onChange={(e) => setContact({ ...contact, github: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-3 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center gap-2`}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;
