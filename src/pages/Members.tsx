/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { Search, Filter, Calendar, Mail, Phone, Lock, Eye, ShieldCheck, Award } from 'lucide-react';

interface MembersProps {
  setPage: (page: string) => void;
}

export default function Members({ setPage }: MembersProps) {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, [token]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = token;
      }
      const res = await fetch('/api/members', { headers });
      if (res.ok) {
        const data = await res.json();
        // Only show approved members in public directory, or let admins verify pending users
        setProfiles(data.profiles.filter((p: UserProfile) => p.approved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique grad years for the filter list
  const gradYears = Array.from(new Set(profiles.map(p => p.graduation_year)))
    .filter(Boolean)
    .sort((a, b) => (b as string).localeCompare(a as string));

  // Handle Search & Filter logical queries
  const filteredProfiles = profiles.filter(profile => {
    const matchesKeyword = 
      profile.name.toLowerCase().includes(keyword.toLowerCase()) || 
      (profile.bio && profile.bio.toLowerCase().includes(keyword.toLowerCase()));
    
    const matchesYear = selectedYear ? profile.graduation_year === selectedYear : true;
    
    const matchesRole = selectedRole ? profile.role === selectedRole : true;

    return matchesKeyword && matchesYear && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[9px] font-bold uppercase py-0.5 px-2 rounded-full flex items-center gap-0.5"><Award size={10} /> Super Admin</span>;
      case 'admin':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-[9px] font-bold uppercase py-0.5 px-2 rounded-full flex items-center gap-0.5"><ShieldCheck size={10} /> Admin</span>;
      case 'moderator':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-bold uppercase py-0.5 px-2 rounded-full flex items-center gap-0.5">Mod</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 text-[9px] font-bold uppercase py-0.5 px-2 rounded-full">Member</span>;
    }
  };

  const isVerifiedUser = user && user.approved;

  return (
    <div id="sepac-members-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Core Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            {t('members.title')}
          </h1>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-2.5 rounded"></div>
        </div>

        {/* Locked Access Warning Banner for Guests/Unregistered visitors */}
        {!isVerifiedUser && (
          <div className="bg-[#1B2A6B]/5 border-2 border-[#C9A84C]/40 rounded-xl p-6 mb-8 text-center max-w-3xl mx-auto flex flex-col items-center">
            <Lock size={32} className="text-[#C9A84C] mb-3 animate-bounce" />
            <p className="text-xs sm:text-sm text-indigo-950 font-semibold mb-4 leading-relaxed font-serif italic text-center">
              {t('members.approved.only')}
            </p>
            <button
              onClick={() => setPage('auth')}
              className="px-6 py-2 rounded bg-[#C9A84C] text-[#1B2A6B] text-xs font-extrabold uppercase tracking-widest hover:bg-[#1B2A6B] hover:text-[#C9A84C] transition-all cursor-pointer shadow border border-[#C9A84C]"
            >
              {t('nav.login')} / {t('nav.register')}
            </button>
          </div>
        )}

        {/* Searching & Filtering Inputs layout */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Keyword Query Box */}
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
            <input
              type="text"
              placeholder={t('members.search.placeholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all"
            />
          </div>

          {/* Filtering dropdown layouts */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* 年份 Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-[160px] pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-wide bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              >
                <option value="">{t('members.filter.yearAll')}</option>
                {gradYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* 角色 Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full sm:w-[160px] pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-wide bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              >
                <option value="">{t('members.filter.roleAll')}</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>

        </div>

        {/* Directory Grid result grouped by graduation year */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-72" />
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl max-w-md mx-auto shadow-sm">
            <Eye size={44} className="text-gray-300 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-gray-500 text-lg">No Graduates Found</h3>
            <p className="text-xs text-gray-400 mt-1">Try resetting search labels or filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {(() => {
              // Group profiles by graduation year
              const grouped: Record<string, UserProfile[]> = {};
              filteredProfiles.forEach(profile => {
                const yr = profile.graduation_year || 'Other';
                if (!grouped[yr]) {
                  grouped[yr] = [];
                }
                grouped[yr].push(profile);
              });

              // Sort years in descending order
              const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

              return sortedYears.map(year => (
                <div key={year} className="bg-white/50 rounded-2xl p-6 border border-amber-100/40">
                  <div className="flex items-center space-x-3 mb-6 border-b border-amber-200/40 pb-3">
                    <Calendar size={18} className="text-[#C9A84C]" />
                    <h2 className="font-serif font-extrabold text-xl text-[#1B2A6B]">
                      Class of {year} <span className="text-xs font-sans text-gray-400 ml-2 font-semibold">({grouped[year].length} {grouped[year].length === 1 ? 'member' : 'members'})</span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {grouped[year].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-[#C9A84C]/50 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-all"
                      >
                        {/* Visual Top Accent colors */}
                        <div className="h-2 bg-gradient-to-r from-[#1B2A6B] to-[#C9A84C]" />
                        
                        <div className="p-5 flex-grow flex flex-col">
                          {/* Portrait & Role status */}
                          <div className="flex items-center space-x-3 mb-4.5">
                            {item.avatar_url ? (
                              <img
                                src={item.avatar_url}
                                alt={item.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C]/50"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-amber-50 text-[#1B2A6B] flex items-center justify-center font-bold text-lg border-2 border-[#C9A84C]/50">
                                {item.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <h3 className="font-serif font-bold text-[#1B2A6B] text-[15px] leading-tight truncate" title={item.name}>
                                {item.name}
                              </h3>
                              <div className="flex items-center space-x-1.5 mt-1">
                                {getRoleBadge(item.role)}
                              </div>
                            </div>
                          </div>

                          {/* Biography notes */}
                          <p className="text-xs text-gray-500 leading-relaxed font-medium italic line-clamp-3 mb-5 flex-grow font-serif">
                            {item.bio ? `"${item.bio}"` : '"Together in Christ."'}
                          </p>

                          {/* Contact information details */}
                          <div className="space-y-2 border-t border-gray-50 pt-3 text-[11px] font-semibold text-gray-600">
                            <div className="flex items-center space-x-1.5">
                              <Mail size={12} className="text-[#C9A84C]" />
                              <span className="truncate" title={item.email}>{item.email}</span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <Phone size={12} className="text-[#C9A84C]" />
                              <span>{item.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
