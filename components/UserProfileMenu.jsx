'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User as UserIcon, LogOut, ChevronDown, Shield, Mail, X, Wallet, CheckCircle2, Edit3, Save, AlertCircle, Loader2 } from 'lucide-react';
export function UserProfileMenu({ isDark = true }) {
    const { user, setUser, logout } = useAuthStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    // Edit profile states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const router = useRouter();
    const menuRef = useRef(null);
    // Sync user from session if not present in store
    useEffect(() => {
        if (!user) {
            fetch('/api/auth/me')
                .then((res) => res.json())
                .then((data) => {
                if (data.user) {
                    setUser(data.user);
                }
            })
                .catch(() => { });
        }
    }, [user, setUser]);
    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);
    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await fetch('/api/auth/logout', { method: 'POST' });
            logout();
            setDropdownOpen(false);
            setProfileModalOpen(false);
            router.push('/login');
        }
        catch (error) {
            console.error('Logout failed:', error);
            logout();
            router.push('/login');
        }
        finally {
            setLoggingOut(false);
        }
    };
    const handleOpenProfile = () => {
        setDropdownOpen(false);
        router.push('/profile');
    };
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
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }
            setUser(data.user);
            setIsEditing(false);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(null), 4000);
        }
        catch (err) {
            setErrorMsg(err.message || 'Failed to update profile');
        }
        finally {
            setIsSaving(false);
        }
    };
    const displayName = user?.name || 'Investor';
    const displayEmail = user?.email || 'investor@vitaldrop.ai';
    const initial = displayName.charAt(0).toUpperCase() || 'U';
    return (<>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button onClick={() => setDropdownOpen((prev) => !prev)} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${isDark
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:text-white'
            : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 hover:text-gray-900'}`} aria-label="User profile and options" aria-expanded={dropdownOpen}>
          {/* Avatar circle */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-violet-500/30">
            {initial}
          </div>
          <span className="max-w-[120px] truncate hidden sm:inline">{displayName}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`}/>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (<div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${isDark
                ? 'bg-[#0f0f20]/95 border-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                : 'bg-white/95 border-gray-200 text-gray-900 shadow-xl'}`}>
            {/* User Header Summary */}
            <div className={`p-3 rounded-xl mb-1.5 border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-500/30 shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{displayName}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{displayEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-1">
              <button onClick={handleOpenProfile} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isDark
                ? 'text-gray-300 hover:text-white hover:bg-white/10'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}>
                <UserIcon className="w-4 h-4 text-violet-400"/>
                <span>My Profile</span>
              </button>

              <button onClick={handleLogout} disabled={loggingOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50">
                <LogOut className="w-4 h-4"/>
                <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
              </button>
            </div>
          </div>)}
      </div>

      {/* Full Profile Modal */}
      {profileModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-8 backdrop-blur-2xl animate-in zoom-in-95 duration-200 ${isDark
                ? 'bg-[#0d0d1e] border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
                : 'bg-white border-gray-200 text-gray-900 shadow-2xl'}`}>
            {/* Header / Close */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <UserIcon className="w-4 h-4"/>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {isEditing ? 'Edit Profile' : 'My Profile'}
                </h3>
              </div>
              <button onClick={() => {
                setProfileModalOpen(false);
                setIsEditing(false);
                setErrorMsg(null);
            }} className={`p-2 rounded-xl border transition-colors ${isDark
                ? 'border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
                : 'border-gray-200 hover:bg-gray-100 text-gray-500'}`} aria-label="Close modal">
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Notification messages */}
            {successMsg && (<div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0"/>
                <span>{successMsg}</span>
              </div>)}

            {errorMsg && (<div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0"/>
                <span>{errorMsg}</span>
              </div>)}

            {/* Profile View or Edit Form */}
            {isEditing ? (
            /* ── EDIT FORM ── */
            <form onSubmit={handleSaveProfile} className="py-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Rahul Sharma" className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                    ? 'bg-white/5 border-white/10 focus:border-violet-500 focus:bg-white/10 text-white placeholder:text-gray-600'
                    : 'bg-gray-50 border-gray-200 focus:border-violet-500 focus:bg-white text-gray-900 placeholder:text-gray-400'}`} required/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="e.g. rahul@example.com" className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isDark
                    ? 'bg-white/5 border-white/10 focus:border-violet-500 focus:bg-white/10 text-white placeholder:text-gray-600'
                    : 'bg-gray-50 border-gray-200 focus:border-violet-500 focus:bg-white text-gray-900 placeholder:text-gray-400'}`} required/>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button type="button" onClick={handleCancelEditing} disabled={isSaving} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark
                    ? 'border-white/10 hover:bg-white/5 text-gray-300'
                    : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 disabled:opacity-50">
                    {isSaving ? (<>
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        <span>Saving...</span>
                      </>) : (<>
                        <Save className="w-4 h-4"/>
                        <span>Save Changes</span>
                      </>)}
                  </button>
                </div>
              </form>) : (
            /* ── VIEW MODE ── */
            <div className="py-6 space-y-6">
                {/* Profile Card Summary */}
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/8' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/30 shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold truncate">{displayName}</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="w-3 h-3"/>
                          Active
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{displayEmail}</p>
                    </div>
                  </div>

                  {/* Edit button */}
                  <button onClick={handleStartEditing} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-400 hover:bg-violet-500/20 transition-all shrink-0">
                    <Edit3 className="w-3.5 h-3.5"/>
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Detail fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50/70 border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <UserIcon className="w-3.5 h-3.5 text-violet-400"/>
                        <span>Name</span>
                      </div>
                      <button onClick={handleStartEditing} className="text-[11px] text-violet-400 hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium truncate">{displayName}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50/70 border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <Mail className="w-3.5 h-3.5 text-violet-400"/>
                        <span>Email</span>
                      </div>
                      <button onClick={handleStartEditing} className="text-[11px] text-violet-400 hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium truncate">{displayEmail}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50/70 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-400"/>
                      <span>Security</span>
                    </div>
                    <p className="text-sm font-medium">Session Authenticated</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/6' : 'bg-gray-50/70 border-gray-100'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400"/>
                      <span>Virtual Portfolio</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">₹10,00,000 (Sandbox)</p>
                  </div>
                </div>
              </div>)}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button onClick={handleLogout} disabled={loggingOut} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                <LogOut className="w-4 h-4"/>
                <span>{loggingOut ? 'Logging out...' : 'Log Out of Account'}</span>
              </button>

              <button onClick={() => {
                setProfileModalOpen(false);
                setIsEditing(false);
                setErrorMsg(null);
            }} className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                Close
              </button>
            </div>
          </div>
        </div>)}
    </>);
}
export default UserProfileMenu;
