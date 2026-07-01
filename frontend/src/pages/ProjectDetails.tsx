import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Project } from '../types';
import api, { BASE_URL } from '../services/api';

const ProjectDetails: React.FC = () => {
  const { id, category } = useParams<{ id: string; category: string }>();
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    // Track project details view
    api.post('/analytics/track', { path: `/works/${category}/${id}` }).catch(() => {});

    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/projects/single/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, category]);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen text-neutral-400">
        {t('loading')}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen text-neutral-400 gap-4">
        <span>{language === 'ar' ? 'المشروع غير موجود' : 'Project not found'}</span>
        <button
          onClick={() => navigate(`/works/${category}`)}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  // Combine cover and additional images for lightbox view
  const allMedia = [project.main_image, ...(project.images || [])];

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev! - 1));
    }
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev! + 1));
    }
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto py-24 px-6 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navigation and Title */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => navigate(`/works/${category}`)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{t('back')}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-12"
      >
        <div className="text-center md:text-start space-y-4">
          <h1 className="text-3xl md:text-5xl font-semibold text-white">
            {language === 'ar' ? project.title_ar : project.title_en}
          </h1>
          <p className="text-neutral-400 max-w-3xl leading-relaxed text-lg whitespace-pre-line">
            {language === 'ar' ? project.description_ar : project.description_en}
          </p>
        </div>

        {/* Cover / Main Media Showcase */}
        <div 
          onClick={() => setLightboxIndex(0)}
          className="rounded-3xl overflow-hidden glass-card aspect-video relative group cursor-zoom-in"
        >
          {isVideo(project.main_image) ? (
            <video
              src={`${BASE_URL}${project.main_image}`}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={`${BASE_URL}${project.main_image}`}
              alt={project.title_en}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white">
              {t('gallery')}
            </span>
          </div>
        </div>

        {/* Gallery / Extra Media */}
        {project.images && project.images.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-medium text-white border-b border-white/10 pb-2">
              {t('gallery')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx + 1)}
                  className="rounded-2xl overflow-hidden glass-card aspect-[4/3] relative group cursor-zoom-in"
                >
                  {isVideo(img) ? (
                    <video
                      src={`${BASE_URL}${img}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={`${BASE_URL}${img}`}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Lightbox / Viewport Slider */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrevMedia}
              className="absolute left-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextMedia}
              className="absolute right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Active Media Container */}
            <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {isVideo(allMedia[lightboxIndex]) ? (
                <video
                  src={`${BASE_URL}${allMedia[lightboxIndex]}`}
                  className="max-w-full max-h-full object-contain rounded-xl"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={`${BASE_URL}${allMedia[lightboxIndex]}`}
                  alt="Lightbox"
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
