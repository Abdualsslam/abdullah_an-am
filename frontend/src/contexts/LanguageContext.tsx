import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

type TranslationKey =
  | 'home'
  | 'brand'
  | 'companyProfile'
  | 'socialMedia'
  | 'portfolio'
  | 'work'
  | 'contact'
  | 'graphicDesigner'
  | 'name'
  | 'nameAr'
  | 'chooseCategory'
  | 'gallery'
  | 'switchLang'
  | 'dashboard'
  | 'login'
  | 'logout'
  | 'username'
  | 'password'
  | 'submitting'
  | 'categories'
  | 'projects'
  | 'settings'
  | 'analytics'
  | 'addCategory'
  | 'addProject'
  | 'edit'
  | 'delete'
  | 'save'
  | 'cancel'
  | 'titleAr'
  | 'titleEn'
  | 'descAr'
  | 'descEn'
  | 'key'
  | 'icon'
  | 'href'
  | 'order'
  | 'mainImage'
  | 'additionalImages'
  | 'back'
  | 'noProjects'
  | 'loading'
  | 'totalViews'
  | 'uniqueVisitors'
  | 'viewsByPath'
  | 'whatsapp'
  | 'instagram'
  | 'siteSettings'
  | 'reorder';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    home: 'Home',
    brand: 'Branding & Logos',
    companyProfile: 'Company Profiles',
    socialMedia: 'Social Media Designs',
    portfolio: 'Portfolio',
    work: 'Contact',
    contact: 'Contact',
    graphicDesigner: 'Graphic Designer',
    name: 'Ahmed',
    nameAr: 'أحمد',
    chooseCategory: 'Choose a category to view my work',
    gallery: 'Gallery',
    switchLang: 'عربي',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    submitting: 'Submitting...',
    categories: 'Categories',
    projects: 'Projects',
    settings: 'Settings',
    analytics: 'Analytics',
    addCategory: 'Add Category',
    addProject: 'Add Project',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    titleAr: 'Title (Arabic)',
    titleEn: 'Title (English)',
    descAr: 'Description (Arabic)',
    descEn: 'Description (English)',
    key: 'Key',
    icon: 'Icon Name (Lucide)',
    href: 'URL Path',
    order: 'Order',
    mainImage: 'Cover Image / Video',
    additionalImages: 'Additional Images / Videos',
    back: 'Back',
    noProjects: 'No projects in this category.',
    loading: 'Loading...',
    totalViews: 'Total Page Views',
    uniqueVisitors: 'Unique Visitors',
    viewsByPath: 'Views by Page',
    whatsapp: 'WhatsApp Number',
    instagram: 'Instagram Username',
    siteSettings: 'Site Settings',
    reorder: 'Reorder'
  },
  ar: {
    home: 'الرئيسية',
    brand: 'الهويات والشعارات',
    companyProfile: 'ملفات الشركات',
    socialMedia: 'تصاميم السوشيال ميديا',
    portfolio: 'معرض الأعمال',
    work: 'تواصل',
    contact: 'اتصال',
    graphicDesigner: 'مصمم جرافيك',
    name: 'أحمد',
    nameAr: 'أحمد',
    chooseCategory: 'اختر القسم الذي تود مشاهدة أعمالي فيه',
    gallery: 'معرض الصور',
    switchLang: 'English',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    submitting: 'جاري الإرسال...',
    categories: 'الأقسام',
    projects: 'المشاريع',
    settings: 'الإعدادات',
    analytics: 'الإحصائيات',
    addCategory: 'إضافة قسم',
    addProject: 'إضافة مشروع',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    titleAr: 'العنوان (بالعربية)',
    titleEn: 'العنوان (بالإنجليزية)',
    descAr: 'الوصف (بالعربية)',
    descEn: 'الوصف (بالإنجليزية)',
    key: 'المفتاح المميز (Key)',
    icon: 'اسم الأيقونة (Lucide)',
    href: 'مسار الرابط',
    order: 'الترتيب',
    mainImage: 'صورة الغلاف / الفيديو الرئيسية',
    additionalImages: 'صور وفيديوهات إضافية',
    back: 'رجوع',
    noProjects: 'لا توجد مشاريع في هذا القسم.',
    loading: 'جاري التحميل...',
    totalViews: 'إجمالي المشاهدات',
    uniqueVisitors: 'الزوار الفريدين',
    viewsByPath: 'المشاهدات حسب الصفحة',
    whatsapp: 'رقم الواتساب',
    instagram: 'حساب الإنستغرام',
    siteSettings: 'إعدادات الموقع العامة',
    reorder: 'إعادة الترتيب'
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
