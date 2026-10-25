'use client';
import { Clock, Sparkles } from 'lucide-react';
export function HowItWorksSection() {
    return (<section id="how-it-works" className="bg-[#0b0b1a] py-24 border-y border-white/5 relative overflow-hidden">
      {/* Subtle ambient violet glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"/>

      <div className="max-w-screen-xl mx-auto px-6 sm:px-8 relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/10">
          <Clock className="w-8 h-8 text-violet-400 animate-pulse"/>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-4">
          <Sparkles className="w-3.5 h-3.5"/>
          <span>How It Works</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Coming Soon....
        </h2>

        <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
          We are currently preparing an interactive, step-by-step walkthrough to guide you through simulated market trading.
        </p>
      </div>
    </section>);
}
export default HowItWorksSection;
