'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { getAQILevel } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { Wind, Droplets, AlertCircle } from 'lucide-react';

export function AirQualityCard() {
  const { airQuality } = useWeatherStore();
  const { t } = useI18n();
  
  if (!airQuality || !airQuality.list[0]) return null;
  
  const aqi = airQuality.list[0].main.aqi;
  const components = airQuality.list[0].components;
  const aqiInfo = getAQILevel(aqi);
  
  const aqiPercentage = (aqi / 5) * 100;
  
  // Calculate pollution percentages based on WHO guidelines
  const pm25Percent = Math.min((components.pm2_5 / 25) * 100, 100);
  const pm10Percent = Math.min((components.pm10 / 50) * 100, 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('aqi.title')}</h3>
        <span className="text-xs text-white/60 px-2 py-1 rounded-full bg-white/10">
          {t('aqi.today')}
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full circular-progress" viewBox="0 0 100 100">
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
              stroke={aqiInfo.color}
              strokeWidth="8"
              strokeDasharray={`${aqiPercentage * 2.83} 283`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{aqi * 20}</span>
          </div>
        </div>
        
        {/* AQI Level and Details */}
        <div className="flex-1 space-y-3">
          <div>
            <div 
              className="text-lg font-semibold mb-1"
              style={{ color: aqiInfo.color }}
            >
              {t(`aqi.${aqiInfo.level}`)}
            </div>
          </div>
          
          {/* PM2.5 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">{t('aqi.pm25')}</span>
              <span className="text-white">{components.pm2_5.toFixed(1)} µg/m³</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${pm25Percent}%`,
                  backgroundColor: aqiInfo.color 
                }}
              />
            </div>
          </div>
          
          {/* PM10 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">{t('aqi.pm10')}</span>
              <span className="text-white">{components.pm10.toFixed(1)} µg/m³</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${pm10Percent}%`,
                  backgroundColor: aqiInfo.color 
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Pollutants */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">O₃</div>
          <div className="text-sm text-white">{components.o3.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">NO₂</div>
          <div className="text-sm text-white">{components.no2.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">SO₂</div>
          <div className="text-sm text-white">{components.so2.toFixed(1)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50 mb-1">CO</div>
          <div className="text-sm text-white">{components.co.toFixed(1)}</div>
        </div>
      </div>
    </motion.div>
  );
}
