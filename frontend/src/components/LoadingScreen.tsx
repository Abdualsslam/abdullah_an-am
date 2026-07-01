import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
    >
      <motion.div
        className="flex flex-col items-center justify-center gap-1"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <div className="relative w-48 md:w-72 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-auto object-contain drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('loading-fallback-logo');
              if (fallback) {
                fallback.classList.remove('hidden');
                fallback.classList.add('flex');
              }
            }}
          />
          <div
            id="loading-fallback-logo"
            className="hidden flex-col items-center justify-center gap-1"
          >
            <h1 className="text-6xl md:text-8xl font-serif text-white tracking-widest font-medium">
              {t('nameAr')}
            </h1>
            <h2 className="text-2xl md:text-4xl font-serif tracking-[0.3em] md:tracking-[0.4em] text-white/90 uppercase mt-2">
              {t('name')}
            </h2>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
