import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { SiteSettings } from '../types';
import { LuSave as Save, LuShieldCheck as ShieldCheck, LuEye as Eye, LuEyeOff as EyeOff } from 'react-icons/lu';
import api from '../services/api';

const SettingsPanel: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { login } = useAuth();
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

  // Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
      setSuccess(isRtl ? 'تم تحديث الإعدادات بنجاح' : 'Settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || (isRtl ? 'فشل في تحديث الإعدادات' : 'Failed to update settings'));
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (!currentPassword) {
      setCredError(isRtl ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required');
      return;
    }

    if (!newUsername && !newPassword) {
      setCredError(isRtl ? 'أدخل اسم مستخدم جديد أو كلمة مرور جديدة' : 'Enter a new username or new password');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredError(isRtl ? 'كلمة المرور الجديدة وتأكيدها غير متطابقتين' : 'New password and confirmation do not match');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setCredError(isRtl ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' : 'Password must be at least 4 characters');
      return;
    }

    setCredLoading(true);

    try {
      const payload: any = { currentPassword };
      if (newUsername) payload.newUsername = newUsername;
      if (newPassword) payload.newPassword = newPassword;

      const response = await api.put('/auth/change-credentials', payload);

      // Update auth context with new token and username
      login(response.data.token, response.data.username);

      setCredSuccess(isRtl ? 'تم تحديث بيانات تسجيل الدخول بنجاح' : 'Credentials updated successfully');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'Current password is incorrect') {
        setCredError(isRtl ? 'كلمة المرور الحالية غير صحيحة' : msg);
      } else if (msg === 'Username already taken') {
        setCredError(isRtl ? 'اسم المستخدم مأخوذ بالفعل' : msg);
      } else {
        setCredError(msg || (isRtl ? 'فشل في تحديث البيانات' : 'Failed to update credentials'));
      }
    } finally {
      setCredLoading(false);
    }
  };

  if (loading) {
    return <div className="text-neutral-400">{t('loading')}</div>;
  }

  const inputClasses = "w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors";

  return (
    <div className="space-y-10">
      {/* ===== Site Settings Section ===== */}
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
                className={inputClasses}
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
                className={inputClasses}
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
                className={inputClasses}
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
                className={inputClasses}
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
                className={inputClasses}
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
                className={inputClasses}
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

      {/* ===== Credentials Change Section ===== */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-bold text-white">
            {isRtl ? 'تغيير بيانات تسجيل الدخول' : 'Change Login Credentials'}
          </h2>
        </div>
        <p className="text-neutral-400 text-sm">
          {isRtl ? 'يمكنك تغيير اسم المستخدم وكلمة المرور الخاصة بتسجيل الدخول' : 'Update your admin username and password'}
        </p>
      </div>

      {credSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
          {credSuccess}
        </div>
      )}

      {credError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
          {credError}
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl shadow-lg">
        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          {/* Current Password (required) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 block">
              {isRtl ? 'كلمة المرور الحالية *' : 'Current Password *'}
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isRtl ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                className={`${inputClasses} ${isRtl ? 'pl-12' : 'pr-12'}`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className={`absolute inset-y-0 ${isRtl ? 'left-4' : 'right-4'} flex items-center text-neutral-500 hover:text-neutral-300 transition-colors`}
              >
                {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">
                  {isRtl ? 'اسم المستخدم الجديد' : 'New Username'}
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={isRtl ? 'اترك فارغاً إذا لا تريد التغيير' : 'Leave empty to keep current'}
                  className={inputClasses}
                />
              </div>

              {/* Spacer for grid alignment */}
              <div className="hidden md:block" />

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">
                  {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRtl ? 'اترك فارغاً إذا لا تريد التغيير' : 'Leave empty to keep current'}
                    className={`${inputClasses} ${isRtl ? 'pl-12' : 'pr-12'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className={`absolute inset-y-0 ${isRtl ? 'left-4' : 'right-4'} flex items-center text-neutral-500 hover:text-neutral-300 transition-colors`}
                  >
                    {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 block">
                  {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isRtl ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                    className={`${inputClasses} ${isRtl ? 'pl-12' : 'pr-12'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className={`absolute inset-y-0 ${isRtl ? 'left-4' : 'right-4'} flex items-center text-neutral-500 hover:text-neutral-300 transition-colors`}
                  >
                    {showConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={credLoading}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{credLoading ? (isRtl ? 'جاري التحديث...' : 'Updating...') : (isRtl ? 'تحديث البيانات' : 'Update Credentials')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;

