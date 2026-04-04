'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { getWindDirection, getWindDirectionArabic } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { Compass, Wind } from 'lucide-react';

export function WindCompass() {
  const { currentWeather, speedUnit, convertSpeed } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!currentWeather) return null;
  
  const windDeg = currentWeather.wind.deg;
  const windSpeed = currentWeather.wind.speed;
  const windGust = currentWeather.wind.gust || windSpeed;
  
  const direction = language === 'ar' 
    ? getWindDirectionArabic(windDeg) 
    : getWindDirection(windDeg);
  
  const speed = convertSpeed(windSpeed);
  const gust = convertSpeed(windGust);
  
  // Compass directions
  const directions = language === 'ar' 
    ? ['ش', 'ش غ', 'غ', 'ج غ', 'ج', 'ج ش', 'ش', 'ش ج']
    : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">{t('weather.wind')}</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Compass */}
        <div className="relative w-28 h-28 flex-shrink-0">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          
          {/* Direction markers */}
          {directions.map((dir, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const x = 50 + 42 * Math.cos(angle);
            const y = 50 + 42 * Math.sin(angle);
            const isMain = i % 2 === 0;
            
            return (
              <div
                key={i}
                className={`absolute text-xs ${isMain ? 'text-white font-medium' : 'text-white/50'}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {dir}
              </div>
            );
          })}
          
          {/* Wind arrow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: windDeg }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{ rotate: windDeg }}
          >
            <div className="relative">
              <div className="w-1 h-12 bg-gradient-to-t from-cyan-400 to-cyan-500 rounded-full" />
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 
                  border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-cyan-400"
              />
            </div>
          </motion.div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
          </div>
        </div>
        
        {/* Wind Details */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-sm text-white/60 mb-1">{t('weather.windDirection')}</div>
            <div className="text-xl font-semibold text-white">{direction}</div>
          </div>
          
          <div>
            <div className="text-sm text-white/60 mb-1">{t('weather.windSpeed')}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{speed}</span>
              <span className="text-sm text-white/60">
                {speedUnit === 'kmh' ? t('unit.kmh') : t('unit.mph')}
              </span>
            </div>
          </div>
          
          {currentWeather.wind.gust && (
            <div>
              <div className="text-sm text-white/60 mb-1">Gusts</div>
              <div className="text-lg font-semibold text-cyan-400">{gust} {speedUnit === 'kmh' ? t('unit.kmh') : t('unit.mph')}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Beaufort Scale Visualization */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">Wind Strength</span>
          <span className="text-xs text-white/70">
            {windSpeed < 1 ? 'Calm' : 
             windSpeed < 5 ? 'Light' :
             windSpeed < 10 ? 'Moderate' :
             windSpeed < 15 ? 'Fresh' : 'Strong'}
          </span>
        </div>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < (windSpeed / 3) 
                  ? i < 3 ? 'bg-green-500' 
                    : i < 6 ? 'bg-yellow-500' 
                    : i < 8 ? 'bg-orange-500' 
                    : 'bg-red-500'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
