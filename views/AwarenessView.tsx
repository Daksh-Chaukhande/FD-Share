
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

const AwarenessView: React.FC = () => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFact = async () => {
    setLoading(true);
    try {
      // We can use the existing sustainability tip or a new targeted prompt
      const tip = await geminiService.getSustainabilityTip();
      setAiInsight(tip);
    } catch (e) {
      setAiInsight("Every meal shared is a step toward a greener campus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  const stats = [
    {
      label: "Water Wasted",
      value: "1,000L",
      desc: "To produce just one burger",
      icon: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6zM12 16.5a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z"
    },
    {
      label: "Methane Impact",
      value: "25x",
      desc: "More potent than CO2 in landfills",
      icon: "M15.362 5.214A8.252 8.252 0 0112 21.75a8.256 8.256 0 01-4.5-1.285m8.862-15.251a8.256 8.256 0 014.5 1.285m-8.862 1.265a4.5 4.5 0 11-1.308 2.985 4.5 4.5 0 011.308-2.985z"
    },
    {
      label: "Campus Potential",
      value: "40%",
      desc: "Of food in hostels is often wasted",
      icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    }
  ];

  return (
    <div className="space-y-8 pt-4 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-emerald-900 text-white p-8 md:p-12">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 border border-emerald-500/30">
            Our Mission
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            One shared meal, <br/> 
            <span className="text-emerald-400">Zero wasted potential.</span>
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Every year, billions of tons of food are thrown away while millions go hungry. In our campus community, we have the power to change that narrative one plate at a time.
          </p>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* AI Myth Buster Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              AI Insight
            </div>
            <h2 className="text-2xl font-black text-slate-900">Why Share Instead of Trash?</h2>
            <div className={`p-6 bg-slate-50 rounded-3xl border border-slate-100 min-h-[100px] flex items-center italic text-slate-600 leading-relaxed ${loading ? 'animate-pulse' : ''}`}>
              {loading ? "Consulting Gemini..." : aiInsight}
            </div>
            <button 
              onClick={fetchFact}
              disabled={loading}
              className="px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate New Insight
            </button>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-emerald-100 to-blue-50 rounded-[40px] flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-20"></div>
            <svg className="w-32 h-32 text-emerald-600/30 group-hover:scale-110 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 px-4">
        <h3 className="text-xl font-bold text-slate-800">Ready to make a difference?</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Every item you post prevents waste and builds a stronger campus network. Start sharing today.
        </p>
      </div>
    </div>
  );
};

export default AwarenessView;
