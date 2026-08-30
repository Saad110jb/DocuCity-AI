import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiSend, 
  FiUser, 
  FiChevronRight, 
  FiMapPin, 
  FiX, 
  FiCompass, 
  FiShield, 
  FiZap, 
  FiLayers, 
  FiBook, 
  FiCopy, 
  FiCheck,
  FiHelpCircle
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
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
  const [copiedId, setCopiedId] = useState(null);
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

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isUrdu = language === 'ur';

  return (
    <>
      <div
        className={`fixed right-0 top-16 bottom-0 z-20 flex transition-all duration-300 ${
          isOpen ? 'w-[430px]' : 'w-12'
        }`}
      >
        {/* Toggle button on left side of drawer */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-center bg-[#18181B] hover:bg-black text-white p-2.5 rounded-l-2xl shadow-xl border-y border-l border-neutral-700/50 focus:outline-none transition-all flex items-center justify-center cursor-pointer"
          title={isOpen ? 'Collapse Assistant' : 'Expand Assistant'}
        >
          <FiMessageSquare className="w-5 h-5" />
        </button>

        {/* Drawer content */}
        {isOpen && (
          <div className="flex-1 bg-white border-l border-neutral-200/90 flex flex-col shadow-2xl overflow-hidden font-sans">
            
            {/* ── Clean Drawer Header (RAG Verified text removed) ── */}
            <div className="px-5 py-4 border-b border-neutral-200/80 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-xs text-white shrink-0">
                  <HiOutlineSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Grounded AI Assistant
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Bilingual Legal Citations & Zero Hallucination
                  </p>
                </div>
              </div>

              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>

            {/* Active Spatial Location Context Filter Banner */}
            {selectedZone ? (
              <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 animate-fade-in">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0 shadow-xs">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">
                      Active Spatial Context
                    </div>
                    <div className="font-bold text-neutral-900 text-xs truncate max-w-[240px]">
                      {selectedZone.zone_name || selectedZone.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {selectedZone.far ? `FAR: ${selectedZone.far}` : ''}
                      {selectedZone.max_height_ft ? ` · Height: ${selectedZone.max_height_ft}ft` : ''}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClearZone}
                  className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-200/50 transition-colors cursor-pointer"
                  title="Clear Spatial Filter"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F6F8]/60">
              
              {/* Empty / Welcome prompt if no messages */}
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-neutral-800 border border-neutral-200 shadow-xs">
                    <HiOutlineSparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-neutral-900">
                      {isUrdu ? 'پنجاب میونسپل پالیسی اسسٹنٹ' : 'Punjab Municipal Policy Assistant'}
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                      {isUrdu
                        ? 'لاہور زوننگ بائی لاز، ایف اے آر اور بلڈنگ رولز سے متعلق کوئی بھی سوال پوچھیں۔'
                        : 'Ask any question about Lahore zoning bylaws, commercialization, height caps, or setback standards.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user' || msg.role === 'user';
                const msgId = msg.id || index;
                const msgIsUrdu = msg.language === 'ur' || isUrdu;

                return (
                  <div
                    key={msgId}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center space-x-1.5 px-1">
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {isUser ? 'You' : 'DocuCity AI'}
                      </span>
                    </div>

                    <div
                      className={`max-w-[92%] p-4 text-xs leading-relaxed transition-all ${
                        isUser
                          ? 'bg-[#18181B] text-white rounded-2xl rounded-tr-none shadow-sm'
                          : 'bg-white text-neutral-900 border border-neutral-200/90 rounded-2xl rounded-tl-none shadow-xs'
                      }`}
                    >
                      {/* Message Text Body */}
                      <p 
                        className={`whitespace-pre-wrap ${msgIsUrdu ? 'font-serif text-sm leading-loose text-right' : 'font-sans'}`} 
                        dir={msgIsUrdu ? 'rtl' : 'ltr'}
                      >
                        {msg.text || msg.content}
                      </p>

                      {/* Verified Citations List */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                            <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified Citations ({msg.citations.length})</span>
                          </p>
                          {msg.citations.map((citation, cIdx) => (
                            <CitationCard
                              key={cIdx}
                              citation={citation}
                              onOpenPdf={(cit) => setActiveCitationPdf(cit)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Copy Action button on Assistant messages */}
                      {!isUser && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 flex justify-end">
                          <button
                            onClick={() => handleCopyText(msg.text || msg.content, msgId)}
                            className="text-[10px] text-neutral-400 hover:text-neutral-800 flex items-center space-x-1 transition-colors cursor-pointer"
                          >
                            {copiedId === msgId ? (
                              <>
                                <FiCheck className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <FiCopy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-start space-x-2">
                  <div className="bg-white border border-neutral-200 p-3.5 rounded-2xl rounded-tl-none shadow-xs space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse delay-200" />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Querying ChromaDB vector index & legal bylaws...
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Suggested Prompts Section (Urdu & English Responsive) ── */}
            {suggestedPrompts && suggestedPrompts.length > 0 && (
              <div className="p-3 bg-white border-t border-neutral-100 space-y-1.5 shrink-0 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  {isUrdu ? 'تجویز کردہ سوالات:' : 'Suggested Inquiries:'}
                </p>
                <div className="flex flex-col gap-1.5">
                  {suggestedPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSuggestion(prompt)}
                      dir={isUrdu ? 'rtl' : 'ltr'}
                      className={`text-xs bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer truncate text-left ${
                        isUrdu ? 'font-serif text-right' : 'font-sans'
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-3.5 bg-white border-t border-neutral-200/80 shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  placeholder={
                    isUrdu
                      ? 'زوننگ، ایف اے آر اور بلڈنگ بائی لاز سے متعلق پوچھیں...'
                      : 'Ask about zoning, FAR, setbacks, or commercial rules...'
                  }
                  className={`flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 ${
                    isUrdu ? 'font-serif text-right text-sm' : 'font-sans'
                  }`}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="bg-neutral-900 hover:bg-black text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        )}
      </div>

      {/* PDF Citation Viewer Modal */}
      <PdfCitationViewerModal
        isOpen={Boolean(activeCitationPdf)}
        citation={activeCitationPdf}
        onClose={() => setActiveCitationPdf(null)}
      />
    </>
  );
}
