/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import SepacLogo from '../components/SepacLogo';
import { Shield, BookOpen, Users, Compass, Star } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  const leadershipTeam = [
    {
      name: "Rev. Jean d'Amour",
      role: "Super Administrator & Chaplain",
      roleRw: "Umuyobozi Mukuru & Umushumba",
      grad: "1998",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      bio: "Chaplain of SEPAC with years of dedicated pastoral service. Focused on maintaining the strong Protestant heritage of Saint Esprit."
    },
    {
      name: "Marie Claire Uwase",
      role: "Communications Moderator",
      roleRw: "Ikiranga Amakuru",
      grad: "2005",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
      bio: "Facilitating communication links across global alumni cohorts. Managing news publication rules and database networking panels."
    },
    {
      name: "Dr. Emmanuel Ruzindana",
      role: "Fellowship coordinator",
      roleRw: "Umuhuzabikorwa w'Ubusabane",
      grad: "2001",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      bio: "Organizes corporate picnics, pastoral conferences, and spiritual cell fellowships in different regions and districts of Rwanda."
    }
  ];

  const pillars = [
    { title: t('value.unity'), desc: t('value.unity.desc'), icon: <Users size={20} /> },
    { title: t('value.faith'), desc: t('value.faith.desc'), icon: <BookOpen size={20} /> },
    { title: t('value.fellowship'), desc: t('value.fellowship.desc'), icon: <Compass size={20} /> },
    { title: t('value.service'), desc: t('value.service.desc'), icon: <Shield size={20} /> }
  ];

  return (
    <div id="sepac-about-page" className="bg-[#FCF9F2]">
      
      {/* Page Header */}
      <section className="bg-[#1B2A6B] text-white py-14 border-b-2 border-[#C9A84C] relative text-center">
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl tracking-tight text-white mb-2">
            {t('nav.about')}
          </h1>
          <p className="text-xs uppercase font-extrabold text-[#C9A84C] tracking-widest">
            {t('brand.tagline')}
          </p>
        </div>
      </section>

      {/* History section / Heritage columns */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Logo emblem panel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#C9A84C] shadow-2xl relative">
              <SepacLogo size={240} />
              <div className="absolute -bottom-4 bg-[#1B2A6B] text-[#C9A84C] text-[10px] font-bold uppercase py-1.5 px-4 rounded-full border border-[#C9A84C] whitespace-nowrap shadow">
                Est. Saint Esprit School
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B2A6B] mb-4">
              {t('about.history.title')}
            </h2>
            <div className="w-12 h-1 bg-[#C9A84C] mb-6 rounded"></div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-serif italic font-medium">
              <p>{t('about.history.desc.1')}</p>
              <p>{t('about.history.desc.2')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision block */}
      <section className="bg-white border-t border-b border-amber-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <div className="bg-[#FAF8F5] border border-amber-200/50 rounded-xl p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-[#1B2A6B]/10 rounded-full flex items-center justify-center text-[#1B2A6B] mb-5">
              <Compass size={20} />
            </div>
            <h3 className="font-serif font-bold text-[#1B2A6B] text-xl mb-3">
              {t('about.mv.mission')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium font-sans">
              {t('about.mv.mission.text')}
            </p>
          </div>

          {/* Vision card */}
          <div className="bg-[#FAF8F5] border border-amber-200/50 rounded-xl p-6 sm:p-8 flex flex-col hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center text-[#C9A84C] mb-5">
              <Star size={20} />
            </div>
            <h3 className="font-serif font-bold text-[#1B2A6B] text-xl mb-3">
              {t('about.mv.vision')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium font-sans">
              {t('about.mv.vision.text')}
            </p>
          </div>

        </div>
      </section>

      {/* Roster / Pillars list */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B2A6B]">
            {t('about.team.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider">
            {t('about.team.subtitle')}
          </p>
          <div className="w-12 h-1 bg-[#C9A84C] mx-auto mt-4 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leadershipTeam.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full"
            >
              <div className="h-64 bg-gray-100 shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                   {t('members.grad')}: {item.grad}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#1B2A6B] mt-1 mb-1 leading-none">{item.name}</h3>
                <span className="text-xs text-indigo-900 uppercase tracking-wide font-bold mb-4 block">
                  {t('brand.title') === 'SEPAC' ? item.role : item.roleRw}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed font-medium flex-grow italic">
                  "{item.bio}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
