/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Mail, Phone, BookOpen, Key, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { t } = useLanguage();
  const { user, token, updateProfile, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load user data upon initial mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      setGradYear(user.graduation_year);
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(false);

    if (!name.trim() || !gradYear.trim()) {
      setErr('Name and Graduation Year are required');
      return;
    }

    setLoading(true);
    try {
      const ok = await updateProfile({
        name,
        graduation_year: gradYear,
        bio,
        phone,
        avatar_url: avatarUrl
      });
      if (ok) {
        setSuccess(true);
        refreshProfile();
      } else {
        setErr('Server processing failed');
      }
    } catch (e) {
      setErr('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#FCF9F2] min-h-screen py-20 px-4 text-center">
        <Key size={40} className="text-[#C9A84C] mx-auto mb-2.5 animate-pulse" />
        <h3 className="font-serif font-bold text-gray-700 text-lg">Access Restrained</h3>
        <p className="text-xs text-gray-500 mt-1">Please login to view your profile dashboard.</p>
      </div>
    );
  }

  return (
    <div id="sepac-profile-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Core Frame header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            {t('nav.profile')}
          </h1>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-2 rounded"></div>
        </div>

        {/* Info Grid split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Card left: Meta badges (md:col-span-4) */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 text-center md:col-span-4 flex flex-col items-center">
            {/* Portrait */}
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#C9A84C]/60 shadow-md mb-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-50 text-[#1B2A6B] flex items-center justify-center font-bold text-3xl border-4 border-[#C9A84C]/60 shadow-md mb-4">
                {user.name.charAt(0)}
              </div>
            )}

            <h2 className="font-serif font-bold text-[#1B2A6B] text-lg leading-tight">
              {user.name}
            </h2>

            <div className="flex flex-col items-center space-y-1.5 mt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                Grad Year: {user.graduation_year}
              </span>
              
              {/* Role badge */}
              <span className="bg-[#1B2A6B] text-[#C9A84C] border border-[#C9A84C]/30 text-[9px] font-bold uppercase py-0.5 px-2.5 rounded-full block">
                {user.role}
              </span>

              {/* Verified badge */}
              {user.approved ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9.5px] font-bold uppercase py-0.5 px-2 rounded-full flex items-center gap-0.5 mt-1 select-none">
                  <CheckCircle size={10} className="fill-emerald-800 text-white" />
                  <span>Approved Classmate</span>
                </span>
              ) : (
                <span className="bg-amber-50/60 text-amber-800 border border-amber-100 text-[9.5px] font-bold uppercase py-0.5 px-2 rounded-full block mt-1 select-none">
                  Awaiting Verification
                </span>
              )}
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            <div className="space-y-3.5 text-left w-full text-xs text-gray-500 font-medium">
              <div className="flex gap-2 min-w-0">
                <Mail size={13} className="text-[#C9A84C] shrink-0 mt-0.5" />
                <span className="truncate w-full block" title={user.email}>{user.email}</span>
              </div>
              <div className="flex gap-2">
                <Phone size={13} className="text-[#C9A84C] shrink-0 mt-0.5" />
                <span>{user.phone || 'No phone registered'}</span>
              </div>
              {user.bio && (
                <div className="flex gap-2">
                  <BookOpen size={13} className="text-[#C9A84C] shrink-0 mt-0.5" />
                  <p className="italic font-serif leading-relaxed">"{user.bio}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Form write side (md:col-span-8) */}
          <div className="bg-white rounded-xl border border-amber-100 p-6 md:p-8 md:col-span-8">
            <h3 className="font-serif font-bold text-[#1B2A6B] text-xl mb-6">
              Update Profile Credentials
            </h3>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium mb-6 animate-fadeIn">
                Your profile update was saved successfully!
              </div>
            )}
            {err && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium mb-6">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('auth.fullname')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Grad year */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('auth.grad')}
                </label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('auth.phone')}
                </label>
                <input
                  type="text"
                  placeholder="+250..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Profile Image Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B] block">
                  Profile Picture (Upload from files)
                </label>
                <div className="flex items-center gap-4 py-2 border border-dashed border-gray-200 rounded-lg px-4 bg-slate-50/50">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Current avatar"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A84C]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-50 text-[#1B2A6B] flex items-center justify-center font-bold text-xl border-2 border-[#C9A84C]">
                      {name ? name.charAt(0) : '?'}
                    </div>
                  )}
                  <div className="flex-grow flex flex-col gap-1.5">
                    <label className="inline-block py-1.5 px-3 bg-white text-xs text-[#1B2A6B] font-bold border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-slate-100 text-center transition-all">
                      <span>Choose Portrait Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAvatarUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-left text-red-500 hover:text-red-700 text-[10px] font-bold"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Biography Custom text */}
              <div className="space-y-1">
                <label className="text-[#1B2A6B] text-xs font-bold uppercase tracking-wider">
                  Biographical Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell others about what you have been doing since graduation, your ministry involvements..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-extrabold uppercase text-xs tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer shadow"
              >
                {loading ? 'Saving Updates...' : 'Save Profile Changes'}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
