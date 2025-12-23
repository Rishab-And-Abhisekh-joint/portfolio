'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Lock } from 'lucide-react';
import { useTheme } from '../app/context/Themecontext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if ((!loading || timedOut) && !user) {
      setShowLogin(true);
    }
  }, [loading, user, timedOut]);

  // Show loading only briefly
  if (loading && !timedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: colors.primary }} />
            <p className="text-gray-400">Loading...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user && showLogin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradientBg} via-slate-950 to-slate-950`} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`relative z-10 bg-slate-900/80 backdrop-blur-xl border ${colors.borderAccent} rounded-2xl p-8 max-w-md w-full text-center shadow-2xl`}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-16 h-16 mx-auto mb-6 rounded-full ${colors.bgAccentMuted} flex items-center justify-center`}
          >
            <Lock size={32} style={{ color: colors.primary }} />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-gray-400 mb-6">
            This page is private. Please sign in to continue.
          </p>
          <motion.button
            onClick={() => router.push('/signin')}
            className={`w-full py-3 ${colors.buttonGradient} text-white rounded-xl font-semibold transition-all hover:opacity-90`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
          <motion.button
            onClick={() => router.push('/')}
            className="w-full mt-3 py-3 bg-slate-800 text-gray-400 rounded-xl font-medium hover:bg-slate-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Portfolio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
