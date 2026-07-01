/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Post, 
  PostComment, 
  SEPACEvent, 
  GalleryPhoto, 
  PrayerRequest, 
  Announcement,
  Advertisement,
  SiteAnalytics
} from '../src/types';
import {
  isSupabaseConfigured,
  fetchTableFromSupabase,
  upsertToSupabase,
  deleteFromSupabase,
  sanitizeLogMessage
} from './supabase.ts';

// Let's place the database file in a workspace folder
const DATA_FILE = path.join(process.cwd(), 'server-data.json');

interface DatabaseSchema {
  profiles: UserProfile[];
  passwords: Record<string, string>; // mapping of email to password hash/text
  posts: Post[];
  comments: PostComment[];
  likes: { id: string; post_id: string; user_id: string; created_at: string }[];
  events: SEPACEvent[];
  gallery: GalleryPhoto[];
  prayer_requests: PrayerRequest[];
  announcements: Announcement[];
  advertisements: Advertisement[];
}

// Initialise the Database with elegant, realistic seed data
const INITIAL_DATABASE: DatabaseSchema = {
  profiles: [
    {
      id: 'sepacnyanza@gmail.com',
      email: 'sepacnyanza@gmail.com',
      name: 'Rev. Jean d\'Amour (Super Admin)',
      graduation_year: '1998',
      phone: '+250786047305',
      bio: 'Serving the SEPAC community as Super Administrator. Focused on spiritual growth, pastoral care, and fellowship.',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: 'super_admin',
      approved: true,
      created_at: new Date('2026-01-01T12:00:00Z').toISOString()
    },
    {
      id: 'moderator@gmail.com',
      email: 'moderator@gmail.com',
      name: 'Marie Claire Uwase',
      graduation_year: '2005',
      phone: '+250788987654',
      bio: 'Diligently moderating the SEPAC community, checking articles and submissions to maintain a warm family atmosphere.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'moderator',
      approved: true,
      created_at: new Date('2026-02-15T09:00:00Z').toISOString()
    },
    {
      id: 'member1@gmail.com',
      email: 'member1@gmail.com',
      name: 'Eric Nshimyumuremyi',
      graduation_year: '2012',
      phone: '+250786047305',
      bio: 'Alumnus of Saint Esprit, Class of 2012. Passionate about software development, faith, and youth mentorship.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'member',
      approved: true,
      created_at: new Date('2026-03-01T10:30:00Z').toISOString()
    },
    {
      id: 'member2@gmail.com',
      email: 'member2@gmail.com',
      name: 'Divine Ineza',
      graduation_year: '2018',
      phone: '+250796379882',
      bio: 'St. Esprit Alumni. Living in Kigali, involved in SEPAC worship ministry and community development outreach.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'member',
      approved: true,
      created_at: new Date('2026-03-10T14:15:00Z').toISOString()
    }
  ],
  passwords: {
    'sepacnyanza@gmail.com': 'admin123',
    'moderator@gmail.com': 'mod123',
    'member1@gmail.com': 'member123',
    'member2@gmail.com': 'member123'
  },
  posts: [],
  comments: [],
  likes: [],
  events: [],
  gallery: [],
  prayer_requests: [],
  announcements: [],
  advertisements: [
    {
      id: 'ad_1',
      title: 'Saint Esprit Revitalization Gala Dinner',
      description: 'Support our beloved school complex. Buy a table for our alumni fundraising dinner to renovate the main student chapel and laboratories.',
      businessName: 'SEPAC Community Fund',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      link: 'https://sepac.org/revitalize',
      contactPhone: '+250786047305',
      created_at: new Date('2026-06-01T11:00:00Z').toISOString(),
      active: true
    },
    {
      id: 'ad_2',
      title: 'Ubumwe Business Consulting & Advisory',
      description: 'Professional accounting, tax advisory, and spiritual business mentoring for graduates of Saint Esprit.',
      businessName: 'Ubumwe Partners Ltd',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      link: 'https://ubumweconsulting.rw',
      contactPhone: '+250796379882',
      created_at: new Date('2026-06-05T08:30:00Z').toISOString(),
      active: true
    }
  ]
};

