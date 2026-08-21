import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';
import { loginUser } from '../services/api';

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('officer@lda.gop.pk');
  const [password, setPassword] = useState('officer123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('docucity_token', data.token);
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (err) {
      setError('Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/40">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">DocuCity Lahore</h1>
          <p className="text-xs text-slate-400">LDA Municipal Officer & Portal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Officer Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="officer@lda.gop.pk"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 text-center bg-rose-950/40 py-2 rounded-lg border border-rose-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          Demo Credentials: <span className="text-emerald-400 font-mono">officer@lda.gop.pk</span> / <span className="text-emerald-400 font-mono">officer123</span>
        </div>
      </div>
    </div>
  );
}
