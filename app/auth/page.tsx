'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Sparkles, CheckCircle, AlertCircle, Loader2, Shield
} from 'lucide-react';
import { useTheme, colorThemes, ThemeKey } from '@/app/context/Themecontext';

const AuthContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { colors, setTheme, theme } = useTheme();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || '/events';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      setSuccess('Welcome back, Admin!');
      
      // Redirect to intended page or events
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      
      {/* Floating orbs */}
      <motion.div 
        className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20`}
        style={{ backgroundColor: colors.primary }}
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20`}
        style={{ backgroundColor: colors.secondary }}
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -30, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Theme Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {(Object.keys(colorThemes) as ThemeKey[]).map((key) => (
            <motion.button
              key={key}
              onClick={() => setTheme(key)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                theme === key ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ 
                background: `linear-gradient(135deg, ${colorThemes[key].primary}, ${colorThemes[key].secondary})` 
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>

        <div className={`bg-slate-900/80 backdrop-blur-xl rounded-3xl border ${colors.cardBorder} p-8 shadow-2xl`}>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.div 
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.buttonGradient} mb-4`}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Shield className="text-white" size={32} />
            </motion.div>
            <h1 className={`text-3xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Admin Access
            </h1>
            <p className="text-gray-400 mt-2">
              Sign in to access dashboard
            </p>
          </div>

          {/* Admin Badge */}
          <div className={`flex items-center justify-center gap-2 py-3 px-4 mb-6 rounded-xl bg-opacity-10 border ${colors.cardBorder}`} style={{ backgroundColor: `${colors.primary}15` }}>
            <Sparkles size={16} className={colors.textAccent} />
            <span className={`text-sm font-medium ${colors.textAccent}`}>Admin Only Access</span>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 mb-4"
              >
                <CheckCircle size={18} />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 ${colors.buttonGradient} rounded-xl text-white font-semibold flex items-center justify-center gap-2 mt-6 disabled:opacity-50`}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm">
              <a href="/" className={`${colors.textAccent} hover:underline`}>← Back to Portfolio</a>
            </p>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-600 text-xs mt-4">
          This is a protected admin area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
};

const AuthPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
};

export default AuthPage;
