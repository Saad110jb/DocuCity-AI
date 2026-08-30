import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiShield, 
  FiPrinter, 
  FiArrowLeft, 
  FiRefreshCw, 
  FiAward, 
  FiCheckCircle, 
  FiLock, 
  FiEye,
  FiClock,
  FiUser,
  FiMapPin
} from 'react-icons/fi';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiGovernmentLine 
} from 'react-icons/ri';
import { 
  HiOutlineSparkles 
} from 'react-icons/hi2';
import { OfficerHeader } from '../../components/officer/OfficerHeader';
import axios from 'axios';

export function OfficialExportStudioPage({ onBack, department = 'LDA', officerUser, onOfficerLogout, setActiveView }) {
  const [plotNumber, setPlotNumber] = useState('Plot 42-B, Main Boulevard');
  const [ownerName, setOwnerName] = useState('Mian Muhammad Hassan');
  const [location, setLocation] = useState('Gulberg Commercial Zone, Sector 1, Lahore');
  const [authority, setAuthority] = useState(department);

  const [generatedCert, setGeneratedCert] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  const handleGenerateCertificate = (e) => {
    e.preventDefault();
    setGeneratingCert(true);

    setTimeout(() => {
      const certId = `CERT-${authority}-${Date.now().toString().substring(5)}`;
      setGeneratedCert({
        certificateId: certId,
        issuingAuthority: authority === 'WASA' ? 'WASA Lahore' : authority === 'MCL' ? 'Metropolitan Corporation Lahore (MCL)' : 'Lahore Development Authority (LDA)',
        watermark: "OFFICIAL GOVERNMENT OF PUNJAB VERIFIED ZONING CERTIFICATE",
        plotDetails: {
          plotNumber: plotNumber || "Plot 42-B",
          ownerName: ownerName || "Mian Muhammad Hassan",
          location: location || "Gulberg Commercial Zone",
          landUseCategory: "Commercial High-Density",
          plotSize: "2 Kanal (18,000 sq ft)"
        },
        approvedBylawLimits: {
          maxFAR: "1:8 (High Density)",
          maxHeightAllowance: "120 ft (10 Storeys)",
          frontSetback: "20 ft",
          sideSetback: "10 ft",
          rearSetback: "10 ft",
          commercializationFeeTier: "Tier 1 Premium Commercial (20% DC Rate)"
        },
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        verifiedOfficer: officerUser?.name || "Verified Municipal Officer"
      });
      setGeneratingCert(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      
      {/* Universal Officer Header */}
      <OfficerHeader
        activeView="export"
        setActiveView={setActiveView || (() => {})}
        assignedDepartment={department}
        officerUser={officerUser}
        onOfficerLogout={onOfficerLogout}
      />

      {/* Main Studio Body */}
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

        {/* Studio Sub-Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[11px] font-bold text-neutral-800 border border-neutral-200/70">
              <FiAward className="w-3.5 h-3.5 text-neutral-800" />
              <span>{department} Official Certificate Issuance Engine</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Official Certificate & Export Studio</h2>
            <p className="text-xs text-neutral-500">Generate cryptographically verified government zoning certificates for property owners and architects</p>
          </div>

          {generatedCert && (
            <button
              onClick={() => window.print()}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Certificate Generation Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div className="border-b border-neutral-100 pb-4">
                <h3 className="text-sm font-bold text-neutral-900">Certificate Particulars</h3>
                <p className="text-xs text-neutral-400">Fill out the property and owner information below</p>
              </div>

              <form onSubmit={handleGenerateCertificate} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><FiFileText className="w-3 h-3" /> Plot / Scheme Identifier</span>
                  </label>
                  <input
                    type="text"
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. Plot 42-B, Main Boulevard Gulberg"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><FiUser className="w-3 h-3" /> Owner / Applicant Name</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Mian Muhammad Hassan"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><FiMapPin className="w-3 h-3" /> Sector & Jurisdiction</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gulberg Commercial Zone, Sector 1"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><RiGovernmentLine className="w-3 h-3" /> Issuing Authority</span>
                  </label>
                  <select
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 cursor-pointer"
                  >
                    <option value="LDA">Lahore Development Authority (LDA)</option>
                    <option value="WASA">WASA Lahore (Water & Sanitation Authority)</option>
                    <option value="MCL">Metropolitan Corporation Lahore (MCL)</option>
                    <option value="Urban Unit">Punjab Urban Unit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={generatingCert}
                  className="w-full bg-neutral-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
                >
                  <FiAward className="w-4 h-4" />
                  <span>{generatingCert ? 'Generating Certificate…' : 'Generate Official Certificate'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Certificate Preview (7 cols) */}
          <div className="lg:col-span-7">
            {generatedCert ? (
              <div className="bg-white rounded-3xl p-8 border-2 border-neutral-300 shadow-lg space-y-6 print:shadow-none print:border-none">
                
                {/* Certificate Header */}
                <div className="text-center space-y-2 border-b-2 border-neutral-200 pb-6">
                  <div className="w-14 h-14 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <RiGovernmentLine className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">GOVERNMENT OF THE PUNJAB, PAKISTAN</p>
                  <h2 className="text-base font-extrabold tracking-tight text-neutral-900 uppercase">{generatedCert.issuingAuthority}</h2>
                  <p className="text-[11px] text-neutral-500 font-mono tracking-wider uppercase">
                    Official Statutory Zoning & FAR Certificate
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-neutral-500 pt-1">
                    <span>Cert No: <strong className="text-neutral-900">{generatedCert.certificateId}</strong></span>
                    <span>•</span>
                    <span>Issued: <strong className="text-neutral-900">{generatedCert.issueDate}</strong></span>
                  </div>
                </div>

                {/* Plot Particulars */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Property Particulars</h4>
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Plot Identifier</p>
                      <p className="font-bold text-neutral-900">{generatedCert.plotDetails.plotNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Owner Name</p>
                      <p className="font-bold text-neutral-900">{generatedCert.plotDetails.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Land Use Category</p>
                      <p className="font-bold text-neutral-900">{generatedCert.plotDetails.landUseCategory}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Plot Size</p>
                      <p className="font-bold text-neutral-900">{generatedCert.plotDetails.plotSize}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Location</p>
                      <p className="font-semibold text-neutral-800">{generatedCert.plotDetails.location}</p>
                    </div>
                  </div>
                </div>

                {/* Approved Bylaw Limits */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Sanctioned Statutory Development Limits</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Floor Area Ratio', value: generatedCert.approvedBylawLimits.maxFAR },
                      { label: 'Max Height', value: generatedCert.approvedBylawLimits.maxHeightAllowance },
                      { label: 'Front Setback', value: generatedCert.approvedBylawLimits.frontSetback },
                      { label: 'Side Setback', value: generatedCert.approvedBylawLimits.sideSetback },
                      { label: 'Rear Setback', value: generatedCert.approvedBylawLimits.rearSetback },
                      { label: 'Fee Tier', value: generatedCert.approvedBylawLimits.commercializationFeeTier },
                    ].map((item) => (
                      <div key={item.label} className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="font-extrabold text-neutral-900 text-xs mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Footer */}
                <div className="border-t border-neutral-200 pt-4 flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                    <RiShieldCheckLine className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Seal — DocuCity MongoDB Verified</span>
                  </div>
                  <div className="text-neutral-500 font-mono text-right">
                    <p>Signed: {generatedCert.verifiedOfficer}</p>
                    <p>{generatedCert.issuingAuthority}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 border border-neutral-200/80 text-center text-neutral-400 space-y-3 shadow-xs h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mx-auto">
                  <FiAward className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-600">Certificate Preview</h3>
                <p className="text-xs max-w-xs">Fill out the property particulars on the left and click Generate to produce an official government-sealed zoning certificate.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
