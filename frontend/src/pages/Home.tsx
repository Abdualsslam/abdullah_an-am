import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Category, SiteSettings } from '../types';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp: '00972592308524',
    instagram: 'ahmed.designer19',
    name_ar: 'أحمد',
    name_en: 'Ahmed',
    title_ar: 'مصمم جرافيك',
    title_en: 'Graphic Designer'
  });

  useEffect(() => {
    // Track main page view
    api.post('/analytics/track', { path: '/' }).catch(() => {});

    const fetchData = async () => {
      try {
        const [catsRes, settingsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/settings')
        ]);
        setCategories(catsRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScrollToPortfolio = () => {
    const section = document.getElementById('portfolio-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to render Lucide icons dynamically from name
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-neutral-300 group-hover:text-white transition-colors relative z-10" />;
    }
    // Fallback icon
    return <LucideIcons.Briefcase className="w-8 h-8 text-neutral-300 group-hover:text-white transition-colors relative z-10" />;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Background Image Parallax with Mask */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              scale: [1.05, 1.12, 1.05],
              x: ['-1%', '1.5%', '-1%'],
              y: ['-1%', '1%', '-1%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full bg-[url('/bg.png')] bg-cover bg-center blur-[10px] md:blur-[14px]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
              maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
            }}
          />
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl pt-24 md:pt-36 pb-12 md:pb-16">
          {/* Logo animates pulsing */}
          <motion.div
            className="flex flex-col items-center justify-center gap-1"
            animate={{ y: [-8, 8, -8] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <div className="relative w-48 md:w-72 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-auto object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('hero-fallback-logo');
                  if (fallback) {
                    fallback.classList.remove('hidden');
                    fallback.classList.add('flex');
                  }
                }}
              />
              <div
                id="hero-fallback-logo"
                className="hidden flex-col items-center justify-center gap-1"
              >
                <h1 className="text-6xl md:text-8xl font-serif text-white tracking-widest font-medium">
                  {settings.name_ar}
                </h1>
                <h2 className="text-2xl md:text-4xl font-serif tracking-[0.3em] md:tracking-[0.4em] text-white/90 uppercase mt-2">
                  {settings.name_en}
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '80px', opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mt-12 mb-8"
          />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          >
            <h3 className="text-sm md:text-lg uppercase tracking-[0.4em] text-neutral-400 font-light text-center">
              {language === 'ar' ? settings.title_ar : settings.title_en}
            </h3>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full sm:w-auto"
          >
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-white text-black rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <MessageCircle className="w-5 h-5 relative z-10" />
              <span className="relative z-10 tracking-wide">{t('work')}</span>
            </a>

            <button
              onClick={handleScrollToPortfolio}
              className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden w-full sm:w-auto cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
              <span className="tracking-wide relative z-10">{t('portfolio')}</span>
              {isRtl ? (
                <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Portfolio Categories Section */}
      <div
        id="portfolio-section"
        className="flex flex-col items-center justify-center py-24 px-6 relative min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-white font-medium">
            {t('portfolio')}
          </h2>
          <p className="text-neutral-400 font-light text-lg px-4 max-w-lg mx-auto leading-relaxed">
            {t('chooseCategory')}
          </p>
        </motion.div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {loading ? (
            <div className="col-span-full text-center text-neutral-400 py-10">
              {t('loading')}
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center text-neutral-400 py-10">
              {language === 'ar' ? 'لا توجد أقسام بعد. يمكنك إضافتها من لوحة التحكم.' : 'No categories yet. Add them in the admin dashboard.'}
            </div>
          ) : (
            categories.map((cat, index) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: 'easeOut' }}
              >
                <div
                  onClick={() => navigate(`/works/${cat.key}`)}
                  className="group relative flex flex-col items-center justify-center gap-6 p-10 h-64 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-3xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative overflow-hidden z-10 border border-white/5 shadow-inner">
                    {renderIcon(cat.icon)}
                  </div>
                  
                  <h3 className="text-xl font-medium tracking-wide text-center text-white/90 group-hover:text-white transition-colors relative z-10">
                    {language === 'ar' ? cat.name_ar : cat.name_en}
                  </h3>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
