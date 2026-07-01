/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SepacLogo from './SepacLogo';
import { Menu, X, Globe, User, LogOut, Shield, Award, Key, Bell, BellRing } from 'lucide-react';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  url: string;
  timestamp: string;
  read: boolean;
}

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export default function Navbar({ currentPage, setPage }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Notification System States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);

  // Hook into SSE stream on mount
  React.useEffect(() => {
    // 1. Register Service Worker for push notifications in background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Background Service Worker registered scope:', reg.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration skipped:', err);
        });
    }

    // 2. Request native privileges (non-blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 3. Connect to EventSource push channel
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Dispatch global custom event so pages can auto-refresh their data lists
        window.dispatchEvent(new CustomEvent('sepac-update', { detail: data }));

        // If update is marked as a silent refresh, skip visual alerts and list insertion
        if (data.silent) {
          return;
        }

        const newNotif: AppNotification = {
          id: String(Date.now() + Math.random()),
          title: data.title || 'SEPAC Update',
          body: data.body || 'New content published',
          url: data.url || 'home',
          timestamp: data.timestamp || new Date().toISOString(),
          read: false
        };

        // Update in-browser notification center state
        setNotifications((prev) => [newNotif, ...prev]);

        // Slide out top-level active alert toast
        setToast(newNotif);

        // Fallback or fire native background push notify if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(newNotif.title, {
              body: newNotif.body,
              icon: '/favicon.ico',
              data: { url: newNotif.url }
            });
          });
        }
      } catch (err) {
        console.error('Notifications fetch issue:', err);
      }
    };

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.action === 'navigate') {
        setPage(event.data.url || 'home');
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    return () => {
      eventSource.close();
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [setPage]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'rw' : 'en');
  };

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'mission', label: t('nav.mission') },
    { id: 'members', label: t('nav.members') },
    { id: 'news', label: t('nav.news') },
    { id: 'events', label: t('nav.events') },
    { id: 'giving', label: t('nav.giving') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'prayer', label: t('nav.prayer') },
    { id: 'ads', label: t('nav.ads') },
    { id: 'contact', label: t('nav.contact') },
  ];

  // Colors: Navy blue (#1B2A6B) and gold (#C9A84C) as primary palette
  return (
    <nav id="sepac-navbar" className="bg-[#1B2A6B] text-white sticky top-0 z-50 shadow-md border-b-4 border-[#C9A84C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>
            <div className="bg-white p-1 rounded-full border border-[#C9A84C] flex items-center justify-center shadow-inner">
              <SepacLogo size={52} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-wide text-white leading-tight flex items-center gap-1">
                SEPAC
              </span>
              <span className="text-[10px] text-[#C1D0FF] tracking-tighter hidden sm:block font-serif italic font-medium leading-none mt-0.5">
                {t('brand.tagline')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Middle) */}
          <div className="hidden lg:flex space-x-1">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-[#C9A84C] text-[#1B2A6B] shadow-inner font-bold' 
                      : 'text-white hover:bg-[#2A3E8A] hover:text-[#C9A84C]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Utilities (Locale & Account Buttons) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#C9A84C] hover:bg-[#2A3E8A] transition-all text-xs font-bold font-mono tracking-wider cursor-pointer"
              title="Switch Language / Guhindura Ururimi"
            >
              <Globe size={14} className="text-[#C9A84C]" />
              <span className="uppercase text-[#C9A84C]">{language === 'en' ? 'RW' : 'EN'}</span>
            </button>

            {/* Live Notification Center Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 rounded-full hover:bg-[#243682] text-white hover:text-[#C9A84C] relative transition-all duration-200 cursor-pointer flex items-center justify-center"
                title="Community Bulletins"
              >
                {notifications.filter(n => !n.read).length > 0 ? (
                  <BellRing size={16} className="text-[#C9A84C] animate-bounce" />
                ) : (
                  <Bell size={16} className="text-gray-300" />
                )}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full bg-red-500 text-[8.5px] text-white font-sans font-bold flex items-center justify-center px-0.5 animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-amber-50 z-50 overflow-hidden py-1 animate-fadeIn">
                  <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#1B2A6B]">
                      Bulletin Board
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        className="text-[9px] text-[#C9A84C] hover:text-[#1B2A6B] font-bold uppercase tracking-wider"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 select-none">
                        <Bell size={20} className="mx-auto mb-1.5 text-gray-300" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                          No announcements yet
                        </p>
                        <p className="text-[9.5px] text-gray-400 font-serif italic mt-0.5">
                          Approved classmate schedules or news postings will appear here instantly.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                              setPage(notif.url);
                              setShowNotificationsDropdown(false);
                            }}
                            className={`p-3 text-left hover:bg-[#FCF9F2] cursor-pointer transition-colors flex gap-2.5 ${
                              !notif.read ? 'bg-amber-50/20 border-l-2 border-[#C9A84C]' : ''
                            }`}
                          >
                            <div className="shink-0 text-xs mt-0.5">✨</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 leading-snug truncate">{notif.title}</p>
                              <p className="text-[10.5px] text-gray-600 leading-relaxed font-serif mt-0.5">{notif.body}</p>
                              <span className="text-[8px] text-gray-450 block mt-1 font-mono uppercase tracking-tight">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account Controls */}
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Profile Link */}
                <button
                  onClick={() => setPage('profile')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                    currentPage === 'profile'
                      ? 'bg-[#C9A84C] text-[#1B2A6B] border-[#C9A84C]'
                      : 'border-[#2A3E8A] hover:border-[#C9A84C] text-white hover:bg-[#2A3E8A]'
                  }`}
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-5 h-5 rounded-full object-cover border border-[#C9A84C]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={14} />
                  )}
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  
                  {/* Roles badges */}
                  {user.role === 'super_admin' && (
                    <Award size={13} className="text-[#C9A84C] animate-pulse" title="Super Admin" />
                  )}
                  {user.role === 'admin' && (
                    <Shield size={13} className="text-yellow-300" title="Admin" />
                  )}
                  {user.role === 'moderator' && (
                    <Shield size={13} className="text-blue-300" title="Moderator" />
                  )}
                </button>

                {/* Admin Portal Shortcut if Admin / Super Admin / Moderator */}
                {['admin', 'super_admin', 'moderator'].includes(user.role) && (
                  <button
                    onClick={() => setPage('admin')}
                    className={`p-1.5 rounded-md hover:bg-[#243682] transition-colors relative cursor-pointer ${
                      currentPage === 'admin' ? 'text-[#C9A84C]' : 'text-gray-300 hover:text-white'
                    }`}
                    title={t('nav.admin')}
                  >
                    <Shield size={18} />
                    {!user.approved && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={() => { logout(); setPage('home'); }}
                  className="p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-[#243682] transition-all cursor-pointer"
                  title={t('nav.logout')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage('auth')}
                  className="px-3 py-1.5 rounded text-xs font-semibold tracking-wider uppercase border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] transition-all duration-200 cursor-pointer"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => { setPage('auth'); }}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase bg-[#C9A84C] text-[#1B2A6B] border border-[#C9A84C] hover:bg-white hover:text-[#1B2A6B] hover:border-white transition-all duration-200 shadow-sm cursor-pointer font-bold"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Panel Toggle Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Language Switch for Mobile */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1.5 rounded-full border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center font-mono text-[10px] font-bold tracking-wider"
            >
              <Globe size={11} className="mr-0.5" />
              <span>{language === 'en' ? 'RW' : 'EN'}</span>
            </button>

            {/* Live Notification Icon for Mobile */}
            <button
              onClick={() => {
                setShowMobileNotifications(!showMobileNotifications);
                setMobileMenuOpen(true); // Open drawer to see notification logs
              }}
              className="p-1.5 rounded-full border border-[#C9A84C] text-[#C9A84C] relative flex items-center justify-center"
              title="Notifications"
            >
              {notifications.filter(n => !n.read).length > 0 ? (
                <BellRing size={13} className="animate-bounce text-[#C9A84C]" />
              ) : (
                <Bell size={13} />
              )}
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-[7px] text-white flex items-center justify-center font-bold font-sans">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Menu open details */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setShowMobileNotifications(false);
              }}
              className="p-2 rounded-md hover:bg-[#2A3E8A] text-[#C9A84C] focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1B2A6B] border-t border-[#2A3E8A] px-4 pt-2 pb-6 space-y-2 animate-fadeIn shadow-2xl relative">
          
          {/* Collapsible Mobile Notifications Center */}
          {(showMobileNotifications || notifications.length > 0) && (
            <div className="bg-[#243682] rounded-xl border border-blue-900/35 p-3.5 mb-2 select-none">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C9A84C] flex items-center gap-1.5">
                  <Bell size={12} /> Live Announcements ({notifications.length})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    className="text-[9px] text-gray-300 hover:text-white font-bold uppercase tracking-wider"
                  >
                    Clear All Badge
                  </button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-blue-950/20">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-blue-200 mt-1 font-serif italic text-center py-2">
                    Waiting for live community bulletins...
                  </p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x));
                        setPage(n.url);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left pt-2 pb-1.5 cursor-pointer flex gap-1.5 ${
                        !n.read ? 'text-amber-200 font-bold' : 'text-gray-300'
                      }`}
                    >
                      <span className="text-xs">✨</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug truncate">{n.title}</p>
                        <p className="text-[10px] font-normal leading-relaxed text-blue-100 font-serif mt-0.5">{n.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Menu Items Links List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide uppercase transition-colors ${
                    active 
                      ? 'bg-[#C9A84C] text-[#1B2A6B]' 
                      : 'text-white hover:bg-[#2A3E8A] hover:text-[#C9A84C]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Account Profile Mobile Selection */}
          <div className="pt-4 border-t border-[#2A3E8A] mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-4 py-2 text-white">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2A3E8A] flex items-center justify-center text-[#C9A84C] border border-[#C9A84C]">
                      <User size={18} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-sm leading-tight text-white">{user.name}</span>
                    <span className="text-xs text-[#C1D0FF] uppercase tracking-wider font-semibold">
                      {user.role} ({t('members.grad')}: {user.graduation_year})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => { setPage('profile'); setMobileMenuOpen(false); }}
                    className="w-full text-center py-2 rounded bg-[#2A3E8A] text-white text-xs font-semibold hover:border-[#C9A84C] border border-transparent transition-all"
                  >
                    {t('nav.profile')}
                  </button>
                  
                  {['admin', 'super_admin', 'moderator'].includes(user.role) && (
                    <button
                      onClick={() => { setPage('admin'); setMobileMenuOpen(false); }}
                      className="w-full text-center py-2 rounded bg-[#C9A84C]/10 border border-[#C9A84C] text-[#C9A84C] text-xs font-semibold"
                    >
                      {t('nav.admin')}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { logout(); setPage('home'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-red-950/25 text-red-300 hover:bg-red-900/30 text-xs font-semibold uppercase mt-2 transition-colors border border-red-900/20"
                >
                  <LogOut size={14} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2 mt-2">
                <button
                  onClick={() => { setPage('auth'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 rounded border border-[#C9A84C] text-[#C9A84C] font-semibold text-xs uppercase"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => { setPage('auth'); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 rounded bg-[#C9A84C] text-[#1B2A6B] border border-[#C9A84C] font-semibold text-xs uppercase"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>

        </div>
      )}
      {/* Toast Alert Banner overlay */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] sm:w-full bg-white text-gray-800 rounded-xl shadow-2xl border-l-4 border-[#C9A84C] p-4 flex gap-3 animate-fadeIn border border-amber-100">
          <div className="w-8 h-8 rounded-full bg-[#1B2A6B]/15 flex items-center justify-center text-[#1B2A6B] shrink-0 font-bold">
            <Bell size={14} className="text-[#1B2A6B]" />
          </div>
          <div className="flex-grow select-none">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1B2A6B]">{toast.title}</h4>
            <p className="text-[11px] text-gray-650 mt-0.5 leading-relaxed font-serif italic">"{toast.body}"</p>
            <div className="flex justify-end gap-3 mt-2.5">
              <button
                onClick={() => {
                  setPage(toast.url);
                  setToast(null);
                }}
                className="px-2.5 py-1 bg-[#1B2A6B] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                View Now
              </button>
              <button
                onClick={() => setToast(null)}
                className="text-gray-450 hover:text-gray-700 text-[10px] font-bold uppercase transition-colors mr-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
