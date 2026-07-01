/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GalleryPhoto } from '../types';
import { Image as ImageIcon, Camera, Upload, Eye, X, ArrowRightCircle } from 'lucide-react';

export default function Gallery() {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Modal Upload UI state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [eventTag, setEventTag] = useState('');
  const [modalErr, setModalErr] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();

    const handleUpdate = () => {
      fetchPhotos(true); // silent update
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token, user]);

  const fetchPhotos = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.gallery);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr(null);
    setModalSuccess(null);

    if (!photoUrl.trim() || !eventTag.trim()) {
      setModalErr('All inputs are required');
      return;
    }

    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          image_url: photoUrl,
          event_tag: eventTag
        })
      });

      const data = await res.json();
      if (res.ok) {
        setModalSuccess(t('gallery.upload.success'));
        setPhotoUrl('');
        setEventTag('');
        
        // Refresh local files
        fetchPhotos();

        setTimeout(() => {
          setUploadOpen(false);
          setModalSuccess(null);
        }, 2200);
      } else {
        setModalErr(data.error || 'Failed to submit photo');
      }
    } catch (err) {
      setModalErr('Connection timed-out');
    }
  };

  // Extract unique event tags for category dropdown
  const uniqueTags = Array.from(new Set(photos.map(p => p.event_tag)))
    .filter(Boolean)
    .sort((a, b) => (a as string).localeCompare(b as string));

  const filteredPhotos = photos.filter(p => {
    if (selectedTag === 'All') return true;
    return p.event_tag === selectedTag;
  });

  const isApprovedAndVerified = user && user.approved;

  return (
    <div id="sepac-gallery-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-150 pb-6 mb-8 gap-4 text-center sm:text-left">
          <div>
            <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
              {t('gallery.title')}
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider font-sans">
              Moments of faith, praise and outreaches saved
            </p>
          </div>

          {/* Upload triggers if registered */}
          {isApprovedAndVerified && (
            <button
              onClick={() => setUploadOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#C9A84C] text-[#1B2A6B] text-xs font-extrabold uppercase tracking-widest hover:bg-[#1B2A6B] hover:text-[#C9A84C] transition-all hover:shadow cursor-pointer flex items-center gap-2 border border-[#C9A84C]"
            >
              <Camera size={14} />
              <span>{t('gallery.upload.btn')}</span>
            </button>
          )}
        </div>

        {/* Filter select tags dropdown */}
        <div className="flex justify-center sm:justify-start gap-2.5 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
              selectedTag === 'All'
                ? 'bg-[#1B2A6B] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#1B2A6B]'
            }`}
          >
            {t('gallery.tag.all')}
          </button>
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#1B2A6B] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#1B2A6B]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl aspect-square" />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-xl max-w-md mx-auto shadow-sm">
            <ImageIcon size={44} className="text-gray-300 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-gray-500 text-lg">No Images Loaded</h3>
            <p className="text-xs text-gray-400 mt-1">Submit high-contrast pictures of our outreaches!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4.5">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`group relative rounded-xl overflow-hidden border border-gray-150 shadow-sm aspect-square bg-white transform hover:-translate-y-1 hover:shadow-md transition-all ${
                  photo.status === 'pending' ? 'bg-amber-50/15 border-dashed border-amber-200' : ''
                }`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.event_tag}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Cover info labels on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    {photo.event_tag}
                  </span>
                  <span className="text-[11px] leading-tight font-medium font-serif mt-1 block truncate">
                    Uploaded by {photo.uploader_name}
                  </span>
                  {photo.status === 'pending' && (
                    <span className="mt-2 text-[8px] uppercase tracking-wider bg-amber-500 text-white font-bold py-0.5 px-2 rounded-full w-max leading-none">
                      Pending review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Upload modal wrapper panel */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden transform scale-98 hover:scale-100 transition-transform">
            
            <div className="bg-[#1B2A6B] text-white p-4 flex justify-between items-center border-b border-[#C9A84C]">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Upload size={14} className="text-[#C9A84C]" />
                <span>{t('gallery.upload.title')}</span>
              </h3>
              <button
                onClick={() => setUploadOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-[#C9A84C]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              
              {modalErr && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs leading-none">
                  {modalErr}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs select-none leading-tight">
                  {modalSuccess}
                </div>
              )}

              {/* Tag event parameter */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('gallery.form.tag')}
                </label>
                <input
                  type="text"
                  placeholder="E.g., Outreaches Kigali 2026"
                  value={eventTag}
                  onChange={(e) => setEventTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!modalSuccess}
                />
              </div>

              {/* Photo URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('gallery.form.url')}
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!modalSuccess}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs uppercase font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={!!modalSuccess}
                >
                  {t('news.create.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-bold uppercase text-xs tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer"
                  disabled={!!modalSuccess}
                >
                  {t('news.create.submit')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
