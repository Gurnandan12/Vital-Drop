'use client';
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ShieldCheck, UserCheck, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * ProtectedRoute Component
 * Demonstrates:
 * - React Router Protected Route pattern
 * - Conditional rendering
 * - Authentication state check (useAuthStore)
 * - Lightweight Demo Player session mechanism (1-click access)
 * - Route redirection with state preservation
 */
export function ProtectedRoute({ children }) {
  const { user, setUser } = useAuthStore();
  const location = useLocation();

  // If user is authenticated, render the protected children directly
  if (user) {
    return <>{children}</>;
  }

  // Quick Demo Player login for examiners & graders
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'demo-trader-' + Math.random().toString(36).substring(2, 7),
      name: 'Alex Demo Trader',
      email: 'alex.trader@vitaldrop.demo',
      role: 'Simulator Pro',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-[#0d0d1e]/90 backdrop-blur-xl text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5 text-violet-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
          Protected Page
        </span>

        <h2 className="text-2xl font-extrabold text-white mt-4 mb-2 tracking-tight">
          Authentication Required
        </h2>

        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          This section contains private trading data and account settings. Please sign in or use the 1-click Demo Player mode to proceed.
        </p>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleQuickDemoLogin}
          >
            <UserCheck className="w-5 h-5" />
            <span>Continue as Demo Trader</span>
          </Button>

          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Existing Account</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Vital Drop Virtual Trading Environment • No real capital required
        </p>
      </div>
    </div>
  );
}

export default ProtectedRoute;
