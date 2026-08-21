import React from 'react';
import { Building2, ShieldCheck, User, Globe, FileText } from 'lucide-react';

export function Header({ user, onOpenUpload, activeTab, setActiveTab }) {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg text-white tracking-wide">DocuCity <span className="text-emerald-400">Lahore</span></h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">LDA AI & GIS</span>
          </div>
          <p className="text-xs text-slate-400">Lahore Municipal Bylaws & Spatial RAG System</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('gis')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'gis' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Interactive GIS Map</span>
        </button>
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'portal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Municipal Portal</span>
        </button>
      </div>

      {/* User Actions & Upload */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 font-medium transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Upload Bylaw PDF</span>
        </button>

        <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">{user ? user.name : 'Officer Tariq'}</p>
            <p className="text-[10px] text-emerald-400 font-medium">{user ? user.role.toUpperCase() : 'LDA OFFICER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
