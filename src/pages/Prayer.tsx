/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PrayerRequest } from '../types';
import { Compass, Heart, MessageSquare, Sparkles, ArrowUpCircle, EyeOff, Users, Send, Key } from 'lucide-react';

interface PrayerProps {
  setPage: (page: string) => void;
}

export default function Prayer({ setPage }: PrayerProps) {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit state parameters
  const [newContent, setNewContent] = useState('');
  const [newVisibility, setNewVisibility] = useState<'public' | 'private'>('public');
  const [formErr, setFormErr] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayers();

    const handleUpdate = () => {
      fetchPrayers(true); // silent update
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token, user]);

  const fetchPrayers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/prayer', {
        headers: token ? { 'Authorization': token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPrayers(data.prayer_requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    setFormSuccess(null);

    if (!newContent.trim()) {
      setFormErr('Content cannot be blank');
      return;
    }

    try {
      const res = await fetch('/api/prayer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          content: newContent,
          visibility: newVisibility
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Prayer Request shared! Leaders will lift you in communion.');
        setNewContent('');
        
        // Refresh local listings
        fetchPrayers();

        setTimeout(() => {
          setFormSuccess(null);
        }, 3000);
      } else {
        setFormErr(data.error || 'Failed to submit prayer');
      }
    } catch (err) {
      setFormErr('Server database timed out');
    }
  };

  const handleReaction = async (prId: string, type: 'amen' | 'pray' | 'love') => {
    if (!token || !user?.approved) return;

    try {
      const res = await fetch(`/api/prayer/${prId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ reactionType: type })
      });
      if (res.ok) {
        // Simple client-side replacement representing speedy feedback
        const data = await res.json();
        setPrayers(prayers.map(p => {
          if (p.id === prId) {
            return data.request;
          }
          return p;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isMemberVerified = user && user.approved;

  return (
    <div id="sepac-prayer-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block with Scripture quote */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            {t('prayer.title')}
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 uppercase font-semibold tracking-wider font-sans leading-relaxed">
            {t('prayer.subtitle')}
          </p>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-3 rounded"></div>
        </div>

        {/* Grid partition: Left submission form, Right wall feed of prayers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Submission Form panel (md:col-span-5) */}
          <div className="md:col-span-5 bg-white border border-amber-100 rounded-xl p-5.5 shadow-sm sticky top-28">
            <h3 className="font-serif font-bold text-[#1B2A6B] text-lg mb-4 flex items-center gap-2">
              <Compass size={16} className="text-[#C9A84C]" />
              <span>{t('prayer.submit.btn')}</span>
            </h3>

            {isMemberVerified ? (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                
                {formErr && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                    {formErr}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs">
                    {formSuccess}
                  </div>
                )}

                {/* Content text */}
                <div className="space-y-1">
                  <textarea
                    rows={4}
                    placeholder="E.g., Lift me in prayers. My mother is undergoing clinical surgery this week..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Visibility checks */}
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Who can see this?
                  </label>
                  
                  {/* Public options */}
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newVisibility === 'public'}
                      onChange={() => setNewVisibility('public')}
                      className="text-[#1B2A6B] focus:ring-0"
                    />
                    <Users size={12} className="text-[#C9A84C]" />
                    <span>{t('prayer.visibility.public')}</span>
                  </label>

                  {/* Private options */}
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer pt-0.5">
                    <input
                      type="radio"
                      name="visibility"
                      checked={newVisibility === 'private'}
                      onChange={() => setNewVisibility('private')}
                      className="text-[#1B2A6B] focus:ring-0"
                    />
                    <EyeOff size={11} className="text-gray-400" />
                    <span>{t('prayer.visibility.private')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-extrabold uppercase text-xs tracking-widest border border-[#1B2A6B] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Send size={12} />
                  <span>Share Prayer</span>
                </button>

              </form>
            ) : (
              <div className="text-center p-4 rounded-xl bg-[#FCF9F2] border border-dashed border-amber-200/50 leading-relaxed text-xs">
                <Key size={26} className="text-[#C9A84C] mx-auto mb-2.5 animate-pulse" />
                <p className="text-gray-500 font-medium">
                  Register or login and wait for admin registration clearance to write on the prayer wall or react to others.
                </p>
                <button
                  onClick={() => setPage('auth')}
                  className="mt-3.5 px-4 py-1.5 rounded bg-[#C9A84C] text-[#1B2A6B] font-bold uppercase text-[10px]"
                >
                  {t('nav.login')}
                </button>
              </div>
            )}
          </div>

          {/* Wall Feed Cards (md:col-span-7) */}
          <div className="md:col-span-7 space-y-5">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-44" />
              ))
            ) : prayers.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
                <Sparkles size={36} className="text-[#C9A84C] mx-auto mb-2.5" />
                <p className="text-xs text-gray-500 font-medium">Prayer wall is currently quiet. Share yours!</p>
              </div>
            ) : (
              prayers.map((pr) => {
                const reacts = pr.reactions || { amen: [], pray: [], love: [] };
                
                const hasAmen = user && reacts.amen?.includes(user.email);
                const hasPray = user && reacts.pray?.includes(user.email);
                const hasLove = user && reacts.love?.includes(user.email);

                return (
                  <div
                    key={pr.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 hover:border-amber-100 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      {/* Author row & tags */}
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2.5 mb-3">
                        <span className="text-xs font-bold text-[#1B2A6B]">{pr.author_name}</span>
                        
                        <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-wider">
                          {pr.visibility === 'private' ? (
                            <span className="bg-purple-50 text-purple-700 py-0.5 px-2 rounded-full border border-purple-100 flex items-center gap-0.5" title="Only author & pastors/chaplain can see this">
                              <EyeOff size={9} /> Private Request
                            </span>
                          ) : (
                            <span className="text-gray-400">Public Wall</span>
                          )}
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-400 font-medium">{new Date(pr.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Prayer request request body */}
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-serif italic mb-4 whitespace-pre-wrap">
                        "{pr.content}"
                      </p>
                    </div>

                    {/* Reaction Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-50 pt-3">
                      {/* Amen Trigger */}
                      <button
                        onClick={() => handleReaction(pr.id, 'amen')}
                        disabled={!isMemberVerified}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                          hasAmen
                            ? 'bg-amber-100/70 text-amber-800 border-amber-200'
                            : isMemberVerified
                              ? 'bg-gray-50 hover:bg-amber-50 hover:text-amber-800 text-gray-500 border-slate-100/60'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent'
                        }`}
                      >
                        {t('prayer.react.amen')} ({reacts.amen?.length || 0})
                      </button>

                      {/* Praying Trigger */}
                      <button
                        onClick={() => handleReaction(pr.id, 'pray')}
                        disabled={!isMemberVerified}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                          hasPray
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isMemberVerified
                              ? 'bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-500 border-slate-100/60'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent'
                        }`}
                      >
                        {t('prayer.react.pray')} ({reacts.pray?.length || 0})
                      </button>

                      {/* Love Heart Trigger */}
                      <button
                        onClick={() => handleReaction(pr.id, 'love')}
                        disabled={!isMemberVerified}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                          hasLove
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isMemberVerified
                              ? 'bg-gray-50 hover:bg-red-50 hover:text-red-700 text-gray-500 border-slate-100/60'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent'
                        }`}
                      >
                        {t('prayer.react.love')} ({reacts.love?.length || 0})
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
