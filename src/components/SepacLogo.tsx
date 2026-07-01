/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SepacLogoProps {
  className?: string;
  size?: number;
}

export default function SepacLogo({ className = '', size = 180 }: SepacLogoProps) {
  return (
    <svg
      id="sepac-seal-logo"
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      {/* Definitions for gradients or clip-paths */}
      <defs>
        <path id="text-arc-top" d="M 60,250 A 190,190 0 1,1 440,250" />
        <path id="text-arc-bottom" d="M 440,250 A 190,190 0 0,1 60,250" />
        
        <radialGradient id="sun-glow" cx="250" cy="220" r="140" fx="250" fy="220">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1B2A6B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background & Outer Rings */}
      <circle cx="250" cy="250" r="240" stroke="#1B2A6B" strokeWidth="6" fill="#FFFFFF" />
      <circle cx="250" cy="250" r="230" stroke="#C9A84C" strokeWidth="2.5" />
      <circle cx="250" cy="250" r="224" stroke="#1B2A6B" strokeWidth="1.5" />
      
      {/* Outer Inner Ring for text alignment */}
      <circle cx="250" cy="250" r="172" stroke="#C9A84C" strokeWidth="2" />
      <circle cx="250" cy="250" r="170" stroke="#1B2A6B" strokeWidth="1" />

      {/* Radiant Sunburst achter cross */}
      <circle cx="250" cy="220" r="130" fill="url(#sun-glow)" />
      
      {/* Sun Rays */}
      <g stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <line x1="250" y1="220" x2="250" y2="100" />
        <line x1="250" y1="220" x2="250" y2="340" />
        <line x1="250" y1="220" x2="130" y2="220" />
        <line x1="250" y1="220" x2="370" y2="220" />
        
        {/* Diagonals */}
        <line x1="250" y1="220" x2="165" y2="135" />
        <line x1="250" y1="220" x2="335" y2="305" />
        <line x1="250" y1="220" x2="335" y2="135" />
        <line x1="250" y1="220" x2="165" y2="305" />

        {/* Medium rays */}
        <line x1="250" y1="220" x2="205" y2="110" />
        <line x1="250" y1="220" x2="295" y2="110" />
        <line x1="250" y1="220" x2="205" y2="330" />
        <line x1="250" y1="220" x2="295" y2="330" />
        <line x1="250" y1="220" x2="140" y2="175" />
        <line x1="250" y1="220" x2="360" y2="175" />
        <line x1="250" y1="220" x2="140" y2="265" />
        <line x1="250" y1="220" x2="360" y2="265" />
      </g>

      {/* Top Arched Text (Saint Esprit Protestant Alumni Community) */}
      <text fill="#1B2A6B" fontSize="19.5" fontWeight="700" fontFamily="Times New Roman, Georgia, serif" letterSpacing="2.5">
        <textPath href="#text-arc-top" startOffset="50%" textAnchor="middle">
          SAINT ESPRIT PROTESTANT ALUMNI COMMUNITY
        </textPath>
      </text>

      {/* Ground/Hill curve */}
      <path d="M 130,275 Q 250,230 370,275" stroke="#1B2A6B" strokeWidth="3" fill="none" />

      {/* Community Figures (Silhouettes holding hands behind the bible) */}
      <g fill="#1B2A6B">
        {/* Figure 1 (Leftmost) */}
        <circle cx="168" cy="188" r="10.5" />
        <path d="M 168,198 C 158,206 142,204 128,192 C 132,205 145,215 152,225 C 158,235 156,260 156,260 L 165,260 C 165,250 167,222 172,212 C 174,218 175,232 175,260 L 182,260 C 182,246 178,212 178,204 Z" />

        {/* Figure 2 (Inner Left) */}
        <circle cx="218" cy="186" r="11" />
        <path d="M 218,197 C 205,199 193,195 180,188 C 188,198 198,206 204,216 C 208,225 207,255 207,255 L 216,255 C 216,245 218,220 222,212 C 224,216 226,225 226,255 L 234,255 C 234,242 228,212 228,204 Z" />

        {/* Figure 3 (Inner Right) */}
        <circle cx="282" cy="186" r="11" />
        <path d="M 282,197 C 295,199 307,195 320,188 C 312,198 302,206 296,216 C 292,225 293,255 293,255 L 284,255 C 284,245 282,220 278,212 C 276,216 274,225 274,255 L 266,255 C 266,242 272,212 272,204 Z" />

        {/* Figure 4 (Rightmost) */}
        <circle cx="332" cy="188" r="10.5" />
        <path d="M 332,198 C 342,206 358,204 372,192 C 368,205 355,215 348,225 C 342,235 344,260 344,260 L 335,260 C 335,250 333,222 328,212 C 326,218 325,232 325,260 L 318,260 C 318,246 322,212 322,204 Z" />
      </g>

      {/* Central Cross */}
      <g fill="#1B2A6B" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="miter">
        {/* Cross Vertical Beam */}
        <rect x="238" y="103" width="24" height="152" rx="2" />
        {/* Cross Horizontal Beam */}
        <rect x="206" y="132" width="88" height="24" rx="2" strokeWidth="2" />
      </g>

      {/* Opened Bible (at the bottom center) */}
      <g>
        {/* Book shadow/edges */}
        <path d="M 125,282 C 185,274 240,290 250,294 C 260,290 315,274 375,282 L 370,250 C 310,242 260,256 250,260 C 240,256 190,242 130,250 Z" fill="#0E163B" opacity="0.3" />
        
        {/* Pages background */}
        <path d="M 130,277 C 190,269 242,284 250,288 C 258,284 310,269 370,277" stroke="#1B2A6B" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 130,275 C 190,267 242,282 250,286 C 258,282 310,267 370,275" stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round" />
        
        {/* Main book cover and pages layout */}
        <path d="M 132,274 Q 190,248 248,272 L 248,242 Q 190,218 132,244 Z" fill="#FFFFFF" stroke="#1B2A6B" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 368,274 Q 310,248 252,272 L 252,242 Q 310,218 368,244 Z" fill="#FFFFFF" stroke="#1B2A6B" strokeWidth="3" strokeLinejoin="round" />
        
        {/* Text lines in Bible Pages */}
        <g stroke="#1B2A6B" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
          {/* Left Page Pages Lines */}
          <line x1="148" y1="242" x2="225" y2="252" />
          <line x1="148" y1="248" x2="228" y2="258" />
          <line x1="150" y1="254" x2="230" y2="264" />
          <line x1="152" y1="260" x2="226" y2="270" />
          
          {/* Right Page Pages Lines */}
          <line x1="272" y1="252" x2="352" y2="242" />
          <line x1="270" y1="258" x2="352" y2="248" />
          <line x1="270" y1="264" x2="350" y2="254" />
          <line x1="274" y1="270" x2="348" y2="260" />
        </g>

        {/* Gold Bookmark Ribbon */}
        <path d="M 248,272 L 248,298 L 252,298 L 252,272 Z" fill="#C9A84C" />
        <path d="M 248,295 L 250,291 L 252,295 Z" fill="#FFFFFF" />
      </g>

      {/* Dove Flying (representing the Holy Spirit, on the right side) */}
      <g fill="#FFFFFF" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Dove Body, Wings, and Beak */}
        <path d="M 388,242 C 386,248 382,254 388,258 C 392,260 405,258 412,262 C 418,265 422,272 428,272 C 428,264 424,258 438,252 C 445,249 452,246 456,238 C 450,238 440,242 432,242 C 425,242 422,240 422,236 C 422,230 435,224 445,224 C 438,222 428,224 418,226 C 410,228 404,233 398,236 Z" fill="#FFFFFF" />
        {/* Dove tail feathers details */}
        <path d="M 438,252 C 442,256 446,260 450,264 M 442,250 C 448,253 453,256 455,258" stroke="#C9A84C" strokeWidth="1.2" />
        {/* Tiny branch branch in beak */}
        <path d="M 388,242 C 382,238 375,238 372,241" stroke="#C9A84C" strokeWidth="1.5" fill="none" />
        <ellipse cx="373" cy="239" rx="2" ry="4" transform="rotate(-30 373 239)" fill="#C9A84C" stroke="none" />
        <ellipse cx="377" cy="241" rx="2" ry="4" transform="rotate(30 377 241)" fill="#C9A84C" stroke="none" />
      </g>

      {/* Gold Olive Branch on the left of seal */}
      <g fill="#C9A84C" stroke="none">
        {/* Branch stem */}
        <path d="M 103,275 C 98,255 106,230 118,212 C 120,209 122,211 120,214 C 110,230 102,252 105,273 Z" opacity="0.9" />
        {/* Leaves */}
        <path d="M 120,218 C 115,214 110,214 105,218 C 103,222 106,226 112,228 C 118,230 121,224 120,218 Z" />
        <path d="M 106,228 C 100,225 96,228 92,233 C 92,238 96,241 101,240 C 106,239 108,233 106,228 Z" />
        <path d="M 116,234 C 112,230 106,230 101,234 C 100,239 102,243 108,245 C 114,247 117,240 116,234 Z" />
        <path d="M 100,248 C 94,245 90,248 86,253 C 86,258 90,261 95,260 C 100,259 102,253 100,248 Z" />
        <path d="M 112,252 C 107,249 102,250 97,255 C 96,260 99,263 104,264 C 109,265 112,258 112,252 Z" />
        <path d="M 98,266 C 93,264 89,267 85,272 C 85,277 89,280 94,279 C 99,278 100,272 98,266 Z" />
      </g>

      {/* Large Bold serif "SEPAC" Banner text */}
      <text x="250" y="360" fill="#1B2A6B" fontSize="88" fontWeight="800" fontFamily="Georgia, 'Times New Roman', serif" textAnchor="middle" letterSpacing="4">
        SEPAC
      </text>

      {/* Decorative Gold Dots & Lines underneath "SEPAC" */}
      <g stroke="#C9A84C" strokeWidth="2" strokeLinecap="round">
        <line x1="82" y1="368" x2="418" y2="368" />
        <polygon points="82,368 86,371 86,365" fill="#C9A84C" />
        <polygon points="418,368 414,371 414,365" fill="#C9A84C" />
      </g>

      {/* Value statement wrapped with Gold lines */}
      <text x="250" y="388.5" fill="#1B2A6B" fontSize="15.5" fontWeight="700" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="1">
        UNITY  |  FAITH  |  FELLOWSHIP  |  SERVICE
      </text>

      {/* Scripture reference / Tagline */}
      <g>
        <path d="M 175,410 L 210,410 M 290,410 L 325,410" stroke="#C9A84C" strokeWidth="1.5" />
        <text x="250" y="414" fill="#1B2A6B" fontSize="13.5" fontWeight="700" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="1">
          HEB 10:24-25
        </text>
      </g>

      {/* Bottom Arched Tagline (Together in Christ, Stronger in Purpose) */}
      <text fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="1.2">
        <textPath href="#text-arc-bottom" startOffset="50%" textAnchor="middle" dy="-4">
          TOGETHER IN CHRIST, STRONGER IN PURPOSE
        </textPath>
      </text>
    </svg>
  );
}
