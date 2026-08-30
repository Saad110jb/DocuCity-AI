import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { DashboardPage } from './pages/index';
import { PortalPage } from './pages/portal';
import { CitizenPortalPage } from './pages/citizen/CitizenPortal';
import { UploadModal } from './components/admin/UploadModal';
import { LoginPage } from './pages/login';
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
    if (path.includes('/citizen/portal')) return 'citizen-portal';
    if (path.includes('/login')) return 'login';
    return 'gis';
  };

  const [currentView, setCurrentView] = useState(getViewFromPath);

  // Authenticated user states with localStorage persistence
  const [citizenUser, setCitizenUser] = useState(() => {
    try {
      const saved = localStorage.getItem('docucity_citizen_user');
      return saved ? JSON.parse(saved) : { name: "Muhammad Saad", email: "saad@gmail.com", role: "citizen" };
    } catch(e) {
      return { name: "Muhammad Saad", email: "saad@gmail.com", role: "citizen" };
    }
  });

  const [officerUser, setOfficerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('docucity_officer_user');
      return saved ? JSON.parse(saved) : { name: "OFFICER", email: "officer@lda.gop.pk", role: "officer", department: "Lahore Development Authority (LDA)" };
    } catch(e) {
      return { name: "OFFICER", email: "officer@lda.gop.pk", role: "officer", department: "Lahore Development Authority (LDA)" };
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('docucity_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
  });

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
    if (targetView === 'login') path = '/login';
    else if (targetView === 'auth-citizen') path = '/auth/citizen';
    else if (targetView === 'citizen-portal') path = '/citizen/portal';
    else if (targetView === 'auth-officer') path = '/auth/officer/login';
    else if (targetView === 'auth-admin') path = '/auth/admin/login';
    else if (targetView === 'officer-portal') path = '/officer/portal';
    else if (targetView === 'admin-users') path = '/admin/users';
    else if (targetView === 'admin-security') path = '/admin/security';
    else if (targetView === 'admin-audit') path = '/admin/audit';
    else if (targetView === 'admin-settings') path = '/admin/settings';

    window.history.pushState({}, '', path);
  };

  // Unified Login Success Handler for all roles
  const handleGenericLoginSuccess = (userObj, role) => {
    if (role === 'admin' || (userObj && userObj.role === 'admin')) {
      setAdminUser(userObj);
      try { localStorage.setItem('docucity_admin_user', JSON.stringify(userObj)); } catch(e) {}
      navigateToView('admin-users');
    } else if (role === 'citizen' || (userObj && (userObj.role === 'citizen' || userObj.role === 'public'))) {
      setCitizenUser(userObj);
      try { localStorage.setItem('docucity_citizen_user', JSON.stringify(userObj)); } catch(e) {}
      navigateToView('citizen-portal');
    } else {
      const formattedOfficer = {
        ...userObj,
        role: 'officer',
        department: userObj.department || 'Lahore Development Authority (LDA)'
      };
      setOfficerUser(formattedOfficer);
      try { localStorage.setItem('docucity_officer_user', JSON.stringify(formattedOfficer)); } catch(e) {}
      navigateToView('officer-portal');
    }
  };

  const handleCitizenLogout = () => {
    setCitizenUser(null);
    try {
      localStorage.removeItem('docucity_citizen_user');
    } catch(e) {}
    navigateToView('gis');
  };

  const handleOfficerLogout = () => {
    setOfficerUser(null);
    try {
      localStorage.removeItem('docucity_officer_user');
    } catch(e) {}
    navigateToView('auth-officer');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('docucity_admin_user');
    } catch(e) {}
    navigateToView('auth-admin');
  };

  // 1. Super Admin Audit Logs
  if (currentView === 'admin-audit') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
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

  // 2. Super Admin Settings
  if (currentView === 'admin-settings') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
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

  // 3. Super Admin Security
  if (currentView === 'admin-security') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
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

  // 4. Super Admin Users
  if (currentView === 'admin-users') {
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
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

  // 5. Super Admin Login
  if (currentView === 'auth-admin') {
    return (
      <LoginPage
        initialRole="admin"
        onLoginSuccess={handleGenericLoginSuccess}
        onNavigateToGis={() => navigateToView('gis')}
      />
    );
  }

  // 6. Officer Workspace
  if (currentView === 'officer-portal') {
    return (
      <PortalPage
        officerUser={officerUser}
        onOfficerLogout={handleOfficerLogout}
      />
    );
  }

  // 7. Officer Login
  if (currentView === 'auth-officer') {
    return (
      <LoginPage
        initialRole="officer"
        onLoginSuccess={handleGenericLoginSuccess}
        onNavigateToGis={() => navigateToView('gis')}
      />
    );
  }

  // 8. Citizen Login
  if (currentView === 'auth-citizen') {
    return (
      <LoginPage
        initialRole="citizen"
        onLoginSuccess={handleGenericLoginSuccess}
        onNavigateToGis={() => navigateToView('gis')}
      />
    );
  }

  // 8.1 Unified Login
  if (currentView === 'login') {
    return (
      <LoginPage
        initialRole="officer"
        onLoginSuccess={handleGenericLoginSuccess}
        onNavigateToGis={() => navigateToView('gis')}
      />
    );
  }

  // 8.5. Citizen Portal
  if (currentView === 'citizen-portal') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-neutral-900 flex flex-col font-sans">
        <Header
          activeTab={currentView}
          setActiveTab={navigateToView}
          citizenUser={citizenUser}
          onCitizenLogout={handleCitizenLogout}
        />
        <main className="flex-1">
          <CitizenPortalPage
            user={citizenUser}
            onOpenMap={() => navigateToView('gis')}
          />
        </main>
      </div>
    );
  }

  // 9. Default Interactive Policy Map
  return (
    <div className="h-screen bg-[#F4F6F8] text-neutral-900 flex flex-col font-sans overflow-hidden">
      <Header
        activeTab={currentView}
        setActiveTab={navigateToView}
        citizenUser={citizenUser}
        onCitizenLogout={handleCitizenLogout}
      />
      <main className="flex-1 overflow-hidden">
        <DashboardPage />
      </main>
    </div>
  );
}