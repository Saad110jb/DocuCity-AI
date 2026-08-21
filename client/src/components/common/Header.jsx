import React from 'react';
import { Building2, Globe, User, LogIn } from 'lucide-react';

export function Header({ activeTab, setActiveTab, citizenUser, onCitizenLogout }) {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab('gis')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg text-white tracking-wide">DocuCity <span className="text-emerald-400">Lahore</span></h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">Public Policy GIS</span>
          </div>
          <p className="text-xs text-slate-400">Lahore Municipal Bylaws & Spatial RAG System</p>
        </div>
      </div>

      {/* Strictly Public Citizen Navigation Tabs */}
      <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800 space-x-1">
        <button
          onClick={() => setActiveTab('gis')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'gis' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Interactive Policy Map</span>
        </button>

        <button
          onClick={() => setActiveTab('auth-citizen')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'auth-citizen' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Citizen Portal</span>
        </button>
      </div>

      {/* Citizen Profile Status */}
      <div className="flex items-center space-x-3">
        {citizenUser ? (
          <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
              {citizenUser.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-200">{citizenUser.name}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Citizen</p>
            </div>
            <button
              onClick={onCitizenLogout}
              className="text-[10px] text-slate-400 hover:text-rose-400 ml-2 font-semibold"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('auth-citizen')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Citizen Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
