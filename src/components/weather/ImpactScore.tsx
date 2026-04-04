'use client';

import { useWeatherStore, calculateImpactScore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Activity, Plane, Bike, Footprints, Sun, CloudRain, Wind } from 'lucide-react';

export function ImpactScore() {
  const { currentWeather, airQuality } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!currentWeather) return null;
  
  const baseScore = calculateImpactScore(currentWeather);
  
  const activities = [
    { id: 'outdoor', icon: Activity, label: t('impact.outdoor'), base: 100 },
    { id: 'travel', icon: Plane, label: t('impact.travel'), base: 100 },
    { id: 'sports', icon: Bike, label: t('impact.sports'), base: 100 },
    { id: 'walking', icon: Footprints, label: t('impact.walking'), base: 100 },
  ];
  
  const calculateActivityScore = (activityId: string) => {
    let score = baseScore;
    const weatherMain = currentWeather.weather[0].main;
    const windSpeed = currentWeather.wind.speed;
    const temp = currentWeather.main.temp;
    
    // Adjust based on activity type
    switch (activityId) {
      case 'outdoor':
        if (['Rain', 'Thunderstorm', 'Snow'].includes(weatherMain)) score -= 30;
        if (windSpeed > 10) score -= 15;
        break;
      case 'travel':
        if (['Thunderstorm', 'Snow', 'Sand', 'Dust'].includes(weatherMain)) score -= 25;
        if (windSpeed > 15) score -= 20;
        if (currentWeather.visibility < 5000) score -= 15;
        break;
      case 'sports':
        if (['Rain', 'Thunderstorm', 'Snow'].includes(weatherMain)) score -= 40;
        if (temp > 35 || temp < 5) score -= 20;
        if (windSpeed > 10) score -= 10;
        break;
      case 'walking':
        if (['Rain', 'Thunderstorm', 'Snow'].includes(weatherMain)) score -= 25;
        if (temp > 38 || temp < 0) score -= 15;
        break;
    }
    
    // Air quality adjustment
    if (airQuality?.list[0]?.main.aqi && airQuality.list[0].main.aqi >= 3) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 70) return t('impact.excellent');
    if (score >= 50) return t('impact.good');
    if (score >= 30) return t('impact.moderate');
    return t('impact.poor');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('impact.title')}</h3>
        <div className="text-sm text-white/60">
          {language === 'ar' ? 'الملاءمة' : 'Suitability'}
        </div>
      </div>
      
      {/* Overall score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full circular-progress" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={getScoreColor(baseScore)}
              strokeWidth="10"
              strokeDasharray={`${baseScore * 2.83} 283`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{baseScore}</span>
            <span className="text-xs text-white/60">{getScoreLabel(baseScore)}</span>
          </div>
        </div>
      </div>
      
      {/* Activity scores */}
      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const score = calculateActivityScore(activity.id);
          
          return (
            <div
              key={activity.id}
              className="p-3 rounded-xl bg-white/5 flex items-center gap-3"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getScoreColor(score)}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: getScoreColor(score) }} />
              </div>
              
              <div className="flex-1">
                <div className="text-sm text-white/70">{activity.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-white">{score}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
