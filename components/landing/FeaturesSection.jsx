import { Activity, Brain, PieChart, ShieldAlert } from 'lucide-react';
export function FeaturesSection() {
    const features = [
        {
            title: "Risk Simulation",
            description: "Test run varied investment portfolios over historical crunches like the 2008 crisis or 2020 pandemic to visualize hard data.",
            icon: <Activity className="w-6 h-6 text-blue-400"/>,
            colSpan: "md:col-span-2",
            gradient: "from-blue-600/10 to-transparent"
        },
        {
            title: "AI Explainer",
            description: "Don't know what 'Beta' or 'P/E Ratio' means? Our AI breaks it down in simple, digestible plain English.",
            icon: <Brain className="w-6 h-6 text-violet-400"/>,
            colSpan: "md:col-span-1",
            gradient: "from-violet-600/10 to-transparent"
        },
        {
            title: "Loss Probability",
            description: "Advanced algorithms calculate specific percentile risks of portfolio drawdowns, so you know exactly what to mathematically expect.",
            icon: <ShieldAlert className="w-6 h-6 text-rose-400"/>,
            colSpan: "md:col-span-1",
            gradient: "from-rose-600/10 to-transparent"
        },
        {
            title: "Scenario Testing",
            description: "Adjust inflation parameters, interest rates, and investment time horizons to project customized future returns instantly.",
            icon: <PieChart className="w-6 h-6 text-emerald-400"/>,
            colSpan: "md:col-span-2",
            gradient: "from-emerald-600/10 to-transparent"
        }
    ];
    return (<section className="bg-[#080814] py-24 relative">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Everything you need <br /><span className="text-gray-500">to invest intelligently.</span>
          </h2>
        </div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feat, i) => (<div key={i} className={`rounded-3xl border border-white/5 bg-[#121226] p-8 relative overflow-hidden group hover:border-white/20 transition-all ${feat.colSpan}`}>
              <div className={`absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 ${feat.gradient}`}/>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                  {feat.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 mt-auto">{feat.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {feat.description}
                </p>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
}
