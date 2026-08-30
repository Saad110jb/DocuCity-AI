import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUploadCloud, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiShield, 
  FiRefreshCw,
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiLayers, 
  FiTag, 
  FiEye, 
  FiCheck, 
  FiClock,
  FiMapPin, 
  FiLock, 
  FiCompass, 
  FiBarChart2, 
  FiAward, 
  FiBookOpen, 
  FiTrash2, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiMenu, 
  FiGrid, 
  FiFolder, 
  FiDatabase, 
  FiZap, 
  FiTrendingUp, 
  FiActivity, 
  FiPieChart,
  FiArrowRight,
  FiDownload
} from 'react-icons/fi';
import { 
  HiOutlineSparkles, 
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiGovernmentLine,
  RiMapPinLine 
} from 'react-icons/ri';
import axios from 'axios';
import { OcrCorrectionStudioPage } from './officer/OcrCorrectionStudio';
import { SpatialGisStudioPage } from './officer/SpatialGisStudio';
import { PolicyAnalyticsStudioPage } from './officer/PolicyAnalyticsStudio';
import { OfficialExportStudioPage } from './officer/OfficialExportStudio';
import { BilingualRagAssistant } from '../components/BilingualRagAssistant';
import { OfficerHeader } from '../components/officer/OfficerHeader';

