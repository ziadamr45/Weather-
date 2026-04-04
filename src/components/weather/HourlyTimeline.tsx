'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n, formatTime } from '@/lib/i18n';
import { getWeatherIconSmall } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useRef, useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';

export function HourlyTimeline() {
  const { forecast, formatTemperature } = useWeatherStore();
  const { t, language } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Get next 24 hours of forecast
  const hourlyData = forecast?.list.slice(0, 8) || [];
  
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);
  
  if (!hourlyData.length) return null;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('weather.hourly')}</h3>
        <span className="text-sm text-white/60">24 {t('time.hours')}</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1"
      >
        {hourlyData.map((item, index) => {
          const time = new Date(item.dt * 1000);
          const hour = time.getHours();
          const isNow = isToday(time) && hour === currentHour;
          
          return (
            <motion.div
              key={item.dt}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex flex-col items-center min-w-[60px] p-3 rounded-xl transition-all
                ${isNow 
                  ? 'bg-cyan-500/20 border border-cyan-500/30' 
                  : 'bg-white/5 hover:bg-white/10'}`}
            >
              <span className={`text-xs mb-1 ${isNow ? 'text-cyan-400 font-medium' : 'text-white/60'}`}>
                {isNow ? t('time.now') : format(time, 'HH:mm')}
              </span>
              
              <img
                src={getWeatherIconSmall(item.weather[0].icon)}
                alt={item.weather[0].description}
                className="w-10 h-10 my-1"
              />
              
              <span className="text-base font-semibold text-white">
                {formatTemperature(item.main.temp)}
              </span>
              
              {item.pop > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400">{Math.round(item.pop * 100)}%</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Scroll indicators */}
      {canScrollLeft && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
}
