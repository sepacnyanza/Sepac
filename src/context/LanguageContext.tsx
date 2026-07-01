/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw';

interface TranslationDict {
  [key: string]: {
    en: string;
    rw: string;
  };
}

const translations: TranslationDict = {
  // Navigation
  'nav.home': { en: 'Home', rw: 'Ahabanza' },
  'nav.about': { en: 'About US', rw: 'Tubahe Inshushanyo' },
  'nav.members': { en: 'Members', rw: 'Abanyamuryango' },
  'nav.news': { en: 'News & blog', rw: 'Amakuru & Inyandiko' },
  'nav.events': { en: 'Events', rw: 'Ibyabaye & Ibiteganywa' },
  'nav.gallery': { en: 'Gallery', rw: 'Amafoto' },
  'nav.prayer': { en: 'Prayer Requests', rw: 'Gusaba Isengesho' },
  'nav.mission': { en: 'Mission & Vision', rw: 'Icyerekezo' },
  'nav.giving': { en: 'Giving & Projects', rw: 'Imirimo' },
  'nav.ads': { en: 'Advertisements', rw: 'Amatangazo' },
  'nav.contact': { en: 'Contact US', rw: 'Twandikire' },
  'nav.login': { en: 'Login', rw: 'Injira' },
  'nav.register': { en: 'Register', rw: 'Kwiyandikisha' },
  'nav.profile': { en: 'Profile', rw: 'Umwirondoro' },
  'nav.admin': { en: 'Admin Portal', rw: 'Ubuyobozi' },
  'nav.logout': { en: 'Logout', rw: 'Sohoka' },

  // General & Branding
  'brand.title': { en: 'SEPAC', rw: 'SEPAC' },
  'brand.fullname': { en: 'Saint Esprit Protestant Alumni Community', rw: 'Umuryango w’Abanyeshuri b’Abaporotesitanti bose bize kuri Saint Esprit' },
  'brand.tagline': { en: 'Together in Christ, Stronger in Purpose', rw: 'Duhamanyijwe na Kristo, Dukomeye mu Ntego' },
  'brand.scripture.ref': { en: 'Hebrews 10:24-25', rw: 'Abaheburayo 10:24-25' },
  'brand.scripture.text': {
    en: 'And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching.',
    rw: 'Kandi tujye tuzirikana ibya mugenzi wacu, kugira ngo duterane ishyaka ryo gukundana n’iryo gukora imirimo myiza. Twe kwihunza amakoraniro yacu ngo tube nk’abandi bayasiba, ahubwo tugirirane inama, kandi murusheho kubigira mutya kuko mwirebera yuko rya jambo rirushaho kwegereza.'
  },

  // Values
  'value.unity': { en: 'Unity', rw: 'Ubumwe' },
  'value.unity.desc': { en: 'Bound together by Christ like branches of one vine.', rw: 'Duhujwe n’urukundo rwa Kristo nk’amashami y’umuzabibu umwe.' },
  'value.faith': { en: 'Faith', rw: 'Kwizera' },
  'value.faith.desc': { en: 'Founded firmly on the Word of God and His grace.', rw: 'Gushimangira imyizerere yacu ku Ijambo ry’Imana n’ubuntu bwayo.' },
  'value.fellowship': { en: 'Fellowship', rw: 'Sano & Gushyigikirana' },
  'value.fellowship.desc': { en: 'Standing strong together through prayer and encouragement.', rw: 'Gusangira n’abandi binyuze mu masengesho no guterana ishyaka.' },
  'value.service': { en: 'Service', rw: 'Gukorera Imana' },
  'value.service.desc': { en: 'Serving our community with humility and absolute devotion.', rw: 'Gukorera umuryango wacu n’ubugwaneza n’ubwitange butagabanije.' },

  // Home Page
  'home.hero.title': { en: 'Nurturing Faith, Celebrating Alumni, Serving Together', rw: 'Kuzamura Ukwizera, Kwishimira Abize Hamwe, no Gukorera Imana Hamwe' },
  'home.hero.cta.join': { en: 'Join Our Community', rw: 'Kwiyandikisha mu Muryango' },
  'home.hero.cta.events': { en: 'View Upcoming Events', rw: 'Reba Ibyatanzwe' },
  'home.about.pre': { en: 'WHO WE ARE', rw: 'TURI BANDE?' },
  'home.about.title': { en: 'A Lifelong Fellowship of Faith', rw: 'Ubusabane bw’Ubuzima Bwose mu Kwizera' },
  'home.about.desc': {
    en: 'The Saint Esprit Protestant Alumni Community (SEPAC) is a sanctuary of fellowship, dedicated to connecting school alumni, renewing friendships, nurturing spiritual growth, and serving our broader community through Christ.',
    rw: 'Umuryango w’Abanyeshuri b’Abaporotesitanti bose bize kuri Saint Esprit (SEPAC) ni ubusabane buhoraho, bugamije guhuza abaziranye, kuvugurura ubucuti, gukuza ubuzima bw’umwuka, no gukorana umwete mu mirimo myiza ya Gikristo.'
  },
  'home.news.title': { en: 'Latest News & Devotionals', rw: 'Umakuru & Inyandiko biheruka' },
  'home.news.subtitle': { en: 'Stay spiritually nourished and updated with SEPAC activities.', rw: 'Komeza ukure mu mwuka kandi umenye ibikorwa bishya bya SEPAC.' },
  'home.news.viewall': { en: 'View All Posts', rw: 'Reba Inyandiko Zose' },
  'home.events.title': { en: 'Upcoming Gatherings', rw: 'Dufite Ibihe Bikurikira' },
  'home.events.viewall': { en: 'Browse All Events', rw: 'Reba Ibyabaye Byose' },
  'home.gallery.title': { en: 'Moments of Grace', rw: 'Ibihe by’Ubuntu' },

  // About Page
  'about.history.title': { en: 'Our Rich Heritage', rw: 'Amateka n’Irage Ryacu' },
  'about.history.desc.1': {
    en: 'The Saint Esprit secondary school has stood for decades as a beacon of high educational excellence and Christian discipline in Rwanda. Generations of alumni grew under its Protestant fellowship, developing a unique spiritual bond and ethical background.',
    rw: 'Ishuri rya Saint Esprit rimaze imyaka mirongo riri ku isonga mu gutanga uburezi burangwa n’ubuhanga n’ikinyabupfura cya Gikristo mu Rwanda. Ibyiciro byinshi by’abanyeshuri bahakuriye barazwe imyizerere ya Gikristo, ibyo bikubaka ubusabane budasanzwe.'
  },
  'about.history.desc.2': {
    en: 'SEPAC was officially founded by visionary alumni who wanted to preserve this Christian synergy, offering support to elder alumni, guiding younger graduates, and promoting scholarship, spiritual events, and charity outreaches across the nation.',
    rw: 'SEPAC yashinzwe ku mugaragaro n’abanyeshuri biyemeje gusigasira uwo murage n’ishishyikariza rya Gikristo, gutanga ubufasha ku baharangije kera, kuyobora abakirangiza, no guteza imbere ibikorwa by’urukundo n’ivugabutumwa mu gihugu cyose.'
  },
  'about.mv.mission': { en: 'Our Mission', rw: 'Intego Yacu' },
  'about.mv.mission.text': {
    en: 'To unite all Protestant alumni of Saint Esprit in active fellowship, spiritual nourishment, mutual support, and Christ-focused community engagement.',
    rw: 'Guhuza abayoboke b’abaporotesitanti bose bize kuri Saint Esprit mu busabane nyabwo, kwigishanya ijambo ry’Imana, gushyigikirana, no gukora imirimo y’urukundo.'
  },
  'about.mv.vision': { en: 'Our Vision', rw: 'Icyerekezo Cyacu' },
  'about.mv.vision.text': {
    en: 'An active, empowered alumni community in Rwanda and globally, acting as catalysts of spiritual growth, professional success, and humanitarian values in Christ.',
    rw: 'Umuryango mugari w’abayoboke ba SEPAC mu Rwanda no mu mahanga, bazamura umwuka, bafite iterambere mu kazi kabo, kandi bashyira imbere indangagaciro za Gikristo.'
  },
  'about.team.title': { en: 'Executive Leadership Team', rw: 'Komite Nyobozi ya SEPAC' },
  'about.team.subtitle': { en: 'Dedicated brothers and sisters serving with joy and commitment.', rw: 'Abavandimwe bitangiye inshingano bafite umunyamuryango n’ubuyobozi bwuzuye.' },

  // Members Page
  'members.title': { en: 'Alumni Directory', rw: 'Urutonde rw’Abarangije' },
  'members.search.placeholder': { en: 'Search members by name or bio...', rw: 'Shakisha abanyamuryango n’amazina cyangwa umwirondoro...' },
  'members.filter.yearAll': { en: 'All Grad Years', rw: 'Imyaka Yose' },
  'members.filter.roleAll': { en: 'All Roles', rw: 'Inshingano Zose' },
  'members.grad': { en: 'Graduation Year', rw: 'Umwaka yo Kurangiza' },
  'members.approved.only': { en: 'Verification Required: Login to view other alumni\'s details', rw: 'Bisaba kwinjira ngo urebe amakuru arambuye y’abanyamuryango bose.' },

  // News & Blog Page
  'news.title': { en: 'Fellowship Feed', rw: 'Ubusabane & Inyandiko' },
  'news.create.btn': { en: 'Write a Post', rw: 'Andika Inyandiko' },
  'news.category.all': { en: 'All Categories', rw: 'Byose' },
  'news.pending': { en: 'Pending Review (Visible to Admins Only)', rw: 'Iritegereza Isuzumwa (Bikabonwa n\'Ubuyobozi Gusa)' },
  'news.rejected': { en: 'Rejected Post', rw: 'Inyandiko Yatetswe' },
  'news.author': { en: 'Author', rw: 'Umutanzi' },
  'news.likes': { en: 'Likes', rw: 'Abakunze' },
  'news.comments': { en: 'Comments', rw: 'Ibitekerezo' },
  'news.comments.add': { en: 'Add a comment...', rw: 'Andika igitekerezo...' },
  'news.comments.submit': { en: 'Comment', rw: 'Tanga Igitekerezo' },
  'news.create.title': { en: 'Create a New Post', rw: 'Andika Inyandiko Nshya' },
  'news.create.form.title': { en: 'Post Title', rw: 'Umutwe w\'Inyandiko' },
  'news.create.form.cat': { en: 'Category', rw: 'Icyiciro' },
  'news.create.form.content': { en: 'Content', rw: 'Ibirimo' },
  'news.create.form.img': { en: 'Image URL (Optional)', rw: 'Ifoto (Si ngombwa)' },
  'news.create.submit': { en: 'Submit for Admin Approval', rw: 'Yoherereze Ubuyobozi ngo Byemezwe' },
  'news.create.cancel': { en: 'Cancel', rw: 'Siba' },
  'news.create.success': { en: 'Post submitted! It will appear once approved by an admin.', rw: 'Inyandiko yanyu yoherejwe! Izagaragara inyuma yo kwemezwa n\'ubuyobozi.' },

  // Events Page
  'events.title': { en: 'Community Events', rw: 'Ibirori n\'Ibiteganywa' },
  'events.upcoming': { en: 'Upcoming Events', rw: 'Ibiteganywa Imbere' },
  'events.past': { en: 'Past Gatherings Archive', rw: 'Ibyatambutse' },
  'events.rsvp.btn': { en: 'RSVP Now', rw: 'Andika ko Uzaza' },
  'events.rsvp.going': { en: 'You are Going', rw: 'Uzaza' },
  'events.rsvp.login': { en: 'Login to RSVP', rw: 'Injira ngo Wiyandikishe' },
  'events.location': { en: 'Location', rw: 'Aho Bizabera' },
  'events.date': { en: 'Date', rw: 'Itariki' },
  'events.create.title': { en: 'Schedule New Event', rw: 'Gupanga Igikorwa Kishya' },

  // Gallery Page
  'gallery.title': { en: 'Photo Gallery', rw: 'Amafoto Yacu' },
  'gallery.upload.btn': { en: 'Upload Photo', rw: 'Ohereza Ifoto' },
  'gallery.tag.all': { en: 'All Photos', rw: 'Zose' },
  'gallery.upload.title': { en: 'Submit Gallery Photo', rw: 'Ohereza Ifoto Y’igikorwa' },
  'gallery.form.tag': { en: 'Event / Year Tag', rw: 'Ibiranga Igikorwa / Umwaka' },
  'gallery.form.url': { en: 'Image URL', rw: 'Ifoto' },
  'gallery.upload.success': { en: 'Photo submitted! It will be listed in the gallery after admin validation.', rw: 'Ifoto yoherejwe! Izagaragara inyuma yo kwemezwa n\'ubuyobozi.' },

  // Prayer Page
  'prayer.title': { en: 'Prayer Wall', rw: 'Irukuta rw\'Amasengesho' },
  'prayer.subtitle': { en: 'Bear one another\'s burdens, and so fulfill the law of Christ.', rw: 'Mwaterane ishyaka ku by’isengesho, musangire n’umubabaro.' },
  'prayer.submit.btn': { en: 'Share a Prayer Request', rw: 'Andika Isengesho Ribabaje' },
  'prayer.visibility.public': { en: 'Public (All members can view)', rw: 'Rigaragarira buri wese (Abayoboke bose)' },
  'prayer.visibility.private': { en: 'Private (Visible only to Prayer Leaders / Admins)', rw: 'Rihariwe (Ubuyobozi n\'Abaramyi gusa)' },
  'prayer.react.amen': { en: 'Amen', rw: 'Amen' },
  'prayer.react.pray': { en: 'Praying for You', rw: 'Ndagusengera' },
  'prayer.react.love': { en: 'Sending Love', rw: 'Urukundo ry\'abizera' },

  // Contact Page
  'contact.title': { en: 'Get in Touch', rw: 'Twandikire' },
  'contact.subtitle': { en: 'We value your fellowship, questions, and ideas.', rw: 'Twishimiye ubusabane, ibibazo, cyangwa ibitekerezo byanyu.' },
  'contact.form.name': { en: 'Your Name', rw: 'Izina Ryanyu' },
  'contact.form.email': { en: 'Your Email', rw: 'Imeri Yanyu' },
  'contact.form.msg': { en: 'Your Message', rw: 'Igitekerezo / Inama / Isengesho' },
  'contact.form.submit': { en: 'Send Message', rw: 'Ohereza Ubutumwa' },
  'contact.form.success': { en: 'Thank you! Your message has been sent successfully.', rw: 'Murakoze cyane! Ubutumwa bwanyu bwashyitse neza.' },

  // Auth Pages
  'auth.login.title': { en: 'Log In to SEPAC', rw: 'Injira muri SEPAC' },
  'auth.register.title': { en: 'Join SEPAC Community', rw: 'Yandikishe muri SEPAC' },
  'auth.email': { en: 'Email Address', rw: 'Imeri Yanyu' },
  'auth.password': { en: 'Password', rw: 'Ijambo ry\'Ibanga' },
  'auth.fullname': { en: 'Full Name', rw: 'Izina Ryose' },
  'auth.grad': { en: 'Graduation Year from St. Esprit', rw: 'Umwaka warangirijeho kuri Saint Esprit' },
  'auth.phone': { en: 'Phone Number (Optional)', rw: 'Inomero ya Telefoni (Si ngombwa)' },
  'auth.avatar': { en: 'Profile Photo URL (Optional)', rw: 'Ifoto y\'Umwirondoro' },
  'auth.signup.btn': { en: 'Register', rw: 'Wiyandikishe' },
  'auth.signin.btn': { en: 'Sign In', rw: 'Injira' },
  'auth.noaccount': { en: 'Don\'t have an account?', rw: 'Nta konti ufite?' },
  'auth.haveaccount': { en: 'Already a member?', rw: 'Usanzwe uri umuyoboke?' },
  'auth.register.pending': { en: 'Registration successful! Your account is pending admin approval before you can access all features.', rw: 'Kwiyandikisha byagenze neza! Konti yanyu iri gusuzumwa n\'ubuyobozi mbere yo guhabwa uburenganzira bwose.' },

  // Admin Portal & Roles
  'admin.title': { en: 'Admin Dashboard', rw: 'Ubuyobozi n\'Imibare' },
  'admin.tab.approvals': { en: 'Approvals Queue', rw: 'Ibisuzumwa' },
  'admin.tab.users': { en: 'Member Roles', rw: 'Inshingano z\'Abantu' },
  'admin.tab.events': { en: 'Manage Events', rw: 'Ibyabaye & Ibitegurwa' },
  'admin.tab.announcements': { en: 'Send Announcement', rw: 'Kwandika Itangazo' },
  'admin.stats.members': { en: 'Total Alumni', rw: 'Abanyamuryango Bose' },
  'admin.stats.active': { en: 'Pending Verification', rw: 'Abari Gusuzumwa' },
  'admin.stats.approved': { en: 'Active Members', rw: 'Abayoboke Nyabo' },
  'admin.stats.posts': { en: 'Total Feed Posts', rw: 'Inyandiko Zose' },
  'admin.action.approve': { en: 'Approve', rw: 'Emeza' },
  'admin.action.reject': { en: 'Reject', rw: 'Siba' },
  'admin.action.promote': { en: 'Make Admin', rw: 'Gira Umuyobozi' },
  'admin.action.demote': { en: 'Remove Admin', rw: 'Kura ku Buyobozi' },
  'admin.action.makeMod': { en: 'Make Moderator', rw: 'Gira Umunyamategeko' },
  'admin.action.verifyUser': { en: 'Verify Account', rw: 'Emeza Umuyoboke' },
  'admin.event.name': { en: 'Event Title', rw: 'Izina ry\'Igikorwa' },
  'admin.event.desc': { en: 'Description', rw: 'Ibisobanuro' },
  'admin.event.date': { en: 'Date & Time', rw: 'Itariki & Isaha' },
  'admin.event.loc': { en: 'Location', rw: 'Aho Bizabera' },
  'admin.event.img': { en: 'Image URL', rw: 'Ifoto y\'Igikorwa' },
  'admin.event.create': { en: 'Publish Event', rw: 'Sohora Igikorwa' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sepac_lang');
    return (saved === 'en' || saved === 'rw') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sepac_lang', lang);
  };

  const t = (key: string): string => {
    const trans = translations[key];
    if (!trans) return key;
    return trans[language] || trans['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
