'use client';

import { useWeatherStore, generateRecommendations } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { AlertTriangle, Umbrella, Sun, Wind, Thermometer, Droplets, Shield, Info } from 'lucide-react';

export function WeatherAlerts() {
  const { currentWeather, airQuality } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!currentWeather) return null;
  
  const alerts: { type: string; icon: typeof AlertTriangle; message: string; severity: 'warning' | 'info' | 'danger' }[] = [];
  
  // Check for rain
  const weatherMain = currentWeather.weather[0]?.main;
  const pop = currentWeather.rain?.['1h'] ? 0.8 : 0.2;
  
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain)) {
    alerts.push({
      type: 'rain',
      icon: Umbrella,
      message: t('alerts.carryUmbrella'),
      severity: 'info'
    });
  }
  
  // Check for high UV
  const hour = new Date().getHours();
  const isDaytime = hour >= 10 && hour <= 16;
  if (weatherMain === 'Clear' && isDaytime) {
    alerts.push({
      type: 'uv',
      icon: Sun,
      message: t('alerts.useSunscreen'),
      severity: 'warning'
    });
  }
  
  // Check for high temperature
  if (currentWeather.main.temp > 35) {
    alerts.push({
      type: 'heat',
      icon: Thermometer,
      message: t('alerts.stayHydrated'),
      severity: 'danger'
    });
  }
  
  // Check for strong wind
  if (currentWeather.wind.speed > 10) {
    alerts.push({
      type: 'wind',
      icon: Wind,
      message: language === 'ar' 
        ? 'احذر من الرياح القوية' 
        : 'Strong winds expected',
      severity: 'warning'
    });
  }
  
  // Check for poor air quality
  if (airQuality?.list[0]?.main.aqi && airQuality.list[0].main.aqi >= 3) {
    alerts.push({
      type: 'aqi',
      icon: Shield,
      message: t('alerts.limitOutdoor'),
      severity: 'danger'
    });
  }
  
  // Check for low temperature
  if (currentWeather.main.temp < 5) {
    alerts.push({
      type: 'cold',
      icon: Thermometer,
      message: language === 'ar'
        ? 'ارتدِ ملابس دافئة'
        : 'Wear warm clothes',
      severity: 'warning'
    });
  }
  
  if (alerts.length === 0) {
    alerts.push({
      type: 'good',
      icon: Info,
      message: language === 'ar'
        ? 'الطقس مناسب للأنشطة الخارجية'
        : 'Weather is suitable for outdoor activities',
      severity: 'info'
    });
  }
  
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-red-500/20 border-red-500/30';
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/30';
      default:
        return 'bg-cyan-500/20 border-cyan-500/30';
    }
  };
  
  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-cyan-400';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('alerts.title')}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
          {alerts.length} {language === 'ar' ? 'تنبيه' : 'alerts'}
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          
          return (
            <motion.div
              key={alert.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getSeverityStyles(alert.severity)}`}
            >
              <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${getIconColor(alert.severity)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-white">{alert.message}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
