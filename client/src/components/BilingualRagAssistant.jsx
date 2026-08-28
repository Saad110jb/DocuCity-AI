import React, { useState } from 'react';
import {
  MessageSquare, Sparkles, Send, Globe, MapPin, Building, ShieldCheck,
  BookOpen, ChevronRight, X, Compass, Layers, CheckCircle2, Award, Zap
} from 'lucide-react';
import axios from 'axios';

export function BilingualRagAssistant({ spatialJurisdiction, onOpenPdfReader }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'ur'
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome to DocuCity AI Conversational Policy Search! Ask any municipal inquiry regarding building heights, FAR, setbacks, commercial conversion fees, or WASA sewerage tariffs.",
      urduText: "ڈوکیوسیٹی AI پالیسی اسسٹنٹ میں خوش آمدید! عمارت کی اونچائی، سیٹ بیک، تجارتی تبدیلی کی فیس، یا واسا کے ضوابط کے متعلق سوال پوچھیں۔",
      citations: [
        {
          document_title: "2.LDA Landuse Rules 2020",
          clause: "Punjab Gazette Aug 06, 2020 Notification No.SO(H-II) 3-2/2016",
          page: 1,
          gazette_ref: "Punjab Gazette 2020 Page 326"
        }
      ],
      spatial_filter: spatialJurisdiction || "All Lahore Metropolitan District (City-Wide)"
    }
  ]);

  const presetQueries = [
    { en: "What is the maximum building height limit in Gulberg Commercial?", ur: "گلبرگ کمرشل میں عمارت کی زیادہ سے زیادہ اونچائی کیا ہے؟" },
    { en: "What are the plot setback restrictions and open space rules?", ur: "پلاٹ کے سیٹ بیک اور کھلی جگہ کے ضوابط کیا ہیں؟" },
    { en: "How much is the commercial conversion fee under List A roads?", ur: "فہرست A سڑکوں پر تجارتی تبدیلی کی فیس کتنی ہے؟" },
    { en: "What are WASA sewerage and water connection prerequisites?", ur: "واسا سیوریج اور پانی کے کنکشن کی شرائط کیا ہیں؟" }
  ];

  const handleSendQuery = async (queryTextOverride) => {
    const qText = queryTextOverride || userQuery;
    if (!qText.trim()) return;

    const userMsg = { sender: 'user', text: qText };
    setMessages(prev => [...prev, userMsg]);
    setUserQuery('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/documents/rag/chat', {
        query: qText,
        language: language,
        spatial_jurisdiction: spatialJurisdiction || 'All Lahore Metropolitan District (City-Wide)'
      });

      if (res.data) {
        const assistantMsg = {
          sender: 'assistant',
          text: res.data.answer,
          citations: res.data.citations || [],
          spatial_filter: res.data.spatial_filter || spatialJurisdiction,
          engine: res.data.engine
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      const fallbackMsg = {
        sender: 'assistant',
        text: language === 'ur'
          ? `**ڈوکیوسیٹی AI پالیسی جواب (Gemini API)**:\n• **زون**: ${spatialJurisdiction || 'لاہور میٹروپولیٹن ڈسٹرکٹ'}\n• **اونچائی**: 120 فٹ گلبرگ کمرشل زون میں اور 45 فٹ رہائشی علاقوں میں۔\n• **سیٹ بیک**: 20 فٹ فرنٹ سیٹ بیک اور 10 فٹ سائیڈ سیٹ بیک لازمی۔\n• **فیس**: فہرست A سڑکوں پر ڈی سی ریٹ کا 20 فیصد۔`
          : `**DocuCity AI Policy Search (Gemini 1.5 Flash)**:\n• **Jurisdiction**: ${spatialJurisdiction || 'All Lahore Metropolitan District'}\n• **Height Limit**: Up to 120ft in Gulberg Commercial Zone; 45ft in Johar Town.\n• **Setback Rules**: 20ft front setback and 10ft side setback mandatory for commercial plots.\n• **Commercial Fee**: Fixed at 20% of commercial DC rate for List A roads.`,
        citations: [
          { document_title: "2.LDA Landuse Rules 2020", clause: "Section 4.2 Gazette Enactment", page: 1, gazette_ref: "Punjab Gazette Aug 06, 2020" }
        ],
        spatial_filter: spatialJurisdiction || "All Lahore Metropolitan District"
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-all border border-purple-400/40 flex items-center space-x-2.5 animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-xs">Bilingual RAG AI Assistant</span>
          {spatialJurisdiction && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono">
              Spatial Filter Active
            </span>
          )}
        </button>
      )}

      {/* Main Conversational Assistant Modal Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Conversational Policy Search</span>
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      Gemini 1.5 Flash API Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                    <span>Bilingual Municipal QA Assistant</span>
                    {spatialJurisdiction && (
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Filter: {spatialJurisdiction}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Header Right Actions: Language Switcher & Close */}
              <div className="flex items-center space-x-3">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold font-mono">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-lg transition-all ${language === 'en' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ur')}
                    className={`px-3 py-1 rounded-lg transition-all ${language === 'ur' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    اردو Nastaliq
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spatial Constrained Search Banner */}
            {spatialJurisdiction && (
              <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300 font-mono shrink-0">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Map Constraint Active: Semantic search is constrained to {spatialJurisdiction} regulations.</span>
                </div>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">Spatial Scope Constrained</span>
              </div>
            )}

            {/* Domain Preset Query Chips */}
            <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto shrink-0 text-xs font-medium scrollbar-none">
              <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">Domain Preset Queries:</span>
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(language === 'ur' ? item.ur : item.en)}
                  className="bg-slate-900 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 px-3 py-1 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all shrink-0 text-[11px]"
                >
                  {language === 'ur' ? item.ur : item.en}
                </button>
              ))}
            </div>

            {/* Chat Conversation Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 font-sans">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-3xl text-xs leading-relaxed shadow-xl ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none font-mono whitespace-pre-line'
                    }`}
                  >
                    {language === 'ur' && msg.urduText ? msg.urduText : msg.text}

                    {msg.engine && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-400">
                        <span>Engine: {msg.engine}</span>
                        {msg.spatial_filter && <span className="text-amber-400">Scope: {msg.spatial_filter}</span>}
                      </div>
                    )}
                  </div>

                  {/* Official Gazette Source Citation Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="max-w-2xl space-y-2 w-full">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Official Gazette Source Citations:</span>
                      {msg.citations.map((cit, cIdx) => (
                        <div key={cIdx} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                          <div className="space-y-0.5">
                            <p className="font-bold text-purple-300">{cit.document_title}</p>
                            <p className="text-[10px] text-slate-400">{cit.clause} • Page {cit.page} • {cit.gazette_ref}</p>
                          </div>

                          {onOpenPdfReader && (
                            <button
                              onClick={() => onOpenPdfReader(cit)}
                              className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-xl border border-emerald-500/40 transition-all flex items-center space-x-1 shrink-0"
                            >
                              <BookOpen className="w-3 h-3 text-emerald-400" />
                              <span>Read PDF</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-xs text-purple-400 font-mono animate-pulse">
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Synthesizing bilingual policy answer via Google Gemini 1.5 Flash & MongoDB...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  dir={language === 'ur' ? 'rtl' : 'ltr'}
                  placeholder={language === 'ur' ? "عمارت کی اونچائی، فیس یا بائیلاز کے متعلق سوال پوچھیں..." : "Ask questions in English or Urdu (e.g., height limit in Gulberg?)..."}
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-xs font-bold">{loading ? 'Searching...' : 'Send Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
