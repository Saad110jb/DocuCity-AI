import React from 'react';

export function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-xs">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-neutral-900 text-white shadow-xs font-bold'
            : 'text-neutral-500 hover:text-neutral-900'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer font-serif ${
          language === 'ur'
            ? 'bg-neutral-900 text-white shadow-xs font-bold'
            : 'text-neutral-500 hover:text-neutral-900'
        }`}
      >
        اردو
      </button>
    </div>
  );
}