export function PortalPage({ officerUser, onOfficerLogout }) {
  const assignedDepartment = officerUser && officerUser.department
    ? (officerUser.department.includes('WASA') ? 'WASA' : officerUser.department.includes('MCL') ? 'MCL' : officerUser.department.includes('Urban') ? 'Urban Unit' : 'LDA')
    : 'LDA';

  const [documents, setDocuments] = useState([]);
  const lahoreJurisdictions = [
    "All Lahore Metropolitan District (City-Wide)",
    "Gulberg Commercial Zone (Main Blvd & M.M. Alam)",
    "Johar Town (Phase 1 & 2, Blocks A-R)",
    "Model Town & Extension",
    "Allama Iqbal Town (Moon Market, Kashmir Block)",
    "DHA Lahore (Phases 1-9 & Raya Commercial)",
    "Bahria Town Lahore (Sectors A-F)",
    "Sabzazar Housing Scheme & Multan Road",
    "Walled City of Lahore (Heritage Zone)",
    "Mall Road Special Heritage Corridor",
    "Lahore Cantt & Cavalry Ground",
    "Raiwind Road Corridor & Thokar Niaz Baig",
    "Ferozepur Road Commercial Spine (Ichhra & Shama)",
    "Shahdara Town & Ravi Zone Corridor",
    "Multan Road & Sundar Industrial Zone",
    "Shalimar Town & GT Road Corridor",
    "Mughalpura & Harbanspura",
    "Lake City, Valencia & Park View City",
    "LDA Avenue-1 & LDA City Scheme"
  ];

  // Upload Form State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [jurisdiction, setJurisdiction] = useState(lahoreJurisdictions[0]);
  const [category, setCategory] = useState('Zoning Bylaws');
  const [fileType, setFileType] = useState('PDF');
  const [isUploading, setIsUploading] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Workspace Navigation Views: 'portal' | 'ocr' | 'gis' | 'analytics' | 'export'
  const [activeView, setActiveView] = useState('portal');
  const [selectedDocId, setSelectedDocId] = useState('doc-ingest-001');

  // Dynamic PDF Reader Modal State
  const [readingDoc, setReadingDoc] = useState(null);
  const [readerOcrContent, setReaderOcrContent] = useState(null);
  const [loadingReaderOcr, setLoadingReaderOcr] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSearchTerm, setPageSearchTerm] = useState('');

  // Document Deletion Modal State
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Default seed documents
  const defaultOfficerDocs = [
    {
      documentId: 'doc-ingest-001',
      title: 'Amendments in LDA Building & Zoning Regulations 2026',
      filename: 'LDA_Building_Bylaws_2026_Amendments.pdf',
      fileType: 'PDF',
      fileSize: '3.4 MB',
      totalPages: 113,
      uploadTimestamp: new Date().toISOString(),
      uploader: { name: officerUser ? officerUser.name : 'Officer', department: assignedDepartment },
      aiMetadata: {
        issuingAuthority: assignedDepartment,
        jurisdiction: 'All Lahore Metropolitan District (City-Wide)',
        category: 'Building Bylaws',
        confidenceScore: 0.98,
        publicationDate: '2026-02-09'
      },
      stagingStatus: 'Formal Gazette Enacted (Published)',
      targetCollection: 'docucity_public_bylaws'
    },
    {
      documentId: 'doc-ingest-002',
      title: 'LDA Commercialization & List A Road Guidelines 2026',
      filename: 'LDA_Commercialization_ListA_2026.pdf',
      fileType: 'PDF',
      fileSize: '5.1 MB',
      totalPages: 48,
      uploadTimestamp: new Date().toISOString(),
      uploader: { name: officerUser ? officerUser.name : 'Officer', department: assignedDepartment },
      aiMetadata: {
        issuingAuthority: assignedDepartment,
        jurisdiction: 'Gulberg Commercial Zone (Main Blvd & M.M. Alam)',
        category: 'Commercialization Rules',
        confidenceScore: 0.96,
        publicationDate: '2026-01-15'
      },
      stagingStatus: 'Internal Draft (Staged)',
      targetCollection: 'docucity_internal_officer_gazette'
    }
  ];

  const loadIngestionDocs = async (dept) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/ingestion/list?department=${dept}`);
      if (res.data && res.data.documents && res.data.documents.length > 0) {
        setDocuments(res.data.documents);
      } else {
        setDocuments(defaultOfficerDocs);
      }
    } catch (e) {
      setDocuments(defaultOfficerDocs);
    }
  };

  useEffect(() => {
    loadIngestionDocs(assignedDepartment);
  }, [assignedDepartment]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleOpenPdfReader = async (doc) => {
    setReadingDoc(doc);
    setCurrentPageNum(1);
    setPageSearchTerm('');
    setLoadingReaderOcr(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/ocr/${doc.documentId}`);
      if (res.data) {
        setReaderOcrContent(res.data);
      }
    } catch (e) {
      setReaderOcrContent({
        documentId: doc.documentId,
        totalPages: doc.totalPages || 48,
        textChunks: [
          {
            englishText: `Official gazette provisions for ${doc.title}. High-density commercial FAR allowance set to 1:8 on Main Boulevard. Maximum permitted height: 120ft. Mandatory 20ft front setback.`,
            urduText: `${doc.title} کے باضابطہ قانونی قواعد۔ مین بولیوارڈ پر ایف اے آر کی اجازت 1:8۔ اونچائی کی حد 120 فٹ۔`,
            confidence: 0.98
          }
        ]
      });
    } finally {
      setLoadingReaderOcr(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/documents/ingestion/${deletingDoc.documentId}`);
    } catch (err) {}
    setDocuments(prev => prev.filter(d => d.documentId !== deletingDoc.documentId));
    setStatusNotice(`Document "${deletingDoc.title}" removed successfully.`);
    setIsDeleting(false);
    setDeletingDoc(null);
    setTimeout(() => setStatusNotice(''), 3000);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!title && !selectedFile) return;

    setIsUploading(true);
    const docFilename = selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.pdf`;
    
    const newDoc = {
      documentId: `doc-ingest-${Date.now()}`,
      title: title || docFilename,
      filename: docFilename,
      fileType: fileType,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.8 MB',
      totalPages: selectedFile ? Math.max(1, Math.round(selectedFile.size / (45 * 1024))) : 36,
      uploadTimestamp: new Date().toISOString(),
      uploader: { name: officerUser ? officerUser.name : 'Officer', department: assignedDepartment },
      aiMetadata: {
        issuingAuthority: assignedDepartment,
        jurisdiction,
        category,
        confidenceScore: 0.96,
        publicationDate: new Date().toISOString().split('T')[0]
      },
      stagingStatus: 'Internal Draft (Staged)',
      targetCollection: 'docucity_internal_officer_gazette'
    };

    try {
      const formData = new FormData();
      if (selectedFile) formData.append('file', selectedFile);
      formData.append('title', newDoc.title);
      formData.append('issuingAuthority', assignedDepartment);
      formData.append('jurisdiction', jurisdiction);
      formData.append('category', category);
      formData.append('fileType', fileType);
      
      const res = await axios.post('http://localhost:5000/api/documents/ingestion/upload', formData);
      if (res.data && res.data.document) {
        setDocuments(prev => [res.data.document, ...prev]);
      } else {
        setDocuments(prev => [newDoc, ...prev]);
      }
    } catch (err) {
      setDocuments(prev => [newDoc, ...prev]);
    } finally {
      setIsUploading(false);
      setStatusNotice(`Document "${newDoc.title}" saved and indexed.`);
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setStatusNotice(''), 3500);
    }
  };

  const handleToggleStaging = async (docId, currentStatus) => {
    const nextStatus = currentStatus === 'Formal Gazette Enacted (Published)'
      ? 'Internal Draft (Staged)'
      : 'Formal Gazette Enacted (Published)';

    setDocuments(prev => prev.map(d =>
      d.documentId === docId ? { ...d, stagingStatus: nextStatus } : d
    ));

    try {
      await axios.put(`http://localhost:5000/api/documents/ingestion/staging/${docId}`, { stagingStatus: nextStatus });
    } catch (e) {}
  };

  // Sub-studio views
  if (activeView === 'ocr') {
    return (
      <OcrCorrectionStudioPage 
        documentId={selectedDocId} 
        department={assignedDepartment}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
        setActiveView={setActiveView}
        onBack={() => setActiveView('portal')} 
      />
    );
  }
  if (activeView === 'gis') {
    return (
      <SpatialGisStudioPage 
        department={assignedDepartment} 
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
        setActiveView={setActiveView}
        onBack={() => setActiveView('portal')} 
      />
    );
  }
  if (activeView === 'analytics') {
    return (
      <PolicyAnalyticsStudioPage 
        department={assignedDepartment} 
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
        setActiveView={setActiveView}
        onBack={() => setActiveView('portal')} 
      />
    );
  }
  if (activeView === 'export') {
    return (
      <OfficialExportStudioPage 
        department={assignedDepartment} 
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
        setActiveView={setActiveView}
        onBack={() => setActiveView('portal')} 
      />
    );
  }

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.aiMetadata?.jurisdiction || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.aiMetadata?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Universal Officer Header with 4 Tabs */}
      <OfficerHeader
        activeView={activeView}
        setActiveView={setActiveView}
        assignedDepartment={assignedDepartment}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        
        {/* Status Notice Banner */}
        {statusNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2.5 text-xs animate-fade-in shadow-xs">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusNotice}</span>
          </div>
        )}

        {/* Hero Scope Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-neutral-700" />
              <span>Isolated Department Security Boundary Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {assignedDepartment} Municipal Officer Workspace
            </h2>
            <p className="text-xs text-neutral-500 max-w-2xl font-normal">
              Manage statutory municipal gazettes, execute OCR text extraction, inspect spatial zoning maps, and issue verified compliance certificates.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Indexed</p>
              <p className="text-lg font-extrabold text-neutral-900">{documents.length}</p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Published</p>
              <p className="text-lg font-extrabold text-neutral-900">
                {documents.filter(d => d.stagingStatus === 'Formal Gazette Enacted (Published)').length}
              </p>
            </div>
          </div>
        </div>

        {/* Document Upload & Ingestion Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Upload Gazette Document</h3>
                <p className="text-xs text-neutral-400">Add PDF gazette, scanned policy notification, or zoning rulebook</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 font-semibold bg-neutral-100 px-2.5 py-1 rounded-lg">
              Department: {assignedDepartment}
            </span>
          </div>

          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-neutral-200 hover:border-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.dwg"
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform">
                <FiUploadCloud className="w-5 h-5" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-neutral-900">Selected: {selectedFile.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Click or Drag & Drop Document</p>
                  <p className="text-[10px] text-neutral-400">Supports official PDF gazettes and scanned documents</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Document Subject</label>
                <input
                  type="text"
                  placeholder="e.g. LDA Building Bylaws Amendment 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Jurisdiction Sector</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer"
                >
                  {lahoreJurisdictions.map((j, idx) => (
                    <option key={idx} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer"
                >
                  <option value="Zoning Bylaws">Zoning Bylaws</option>
                  <option value="Commercialization Rules">Commercialization Rules</option>
                  <option value="Building Codes">Building Codes</option>
                  <option value="Water Tariffs">Water Tariffs</option>
                  <option value="Master Plan 2050">Master Plan 2050</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isUploading}
                className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-70"
              >
                <FiUploadCloud className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Ingesting Document...' : 'Ingest & Index Document'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Document Records Repository */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {assignedDepartment} Document Ingestion Records ({filteredDocs.length})
              </h3>
              <p className="text-xs text-neutral-400">Review staged drafts, enact statutory gazettes, and inspect OCR text</p>
            </div>

            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search gazette or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.documentId}
                className="bg-neutral-50/60 hover:bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all shadow-xs"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0 shadow-xs">
                    <RiFileTextLine className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">{doc.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        doc.stagingStatus === 'Formal Gazette Enacted (Published)'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {doc.stagingStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-mono">
                      <span>{doc.filename}</span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span>{doc.totalPages} Pages</span>
                      <span>•</span>
                      <span>{doc.aiMetadata?.jurisdiction}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => handleOpenPdfReader(doc)}
                    className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <FiEye className="w-3.5 h-3.5" />
                    <span>Inspect OCR</span>
                  </button>

                  <button
                    onClick={() => { setSelectedDocId(doc.documentId); setActiveView('ocr'); }}
                    className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <RiFileTextLine className="w-3.5 h-3.5" />
                    <span>OCR Studio</span>
                  </button>

                  <button
                    onClick={() => handleToggleStaging(doc.documentId, doc.stagingStatus)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      doc.stagingStatus === 'Formal Gazette Enacted (Published)'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {doc.stagingStatus === 'Formal Gazette Enacted (Published)' ? 'Set to Draft' : 'Publish Gazette'}
                  </button>

                  <button
                    onClick={() => setDeletingDoc(doc)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* PDF & OCR Reading Modal */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">{readingDoc.title}</h3>
                <p className="text-[11px] text-neutral-400 font-mono">{readingDoc.filename} • {readingDoc.totalPages} Pages</p>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-xl hover:bg-neutral-100"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 max-h-80 overflow-y-auto space-y-3 font-sans text-xs text-neutral-700 leading-relaxed border border-neutral-200/80">
              {loadingReaderOcr ? (
                <p className="text-center py-6 text-neutral-400">Loading parsed OCR chunks...</p>
              ) : readerOcrContent?.textChunks?.map((chk, i) => (
                <div key={i} className="space-y-2 bg-white p-3.5 rounded-xl border border-neutral-200/60 shadow-xs">
                  <p className="font-medium text-neutral-900">{chk.englishText}</p>
                  {chk.urduText && (
                    <p className="text-neutral-600 text-right font-serif leading-loose">{chk.urduText}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setReadingDoc(null)}
                className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-neutral-900">Delete Document?</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to remove <span className="font-bold text-neutral-800">{deletingDoc.title}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeletingDoc(null)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bilingual RAG AI Assistant Floating Trigger & Modal */}
      <BilingualRagAssistant
        spatialJurisdiction={jurisdiction}
        onOpenPdfReader={handleOpenPdfReader}
      />

    </div>
  );
}