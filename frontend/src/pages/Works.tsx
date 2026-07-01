import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowLeft as ArrowLeft, LuArrowRight as ArrowRight } from 'react-icons/lu';
import { useLanguage } from '../contexts/LanguageContext';
import type { Project, Category } from '../types';
import api, { BASE_URL } from '../services/api';

const Works: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track category page view
    api.post('/analytics/track', { path: `/works/${category}` }).catch(() => {});

    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          api.get(`/projects/category/${category}`),
          api.get('/categories')
        ]);
        
        setProjects(projectsRes.data);
        
        const cat = categoriesRes.data.find((c: Category) => c.key === category);
        if (cat) {
          setCurrentCategory(cat);
        }
      } catch (error) {
        console.error('Error fetching works data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category]);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const getCategoryTitle = () => {
    if (currentCategory) {
      return language === 'ar' ? currentCategory.name_ar : currentCategory.name_en;
    }
    // Fallback based on default keys
    switch (category) {
      case 'brand':
        return t('brand');
      case 'profile':
        return t('companyProfile');
      case 'social':
        return t('socialMedia');
      default:
        return category;
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto py-24 px-6 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span>{t('back')}</span>
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-white font-medium capitalize">
          {getCategoryTitle()}
        </h1>
      </motion.div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center text-neutral-400 py-10">
          {t('loading')}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-neutral-400 py-10">
          {t('noProjects')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            >
              <div
                onClick={() => navigate(`/works/${category}/${project._id}`)}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-white/[0.02] border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer shadow-lg"
              >
                {isVideo(project.main_image) ? (
                  <video
                    src={`${BASE_URL}${project.main_image}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${BASE_URL}${project.main_image})` }}
                  />
                )}
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-lg font-medium text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {language === 'ar' ? project.title_ar : project.title_en}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Works;
