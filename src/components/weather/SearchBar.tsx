'use client';

import { useState, useEffect, useRef } from 'react';
import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import type { Location } from '@/lib/weather-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Star, Navigation, Clock } from 'lucide-react';

export function SearchBar() {
  const { setCurrentLocation, favorites, addFavorite, removeFavorite, isFavorite } = useWeatherStore();
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skypulse-recent');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (location: Location) => {
    setCurrentLocation(location);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    
    // Add to recent searches
    const newRecent = [location, ...recentSearches.filter(r => 
      r.lat !== location.lat || r.lon !== location.lon
    )].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('skypulse-recent', JSON.stringify(newRecent));
  };
  
  const handleGPS = () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode
        try {
          const res = await fetch(`/api/weather/geocode?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data[0]) {
              handleSelect(data[0]);
            }
          }
        } catch (error) {
          console.error('Geocode error:', error);
        }
      },
      (error) => {
        console.error('GPS error:', error);
      }
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : recentSearches;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };
  
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 ${language === 'ar' ? 'right-4' : 'left-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-full glass rounded-2xl py-3 px-12 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <button
          onClick={handleGPS}
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-cyan-500/30 transition-colors ${language === 'ar' ? 'left-2' : 'right-2'}`}
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full glass-strong rounded-2xl overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="p-4 text-center text-white/50">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((location, index) => (
                  <LocationItem
                    key={`${location.lat}-${location.lon}`}
                    location={location}
                    isSelected={index === selectedIndex}
                    onSelect={() => handleSelect(location)}
                    language={language}
                  />
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-white/50">
                {t('search.noResults')}
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('search.recent')}
                </div>
                {recentSearches.map((location, index) => (
                  <LocationItem
                    key={`${location.lat}-${location.lon}`}
                    location={location}
                    isSelected={index === selectedIndex}
                    onSelect={() => handleSelect(location)}
                    language={language}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationItem({ 
  location, 
  isSelected, 
  onSelect, 
  language 
}: { 
  location: Location; 
  isSelected: boolean;
  onSelect: () => void;
  language: string;
}) {
  const { addFavorite, removeFavorite, isFavorite } = useWeatherStore();
  const isFav = isFavorite(location);
  
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
        ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-4 h-4 text-cyan-400" />
        <div>
          <div className="text-white font-medium">
            {location.local_names?.[language] || location.name}
          </div>
          <div className="text-xs text-white/50">
            {location.state ? `${location.state}, ` : ''}{location.country}
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isFav) {
            removeFavorite(location);
          } else {
            addFavorite(location);
          }
        }}
        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
      >
        <Star className={`w-4 h-4 ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} />
      </button>
    </div>
  );
}
