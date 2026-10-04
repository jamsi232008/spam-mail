import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import EmailDetails from './pages/EmailDetails';
import ComposeEmail from './pages/ComposeEmail';
import Bin from './pages/Bin';
import SpamDetection from './pages/SpamDetection';
import DetectionHistory from './pages/DetectionHistory';
import Settings from './pages/Settings';

import { emailService } from './services/api';

function AppLayout() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [binCount, setBinCount] = useState(0);

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Security Dashboard';
    if (path.startsWith('/inbox')) return 'Inbox (Legitimate Emails)';
    if (path.startsWith('/emails')) return 'Email Security Inspection';
    if (path.startsWith('/compose')) return 'Compose & Simulate Email Dispatch';
    if (path.startsWith('/bin')) return 'Spam Quarantine Bin';
    if (path.startsWith('/spam-detection')) return 'AI Model Sandbox & Live Tester';
    if (path.startsWith('/detection-history')) return 'Detection Audit History';
    if (path.startsWith('/settings')) return 'System & Model Settings';
    return 'Smart Spam Shield';
  };

  const refreshCounts = async () => {
    try {
      const inboxData = await emailService.getEmails('INBOX');
      const binData = await emailService.getEmails('BIN');
      setUnreadCount(inboxData.stats?.unread_count ?? (inboxData.emails?.filter(e => !e.is_read).length || 0));
      setBinCount(binData.total ?? (binData.emails?.length || 0));
    } catch (e) {
      // Backend might be offline or starting up
    }
  };

  useEffect(() => {
    refreshCounts();
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Sidebar unreadCount={unreadCount} binCount={binCount} />
      <div className="main-content">
        <Navbar 
          title={getPageTitle(location.pathname)} 
          onDemoLoaded={refreshCounts} 
        />
        <main className="content-area">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/emails/:id" element={<EmailDetails />} />
            <Route path="/compose" element={<ComposeEmail />} />
            <Route path="/bin" element={<Bin />} />
            <Route path="/spam-detection" element={<SpamDetection />} />
            <Route path="/detection-history" element={<DetectionHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