class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DATABASE };
    this.load();
    this.syncWithSupabase().catch(err => {
      const errMsg = err?.message || String(err);
      console.log(sanitizeLogMessage(`[Supabase Status] Info: Sync initialization check: ${errMsg}`));
    });
  }

  // Load database from file
  private load(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure standard fields exist in loaded data
        if (!this.data.profiles) this.data.profiles = [];
        if (!this.data.passwords) this.data.passwords = {};
        if (!this.data.posts) this.data.posts = [];
        if (!this.data.comments) this.data.comments = [];
        if (!this.data.likes) this.data.likes = [];
        if (!this.data.events) this.data.events = [];
        if (!this.data.gallery) this.data.gallery = [];
        if (!this.data.prayer_requests) this.data.prayer_requests = [];
        if (!this.data.announcements) this.data.announcements = [];
        if (!this.data.advertisements) this.data.advertisements = [];
      } else {
        this.saveLocal();
      }
    } catch (e: any) {
      console.log(sanitizeLogMessage(`Info: issue loading database file, falling back to in-memory: ${e?.message || e}`));
    }
  }

  // Save database to file
  private saveLocal(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e: any) {
      console.log(sanitizeLogMessage(`Info: issue saving database file: ${e?.message || e}`));
    }
  }

  private save(): void {
    this.saveLocal();
  }

  private async syncWithSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    console.log('[SUPABASE SYNC] Fetching remote database to hydrate local cache...');

    try {
      const remoteProfiles = await fetchTableFromSupabase<UserProfile>('profiles');
      const remotePasswords = await fetchTableFromSupabase<{ email: string; password_hash: string }>('passwords');
      const remotePosts = await fetchTableFromSupabase<Post>('posts');
      const remoteComments = await fetchTableFromSupabase<PostComment>('comments');
      const remoteLikes = await fetchTableFromSupabase<{ id: string; post_id: string; user_id: string; created_at: string }>('likes');
      const remoteEvents = await fetchTableFromSupabase<any>('events');
      const remoteGallery = await fetchTableFromSupabase<GalleryPhoto>('gallery');
      const remotePrayerRequests = await fetchTableFromSupabase<any>('prayer_requests');
      const remoteAnnouncements = await fetchTableFromSupabase<Announcement>('announcements');
      const remoteAdvertisements = await fetchTableFromSupabase<any>('advertisements');

      let hydratedCount = 0;

      if (remoteProfiles !== null) {
        this.data.profiles = remoteProfiles;
        hydratedCount++;
      }
      if (remotePasswords !== null) {
        const mappedPasswords: Record<string, string> = {};
        remotePasswords.forEach(p => {
          mappedPasswords[p.email.toLowerCase()] = p.password_hash;
        });
        this.data.passwords = { ...INITIAL_DATABASE.passwords, ...mappedPasswords };
        hydratedCount++;
      }
      if (remotePosts !== null) {
        this.data.posts = remotePosts;
        hydratedCount++;
      }
      if (remoteComments !== null) {
        this.data.comments = remoteComments;
        hydratedCount++;
      }
      if (remoteLikes !== null) {
        this.data.likes = remoteLikes;
        hydratedCount++;
      }
      if (remoteEvents !== null) {
        this.data.events = remoteEvents.map((e: any) => ({
          ...e,
          rsvps: Array.isArray(e.rsvps) ? e.rsvps : []
        }));
        hydratedCount++;
      }
      if (remoteGallery !== null) {
        this.data.gallery = remoteGallery;
        hydratedCount++;
      }
      if (remotePrayerRequests !== null) {
        this.data.prayer_requests = remotePrayerRequests.map((pr: any) => ({
          ...pr,
          reactions: pr.reactions && typeof pr.reactions === 'object' ? pr.reactions : { amen: [], pray: [], love: [] }
        }));
        hydratedCount++;
      }
      if (remoteAnnouncements !== null) {
        this.data.announcements = remoteAnnouncements;
        hydratedCount++;
      }
      if (remoteAdvertisements !== null) {
        this.data.advertisements = remoteAdvertisements.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          businessName: ad.businessName || ad.business_name || '',
          image_url: ad.image_url,
          link: ad.link,
          contactPhone: ad.contactPhone || ad.contact_phone,
          created_at: ad.created_at,
          active: ad.active
        }));
        hydratedCount++;
      }

      if (hydratedCount > 0) {
        console.log(`[SUPABASE HYDRATED] Successfully hydrated local memory with ${hydratedCount} tables from Supabase.`);
        this.saveLocal();
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.log(sanitizeLogMessage(`[Supabase Status] Info: Hydration check: ${errMsg}`));
    }
  }

  // Auth Operations
  public getUserProfile(email: string): UserProfile | undefined {
    return this.data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  public getProfiles(): UserProfile[] {
    return this.data.profiles;
  }

  public authenticate(email: string, pass: string): UserProfile | null {
    const user = this.getUserProfile(email);
    if (!user) return null;
    const storedPass = this.data.passwords[email.toLowerCase()];
    if (storedPass === pass) {
      return user;
    }
    return null;
  }

  public register(
    email: string, 
    pass: string, 
    name: string, 
    graduation_year: string, 
    phone?: string, 
    avatar_url?: string
  ): UserProfile {
    const normalizedEmail = email.toLowerCase();
    const existing = this.getUserProfile(normalizedEmail);
    if (existing) {
      throw new Error('Email already registered');
    }

    // Role assignment rules (Super admin auto-recognition for sepacnyanza@gmail.com)
    let role: 'super_admin' | 'member' = 'member';
    let approved = false;

    if (normalizedEmail === 'sepacnyanza@gmail.com') {
      role = 'super_admin';
      approved = true; // Auto approved
    }

    const newProfile: UserProfile = {
      id: normalizedEmail,
      email: normalizedEmail,
      name,
      graduation_year,
      phone,
      bio: '',
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role,
      approved,
      created_at: new Date().toISOString()
    };

    this.data.profiles.push(newProfile);
    this.data.passwords[normalizedEmail] = pass;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('profiles', newProfile).catch(() => {});
      upsertToSupabase('passwords', { email: normalizedEmail, password_hash: pass }).catch(() => {});
    }

    return newProfile;
  }

  public updateProfile(email: string, name: string, graduation_year: string, bio: string, phone?: string, avatar_url?: string): UserProfile {
    const profile = this.getUserProfile(email);
    if (!profile) {
      throw new Error('Profile not found');
    }
    profile.name = name;
    profile.graduation_year = graduation_year;
    profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (avatar_url !== undefined) profile.avatar_url = avatar_url;
    
    // Also update author names on their posts/comments
    this.data.posts.forEach(p => {
      if (p.author_id.toLowerCase() === email.toLowerCase()) {
        p.author_name = name;
      }
    });

    this.data.comments.forEach(c => {
      if (c.author_id.toLowerCase() === email.toLowerCase()) {
        c.author_name = name;
        if (avatar_url) c.author_avatar = avatar_url;
      }
    });

    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('profiles', profile).catch(() => {});
    }

    return profile;
  }

  public updateRole(userID: string, role: 'member' | 'moderator' | 'admin', changerRole: string): UserProfile {
    // Check if changer is super admin
    if (changerRole !== 'super_admin') {
      throw new Error('Only Super Admin can manage administrator roles');
    }

    const profile = this.getUserProfile(userID);
    if (!profile) {
      throw new Error('User not found');
    }

    profile.role = role;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('profiles', profile).catch(() => {});
    }

    return profile;
  }

  public verifyUser(userID: string, approved: boolean): UserProfile {
    const profile = this.getUserProfile(userID);
    if (!profile) {
      throw new Error('User not found');
    }
    profile.approved = approved;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('profiles', profile).catch(() => {});
    }

    return profile;
  }

  // Post blog feeds
  public getPosts(userRole?: string): Post[] {
    // If Admin/SuperAdmin/Moderator, show all. If member/guest, show only approved.
    if (userRole && ['admin', 'super_admin', 'moderator'].includes(userRole)) {
      return this.data.posts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return this.data.posts
      .filter(p => p.status === 'approved')
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createPost(
    title: string, 
    content: string, 
    author_id: string, 
    category: 'News' | 'Events' | 'Devotional' | 'Announcement', 
    image_url?: string,
    authorRole?: string
  ): Post {
    const author = this.getUserProfile(author_id);
    if (!author) throw new Error('Author not found');

    // Admin/Moderator/SuperAdmin posts are AUTO-approved. Member posts are 'pending'.
    const isAutoApproved = authorRole && ['admin', 'super_admin', 'moderator'].includes(authorRole);
    const status: 'pending' | 'approved' = isAutoApproved ? 'approved' : 'pending';

    const newPost: Post = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      title,
      content,
      author_id: author.email,
      author_name: author.name,
      category,
      status,
      image_url: image_url || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0
    };

    this.data.posts.push(newPost);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('posts', newPost).catch(() => {});
    }

    return newPost;
  }

  public updatePostStatus(postId: string, status: 'approved' | 'rejected'): Post {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    post.status = status;
    post.updated_at = new Date().toISOString();
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('posts', post).catch(() => {});
    }

    return post;
  }

  // Likes & Comments
  public getComments(postId: string): PostComment[] {
    return this.data.comments
      .filter(c => c.post_id === postId)
      .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public addComment(postId: string, authorId: string, content: string): PostComment {
    const author = this.getUserProfile(authorId);
    if (!author) throw new Error('User not found');

    const newComment: PostComment = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      post_id: postId,
      author_id: author.email,
      author_name: author.name,
      author_avatar: author.avatar_url,
      content,
      created_at: new Date().toISOString()
    };

    this.data.comments.push(newComment);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('comments', newComment).catch(() => {});
    }

    return newComment;
  }

  public toggleLike(postId: string, userId: string): { likesCount: number; hasLiked: boolean } {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const index = this.data.likes.findIndex(l => l.post_id === postId && l.user_id.toLowerCase() === userId.toLowerCase());
    let hasLiked = false;
    let targetLikeId = '';

    if (index >= 0) {
      this.data.likes.splice(index, 1);
    } else {
      targetLikeId = 'l_' + Math.random().toString(36).substr(2, 9);
      this.data.likes.push({
        id: targetLikeId,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      hasLiked = true;
    }

    const currentLikes = this.data.likes.filter(l => l.post_id === postId).length;
    post.likes_count = currentLikes;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      if (hasLiked) {
        upsertToSupabase('likes', { id: targetLikeId, post_id: postId, user_id: userId, created_at: new Date().toISOString() }).catch(() => {});
      } else {
        deleteFromSupabase('likes', { post_id: postId, user_id: userId }).catch(() => {});
      }
      upsertToSupabase('posts', post).catch(() => {});
    }
    
    return { likesCount: currentLikes, hasLiked };
  }

  public getUserLikedPostIds(userId: string): string[] {
    return this.data.likes
      .filter(l => l.user_id.toLowerCase() === userId.toLowerCase())
      .map(l => l.post_id);
  }

  // Events Operations
  public getEvents(): SEPACEvent[] {
    return this.data.events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public createEvent(title: string, description: string, date: string, location: string, image_url?: string): SEPACEvent {
    const newEvent: SEPACEvent = {
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      date,
      location,
      image_url: image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      rsvps: [],
      created_at: new Date().toISOString()
    };
    this.data.events.push(newEvent);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('events', {
        ...newEvent,
        rsvps: newEvent.rsvps
      }).catch(() => {});
    }

    return newEvent;
  }

  public toggleRSVP(eventId: string, userEmail: string): SEPACEvent {
    const event = this.data.events.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const emailLower = userEmail.toLowerCase();
    const rsvpIndex = event.rsvps.findIndex(email => email.toLowerCase() === emailLower);

    if (rsvpIndex >= 0) {
      event.rsvps.splice(rsvpIndex, 1);
    } else {
      event.rsvps.push(userEmail);
    }

    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('events', {
        ...event,
        rsvps: event.rsvps
      }).catch(() => {});
    }

    return event;
  }

  // Gallery
  public getGallery(userRole?: string): GalleryPhoto[] {
    if (userRole && ['admin', 'super_admin', 'moderator'].includes(userRole)) {
      return this.data.gallery.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return this.data.gallery
      .filter(g => g.status === 'approved')
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public uploadPhoto(image_url: string, uploader_id: string, event_tag: string, userRole?: string): GalleryPhoto {
    const user = this.getUserProfile(uploader_id);
    if (!user) throw new Error('User not found');

    // Admin uploads are auto-approved
    const isAutoApproved = userRole && ['admin', 'super_admin', 'moderator'].includes(userRole);
    const status: 'pending' | 'approved' = isAutoApproved ? 'approved' : 'pending';

    const newPhoto: GalleryPhoto = {
      id: 'g_' + Math.random().toString(36).substr(2, 9),
      image_url,
      uploader_id: user.email,
      uploader_name: user.name,
      event_tag,
      status,
      created_at: new Date().toISOString()
    };

    this.data.gallery.push(newPhoto);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('gallery', newPhoto).catch(() => {});
    }

    return newPhoto;
  }

  public updatePhotoStatus(photoId: string, status: 'approved' | 'rejected'): GalleryPhoto {
    const photo = this.data.gallery.find(p => p.id === photoId);
    if (!photo) throw new Error('Photo not found');
    photo.status = status;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('gallery', photo).catch(() => {});
    }

    return photo;
  }

  // Prayer Wall
  public getPrayerRequests(userId?: string, userRole?: string): PrayerRequest[] {
    // Public requests are seen by everyone
    // Private requests are seen only by author or Admins (moderator, admin, super_admin)
    return this.data.prayer_requests
      .filter(pr => {
        if (pr.visibility === 'public') return true;
        if (!userId) return false;
        if (pr.author_id.toLowerCase() === userId.toLowerCase()) return true;
        if (userRole && ['admin', 'super_admin', 'moderator'].includes(userRole)) return true;
        return false;
      })
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createPrayerRequest(content: string, authorId: string, visibility: 'public' | 'private'): PrayerRequest {
    const author = this.getUserProfile(authorId);
    if (!author) throw new Error('Author not found');

    const newRequest: PrayerRequest = {
      id: 'pr_' + Math.random().toString(36).substr(2, 9),
      content,
      author_id: author.email,
      author_name: author.name,
      visibility,
      created_at: new Date().toISOString(),
      reactions: {
        amen: [],
        pray: [],
        love: []
      }
    };

    this.data.prayer_requests.push(newRequest);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('prayer_requests', {
        ...newRequest,
        reactions: newRequest.reactions
      }).catch(() => {});
    }

    return newRequest;
  }

  public reactToPrayer(prId: string, userId: string, reactionType: 'amen' | 'pray' | 'love'): PrayerRequest {
    const pr = this.data.prayer_requests.find(p => p.id === prId);
    if (!pr) throw new Error('Prayer request not found');

    if (!pr.reactions) {
      pr.reactions = { amen: [], pray: [], love: [] };
    }
    if (!pr.reactions[reactionType]) {
      pr.reactions[reactionType] = [];
    }

    const typeArr = pr.reactions[reactionType];
    const userIndex = typeArr.indexOf(userId);

    // Toggle reaction
    if (userIndex >= 0) {
      typeArr.splice(userIndex, 1);
    } else {
      typeArr.push(userId);
    }

    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('prayer_requests', {
        ...pr,
        reactions: pr.reactions
      }).catch(() => {});
    }

    return pr;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.data.announcements.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createAnnouncement(title: string, body: string, senderName: string): Announcement {
    const newAnn: Announcement = {
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      title,
      body,
      sent_by: senderName,
      created_at: new Date().toISOString()
    };
    this.data.announcements.push(newAnn);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('announcements', newAnn).catch(() => {});
    }

    return newAnn;
  }

  // Advertisements Management
  public getAdvertisements(showInactive: boolean = false): Advertisement[] {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }
    if (showInactive) {
      return this.data.advertisements.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return this.data.advertisements
      .filter(ad => ad.active)
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createAdvertisement(
    title: string,
    description: string,
    businessName: string,
    image_url?: string,
    link?: string,
    contactPhone?: string
  ): Advertisement {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }
    const newAd: Advertisement = {
      id: 'ad_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      businessName,
      image_url: image_url || undefined,
      link: link || undefined,
      contactPhone: contactPhone || undefined,
      created_at: new Date().toISOString(),
      active: true
    };
    this.data.advertisements.push(newAd);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('advertisements', {
        id: newAd.id,
        title: newAd.title,
        description: newAd.description,
        business_name: newAd.businessName,
        image_url: newAd.image_url,
        link: newAd.link,
        contact_phone: newAd.contactPhone,
        created_at: newAd.created_at,
        active: newAd.active
      }).catch(() => {});
    }

    return newAd;
  }

  public toggleAdvertisementActive(id: string): Advertisement {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }
    const ad = this.data.advertisements.find(a => a.id === id);
    if (!ad) throw new Error('Advertisement not found');
    ad.active = !ad.active;
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      upsertToSupabase('advertisements', {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        business_name: ad.businessName,
        image_url: ad.image_url,
        link: ad.link,
        contact_phone: ad.contactPhone,
        created_at: ad.created_at,
        active: ad.active
      }).catch(() => {});
    }

    return ad;
  }

  public deleteAdvertisement(id: string): boolean {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }
    const lenBefore = this.data.advertisements.length;
    this.data.advertisements = this.data.advertisements.filter(a => a.id !== id);
    this.save();

    // Remote Sync
    if (isSupabaseConfigured()) {
      deleteFromSupabase('advertisements', { id }).catch(() => {});
    }

    return this.data.advertisements.length < lenBefore;
  }

  // General statistics API
  getAnalytics(): SiteAnalytics {
    return {
      totalMembers: this.data.profiles.length,
      approvedMembers: this.data.profiles.filter(p => p.approved).length,
      pendingMembers: this.data.profiles.filter(p => !p.approved).length,
      totalPosts: this.data.posts.length,
      pendingPosts: this.data.posts.filter(p => p.status === 'pending').length,
      prayerRequestsCount: this.data.prayer_requests.length,
      eventsCount: this.data.events.length
    };
  }
}

export const db = new JSONDatabase();
