import React from 'react';

export function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'ur'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        اردو (Urdu)
      </button>
    </div>
  );
}
