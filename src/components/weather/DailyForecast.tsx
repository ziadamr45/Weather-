'use client';

import { useWeatherStore, calculateImpactScore } from '@/lib/weather-store';
import { useI18n, getDayName } from '@/lib/i18n';
import { getWeatherIconSmall, getWeatherBackground } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function DailyForecast() {
  const { forecast, formatTemperature } = useWeatherStore();
  const { t, language } = useI18n();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  if (!forecast) return null;
  
  // Group forecast by day
  const dailyData = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof forecast.list>);
  
  const days = Object.entries(dailyData).slice(0, 7);
  const today = new Date().toDateString();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('weather.weekly')}</h3>
        <span className="text-sm text-cyan-400">{days.length} {t('time.days')}</span>
      </div>
      
      <div className="space-y-2">
        {days.map(([dateStr, items], index) => {
          const date = new Date(dateStr);
          const isToday = dateStr === today;
          const minTemp = Math.min(...items.map(i => i.main.temp_min));
          const maxTemp = Math.max(...items.map(i => i.main.temp_max));
          const dominantWeather = items.reduce((prev, curr) => 
            prev.pop > curr.pop ? prev : curr
          ).weather[0];
          const totalPop = items.reduce((sum, i) => sum + i.pop, 0) / items.length;
          const isExpanded = expandedDay === index;
          
          return (
            <div key={dateStr}>
              <motion.div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                  ${isToday ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-white/5'}`}
                onClick={() => setExpandedDay(isExpanded ? null : index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16">
                    <div className={`text-sm font-medium ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                      {isToday ? t('time.today') : getDayName(date, language)}
                    </div>
                    <div className="text-xs text-white/50">
                      {format(date, 'd MMM', { locale: language === 'ar' ? ar : enUS })}
                    </div>
                  </div>
                  
                  <img
                    src={getWeatherIconSmall(dominantWeather.icon)}
                    alt={dominantWeather.description}
                    className="w-10 h-10"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  {totalPop > 0.1 && (
                    <div className="text-xs text-cyan-400">
                      {Math.round(totalPop * 100)}%
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">{formatTemperature(minTemp)}</span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-purple-400"
                        style={{
                          marginLeft: `${((minTemp - 10) / 30) * 100}%`,
                          width: `${((maxTemp - minTemp) / 30) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-white">{formatTemperature(maxTemp)}</span>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  )}
                </div>
              </motion.div>
              
              {/* Expanded hourly view */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-x-auto hide-scrollbar"
                >
                  <div className="flex gap-3 p-3 mt-2 bg-white/5 rounded-xl">
                    {items.slice(0, 8).map((item, i) => (
                      <div key={i} className="flex flex-col items-center min-w-[50px]">
                        <span className="text-xs text-white/60">
                          {format(new Date(item.dt * 1000), 'HH:mm')}
                        </span>
                        <img
                          src={getWeatherIconSmall(item.weather[0].icon)}
                          alt={item.weather[0].description}
                          className="w-8 h-8 my-1"
                        />
                        <span className="text-sm text-white">
                          {formatTemperature(item.main.temp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
