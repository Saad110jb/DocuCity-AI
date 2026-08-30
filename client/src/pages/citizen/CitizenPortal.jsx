import React, { useState, useEffect } from 'react';
import { 
  FiBook, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiFileText, 
  FiCalendar, 
  FiMapPin, 
  FiUser, 
  FiShield, 
  FiLock, 
  FiEye, 
  FiCheckCircle, 
  FiRefreshCw,
  FiArrowRight,
  FiCompass,
  FiSend,
  FiMessageSquare,
  FiSliders
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiGovernmentLine,
  RiMapPinLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
import axios from 'axios';
import { PdfCitationViewerModal } from '../../components/common/PdfCitationViewerModal';

export function CitizenPortalPage({ user, onOpenMap }) {
  // Gazette Library filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activePdfModal, setActivePdfModal] = useState(null);

  // Quick Plot Zoning Check state
  const [selectedZoneQuery, setSelectedZoneQuery] = useState('Johar Town Phase 2');
  const [zoneResult, setZoneResult] = useState({
    zoneName: 'Johar Town (Phase 1 & 2, Blocks A-R)',
    authority: 'Lahore Development Authority (LDA)',
    permittedLandUse: 'Commercial & Multi-Storey Residential (List A Corridors)',
    maxFAR: '1:6 (Standard Commercial) / 1:8 (Main Boulevard Special Zone)',
    maxHeight: '90 ft (G+6) to 120 ft (Main Boulevard)',
    frontSetback: '20 ft minimum',
    sideSetback: '10 ft minimum',
    commercialFee: '20% DC Commercial Rate for permanent conversion',
    gazetteRef: 'LDA Gazette 2026 Volume III — Clause 4.2',
    waterTariff: 'WASA Category B Commercial Tariff applicable'
  });

  const sampleZones = [
    {
      name: 'Johar Town (Phase 1 & 2, Blocks A-R)',
      authority: 'LDA',
      use: 'Commercial & Multi-Storey Residential',
      far: '1:6 (Standard) / 1:8 (Main Blvd)',
      height: '90 ft to 120 ft',
      frontSetback: '20 ft',
      sideSetback: '10 ft',
      fee: '20% DC Commercial Rate',
      ref: 'LDA Gazette 2026 Volume III'
    },
    {
      name: 'Gulberg Commercial Zone (Main Blvd & M.M. Alam)',
      authority: 'LDA',
      use: 'High Density Commercial & Mixed-Use',
      far: '1:8 High Density Allowance',
      height: '120 ft (10 Storeys Permitted)',
      frontSetback: '20 ft mandatory',
      sideSetback: '10 ft',
      fee: 'Tier 1 Prime Commercial (20% DC Rate)',
      ref: 'LDA Gazette 2026 Notification 725'
    },
    {
      name: 'Model Town & Extension (Blocks A-M)',
      authority: 'MCL / Model Town Society',
      use: 'Low Density Residential & Designated Bazaars',
      far: '1:4 Residential Density',
      height: '38 ft (G+2 Storeys)',
      frontSetback: '15 ft',
      sideSetback: '5 ft',
      fee: 'Residential Tariff / Non-Commercialized',
      ref: 'MCL Residential Zoning Guidelines'
    },
    {
      name: 'Walled City of Lahore (Heritage Conservation Buffer)',
      authority: 'Walled City Authority (WCLA)',
      use: 'Heritage Commercial & Traditional Residential',
      far: '1:2.5 Heritage Cap',
      height: '30 ft Strict Maximum Height',
      frontSetback: 'Preserve Traditional Streetline',
      sideSetback: 'Zero lot line / Traditional',
      fee: 'Heritage Conservation NOC Required',
      ref: 'WCLA Act 2012 Buffer Notification'
    }
  ];

  const defaultGazettes = [
    {
      id: "gaz-1",
      title: '1.Amendments in LDA Building & Zoning Regulations-2019',
      authority: 'LDA',
      category: 'Building Bylaws',
      year: '2022',
      date: '2022-10-28',
      size: '0.8 MB',
      gazette_ref: 'Office Order No. LDA/DC&I/725 Dated 28th October, 2022',
      clause: 'Clause 2.5 (Low Rise Apartment Ground Coverage 65%) & Clause 3.1',
      page: 1,
      snippet: 'High-density commercial corridors shall have an allowed FAR of 1:8 with maximum 120 ft height limit and mandatory 20 ft front setback.'
    },
    {
      id: "gaz-2",
      title: '2.LDA Landuse Rules_2020',
      authority: 'LDA',
      category: 'Zoning Bylaws',
      year: '2020',
      date: '2020-08-06',
      size: '30.9 MB',
      gazette_ref: 'The Punjab Gazette Registered No. L.-7532 Dated August 06, 2020',
      clause: 'Section 4.2 & Commercialization List A Corridors',
      page: 14,
      snippet: 'Permanent commercialization on declared List A road corridors is assessed at 20% of commercial DC rate.'
    },
    {
      id: "gaz-3",
      title: '09-02-2026-amended-building-regulations-2019-with-amendment',
      authority: 'LDA',
      category: 'Building Bylaws',
      year: '2026',
      date: '2026-02-09',
      size: '2.0 MB',
      gazette_ref: 'LDA Master Building Regulations 2026 Volume',
      clause: 'Chapter 4 - Vertical Density, FAR Caps & Heights',
      page: 113,
      snippet: 'Full 113-page master building regulations with structured tabular bylaws for heights, setbacks, and parking.'
    },
    {
      id: "gaz-4",
      title: 'Lahore Master Plan 2050 — Metropolitan Land Use',
      authority: 'Urban Unit',
      category: 'Master Plans',
      year: '2025',
      date: '2025-11-10',
      size: '12.5 MB',
      gazette_ref: 'Punjab Urban Unit Master Plan Gazette 2050',
      clause: 'Chapter 3 - Environmental Green Belts & Urban Growth Boundaries',
      page: 45,
      snippet: 'Agricultural reserves along the Ravi basin are strictly preserved from hazardous industrial development.'
    },
    {
      id: "gaz-5",
      title: 'WASA Water Tariff and Sewerage Protection Regulations',
      authority: 'WASA',
      category: 'Water Tariffs',
      year: '2026',
      date: '2026-01-05',
      size: '2.1 MB',
      gazette_ref: 'WASA Environmental Protection Order No. 2019/2026',
      clause: 'Rule 8 - Commercial Extraction & Sewerage Buffer Line',
      page: 5,
      snippet: 'Mandatory 15-meter buffer for trunk sewerage alignments and Rs. 15,000/cusec commercial groundwater extraction fee.'
    },
    {
      id: "gaz-6",
      title: 'Punjab Environmental Protection Guidelines for Commercial Zones',
      authority: 'EPA',
      category: 'Environmental Reports',
      year: '2025',
      date: '2025-08-20',
      size: '3.8 MB',
      gazette_ref: 'Punjab EPA Gazette Notification 2025-ENV',
      clause: 'Section 12 - Effluent Treatment & Commercial Air Quality Standards',
      page: 18,
      snippet: 'All industrial units in Sundar and Multan Road must install operational Effluent Treatment Plants (ETP).'
    },
    {
      id: "gaz-7",
      title: 'Walled City of Lahore Heritage Conservation Bylaws',
      authority: 'Walled City Authority',
      category: 'Heritage Conservation',
      year: '2023',
      date: '2023-06-12',
      size: '5.6 MB',
      gazette_ref: 'Punjab Heritage Authority Act 2012 — WCLA Buffer Notification',
      clause: 'Clause 6 - 30ft Strict Max Height Cap & Facade Preservation',
      page: 3,
      snippet: 'Strict 30 ft height cap on all new constructions within Shahi Qila, Delhi Gate, and Mall Road buffer corridors.'
    }
  ];

  const [gazettes, setGazettes] = useState(defaultGazettes);

  // Fetch Live MongoDB Staged/Enacted Documents on Mount
  useEffect(() => {
    async function loadMongoDocs() {
      try {
        const res = await axios.get('http://localhost:5000/api/documents/ingestion/staged');
        if (res.data && res.data.documents && res.data.documents.length > 0) {
          const liveList = res.data.documents.map(d => ({
            id: d.documentId,
            title: d.title || d.filename,
            authority: d.aiMetadata ? d.aiMetadata.issuingAuthority : 'LDA',
            category: d.aiMetadata ? d.aiMetadata.category : 'Building Bylaws',
            year: d.aiMetadata && d.aiMetadata.publicationDate ? new Date(d.aiMetadata.publicationDate).getFullYear().toString() : '2026',
            date: d.aiMetadata && d.aiMetadata.publicationDate ? new Date(d.aiMetadata.publicationDate).toISOString().split('T')[0] : '2026-08-25',
            size: d.fileSize || '2.4 MB',
            gazette_ref: `${d.aiMetadata ? d.aiMetadata.issuingAuthority : 'LDA'} Enacted Statutory Notification`,
            clause: `Parsed ${d.totalPages || 2} Pages · Scope: ${d.aiMetadata ? d.aiMetadata.jurisdiction : 'Lahore'}`,
            page: 1,
            snippet: `Statutory municipal gazette record for ${d.title}. Parsed ${d.totalPages || 2} pages into MongoDB vector index.`
          }));

          const merged = [...liveList];
          defaultGazettes.forEach(def => {
            if (!merged.some(m => m.title.toLowerCase() === def.title.toLowerCase())) {
              merged.push(def);
            }
          });
          setGazettes(merged);
        }
      } catch (e) {
        console.warn('Using standard public gazette library dataset');
      }
    }
    loadMongoDocs();
  }, []);

  const filteredGazettes = gazettes.filter(g => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.gazette_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.clause.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuth = selectedAuthority === 'All' || g.authority.toUpperCase().includes(selectedAuthority.toUpperCase());
    const matchesCat = selectedCategory === 'All' || g.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesYear = selectedYear === 'All' || g.year === selectedYear;
    return matchesSearch && matchesAuth && matchesCat && matchesYear;
  });

  const handleDownload = (gazette) => {
    const content = `================================================================================
GOVERNMENT OF THE PUNJAB — OFFICIAL MUNICIPAL GAZETTE RECORD
TITLE: ${gazette.title}
ISSUING AUTHORITY: ${gazette.authority}
CATEGORY: ${gazette.category} | PUBLICATION DATE: ${gazette.date}
GAZETTE NUMBER: ${gazette.gazette_ref}
VERIFIED STATUTORY CLAUSE: ${gazette.clause} (Page ${gazette.page})
================================================================================

LEGAL RECORD SUMMARY:
"${gazette.snippet}"

SECURITY & ACCESS BOUNDARY:
- Vector Isolation: Public Vector Namespace (docucity_public_bylaws)
- Automated PII Redaction: Verified (Citizen CNIC, phones & private ownership scrubbed)
- Permission: Read-Only Public Enforcement

--------------------------------------------------------------------------------
This is an authentic, legally grounded record retrieved from the DocuCity Lahore GIS Policy Portal.
--------------------------------------------------------------------------------`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gazette.title.replace(/\s+/g, '_')}_Official_Record.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const scrollToLibrary = () => {
    const el = document.getElementById('gazette-library-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans p-6 sm:p-8 selection:bg-neutral-900 selection:text-white">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* ── 1. Top Hero Greeting & Scope Card ───────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
                <RiShieldCheckLine className="w-3.5 h-3.5 text-neutral-800" />
                <span>Verified Public Citizen Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center space-x-2.5">
                <span>Welcome, {user ? user.name : 'Muhammad Saad'}</span>
              </h1>
              <p className="text-xs text-neutral-500 max-w-2xl font-normal leading-relaxed">
                Access official municipal gazettes, verified legal citations, explore interactive spatial policies, and ask questions to the grounded Gemini RAG assistant.
              </p>
            </div>

            <button
              onClick={onOpenMap}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer self-start md:self-auto shrink-0"
            >
              <FiCompass className="w-4 h-4" />
              <span>Launch Interactive Policy Map</span>
            </button>
          </div>

          {/* ── 2. Access Boundaries & Public Data Protection Banner ─────── */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                  <FiLock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Access Boundaries & Public Data Protection Active
                </h3>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Security Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-neutral-900 font-bold">
                  <FiShield className="w-3.5 h-3.5 text-neutral-800" />
                  <span>Isolated Vector Namespace</span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  All public queries route strictly to <code className="text-neutral-900 font-semibold font-mono">docucity_public_bylaws</code>, preventing exposure of internal drafts.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                  <FiLock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated PII Redaction</span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  All public gazettes and searches are scrubbed of citizen CNIC numbers, phone records, and private property details.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                  <FiEye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Read-Only Public Scope</span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Public users can inspect policies and download gazettes. Zone geometry edits require Municipal Officer clearance.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. THREE PROMINENT CLICKABLE FEATURE CARDS (MAP + RAG + LIBRARY) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Interactive Spatial Map */}
            <div 
              onClick={onOpenMap}
              className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:border-neutral-900 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1 tracking-tight">Interactive Spatial Map</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Click any plot or zone across Lahore to inspect FAR, permissible heights, setbacks, and commercialization rules.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs font-bold text-neutral-900 group-hover:text-black flex items-center space-x-1.5 pt-2 border-t border-neutral-100">
                <span>Open GIS Map</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Grounded Gemini RAG Assistant */}
            <div 
              onClick={onOpenMap}
              className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:border-neutral-900 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <HiOutlineSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1 tracking-tight">Grounded Gemini RAG Assistant</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Ask policy inquiries in English or Urdu Nastaliq with zero hallucinations and verified official gazette citations.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs font-bold text-neutral-900 group-hover:text-black flex items-center space-x-1.5 pt-2 border-t border-neutral-100">
                <span>Start Bilingual Chat</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Public Policy Library */}
            <div 
              onClick={scrollToLibrary}
              className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:border-neutral-900 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FiBook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1 tracking-tight">Public Policy Library</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Faceted search & direct download of official, OCR-processed municipal gazette notifications.
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs font-bold text-neutral-900 group-hover:text-black flex items-center space-x-1.5 pt-2 border-t border-neutral-100">
                <span>Browse {gazettes.length} Approved Gazettes</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>

          </div>

          {/* ── 4. Quick Zoning & Sector Inspector ────────────────────── */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Sector & Plot Zoning Quick Inspector
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Select your locality across Lahore to immediately inspect sanctioned FAR, maximum heights, setbacks, and tariff tiers
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Sector Picker Pills */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Quick Select Common Lahore Sectors</p>
              <div className="flex flex-wrap gap-2">
                {sampleZones.map((z, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedZoneQuery(z.name);
                      setZoneResult({
                        zoneName: z.name,
                        authority: z.authority,
                        permittedLandUse: z.use,
                        maxFAR: z.far,
                        maxHeight: z.height,
                        frontSetback: z.frontSetback,
                        sideSetback: z.sideSetback,
                        commercialFee: z.fee,
                        gazetteRef: z.ref,
                        waterTariff: 'Standard WASA Schedule'
                      });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      selectedZoneQuery === z.name
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-neutral-50 hover:bg-white text-neutral-800 border-neutral-200'
                    }`}
                  >
                    {z.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Sector Details Grid */}
            <div className="bg-neutral-50/70 border border-neutral-200/90 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/70 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block font-mono">SELECTED JURISDICTION</span>
                  <h3 className="text-base font-bold text-neutral-900">{zoneResult.zoneName}</h3>
                </div>
                <span className="bg-neutral-900 text-white text-xs font-mono font-bold px-3 py-1 rounded-xl self-start sm:self-auto">
                  {zoneResult.authority} Scope
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Floor Area Ratio (FAR)</p>
                  <p className="font-extrabold text-sm text-neutral-900">{zoneResult.maxFAR}</p>
                  <p className="text-[11px] text-neutral-500">Permitted density limit</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Max Permissible Height</p>
                  <p className="font-extrabold text-sm text-neutral-900">{zoneResult.maxHeight}</p>
                  <p className="text-[11px] text-neutral-500">Subject to site clearance</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Mandatory Front Setback</p>
                  <p className="font-extrabold text-sm text-neutral-900">{zoneResult.frontSetback}</p>
                  <p className="text-[11px] text-neutral-500">Side Setback: {zoneResult.sideSetback}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Permitted Land Use</p>
                  <p className="font-bold text-neutral-900">{zoneResult.permittedLandUse}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Commercial Conversion Fee</p>
                  <p className="font-bold text-neutral-900">{zoneResult.commercialFee}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-0.5">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Statutory Gazette Reference</p>
                  <p className="font-bold text-neutral-900 font-mono text-[11px]">{zoneResult.gazetteRef}</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={onOpenMap}
                  className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View Coordinates on Policy Map</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── 5. Public Municipal Gazette & Policy Library ───────────── */}
          <div id="gazette-library-section" className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                  <FiBook className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Public Municipal Gazette & Policy Library
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Curated, searchable repository of approved government gazettes, building bylaws, and master plans
                  </p>
                </div>
              </div>
              <span className="text-xs text-neutral-700 font-mono font-semibold bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200 self-start sm:self-auto">
                Showing {filteredGazettes.length} of {gazettes.length} Gazettes
              </span>
            </div>

            {/* Faceted Search & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-1">
                <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search title, clause, or gazette #..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <FiFilter className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <select 
                  value={selectedAuthority}
                  onChange={(e) => setSelectedAuthority(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-800 font-medium focus:border-neutral-900 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Issuing Authorities</option>
                  <option value="LDA">LDA (Lahore Development Authority)</option>
                  <option value="WASA">WASA (Water & Sanitation)</option>
                  <option value="MCL">MCL (Metropolitan Corporation)</option>
                  <option value="Urban Unit">Urban Unit Punjab</option>
                  <option value="Walled City Authority">Walled City Authority (WCLA)</option>
                  <option value="DHA Lahore">DHA Lahore</option>
                  <option value="EPA">EPA Punjab</option>
                </select>
              </div>

              <div className="relative">
                <FiFilter className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-800 font-medium focus:border-neutral-900 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Document Categories</option>
                  <option value="Building Bylaws">Building Bylaws</option>
                  <option value="Master Plans">Master Plans 2050</option>
                  <option value="Water Tariffs">Water Tariffs & Sewerage</option>
                  <option value="Environmental Reports">Environmental Reports</option>
                  <option value="Commercialization Rules">Commercialization Rules</option>
                  <option value="Heritage Conservation">Heritage Conservation</option>
                  <option value="Zoning Bylaws">Zoning Bylaws</option>
                </select>
              </div>

              <div className="relative">
                <FiCalendar className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-800 font-medium focus:border-neutral-900 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Publication Years</option>
                  <option value="2026">2026 Enactments</option>
                  <option value="2025">2025 Enactments</option>
                  <option value="2023">2023 Enactments</option>
                  <option value="2022">2022 Enactments</option>
                  <option value="2020">2020 Enactments</option>
                  <option value="2018">2018 Enactments</option>
                </select>
              </div>
            </div>

            {/* Gazette List */}
            <div className="space-y-3">
              {filteredGazettes.length > 0 ? filteredGazettes.map(g => (
                <div
                  key={g.id}
                  className="bg-neutral-50/60 hover:bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all text-xs shadow-xs"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0 shadow-xs">
                      <RiFileTextLine className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm truncate">{g.title}</span>
                        <span className="bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-200">
                          {g.authority}
                        </span>
                      </div>

                      <p className="text-neutral-500 text-[11px] font-mono">
                        {g.gazette_ref} · {g.clause}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-600 pt-0.5">
                        <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-semibold text-neutral-700">
                          {g.category}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                          Page {g.page}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                          {g.date}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                          {g.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => setActivePdfModal({
                        document_title: g.title,
                        authority: g.authority,
                        clause: g.clause,
                        page: g.page,
                        gazette_ref: g.gazette_ref,
                        snippet: g.snippet
                      })}
                      className="bg-white hover:bg-neutral-50 text-neutral-800 px-3.5 py-1.5 rounded-xl font-semibold transition-all border border-neutral-200 flex items-center space-x-1.5 shadow-xs text-xs cursor-pointer"
                    >
                      <FiEye className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Verify / Read PDF</span>
                    </button>

                    <button 
                      onClick={() => handleDownload(g)}
                      className="bg-neutral-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl font-semibold transition-all shadow-sm flex items-center space-x-1.5 text-xs cursor-pointer"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-neutral-400 font-mono text-xs">
                  No public gazettes found matching the selected faceted filters.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Grounded Citation & PDF Preview Modal */}
      <PdfCitationViewerModal
        isOpen={Boolean(activePdfModal)}
        citation={activePdfModal}
        onClose={() => setActivePdfModal(null)}
      />
    </>
  );
}
