import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Bot, User, ChevronRight, HelpCircle } from 'lucide-react';
import { CitationCard } from './CitationCard';
import { LanguageToggle } from './LanguageToggle';

export function ChatDrawer({ messages, loading, language, setLanguage, onSendQuery, selectedZone }) {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendQuery(inputText, selectedZone ? selectedZone.zone_code : null);
    setInputText('');
  };

  const handleSuggestion = (promptText) => {
    onSendQuery(promptText, selectedZone ? selectedZone.zone_code : null);
  };

  return (
    <div
      className={`fixed right-0 top-16 bottom-0 z-20 flex transition-all duration-300 ${
        isOpen ? 'w-96' : 'w-12'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="self-center bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-l-xl shadow-xl border-y border-l border-emerald-400/40 focus:outline-none"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Drawer content */}
      {isOpen && (
        <div className="flex-1 bg-slate-900/95 border-l border-slate-800 flex flex-col backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1">
                  <span>RAG Bylaws Assistant</span>
                </h2>
                <p className="text-[10px] text-slate-400">Gemini 2.5 Policy & Gazette QA</p>
              </div>
            </div>

            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>

          {/* Zone context indicator */}
          {selectedZone && (
            <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
              <span className="truncate font-medium">Filtering Context: {selectedZone.zone_name}</span>
              <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
                {selectedZone.zone_code}
              </span>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <p className={`whitespace-pre-line leading-relaxed ${msg.language === 'ur' ? 'urdu-text text-sm' : ''}`}>
                    {msg.text}
                  </p>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-2">
                      <p className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>Verified Gazette Citations ({msg.citations.length})</span>
                      </p>
                      {msg.citations.map((cit, idx) => (
                        <CitationCard key={idx} citation={cit} />
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] text-right mt-1.5 opacity-60">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span>Searching LDA vector database & generating citations...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800">
            <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Suggested Bylaws Queries:</p>
            <div className="flex space-x-1.5 overflow-x-auto pb-1">
              {[
                'What is the FAR in Gulberg commercial plots?',
                'Height limit for residential buildings in Johar Town?',
                'Setback requirements for Mall Road Heritage zone?'
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(p)}
                  className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-full border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <span>{p}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'ur' ? 'ایل ڈی اے بائی لاز کے بارے میں سوال پوچھیں...' : 'Ask about LDA FAR, heights, setback bylaws...'}
              className={`flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 ${
                language === 'ur' ? 'urdu-text' : ''
              }`}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
