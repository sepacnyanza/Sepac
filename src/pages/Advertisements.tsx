/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Advertisement } from '../types';
import { Megaphone, Trash2, ShieldAlert, PlusCircle, ExternalLink, Phone, Calendar, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface AdvertisementsProps {
  setPage: (page: string) => void;
}

export default function Advertisements({ setPage }: AdvertisementsProps) {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const isAdmin = user && user.email === 'sepacnyanza@gmail.com';

  useEffect(() => {
    fetchAds();

    const handleUpdate = () => {
      fetchAds(true);
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token, user]);

  const fetchAds = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // If of email sepacnyanza@gmail.com, load even inactive ones
      const endpoint = isAdmin ? '/api/admin/advertisements' : '/api/advertisements';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = token;
      }
      
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        setAds(data.advertisements || []);
      }
    } catch (e) {
      console.error('Failed to load advertisements', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title || !description || !businessName) {
      setFormError('Title, description, and business name are required parameters.');
      return;
    }

    try {
      const res = await fetch('/api/admin/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          title,
          description,
          businessName,
          image_url: imageUrl,
          link,
          contactPhone
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess('Advertisement created and published successfully!');
        setTitle('');
        setDescription('');
        setBusinessName('');
        setImageUrl('');
        setLink('');
        setContactPhone('');
        fetchAds();
      } else {
        setFormError(data.error || 'Failed to submit advertisement');
      }
    } catch (err) {
      setFormError('Server network offline or timeout');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/advertisements/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': token || ''
        }
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm('Are you absolute sure you want to delete this promotion?')) return;
    try {
      const res = await fetch(`/api/admin/advertisements/${id}/delete`, {
        method: 'POST',
        headers: {
          'Authorization': token || ''
        }
      });
      if (res.ok) {
        fetchAds();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="sepac-advertisements-page" className="bg-[#FCF9F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C9A84C] block mb-2">SEPAC Marketplace & Projects</span>
          <h1 className="font-serif font-extrabold text-[#1B2A6B] text-3xl sm:text-4.5xl leading-tight">
            Alumni Advertisements
          </h1>
          <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-3 rounded"></div>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mt-4 font-serif italic">
            Promoting alumni-owned businesses, professional consultants, and revitalization partnerships. Dedicated exclusively to our St. Esprit Protestant fellowship.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Advertisements Columns */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-serif font-bold text-xl text-[#1B2A6B] border-b border-amber-100 pb-2">
              Featured Advertisements & Classifieds
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-44" />
                ))}
              </div>
            ) : ads.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 font-serif italic">
                <Megaphone size={32} className="mx-auto mb-2 text-gray-300" />
                No active advertisements or community promotions at this time.
              </div>
            ) : (
              <div className="space-y-6">
                {ads.map((ad) => (
                  <div 
                    key={ad.id} 
                    className={`bg-white rounded-xl border ${ad.active ? 'border-amber-100' : 'border-dashed border-gray-300 opacity-65'} overflow-hidden shadow-sm flex flex-col md:flex-row p-5 gap-5 relative group hover:shadow-md transition-all`}
                  >
                    {/* Admin Actions Overlay Header */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-lg p-1 px-2.5 z-10 shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-gray-400">Admin Control:</span>
                        <button
                          onClick={() => handleToggleActive(ad.id)}
                          className="text-[#1B2A6B] hover:text-[#C9A84C] p-0.5 cursor-pointer"
                          title={ad.active ? 'Draft / Hide ad' : 'Approve / Publish ad'}
                        >
                          {ad.active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                          title="Delete advertisement definitively"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Image space fallback */}
                    {ad.image_url ? (
                      <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full md:w-44 h-36 object-cover rounded-lg border border-gray-100 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full md:w-44 h-36 bg-amber-50 border border-amber-100 rounded-lg flex flex-col items-center justify-center text-[#1B2A6B]/50 shrink-0">
                        <Megaphone size={28} />
                        <span className="text-[9.5px] uppercase font-bold tracking-wider mt-1.5">{ad.businessName}</span>
                      </div>
                    )}

                    {/* Meta and text description */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-amber-50 text-[#1B2A6B] font-bold border border-amber-200/50 p-0.5 px-2 rounded">
                            {ad.businessName}
                          </span>
                          {!ad.active && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/60 rounded px-1.5">
                              Draft / Inactive
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-extrabold text-[#1B2A6B] text-base leading-snug">
                          {ad.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-serif">
                          {ad.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-3 mt-4 text-[11px] text-gray-600 font-semibold font-serif">
                        {ad.contactPhone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-[#C9A84C]" />
                            {ad.contactPhone}
                          </span>
                        )}
                        {ad.link && (
                          <a 
                            href={ad.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-[#1B2A6B] hover:text-[#C9A84C] hover:underline"
                          >
                            <ExternalLink size={12} className="text-[#C9A84C]" />
                            Official Website
                          </a>
                        )}
                        <span className="text-[9.5px] font-mono text-gray-400 ml-auto font-normal">
                          Added: {new Date(ad.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area: Admin Form OR General Instruction */}
          <div className="lg:col-span-4">
            
            {isAdmin ? (
              /* Admin Only Form */
              <div className="bg-white rounded-xl border border-[#C9A84C]/40 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                  <ShieldAlert size={16} className="text-[#C9A84C]" />
                  <h3 className="font-serif font-extrabold text-[#1B2A6B] text-sm sm:text-base">
                    Publish New Advertisement
                  </h3>
                </div>

                <p className="text-xs text-gray-400 font-medium font-serif leading-relaxed">
                  As the verified Super Administrator (<span className="text-[#1B2A6B] font-bold">sepacnyanza@gmail.com</span>), you have exclusive rights to post community advertisements. Fill in the fields below.
                </p>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold leading-snug text-left">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold leading-snug text-left">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateAd} className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      Promotion Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Special Translation Services"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  {/* Company name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      Business or Sponsor Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Nyanza Consulting Co."
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      Advertisement Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write brief advertising guidelines or promotional copy..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  {/* Link */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      External Link / Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://consult.rw"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  {/* Contact phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B] block">
                      Contact Hotline Phone
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., +250786047305"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] text-xs font-bold uppercase tracking-wider border border-[#1B2A6B] transition-colors shadow cursor-pointer"
                  >
                    Publish Advertisement
                  </button>
                </form>
              </div>
            ) : (
              /* Public / Member Explanation block */
              <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
                  <Megaphone size={16} className="text-[#C9A84C]" />
                  <h3 className="font-serif font-extrabold text-[#1B2A6B] text-sm sm:text-base">
                    How to Advertise?
                  </h3>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-serif">
                  Would you like to promote your company, theological consulting services, counseling practice, or educational aids on our SEPAC platform?
                </p>

                <div className="bg-[#FCF9F2] rounded-lg p-4.5 text-xs text-gray-600 font-medium font-serif space-y-3 border-l-4 border-[#C9A84C]">
                  <p>
                    All advertising requests must be directly submitted to the super administrator for verification:
                  </p>
                  <p className="font-sans font-bold text-gray-900 border-b border-gray-100/50 pb-1.5 flex gap-1 items-center">
                    ✉ sepacnyanza@gmail.com
                  </p>
                  <p>
                    Once approved, the administrator will instantly publish your ad to the platform directory and notify community members.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
