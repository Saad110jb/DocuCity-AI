import React from 'react';
import { 
  FiCompass, 
  FiBarChart2, 
  FiAward 
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import { 
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2';

export function OfficerHeader({ 
  activeView = 'portal', 
  setActiveView, 
  assignedDepartment = 'LDA', 
  officerUser, 
  onOfficerLogout 
}) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs backdrop-blur-md">
      {/* Brand & Department */}
      <div 
        onClick={() => setActiveView('portal')}
        className="flex items-center space-x-3.5 cursor-pointer select-none group"
      >
        <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <RiFileTextLine className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base text-neutral-900 tracking-tight">
              DocuCity <span className="font-extrabold">Officer</span>
            </h1>
            <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-neutral-200 uppercase tracking-wider">
              {assignedDepartment} SCOPE
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
            MUNICIPAL GOVERNANCE & STATUTORY INGESTION
          </p>
        </div>
      </div>

      {/* 4 Center Navigation Tabs with Black Highlight for the Active Tab */}
      <div className="hidden md:flex items-center space-x-2">
        {/* 1. Spatial GIS */}
        <button
          onClick={() => setActiveView('gis')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'gis'
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <FiCompass className={`w-3.5 h-3.5 ${activeView === 'gis' ? 'text-white' : 'text-neutral-700'}`} />
          <span>Spatial GIS</span>
        </button>

        {/* 2. OCR Studio */}
        <button
          onClick={() => setActiveView('ocr')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'ocr'
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <RiFileTextLine className={`w-3.5 h-3.5 ${activeView === 'ocr' ? 'text-white' : 'text-neutral-700'}`} />
          <span>OCR Studio</span>
        </button>

        {/* 3. Analytics */}
        <button
          onClick={() => setActiveView('analytics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'analytics'
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <FiBarChart2 className={`w-3.5 h-3.5 ${activeView === 'analytics' ? 'text-white' : 'text-neutral-700'}`} />
          <span>Analytics</span>
        </button>

        {/* 4. Zoning Certificate */}
        <button
          onClick={() => setActiveView('export')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'export'
              ? 'bg-[#18181B] text-white shadow-sm font-bold scale-[1.02]'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90'
          }`}
        >
          <FiAward className={`w-3.5 h-3.5 ${activeView === 'export' ? 'text-white' : 'text-neutral-700'}`} />
          <span>Zoning Certificate</span>
        </button>
      </div>

      {/* Right Side: Officer Profile & Logout */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 bg-white border border-neutral-200/90 px-3.5 py-1.5 rounded-2xl text-xs shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#18181B] text-white font-bold text-xs flex items-center justify-center">
            {(officerUser?.name || 'O').charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-bold text-neutral-900 leading-none text-xs">{officerUser?.name || 'OFFICER'}</p>
            <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{assignedDepartment} Department</p>
          </div>
        </div>

        <button
          onClick={onOfficerLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer"
        >
          <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-rose-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
