export interface Category {
  _id: string;
  name_ar: string;
  name_en: string;
  key: string;
  icon: string;
  href: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  title_ar: string;
  title_en: string;
  category: string;
  main_image: string;
  images: string[];
  description_ar: string;
  description_en: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  whatsapp: string;
  instagram: string;
  name_ar: string;
  name_en: string;
  title_ar: string;
  title_en: string;
  portfolioCategoriesOrder?: string[];
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  totalProjects: number;
  totalCategories: number;
  viewsByPath: Array<{ _id: string; count: number }>;
  dailyViews: Array<{ _id: string; count: number }>;
}
