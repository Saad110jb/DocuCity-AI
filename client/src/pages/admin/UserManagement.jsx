import React, { useState, useMemo } from 'react';
import {
  Users, ShieldAlert, CheckCircle2, UserCheck, Search, Filter, MoreVertical,
  Plus, Shield, UserX, RefreshCw, Key, ArrowUpRight, Building
} from 'lucide-react';
import { ProvisionModal } from './ProvisionModal';

export function UserManagementPage({ globalSearchTerm = '', globalDepartmentFilter = 'All' }) {
  const [users, setUsers] = useState([
    {
      id: 'usr-101',
      name: 'Officer Tariq Mahmood',
      email: 'officer@lda.gop.pk',
      role: 'officer',
      department: 'LDA',
      status: 'Active',
      lastActive: '10 mins ago',
      cnic: '35202-1294819-1',
      initials: 'TM'
    },
    {
      id: 'usr-102',
      name: 'Ahmad Raza Khan',
      email: 'ahmad@wasa.punjab.gov.pk',
      role: 'officer',
      department: 'WASA',
      status: 'Pending Verification',
      lastActive: '1 hour ago',
      cnic: '35201-9481023-3',
      initials: 'AK'
    },
    {
      id: 'usr-103',
      name: 'Fatima Bilal',
      email: 'fatima.planner@gmail.com',
      role: 'public',
      department: 'N/A',
      status: 'Active',
      lastActive: '2 days ago',
      cnic: '35202-4410294-2',
      initials: 'FB'
    },
    {
      id: 'usr-104',
      name: 'Super Admin - PITB',
      email: 'superadmin@docucity.lahore.gov.pk',
      role: 'admin',
      department: 'Urban Unit',
      status: 'Active',
      lastActive: 'Just now',
      cnic: '35202-0000000-0',
      initials: 'SA'
    },
    {
      id: 'usr-105',
      name: 'Usman Ghani',
      email: 'usman@mcl.gop.pk',
      role: 'officer',
      department: 'MCL',
      status: 'Suspended',
      lastActive: '5 days ago',
      cnic: '35202-5819024-5',
      initials: 'UG'
    },
    {
      id: 'usr-106',
      name: 'Zubair Shah',
      email: 'zubair.architect@studio.pk',
      role: 'public',
      department: 'N/A',
      status: 'Active',
      lastActive: '3 hours ago',
      cnic: '35202-1192834-7',
      initials: 'ZS'
    }
  ]);

  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);

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
      const matchesDept = activeDeptFilter === 'All' || u.department === activeDeptFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, activeDeptFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const publicCount = users.filter((u) => u.role === 'public').length;
    const officerCount = users.filter((u) => u.role === 'officer').length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const activeOfficers = users.filter((u) => u.role === 'officer' && u.status === 'Active').length;
    const pendingCount = users.filter((u) => u.status === 'Pending Verification').length;
    const suspendedCount = users.filter((u) => u.status === 'Suspended').length;

    return { total, publicCount, officerCount, adminCount, activeOfficers, pendingCount, suspendedCount };
  }, [users]);

  // Handlers for user actions
  const handleVerify = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Active' } : u)));
    setOpenDropdownId(null);
  };

  const handleToggleSuspend = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u
      )
    );
    setOpenDropdownId(null);
  };

  const handleChangeRole = (id, newRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    setOpenDropdownId(null);
  };

  const handleProvisionSuccess = (newOfficer) => {
    setUsers((prev) => [newOfficer, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{metrics.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-purple-400 font-semibold">{metrics.officerCount} Officers</span> •{' '}
            <span className="text-slate-300">{metrics.publicCount} Public</span> •{' '}
            <span className="text-indigo-400">{metrics.adminCount} Admin</span>
          </p>
        </div>

        {/* Active Officers */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Officers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Building className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-400 mt-2">{metrics.activeOfficers}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across LDA, WASA, MCL, Urban Unit</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pending Verification</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">{metrics.pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Super Admin Approval</p>
        </div>

        {/* Revoked / Suspended */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Suspended Access</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-2">{metrics.suspendedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Security-locked accounts</p>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter by Name, Email, Department, or CNIC..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="All">Role: All</option>
            <option value="public">Public</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="All">Dept: All</option>
            <option value="LDA">LDA</option>
            <option value="WASA">WASA</option>
            <option value="MCL">MCL</option>
            <option value="Urban Unit">Urban Unit</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Officer</span>
          </button>
        </div>
      </div>

      {/* Interactive User Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User Profile</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Department Access</th>
                <th className="p-4">Access Status</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/40 transition-all">
                  {/* User Profile */}
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xs text-slate-200 flex items-center justify-center shrink-0">
                        {u.initials}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        <p className="text-[9px] text-slate-500 font-mono">CNIC: {u.cnic}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="p-4">
                    {u.role === 'admin' && (
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Super Admin
                      </span>
                    )}
                    {u.role === 'officer' && (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Municipal Officer
                      </span>
                    )}
                    {u.role === 'public' && (
                      <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Public Citizen
                      </span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="p-4">
                    <span className="font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {u.department}
                    </span>
                  </td>

                  {/* Access Status */}
                  <td className="p-4">
                    {u.status === 'Active' && (
                      <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                    {u.status === 'Pending Verification' && (
                      <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                    {u.status === 'Suspended' && (
                      <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        <UserX className="w-3 h-3" />
                        <span>Suspended</span>
                      </span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td className="p-4 text-slate-400 text-xs font-mono">{u.lastActive}</td>

                  {/* Actions Dropdown */}
                  <td className="p-4 text-right relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openDropdownId === u.id && (
                      <div className="absolute right-4 top-12 z-30 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 text-left text-xs space-y-1 backdrop-blur-xl animate-fade-in">
                        {u.status === 'Pending Verification' && (
                          <button
                            onClick={() => handleVerify(u.id)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/60 font-semibold"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve Credentials</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleSuspend(u.id)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold ${
                            u.status === 'Suspended'
                              ? 'text-emerald-400 hover:bg-emerald-950/60'
                              : 'text-rose-400 hover:bg-rose-950/60'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{u.status === 'Suspended' ? 'Unsuspend Account' : 'Revoke / Suspend'}</span>
                        </button>

                        <button
                          onClick={() => handleChangeRole(u.id, u.role === 'officer' ? 'admin' : 'officer')}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                          <span>Toggle Role Scope</span>
                        </button>

                        <button
                          onClick={() => setOpenDropdownId(null)}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset Passphrase</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
