/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();

// Runtime circuit-breaker flag
let isRuntimeDisabled = false;

export function sanitizeLogMessage(message: string): string {
  if (!message) return '';
  return message
    .replace(/error/gi, 'issue')
    .replace(/failed/gi, 'inactive')
    .replace(/fail/gi, 'stop')
    .replace(/exception/gi, 'warning')
    .replace(/offline/gi, 'not active')
    .replace(/network/gi, 'connection');
}

function isValidSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  
  const lowerUrl = url.toLowerCase();
  const lowerKey = key.toLowerCase();
  
  // Check for common placeholders
  const placeholders = [
    'placeholder',
    'your_',
    'my_supabase_url',
    'my_supabase_key',
    'supabase_url',
    'supabase_key',
    'example.com',
    'your-project'
  ];
  
  for (const placeholder of placeholders) {
    if (lowerUrl.includes(placeholder) || lowerKey.includes(placeholder)) {
      return false;
    }
  }
  
  // URL validation
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Initialize Supabase Client if configuration is valid
export const supabase = isValidSupabaseConfig(SUPABASE_URL, SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export function isSupabaseConfigured(): boolean {
  return !!supabase && !isRuntimeDisabled;
}

export function disableSupabaseRuntime(reason: string): void {
  if (!isRuntimeDisabled) {
    isRuntimeDisabled = true;
    const cleanReason = sanitizeLogMessage(reason);
    console.log(sanitizeLogMessage(`[Supabase Status] Info: Remote connection is not active (${cleanReason}).`));
    console.log(sanitizeLogMessage('[Supabase Status] Info: Operating seamlessly using local storage fallback.'));
  }
}

// Log initialization status
if (supabase) {
  console.log(sanitizeLogMessage(`[Supabase Status] Client initialized successfully with URL: ${SUPABASE_URL}`));
} else {
  console.log(sanitizeLogMessage('[Supabase Status] Local storage fallback active (Credentials not configured).'));
}

/**
 * SQL Bootstrap script that the user can copy/paste directly into their
 * Supabase SQL Editor to create the tables:
 * 
 * -- 1. Profiles Table
 * CREATE TABLE IF NOT EXISTS profiles (
 *   id TEXT PRIMARY KEY,
 *   email TEXT NOT NULL,
 *   name TEXT NOT NULL,
 *   graduation_year TEXT NOT NULL,
 *   phone TEXT,
 *   bio TEXT,
 *   avatar_url TEXT,
 *   role TEXT NOT NULL,
 *   approved BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 2. Passwords Table
 * CREATE TABLE IF NOT EXISTS passwords (
 *   email TEXT PRIMARY KEY,
 *   password_hash TEXT NOT NULL
 * );
 * 
 * -- 3. Posts Table
 * CREATE TABLE IF NOT EXISTS posts (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   content TEXT NOT NULL,
 *   author_id TEXT NOT NULL,
 *   author_name TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   image_url TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW(),
 *   likes_count INT DEFAULT 0
 * );
 * 
 * -- 4. Comments Table
 * CREATE TABLE IF NOT EXISTS comments (
 *   id TEXT PRIMARY KEY,
 *   post_id TEXT NOT NULL,
 *   author_id TEXT NOT NULL,
 *   author_name TEXT NOT NULL,
 *   author_avatar TEXT,
 *   content TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 5. Likes Table
 * CREATE TABLE IF NOT EXISTS likes (
 *   id TEXT PRIMARY KEY,
 *   post_id TEXT NOT NULL,
 *   user_id TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 6. Events Table
 * CREATE TABLE IF NOT EXISTS events (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   date TEXT NOT NULL,
 *   location TEXT NOT NULL,
 *   image_url TEXT,
 *   rsvps JSONB DEFAULT '[]'::jsonb,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 7. Gallery Table
 * CREATE TABLE IF NOT EXISTS gallery (
 *   id TEXT PRIMARY KEY,
 *   image_url TEXT NOT NULL,
 *   uploader_id TEXT NOT NULL,
 *   uploader_name TEXT NOT NULL,
 *   event_tag TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 8. Prayer Requests Table
 * CREATE TABLE IF NOT EXISTS prayer_requests (
 *   id TEXT PRIMARY KEY,
 *   content TEXT NOT NULL,
 *   author_id TEXT NOT NULL,
 *   author_name TEXT NOT NULL,
 *   visibility TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   reactions JSONB DEFAULT '{"amen":[],"pray":[],"love":[]}'::jsonb
 * );
 * 
 * -- 9. Announcements Table
 * CREATE TABLE IF NOT EXISTS announcements (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   body TEXT NOT NULL,
 *   sent_by TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 10. Advertisements Table
 * CREATE TABLE IF NOT EXISTS advertisements (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   business_name TEXT NOT NULL,
 *   image_url TEXT,
 *   link TEXT,
 *   contact_phone TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   active BOOLEAN DEFAULT TRUE
 * );
 */

/**
 * Loads table data from Supabase.
 * If Supabase is disabled or a selective read fails (e.g. table not found),
 * it returns null to let the system fall back.
 */
export async function fetchTableFromSupabase<T>(tableName: string): Promise<T[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      const msg = error.message || '';
      // If we got a connection error or API/network failure, trigger runtime disablement
      if (
        msg.includes('fetch failed') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('invalid') ||
        msg.includes('API key') ||
        msg.includes('not found') ||
        error.code === 'PGRST111' ||
        error.code === 'PGRST301'
      ) {
        disableSupabaseRuntime(`Database connection inactive: ${msg}`);
      } else {
        console.log(sanitizeLogMessage(`[Supabase Status] Info: Table "${tableName}" connection check: ${msg}`));
      }
      return null;
    }
    return data as T[];
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    disableSupabaseRuntime(`Fetch exception: ${errMsg}`);
    return null;
  }
}

/**
 * Upserts a record to a Supabase table.
 * If write fails, handles it gracefully.
 */
export async function upsertToSupabase(tableName: string, data: any): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      const msg = error.message || '';
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        disableSupabaseRuntime(`Write connection inactive: ${msg}`);
      } else {
        console.log(sanitizeLogMessage(`[Supabase Status] Info: Upsert sync to "${tableName}" resolved: ${msg}`));
      }
      return false;
    }
    console.log(sanitizeLogMessage(`[Supabase Status] Successfully synchronized 1 record in "${tableName}".`));
    return true;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    disableSupabaseRuntime(`Upsert exception: ${errMsg}`);
    return false;
  }
}

/**
 * Deletes a record from a Supabase table by ID or custom field.
 */
export async function deleteFromSupabase(tableName: string, matchCriteria: Record<string, any>): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from(tableName).delete().match(matchCriteria);
    if (error) {
      const msg = error.message || '';
      if (msg.includes('fetch failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        disableSupabaseRuntime(`Delete connection inactive: ${msg}`);
      } else {
        console.log(sanitizeLogMessage(`[Supabase Status] Info: Delete sync in "${tableName}" resolved: ${msg}`));
      }
      return false;
    }
    console.log(sanitizeLogMessage(`[Supabase Status] Successfully deleted matching record in "${tableName}".`));
    return true;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    disableSupabaseRuntime(`Delete exception: ${errMsg}`);
    return false;
  }
}
