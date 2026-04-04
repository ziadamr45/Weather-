'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import type { Location } from '@/lib/weather-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Trash2, Cloud, Sun, CloudRain } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FavoriteLocation extends Location {
  temp?: number;
  condition?: string;
  icon?: string;
}

export function FavoritesPanel() {
  const { favorites, removeFavorite, setCurrentLocation, currentLocation } = useWeatherStore();
  const { t, language } = useI18n();
  const [favoritesWithWeather, setFavoritesWithWeather] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWeatherForFavorites = async () => {
      if (favorites.length === 0) {
        setFavoritesWithWeather([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const updatedFavorites = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const res = await fetch(`/api/weather/current?lat=${fav.lat}&lon=${fav.lon}`);
            if (res.ok) {
              const data = await res.json();
              return {
                ...fav,
                temp: Math.round(data.main.temp),
                condition: data.weather[0].main,
                icon: data.weather[0].icon
              };
            }
          } catch (error) {
            console.error('Error fetching weather for favorite:', error);
          }
          return fav;
        })
      );
      
      setFavoritesWithWeather(updatedFavorites);
      setLoading(false);
    };
    
    fetchWeatherForFavorites();
  }, [favorites]);
  
  const handleSelect = (location: FavoriteLocation) => {
    setCurrentLocation(location);
  };
  
  const handleRemove = (e: React.MouseEvent, location: Location) => {
    e.stopPropagation();
    removeFavorite(location);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">{t('favorites.title')}</h3>
        </div>
        <span className="text-sm text-white/60">{favorites.length} {language === 'ar' ? 'مدن' : 'cities'}</span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favoritesWithWeather.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 mx-auto text-white/20 mb-3" />
          <p className="text-white/50">{t('favorites.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {favoritesWithWeather.map((location, index) => (
              <motion.div
                key={`${location.lat}-${location.lon}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(location)}
                className={`relative p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]
                  ${currentLocation?.lat === location.lat && currentLocation?.lon === location.lon
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-white/5 hover:bg-white/10'}`}
              >
                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(e, location)}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-white/50 hover:text-red-400" />
                </button>
                
                <div className="text-center">
                  {/* Weather icon */}
                  {location.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${location.icon}@2x.png`}
                      alt={location.condition}
                      className="w-12 h-12 mx-auto -my-2"
                    />
                  )}
                  
                  {/* Temperature */}
                  {location.temp !== undefined && (
                    <div className="text-2xl font-bold text-white">
                      {location.temp}°
                    </div>
                  )}
                  
                  {/* City name */}
                  <div className="text-sm font-medium text-white mt-1">
                    {location.local_names?.[language] || location.name}
                  </div>
                  
                  {/* Country */}
                  <div className="text-xs text-white/50">
                    {location.country}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
