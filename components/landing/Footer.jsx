import Link from 'next/link';

export function Footer() {
    return (<footer className="bg-[#040409] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                <defs>
                  <linearGradient id="drop-gradient-footer" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop stopColor="#a855f7" offset="0%"/>
                    <stop stopColor="#3b82f6" offset="100%"/>
                  </linearGradient>
                </defs>
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" stroke="url(#drop-gradient-footer)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white tracking-tight leading-none drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">Vital <span className="text-[#a855f7] drop-shadow-[0_0_16px_rgba(168,85,247,0.7)]">Drop</span></h2>
                <span className="text-[10px] font-bold tracking-widest text-violet-400 mt-1 uppercase drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">Crash • Recover • Repeat</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Simulate, Learn, and Invest Smarter.</p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <Link href="/dashboard" className="hover:text-violet-400 transition-colors">Demo</Link>
          </div>
        </div>
        
        <div className="block h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"/>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Vital Drop. For educational and simulation purposes only.</p>
        </div>
      </div>
    </footer>);
}
