import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, FolderKanban, FileSpreadsheet, Settings, LogOut, BarChart3 } from 'lucide-react';

// Subcomponents (we will create these files next)
import AnalyticsPanel from './AnalyticsPanel';
import CategoriesPanel from './CategoriesPanel';
import ProjectsPanel from './ProjectsPanel';
import SettingsPanel from './SettingsPanel';

type ActiveTab = 'analytics' | 'categories' | 'projects' | 'settings';

const Dashboard: React.FC = () => {
  const { logout, isAuthenticated, loading } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-400">
        {t('loading')}
      </div>
    );
  }

  const menuItems = [
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'categories', label: t('categories'), icon: FolderKanban },
    { id: 'projects', label: t('projects'), icon: FileSpreadsheet },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsPanel />;
      case 'categories':
        return <CategoriesPanel />;
      case 'projects':
        return <ProjectsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AnalyticsPanel />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050505] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white leading-tight">
                {isRtl ? 'لوحة التحكم' : 'Admin Panel'}
              </h2>
              <span className="text-xs text-neutral-500">
                {isRtl ? 'أهلاً بك يا أحمد' : "Welcome Ahmed"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${isActive
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="pt-6 border-t border-white/10 mt-6 md:mt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 stroke-[1.5]" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl overflow-y-auto">
        {renderActivePanel()}
      </main>
    </div>
  );
};

export default Dashboard;
