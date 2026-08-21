import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building, KeyRound, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export function OfficerAuth({ onNavigateToPortal, onLoginSuccess }) {
  const [email, setEmail] = useState('officer@lda.gop.pk');
  const [password, setPassword] = useState('officer123');
  const [department, setDepartment] = useState('LDA');
  const [mfaCode, setMfaCode] = useState('849-201');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@')) {
      setError('Please enter a valid government email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const officerUser = {
        id: 'usr-off-202',
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'officer',
        department: department === 'LDA' ? 'Lahore Development Authority (LDA)' : `${department} Officer`
      };
      if (onLoginSuccess) {
        onLoginSuccess(officerUser);
      } else if (onNavigateToPortal) {
        onNavigateToPortal();
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-400">
          <Award className="w-4 h-4" />
          <span>Government of Punjab Enterprise Portal</span>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">DocuCity <span className="text-blue-400">Municipal</span></h1>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Restricted authentication portal for verified Municipal Officers (LDA, WASA, MCL, Urban Unit).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Self-registration disabled. Officer accounts are provisioned exclusively by Super Admin.</span>
          </div>

          {error && (
            <div className="text-xs bg-rose-950/60 border border-rose-800 text-rose-400 p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Official Department Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@lda.gop.pk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Assigned Municipal Department</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="LDA">Lahore Development Authority (LDA)</option>
                  <option value="WASA">WASA Lahore (Water & Sanitation)</option>
                  <option value="MCL">Metropolitan Corporation Lahore (MCL)</option>
                  <option value="UrbanUnit">Punjab Urban Unit</option>
                  <option value="Traffic">Lahore Traffic Police & Transport</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-medium">Security Verification / 2FA Code</label>
                <span className="text-[10px] text-blue-400">Mock Auto-Filled</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123-456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying Municipal Credentials...' : 'Authenticate Officer Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Department trust badges */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider mb-2 font-semibold">Supported Department Scopes</p>
            <div className="flex justify-center items-center space-x-2 text-[10px] text-slate-400">
              <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono">LDA</span>
              <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono">WASA</span>
              <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono">MCL</span>
              <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono">URBAN UNIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
