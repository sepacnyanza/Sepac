/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Mail, Phone, Clock, Send, Globe } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !msg.trim()) {
      setErr('Please fill in all inputs');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message: msg })
      });
      if (res.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMsg('');
      } else {
        const data = await res.json();
        setErr(data.error || 'Failed to submit form');
      }
    } catch (e) {
      setErr('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="sepac-contact-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center border-b border-gray-100 pb-8 mb-10">
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            {t('contact.title')}
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-semibold font-sans tracking-wider">
            {t('contact.subtitle')}
          </p>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-2 rounded"></div>
        </div>

        {/* 2-Column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
          
          {/* Form Side (md:col-span-7) */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 md:p-8 md:col-span-7">
            <h3 className="font-serif font-bold text-[#1B2A6B] text-xl mb-6">
              Write Us an Inquiry
            </h3>

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs leading-relaxed mb-6 font-medium animate-fadeIn">
                {t('contact.form.success')}
              </div>
            )}
            {err && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed mb-6 font-medium">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Message content */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('contact.form.msg')}
                </label>
                <textarea
                  rows={5}
                  placeholder="Share details of your ideas..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-extrabold uppercase text-xs tracking-wider border border-[#1B2A6B] hover:border-[#1B2A6B] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <Send size={12} />
                <span>{loading ? 'Submitting...' : t('contact.form.submit')}</span>
              </button>

            </form>
          </div>

          {/* Details / Lands / Social (md:col-span-5) */}
          <div className="bg-[#1B2A6B] text-white rounded-xl shadow-md p-6 sm:p-8 md:col-span-5 flex flex-col justify-between border-b-4 border-[#C9A84C]">
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-400 uppercase tracking-widest mb-6">
                Connect Directly
              </h3>

              <div className="space-y-6 text-xs text-indigo-100 font-medium font-serif leading-relaxed">
                {/* Location */}
                <div className="flex gap-3">
                  <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-white font-serif font-bold tracking-wide uppercase text-[10px] block">Official Headquarters</span>
                    <p>Kigali, Rwanda</p>
                  </div>
                </div>

                {/* Email address */}
                <div className="flex gap-3">
                  <Mail size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-white font-serif font-bold tracking-wide uppercase text-[10px] block">Write Emails</span>
                    <p>sepacnyanza@gmail.com</p>
                    <p>info.members@sepac.org</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3">
                  <Phone size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-white font-serif font-bold tracking-wide uppercase text-[10px] block">Telephone Logs</span>
                    <p>+250786047305</p>
                    <p>+250796379882</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-indigo-900/50 pt-5 text-[11px] text-indigo-200 font-medium">
              "We encourage every alumnus to maintain connections, renew faith, and register for services."
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
