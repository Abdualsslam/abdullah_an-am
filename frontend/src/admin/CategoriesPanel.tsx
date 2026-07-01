import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Category } from '../types';
import { LuPlus as Plus, LuTrash2 as Trash2, LuSave as Save, LuArrowUp as ArrowUp, LuArrowDown as ArrowDown } from 'react-icons/lu';
import { FiEdit2 as Edit2 } from 'react-icons/fi';
import api from '../services/api';

const CategoriesPanel: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const [href, setHref] = useState('');
  const [order, setOrder] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setKey('');
    setIcon('Briefcase');
    setHref('');
    setOrder(0);
    setEditId(null);
    setIsEditing(false);
    setError('');
  };

  const handleEditClick = (cat: Category) => {
    setEditId(cat._id);
    setNameAr(cat.name_ar);
    setNameEn(cat.name_en);
    setKey(cat.key);
    setIcon(cat.icon);
    setHref(cat.href);
    setOrder(cat.order);
    setIsEditing(true);
    setError('');
  };

  const handleAddNewClick = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCategoryKeyChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setKey(formatted);
    setHref(`/works/${formatted}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name_ar: nameAr,
      name_en: nameEn,
      key,
      icon,
      href,
      order
    };

    try {
      if (editId) {
        await api.put(`/categories/${editId}`, payload);
        setSuccess('Category updated successfully');
      } else {
        await api.post('/categories', payload);
        setSuccess('Category created successfully');
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category. Make sure the Key is unique.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isRtl
      ? 'هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المشاريع التابعة له أيضاً!'
      : 'Are you sure you want to delete this category? All projects under this category will also be deleted!'
    )) return;

    try {
      await api.delete(`/categories/${id}`);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newCats.length) return;

    // Swap order property
    const tempOrder = newCats[index].order;
    newCats[index].order = newCats[targetIdx].order;
    newCats[targetIdx].order = tempOrder;

    const orderList = [
      { id: newCats[index]._id, order: newCats[index].order },
      { id: newCats[targetIdx]._id, order: newCats[targetIdx].order }
    ];

    try {
      await api.put('/categories/reorder', { orderList });
      fetchCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('categories')}</h1>
          <p className="text-neutral-400 text-sm">
            {isRtl ? 'إدارة أقسام معرض الأعمال المرنة وترتيب ظهورها' : 'Manage your dynamic portfolio categories and their order'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2.5 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addCategory')}</span>
          </button>
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
            {editId ? t('edit') : t('addCategory')}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">الاسم بالعربية</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="مثال: هوية بصرية"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">Name (English)</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Example: Visual Identity"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">{t('key')}</label>
              <input
                type="text"
                required
                disabled={!!editId} // Key is identifier, editing it is blocked once created
                value={key}
                onChange={(e) => handleCategoryKeyChange(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                placeholder="example: brand"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">{t('icon')}</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="Briefcase">Briefcase (حقيبة عمل)</option>
                <option value="Layers">Layers (طبقات / تصاميم)</option>
                <option value="Globe">Globe (موقع / سوشيال ميديا)</option>
                <option value="Layout">Layout (مظهر / صفحات)</option>
                <option value="Image">Image (صور / فوتوغرافي)</option>
                <option value="Camera">Camera (كاميرا)</option>
                <option value="PenTool">PenTool (ريشة الرسم)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">{t('href')}</label>
              <input
                type="text"
                required
                disabled
                value={href}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none opacity-50"
              />
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

            <div className="col-span-full flex gap-3 justify-end pt-4">
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
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-neutral-400">
              {isRtl ? 'لا توجد أقسام بعد. اضغط على زر الإضافة لإنشاء أول قسم.' : 'No categories yet. Click Add Category to create your first.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.01]">
                    <th className="px-6 py-4 text-start">{isRtl ? 'الاسم' : 'Name'}</th>
                    <th className="px-6 py-4 text-start">{t('key')}</th>
                    <th className="px-6 py-4 text-start">{t('icon')}</th>
                    <th className="px-6 py-4 text-start">{t('order')}</th>
                    <th className="px-6 py-4 text-center">{isRtl ? 'ترتيب' : 'Reorder'}</th>
                    <th className="px-6 py-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {categories.map((cat, idx) => (
                    <tr key={cat._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div>{cat.name_ar}</div>
                        <div className="text-xs text-neutral-400">{cat.name_en}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-300">{cat.key}</td>
                      <td className="px-6 py-4 text-neutral-300">{cat.icon}</td>
                      <td className="px-6 py-4 text-neutral-300">{cat.order}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === categories.length - 1}
                            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
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

export default CategoriesPanel;
