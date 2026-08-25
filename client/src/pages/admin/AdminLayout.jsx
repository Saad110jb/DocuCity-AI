import React from 'react';
import {
  Users, Shield, Activity, Settings, LogOut, Building2, Search, Plus,
  ChevronRight, Filter, Lock, Cpu
} from 'lucide-react';

export function AdminLayout({
  user,
  onLogout,
  onOpenProvision,
  children,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  activeAdminTab = 'users',
  setActiveAdminTab
}) {
  const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between z-20 backdrop-blur-xl shrink-0">
        <div>
          {/* Logo & Admin Badge */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-wide">DocuCity <span className="text-purple-400">Admin</span></h1>
                <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase">
                  Super Admin Scope
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {/* 1. User & Role Management */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'admin-users' || activeAdminTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-purple-300" />
                <span>User & Role Management</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 2. Security & Namespace Isolation */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-security')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'admin-security' || activeAdminTab === 'security'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security & Namespace</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 3. System Monitoring & Audit Logs */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-audit')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'admin-audit' || activeAdminTab === 'audit'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>System Monitoring & Audit</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 4. Global Platform Control */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'admin-settings' || activeAdminTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Global Platform Control</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user ? user.name : 'Super Admin'}</p>
              <p className="text-[10px] text-purple-400 font-mono">ROOT_LEVEL_ACCESS</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Session: <span className="text-slate-300 font-mono">{currentTimestamp}</span></span>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 flex items-center space-x-1 font-semibold"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-8 flex items-center justify-between z-10 backdrop-blur-md shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-purple-400">Admin</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">
              {activeAdminTab === 'admin-security' && 'Security & Namespace Isolation'}
              {activeAdminTab === 'admin-audit' && 'System Monitoring & Audit Logs'}
              {activeAdminTab === 'admin-settings' && 'Global Platform Control'}
              {activeAdminTab === 'admin-users' && 'User & Role Management'}
            </span>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center space-x-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, email, CNIC..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Depts</option>
                <option value="LDA">LDA</option>
                <option value="WASA">WASA</option>
                <option value="MCL">MCL</option>
                <option value="Urban Unit">Urban Unit</option>
              </select>
            </div>

            <button
              onClick={onOpenProvision}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Officer</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
