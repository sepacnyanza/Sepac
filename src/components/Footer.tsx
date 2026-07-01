/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import SepacLogo from './SepacLogo';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  setPage: (page: string) => void;
}

export default function Footer({ setPage }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer id="sepac-footer" className="bg-[#101944] text-gray-300 border-t-4 border-[#C9A84C] pt-14 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Scripture Verse Highlight Card block */}
        <div className="bg-[#1B2A6B]/50 border border-[#C9A84C]/40 rounded-xl p-6 sm:p-8 mb-12 shadow-lg max-w-4xl mx-auto text-center transform hover:scale-[1.01] transition-transform">
          <span className="text-amber-400 font-sans text-xs tracking-widest font-semibold uppercase block mb-3">
            {t('brand.scripture.ref')}
          </span>
          <p className="font-serif italic text-white text-[15px] sm:text-[17px] leading-relaxed max-w-3xl mx-auto block">
            "{t('brand.scripture.text')}"
          </p>
          <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto mt-4 rounded"></div>
        </div>

        {/* 3-Column main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 mb-12">
          
          {/* Column 1: School Heritage & Circular Brand */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white p-1 rounded-full border border-[#C9A84C]">
                <SepacLogo size={60} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-white text-lg tracking-wide uppercase leading-none">
                  SEPAC ALUMNI
                </span>
                <span className="text-[10px] text-amber-400 tracking-wider font-semibold uppercase mt-1">
                  Saint Esprit Protestant
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-serif italic max-w-md">
              "We are an alumni fellowship dedicated to Saint Esprit Protestant school graduates, united in Christian love, service advocacy, in-depth prayer support, and community welfare initiatives."
            </p>
            
            {/* Social Icons Panel */}
            <div className="flex space-x-3 mt-5">
              <a href="#" className="w-8 h-8 rounded-full bg-[#1B2A6B] flex items-center justify-center border border-gray-700 text-gray-300 hover:text-white hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] transition-all" title="Facebook">
                <Facebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1B2A6B] flex items-center justify-center border border-gray-700 text-gray-300 hover:text-white hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] transition-all" title="Twitter">
                <Twitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1B2A6B] flex items-center justify-center border border-gray-700 text-gray-300 hover:text-white hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1B2A6B] transition-all" title="Instagram">
                <Instagram size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 text-center md:text-left">
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4 border-b border-gray-800 pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <li>
                <button onClick={() => setPage('home')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('about')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('members')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {t('nav.members')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('news')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {t('nav.news')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('events')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  {t('nav.events')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Landmarks */}
          <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-sm font-bold text-white tracking-widest uppercase mb-4 border-b border-gray-800 pb-2 inline-block">
              {t('nav.contact')}
            </h4>
            <div className="space-y-3 text-xs text-gray-400 font-medium">
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <MapPin size={14} className="text-amber-400 shrink-0" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <Mail size={14} className="text-amber-400 shrink-0" />
                <span>sepacnyanza@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <Phone size={14} className="text-amber-400 shrink-0" />
                <span>+250786047305 / +250796379882</span>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-gray-500 font-serif italic">
              "Together in Christ, Stronger in Purpose."
            </div>
          </div>

        </div>

        {/* Separator, Copyright, Tributes */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <p className="text-xs text-gray-500">
            &copy; 2026 SEPAC (Saint Esprit Protestant Alumni Community). All rights reserved.
          </p>
          <p className="text-[10px] text-gray-500 flex items-center mt-2.5 md:mt-0 font-medium tracking-wide uppercase">
            <span>Made with faith</span>
            <Heart size={10} className="mx-1 text-red-500 fill-red-500" />
            <span>for Saint Esprit Alumni</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
