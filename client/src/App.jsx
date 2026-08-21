import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { DashboardPage } from './pages/index';
import { PortalPage } from './pages/portal';
import { UploadModal } from './components/admin/UploadModal';
import { CitizenAuth } from './pages/auth/CitizenAuth';
import { OfficerAuth } from './pages/auth/OfficerAuth';
import { AdminAuth } from './pages/auth/AdminAuth';
import { AdminLayout } from './pages/admin/AdminLayout';
import { UserManagementPage } from './pages/admin/UserManagement';

export default function App() {
  // Navigation views: 'gis' | 'auth-citizen' | 'auth-officer' | 'auth-admin' | 'officer-portal' | 'admin-users'
  const [currentView, setCurrentView] = useState('gis');

  // Authenticated user states for each scope
  const [citizenUser, setCitizenUser] = useState(null);
  const [officerUser, setOfficerUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Admin layout state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalDepartmentFilter, setGlobalDepartmentFilter] = useState('All');

  // Login Success Handlers
  const handleCitizenLoginSuccess = (userObj) => {
    setCitizenUser(userObj);
    setCurrentView('gis');
  };

  const handleOfficerLoginSuccess = (userObj) => {
    setOfficerUser(userObj);
    setCurrentView('officer-portal');
  };

  const handleAdminLoginSuccess = (userObj) => {
    setAdminUser(userObj);
    setCurrentView('admin-users');
  };

  // 1. ISOLATED VIEW: Super Admin Governance Dashboard (/admin/users)
  if (currentView === 'admin-users') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={() => { setAdminUser(null); setCurrentView('auth-admin'); }}
        onOpenProvision={() => setIsProvisionModalOpen(true)}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
        departmentFilter={globalDepartmentFilter}
        setDepartmentFilter={setGlobalDepartmentFilter}
      >
        <UserManagementPage
          globalSearchTerm={globalSearchTerm}
          globalDepartmentFilter={globalDepartmentFilter}
        />
      </AdminLayout>
    );
  }

  // 2. ISOLATED VIEW: Super Admin Dedicated Login (/auth/admin/login)
  if (currentView === 'auth-admin') {
    return (
      <AdminAuth
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // 3. ISOLATED VIEW: Municipal Officer Workspace (/officer/portal)
  if (currentView === 'officer-portal') {
    return (
      <PortalPage
        officerUser={officerUser}
        onOfficerLogout={() => { setOfficerUser(null); setCurrentView('auth-officer'); }}
      />
    );
  }

  // 4. ISOLATED VIEW: Municipal Officer Dedicated Login (/auth/officer/login)
  if (currentView === 'auth-officer') {
    return (
      <OfficerAuth
        onNavigateToPortal={() => setCurrentView('officer-portal')}
        onLoginSuccess={handleOfficerLoginSuccess}
      />
    );
  }

  // 5. ISOLATED VIEW: Citizen Authentication (/auth/citizen)
  if (currentView === 'auth-citizen') {
    return (
      <CitizenAuth
        onNavigateToGis={() => setCurrentView('gis')}
        onLoginSuccess={handleCitizenLoginSuccess}
      />
    );
  }

  // 6. PUBLIC VIEW: Interactive Public GIS Policy Explorer (/)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={currentView}
        setActiveTab={setCurrentView}
        citizenUser={citizenUser}
        onCitizenLogout={() => setCitizenUser(null)}
      />

      <main className="flex-1 overflow-hidden">
        <DashboardPage />
      </main>
    </div>
  );
}
