/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Post, GalleryPhoto, SiteAnalytics } from '../types';
import { ShieldCheck, Users, BookOpen, Clock, Check, X, ShieldAlert, Award, Calendar, Megaphone, BarChart } from 'lucide-react';

export default function Admin() {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'registrations' | 'reviews' | 'schedule' | 'roles'>('stats');
  const [stats, setStats] = useState<SiteAnalytics | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<GalleryPhoto[]>([]);

  // Schedulers Forms states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventImage, setEventImage] = useState('');

  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAdminStatsAndQueues();
    }

    const handleUpdate = () => {
      if (token) {
        fetchAdminStatsAndQueues();
      }
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token]);

  const fetchAdminStatsAndQueues = async () => {
    try {
      const headers = { 'Authorization': token || '' };

      // 1. Fetch Stats
      const statRes = await fetch('/api/admin/stats', { headers });
      if (statRes.ok) {
        const d = await statRes.json();
        setStats(d.stats);
      }

      // 2. Fetch Users
      const userRes = await fetch('/api/admin/users', { headers });
      if (userRes.ok) {
        const d = await userRes.json();
        setAllUsers(d.profiles);
      }

      // 3. Fetch Posts directly (and filter pending ones)
      const postRes = await fetch('/api/posts', { headers });
      if (postRes.ok) {
        const d = await postRes.json();
        setPendingPosts(d.posts.filter((p: Post) => p.status === 'pending'));
      }

      // 4. Fetch Photo gallery directly
      const galRes = await fetch('/api/gallery', { headers });
      if (galRes.ok) {
        const d = await galRes.json();
        setPendingPhotos(d.gallery.filter((g: GalleryPhoto) => g.status === 'pending'));
      }

    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveUser = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/users/${email}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ approved: true })
      });
      if (res.ok) {
        setSuccessMsg(`User ${email} approved successfully!`);
        fetchAdminStatsAndQueues();
      }
    } catch (e) {
      setErrorMsg('Failed to approve profile');
    }
  };

  const handlePromoteRole = async (email: string, targetRole: 'member' | 'moderator' | 'admin') => {
    try {
      const res = await fetch(`/api/admin/users/${email}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        setSuccessMsg(`User ${email} assigned role ${targetRole}!`);
        fetchAdminStatsAndQueues();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || 'Promotion failed');
      }
    } catch (e) {
      setErrorMsg('Role update failed');
    }
  };

  const handlePostApproval = async (postId: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setSuccessMsg(`Post ${action}!`);
        fetchAdminStatsAndQueues();
      }
    } catch (e) {
      setErrorMsg('Failed to update post clearance');
    }
  };

  const handlePhotoApproval = async (photoId: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/gallery/${photoId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setSuccessMsg(`Photo ${action}!`);
        fetchAdminStatsAndQueues();
      }
    } catch (e) {
      setErrorMsg('Failed to update gallery image status');
    }
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!eventTitle || !eventDesc || !eventDate || !eventLocation) {
      setErrorMsg('Please satisfy all primary fields');
      return;
    }

    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          date: new Date(eventDate).toISOString(),
          location: eventLocation,
          image_url: eventImage || undefined
        })
      });

      const d = await res.json();
      if (res.ok) {
        setSuccessMsg(`Gathering scheduled successfully: ${d.event.title}!`);
        setEventTitle('');
        setEventDesc('');
        setEventDate('');
        setEventLocation('');
        setEventImage('');
        fetchAdminStatsAndQueues();
      } else {
        setErrorMsg(d.error || 'Scheduling failed');
      }
    } catch (err) {
      setErrorMsg('Server database timed out');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!announceTitle || !announceBody) {
      setErrorMsg('Announcement needs a title and a body');
      return;
    }

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          title: announceTitle,
          body: announceBody
        })
      });

      const d = await res.json();
      if (res.ok) {
        setSuccessMsg(`Announcement published sitewide!`);
        setAnnounceTitle('');
        setAnnounceBody('');
        fetchAdminStatsAndQueues();
      } else {
        setErrorMsg(d.error || 'Announcement publish failed');
      }
    } catch (err) {
      setErrorMsg('Announcements endpoint offline');
    }
  };

  // Restrain access if user has no management permissions
  const isManager = user && ['admin', 'super_admin', 'moderator'].includes(user.role);
  if (!user || !isManager) {
    return (
      <div className="bg-[#FCF9F2] min-h-screen py-20 px-4 text-center">
        <ShieldAlert size={44} className="text-red-500 mx-auto mb-2.5 animate-pulse" />
        <h3 className="font-serif font-bold text-gray-700 text-lg">Restrained clearance</h3>
        <p className="text-xs text-gray-500 mt-1">This space is restricted to SEPAC administration pastors and moderation leaders.</p>
      </div>
    );
  }

  const isSuperAdmin = user.role === 'super_admin';

  return (
    <div id="sepac-admin-portal" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Core Header toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-6 mb-8 gap-4 text-center sm:text-left">
          <div>
            <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B] flex items-center justify-center sm:justify-start gap-2.5">
              <ShieldCheck className="text-[#C9A84C]" />
              <span>{t('admin.title')}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider font-sans">
              Welcome, {user.name} ({user.role})
            </p>
          </div>
        </div>

        {/* Global Success / Errors Toast messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold mb-6 animate-fadeIn flex justify-between items-center select-none">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold shrink-0 text-emerald-900 cursor-pointer">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold mb-6 flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold shrink-0 text-red-900 cursor-pointer">✕</button>
          </div>
        )}

        {/* Main Dashboard modular tabs selection */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-amber-100/50 justify-center sm:justify-start">
          <button
            onClick={() => { setActiveTab('stats'); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart size={13} />
            <span>Overview Stats</span>
          </button>

          <button
            onClick={() => { setActiveTab('registrations'); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'registrations' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={13} />
            <span>{t('admin.tab.approvals')}</span>
            {allUsers.filter(u => !u.approved).length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {allUsers.filter(u => !u.approved).length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('reviews'); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'reviews' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={13} />
            <span>Post & Photo Reviews</span>
            {(pendingPosts.length + pendingPhotos.length) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {pendingPosts.length + pendingPhotos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('schedule'); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schedule' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar size={13} />
            <span>{t('admin.tab.events')}</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => { setActiveTab('roles'); }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roles' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Award size={13} className="text-yellow-500" />
              <span>{t('admin.tab.users')}</span>
            </button>
          )}
        </div>

        {/* Tab contents logic */}

        {/* Tab 1: Stats Overview */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4.5 animate-fadeIn">
            
            {/* Total alumni */}
            <div className="bg-white rounded-xl shadow-sm border border-[#C9A84C]/30 p-5 shrink-0 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#1B2A6B] font-bold block mb-1">
                {t('admin.stats.members')}
              </span>
              <span className="text-2.5xl font-serif font-extrabold text-[#1B2A6B] block">
                {stats.totalMembers}
              </span>
            </div>

            {/* Total active validated */}
            <div className="bg-white rounded-xl shadow-sm border border-[#C9A84C]/30 p-5 shrink-0 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#1B2A6B] font-bold block mb-1">
                {t('admin.stats.approved')}
              </span>
              <span className="text-2.5xl font-serif font-extrabold text-emerald-600 block">
                {stats.approvedMembers}
              </span>
            </div>

            {/* Total pending registration */}
            <div className="bg-white rounded-xl shadow-sm border border-[#C9A84C]/30 p-5 shrink-0 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#1B2A6B] font-bold block mb-1">
                {t('admin.stats.active')}
              </span>
              <span className="text-2.5xl font-serif font-extrabold text-amber-600 block">
                {stats.pendingMembers}
              </span>
            </div>

            {/* Total Feed posts */}
            <div className="bg-white rounded-xl shadow-sm border border-[#C9A84C]/30 p-5 shrink-0 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#1B2A6B] font-bold block mb-1">
                {t('admin.stats.posts')}
              </span>
              <span className="text-2.5xl font-serif font-extrabold text-[#1B2A6B] block">
                {stats.totalPosts}
              </span>
            </div>

          </div>
        )}

        {/* Tab 2: Registrations Approval Queue */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-4.5">
              Pending Registrations Approvals Queue
            </h3>

            {allUsers.filter(u => !u.approved).length === 0 ? (
              <p className="text-xs text-gray-400 italic">No alumni registrations are in pending evaluation queue.</p>
            ) : (
              <div className="space-y-4">
                {allUsers.filter(u => !u.approved).map((profile) => (
                  <div key={profile.id} className="bg-gray-50 border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left transition-all">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold shrink-0">{profile.name.charAt(0)}</div>
                      )}
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#1B2A6B]">{profile.name}</h4>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Grad Year: {profile.graduation_year} — Email: {profile.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveUser(profile.id)}
                        className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {t('admin.action.verifyUser')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Post & Photo reviews validation block */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            
            {/* Posts section reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6">
              <h3 className="font-serif font-bold text-base text-[#1B2A6B] border-b border-gray-100 pb-3 mb-4.5 flex items-center justify-between">
                <span>Pending Articles ({pendingPosts.length})</span>
              </h3>

              {pendingPosts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No articles pending validation.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {pendingPosts.map(post => (
                    <div key={post.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg space-y-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-amber-500">{post.category}</span>
                        <h4 className="font-serif font-bold text-sm text-[#1B2A6B] leading-snug">{post.title}</h4>
                        <span className="text-[9.5px] text-gray-400 block mt-0.5">By {post.author_name} ({post.author_id})</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-3 font-serif italic">"{post.content}"</p>
                      <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100/60">
                        <button
                          onClick={() => handlePostApproval(post.id, 'rejected')}
                          className="p-1 px-3.5 text-[9.5px] border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                        >
                          {t('admin.action.reject')}
                        </button>
                        <button
                          onClick={() => handlePostApproval(post.id, 'approved')}
                          className="p-1 px-3.5 text-[9.5px] bg-[#1B2A6B] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                        >
                          {t('admin.action.approve')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photo section reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6">
              <h3 className="font-serif font-bold text-base text-[#1B2A6B] border-b border-gray-100 pb-3 mb-4.5 flex items-center justify-between">
                <span>Pending Gallery Photos ({pendingPhotos.length})</span>
              </h3>

              {pendingPhotos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No gallery images pending validation.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {pendingPhotos.map(photo => (
                    <div key={photo.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg space-y-3 flex gap-3 items-center text-left">
                      <img src={photo.image_url} alt={photo.event_tag} className="w-16 h-16 rounded object-cover shrink-0 border border-gray-200 shadow-sm" referrerPolicy="no-referrer" />
                      <div className="flex-grow min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">{photo.event_tag}</span>
                        <span className="text-[10px] text-gray-400 block font-medium mt-0.5">By {photo.uploader_name}</span>
                        
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => handlePhotoApproval(photo.id, 'rejected')}
                            className="p-1 px-2 text-[8.5px] border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase rounded cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                          <button
                            onClick={() => handlePhotoApproval(photo.id, 'approved')}
                            className="p-1 px-2.5 text-[8.5px] bg-[#1B2A6B] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] font-bold uppercase rounded cursor-pointer"
                          >
                            ✓ Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Schedule gathering & Announcements */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            
            {/* Create Event */}
            <form onSubmit={handlePublishEvent} className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#1B2A6B] border-b border-gray-100 pb-3 flex items-center gap-1.5">
                <Calendar size={15} className="text-[#C9A84C]" />
                <span>{t('events.create.title')}</span>
              </h3>

              {/* Event title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('admin.event.name')}
                </label>
                <input
                  type="text"
                  placeholder="E.g., Worship Night 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Event date */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('admin.event.date')}
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Event location */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('admin.event.loc')}
                </label>
                <input
                  type="text"
                  placeholder="E.g., Kigali Protestant Chapel Hall"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Event Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('admin.event.img')}
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={eventImage}
                  onChange={(e) => setEventImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Event description */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('admin.event.desc')}
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline description of sports picnics or choir rehearsals..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] text-xs font-bold uppercase tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer"
              >
                {t('admin.event.create')}
              </button>
            </form>

            {/* Create Announcement */}
            <form onSubmit={handleSendAnnouncement} className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-[#1B2A6B] border-b border-gray-100 pb-3 flex items-center gap-1.5">
                <Megaphone size={14} className="text-[#C9A84C]" />
                <span>{t('admin.tab.announcements')}</span>
              </h3>

              {/* Announcement title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="E.g., Online Platform Launch!"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Announcement Body */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  Announcement Body Text
                </label>
                <textarea
                  rows={8}
                  placeholder="Write clear body lines..."
                  value={announceBody}
                  onChange={(e) => setAnnounceBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] text-xs font-bold uppercase tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer"
              >
                Broadcast Announcement
              </button>
            </form>

          </div>
        )}

        {/* Tab 5: Professional Roles Delegation (Super Admin only check) */}
        {activeTab === 'roles' && isSuperAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 animate-fadeIn">
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-5">
              Super-Admin Administrative Role Delegation
            </h3>

            <div className="space-y-4">
              {allUsers.filter(u => u.approved && u.email !== 'sepacnyanza@gmail.com').map(profile => (
                <div key={profile.id} className="bg-gray-50 border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left transition-all">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1B2A6B]">{profile.name}</h4>
                    <span className="text-[10px] text-gray-400 font-medium block">Email: {profile.email} — Current Role: <span className="text-amber-500 font-extrabold uppercase">{profile.role}</span></span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {profile.role !== 'member' && (
                      <button
                        onClick={() => handlePromoteRole(profile.id, 'member')}
                        className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer"
                      >
                        Demote to Member
                      </button>
                    )}
                    {profile.role !== 'moderator' && (
                      <button
                        onClick={() => handlePromoteRole(profile.id, 'moderator')}
                        className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer"
                      >
                        Make Moderator
                      </button>
                    )}
                    {profile.role !== 'admin' && (
                      <button
                        onClick={() => handlePromoteRole(profile.id, 'admin')}
                        className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-[#1B2A6B] text-[9px] font-bold uppercase tracking-wider rounded cursor-pointer"
                      >
                        {t('admin.action.promote')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
