import React, { useState } from 'react';
import { Building2, User, Mail, Lock, Phone, Briefcase, ArrowRight, Shield, Globe, CheckCircle2 } from 'lucide-react';

export function CitizenAuth({ onNavigateToGis, onLoginSuccess }) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'register'
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profession: 'Citizen'
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    if (!signInData.email || !signInData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    // Mock citizen login success
    if (onLoginSuccess) {
      onLoginSuccess({
        id: 'usr-cit-101',
        name: signInData.email.split('@')[0] || 'Citizen User',
        email: signInData.email,
        role: 'public',
        department: 'Public Citizen'
      });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!registerData.fullName || !registerData.email || !registerData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSuccessMsg('Account registered successfully! You can now sign in.');
    setTab('signin');
    setSignInData({ email: registerData.email, password: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
          <Globe className="w-4 h-4" />
          <span>Lahore Civic & Policy Portal</span>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">DocuCity <span className="text-emerald-400">Lahore</span></h1>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Public portal for citizens, architects, and urban planners to explore LDA zoning rules, FAR regulations, and land policies.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setTab('signin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'signin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Citizen Account
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center space-x-2 text-xs bg-emerald-950/60 border border-emerald-800 text-emerald-400 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="text-xs bg-rose-950/60 border border-rose-800 text-rose-400 p-3 rounded-xl">
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    placeholder="citizen@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <span>Sign In to Public Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    placeholder="Ali Raza"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="ali@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-2.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Profession / Affiliation</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    value={registerData.profession}
                    onChange={(e) => setRegisterData({ ...registerData, profession: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Citizen">Citizen / Property Owner</option>
                    <option value="Architect">Architect / Building Designer</option>
                    <option value="Urban Planner">Urban Planner / Consultant</option>
                    <option value="Researcher">Academic / Researcher</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1 block">Confirm Password</label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <span>Create Citizen Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onNavigateToGis}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center space-x-1.5 mx-auto"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Explore Interactive GIS Map without signing in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
