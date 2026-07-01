import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Image, FolderOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalyticsStats } from '../types';
import api from '../services/api';

const AnalyticsPanel: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching analytics stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-neutral-400">{t('loading')}</div>;
  }

  if (!stats) {
    return <div className="text-neutral-400">Failed to load analytics data.</div>;
  }

  // Cards layout
  const cards = [
    { label: t('totalViews'), value: stats.totalViews, icon: BarChart3, color: 'text-blue-400' },
    { label: t('uniqueVisitors'), value: stats.uniqueVisitors, icon: Users, color: 'text-emerald-400' },
    { label: isRtl ? 'إجمالي المشاريع' : 'Total Projects', value: stats.totalProjects, icon: Image, color: 'text-purple-400' },
    { label: isRtl ? 'إجمالي الأقسام' : 'Total Categories', value: stats.totalCategories, icon: FolderOpen, color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('analytics')}</h1>
        <p className="text-neutral-400 text-sm">
          {isRtl ? 'متابعة أداء موقعك والزيارات' : 'Monitor your website performance and traffic'}
        </p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <span className="text-sm text-neutral-400 font-medium">{card.label}</span>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Views Details & Path breakdown */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl shadow-lg space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">{t('viewsByPath')}</h2>
          
          <div className="space-y-4">
            {stats.viewsByPath.map((item, idx) => {
              // Calculate percent for progress bar
              const maxCount = stats.viewsByPath[0]?.count || 1;
              const percent = Math.round((item.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-300">
                    <span className="font-mono">{item._id}</span>
                    <span className="font-bold">{item.count} {isRtl ? 'زيارة' : 'views'}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            {stats.viewsByPath.length === 0 && (
              <div className="text-center text-neutral-500 py-4">
                {isRtl ? 'لا توجد بيانات زيارات مسجلة بعد.' : 'No page view data recorded yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
