import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import ReportEngine from './pages/ReportEngine';
import LegalBot from './pages/LegalBot';
import Archive from './pages/Archive';
import Login from './pages/Login';
import Brainstorm from './pages/Brainstorm';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Library from './pages/Library';
import Growth from './pages/Growth';
import { useNotification } from './context/NotificationContext';
import { setNotificationHandler } from './api';
import React, { useEffect } from 'react';

function AnimatedRoutes() {
  const { showNotification } = useNotification();

  useEffect(() => {
    setNotificationHandler(showNotification);
  }, [showNotification]);

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/scanner" element={<PageWrapper><Scanner /></PageWrapper>} />
        <Route path="/report" element={<PageWrapper><ReportEngine /></PageWrapper>} />
        <Route path="/brainstorm" element={<PageWrapper><Brainstorm /></PageWrapper>} />
        <Route path="/methodist" element={<PageWrapper><LegalBot /></PageWrapper>} />
        <Route path="/archive" element={<PageWrapper><Archive /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
        <Route path="/growth" element={<PageWrapper><Growth /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  return (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;