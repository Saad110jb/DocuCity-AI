import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, Sparkles, Globe } from 'lucide-react';

export function AdminAuth({ onAdminLoginSuccess }) {
  const [email, setEmail] = useState('superadmin@docucity.lahore.gov.pk');
  const [password, setPassword] = useState('DocuCity@Lahore2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (email !== 'superadmin@docucity.lahore.gov.pk' || password !== 'DocuCity@Lahore2026!') {
      setError('Invalid Super Admin credentials provided.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const superAdminUser = {
        id: 'usr-admin-001',
        name: 'Super Admin - Punjab IT Board',
        email: 'superadmin@docucity.lahore.gov.pk',
        role: 'admin',
        department: 'Global Platform Control'
      };
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess(superAdminUser);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-purple-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Root Governance Portal</span>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Super Admin <span className="text-purple-400">Control</span></h1>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Global platform access, municipal officer provisioning, and system audit logs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 border border-purple-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-2xl text-xs text-purple-300 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Pre-Configured Demo Credentials:</p>
              <p className="font-mono text-[11px]">Email: <span className="text-purple-200">superadmin@docucity.lahore.gov.pk</span></p>
              <p className="font-mono text-[11px]">Password: <span className="text-purple-200">DocuCity@Lahore2026!</span></p>
            </div>
          </div>

          {error && (
            <div className="text-xs bg-rose-950/60 border border-rose-800 text-rose-400 p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Super Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Root Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating Super Admin...' : 'Authenticate & Open Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center flex items-center justify-between text-[10px] text-slate-500">
            <span>Security: <span className="text-purple-400 font-mono">SUPER_ADMIN</span></span>
            <a href="/" className="text-purple-400 hover:underline flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Public GIS Map</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
