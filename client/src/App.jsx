import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { DashboardPage } from './pages/index';
import { PortalPage } from './pages/portal';
import { UploadModal } from './components/admin/UploadModal';
import { CitizenAuth } from './pages/auth/CitizenAuth';
import { OfficerAuth } from './pages/auth/OfficerAuth';
import { AdminAuth } from './pages/auth/AdminAuth';
import { AdminLayout } from './pages/admin/AdminLayout';
import { UserManagementPage } from './pages/admin/UserManagement';
import { SecurityManagementPage } from './pages/admin/SecurityManagement';
import { AuditMonitoringPage } from './pages/admin/AuditMonitoring';
import { GlobalControlPage } from './pages/admin/GlobalControl';

export default function App() {
  // Resolve view state from URL pathname
  const getViewFromPath = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin/audit') || path === '/admin/audit') return 'admin-audit';
    if (path.includes('/admin/settings') || path === '/admin/settings') return 'admin-settings';
    if (path.includes('/admin/security') || path === '/admin/security') return 'admin-security';
    if (path.includes('/auth/admin') || path.includes('/admin/login')) return 'auth-admin';
    if (path.includes('/admin/users') || path === '/admin') return 'admin-users';
    if (path.includes('/auth/officer') || path.includes('/officer/login')) return 'auth-officer';
    if (path.includes('/officer/portal') || path === '/portal') return 'officer-portal';
    if (path.includes('/auth/citizen') || path === '/citizen') return 'auth-citizen';
    return 'gis';
  };

  const [currentView, setCurrentView] = useState(getViewFromPath);

  // Authenticated user states
  const [citizenUser, setCitizenUser] = useState(null);
  const [officerUser, setOfficerUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Admin layout state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalDepartmentFilter, setGlobalDepartmentFilter] = useState('All');

  // Sync state with browser URL popstate changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToView = (targetView) => {
    setCurrentView(targetView);
    let path = '/';
    if (targetView === 'auth-citizen') path = '/auth/citizen';
    else if (targetView === 'auth-officer') path = '/auth/officer/login';
    else if (targetView === 'auth-admin') path = '/auth/admin/login';
    else if (targetView === 'officer-portal') path = '/officer/portal';
    else if (targetView === 'admin-users') path = '/admin/users';
    else if (targetView === 'admin-security') path = '/admin/security';
    else if (targetView === 'admin-audit') path = '/admin/audit';
    else if (targetView === 'admin-settings') path = '/admin/settings';

    window.history.pushState({}, '', path);
  };

  // Login Success Handlers
  const handleCitizenLoginSuccess = (userObj) => {
    setCitizenUser(userObj);
    navigateToView('gis');
  };

  const handleOfficerLoginSuccess = (userObj) => {
    setOfficerUser(userObj);
    navigateToView('officer-portal');
  };

  const handleAdminLoginSuccess = (userObj) => {
    setAdminUser(userObj);
    navigateToView('admin-users');
  };

  // 1. VIEW: Super Admin System Monitoring & Audit Logs (/admin/audit)
  if (currentView === 'admin-audit') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={() => { setAdminUser(null); navigateToView('auth-admin'); }}
        onOpenProvision={() => setIsProvisionModalOpen(true)}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
        departmentFilter={globalDepartmentFilter}
        setDepartmentFilter={setGlobalDepartmentFilter}
        activeAdminTab="admin-audit"
        setActiveAdminTab={navigateToView}
      >
        <AuditMonitoringPage />
      </AdminLayout>
    );
  }

  // 2. VIEW: Super Admin Global Platform Control (/admin/settings)
  if (currentView === 'admin-settings') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={() => { setAdminUser(null); navigateToView('auth-admin'); }}
        onOpenProvision={() => setIsProvisionModalOpen(true)}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
        departmentFilter={globalDepartmentFilter}
        setDepartmentFilter={setGlobalDepartmentFilter}
        activeAdminTab="admin-settings"
        setActiveAdminTab={navigateToView}
      >
        <GlobalControlPage />
      </AdminLayout>
    );
  }

  // 3. VIEW: Super Admin Security & Namespace Isolation (/admin/security)
  if (currentView === 'admin-security') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={() => { setAdminUser(null); navigateToView('auth-admin'); }}
        onOpenProvision={() => setIsProvisionModalOpen(true)}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
        departmentFilter={globalDepartmentFilter}
        setDepartmentFilter={setGlobalDepartmentFilter}
        activeAdminTab="admin-security"
        setActiveAdminTab={navigateToView}
      >
        <SecurityManagementPage />
      </AdminLayout>
    );
  }

  // 4. VIEW: Super Admin Governance Dashboard (/admin/users)
  if (currentView === 'admin-users') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={() => { setAdminUser(null); navigateToView('auth-admin'); }}
        onOpenProvision={() => setIsProvisionModalOpen(true)}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
        departmentFilter={globalDepartmentFilter}
        setDepartmentFilter={setGlobalDepartmentFilter}
        activeAdminTab="admin-users"
        setActiveAdminTab={navigateToView}
      >
        <UserManagementPage
          globalSearchTerm={globalSearchTerm}
          globalDepartmentFilter={globalDepartmentFilter}
        />
      </AdminLayout>
    );
  }

  // 5. VIEW: Super Admin Dedicated Login (/auth/admin/login)
  if (currentView === 'auth-admin') {
    return (
      <AdminAuth
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // 6. VIEW: Municipal Officer Workspace (/officer/portal)
  if (currentView === 'officer-portal') {
    return (
      <PortalPage
        officerUser={officerUser}
        onOfficerLogout={() => { setOfficerUser(null); navigateToView('auth-officer'); }}
      />
    );
  }

  // 7. VIEW: Municipal Officer Dedicated Login (/auth/officer/login)
  if (currentView === 'auth-officer') {
    return (
      <OfficerAuth
        onNavigateToPortal={() => navigateToView('officer-portal')}
        onLoginSuccess={handleOfficerLoginSuccess}
      />
    );
  }

  // 8. VIEW: Citizen Authentication (/auth/citizen)
  if (currentView === 'auth-citizen') {
    return (
      <CitizenAuth
        onNavigateToGis={() => navigateToView('gis')}
        onLoginSuccess={handleCitizenLoginSuccess}
      />
    );
  }

  // 9. PUBLIC DEFAULT VIEW: Interactive Public GIS Policy Explorer (/)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={currentView}
        setActiveTab={navigateToView}
        citizenUser={citizenUser}
        onCitizenLogout={() => setCitizenUser(null)}
      />

      <main className="flex-1 overflow-hidden">
        <DashboardPage />
      </main>
    </div>
  );
}
