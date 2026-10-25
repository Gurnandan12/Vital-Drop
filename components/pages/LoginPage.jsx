'use client';
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Lock, Mail, ArrowRight, AlertTriangle, Loader2, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      router(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setUser({
      id: 'demo-trader-' + Math.random().toString(36).substring(2, 7),
      name: 'Alex Demo Trader',
      email: 'alex.trader@vitaldrop.demo',
      role: 'Simulator Pro',
      createdAt: new Date().toISOString(),
    });
    router(from, { replace: true });
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md p-8 lg:p-10 rounded-[2rem] bg-[#0d0d1e]/90 backdrop-blur-3xl border border-white/10 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="drop-gradient-login-spa" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop stopColor="#a855f7" offset="0%" />
                <stop stopColor="#3b82f6" offset="100%" />
              </linearGradient>
            </defs>
            <path
              d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
              stroke="url(#drop-gradient-login-spa)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to access your simulated portfolio</p>
        </div>

        {/* 1-Click Demo Access Button for quick testing */}
        <div className="mb-6 p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-center">
          <p className="text-xs text-violet-300 font-medium mb-2.5">
            Testing or evaluating the simulator?
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full gap-2"
            onClick={handleDemoAccess}
          >
            <UserCheck className="w-4 h-4" />
            <span>Instant Demo Trader Access</span>
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-violet-500 outline-none text-xs"
                placeholder="investor@vitaldrop.ai"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:border-violet-500 outline-none text-xs"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-4"
            disabled={isLoading}
            isLoading={isLoading}
          >
            <span>Sign In Securely</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          New to Vital Drop?{' '}
          <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-semibold ml-1">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
