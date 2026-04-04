'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Star, Bell, Search, X } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from '@/components/weather/SearchBar';

export function Header() {
  const { currentLocation, favorites, addFavorite, removeFavorite, isFavorite, currentWeather } = useWeatherStore();
  const { t, language, setLanguage } = useI18n();
  const [showSearch, setShowSearch] = useState(false);
  
  const locationFavorite = currentLocation ? isFavorite(currentLocation) : false;
  
  const handleFavorite = () => {
    if (currentLocation) {
      if (locationFavorite) {
        removeFavorite(currentLocation);
      } else {
        addFavorite(currentLocation);
      }
    }
  };
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 glass"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <span className="text-xl">🌤️</span>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">{t('app.name')}</h1>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          
          {/* Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          
          {/* Favorite */}
          {currentLocation && (
            <button
              onClick={handleFavorite}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Star className={`w-5 h-5 ${locationFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </button>
          )}
          
          {/* Notifications */}
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative">
            <Bell className="w-5 h-5" />
            {/* Notification dot */}
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      {showSearch && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          <SearchBar />
        </motion.div>
      )}
    </motion.header>
  );
}
