import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp } from 'lucide-react';
export function HeroSection() {
    return (<section className="relative overflow-hidden bg-[#080814] pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none"/>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"/>
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"/>
      
      {/* Faux Grid/Graph Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdib3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02MCAwaC0xdjYwaDFWMEpNMCAwaDF2NjBIMFYwWiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgLz48L2c+PC9zdmc+')] pointer-events-none opacity-50"/>

      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md animate-[fade-in-up_0.8s_ease-out]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-sm font-medium text-violet-200">AI-Powered Risk Simulator</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-[fade-in-up_1s_ease-out]">
          Invest Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">Fear</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 animate-[fade-in-up_1.2s_ease-out]">
          Simulate, Learn, and Invest Smarter with AI. Test strategies in a safe environment before you risk real money.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fade-in-up_1.4s_ease-out]">
          <Link to="/dashboard" id="start-simulation-btn" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-950 font-semibold rounded-2xl overflow-hidden transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity"/>
            <span className="relative">Start Simulation</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 text-white font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md">
            <span>See How It Works</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">Coming Soon</span>
          </a>
        </div>

        {/* Floating Mini-Stats to add fintech feel */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-80 animate-[fade-in_2s_ease-out]">
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex justify-center items-center gap-2 text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4"/>
              <span className="font-bold">+24.5%</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg User Return</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="text-white font-bold text-lg mb-1">10k+</div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Simulations Run</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
             <div className="flex justify-center items-center gap-2 text-violet-400 mb-1">
              <Activity className="w-4 h-4"/>
              <span className="font-bold">Real-time</span>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Market Data</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="text-white font-bold text-lg mb-1">100%</div>
             <p className="text-xs text-gray-500 uppercase tracking-wider">Risk-Free</p>
          </div>
        </div>
      </div>
    </section>);
}
