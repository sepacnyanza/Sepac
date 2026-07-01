/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Views
import Home from './pages/Home';
import About from './pages/About';
import Members from './pages/Members';
import News from './pages/News';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Prayer from './pages/Prayer';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Mission from './pages/Mission';
import Giving from './pages/Giving';
import Advertisements from './pages/Advertisements';

function MainAppLayout() {
  const [page, setPage] = useState<string>('home');
  const selectedEventIdRef = useRef<string>('');

  const renderActivePage = () => {
    switch (page) {
      case 'about':
        return <About />;
      case 'members':
        return <Members setPage={setPage} />;
      case 'feed':
        return <News />;
      case 'events':
        return <Events setPage={setPage} selectedEventIdRef={selectedEventIdRef} />;
      case 'gallery':
        return <Gallery />;
      case 'prayer':
        return <Prayer setPage={setPage} />;
      case 'contact':
        return <Contact />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <Admin />;
      case 'auth':
        return <Auth setPage={setPage} />;
      case 'mission':
        return <Mission />;
      case 'giving':
        return <Giving />;
      case 'ads':
        return <Advertisements setPage={setPage} />;
      case 'home':
      default:
        return <Home setPage={setPage} selectedEventIdRef={selectedEventIdRef} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCF9F2]">
      {/* Persistent Bilingual Navbar */}
      <Navbar currentPage={page} setPage={setPage} />

      {/* Primary Dynamic Main Body View */}
      <main className="flex-grow">
        {renderActivePage()}
      </main>

      {/* Scripture & Links footer */}
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
