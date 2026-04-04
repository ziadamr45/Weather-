'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { getUVLevel } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { Sun, Shield, AlertTriangle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function UVIndexCard() {
  const { currentWeather, currentLocation } = useWeatherStore();
  const { t } = useI18n();
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUV = async () => {
      if (!currentLocation) return;
      
      try {
        const res = await fetch(`/api/weather/uv?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
        if (res.ok) {
          const data = await res.json();
          setUvIndex(data.value);
        }
      } catch (error) {
        console.error('Failed to fetch UV index:', error);
        // Estimate UV based on time and weather
        const hour = new Date().getHours();
        const isDaytime = hour >= 10 && hour <= 16;
        const isClear = currentWeather?.weather[0]?.main === 'Clear';
        setUvIndex(isDaytime && isClear ? 7 : isDaytime ? 4 : 1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUV();
  }, [currentLocation, currentWeather]);
  
  // Estimate UV if not fetched
  useEffect(() => {
    if (uvIndex === null && currentWeather) {
      const hour = new Date().getHours();
      const isDaytime = hour >= 10 && hour <= 16;
      const weatherMain = currentWeather.weather[0]?.main;
      
      let estimatedUV = 1;
      if (isDaytime) {
        if (weatherMain === 'Clear') estimatedUV = 8;
        else if (weatherMain === 'Clouds') estimatedUV = 5;
        else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') estimatedUV = 2;
        else estimatedUV = 4;
      }
      
      setUvIndex(estimatedUV);
      setLoading(false);
    }
  }, [currentWeather, uvIndex]);
  
  if (!uvIndex) return null;
  
  const uvInfo = getUVLevel(uvIndex);
  const uvPercentage = (uvIndex / 11) * 100;
  
  const getProtectionAdvice = () => {
    if (uvIndex <= 2) return t('alerts.limitOutdoor');
    if (uvIndex <= 5) return t('alerts.useSunscreen');
    if (uvIndex <= 7) return t('alerts.useSunscreen');
    if (uvIndex <= 10) return t('alerts.limitOutdoor');
    return t('rec.indoor');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">{t('weather.uvIndex')}</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full circular-progress" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="33%" stopColor="#eab308" />
                <stop offset="66%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#uvGradient)"
              strokeWidth="8"
              strokeDasharray={`${uvPercentage * 2.83} 283`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{uvIndex}</span>
          </div>
        </div>
        
        {/* UV Level and Advice */}
        <div className="flex-1">
          <div 
            className="text-xl font-semibold mb-2"
            style={{ color: uvInfo.color }}
          >
            {t(`weather.uv${uvInfo.level.charAt(0).toUpperCase() + uvInfo.level.slice(1)}`)}
          </div>
          
          <div className="flex items-start gap-2 text-sm text-white/70">
            <Shield className="w-4 h-4 mt-0.5 text-cyan-400" />
            <span>{getProtectionAdvice()}</span>
          </div>
          
          {/* UV Scale */}
          <div className="mt-3">
            <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500">
              <div 
                className="relative w-3 h-3 -mt-0.5 rounded-full bg-white border-2 shadow-lg"
                style={{ 
                  marginLeft: `calc(${uvPercentage}% - 6px)`,
                  borderColor: uvInfo.color 
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-white/50">
              <span>0</span>
              <span>11+</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Protection times */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="w-4 h-4" />
          <span>10:00 - 16:00</span>
        </div>
        <div className="flex items-center gap-1">
          {uvIndex >= 6 && (
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          )}
          <span className="text-sm text-white/70">
            {uvIndex >= 6 ? t('alerts.uvWarning') : t('weather.uvLow')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
