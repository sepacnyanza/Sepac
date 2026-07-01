/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Extend request size payload to support Base64 images easily
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Real-time Push Notification Subscribers
  let notificationClients: any[] = [];
  const broadcastNotification = (title: string, body: string, url: string, silent: boolean = false) => {
    console.log(`[PUSH BROADCAST] ${title}: ${body} -> ${url} (silent: ${silent})`);
    const dataStr = JSON.stringify({ title, body, url, silent, timestamp: new Date().toISOString() });
    notificationClients.forEach(client => {
      try {
        client.res.write(`data: ${dataStr}\n\n`);
      } catch (err) {
        console.error('Error writing to client stream', err);
      }
    });
  };

  // Realtime Live Stream endpoint
  app.get('/api/notifications/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    notificationClients.push(newClient);

    // Keep stream alive with periodic heartbeats (every 30s)
    const heartbeat = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      notificationClients = notificationClients.filter(c => c.id !== clientId);
    });
  });

  // Simplistic local Session Store (for the preview container environment)
  const sessions: Record<string, { email: string; name: string; role: string; approved: boolean }> = {};

  // Express API Routes Setup
  
  // 1. Authentication
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, name, graduation_year, phone, avatar_url } = req.body;
      if (!email || !password || !name || !graduation_year) {
        return res.status(400).json({ error: 'All primary fields are required' });
      }

      const profile = db.register(email, password, name, graduation_year, phone, avatar_url);
      
      // Auto-login upon registration
      const token = 'token_' + Math.random().toString(36).substr(2, 9);
      sessions[token] = {
        email: profile.email,
        name: profile.name,
        role: profile.role,
        approved: profile.approved
      };

      res.status(200).json({ success: true, profile, token, message: 'Registration initial success!' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const profile = db.authenticate(email, password);
    if (!profile) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = 'token_' + Math.random().toString(36).substr(2, 9);
    sessions[token] = {
      email: profile.email,
      name: profile.name,
      role: profile.role,
      approved: profile.approved
    };

    res.status(200).json({ success: true, profile, token });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      delete sessions[authHeader];
    }
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !sessions[authHeader]) {
      return res.status(401).json({ error: 'Unauthorized session' });
    }
    const session = sessions[authHeader];
    const profile = db.getUserProfile(session.email);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update session values dynamically from profile state
    session.role = profile.role;
    session.approved = profile.approved;
    session.name = profile.name;

    res.json({ profile });
  });

  app.post('/api/auth/update', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !sessions[authHeader]) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const session = sessions[authHeader];
    const { name, graduation_year, bio, phone, avatar_url } = req.body;
    
    try {
      const updated = db.updateProfile(session.email, name, graduation_year, bio, phone, avatar_url);
      session.name = updated.name;
      res.json({ success: true, profile: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Update failed' });
    }
  });

  // Helper middleware to check credentials & validation state
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !sessions[authHeader]) {
      return res.status(401).json({ error: 'Sign-in required to access this resource' });
    }
    req.user = sessions[authHeader];
    next();
  };

  const requireVerification = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !sessions[authHeader]) {
      return res.status(401).json({ error: 'Sign-in required to access this resource' });
    }
    const session = sessions[authHeader];
    const profile = db.getUserProfile(session.email);
    if (!profile || !profile.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }
    req.user = { ...session, role: profile.role, approved: true };
    next();
  };

  // 2. Members Directory
  app.get('/api/members', (req, res) => {
    // Return all members, but mask email/phone for non-logged in or non-approved members
    const authHeader = req.headers.authorization;
    const isApprovedMember = authHeader && sessions[authHeader] && db.getUserProfile(sessions[authHeader].email)?.approved;
    
    const rawProfiles = db.getProfiles();
    const masked = rawProfiles.map(p => {
      if (isApprovedMember) return p;
      // Mask identifiers for unlogged privacy
      return {
        id: p.id,
        name: p.name,
        graduation_year: p.graduation_year,
        bio: p.bio,
        avatar_url: p.avatar_url,
        role: p.role,
        approved: p.approved,
        created_at: p.created_at,
        email: '●●●●●●●●',
        phone: '●●●●●●●●'
      };
    });

    res.json({ profiles: masked });
  });

  // 3. Blog Feed Posts
  app.get('/api/posts', (req, res) => {
    const authHeader = req.headers.authorization;
    let userRole = undefined;
    if (authHeader && sessions[authHeader]) {
      const p = db.getUserProfile(sessions[authHeader].email);
      userRole = p?.role;
    }
    const posts = db.getPosts(userRole);
    res.json({ posts });
  });

  app.post('/api/posts/create', requireVerification, (req: any, res) => {
    const { title, content, category, image_url } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content and category are required' });
    }

    try {
      const post = db.createPost(title, content, req.user.email, category, image_url, req.user.role);
      if (post.status === 'approved') {
        broadcastNotification(
          'New Post Published',
          `Post: "${post.title}" is now online under ${post.category}!`,
          'news'
        );
      } else {
        broadcastNotification(
          'New Submission Pending',
          `Classmate ${req.user.name} submitted an article for review.`,
          'admin',
          false
        );
      }
      res.json({ success: true, post });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to submit post' });
    }
  });

  app.get('/api/posts/:id/comments', (req, res) => {
    const comments = db.getComments(req.params.id);
    res.json({ comments });
  });

  app.post('/api/posts/:id/comments', requireVerification, (req: any, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Comment body is required' });
    }
    try {
      const comment = db.addComment(req.params.id, req.user.email, content);
      broadcastNotification(
        'New Comment Added',
        `Classmate commented on a bulletin.`,
        'news',
        true
      );
      res.json({ success: true, comment });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to add comment' });
    }
  });

  app.post('/api/posts/:id/like', requireVerification, (req: any, res) => {
    try {
      const result = db.toggleLike(req.params.id, req.user.email);
      broadcastNotification(
        'Post Liked',
        `Post interaction trigger.`,
        'news',
        true
      );
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Like toggle failed' });
    }
  });

  app.get('/api/users/likes', requireVerification, (req: any, res) => {
    const likedIds = db.getUserLikedPostIds(req.user.email);
    res.json({ likedIds });
  });

  // 4. Events
  app.get('/api/events', (req, res) => {
    res.json({ events: db.getEvents() });
  });

  app.post('/api/events/create', requireVerification, (req: any, res) => {
    // Only Admin or Moderation roles can create events
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only administrators can create events' });
    }

    const { title, description, date, location, image_url } = req.body;
    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: 'Missing mandatory event fields' });
    }

    try {
      const event = db.createEvent(title, description, date, location, image_url);
      broadcastNotification(
        'New Event Posted',
        `Event: "${event.title}" is scheduled at ${location}!`,
        'events'
      );
      res.json({ success: true, event });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/events/:id/rsvp', requireVerification, (req: any, res) => {
    try {
      const event = db.toggleRSVP(req.params.id, req.user.email);
      broadcastNotification(
        'RSVP Updated',
        `Classmate registered for event ${event.title}`,
        'events',
        true
      );
      res.json({ success: true, eventName: event.title, rsvps: event.rsvps });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'RSVP failed' });
    }
  });

  // 5. Gallery
  app.get('/api/gallery', (req, res) => {
    const authHeader = req.headers.authorization;
    let userRole = undefined;
    if (authHeader && sessions[authHeader]) {
      userRole = db.getUserProfile(sessions[authHeader].email)?.role;
    }
    res.json({ gallery: db.getGallery(userRole) });
  });

  app.post('/api/gallery/upload', requireVerification, (req: any, res) => {
    const { image_url, event_tag } = req.body;
    if (!image_url || !event_tag) {
      return res.status(400).json({ error: 'Image URL and Event tag are required' });
    }

    try {
      const photo = db.uploadPhoto(image_url, req.user.email, event_tag, req.user.role);
      if (photo.status === 'approved') {
        broadcastNotification(
          'New Photo Shared',
          `A new memory from ${event_tag} was shared in the gallery!`,
          'gallery',
          false
        );
      } else {
        broadcastNotification(
          'New Photo Submitted',
          `${req.user.name} shared a photo that is pending moderator review.`,
          'admin',
          false
        );
      }
      res.json({ success: true, photo });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Photo submission failed' });
    }
  });

  // 6. Prayer Requests
  app.get('/api/prayer', (req, res) => {
    const authHeader = req.headers.authorization;
    let userId = undefined;
    let userRole = undefined;
    if (authHeader && sessions[authHeader]) {
      userId = sessions[authHeader].email;
      userRole = db.getUserProfile(userId)?.role;
    }

    res.json({ prayer_requests: db.getPrayerRequests(userId, userRole) });
  });

  app.post('/api/prayer/create', requireVerification, (req: any, res) => {
    const { content, visibility } = req.body;
    if (!content || !visibility) {
      return res.status(400).json({ error: 'Content and visibility constraints required' });
    }

    try {
      const request = db.createPrayerRequest(content, req.user.email, visibility);
      if (visibility === 'public') {
        broadcastNotification(
          'New Prayer Request',
          `Classmate: "${content.substring(0, 45)}..."`,
          'prayer',
          false
        );
      } else {
        broadcastNotification(
          'Confidential Request Added',
          `A confidential prayer petition was shared.`,
          'prayer',
          true
        );
      }
      res.json({ success: true, request });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Request failure' });
    }
  });

  app.post('/api/prayer/:id/react', requireVerification, (req: any, res) => {
    const { reactionType } = req.body;
    if (!reactionType || !['amen', 'pray', 'love'].includes(reactionType)) {
      return res.status(400).json({ error: 'Valid reaction type required' });
    }

    try {
      const pr = db.reactToPrayer(req.params.id, req.user.email, reactionType);
      broadcastNotification(
        'Prayer Amen/Reaction',
        `Classmate reacted to a prayer petition.`,
        'prayer',
        true
      );
      res.json({ success: true, request: pr });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to react' });
    }
  });

  // 7. General Announcements
  app.get('/api/announcements', (req, res) => {
    res.json({ announcements: db.getAnnouncements() });
  });

  // 8. Admin Portal Operations
  app.get('/api/admin/stats', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    res.json({ stats: db.getAnalytics() });
  });

  app.get('/api/admin/users', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    // Return profiles for admin adjustments
    res.json({ profiles: db.getProfiles() });
  });

  app.post('/api/admin/users/:id/verify', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    const { approved } = req.body;
    try {
      const updated = db.verifyUser(req.params.id, !!approved);
      res.json({ success: true, profile: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/users/:id/role', requireVerification, (req: any, res) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can edit roles' });
    }
    const { role } = req.body;
    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role category' });
    }

    try {
      const updated = db.updateRole(req.params.id, role, req.user.role);
      res.json({ success: true, profile: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/posts/:id/status', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const updated = db.updatePostStatus(req.params.id, status);
      if (status === 'approved') {
        broadcastNotification(
          'New Post Approved',
          `Post: "${updated.title}" by ${updated.author_name} is now live!`,
          'news'
        );
      }
      res.json({ success: true, post: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/gallery/:id/status', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const updated = db.updatePhotoStatus(req.params.id, status);
      res.json({ success: true, photo: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/announcements', requireVerification, (req: any, res) => {
    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Administrators only' });
    }
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    try {
      const ann = db.createAnnouncement(title, body, req.user.name);
      broadcastNotification(
        'New Announcement',
        `Notice: "${ann.title}"`,
        'home'
      );
      res.json({ success: true, announcement: ann });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // 10. Advertisements management and tracking
  app.get('/api/advertisements', (req, res) => {
    try {
      const ads = db.getAdvertisements(false);
      res.json({ success: true, advertisements: ads });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/admin/advertisements', requireVerification, (req: any, res) => {
    if (req.user.email !== 'sepacnyanza@gmail.com') {
      return res.status(403).json({ error: 'Only the main Administrator (sepacnyanza@gmail.com) can manage advertisements' });
    }
    try {
      const ads = db.getAdvertisements(true);
      res.json({ success: true, advertisements: ads });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/advertisements', requireVerification, (req: any, res) => {
    if (req.user.email !== 'sepacnyanza@gmail.com') {
      return res.status(403).json({ error: 'Only the main Administrator (sepacnyanza@gmail.com) can manage advertisements' });
    }
    const { title, description, businessName, image_url, link, contactPhone } = req.body;
    if (!title || !description || !businessName) {
      return res.status(400).json({ error: 'Title, description, and company name are required' });
    }
    try {
      const ad = db.createAdvertisement(title, description, businessName, image_url, link, contactPhone);
      broadcastNotification(
        'New Advertisement Added',
        `Promo: "${title}" by ${businessName}`,
        'ads',
        false
      );
      res.json({ success: true, advertisement: ad });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/advertisements/:id/toggle', requireVerification, (req: any, res) => {
    if (req.user.email !== 'sepacnyanza@gmail.com') {
      return res.status(403).json({ error: 'Only the main Administrator (sepacnyanza@gmail.com) can manage advertisements' });
    }
    try {
      const updated = db.toggleAdvertisementActive(req.params.id);
      res.json({ success: true, advertisement: updated });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/admin/advertisements/:id/delete', requireVerification, (req: any, res) => {
    if (req.user.email !== 'sepacnyanza@gmail.com') {
      return res.status(403).json({ error: 'Only the main Administrator (sepacnyanza@gmail.com) can manage advertisements' });
    }
    try {
      const deleted = db.deleteAdvertisement(req.params.id);
      res.json({ success: deleted });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // 9. Contact messages (Public API)
  app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Log contact messages in local logs
    console.log(`[CONTACT INQUIRY] From: ${name} (${email}). Message: ${message}`);
    res.json({ success: true, message: 'Message sent successfully' });
  });


  // Mounting Vite development server or production assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SEPAC Backend-Relational] Server successfully booted on http://localhost:${PORT}`);
  });
}

startServer();
