/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Compass, Eye, Heart, Target, Star, Award } from 'lucide-react';

export default function Mission() {
  const { t } = useLanguage();

  return (
    <div id="sepac-mission-page" className="bg-[#FCF9F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Title Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C9A84C] block mb-2">Our Spiritual Foundation</span>
          <h1 className="font-serif font-extrabold text-4xl text-[#1B2A6B]">
            Mission & Vision
          </h1>
          <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-3 rounded"></div>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mt-4 font-serif italic">
            "Where there is no vision, the people perish: but he that keepeth the law, happy is he." — Proverbs 29:18
          </p>
        </div>

        {/* Two Pillars Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          
          {/* Mission Pillar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#C9A84C]/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-40" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#1B2A6B]/5 border border-[#C9A84C]/30 flex items-center justify-center mb-6">
                <Target size={24} className="text-[#1B2A6B]" />
              </div>
              
              <h2 className="font-serif font-extrabold text-2xl text-[#1B2A6B] mb-4">
                Our Mission
              </h2>
              <div className="w-10 h-0.5 bg-[#C9A84C] mb-4"></div>
              
              <p className="text-sm text-gray-600 leading-relaxed font-serif mb-6">
                To unite all Protestant alumni of Saint Esprit high school in Kigali and globally in active, lifegiving Christian fellowship. We are committed to fostering deep spiritual nourishment, facilitating professional networking, providing mutual support through life's milestones, and launching Christ-focused community engagement and outreach projects.
              </p>

              <ul className="space-y-3 text-xs text-gray-700 font-medium">
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <span>Nurture spiritual growth and Protestant values</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <span>Build lifelong networking and connection webs</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <span>Mobilize charitable resources for schools and pupils</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Vision Pillar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#C9A84C]/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-bl-full -z-0 opacity-40" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#1B2A6B]/5 border border-[#C9A84C]/30 flex items-center justify-center mb-6">
                <Eye size={24} className="text-[#1B2A6B]" />
              </div>
              
              <h2 className="font-serif font-extrabold text-2xl text-[#1B2A6B] mb-4">
                Our Vision
              </h2>
              <div className="w-10 h-0.5 bg-[#C9A84C] mb-4"></div>
              
              <p className="text-sm text-gray-600 leading-relaxed font-serif mb-6">
                To build an active, highly empowered global community of graduates from Saint Esprit secondary school who act as positive catalysts of spiritual integrity, outstanding professional success, and direct humanitarian support inside and outside Rwanda.
              </p>

              <ul className="space-y-3 text-xs text-gray-700 font-medium">
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B2A6B]" />
                  <span>Recognized as a leading model for alumni communities</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B2A6B]" />
                  <span>Ensuring no alumnus walks alone in academic or career journeys</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B2A6B]" />
                  <span>Leading long-term educational campus revitalizations</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Core Values block */}
        <div className="bg-[#1B2A6B] text-white rounded-3xl p-8 sm:p-10 shadow-lg border-b-8 border-[#C9A84C]">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] block mb-1">Our Pillars of Fellowship</span>
            <h3 className="font-serif font-bold text-2xl text-white">
              The SEPAC Core Values
            </h3>
            <div className="w-12 h-0.5 bg-[#C9A84C] mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Value 1: Unity */}
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Heart size={18} className="text-[#C9A84C]" />
              </div>
              <h4 className="font-serif font-bold text-base text-white mb-1.5">Unity</h4>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                Bound together by the love of Christ, walking as one family of faith.
              </p>
            </div>

            {/* Value 2: Faith */}
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Compass size={18} className="text-[#C9A84C]" />
              </div>
              <h4 className="font-serif font-bold text-base text-white mb-1.5">Faith</h4>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                Founded firmly on the living Word of God and His grace-filled calling.
              </p>
            </div>

            {/* Value 3: Fellowship */}
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Star size={18} className="text-[#C9A84C]" />
              </div>
              <h4 className="font-serif font-bold text-base text-white mb-1.5">Fellowship</h4>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                Supporting classmates with deep prayer, shared joy, and true encouragement.
              </p>
            </div>

            {/* Value 4: Service */}
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Award size={18} className="text-[#C9A84C]" />
              </div>
              <h4 className="font-serif font-bold text-base text-white mb-1.5">Service</h4>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                Serving our schools and society with absolute humility and love.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
