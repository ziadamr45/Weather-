'use client';

import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Home, BarChart3, Map, Star, Settings, Bell, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();
  
  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'forecast', icon: BarChart3, label: t('nav.forecast') },
    { id: 'map', icon: Map, label: t('nav.map') },
    { id: 'favorites', icon: Star, label: t('nav.favorites') },
    { id: 'settings', icon: Settings, label: t('nav.settings') },
  ];
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="glass-strong rounded-t-3xl">
        <div className="flex items-center justify-around py-2 px-4 safe-area-inset-bottom">
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="relative flex flex-col items-center py-2 px-4"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-12 h-1 rounded-full bg-cyan-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 mb-1 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-white/50'
                }`} />
                <span className={`text-xs transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-white/50'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
