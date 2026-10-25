import Link from 'next/link';

export const metadata = {
  title: '404 - Not Found | Vital Drop',
  description: 'Page or ticker not found on Vital Drop.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080814] text-white flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="relative max-w-lg w-full p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0d0d1e]/90 backdrop-blur-2xl shadow-2xl space-y-6">
        {/* Glowing Drop Icon Graphic */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600/30 blur-2xl rounded-full pointer-events-none" />
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
            >
              <defs>
                <linearGradient id="drop-404-app" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop stopColor="#a855f7" offset="0%" />
                  <stop stopColor="#ef4444" offset="100%" />
                </linearGradient>
              </defs>
              <path
                d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
                stroke="url(#drop-404-app)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            Error 404 • Page Not Found
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 tracking-tight">
            Lost in the Market
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            The requested page does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/30"
          >
            Go to Investment Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-bold text-sm transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
