/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Compass, Key, Lock, Mail, Phone, Calendar, Loader, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import SepacLogo from '../components/SepacLogo';

interface AuthProps {
  setPage: (page: string) => void;
}

export default function Auth({ setPage }: AuthProps) {
  const { t } = useLanguage();
  const { login, register, loading, error, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrad, setRegGrad] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAvatar, setRegAvatar] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [localErr, setLocalErr] = useState<string | null>(null);
  const [regStateSent, setRegStateSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLocalErr('Email and Password copy lines cannot be empty');
      return;
    }

    try {
      const ok = await login(loginEmail, loginPassword);
      if (ok) {
        setPage('home');
      }
    } catch (err) {
      setLocalErr('Authentication timed-out');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regGrad.trim()) {
      setLocalErr('Complete all required inputs marked in the forms');
      return;
    }

    try {
      const ok = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        graduation_year: regGrad,
        phone: regPhone || undefined,
        avatar_url: regAvatar || undefined
      });
      if (ok) {
        setRegStateSent(true);
        // Reset state
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegGrad('');
        setRegPhone('');
        setRegAvatar('');
      }
    } catch (err) {
      setLocalErr('Registration timed out');
    }
  };

  return (
    <div id="sepac-auth-portal" className="bg-[#FCF9F2] min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-amber-100 shadow-xl overflow-hidden">
        
        {/* Top Branding banner */}
        <div className="bg-[#1B2A6B] text-white p-6 text-center border-b-2 border-[#C9A84C] relative flex flex-col items-center">
          <SepacLogo size={80} />
          <h2 className="font-serif font-extrabold text-xl mt-3 tracking-wide select-none">
            {t('brand.title')}
          </h2>
          <p className="text-[10px] text-[#C9A84C] font-semibold uppercase tracking-widest mt-1">
            {t('brand.tagline')}
          </p>
        </div>

        {/* Dynamic pending verification review message box */}
        {regStateSent ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn select-none">
            <ShieldCheck size={40} className="text-[#C9A84C] mx-auto animate-bounce" />
            <h3 className="font-serif font-extrabold text-[#1B2A6B] text-lg">
              {t('auth.pending.title')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-serif italic text-center">
              {t('auth.pending.desc')}
            </p>
            <button
              onClick={() => {
                setRegStateSent(false);
                setActiveTab('login');
              }}
              className="mt-4 px-6 py-2 bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-[#1B2A6B]"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            
            {/* Nav Headers tabs */}
            <div className="flex border-b border-gray-100 pb-3 mb-6 font-bold uppercase tracking-wider text-xs justify-center gap-6">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setLocalErr(null);
                }}
                className={`pb-1.5 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'login'
                    ? 'border-[#1B2A6B] text-[#1B2A6B]'
                    : 'border-transparent text-gray-400 hover:text-[#1B2A6B]'
                }`}
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setLocalErr(null);
                }}
                className={`pb-1.5 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'register'
                    ? 'border-[#1B2A6B] text-[#1B2A6B]'
                    : 'border-transparent text-gray-400 hover:text-[#1B2A6B]'
                }`}
              >
                {t('nav.register')}
              </button>
            </div>

            {/* Error notifications */}
            {(error || localErr) && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-semibold mb-5 leading-relaxed">
                {localErr || error}
              </div>
            )}

            {/* Tab 1: Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="alumni@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-gray-205 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>
                </div>

                {/* Password Check */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.pwd')}
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-205 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-extrabold uppercase text-xs tracking-widest border border-[#1B2A6B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {loading ? <Loader size={12} className="animate-spin" /> : <LogIn size={13} />}
                  <span>{t('auth.signin.btn')}</span>
                </button>

              </form>
            )}

            {/* Tab 2: Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.fullname')} *
                  </label>
                  <input
                    type="text"
                    placeholder="Jean Paul Ruziziri"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.email')} *
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                 {/* Password field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.pwd')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Graduation Year */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.grad')} *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., 2004"
                    value={regGrad}
                    onChange={(e) => setRegGrad(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    {t('auth.phone')} (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., +250 788 000 000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Profile Portrait Upload Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                    Profile Picture (Upload from files)
                  </label>
                  <div className="flex items-center gap-3 py-1 px-1.5 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                    {regAvatar ? (
                      <img
                        src={regAvatar}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <User size={16} />
                      </div>
                    )}
                    <label className="flex-grow flex flex-col items-center justify-center py-1.5 bg-white text-[#1B2A6B] rounded-md border border-gray-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[11px] font-bold text-center">
                      <span>Choose Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setRegAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {regAvatar && (
                      <button
                        type="button"
                        onClick={() => setRegAvatar('')}
                        className="text-red-500 hover:text-red-700 text-[10px] font-bold px-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-extrabold uppercase text-xs tracking-widest border border-[#1B2A6B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  {loading ? <Loader size={12} className="animate-spin" /> : <UserPlus size={13} />}
                  <span>{t('auth.signup.btn')}</span>
                </button>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
