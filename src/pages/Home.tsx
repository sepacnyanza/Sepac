/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SepacLogo from '../components/SepacLogo';
import { Post, SEPACEvent, GalleryPhoto } from '../types';
import { BookOpen, Users, Calendar, Image as ImageIcon, ArrowRight, Heart, HeartOff, MessageSquare, MapPin } from 'lucide-react';

interface HomeProps {
  setPage: (page: string) => void;
  selectedEventIdRef: React.MutableRefObject<string>;
}

export default function Home({ setPage, selectedEventIdRef }: HomeProps) {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SEPACEvent[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch home landing feeds
  useEffect(() => {
    fetchLatestFeeds();

    // Listen to real-time additions or updates to dynamically sync the view
    const handleUpdate = () => {
      fetchLatestFeeds();
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token]);

  const fetchLatestFeeds = async () => {
    try {
      // 1. Posts Feed
      const postsRes = await fetch('/api/posts', {
        headers: token ? { 'Authorization': token } : {}
      });
      if (postsRes.ok) {
        const data = await postsRes.json();
        setLatestPosts(data.posts.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostsLoading(false);
    }

    try {
      // 2. Events Feed
      const evRes = await fetch('/api/events');
      if (evRes.ok) {
        const data = await evRes.json();
        setUpcomingEvents(data.events.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEventsLoading(false);
    }

    try {
      // 3. Gallery
      const galRes = await fetch('/api/gallery');
      if (galRes.ok) {
        const data = await galRes.json();
        setPhotos(data.gallery.slice(0, 6));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      setPage('auth');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': token || ''
        }
      });
      if (res.ok) {
        // Refetch latest feeds to update states immediately
        fetchLatestFeeds();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'News': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Events': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Devotional': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Announcement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div id="sepac-home-page" className="bg-[#FCF9F2]">
      
      {/* 1. Hero banner with custom background and branding */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B2A6B] to-[#101944] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C9A84C]">
        
        {/* Subtle decorative crosses inside backgrounds */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-around">
          <BookOpen size={240} className="text-white transform -rotate-12" />
          <Users size={240} className="text-white transform rotate-12" />
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Central Logo Header */}
          <div className="bg-white p-2 rounded-full border-4 border-[#C9A84C] shadow-2xl mb-8 transform hover:rotate-12 transition-transform duration-500">
            <SepacLogo size={190} />
          </div>

          <p className="text-[#C9A84C] font-serif font-bold text-lg sm:text-xl tracking-wider uppercase mb-3">
            "{t('brand.tagline')}"
          </p>

          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight max-w-4xl mb-4">
            {t('home.hero.title')}
          </h1>

          <p className="text-[#C1D0FF] text-sm sm:text-base max-w-2xl font-medium leading-relaxed mb-10">
            {t('home.about.desc')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center sm:justify-center">
            {user ? (
              <button
                onClick={() => setPage('members')}
                className="w-full sm:w-auto px-8 py-3 rounded bg-[#C9A84C] text-[#1B2A6B] hover:bg-white hover:text-[#1B2A6B] hover:shadow-2xl font-bold uppercase text-xs tracking-wider border-2 border-[#C9A84C] hover:border-white transition-all cursor-pointer shadow-lg"
              >
                {t('members.title')}
              </button>
            ) : (
              <button
                onClick={() => setPage('auth')}
                className="w-full sm:w-auto px-8 py-3 rounded bg-[#C9A84C] text-[#1B2A6B] hover:bg-white hover:text-[#1B2A6B] hover:shadow-2xl font-bold uppercase text-xs tracking-wider border-2 border-[#C9A84C] hover:border-white transition-all cursor-pointer shadow-lg"
              >
                {t('home.hero.cta.join')}
              </button>
            )}
            
            <button
              onClick={() => setPage('events')}
              className="w-full sm:w-auto px-8 py-3 rounded border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] hover:shadow-2xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer shadow-lg"
            >
              {t('home.hero.cta.events')}
            </button>
          </div>

        </div>
      </section>

      {/* 2. Core values section with 4 blocks (Unity, Faith, Fellowship, Service) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C9A84C]">{t('home.about.pre')}</span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1B2A6B] mt-2">
            {t('home.about.title')}
          </h2>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-3 rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Value 1: Unity */}
          <div className="bg-white rounded-xl shadow p-6 border-b-4 border-[#1B2A6B] text-center transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#1B2A6B]/15 rounded-full flex items-center justify-center mx-auto text-[#1B2A6B] mb-4">
              <Users size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-2">{t('value.unity')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-serif italic">{t('value.unity.desc')}</p>
          </div>

          {/* Value 2: Faith */}
          <div className="bg-white rounded-xl shadow p-6 border-b-4 border-[#C9A84C] text-center transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#C9A84C]/15 rounded-full flex items-center justify-center mx-auto text-[#C9A84C] mb-4">
              <BookOpen size={22} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-2">{t('value.faith')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-serif italic">{t('value.faith.desc')}</p>
          </div>

          {/* Value 3: Fellowship */}
          <div className="bg-white rounded-xl shadow p-6 border-b-4 border-[#1B2A6B] text-center transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#1B2A6B]/15 rounded-full flex items-center justify-center mx-auto text-[#1B2A6B] mb-4">
              <Users size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-2">{t('value.fellowship')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-serif italic">{t('value.fellowship.desc')}</p>
          </div>

          {/* Value 4: Service */}
          <div className="bg-white rounded-xl shadow p-6 border-b-4 border-[#C9A84C] text-center transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#C9A84C]/15 rounded-full flex items-center justify-center mx-auto text-[#C9A84C] mb-4">
              <Calendar size={22} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-2">{t('value.service')}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-serif italic">{t('value.service.desc')}</p>
          </div>
        </div>
      </section>

      {/* 3. Latest News & Devotionals Posts feed previews */}
      <section className="bg-white border-t border-b border-amber-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 text-center sm:text-left">
            <div>
              <h2 className="font-serif font-bold text-2xl sm:text-3.5xl text-[#1B2A6B]">
                {t('home.news.title')}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md font-sans">
                {t('home.news.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setPage('news')}
              className="mt-4 sm:mt-0 flex items-center space-x-1 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-transparent text-[#1B2A6B] hover:text-[#C9A84C] transition-colors border-2 border-[#1B2A6B] hover:border-[#C9A84C] cursor-pointer"
            >
              <span>{t('home.news.viewall')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 h-80 rounded-xl" />
              ))}
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50/50">
              <BookOpen size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">No blog posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setPage('news')}
                  className="bg-amber-50/10 rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-48 bg-gray-100 shrink-0">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1B2A6B] to-[#101944] flex items-center justify-center text-white">
                        <BookOpen size={40} className="opacity-30" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border shadow-sm ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                      {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h3 className="font-serif font-bold text-[#1B2A6B] text-lg mb-2 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-grow font-medium">
                      {post.content}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700 truncate max-w-[150px]">By {post.author_name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-0.5">
                          <Heart size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
                          <span>{post.likes_count}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. Upcoming events calendar panel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 text-center sm:text-left">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3.5xl text-[#1B2A6B]">
              {t('home.events.title')}
            </h2>
            <div className="w-12 h-1 bg-[#C9A84C] mx-auto sm:mx-0 mt-2 rounded"></div>
          </div>
          <button
            onClick={() => setPage('events')}
            className="mt-4 sm:mt-0 flex items-center space-x-1 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-[#1B2A6B] hover:bg-[#C9A84C] text-white hover:text-[#1B2A6B] transition-all cursor-pointer"
          >
            <span>{t('home.events.viewall')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 h-60 rounded-xl" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-xl bg-white shadow-sm">
            <Calendar size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">No upcoming events listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const isGoing = user && event.rsvps.includes(user.email);
              const eventDate = new Date(event.date);

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    selectedEventIdRef.current = event.id;
                    setPage('events');
                  }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full cursor-pointer transform hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-40 bg-gray-200 shrink-0">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center shadow-lg flex flex-col border border-yellow-100">
                      <span className="text-[10px] uppercase text-[#1B2A6B] font-bold tracking-wider leading-none">
                        {eventDate.toLocaleString(undefined, { month: 'short' })}
                      </span>
                      <span className="text-xl font-extrabold text-[#1B2A6B] font-serif leading-none mt-1">
                        {eventDate.getDate()}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mb-2 leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3 mb-4 flex-grow">
                      {event.description}
                    </p>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs mt-auto">
                      <div className="flex items-center space-x-1 text-gray-500 font-semibold truncate max-w-[160px]">
                        <MapPin size={12} className="text-[#C9A84C]" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      {/* RSVP Buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRSVP(event.id);
                        }}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all pointer-events-auto cursor-pointer ${
                          isGoing
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-[#1B2A6B] border-[#C9A84C] hover:bg-[#C9A84C]'
                        }`}
                      >
                        {isGoing ? t('events.rsvp.going') : t('events.rsvp.btn')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Photo Gallery Carousel Strip */}
      <section className="bg-[#101944] text-white border-t border-[#C9A84C] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <span className="text-[10px] tracking-widest uppercase font-bold text-amber-500">{t('nav.gallery')}</span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-white mt-1 hover:text-[#C9A84C] transition-colors cursor-pointer" onClick={() => setPage('gallery')}>
              {t('home.gallery.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {photos.length === 0 ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/5 rounded-lg aspect-square flex items-center justify-center border border-white/10 shrink-0">
                  <ImageIcon size={20} className="text-white/20" />
                </div>
              ))
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setPage('gallery')}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 shadow-md cursor-pointer hover:border-[#C9A84C] transition-all"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.event_tag}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-[9px] font-bold uppercase text-amber-400 truncate w-full">
                      {photo.event_tag}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
