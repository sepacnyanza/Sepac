/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, ArrowUpRight, HelpCircle, Heart, DollarSign, Sparkles } from 'lucide-react';

export default function Giving() {
  const { t } = useLanguage();
  
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeEmail, setPledgeEmail] = useState('');
  const [project, setProject] = useState('chapel');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeAmount || !pledgeName || !pledgeEmail) {
      alert('Please fill in all pledges parameters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setPledgeAmount('');
      setPledgeName('');
      setPledgeEmail('');
    }, 1200);
  };

  const campaigns = [
    {
      id: 'chapel',
      title: 'Chapel Structural Expansion',
      desc: 'Expanding and installing modern acoustic media and comfortable seating inside the main Protestant worship space at Saint Esprit High School.',
      raised: '$12,450',
      target: '$25,000',
      percent: 50,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600'
    },
    {
      id: 'lab',
      title: 'Digital Sciences & Computer Lab',
      desc: 'Donating 30 high-speed computers, fiber web access routers, and electronic micro-kits for modern physics laboratory learning.',
      raised: '$8,800',
      target: '$15,000',
      percent: 58,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600'
    },
    {
      id: 'scholarship',
      title: 'Nurturing Leaders Scholarships',
      desc: 'Sponsoring school tuitions, textbooks, and daily uniforms for 15 deserving background students with excellent marks in Nyanza.',
      raised: '$4,200',
      target: '$8,000',
      percent: 52,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600'
    }
  ];

  return (
    <div id="sepac-giving-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] block mb-1">Revitalization Partnership</span>
          <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
            Alumni Giving & School Revitalization Projects
          </h1>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-2.5 rounded"></div>
        </div>

        {/* Hero banner layout */}
        <div className="bg-[#1B2A6B] rounded-2xl p-6 sm:p-10 text-white mb-10 flex flex-col lg:flex-row items-center gap-8 border-b-4 border-[#C9A84C]">
          <div className="flex-1 space-y-4">
            <span className="bg-amber-400 text-[#1B2A6B] text-[9px] font-extrabold px-3 py-1 uppercase rounded-full tracking-wider inline-block">
              Building the Future Together
            </span>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl leading-tight">
              Giving Back to Saint Esprit High School
            </h2>
            <p className="text-xs sm:text-sm text-indigo-150 leading-relaxed font-serif">
              Our alma mater nurtured our faith, minds, and dreams. Through the SEPAC Revitalization Fund, we return that grace. By collaborating with administrators and pastors, we identify critical infrastructural, scholastic, and support gaps to sustain Saint Esprit as a leading beacon of excellence in Rwanda.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-semibold text-amber-300">
              <span className="flex items-center gap-1.5">
                ✓ Transparent Records
              </span>
              <span className="flex items-center gap-1.5">
                ✓ Direct School Impact
              </span>
              <span className="flex items-center gap-1.5">
                ✓ 100% Volunteer Ledger
              </span>
            </div>
          </div>
          <div className="w-full lg:w-96 shrink-0 bg-[#2A3E8A] border border-blue-900 rounded-xl p-6 space-y-4 shadow-inner text-center">
            <Landmark size={44} className="text-[#C9A84C] mx-auto mb-1" />
            <h4 className="font-bold text-sm text-amber-400 uppercase tracking-wide">Pledge Summary: Year 2026</h4>
            <div className="grid grid-cols-2 gap-4 text-left border-y border-indigo-900/60 py-3.5">
              <div>
                <span className="text-[10px] text-gray-300 block uppercase font-bold">Total Raised</span>
                <span className="text-base font-serif font-bold text-white">$25,450 USD</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-300 block uppercase font-bold">Total Contributors</span>
                <span className="text-base font-serif font-bold text-white">48 Alumni</span>
              </div>
            </div>
            <p className="text-[10.5px] text-indigo-200 mt-2 font-serif italic">
              "Every contribution, big or small, represents a seed planted in a child's spiritual legacy."
            </p>
          </div>
        </div>

        {/* Campaign cards & Pledge panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Ongoing campaigns */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="font-serif font-bold text-xl text-[#1B2A6B]">
              Active Revitalization Projects
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    <img src={c.image} alt={c.title} className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
                    <div className="p-5">
                      <h4 className="font-serif font-bold text-base text-[#1B2A6B] mb-2 leading-snug">
                        {c.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-serif">
                        {c.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 font-mono">
                        <span>Raised: {c.raised}</span>
                        <span>Target: {c.target}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A84C] rounded-full transition-all" style={{ width: `${c.percent}%` }} />
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 block text-right">
                        {c.percent}% Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Pledges Panel */}
          <div className="lg:col-span-4 bg-white border border-amber-100 rounded-xl p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
              <Sparkles size={16} className="text-[#C9A84C]" />
              <h3 className="font-serif font-bold text-base text-[#1B2A6B]">
                Submit a Partnership Pledge
              </h3>
            </div>

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs leading-relaxed space-y-2 animate-fadeIn">
                <Heart size={18} className="text-[#C9A84C] animate-pulse" />
                <p className="font-bold">Thank You for Your Pledge!</p>
                <p>We have recorded your partner pledge. An administrator will contact you shortly with the institutional invoice or banking channels in Kigali.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-[10px] uppercase font-bold tracking-wider text-[#1B2A6B] hover:underline"
                >
                  Make another pledge
                </button>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Ineza Divine"
                    value={pledgeName}
                    onChange={(e) => setPledgeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={pledgeEmail}
                    onChange={(e) => setPledgeEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>

                {/* Campaign Choice */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B]">
                    Target Project
                  </label>
                  <select
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  >
                    <option value="chapel">Chapel Structural Expansion</option>
                    <option value="lab">Digital Sciences & Computer Lab</option>
                    <option value="scholarship">Nurturing Leaders Scholarships</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#1B2A6B]">
                    Pledge Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      placeholder="E.g., 250"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] text-xs font-bold uppercase tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer shadow"
                >
                  {loading ? 'Recording...' : 'Send Pledge Partnership'}
                </button>

              </form>
            )}

            <div className="mt-5 pt-4.5 border-t border-gray-50 text-[10px] text-gray-400 font-serif italic text-center">
              Pledges submitted through SEPAC are reviewed by the legal Chaplain and validated inside yearly general assembly bulletins.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
