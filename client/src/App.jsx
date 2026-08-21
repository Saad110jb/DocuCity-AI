import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { DashboardPage } from './pages/index';
import { PortalPage } from './pages/portal';
import { UploadModal } from './components/admin/UploadModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('gis');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [user, setUser] = useState({
    id: 'usr-002',
    name: 'Officer Tariq Mahmood',
    email: 'officer@lda.gop.pk',
    role: 'officer',
    department: 'LDA Commercial Verification'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'gis' ? (
          <DashboardPage />
        ) : (
          <PortalPage />
        )}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
