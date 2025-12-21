'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, Upload, Eye, EyeOff, ArrowRight, 
  Sparkles, CheckCircle, AlertCircle, FileText, Loader2
} from 'lucide-react';
import { useTheme, colorThemes, ThemeKey } from '@/app/context/Themecontext';

const AuthPage = () => {
  const router = useRouter();
  const { colors, setTheme, theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const uploadResume = async (file: File): Promise<string> => {
    // For now, we'll use a simple approach - in production, upload to S3/Cloudinary
    // This is a placeholder that returns a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let uploadedResumeUrl = resumeUrl;
      
      if (isSignUp && resumeFile) {
        // Upload resume
        uploadedResumeUrl = await uploadResume(resumeFile);
      }

      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const body = isSignUp 
        ? { email, password, name, username, resumeUrl: uploadedResumeUrl }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(isSignUp ? 'Account created successfully!' : 'Welcome back!');
      
      // Redirect based on profile completion
      setTimeout(() => {
        if (data.user.profileComplete) {
          router.push('/');
        } else {
          router.push('/setup');
        }
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
              <Sparkles className="text-white" size={32} />
            </motion.div>
            <h1 className={`text-3xl font-bold ${colors.gradientText} bg-clip-text text-transparent`}>
              Portfolio Hub
            </h1>
            <p className="text-gray-400 mt-2">
              {isSignUp ? 'Create your developer portfolio' : 'Welcome back!'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                isSignUp 
                  ? `${colors.buttonGradient} text-white` 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                !isSignUp 
                  ? `${colors.buttonGradient} text-white` 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
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
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required={isSignUp}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="johndoe"
                        required={isSignUp}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your portfolio URL: portfolio.app/{username || 'username'}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, uppercase, lowercase, number, special char (!@#$%^&*)
                </p>
              )}
            </div>

            {/* Resume Upload (Sign Up only) */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-gray-400 mb-2">Resume (Optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-4 border-2 border-dashed ${
                      resumeFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-white/20'
                    } rounded-xl transition-colors flex items-center justify-center gap-3`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {resumeFile ? (
                      <>
                        <FileText className="text-green-400" size={20} />
                        <span className="text-green-400">{resumeFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="text-gray-500" size={20} />
                        <span className="text-gray-400">Upload PDF resume for auto-fill</span>
                      </>
                    )}
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    We&apos;ll parse your resume to pre-fill your portfolio
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

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
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {isSignUp ? (
              <>Already have an account? <button onClick={() => setIsSignUp(false)} className={`${colors.textAccent} hover:underline`}>Sign in</button></>
            ) : (
              <>Don&apos;t have an account? <button onClick={() => setIsSignUp(true)} className={`${colors.textAccent} hover:underline`}>Sign up</button></>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;