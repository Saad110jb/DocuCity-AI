import React, { useState } from 'react';
import { 
  FiUsers, 
  FiShield, 
  FiActivity, 
  FiSettings, 
  FiLogOut, 
  FiSearch, 
  FiPlus, 
  FiChevronRight, 
  FiFilter, 
  FiLock 
} from 'react-icons/fi';
import { 
  RiShieldCheckLine, 
  RiGovernmentLine,
  RiBuildingLine 
} from 'react-icons/ri';
import { ProvisionModal } from './ProvisionModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleOpenProvisionModal = () => {
    if (onOpenProvision) {
      onOpenProvision();
    }
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-[#F4F6F8] text-neutral-900 flex font-sans overflow-hidden selection:bg-neutral-900 selection:text-white">
      
      {/* ── Sidebar Navigation (Locked Height & Visible Footer) ── */}
      <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between z-20 shrink-0 h-full shadow-xs">
        
        {/* Top Section: Logo & Nav Links */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Logo & Admin Badge */}
          <div className="p-6 border-b border-neutral-100 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-sm text-white shrink-0">
                <RiBuildingLine className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-neutral-900 tracking-tight flex items-center gap-1">
                  DocuCity <span className="text-neutral-900 font-extrabold">Admin</span>
                </h1>
                <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2.5 py-0.5 rounded-md border border-neutral-200/80 font-bold uppercase tracking-wider flex items-center space-x-1 mt-0.5">
                  <RiShieldCheckLine className="w-3 h-3 text-neutral-700 inline mr-1" />
                  <span>Super Admin</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {/* 1. User & Role Management */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-users')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeAdminTab === 'admin-users' || activeAdminTab === 'users'
                  ? 'bg-neutral-900 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiUsers className="w-4 h-4" />
                <span>User & Role Management</span>
              </div>
              <FiChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 2. Security & Namespace Isolation */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-security')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeAdminTab === 'admin-security' || activeAdminTab === 'security'
                  ? 'bg-neutral-900 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiShield className="w-4 h-4" />
                <span>Security & Namespace</span>
              </div>
              <FiChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 3. System Monitoring & Audit Logs */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-audit')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeAdminTab === 'admin-audit' || activeAdminTab === 'audit'
                  ? 'bg-neutral-900 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiActivity className="w-4 h-4" />
                <span>System Monitoring & Audit</span>
              </div>
              <FiChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 4. Global Platform Control */}
            <button
              onClick={() => setActiveAdminTab && setActiveAdminTab('admin-settings')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeAdminTab === 'admin-settings' || activeAdminTab === 'settings'
                  ? 'bg-neutral-900 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiSettings className="w-4 h-4" />
                <span>Global Platform Control</span>
              </div>
              <FiChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>

        {/* ── Sidebar Footer (ALWAYS LOCKED & VISIBLE) ── */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 space-y-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FiLock className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-neutral-900 truncate">{user ? user.name : 'Super Admin - Punjab IT Board'}</p>
              <p className="text-[10px] text-neutral-500 font-mono font-semibold">ROOT_LEVEL_ACCESS</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
            <span>Session: <span className="text-neutral-800 font-mono font-semibold">{currentTimestamp}</span></span>
            <button
              onClick={onLogout}
              className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-semibold transition-colors cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area (Scrolls Independently) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-neutral-200/80 px-8 flex items-center justify-between z-10 backdrop-blur-md shrink-0 shadow-xs">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-neutral-500">Admin Portal</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-bold">
              {activeAdminTab === 'admin-security' && 'Security & Namespace Isolation'}
              {activeAdminTab === 'admin-audit' && 'System Monitoring & Audit Logs'}
              {activeAdminTab === 'admin-settings' && 'Global Platform Control'}
              {activeAdminTab === 'admin-users' && 'User & Role Management'}
            </span>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center space-x-3">
            <div className="relative w-64">
              <FiSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                placeholder="Search user, email, CNIC..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-all font-sans"
              />
            </div>

            <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1">
              <FiFilter className="w-3.5 h-3.5 text-neutral-500 mr-1.5" />
              <select
                value={departmentFilter || 'All'}
                onChange={(e) => setDepartmentFilter && setDepartmentFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All">All Depts</option>
                <option value="LDA">LDA</option>
                <option value="WASA">WASA</option>
                <option value="MCL">MCL</option>
                <option value="Urban Unit">Urban Unit</option>
              </select>
            </div>

            {/* + Provision Officer Button */}
            <button
              onClick={handleOpenProvisionModal}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Provision Officer</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* Global Provision Modal rendered at root of layout */}
      <ProvisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProvisionSuccess={(officer) => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
