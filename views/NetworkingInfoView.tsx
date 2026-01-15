
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const NetworkingInfoView: React.FC = () => {
  const [hostIp, setHostIp] = useState<string>('Detecting...');
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHostIp(window.location.hostname);
    const check = async () => {
      const live = await apiService.checkBackend();
      setIsBackendLive(live);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  const shareUrl = `http://${hostIp === 'localhost' ? 'YOUR_LOCAL_IP' : hostIp}:5173`;

  const copyToClipboard = () => {
    if (hostIp === 'localhost') {
      alert("Please run 'npm run dev -- --host' and use the IP address shown in your terminal.");
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-4 max-w-2xl mx-auto space-y-6 pb-20">
      {/* Network Status Header */}
      <div className={`p-8 rounded-[40px] shadow-2xl transition-all duration-500 border-2 ${
        isBackendLive ? 'bg-emerald-950 border-emerald-400' : 'bg-slate-900 border-slate-700'
      }`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${isBackendLive ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Connection Hub</h1>
              <p className={`text-sm font-bold uppercase tracking-widest ${isBackendLive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isBackendLive ? '● Shared Network Active' : '○ Offline / Local Mode'}
              </p>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Receiver's Entrance URL</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xl font-mono font-bold text-white truncate">
                  {shareUrl}
                </p>
                <button 
                  onClick={copyToClipboard}
                  className="shrink-0 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-90"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>
              </div>
              {hostIp === 'localhost' && (
                <p className="mt-3 text-[10px] text-amber-400 font-bold uppercase tracking-tight">
                  ⚠ Warning: "localhost" won't work on other PCs. Use the IP address from your terminal.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role: Donor */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">A</div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight">PC-A: The Donor</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">1.</span>
              Run <code>node server.js</code> in terminal.
            </li>
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">2.</span>
              Run <code>npm run dev -- --host</code>.
            </li>
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">3.</span>
              Open <b>localhost:5173</b> & Post Food.
            </li>
          </ul>
        </div>

        {/* Role: Receiver */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">B</div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight">PC-B: The Receiver</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">1.</span>
              Join the <b>SAME Wi-Fi</b> as PC-A.
            </li>
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">2.</span>
              Type the URL above into your browser.
            </li>
            <li className="flex gap-3 text-sm text-slate-600 font-medium">
              <span className="text-emerald-500 font-bold">3.</span>
              Go to <b>Explore</b> and claim food.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex gap-5 items-start">
        <div className="p-3 bg-emerald-200 text-emerald-700 rounded-2xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-emerald-900 uppercase tracking-tight">How it works</h4>
          <p className="text-sm text-emerald-800/70 leading-relaxed">
            When you run the app with <code>--host</code>, your computer acts as a mini-server for your local area. Any device (phone, laptop, tablet) that enters your IP address can interact with the same database in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkingInfoView;
