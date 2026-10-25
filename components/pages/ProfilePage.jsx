'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useStockStore } from '@/store/stockStore';
import { usePortfolio } from '@/hooks/usePortfolio';
import {
  User as UserIcon,
  LogOut,
  Mail,
  Shield,
  Wallet,
  Sparkles,
  CheckCircle2,
  Edit3,
  Save,
  AlertCircle,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Award,
  Sliders,
  Target,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PageHeader } from '../layout/PageHeader';
import { FormField, TextInput, ProfileSetupWizard } from '../forms';

/**
 * ProfilePage — Protected Route Component
 * Features:
 * - Controlled profile editing with reusable FormField and TextInput
 * - Multi-Step Profile Setup Wizard integration
 * - Calibrated Investor Persona and Risk Archetype display
 * - Synchronization with useAuthStore and usePortfolio
 */
export function ProfilePage() {
  const { user, setUser, logout, investorProfile } = useAuthStore();
  const { theme } = useStockStore();
  const { balance, totalInvested, transactions } = usePortfolio();
  const isDark = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const handleStartEditing = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setErrorMsg(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      // Try server update if not demo
      if (!user?.id?.startsWith('demo-')) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
        });
      }

      setUser({
        ...user,
        name: trimmedName,
        email: trimmedEmail,
      });

      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.name || 'Investor';
  const displayEmail = user?.email || 'investor@vitaldrop.ai';
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Page Heading ── */}
      <PageHeader
        title="My Profile & Investor Persona"
        description="Manage your credentials, review account security, and calibrate your multi-step investor setup."
        badge="Account Management"
        badgeVariant="violet"
        badgeIcon={UserIcon}
        actions={
          <div className="flex items-center gap-2">
            {!wizardOpen && (
              <Button
                variant={investorProfile ? 'outline' : 'primary'}
                size="sm"
                onClick={() => setWizardOpen(true)}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{investorProfile ? 'Re-calibrate Investor Persona' : 'Setup Investor Profile'}</span>
              </Button>
            )}
          </div>
        }
      />

      {/* ── MULTI-STEP PROFILE SETUP WIZARD (WHEN OPEN) ── */}
      {wizardOpen ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ProfileSetupWizard
            onComplete={() => {
              setWizardOpen(false);
              setSuccessMsg('Investor profile calibrated and saved successfully!');
              setTimeout(() => setSuccessMsg(null), 4000);
            }}
            onCancel={() => setWizardOpen(false)}
          />
        </div>
      ) : (
        <>
          {/* Notifications */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* ── Calibrated Investor Persona Card (If established) ── */}
          {investorProfile ? (
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-violet-900/25 via-indigo-900/20 to-purple-900/20 border-violet-500/30 shadow-[0_10px_30px_rgba(139,92,246,0.15)]'
                  : 'bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border-violet-200 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Active Calibrated Strategy
                    </span>
                    <h3 className="text-xl font-black tracking-tight">{investorProfile.persona}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      investorProfile.riskTier === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : investorProfile.riskTier === 'Low'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {investorProfile.riskTier} Risk
                  </span>

                  <button
                    onClick={() => setWizardOpen(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 underline font-semibold ml-2"
                  >
                    Edit Wizard
                  </button>
                </div>
              </div>

              {/* Persona Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Primary Exchange</span>
                  <span className="font-extrabold text-sm">{investorProfile.exchange}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Target Horizon</span>
                  <span className="font-extrabold text-sm">{investorProfile.targetHorizonYears} Years</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Target Corpus</span>
                  <span className="font-extrabold text-sm">
                    ₹{parseFloat(investorProfile.targetCorpus || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Drawdown Limit</span>
                  <span className="font-extrabold text-sm">{investorProfile.drawdownLimit}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Prompt to Setup Profile */
            <div
              className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDark ? 'bg-[#0d0d1e] border-white/8' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center shrink-0 text-violet-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Setup Your Multi-Step Investor Persona</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure your investment horizon, financial objectives, and risk boundaries in 4 steps.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setWizardOpen(true)}
                className="gap-2 shrink-0"
              >
                <span>Launch Profile Setup Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Profile Container ── */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all ${
              isDark
                ? 'bg-[#0d0d1e]/90 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                : 'bg-white border-gray-200 shadow-xl'
            }`}
          >
            {/* Header with Avatar */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl border mb-8 ${
                isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-violet-500/30 shrink-0">
                  {initial}
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                    <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Simulated Trader
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{displayEmail}</p>
                </div>
              </div>

              {!isEditing && (
                <Button variant="primary" size="md" onClick={handleStartEditing} className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              )}
            </div>

            {/* Form or View Section */}
            {isEditing ? (
              /* EDIT FORM USING REUSABLE FORM COMPONENTS */
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField id="edit-name" label="Full Name" required>
                    <TextInput
                      id="edit-name"
                      name="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </FormField>

                  <FormField id="edit-email" label="Email Address" required>
                    <TextInput
                      id="edit-email"
                      name="email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" size="md" onClick={handleCancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={isSaving} isLoading={isSaving} className="gap-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            ) : (
              /* VIEW MODE */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <UserIcon className="w-4 h-4 text-violet-400" />
                      <span>Full Name</span>
                    </div>
                    <p className="text-base font-semibold">{displayName}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <Mail className="w-4 h-4 text-violet-400" />
                      <span>Email ID</span>
                    </div>
                    <p className="text-base font-semibold">{displayEmail}</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Free Cash Balance</span>
                    </div>
                    <p className="text-base font-bold text-emerald-400">
                      ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (Virtual)
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span>Completed Trades</span>
                    </div>
                    <p className="text-base font-semibold text-blue-400">
                      {transactions.length} orders settled
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={logout}
                    className="w-full sm:w-auto gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Simulator</span>
                  </Button>

                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button variant="primary" size="md" className="w-full gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Go to Simulator Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfilePage;
