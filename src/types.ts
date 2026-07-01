/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'member' | 'moderator' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string; // matches auth user ID or email
  email: string;
  name: string;
  graduation_year: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  approved: boolean; // default false for new users
  created_at: string;
}

export type PostCategory = 'News' | 'Events' | 'Devotional' | 'Announcement';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  category: PostCategory;
  status: ApprovalStatus;
  image_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface SEPACEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  rsvps: string[]; // List of user emails or IDs
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  image_url: string;
  uploader_id: string;
  uploader_name: string;
  event_tag: string;
  status: ApprovalStatus;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  visibility: 'public' | 'private';
  created_at: string;
  // Reactions mapping, e.g. { 'pray': ['user1', 'user2'], 'heart': ['user3'] }
  reactions: Record<string, string[]>;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  sent_by: string; // name
  created_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  businessName: string;
  image_url?: string;
  link?: string;
  contactPhone?: string;
  created_at: string;
  active: boolean;
}

export interface SiteAnalytics {
  totalMembers: number;
  approvedMembers: number;
  pendingMembers: number;
  totalPosts: number;
  pendingPosts: number;
  prayerRequestsCount: number;
  eventsCount: number;
}
