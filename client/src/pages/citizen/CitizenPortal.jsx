import React, { useState } from 'react';
import { Book, Download, Search, Filter, FileText, Calendar, Building2, MapPin, User } from 'lucide-react';

export function CitizenPortalPage({ user, onOpenMap }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const gazettes = [
    { id: 1, title: 'LDA Building and Zoning Regulations 2026', authority: 'LDA', category: 'Building Bylaws', date: '2026-02-15', size: '4.2 MB' },
    { id: 2, title: 'Lahore Master Plan 2050', authority: 'LDA', category: 'Master Plans', date: '2025-11-10', size: '12.5 MB' },
    { id: 3, title: 'WASA Water Tariff and Sewerage Regulations', authority: 'WASA', category: 'Water Tariffs', date: '2026-01-05', size: '2.1 MB' },
    { id: 4, title: 'Environmental Protection Guidelines for Commercial Zones', authority: 'EPA', category: 'Environmental Reports', date: '2025-08-20', size: '3.8 MB' },
    { id: 5, title: 'Johar Town Traffic & Setback Policy', authority: 'MCL', category: 'Building Bylaws', date: '2026-03-01', size: '1.5 MB' },
  ];

  const filteredGazettes = gazettes.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuth = selectedAuthority === 'All' || g.authority === selectedAuthority;
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesAuth && matchesCat;
  });

  const handleDownload = (gazette) => {
    // Generate a mock PDF/Text file for the citizen to download
    const content = `OFFICIAL MUNICIPAL GAZETTE RECORD\n\nTitle: ${gazette.title}\nIssuing Authority: ${gazette.authority}\nCategory: ${gazette.category}\nDate Published: ${gazette.date}\n\n------------------------------------------------------------\nThis is a securely retrieved, PII-redacted public document \ndownloaded from the DocuCity Lahore GIS Policy Portal.\n------------------------------------------------------------`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gazette.title.replace(/\s+/g, '_')}_Redacted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <User className="w-8 h-8 text-emerald-400" />
              <span>Welcome to your Citizen Portal, {user ? user.name : 'Muhammad Saad'}</span>
            </h1>
            <p className="text-slate-400 mt-2">Access public municipal gazettes, track your queries, and explore verified urban policies.</p>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interactive Map</h3>
            <p className="text-sm text-slate-400 mb-4">Explore zoning laws directly on the map using Leaflet and GeoJSON overlays.</p>
            <button
              onClick={onOpenMap}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center cursor-pointer"
            >
              Open Map &rarr;
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bilingual RAG Assistant</h3>
            <p className="text-sm text-slate-400 mb-4">Ask policy questions in English or Urdu and get clause-level legal citations.</p>
            <button
              onClick={onOpenMap}
              className="text-teal-400 hover:text-teal-300 text-sm font-semibold flex items-center cursor-pointer"
            >
              Start Chat &rarr;
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Policy Library</h3>
            <p className="text-sm text-slate-400 mb-4">Browse and download verified public municipal gazettes and regulations.</p>
            <span className="text-blue-400 text-sm font-semibold flex items-center">Scroll down &darr;</span>
          </div>
        </div>

        {/* Gazette & Policy Library Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Book className="w-6 h-6 text-emerald-400" />
              <span>Public Municipal Gazette & Policy Library</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search gazettes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <select 
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none"
              >
                <option value="All">All Authorities</option>
                <option value="LDA">LDA (Lahore Development Authority)</option>
                <option value="WASA">WASA</option>
                <option value="MCL">MCL</option>
                <option value="EPA">EPA</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none appearance-none"
              >
                <option value="All">All Categories</option>
                <option value="Building Bylaws">Building Bylaws</option>
                <option value="Master Plans">Master Plans</option>
                <option value="Water Tariffs">Water Tariffs</option>
                <option value="Environmental Reports">Environmental Reports</option>
              </select>
            </div>
          </div>

          {/* Gazette List */}
          <div className="space-y-4">
            {filteredGazettes.length > 0 ? filteredGazettes.map(g => (
              <div key={g.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between hover:border-emerald-500/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-900 rounded-lg text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-white">{g.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="flex items-center text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                        <Building2 className="w-3 h-3 mr-1" /> {g.authority}
                      </span>
                      <span className="flex items-center text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                        <Book className="w-3 h-3 mr-1" /> {g.category}
                      </span>
                      <span className="flex items-center text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3 mr-1" /> {g.date}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(g)}
                  className="mt-4 md:mt-0 flex items-center space-x-2 bg-slate-800 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF ({g.size})</span>
                </button>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                No gazettes found matching your search criteria.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
