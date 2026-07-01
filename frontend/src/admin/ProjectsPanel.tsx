import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Project, Category } from '../types';
import { Plus, Edit2, X, Trash2, Save, Upload, Film, ExternalLink } from 'lucide-react';
import api, { BASE_URL } from '../services/api';

const ProjectsPanel: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [order, setOrder] = useState(0);

  // Upload progress / states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, categoriesRes] = await Promise.all([
        api.get('/projects'),
        api.get('/categories')
      ]);
      setProjects(projectsRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0 && !category) {
        setCategory(categoriesRes.data[0].key);
      }
    } catch (err) {
      console.error('Error fetching projects data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitleAr('');
    setTitleEn('');
    setCategory(categories[0]?.key || '');
    setMainImage('');
    setImages([]);
    setDescriptionAr('');
    setDescriptionEn('');
    setOrder(0);
    setEditId(null);
    setIsEditing(false);
    setError('');
  };

  const handleEditClick = (project: Project) => {
    setEditId(project._id);
    setTitleAr(project.title_ar);
    setTitleEn(project.title_en);
    setCategory(project.category);
    setMainImage(project.main_image);
    setImages(project.images || []);
    setDescriptionAr(project.description_ar);
    setDescriptionEn(project.description_en);
    setOrder(project.order);
    setIsEditing(true);
    setError('');
  };

  const handleAddNewClick = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingCover(true);
    setError('');

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMainImage(response.data.url);
      setSuccess('Cover media uploaded successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed. Only images and videos are allowed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploadingGallery(true);
    setError('');

    try {
      const response = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages((prev) => [...prev, ...response.data.urls]);
      setSuccess('Gallery files uploaded successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload gallery files.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mainImage) {
      setError('Please upload a cover image or video.');
      return;
    }

    const payload = {
      title_ar: titleAr,
      title_en: titleEn,
      category,
      main_image: mainImage,
      images,
      description_ar: descriptionAr,
      description_en: descriptionEn,
      order
    };

    try {
      if (editId) {
        await api.put(`/projects/${editId}`, payload);
        setSuccess('Project updated successfully');
      } else {
        await api.post('/projects', payload);
        setSuccess('Project created successfully');
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      setSuccess('Project deleted successfully');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const filteredProjects = filterCategory === 'all'
    ? projects
    : projects.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('projects')}</h1>
          <p className="text-neutral-400 text-sm">
            {isRtl ? 'إدارة وتعديل مشاريع معرض الأعمال' : 'Manage and update your portfolio projects'}
          </p>
        </div>

        {!isEditing && (
          <div className="flex gap-3 items-center">
            {/* Filter Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="all">{isRtl ? 'كل الأقسام' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c._id} value={c.key}>
                  {language === 'ar' ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2.5 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>{t('addProject')}</span>
            </button>
          </div>
        )}
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

      {isEditing ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3">
            {editId ? t('edit') : t('addProject')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">العنوان بالعربية</label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="عنوان المشروع"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">Title (English)</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Project Title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">القسم</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                >
                  {categories.map(c => (
                    <option key={c._id} value={c.key}>
                      {language === 'ar' ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">{t('order')}</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Description fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">الوصف بالعربية</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-y"
                  placeholder="تفاصيل المشروع باللغة العربية"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">Description (English)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={4}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-y"
                  placeholder="Project details in English"
                />
              </div>
            </div>

            {/* Cover Upload */}
            <div className="bg-white/[0.01] border border-dashed border-white/10 p-6 rounded-2xl">
              <label className="text-sm font-medium text-neutral-300 block mb-4">{t('mainImage')}</label>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-grow w-full">
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-white/40 h-32 rounded-xl cursor-pointer transition-colors bg-white/[0.01] gap-2">
                    <Upload className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs text-neutral-400">
                      {uploadingCover ? t('submitting') : (isRtl ? 'اختر ملفاً أو اسحبه هنا (صورة أو فيديو)' : 'Choose a file or drag here (image/video)')}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Box */}
                {mainImage && (
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                    {isVideo(mainImage) ? (
                      <video src={`${BASE_URL}${mainImage}`} className="w-full h-full object-cover" />
                    ) : (
                      <img src={`${BASE_URL}${mainImage}`} alt="Cover" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Upload */}
            <div className="bg-white/[0.01] border border-dashed border-white/10 p-6 rounded-2xl">
              <label className="text-sm font-medium text-neutral-300 block mb-4">{t('additionalImages')}</label>

              <div className="space-y-6">
                <label className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-white/40 h-24 rounded-xl cursor-pointer transition-colors bg-white/[0.01] gap-1">
                  <Upload className="w-5 h-5 text-neutral-400" />
                  <span className="text-xs text-neutral-400">
                    {uploadingGallery ? t('submitting') : (isRtl ? 'رفع صور أو فيديوهات إضافية' : 'Upload multiple gallery files')}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>

                {/* Previews Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="h-24 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                        {isVideo(img) ? (
                          <video src={`${BASE_URL}${img}`} className="w-full h-full object-cover" />
                        ) : (
                          <img src={`${BASE_URL}${img}`} alt="Gallery" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>{t('save')}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-10 text-center text-neutral-400">{t('loading')}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-10 text-center text-neutral-400">
              {isRtl ? 'لا توجد مشاريع مضافة بعد في هذا القسم.' : 'No projects added in this category yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.01]">
                    <th className="px-6 py-4 text-start">{isRtl ? 'المعجب / المشروع' : 'Media / Project'}</th>
                    <th className="px-6 py-4 text-start">{isRtl ? 'القسم' : 'Category'}</th>
                    <th className="px-6 py-4 text-start">{t('order')}</th>
                    <th className="px-6 py-4 text-center">{isRtl ? 'معاينة' : 'Preview'}</th>
                    <th className="px-6 py-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredProjects.map((p) => (
                    <tr key={p._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                            {isVideo(p.main_image) ? (
                              <div className="w-full h-full flex items-center justify-center bg-white/5 text-neutral-400">
                                <Film className="w-5 h-5" />
                              </div>
                            ) : (
                              <img src={`${BASE_URL}${p.main_image}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{p.title_ar}</div>
                            <div className="text-xs text-neutral-400">{p.title_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-300">{p.category}</td>
                      <td className="px-6 py-4 text-neutral-300">{p.order}</td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={`/works/${p.category}/${p._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsPanel;
