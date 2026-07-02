import React, { useState, useEffect } from 'react';
import { LuMessageCircle as MessageCircle, LuArrowUp as ArrowUp } from 'react-icons/lu';
import { FaInstagram } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { SiteSettings } from '../types';

const SocialButtons: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp: '967774905790',
    instagram: 'ahmed.designer19',
    name_ar: 'عبدالله',
    name_en: 'Abdullah',
    title_ar: 'مصمم جرافيك',
    title_en: 'Graphic Designer'
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings for social buttons:', error);
      }
    };
    fetchSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-center">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-3 items-center"
          >
            {/* Social Links Box */}
            <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 p-2.5 text-neutral-300 hover:text-[#25D366] hover:bg-white/10 rounded-full transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 stroke-[1.5]" />
              </a>

              <div className="w-8 h-px bg-white/10 my-1 relative z-10" />

              <a
                href={`https://www.instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 p-2.5 text-neutral-300 hover:text-[#E1306C] hover:bg-white/10 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="flex mt-1 items-center justify-center p-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full hover:bg-white/10 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden cursor-pointer"
              aria-label="Back to top"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
              <ArrowUp className="w-5 h-5 stroke-[2] relative z-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialButtons;
