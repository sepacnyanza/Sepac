/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Post, PostComment, PostCategory } from '../types';
import { BookOpen, Users, MessageSquare, Heart, Bookmark, Eye, ArrowRight, PenTool, X, Send } from 'lucide-react';

export default function News() {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  
  // Custom dialog state for creating a post
  const [writeOpen, setWriteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PostCategory>('News');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSuccess, setDialogSuccess] = useState<string | null>(null);

  // Dynamic comment box states, matched of post.id -> string
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
    if (token && user?.approved) {
      fetchUserLikes();
    }

    const handleUpdate = () => {
      fetchPosts(true); // silent background fetch
      if (token && user?.approved) {
        fetchUserLikes();
      }
    };

    window.addEventListener('sepac-update', handleUpdate);
    return () => {
      window.removeEventListener('sepac-update', handleUpdate);
    };
  }, [token, user]);

  const fetchPosts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        headers: token ? { 'Authorization': token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const res = await fetch('/api/users/likes', {
        headers: { 'Authorization': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setLikedPostIds(data.likedIds || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['All', 'News', 'Devotional', 'Announcement', 'Events'];

  const filteredPosts = posts.filter(p => {
    if (selectedCat === 'All') return true;
    return p.category === selectedCat;
  });

  // Action: toggle Like
  const handleLike = async (postId: string) => {
    if (!token || !user?.approved) return;

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local list
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, likes_count: data.likesCount };
          }
          return p;
        }));

        if (data.hasLiked) {
          setLikedPostIds([...likedPostIds, postId]);
        } else {
          setLikedPostIds(likedPostIds.filter(id => id !== postId));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Show Comments accordion
  const toggleComments = async (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(postId);
    await fetchCommentsForPost(postId);
  };

  const fetchCommentsForPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsMap(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Add comment
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !token) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ content: text })
      });
      if (res.ok) {
        // Clear input details
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        // Refresh comments list
        await fetchCommentsForPost(postId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Submit custom article for approval
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError(null);
    setDialogSuccess(null);

    if (!newTitle.trim() || !newContent.trim()) {
      setDialogError('Title and Content are required');
      return;
    }

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          image_url: newImageUrl || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setDialogSuccess(t('news.create.success'));
        setNewTitle('');
        setNewContent('');
        setNewImageUrl('');
        
        // Refresh feed list
        fetchPosts();

        // Close after 3 seconds
        setTimeout(() => {
          setWriteOpen(false);
          setDialogSuccess(null);
        }, 2200);
      } else {
        setDialogError(data.error || 'Failed to submit post');
      }
    } catch (err) {
      setDialogError('Database offline or server timed-out');
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'News': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Events': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Devotional': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Announcement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeCommentsLog = openCommentsPostId ? commentsMap[openCommentsPostId] || [] : [];
  const isMemberApproved = user && user.approved;

  return (
    <div id="sepac-news-page" className="bg-[#FCF9F2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Top header with Actions shortcut */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 pb-6 mb-8 gap-4 text-center sm:text-left">
          <div>
            <h1 className="font-serif font-extrabold text-3xl text-[#1B2A6B]">
              {t('news.title')}
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wider font-sans">
              Stay spiritually enriched by fellow Alumni
            </p>
          </div>

          {/* Submitting button if members are logged-in and approved! */}
          {isMemberApproved && (
            <button
              onClick={() => setWriteOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#C9A84C] text-[#1B2A6B] text-xs font-extrabold uppercase tracking-widest hover:bg-[#1B2A6B] hover:text-[#C9A84C] hover:shadow-lg transition-all ease-in-out cursor-pointer flex items-center gap-2 border border-[#C9A84C]"
            >
              <PenTool size={14} />
              <span>{t('news.create.btn')}</span>
            </button>
          )}
        </div>

        {/* Categorization tabs bar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-amber-100/50 justify-center sm:justify-start">
          {categories.map((cat) => {
            const active = (cat === 'All' ? 'All' : cat) === selectedCat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  active
                    ? 'bg-[#1B2A6B] text-white shadow-sm'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#1B2A6B]'
                }`}
              >
                {cat === 'All' ? t('category.all') || 'All' : cat}
              </button>
            );
          })}
        </div>

        {/* Posts results list */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl h-96 border border-gray-150" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl shadow-sm">
            <BookOpen size={48} className="text-gray-200 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-gray-500 text-lg">No Feed Articles Found</h3>
            <p className="text-xs text-gray-400 mt-1">Try expanding tab categories or writing one!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => {
              const hasLiked = likedPostIds.includes(post.id);
              const commentsOpen = openCommentsPostId === post.id;
              
              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden relative flex flex-col md:flex-row transition-all ${
                    post.status === 'pending' ? 'bg-amber-50/15 border-dashed border-amber-200' : ''
                  }`}
                >
                  {/* Image Layout */}
                  {post.image_url ? (
                    <div className="md:w-2/5 shrink-0 relative h-64 md:h-auto min-h-[220px] bg-gray-100 border-r border-[#FAF8F5]">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="md:w-2/5 shrink-0 bg-gradient-to-br from-[#1B2A6B] to-[#101944] text-white p-8 flex items-center justify-center min-h-[160px]">
                      <BookOpen size={56} className="opacity-25" />
                    </div>
                  )}

                  {/* Body details */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    
                    {/* Status badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${getCategoryTheme(post.category)}`}>
                        {post.category}
                      </span>
                      
                      {post.status === 'pending' && (
                        <span className="bg-amber-100/70 text-amber-800 border border-amber-100 text-[8.5px] font-extrabold uppercase tracking-wide py-0.5 px-2 rounded-full">
                          {t('news.pending')}
                        </span>
                      )}
                      {post.status === 'rejected' && (
                        <span className="bg-red-100 text-red-800 text-[8.5px] font-extrabold uppercase tracking-wide py-0.5 px-2 rounded-full">
                          {t('news.rejected')}
                        </span>
                      )}

                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="font-serif font-extrabold text-[20px] sm:text-[23px] text-[#1B2A6B] leading-snug mb-3">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-serif font-medium italic whitespace-pre-line mb-6">
                      {post.content}
                    </p>

                    <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-xs text-gray-500">
                      
                      {/* Author Card detail */}
                      <span className="font-sans font-semibold text-gray-700">
                        {t('news.author')}: <span className="text-[#1B2A6B] font-bold text-sm">By {post.author_name}</span>
                      </span>

                      {/* Interaction Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Likes */}
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={!isMemberApproved}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                            hasLiked
                              ? 'bg-red-50 text-red-600 font-bold'
                              : isMemberApproved 
                                ? 'bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <Heart size={14} className={hasLiked ? 'fill-red-600' : ''} />
                          <span>{post.likes_count}</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                            commentsOpen
                              ? 'bg-amber-50 text-[#1B2A6B] font-bold border border-amber-200'
                              : 'bg-gray-50 hover:bg-amber-50 hover:text-[#1B2A6B] text-gray-500'
                          }`}
                        >
                          <MessageSquare size={14} />
                          <span>{t('news.comments')}</span>
                        </button>
                      </div>

                    </div>

                    {/* Accordion list details */}
                    {commentsOpen && (
                      <div className="mt-6 border-t border-amber-100 pt-5 space-y-4">
                        <h4 className="text-xs font-serif font-bold text-[#1B2A6B] uppercase tracking-wider mb-2">
                          Comments Section
                        </h4>

                        {/* Text reply input */}
                        {isMemberApproved ? (
                          <div className="flex items-center gap-2 mb-4">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              placeholder={t('news.comments.add')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                              className="flex-grow text-xs sm:text-sm pl-3 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="p-2 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] transition-colors cursor-pointer"
                            >
                              <Send size={15} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 bg-gray-50 rounded-lg p-2.5 text-center leading-relaxed">
                            Sign in and verify your alumni account to react or participate on discussions.
                          </div>
                        )}

                        {/* Real-time approved comments logs */}
                        {activeCommentsLog.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic text-center py-2">No comments published yet. Be the first!</p>
                        ) : (
                          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                            {activeCommentsLog.map((comment) => (
                              <div key={comment.id} className="bg-gray-50 rounded-lg p-3 text-xs flex gap-2.5">
                                {comment.author_avatar ? (
                                  <img
                                    src={comment.author_avatar}
                                    alt={comment.author_name}
                                    className="w-7 h-7 rounded-full object-cover stroke-gray-200 border"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-[#1B2A6B] font-bold flex items-center justify-center text-[10px]">
                                    {comment.author_name.charAt(0)}
                                  </div>
                                )}
                                <div className="space-y-0.5 min-w-0 flex-grow">
                                  <div className="flex items-center justify-between gap-1 border-b border-gray-100/50 pb-0.5">
                                    <span className="font-bold text-[#1B2A6B]">{comment.author_name}</span>
                                    <span className="text-[9px] text-gray-400">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 leading-relaxed font-sans">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Write dialog popup/slideover panel */}
      {writeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden transform scale-98 hover:scale-100 transition-transform">
            
            <div className="bg-[#1B2A6B] text-white p-4.5 flex justify-between items-center border-b border-[#C9A84C]">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <PenTool size={16} className="text-[#C9A84C]" />
                <span>{t('news.create.title')}</span>
              </h3>
              <button
                onClick={() => setWriteOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-[#C9A84C]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              
              {dialogError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  {dialogError}
                </div>
              )}
              {dialogSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs select-none">
                  {dialogSuccess}
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('news.create.form.title')}
                </label>
                <input
                  type="text"
                  placeholder="E.g., Walking in Communion together"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!dialogSuccess}
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B2A6B]">
                  {t('news.create.form.cat')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as PostCategory)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!dialogSuccess}
                >
                  <option value="News">News</option>
                  <option value="Devotional">Devotional</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              {/* Image url */}
              <div className="space-y-1">
                <label className="text-[#1B2A6B] text-xs font-bold uppercase tracking-wider">
                  {t('news.create.form.img')}
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!dialogSuccess}
                />
              </div>

              {/* Blog body writing */}
              <div className="space-y-1">
                <label className="text-[#1B2A6B] text-xs font-bold uppercase tracking-wider">
                  {t('news.create.form.content')}
                </label>
                <textarea
                  rows={5}
                  placeholder="Give inspiration or news..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  disabled={!!dialogSuccess}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setWriteOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs uppercase font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={!!dialogSuccess}
                >
                  {t('news.create.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B2A6B] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#1B2A6B] font-bold uppercase text-xs tracking-wider border border-[#1B2A6B] transition-colors cursor-pointer"
                  disabled={!!dialogSuccess}
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
