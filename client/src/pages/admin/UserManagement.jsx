import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiPlus, 
  FiShield, 
  FiUserCheck, 
  FiUserX, 
  FiRefreshCw, 
  FiKey, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle 
} from 'react-icons/fi';
import { 
  RiBuildingLine, 
  RiShieldCheckLine, 
  RiGovernmentLine 
} from 'react-icons/ri';
import { ProvisionModal } from './ProvisionModal';
import { fetchUsersList, updateUserStatusApi } from '../../services/api';

export function UserManagementPage({ globalSearchTerm = '', globalDepartmentFilter = 'All' }) {
  const [users, setUsers] = useState([
    {
      id: 'usr-001',
      name: 'Public Citizen',
      email: 'citizen@lahore.gov.pk',
      role: 'public',
      department: 'Public Domain',
      status: 'Active',
      lastActive: 'Just now',
      cnic: '35202-4410294-2',
      initials: 'PC',
      password: 'password123'
    },
    {
      id: 'usr-002',
      name: 'Officer Tariq Mahmood',
      email: 'officer@lda.gop.pk',
      role: 'officer',
      department: 'LDA Commercial Verification Wing',
      status: 'Active',
      lastActive: '10 mins ago',
      cnic: '35202-1294819-1',
      initials: 'TM',
      password: 'officer123'
    },
    {
      id: 'usr-003',
      name: 'System Admin',
      email: 'admin@docucity.gov.pk',
      role: 'admin',
      department: 'Punjab Urban Development Authority',
      status: 'Active',
      lastActive: 'Just now',
      cnic: '35202-0000000-0',
      initials: 'SA',
      password: 'admin123'
    }
  ]);

  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(true);

  // Fetch live users from MongoDB backend on mount
  const loadUsersFromDb = async () => {
    const apiUsers = await fetchUsersList();
    if (apiUsers && apiUsers.length > 0) {
      const formatted = apiUsers.map(u => ({
        id: u.userId || u._id || `usr-${Math.random().toString(36).substr(2, 6)}`,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || 'LDA',
        status: u.status || 'Active',
        lastActive: 'Active',
        cnic: u.cnic || '35202-XXXXXXX-X',
        initials: u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U',
        password: u.password || (u.email.includes('officer') ? 'officer123' : u.email.includes('admin') ? 'admin123' : 'LDA-Lahore-2026!')
      }));

      setUsers(formatted);
    }
  };

  useEffect(() => {
    loadUsersFromDb();
  }, []);

  // Synced search & department filters
  const searchTerm = localSearch || globalSearchTerm;
  const activeDeptFilter = departmentFilter !== 'All' ? departmentFilter : globalDepartmentFilter;

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.cnic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
      const matchesDept = activeDeptFilter === 'All' || u.department.includes(activeDeptFilter);
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, activeDeptFilter, statusFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    setOpenDropdownId(null);
    try {
      await updateUserStatusApi(userId, newStatus);
    } catch (e) {}
  };

  const handleProvisionSuccess = (newOfficer) => {
    setUsers((prev) => [newOfficer, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* ── Metric Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Registered Accounts</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{users.length}</p>
          <p className="text-[11px] text-neutral-500 font-mono mt-1">MongoDB Verified Database</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Municipal Officers</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">
            {users.filter((u) => u.role === 'officer').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">LDA / WASA / MCL Staff</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Public Citizens & Architects</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">
            {users.filter((u) => u.role === 'public' || u.role === 'citizen').length}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Public statutory namespace</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Super Administrators</p>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">
            {users.filter((u) => u.role === 'admin').length}
          </p>
          <p className="text-[11px] text-neutral-700 font-mono mt-1">Root governance clearance</p>
        </div>
      </div>

      {/* ── Filter Bar & Actions ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Identity & Role Directory</h2>
            <p className="text-xs text-neutral-400">Manage officer credentials, department assignments, and access state</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-neutral-200 flex items-center space-x-1.5 cursor-pointer"
            >
              {showPasswords ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Hide Credentials' : 'Show Credentials'}</span>
            </button>

            <button
              onClick={() => setIsProvisionOpen(true)}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Provision Officer</span>
            </button>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter by name, email, or CNIC..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3 py-2 text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="officer">Municipal Officers</option>
              <option value="public">Public Citizens</option>
              <option value="admin">Super Admins</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3 py-2 text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="LDA">LDA (Lahore Development Authority)</option>
              <option value="WASA">WASA (Water & Sanitation)</option>
              <option value="MCL">MCL (Metropolitan Corporation)</option>
              <option value="Urban Unit">Punjab Urban Unit</option>
              <option value="Public Domain">Public Domain</option>
            </select>
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3 py-2 text-xs text-neutral-800 font-medium focus:bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Disabled">Disabled Accounts</option>
            </select>
          </div>
        </div>

        {/* ── Full User Records List ──────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-neutral-50/60 hover:bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all text-xs shadow-xs"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {user.initials || 'U'}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm truncate">{user.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          user.role === 'admin'
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : user.role === 'officer'
                            ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-neutral-500 font-mono text-[11px] truncate">
                      {user.email} · CNIC: {user.cnic}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-600 pt-0.5">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 font-semibold text-neutral-700">
                        {user.department}
                      </span>
                      {showPasswords && (
                        <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-800 font-mono">
                          Pass: {user.password}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end lg:self-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                      user.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {user.status}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all border text-xs cursor-pointer ${
                      user.status === 'Active'
                        ? 'bg-white hover:bg-rose-50 text-rose-700 border-neutral-200 hover:border-rose-200'
                        : 'bg-neutral-900 text-white hover:bg-black border-neutral-900'
                    }`}
                  >
                    {user.status === 'Active' ? 'Disable' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400 font-mono text-xs">
              No registered users found matching the search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Provision Officer Modal */}
      <ProvisionModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onProvisionSuccess={handleProvisionSuccess}
      />
    </div>
  );
}
