'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { UserProfileMenu } from '@/components/UserProfileMenu';
export function Header() {
    const { user } = useAuthStore();
    return (<header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-screen-xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2.5 group">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-105">
          <defs>
            <linearGradient id="drop-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop stopColor="#a855f7" offset="0%"/>
              <stop stopColor="#3b82f6" offset="100%"/>
            </linearGradient>
          </defs>
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" stroke="url(#drop-gradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white leading-none drop-shadow-[0_0_14px_rgba(168,85,247,0.45)]">Vital <span className="text-[#a855f7] drop-shadow-[0_0_16px_rgba(168,85,247,0.75)]">Drop</span></span>
          <span className="text-[10px] font-bold tracking-widest text-violet-400 mt-1 uppercase drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">Crash • Recover • Repeat</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (<div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              Dashboard
            </Link>
            <UserProfileMenu isDark={true}/>
          </div>) : (<div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white hover:text-violet-400 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors border border-violet-500">
              Sign Up
            </Link>
          </div>)}
      </div>
    </header>);
}
