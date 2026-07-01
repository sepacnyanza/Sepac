/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SEPACEvent } from '../types';
import { Calendar, MapPin, Users, Heart, ArrowRight, ShieldCheck, HeartOff } from 'lucide-react';

interface EventsProps {
  setPage: (page: string) => void;
  selectedEventIdRef: React.MutableRefObject<string>;
}

export default function Events({ setPage, selectedEventIdRef }: EventsProps) {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [events, setEvents] = useState<SEPACEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();

    const handleUpdate = () => {
      fetchEvents(true); // silent update
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token]);

  const fetchEvents = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      setPage('auth');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': token
        }
      });
      if (res.ok) {
        // Refresh local listings
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDayAndMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const m = d.toLocaleString(undefined, { month: 'short' });
    const day = d.getDate();
    return { month: m, day };
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Divide events into upcoming vs achievements archives
  const now = new Date();
  
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  // If we arrived from a home preview click, let's auto-scroll to that event
  useEffect(() => {
    if (selectedEventIdRef.current) {
      const element = document.getElementById(`event-card-${selectedEventIdRef.current}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Reset ref
        selectedEventIdRef.current = '';
      }
    }
  }, [events]);

  return (
    <div id="sepac-events-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center border-b border-gray-100 pb-8 mb-10">
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            {t('events.title')}
          </h1>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-2 rounded"></div>
        </div>

        {/* 1. Upcoming Gatherings Section */}
        <div className="mb-14">
          <h2 className="font-serif font-bold text-xl text-[#1B2A6B] uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span>{t('events.upcoming')}</span>
          </h2>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-white border border-gray-150 rounded-xl h-52" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Calendar size={44} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">No scheduled upcoming gatherings at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event) => {
                const dateParts = getDayAndMonth(event.date);
                const isGoing = user && event.rsvps.includes(user.email);
                
                return (
                  <div
                    key={event.id}
                    id={`event-card-${event.id}`}
                    className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden flex flex-col md:flex-row transform hover:scale-[1.005] hover:shadow-md transition-all duration-200"
                  >
                    {/* Visual Date Badge Side in standard desktop layouts */}
                    <div className="relative md:w-1/3 bg-gray-100 min-h-[160px] md:min-h-0 shrink-0">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Badge float */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs shadow-lg border border-yellow-100 rounded-xl p-3 text-center min-w-[65px]">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1B2A6B] block leading-none">
                          {dateParts.month}
                        </span>
                        <span className="text-2xl font-serif font-extrabold text-[#1B2A6B] block leading-none mt-1.5">
                          {dateParts.day}
                        </span>
                      </div>
                    </div>

                    {/* Meta info details */}
                    <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                      <div>
                        
                        <h3 className="font-serif font-extrabold text-[#1B2A6B] text-xl sm:text-2xl mb-3">
                          {event.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans mb-5 font-medium">
                          {event.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 border-t border-b border-gray-50 py-4.5 text-xs text-gray-600 font-semibold">
                          <div className="flex items-center space-x-2">
                            <Calendar size={13} className="text-[#C9A84C] shrink-0" />
                            <span>{formatFullDate(event.date)}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <MapPin size={13} className="text-[#C9A84C] shrink-0" />
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </div>
                        </div>

                      </div>

                      {/* Attend action & registration lists */}
                      <div className="flex flex-col sm:flex-row items-center sm:justify-between pt-2 gap-4">
                        
                        {/* Attendance figures */}
                        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100/50 rounded-lg py-1.5 px-3.5 text-[11px] text-[#1B2A6B] font-bold">
                          <Users size={12} className="text-amber-500 shrink-0" />
                          <span>{event.rsvps.length} Alumni Registered Going</span>
                        </div>

                        {/* Going triggers */}
                        {user ? (
                          <button
                            onClick={(e) => handleRSVP(event.id, e)}
                            disabled={isGoing}
                            className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                              isGoing
                                ? 'bg-emerald-600 text-white border-emerald-600 opacity-90 cursor-not-allowed'
                                : 'bg-[#1B2A6B] hover:bg-[#C9A84C] text-white hover:text-[#1B2A6B] border-[#1B2A6B] cursor-pointer'
                            }`}
                          >
                            {isGoing ? 'Attending' : t('events.rsvp.btn')}
                          </button>
                        ) : (
                          <button
                            onClick={() => setPage('auth')}
                            className="w-full sm:w-auto px-5 py-2 rounded bg-amber-50 text-[#1B2A6B] border border-[#C9A84C] hover:bg-[#C9A84C] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {t('events.rsvp.login')}
                          </button>
                        )}

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Historic Outreaches / Past Archives */}
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1B2A6B] uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
            <span>{t('events.past')}</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg h-44" />
              ))}
            </div>
          ) : pastEvents.length === 0 ? (
            <p className="text-xs text-gray-400 italic font-medium">No archived events published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-inner opacity-85 hover:opacity-100 transition-opacity"
                >
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                    {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <h3 className="font-serif font-bold text-[#1B2A6B] text-base mb-1.5 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-semibold mb-3">
                    <MapPin size={10} className="text-amber-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-serif italic">
                    "{event.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
