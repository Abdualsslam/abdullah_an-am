import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Briefcase, Globe, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { Category } from '../types';
import api from '../services/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t, toggleLanguage, language, isRtl } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);

  // Scroll effect to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY && currentScrollY > 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories for navbar:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handlePortfolioClick = () => {
    setIsOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById('portfolio-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#portfolio-section');
    }
  };

  // Don't show navbar on homepage hero (replicating designerahmed.com where navbar is not shown on homepage hero initially, or let's keep it visible on scroll)
  // Actually, in designerahmed.com, the navbar is visible on subpages and only when you scroll past hero. Let's make it look identical!
  // On home path, we don't show the header if scroll is near top.
  const isHome = location.pathname === '/';
  const showNav = !isHome || prevScrollY > 200;

  return (
    <>
      <AnimatePresence>
        {showNav && visible && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-6 md:px-10 bg-[#050505]/80 backdrop-blur-md border-b border-white/10"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 hover:bg-white/[0.06] cursor-pointer"
            >
              <Menu className="w-5 h-5 text-white stroke-[1.5]" />
            </button>

            <div
              onClick={() => navigate('/')}
              className="flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Hamburger Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`fixed top-6 ${isRtl ? 'right-6' : 'left-6'} md:top-8 md:${isRtl ? 'right-8' : 'left-8'} w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl`}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} p-2 mb-1`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex flex-col gap-1 pb-2 px-2">
                <button
                  onClick={() => handleNavClick('/')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-start relative overflow-hidden group cursor-pointer"
                >
                  <Home className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium tracking-wide text-white/90 group-hover:text-white transition-colors">
                    {t('home')}
                  </span>
                </button>

                <button
                  onClick={handlePortfolioClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-start relative overflow-hidden group cursor-pointer"
                >
                  <Briefcase className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium tracking-wide text-white/90 group-hover:text-white transition-colors">
                    {t('portfolio')}
                  </span>
                </button>

                {/* Dynamic categories mapping */}
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleNavClick(`/works/${cat.key}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-start relative overflow-hidden group cursor-pointer pl-6"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
                    <span className="text-sm font-light tracking-wide text-white/70 group-hover:text-white transition-colors">
                      {language === 'ar' ? cat.name_ar : cat.name_en}
                    </span>
                  </button>
                ))}

                <div className="h-px bg-white/10 my-1 w-full" />

                {isAuthenticated && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-start relative overflow-hidden group cursor-pointer"
                  >
                    <LayoutDashboard className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium tracking-wide text-white/90 group-hover:text-white transition-colors">
                      {t('dashboard')}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    toggleLanguage();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-start relative overflow-hidden group cursor-pointer"
                >
                  <Globe className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium tracking-wide text-white/90 group-hover:text-white transition-colors">
                    {t('switchLang')}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
