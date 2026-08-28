import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Sparkles, Bot, User, ChevronRight,
  HelpCircle, MapPin, X, Compass, ShieldCheck, Zap, Layers, BookOpen
} from 'lucide-react';
import { CitationCard } from './CitationCard';
import { LanguageToggle } from './LanguageToggle';
import { PdfCitationViewerModal } from '../common/PdfCitationViewerModal';

export function ChatDrawer({
  messages,
  loading,
  language,
  setLanguage,
  onSendQuery,
  selectedZone,
  onClearZone,
  suggestedPrompts = []
}) {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [activeCitationPdf, setActiveCitationPdf] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendQuery(inputText, selectedZone ? selectedZone.zone_code : null);
    setInputText('');
  };

  const handleSuggestion = (promptText) => {
    if (loading) return;
    onSendQuery(promptText, selectedZone ? selectedZone.zone_code : null);
  };

  const isUrdu = language === 'ur';

  return (
    <>
      <div
        className={`fixed right-0 top-16 bottom-0 z-20 flex transition-all duration-300 ${
          isOpen ? 'w-[420px]' : 'w-12'
        }`}
      >
        {/* Toggle button on left side of drawer */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-center bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-l-2xl shadow-2xl border-y border-l border-emerald-400/40 focus:outline-none transition-all flex items-center justify-center"
          title={isOpen ? 'Collapse Assistant' : 'Expand Assistant'}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Drawer content */}
        {isOpen && (
          <div className="flex-1 bg-slate-900/98 border-l border-slate-800 flex flex-col backdrop-blur-2xl shadow-2xl overflow-hidden font-sans">
            
            {/* ── Drawer Header ────────────────────────────────────────────── */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                    <span>RAG Bylaws Assistant</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                      Gemini 1.5
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">Grounded Legal Citations & Zero Hallucination</p>
                </div>
              </div>

              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>

            {/* ── Active Spatial Location Context Filter Banner ─────────────── */}
            {selectedZone ? (
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/30 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 animate-fade-in">
                <div className="flex items-center space-x-2 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                      Spatial Filter Active
                    </div>
                    <div className="font-bold text-white text-xs truncate max-w-[240px]">
                      {selectedZone.zone_name || selectedZone.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedZone.far ? `FAR: ${selectedZone.far}` : ''}
                      {selectedZone.max_height_ft ? ` · Height: ${selectedZone.max_height_ft}ft` : ''}
                    </div>
                  </div>
                </div>

                {onClearZone && (
                  <button
                    onClick={onClearZone}
                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all shrink-0 ml-2"
                    title="Reset to City-Wide Scope"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-950/40 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Scope: All Lahore Metropolitan District</span>
                </div>
                <span className="text-[10px] text-slate-500">Click map to filter</span>
              </div>
            )}

            {/* ── Messages List ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600/30 to-blue-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                        : msg.isContextBanner
                        ? 'bg-slate-950 border border-emerald-500/40 text-slate-200 rounded-bl-none shadow-emerald-950/30'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-none font-sans'
                    }`}
                  >
                    <p className={`whitespace-pre-line ${isUrdu ? 'text-sm leading-relaxed text-right' : ''}`}>
                      {msg.text}
                    </p>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <HelpCircle className="w-3 h-3" />
                            <span>Verified Gazette Citations ({msg.citations.length})</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-normal">One-Click PDF Verification</span>
                        </div>
                        {msg.citations.map((cit, idx) => (
                          <CitationCard
                            key={idx}
                            citation={cit}
                            onOpenPdf={(citationToView) => setActiveCitationPdf(citationToView)}
                          />
                        ))}
                      </div>
                    )}

                    {msg.engine && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>{msg.engine.split('+')[0]}</span>
                        {msg.spatialFilter && <span className="text-emerald-400 truncate max-w-[140px]">📍 {msg.spatialFilter}</span>}
                      </div>
                    )}

                    <span className="block text-[9px] text-right mt-1 opacity-50 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2.5 text-xs text-emerald-400 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 animate-pulse font-mono">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                  <span>
                    {isUrdu
                      ? 'گوگل جیمنی 1.5 فلیش اور ایل ڈی اے ڈیٹا بیس سے جواب تیار ہو رہا ہے...'
                      : 'Synthesizing verified policy bylaws via Google Gemini 1.5 Flash...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Suggested Prompts Chips ───────────────────────────────────── */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 shrink-0">
              <p className="text-[10px] text-slate-400 mb-1.5 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isUrdu ? 'مجوزہ بلدیاتی سوالات:' : 'Suggested Bylaws Queries:'}</span>
              </p>
              <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(suggestedPrompts && suggestedPrompts.length > 0 ? suggestedPrompts : [
                  'What is the FAR in Gulberg commercial plots?',
                  'Height limit for residential buildings in Johar Town?',
                  'Setback requirements for Mall Road Heritage zone?'
                ]).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(p)}
                    disabled={loading}
                    className="whitespace-nowrap bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 text-[10px] px-3 py-1.5 rounded-full border border-slate-800 transition-all flex items-center space-x-1 shrink-0 font-medium"
                  >
                    <span className="truncate max-w-[200px]">{p}</span>
                    <ChevronRight className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── User Input Box ───────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isUrdu
                    ? `${selectedZone ? (selectedZone.zone_name || 'منتخب علاقے') : 'لاہور'} کے بائی لاز کے بارے میں سوال پوچھیں...`
                    : `Ask about ${selectedZone ? (selectedZone.zone_name || 'this area') : 'LDA'} FAR, heights, setbacks...`
                }
                dir={isUrdu ? 'rtl' : 'ltr'}
                className={`flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans transition-all ${
                  isUrdu ? 'text-right' : ''
                }`}
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* One-Click PDF Preview Modal */}
      <PdfCitationViewerModal
        isOpen={Boolean(activeCitationPdf)}
        citation={activeCitationPdf}
        onClose={() => setActiveCitationPdf(null)}
      />
    </>
  );
}
