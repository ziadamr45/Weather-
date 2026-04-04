'use client';

import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Settings, Globe, Thermometer, Wind, Bell, Moon, Info, ChevronLeft } from 'lucide-react';

export function SettingsPanel() {
  const { 
    temperatureUnit, 
    setTemperatureUnit, 
    speedUnit, 
    setSpeedUnit 
  } = useWeatherStore();
  const { t, language, setLanguage } = useI18n();
  
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">{t('settings.title')}</h3>
      </div>
      
      <div className="space-y-4">
        {/* Language */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white">{t('settings.language')}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('ar')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${language === 'ar' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                العربية
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${language === 'en' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
        
        {/* Temperature Unit */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-white">{t('settings.temperature')}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setTemperatureUnit('celsius')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${temperatureUnit === 'celsius' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                °C
              </button>
              <button
                onClick={() => setTemperatureUnit('fahrenheit')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${temperatureUnit === 'fahrenheit' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                °F
              </button>
            </div>
          </div>
        </div>
        
        {/* Wind Speed Unit */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Wind className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-white">{t('weather.windSpeed')}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSpeedUnit('kmh')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${speedUnit === 'kmh' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {t('unit.kmh')}
              </button>
              <button
                onClick={() => setSpeedUnit('mph')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${speedUnit === 'mph' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {t('unit.mph')}
              </button>
            </div>
          </div>
        </div>
        
        {/* App Info */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <div className="text-white font-medium">{t('app.name')}</div>
              <div className="text-xs text-white/50">{t('app.version')}</div>
            </div>
          </div>
          <div className="text-xs text-white/40">
            Powered by OpenWeatherMap API
          </div>
        </div>
      </div>
    </motion.div>
  );
}
