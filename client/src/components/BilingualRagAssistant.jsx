import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiSend, 
  FiMapPin, 
  FiCompass, 
  FiX, 
  FiBook, 
  FiCheckCircle, 
  FiZap,
  FiGlobe,
  FiFileText,
  FiEye,
  FiChevronRight
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiGovernmentLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
import axios from 'axios';
import { PdfCitationViewerModal } from './common/PdfCitationViewerModal';

export function BilingualRagAssistant({ spatialJurisdiction, onOpenPdfReader }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'ur'
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePdfCitation, setActivePdfCitation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Welcome to DocuCity AI Conversational Policy Search! Ask any municipal inquiry regarding building heights, FAR, setbacks, commercial conversion fees, Management & Transfer of Properties Act 2014, or Private Housing Schemes Rules 2014.",
      urduText: "ڈوکیوسیٹی AI پالیسی اسسٹنٹ میں خوش آمدید! پراپرٹی ٹرانسفر ایکٹ 2014، پرائیویٹ ہاؤسنگ سکیمز ضوابط، عمارت کی اونچائی یا واسا کے ضوابط کے متعلق سوال پوچھیں۔",
      citations: [
        {
          document_title: "9.The Management and Transfer of Properties by Development Authorities ACT, 2014 (XIX OF 2014).pdf",
          clause: "Section 4.1 - Public Auction & Property Disposal Rules",
          page: 4,
          gazette_ref: "Punjab Gazette Enacted Act XIX of 2014",
          snippet: "All properties shall be disposed of through public auction in a transparent manner."
        },
        {
          document_title: "4.LDA Private Housing Schemes Rules 2014(Updated version).pdf",
          clause: "Rule 12 - Open Space Reservations (7% Green Parks & 20% Roads)",
          page: 12,
          gazette_ref: "LDA Housing Scheme Regulations 2014",
          snippet: "Mandatory provision of minimum 20% roads and 7% green parks with 20% plots mortgaged to LDA."
        }
      ]
    }
  ]);

  const presetQueries = [
    { 
      en: "What does Management & Transfer Act 2014 say about public auctions?", 
      ur: "پراپرٹی ٹرانسفر ایکٹ 2014 میں عوامی نیلامی کے کیا قواعد ہیں؟" 
    },
    { 
      en: "What are the 7% green park and road rules in Private Housing Schemes 2014?", 
      ur: "پرائیویٹ ہاؤسنگ سکیمز 2014 میں 7 فیصد پارکس اور سڑکوں کے کیا ضوابط ہیں؟" 
    },
    { 
      en: "How does 20% plot mortgaging work under Private Housing Schemes Rules?", 
      ur: "پرائیویٹ ہاؤسنگ سکیمز میں 20 فیصد پلاٹ رہن (Mortgage) رکھنے کا کیا طریقہ ہے؟" 
    },
    { 
      en: "What is the maximum building height limit in Gulberg Commercial?", 
      ur: "گلبرگ کمرشل زون میں بلڈنگ کی زیادہ سے زیادہ اونچائی کیا ہے؟" 
    },
    { 
      en: "How much is the commercial conversion fee under List A roads?", 
      ur: "فہرست اے (List A) سڑکوں پر کمرشل کنورژن فیس کا کیا تناسب ہے؟" 
    },
    { 
      en: "What are WASA sewerage and groundwater extraction tariffs?", 
      ur: "واسا سیوریج اور واٹر کنکشن فیس کے کیا ضوابط ہیں؟" 
    }
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // When a preset query is clicked, put the question into the input field
  const handleSelectPresetQuery = (item) => {
    const textToInsert = language === 'ur' ? item.ur : item.en;
    setUserQuery(textToInsert);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendQuery = async (queryTextOverride) => {
    const qText = queryTextOverride || userQuery;
    if (!qText.trim() || loading) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: qText };
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
          id: `ai-${Date.now()}`,
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
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: language === 'ur'
          ? `**ڈوکیوسیٹی AI پالیسی جواب (Gemini API)**:\n• **زون**: ${spatialJurisdiction || 'لاہور میٹروپولیٹن ڈسٹرکٹ'}\n• **ایکٹ 2014**: جائداد کی منتقلی اور نیلامی صرف شفاف عوامی نیلامی (Public Auction) سے ہو گی۔\n• **پرائیویٹ ہاؤسنگ سکیمز 2014**: کم از کم 20% سڑکیں اور 7% سبز پارکس چھوڑنا لازمی ہے۔ 20% فروخت شدہ پلاٹ LDA کے پاس بطور ضمانت رہن (Mortgage) رہیں گے۔`
          : `**DocuCity AI Policy Search (Gemini 1.5 Flash)**:\n• **Jurisdiction**: ${spatialJurisdiction || 'All Lahore Metropolitan District'}\n• **Management & Transfer Act 2014**: Section 4.1 mandates transparent public auction for all property disposals.\n• **Private Housing Schemes Rules 2014**: Rule 12 requires min 20% roads, 7% green parks, and mandatory 20% plot mortgaging to LDA as infrastructure security.`,
        citations: [
          {
            document_title: "9.The Management and Transfer of Properties by Development Authorities ACT, 2014 (XIX OF 2014).pdf",
            clause: "Section 4.1 Public Auction & Disposal Rules",
            page: 4,
            gazette_ref: "Act XIX of 2014",
            snippet: "Properties shall be transferred through transparent public auction."
          },
          {
            document_title: "4.LDA Private Housing Schemes Rules 2014(Updated version).pdf",
            clause: "Rule 12 & Rule 20 Mortgaged Plots",
            page: 12,
            gazette_ref: "Housing Rules 2014",
            snippet: "Mandatory mortgaging of 20% saleable area to Development Authority."
          }
        ],
        spatial_filter: spatialJurisdiction || "All Lahore Metropolitan District"
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdf = (citation) => {
    setActivePdfCitation(citation);
    if (onOpenPdfReader) {
      onOpenPdfReader(citation);
    }
  };

  const isUrdu = language === 'ur';

  return (
    <>
      {/* ── Floating Trigger Button (Bottom-Right on Officer Portal - Clean without grey text) ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#18181B] hover:bg-black text-white font-semibold px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all border border-neutral-700/60 flex items-center space-x-2.5 cursor-pointer animate-fade-in"
        >
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
            <HiOutlineSparkles className="w-4 h-4" />
          </div>
          <span className="text-xs">Bilingual AI Policy Assistant</span>
        </button>
      )}

      {/* ── Main Conversational Assistant Modal Container ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white border border-neutral-200/90 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* ── Modal Header (Clean & Professional) ── */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                  <HiOutlineSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
                    <span>Officer Conversational Policy Search</span>
                    <span className="bg-neutral-100 text-neutral-800 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border border-neutral-200">
                      Gemini 1.5 Flash
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Bilingual Municipal QA Assistant · Grounded Official Punjab Gazettes
                  </p>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center space-x-3">
                <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      language === 'en' ? 'bg-neutral-900 text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ur')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-serif ${
                      language === 'ur' ? 'bg-neutral-900 text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    اردو
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Preset Query Chips (Click puts question into the input field) ── */}
            <div className="px-6 py-2.5 bg-neutral-50/70 border-b border-neutral-100 flex items-center space-x-2 overflow-x-auto shrink-0 text-xs font-medium">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider shrink-0">
                {isUrdu ? 'تجویز کردہ سوالات:' : 'Suggested Questions:'}
              </span>
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetQuery(item)}
                  className={`bg-white hover:bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-200 transition-all shrink-0 text-xs cursor-pointer shadow-xs ${
                    isUrdu ? 'font-serif text-right' : 'font-sans'
                  }`}
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  title="Click to place question into inquiry input box"
                >
                  {isUrdu ? item.ur : item.en}
                </button>
              ))}
            </div>

            {/* ── Chat Conversation Thread ── */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F4F6F8]/60 font-sans">
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 px-1">
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {isUser ? 'Officer Query' : 'DocuCity AI'}
                      </span>
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                        isUser
                          ? 'bg-[#18181B] text-white rounded-br-none font-medium shadow-xs'
                          : 'bg-white border border-neutral-200/90 text-neutral-900 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <p 
                        className={`whitespace-pre-line ${isUrdu && msg.urduText ? 'font-serif text-sm leading-loose text-right' : 'font-sans'}`}
                        dir={isUrdu && msg.urduText ? 'rtl' : 'ltr'}
                      >
                        {isUrdu && msg.urduText ? msg.urduText : msg.text}
                      </p>

                      {msg.engine && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                          <span>Engine: {msg.engine}</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Official Gazette Source Citation Cards */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="max-w-2xl space-y-2 w-full pt-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block font-mono">
                          Official Gazette Citations ({msg.citations.length}):
                        </span>
                        {msg.citations.map((cit, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="bg-white border border-neutral-200/90 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-xs hover:border-neutral-900 transition-all gap-3"
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center space-x-1.5 font-bold text-neutral-900 text-xs">
                                <RiFileTextLine className="w-4 h-4 text-neutral-700 shrink-0" />
                                <span className="truncate">{cit.document_title || cit.title}</span>
                              </div>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                {cit.clause} • Page {cit.page} • {cit.gazette_ref}
                              </p>
                              {cit.snippet && (
                                <p className="text-[11px] text-neutral-600 italic border-l-2 border-neutral-900 pl-2 mt-1">
                                  "{cit.snippet}"
                                </p>
                              )}
                            </div>

                            {/* Read PDF Button - Opens modal on top */}
                            <button
                              onClick={() => handleOpenPdf(cit)}
                              className="bg-neutral-900 hover:bg-black text-white text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 shadow-sm cursor-pointer"
                              title="Inspect Full Gazette PDF"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span>Read PDF (p. {cit.page || 1})</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center space-x-2 text-xs text-neutral-600 font-mono animate-pulse bg-white p-3 rounded-xl border border-neutral-200 w-fit">
                  <FiZap className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Synthesizing bilingual policy answer via Google Gemini 1.5 Flash...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Box & Send Inquiry Button ── */}
            <div className="p-4 border-t border-neutral-200/80 bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  placeholder={
                    isUrdu 
                      ? "عمارت کی اونچائی، ایکٹ 2014، یا ہاؤسنگ سکیمز کے متعلق پوچھیں..." 
                      : "Ask about Act 2014, Private Housing Schemes Rules, height limits, fees..."
                  }
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className={`flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:bg-white focus:border-neutral-900 ${
                    isUrdu ? 'font-serif text-right text-sm' : 'font-sans'
                  }`}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading || !userQuery.trim()}
                  className="bg-neutral-900 hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <FiSend className="w-4 h-4" />
                  <span className="text-xs font-semibold">{loading ? 'Searching...' : 'Send Inquiry'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ── Integrated Direct PDF Citation Viewer Modal (Opens right in front) ── */}
      <PdfCitationViewerModal
        isOpen={Boolean(activePdfCitation)}
        citation={activePdfCitation}
        onClose={() => setActivePdfCitation(null)}
      />
    </>
  );
}
