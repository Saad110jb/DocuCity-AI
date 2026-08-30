import React from 'react';
import { 
  FiGlobe, 
  FiUser, 
  FiBook, 
  FiSearch 
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import { 
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles 
} from 'react-icons/hi2';

export function Header({ activeTab, setActiveTab, citizenUser, onCitizenLogout }) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-6 sm:px-8 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md shadow-xs">
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab('gis')}
        className="flex items-center space-x-3 cursor-pointer group select-none"
      >
        <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <RiFileTextLine className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base text-neutral-900 tracking-tight flex items-center gap-1">
              DocuCity <span className="text-neutral-900 font-extrabold">AI</span>
            </h1>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2.5 py-0.5 rounded-md border border-neutral-200/80 font-bold uppercase tracking-wider flex items-center space-x-1">
              <RiShieldCheckLine className="w-3 h-3 text-neutral-700 inline mr-1" />
              <span>Smart Governance</span>
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
            Punjab GIS & Municipal Policy Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Citizen & Public Focus - Officer & Super Admin removed) */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('gis')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'gis' 
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]' 
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <FiGlobe className={`w-3.5 h-3.5 ${activeTab === 'gis' ? 'text-white' : 'text-neutral-700'}`} />
          <span>Interactive Policy Map</span>
        </button>

        <button
          onClick={() => setActiveTab('citizen-portal')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'citizen-portal' || activeTab === 'auth-citizen'
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]' 
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <FiUser className={`w-3.5 h-3.5 ${activeTab === 'citizen-portal' || activeTab === 'auth-citizen' ? 'text-white' : 'text-neutral-700'}`} />
          <span>Citizen Portal</span>
        </button>
      </div>

      {/* Account / Auth CTA */}
      <div className="flex items-center space-x-3">
        {citizenUser ? (
          <div className="flex items-center space-x-3 bg-white border border-neutral-200/90 px-3.5 py-1.5 rounded-2xl text-xs shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(citizenUser.name || 'C').substring(0, 1).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold text-neutral-900 leading-none text-xs">{citizenUser.name}</p>
              <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Verified Citizen</p>
            </div>
            <button
              onClick={onCitizenLogout}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold px-2 py-0.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer border border-rose-100"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="flex items-center space-x-1.5 bg-[#18181B] hover:bg-neutral-900 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
