import React, { useState } from 'react';
import { X, UserPlus, Building, Mail, Key, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { provisionOfficerApi } from '../../services/api';

export function ProvisionModal({ isOpen, onClose, onProvisionSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('LDA');
  const [scope, setScope] = useState('full');
  const [tempPassword, setTempPassword] = useState('LDA-Lahore-2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setLoading(true);
    setError('');

    try {
      const res = await provisionOfficerApi({
        name: fullName,
        email: email,
        department: department,
        tempPassword: tempPassword,
        scope: scope,
        role: 'officer'
      });

      setIsSuccess(true);
      setTimeout(() => {
        const savedOfficer = {
          id: res.user?.userId || res.user?._id || `usr-off-${Date.now()}`,
          name: res.user?.name || fullName,
          email: res.user?.email || email,
          role: 'officer',
          department: res.user?.department || department,
          status: 'Active',
          lastActive: 'Just now',
          cnic: res.user?.cnic || '35202-8491029-1',
          initials: fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        };
        onProvisionSuccess(savedOfficer);
        setIsSuccess(false);
        setFullName('');
        setEmail('');
        setLoading(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Provisioning error:', err);
      setError(err.response?.data?.error || 'Failed to save provisioned officer to Database.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Provision New Municipal Officer</h2>
            <p className="text-xs text-slate-400">Save & grant verified government role access in MongoDB</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-white">Officer Record Saved in MongoDB Database!</h3>
            <p className="text-xs text-slate-400">Credentials and temporary passphrase emitted to user collection.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-xs bg-rose-950/60 border border-rose-800 text-rose-400 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Officer Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Officer Hamza Sheikh"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Official Government Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hamza@lda.gop.pk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Municipal Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="LDA">Lahore Development Authority (LDA)</option>
                  <option value="WASA">WASA Lahore</option>
                  <option value="MCL">Metropolitan Corporation Lahore (MCL)</option>
                  <option value="Urban Unit">Punjab Urban Unit</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Role Scope & Permissions</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="full">Full Officer (Ingestion + OCR + Publishing)</option>
                  <option value="ingestion">Document Ingestion Only</option>
                  <option value="ocr">OCR Entity Auditor Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Initial Temporary Passphrase</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving Record into MongoDB...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Confirm & Save Officer to MongoDB</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
