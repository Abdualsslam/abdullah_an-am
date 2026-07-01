import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LuLock as Lock, LuUser as User, LuKeyRound as KeyRound } from 'react-icons/lu';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t, isRtl } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }

    const checkSetupStatus = async () => {
      try {
        const response = await api.get('/auth/check-setup');
        setIsSetupRequired(response.data.isSetupRequired);
      } catch (err) {
        console.error('Error checking setup status:', err);
      }
    };
    checkSetupStatus();
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isSetupRequired ? '/auth/setup' : '/auth/login';

    try {
      const response = await api.post(endpoint, { username, password });
      login(response.data.token, response.data.username);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-[80vh] px-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative subtle top gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
            {isSetupRequired ? <KeyRound className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {isSetupRequired 
              ? (isRtl ? 'إعداد لوحة التحكم (المرة الأولى)' : 'Admin Panel Setup (First Time)')
              : (isRtl ? 'لوحة التحكم - تسجيل الدخول' : 'Admin Login')
            }
          </h2>
          <p className="text-neutral-400 text-sm text-center">
            {isSetupRequired 
              ? (isRtl ? 'أنشئ حساب المسؤول للبدء في إدارة موقعك' : 'Create the admin account to start managing your site')
              : (isRtl ? 'الرجاء إدخال بيانات الاعتماد للوصول للوحة التحكم' : 'Please enter credentials to access dashboard')
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 block">{t('username')}</label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-neutral-500`}>
                <User className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRtl ? 'أدخل اسم المستخدم' : 'Enter username'}
                className={`w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 block">{t('password')}</label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-neutral-500`}>
                <Lock className="w-5 h-5 stroke-[1.5]" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRtl ? 'أدخل كلمة المرور' : 'Enter password'}
                className={`w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-neutral-200 transition-colors active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('submitting') : (isSetupRequired ? (isRtl ? 'إنشاء حساب والبدء' : 'Create Account & Begin') : t('login'))}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
