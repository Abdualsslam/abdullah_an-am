import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LuMessageCircle as MessageCircle } from 'react-icons/lu';
import { FaInstagram } from 'react-icons/fa';
import api from '../services/api';
import type { SiteSettings } from '../types';

const Footer: React.FC = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp: '00972592308524',
    instagram: 'ahmed.designer19',
    name_ar: 'أحمد',
    name_en: 'Ahmed',
    title_ar: 'مصمم جرافيك',
    title_en: 'Graphic Designer'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings for footer:', error);
      }
    };
    fetchSettings();
  }, []);

  // Hide on homepage
  if (location.pathname === '/') {
    return null;
  }

  return (
    <footer className="w-full py-8 mt-auto border-t border-white/10 relative z-20">
      <div className="max-w-4xl mx-auto px-6 flex flex-row items-center justify-center gap-6 text-white/70">
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
        </a>
        <a
          href={`https://www.instagram.com/${settings.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
          aria-label="Instagram"
        >
          <FaInstagram className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
