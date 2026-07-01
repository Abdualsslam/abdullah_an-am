import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Contexts
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import SocialButtons from './components/SocialButtons';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Home from './pages/Home';
import Works from './pages/Works';
import ProjectDetails from './pages/ProjectDetails';

// Admin
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white select-none overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <div className="flex-grow flex flex-col relative w-full">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/works/:category" element={<Works />} />
              <Route path="/works/:category/:id" element={<ProjectDetails />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<Dashboard />} />

              {/* Redirect any other path to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
            <SocialButtons />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
