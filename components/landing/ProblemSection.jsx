import { AlertTriangle, TrendingDown, BookX } from 'lucide-react';
export function ProblemSection() {
    const problems = [
        {
            icon: <TrendingDown className="w-6 h-6 text-red-400"/>,
            title: "Fear of Losing Money",
            description: "Market volatility turns many potential investors away. The fear of seeing hard-earned savings drop prevents wealth building.",
            bgContent: "bg-red-500/5"
        },
        {
            icon: <BookX className="w-6 h-6 text-orange-400"/>,
            title: "Lack of Knowledge",
            description: "Financial jargon and complex charts make investing feel like a closed club. Without guidance, it's easy to make costly mistakes.",
            bgContent: "bg-orange-500/5"
        },
        {
            icon: <AlertTriangle className="w-6 h-6 text-yellow-400"/>,
            title: "No Safe Practice",
            description: "Most platforms demand real money upfront. There's no realistic sandbox to test strategies against actual market conditions.",
            bgContent: "bg-yellow-500/5"
        }
    ];
    return (<section className="bg-[#080814] py-24 relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Why People Don't Invest
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We identified the three biggest roadblocks keeping everyday people from growing their wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (<div key={i} className={`p-8 rounded-3xl border border-white/10 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/20 ${problem.bgContent}`}>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </div>))}
        </div>
      </div>
    </section>);
}
