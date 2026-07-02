import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { SiteSettings } from '../types';
import { LuSave as Save } from 'react-icons/lu';
import api from '../services/api';

const SettingsPanel: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp: '',
    instagram: '',
    name_ar: '',
    name_en: '',
    title_ar: '',
    title_en: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/settings', settings);
      setSuccess('Settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return <div className="text-neutral-400">{t('loading')}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('siteSettings')}</h1>
        <p className="text-neutral-400 text-sm">
          {isRtl ? 'تعديل بيانات التواصل والمسمى الوظيفي والاسم على الموقع' : 'Configure contact information, professional title and display names'}
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">الاسم (بالعربية)</label>
              <input
                type="text"
                required
                name="name_ar"
                value={settings.name_ar}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="عبدالله"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">Name (English)</label>
              <input
                type="text"
                required
                name="name_en"
                value={settings.name_en}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Abdullah"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">المسمى الوظيفي (بالعربية)</label>
              <input
                type="text"
                required
                name="title_ar"
                value={settings.title_ar}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="مصمم جرافيك"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">Job Title (English)</label>
              <input
                type="text"
                required
                name="title_en"
                value={settings.title_en}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Graphic Designer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">{t('whatsapp')}</label>
              <input
                type="text"
                required
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="967774905790"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">{t('instagram')}</label>
              <input
                type="text"
                required
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="ahmed.designer19"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
