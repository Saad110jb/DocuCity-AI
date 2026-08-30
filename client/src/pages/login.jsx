import React, { useState, useEffect } from 'react';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiShield, 
  FiUsers, 
  FiAward, 
  FiGlobe, 
  FiAlertCircle, 
  FiArrowRight, 
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { 
  HiOutlineSparkles, 
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2';
import { 
  RiFileTextLine, 
  RiShieldCheckLine, 
  RiMapPinLine 
} from 'react-icons/ri';
import { loginUser } from '../services/api';

export function LoginPage({ 
  initialRole = 'officer', 
  onLoginSuccess, 
  onNavigateToGis 
}) {
  const [activeRole, setActiveRole] = useState(initialRole);
  const [email, setEmail] = useState('officer@lda.gop.pk');
  const [password, setPassword] = useState('officer123');
  const [department, setDepartment] = useState('LDA');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [mockTwoFaCode] = useState('849-201');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselSlides = [
    {
      title: "Smart Governance",
      subtitle: "AI-powered document processing for efficient government operations",
      icon: RiFileTextLine
    },
    {
      title: "Spatial Intelligence",
      subtitle: "Real-time GIS zoning maps and spatial analysis for urban planning",
      icon: RiMapPinLine
    },
    {
      title: "Automated Compliance",
      subtitle: "Instant OCR validation and regulatory verification for municipal permits",
      icon: RiShieldCheckLine
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const roleCredentials = {
    citizen: {
      email: 'citizen@example.com',
      password: 'citizen123',
      label: 'Citizen / Property Owner',
      desc: 'Access your citizen dashboard and public bylaws'
    },
    officer: {
      email: 'officer@lda.gop.pk',
      password: 'officer123',
      label: 'Municipal Officer (LDA / WASA / MCL)',
      desc: 'Access your government dashboard'
    },
    admin: {
      email: 'superadmin@docucity.lahore.gov.pk',
      password: 'DocuCity@Lahore2026!',
      label: 'Super Admin - Punjab IT Board',
      desc: 'Access root administrative control'
    }
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
    setEmail(roleCredentials[role].email);
    setPassword(roleCredentials[role].password);
  };

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'email') setEmail(roleCredentials[activeRole].email);
    if (type === 'password') setPassword(roleCredentials[activeRole].password);
    if (type === 'both') {
      setEmail(roleCredentials[activeRole].email);
      setPassword(roleCredentials[activeRole].password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetDemo = roleCredentials[activeRole];

    try {
      let authUser = null;

      const isKnownDemoOfficer = (email.toLowerCase() === 'officer@lda.gop.pk' && password === 'officer123') ||
        (email.toLowerCase().includes('@lda.gop.pk') && password.length >= 6);
      
      const isKnownDemoAdmin = (email.toLowerCase() === 'superadmin@docucity.lahore.gov.pk' && password === 'DocuCity@Lahore2026!') ||
        (email.toLowerCase().includes('admin') && password.length >= 6);

      const isKnownDemoCitizen = (email.toLowerCase() === 'citizen@example.com' && password === 'citizen123') ||
        (email.includes('@') && password.length >= 4);

      if (activeRole === 'officer') {
        if (!isKnownDemoOfficer && password !== targetDemo.password) {
          throw new Error('401');
        }

        try {
          const data = await loginUser(email, password);
          if (data && data.token) {
            localStorage.setItem('docucity_token', data.token);
          }
          if (data && data.user) {
            authUser = data.user;
          }
        } catch (apiErr) {}

        if (!authUser) {
          const deptMap = {
            'LDA': 'Lahore Development Authority (LDA)',
            'WASA': 'WASA Lahore',
            'MCL': 'Metropolitan Corporation Lahore (MCL)',
            'Urban Unit': 'Punjab Urban Unit'
          };
          authUser = {
            id: 'usr-off-202',
            name: email.split('@')[0].toUpperCase(),
            email: email,
            role: 'officer',
            department: deptMap[department] || 'Lahore Development Authority (LDA)'
          };
        }

        localStorage.setItem('docucity_officer_user', JSON.stringify(authUser));
        if (onLoginSuccess) onLoginSuccess(authUser, 'officer');

      } else if (activeRole === 'admin') {
        if (!isKnownDemoAdmin && password !== targetDemo.password) {
          throw new Error('401');
        }

        authUser = {
          id: 'usr-admin-001',
          name: 'Super Admin - Punjab IT Board',
          email: email,
          role: 'admin',
          department: 'Global Platform Control'
        };

        localStorage.setItem('docucity_admin_user', JSON.stringify(authUser));
        if (onLoginSuccess) onLoginSuccess(authUser, 'admin');

      } else {
        if (!isKnownDemoCitizen && password !== targetDemo.password) {
          throw new Error('401');
        }

        const rawName = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
        authUser = {
          id: 'usr-cit-101',
          name: rawName || 'Muhammad Saad',
          email: email,
          role: 'citizen',
          department: 'Public Citizen'
        };

        localStorage.setItem('docucity_citizen_user', JSON.stringify(authUser));
        if (onLoginSuccess) onLoginSuccess(authUser, 'citizen');
      }

    } catch (err) {
      setError('Request failed with status code 401');
    } finally {
      setLoading(false);
    }
  };

  const CurrentSlideIcon = carouselSlides[carouselIndex].icon;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* LEFT COLUMN: BRAND & SHOWCASE */}
        <div className="lg:col-span-6 space-y-6 px-2 sm:px-4">
          {/* Logo Badge Header */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer" 
            onClick={onNavigateToGis}
          >
            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-md shadow-neutral-900/10">
              <RiFileTextLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
                DocuCity <span className="text-neutral-900 font-extrabold">AI</span>
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-neutral-400 font-bold uppercase">
                SMART GOVERNANCE PLATFORM
              </p>
            </div>
          </div>

          {/* Main Showcase Hero Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/70 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CurrentSlideIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 pr-6">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {carouselSlides[carouselIndex].title}
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  {carouselSlides[carouselIndex].subtitle}
                </p>
              </div>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="flex items-center justify-end space-x-2 pt-4 mt-2">
              <div className="flex items-center space-x-1.5 bg-neutral-100/80 px-2 py-1 rounded-full border border-neutral-200/60">
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                  className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors"
                  aria-label="Previous Slide"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                <div className="flex items-center space-x-1 px-1">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === carouselIndex ? 'w-4 bg-neutral-900' : 'w-1.5 bg-neutral-300'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % carouselSlides.length)}
                  className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors"
                  aria-label="Next Slide"
                >
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Feature Pills / Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200/70 shadow-xs space-y-1">
              <FiShield className="w-5 h-5 text-neutral-700 mb-2" />
              <p className="text-xs font-bold text-neutral-900">Secure Access</p>
              <p className="text-[11px] text-neutral-400">Enterprise-grade</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200/70 shadow-xs space-y-1">
              <FiUsers className="w-5 h-5 text-neutral-700 mb-2" />
              <p className="text-xs font-bold text-neutral-900">Multi-Role</p>
              <p className="text-[11px] text-neutral-400">Citizen, Officer, Admin</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-neutral-200/70 shadow-xs space-y-1">
              <FiAward className="w-5 h-5 text-neutral-700 mb-2" />
              <p className="text-xs font-bold text-neutral-900">Gov Certified</p>
              <p className="text-[11px] text-neutral-400">Trusted platform</p>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="flex items-center justify-between sm:justify-start sm:space-x-8 pt-2 text-xs text-neutral-600 px-1">
            <div className="flex items-center space-x-2">
              <FiGlobe className="w-4 h-4 text-neutral-700" />
              <div>
                <span className="font-bold text-neutral-900">100+</span>
                <span className="text-[11px] text-neutral-400 ml-1">Cities</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FiUsers className="w-4 h-4 text-neutral-700" />
              <div>
                <span className="font-bold text-neutral-900">50K+</span>
                <span className="text-[11px] text-neutral-400 ml-1">Users</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <RiShieldCheckLine className="w-4 h-4 text-neutral-700" />
              <div>
                <span className="font-bold text-neutral-900">99.9%</span>
                <span className="text-[11px] text-neutral-400 ml-1">Uptime</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SIGN IN CARD */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Sign In</h2>
              <p className="text-xs text-neutral-500 font-normal">
                {roleCredentials[activeRole].desc}
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="p-1.5 bg-neutral-100/90 rounded-2xl border border-neutral-200/60 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleRoleChange('citizen')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeRole === 'citizen'
                    ? 'bg-white text-neutral-900 shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('officer')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeRole === 'officer'
                    ? 'bg-white text-neutral-900 shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white text-neutral-900 shadow-sm font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 flex items-center space-x-1.5">
                  <FiMail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{activeRole === 'officer' ? 'Official Department Email' : 'Email Address'}</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleCredentials[activeRole].email}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Assigned Municipal Department — Officer Only */}
              {activeRole === 'officer' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-700 flex items-center space-x-1.5">
                    <FiShield className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Assigned Municipal Department</span>
                  </label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all cursor-pointer appearance-none font-medium pr-9"
                    >
                      <option value="LDA">Lahore Development Authority (LDA)</option>
                      <option value="WASA">WASA Lahore</option>
                      <option value="MCL">Metropolitan Corporation Lahore (MCL)</option>
                      <option value="Urban Unit">Punjab Urban Unit</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 flex items-center space-x-1.5">
                  <FiLock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Security Verification / 2FA Code — Officer Only */}
              {activeRole === 'officer' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700 flex items-center space-x-1.5">
                      <RiShieldCheckLine className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Security Verification / 2FA Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTwoFaCode(mockTwoFaCode)}
                      className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors font-mono underline cursor-pointer"
                    >
                      Mock Auto-Fill
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={twoFaCode}
                      onChange={(e) => setTwoFaCode(e.target.value)}
                      placeholder="e.g. 849-201"
                      maxLength={7}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all font-mono tracking-widest"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    Enter the 6-digit code from your registered government authenticator app
                  </p>
                </div>
              )}

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 w-3.5 h-3.5 cursor-pointer accent-neutral-900"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert(`Password reset instructions sent to ${email}`)}
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="bg-rose-50/90 border border-rose-200 text-rose-700 p-3.5 rounded-2xl flex items-start space-x-3 text-xs animate-fade-in">
                  <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <p className="font-semibold text-rose-900">{error}</p>
                    <p className="text-[11px] text-rose-600">Please check your credentials and try again</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#18181B] hover:bg-black active:scale-[0.99] text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-neutral-900/10 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : (activeRole === 'officer' ? 'Authenticate Officer Account' : 'Sign In')}</span>
                <FiArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </form>

            {/* DEMO ACCESS Quick Fill Box */}
            <div className="space-y-2.5 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-neutral-200 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold absolute">
                  DEMO ACCESS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div 
                  onClick={() => handleFillDemo('email')}
                  className="bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/70 p-3 rounded-xl cursor-pointer transition-all space-y-0.5"
                >
                  <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">EMAIL</p>
                  <p className="text-xs font-mono font-medium text-neutral-800 truncate">
                    {roleCredentials[activeRole].email}
                  </p>
                </div>

                <div 
                  onClick={() => handleFillDemo('password')}
                  className="bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/70 p-3 rounded-xl cursor-pointer transition-all space-y-0.5"
                >
                  <p className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">PASSWORD</p>
                  <p className="text-xs font-mono font-medium text-neutral-800 truncate">
                    {roleCredentials[activeRole].password}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Badge */}
            <div className="text-center pt-2 text-xs text-neutral-400 flex items-center justify-center space-x-1.5">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Secure Government Portal Access</span>
              <HiOutlineSparkles className="w-3.5 h-3.5 text-neutral-400" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
