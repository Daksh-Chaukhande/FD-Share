
import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: (email: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-emerald-900/10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block p-4 bg-emerald-600 rounded-3xl shadow-lg shadow-emerald-200 mb-2">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Food Share</h1>
          <p className="text-slate-500 font-medium">Campus surplus sharing made easy.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">College Email</label>
            <input 
              required
              type="email" 
              placeholder="student@university.edu"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-emerald-600 hover:underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Join now" : "Already a member? Log in"}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 font-medium max-w-xs text-center leading-relaxed">
        By joining Food Share, you agree to help reduce campus food waste responsibly.
      </p>
    </div>
  );
};

export default AuthView;