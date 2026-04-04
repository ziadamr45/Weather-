'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeatherStore } from '@/lib/weather-store';
import { useI18n, formatTime, getDayName } from '@/lib/i18n';
import type { Location } from '@/lib/weather-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  MapPin, 
  Star, 
  Settings, 
  Search, 
  Bell, 
  Star as StarIcon,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Thermometer,
  Sun,
  Sunrise,
  Sunset,
  CloudRain,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Loader2,
  Navigation,
  Clock,
  Globe,
  Trash2,
  Shield,
  Umbrella,
  Info
} from 'lucide-react';

// ============ MAIN PAGE ============
export default function HomePage() {
  const {
    currentLocation,
    setCurrentLocation,
    currentWeather,
    setCurrentWeather,
    forecast,
    setForecast,
    airQuality,
    setAirQuality,
    isLoading,
    setIsLoading,
    error,
    setError,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    temperatureUnit,
    speedUnit
  } = useWeatherStore();
  
  const { t, language, setLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState('home');
  const [initialLoad, setInitialLoad] = useState(true);
  
  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [currentRes, forecastRes, aqiRes] = await Promise.all([
        fetch(`/api/weather/current?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/air-quality?lat=${lat}&lon=${lon}`)
      ]);
      
      if (currentRes.ok) setCurrentWeather(await currentRes.json());
      if (forecastRes.ok) setForecast(await forecastRes.json());
      if (aqiRes.ok) setAirQuality(await aqiRes.json());
    } catch (err) {
      setError(t('error.fetch'));
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, []);
  
  useEffect(() => {
    const initLocation = async () => {
      const saved = localStorage.getItem('skypulse-weather');
      if (saved?.state?.currentLocation) {
        setCurrentLocation(saved.state.currentLocation);
        fetchWeatherData(saved.state.currentLocation.lat, saved.state.currentLocation.lon);
        return;
      }
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(`/api/weather/geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
              if (res.ok) {
                const data = await res.json();
                if (data[0]) {
                  setCurrentLocation(data[0]);
                  fetchWeatherData(position.coords.latitude, position.coords.longitude);
                  return;
                }
              }
            } catch (e) {}
          },
          () => {}
        );
      }
      
      const defaultLoc = { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'IQ' };
      setCurrentLocation(defaultLoc);
      fetchWeatherData(defaultLoc.lat, defaultLoc.lon);
    };
    
    initLocation();
  }, []);
  
  useEffect(() => {
    if (currentLocation && !initialLoad) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon);
    }
  }, [currentLocation?.lat, currentLocation?.lon]);
  
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  
  if (initialLoad && isLoading) {
    return <LoadingScreen t={t} />;
  }
  
  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'forecast', icon: BarChart3, label: t('nav.forecast') },
    { id: 'map', icon: MapPin, label: t('nav.map') },
    { id: 'favorites', icon: Star, label: t('nav.favorites') },
    { id: 'settings', icon: Settings, label: t('nav.settings') },
  ];
  
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans">
      {/* Header */}
      <Header />
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeTab === 'home' && <HomeTab />}
              {activeTab === 'forecast' && <ForecastTab />}
              {activeTab === 'map' && <MapTab />}
              {activeTab === 'favorites' && <FavoritesTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* AI Assistant */}
      <AIAssistantButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// ============ LOADING SCREEN ============
function LoadingScreen({ t }: { t: (key: string) => string }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
          <span className="text-3xl">🌤️</span>
        </div>
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">SkyPulse</h1>
        <p className="text-gray-400 text-sm mb-4">{t('general.loading')}</p>
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </motion.div>
    </div>
  );
}

// ============ HEADER ============
function Header() {
  const { t, language, setLanguage } = useI18n();
  const { currentLocation, isFavorite, addFavorite, removeFavorite } = useWeatherStore();
  const [showSearch, setShowSearch] = useState(false);
  
  const isFav = currentLocation ? isFavorite(currentLocation) : false;
  
  return (
    <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <span className="text-lg">🌤️</span>
          </div>
          <span className="text-lg font-bold gradient-text">{t('app.name')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="w-8 h-8 rounded-full bg-white/10 text-xs text-white hover:bg-white/20">
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
          {currentLocation && (
            <button onClick={() => isFav ? removeFavorite(currentLocation) : addFavorite(currentLocation)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <StarIcon className={`w-4 h-4 ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </button>
          )}
          <button className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>
      </div>
      
      {showSearch && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-3">
          <SearchInput onClose={() => setShowSearch(false)} />
        </motion.div>
      )}
    </header>
  );
}

// ============ SEARCH INPUT ============
function SearchInput({ onClose }: { onClose: () => void }) {
  const { setCurrentLocation } = useWeatherStore();
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Location[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('skypulse-recent');
    if (saved) setRecent(JSON.parse(saved));
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
          if (res.ok) setResults(await res.json());
        } catch (e) {}
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  const handleSelect = (loc: Location) => {
    setCurrentLocation(loc);
    onClose();
    const newRecent = [loc, ...recent.filter(r => r.lat !== loc.lat || r.lon !== loc.lon)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem('skypulse-recent', JSON.stringify(newRecent));
  };
  
  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const res = await fetch(`/api/weather/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      if (res.ok) {
        const data = await res.json();
        if (data[0]) handleSelect(data[0]);
      }
    });
  };
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#1E293B] rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <button onClick={handleGPS} className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
      
      {(results.length > 0 || (query.length < 2 && recent.length > 0)) && (
        <div className="absolute top-full mt-2 w-full bg-[#1E293B] rounded-xl overflow-hidden z-50">
          {results.length > 0 ? results.map((loc, i) => (
            <button key={i} onClick={() => handleSelect(loc)} className="w-full px-3 py-2 text-right hover:bg-white/5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-white text-sm">{loc.local_names?.[language] || loc.name}</div>
                <div className="text-gray-500 text-xs">{loc.country}</div>
              </div>
            </button>
          )) : recent.map((loc, i) => (
            <button key={i} onClick={() => handleSelect(loc)} className="w-full px-3 py-2 text-right hover:bg-white/5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-white text-sm">{loc.local_names?.[language] || loc.name}</div>
                <div className="text-gray-500 text-xs">{loc.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ BOTTOM NAVIGATION ============
function BottomNavigation({ tabs, activeTab, setActiveTab }: { tabs: any[], activeTab: string, setActiveTab: (t: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-lg border-t border-white/5 z-40">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} className="flex flex-col items-center py-1 px-3">
            <Icon className={`w-5 h-5 ${activeTab === id ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className={`text-[10px] mt-0.5 ${activeTab === id ? 'text-cyan-400' : 'text-gray-500'}`}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============ HOME TAB ============
function HomeTab() {
  return (
    <div className="space-y-4">
      <WeatherHeroCard />
      <HourlyForecast />
      <div className="grid grid-cols-2 gap-3">
        <AirQualityCard />
        <UVIndexCard />
      </div>
      <WeatherAlerts />
      <WeeklyForecast />
      <ImpactScoreCard />
    </div>
  );
}

// ============ WEATHER HERO CARD ============
function WeatherHeroCard() {
  const { currentWeather, currentLocation, temperatureUnit } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!currentWeather) return null;
  
  const formatTemp = (c: number) => temperatureUnit === 'fahrenheit' ? Math.round((c * 9/5) + 32) : Math.round(c);
  const weatherMain = currentWeather.weather[0];
  const isNight = currentWeather.sys.sunrise > Date.now() / 1000 || currentWeather.sys.sunset < Date.now() / 1000;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] p-5">
      {/* Location */}
      <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
        <MapPin className="w-3.5 h-3.5" />
        <span>{currentLocation?.local_names?.[language] || currentLocation?.name || currentWeather.name}</span>
      </div>
      
      {/* Main content */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-6xl font-bold text-white">{formatTemp(currentWeather.main.temp)}°</div>
          <div className="text-white/90 text-lg mt-1">{t(`weather.${weatherMain.main.toLowerCase()}`)}</div>
          <div className="text-white/60 text-sm mt-1">{t('weather.feelsLike')} {formatTemp(currentWeather.main.feels_like)}°</div>
        </div>
        <img src={`https://openweathermap.org/img/wn/${weatherMain.icon}@4x.png`} alt="" className="w-28 h-28" />
      </div>
      
      {/* Min/Max */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-white/70">↑ {formatTemp(currentWeather.main.temp_max)}°</span>
        <span className="text-sm text-white/70">↓ {formatTemp(currentWeather.main.temp_min)}°</span>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <StatItem icon={Droplets} value={`${currentWeather.main.humidity}%`} label={t('weather.humidity')} color="cyan" />
        <StatItem icon={Wind} value={Math.round(currentWeather.wind.speed * 3.6)} label={t('unit.kmh')} color="purple" />
        <StatItem icon={Eye} value={`${(currentWeather.visibility / 1000).toFixed(0)}`} label={t('unit.km')} color="green" />
        <StatItem icon={Gauge} value={currentWeather.main.pressure} label={t('unit.hpa')} color="orange" />
      </div>
      
      {/* Sunrise/Sunset */}
      <div className="flex items-center justify-between mt-4 bg-white/10 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-[10px] text-white/50">{t('weather.sunrise')}</div>
            <div className="text-sm text-white">{formatTime(new Date(currentWeather.sys.sunrise * 1000), language)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-left">
            <div className="text-[10px] text-white/50">{t('weather.sunset')}</div>
            <div className="text-sm text-white">{formatTime(new Date(currentWeather.sys.sunset * 1000), language)}</div>
          </div>
          <Sunset className="w-5 h-5 text-orange-400" />
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon: Icon, value, label, color }: { icon: any, value: string | number, label: string, color: string }) {
  const colors: Record<string, string> = { cyan: 'text-cyan-400', purple: 'text-purple-400', green: 'text-green-400', orange: 'text-orange-400' };
  return (
    <div className="bg-white/10 rounded-xl p-2 text-center">
      <Icon className={`w-4 h-4 mx-auto ${colors[color]}`} />
      <div className="text-base font-semibold text-white">{value}</div>
      <div className="text-[10px] text-white/50">{label}</div>
    </div>
  );
}

// ============ HOURLY FORECAST ============
function HourlyForecast() {
  const { forecast } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!forecast) return null;
  
  const hourly = forecast.list.slice(0, 8);
  const now = new Date().getHours();
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">{t('weather.hourly')}</span>
        <span className="text-gray-400 text-xs">24 {t('time.hours')}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {hourly.map((item, i) => {
          const time = new Date(item.dt * 1000);
          const isNow = time.getHours() === now;
          return (
            <div key={i} className={`flex flex-col items-center min-w-[52px] p-2 rounded-xl ${isNow ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
              <span className={`text-[10px] ${isNow ? 'text-cyan-400' : 'text-gray-400'}`}>{isNow ? t('time.now') : formatTime(time, language)}</span>
              <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="" className="w-10 h-10" />
              <span className="text-white font-medium">{Math.round(item.main.temp)}°</span>
              {item.pop > 0 && <span className="text-cyan-400 text-[10px]">{Math.round(item.pop * 100)}%</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ AIR QUALITY CARD ============
function AirQualityCard() {
  const { airQuality } = useWeatherStore();
  const { t } = useI18n();
  
  if (!airQuality?.list[0]) return null;
  
  const aqi = airQuality.list[0].main.aqi;
  const comp = airQuality.list[0].components;
  const aqiPercent = (aqi / 5) * 100;
  const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7'];
  const levels = ['good', 'moderate', 'unhealthySensitive', 'unhealthy', 'veryUnhealthy'];
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">{t('aqi.title')}</span>
        <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{t('aqi.today')}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke={colors[aqi - 1]} strokeWidth="8" fill="none" strokeDasharray={`${aqiPercent * 2.51} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{aqi * 20}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: colors[aqi - 1] }}>{t(`aqi.${levels[aqi - 1]}`)}</div>
          <div className="text-[10px] text-gray-400 mt-1">{t('aqi.pm25')}: {comp.pm2_5.toFixed(0)}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============ UV INDEX CARD ============
function UVIndexCard() {
  const { currentWeather } = useWeatherStore();
  const { t } = useI18n();
  
  if (!currentWeather) return null;
  
  // Estimate UV based on time and weather
  const hour = new Date().getHours();
  const isDay = hour >= 10 && hour <= 16;
  const isClear = currentWeather.weather[0].main === 'Clear';
  const uv = isDay ? (isClear ? 8 : 4) : 1;
  
  const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#7f1d1d'];
  const levels = ['uvLow', 'uvModerate', 'uvHigh', 'uvVeryHigh', 'uvExtreme'];
  const levelIndex = uv <= 2 ? 0 : uv <= 5 ? 1 : uv <= 7 ? 2 : uv <= 10 ? 3 : 4;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-4 h-4 text-yellow-400" />
        <span className="text-white font-medium">{t('weather.uvIndex')}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke={colors[levelIndex]} strokeWidth="8" fill="none" strokeDasharray={`${(uv / 11) * 251} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{uv}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: colors[levelIndex] }}>{t(`weather.${levels[levelIndex]}`)}</div>
          <div className="text-[10px] text-gray-400 mt-1">{uv >= 6 ? t('alerts.useSunscreen') : t('weather.uvLow')}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============ WEATHER ALERTS ============
function WeatherAlerts() {
  const { currentWeather, airQuality } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!currentWeather) return null;
  
  const alerts: { icon: any; text: string; color: string }[] = [];
  const main = currentWeather.weather[0].main;
  
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) {
    alerts.push({ icon: Umbrella, text: t('alerts.carryUmbrella'), color: 'cyan' });
  }
  if (currentWeather.main.temp > 35) {
    alerts.push({ icon: Thermometer, text: t('alerts.stayHydrated'), color: 'red' });
  }
  if (currentWeather.wind.speed > 10) {
    alerts.push({ icon: Wind, text: language === 'ar' ? 'احذر من الرياح القوية' : 'Strong winds expected', color: 'orange' });
  }
  if (airQuality?.list[0]?.main.aqi && airQuality.list[0].main.aqi >= 3) {
    alerts.push({ icon: Shield, text: t('alerts.limitOutdoor'), color: 'purple' });
  }
  
  if (alerts.length === 0) {
    alerts.push({ icon: Info, text: language === 'ar' ? 'الطقس مناسب للأنشطة الخارجية' : 'Weather is suitable for outdoor activities', color: 'green' });
  }
  
  const colorMap: Record<string, string> = { cyan: 'bg-cyan-500/20 text-cyan-400', red: 'bg-red-500/20 text-red-400', orange: 'bg-orange-500/20 text-orange-400', purple: 'bg-purple-500/20 text-purple-400', green: 'bg-green-500/20 text-green-400' };
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-orange-400" />
        <span className="text-white font-medium">{t('alerts.title')}</span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-xl ${colorMap[alert.color]}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm">{alert.text}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ WEEKLY FORECAST ============
function WeeklyForecast() {
  const { forecast } = useWeatherStore();
  const { t, language } = useI18n();
  
  if (!forecast) return null;
  
  const daily = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof forecast.list>);
  
  const days = Object.entries(daily).slice(0, 7);
  const today = new Date().toDateString();
  const [expanded, setExpanded] = useState<number | null>(null);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">{t('weather.weekly')}</span>
        <span className="text-cyan-400 text-xs">{days.length} {t('time.days')}</span>
      </div>
      <div className="space-y-1">
        {days.map(([dateStr, items], i) => {
          const date = new Date(dateStr);
          const isToday = dateStr === today;
          const min = Math.min(...items.map(x => x.main.temp_min));
          const max = Math.max(...items.map(x => x.main.temp_max));
          const weather = items[0].weather[0];
          const isExp = expanded === i;
          
          return (
            <div key={dateStr}>
              <button onClick={() => setExpanded(isExp ? null : i)} className={`w-full flex items-center justify-between p-2 rounded-xl ${isToday ? 'bg-cyan-500/20' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-14">
                    <div className={`text-sm ${isToday ? 'text-cyan-400' : 'text-white'}`}>{isToday ? t('time.today') : getDayName(date, language)}</div>
                  </div>
                  <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="" className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{Math.round(min)}°</span>
                  <div className="w-12 h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-orange-400 rounded-full" style={{ width: `${((max - min) / 20) * 100}%`, marginLeft: `${((min - 10) / 30) * 100}%` }} />
                  </div>
                  <span className="text-sm text-white">{Math.round(max)}°</span>
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isExp && (
                <div className="flex gap-2 p-2 bg-white/5 rounded-xl mt-1 overflow-x-auto hide-scrollbar">
                  {items.slice(0, 6).map((item, j) => (
                    <div key={j} className="flex flex-col items-center min-w-[40px]">
                      <span className="text-[10px] text-gray-400">{formatTime(new Date(item.dt * 1000), language)}</span>
                      <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt="" className="w-8 h-8" />
                      <span className="text-xs text-white">{Math.round(item.main.temp)}°</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ IMPACT SCORE CARD ============
function ImpactScoreCard() {
  const { currentWeather } = useWeatherStore();
  const { t } = useI18n();
  
  if (!currentWeather) return null;
  
  const calcScore = () => {
    let s = 100;
    const main = currentWeather.weather[0].main;
    if (['Rain', 'Thunderstorm', 'Snow'].includes(main)) s -= 30;
    if (currentWeather.main.temp > 35 || currentWeather.main.temp < 5) s -= 20;
    if (currentWeather.wind.speed > 10) s -= 15;
    return Math.max(0, Math.min(100, s));
  };
  
  const score = calcScore();
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : score >= 30 ? '#f97316' : '#ef4444';
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">{t('impact.title')}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="8" fill="none" strokeDasharray={`${score * 2.51} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{score}</div>
        </div>
        <div className="flex-1 text-sm text-gray-400">
          {score >= 70 ? t('impact.excellent') : score >= 50 ? t('impact.good') : score >= 30 ? t('impact.moderate') : t('impact.poor')}
        </div>
      </div>
    </motion.div>
  );
}

// ============ FORECAST TAB ============
function ForecastTab() {
  return (
    <div className="space-y-4">
      <HourlyForecast />
      <WeeklyForecast />
      <ImpactScoreCard />
    </div>
  );
}

// ============ MAP TAB ============
function MapTab() {
  const { currentLocation } = useWeatherStore();
  const { t } = useI18n();
  
  const lat = currentLocation?.lat || 33.3152;
  const lon = currentLocation?.lon || 44.3661;
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <span className="text-white font-medium">{t('map.title')}</span>
      </div>
      <div className="h-[300px] bg-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <div className="text-white text-sm">{currentLocation?.name || 'Baghdad'}</div>
          <div className="text-gray-400 text-xs mt-1">{lat.toFixed(2)}, {lon.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ============ FAVORITES TAB ============
function FavoritesTab() {
  const { favorites, removeFavorite, setCurrentLocation, currentLocation } = useWeatherStore();
  const { t, language } = useI18n();
  const [favWeather, setFavWeather] = useState<Record<string, { temp: number; icon: string }>>({});
  
  useEffect(() => {
    favorites.forEach(async (fav) => {
      try {
        const res = await fetch(`/api/weather/current?lat=${fav.lat}&lon=${fav.lon}`);
        if (res.ok) {
          const data = await res.json();
          setFavWeather(prev => ({ ...prev, [`${fav.lat}-${fav.lon}`]: { temp: Math.round(data.main.temp), icon: data.weather[0].icon } }));
        }
      } catch (e) {}
    });
  }, [favorites]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E293B] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-medium">{t('favorites.title')}</span>
        <span className="text-gray-400 text-xs">{favorites.length} {language === 'ar' ? 'مدن' : 'cities'}</span>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">{t('favorites.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {favorites.map((fav, i) => {
            const w = favWeather[`${fav.lat}-${fav.lon}`];
            const isActive = currentLocation?.lat === fav.lat && currentLocation?.lon === fav.lon;
            return (
              <button key={i} onClick={() => setCurrentLocation(fav)} className={`relative p-3 rounded-xl ${isActive ? 'bg-cyan-500/20' : 'bg-white/5'} text-center`}>
                <button onClick={(e) => { e.stopPropagation(); removeFavorite(fav); }} className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
                {w && <img src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`} alt="" className="w-10 h-10 mx-auto" />}
                {w && <div className="text-lg font-bold text-white">{w.temp}°</div>}
                <div className="text-xs text-white">{fav.local_names?.[language] || fav.name}</div>
                <div className="text-[10px] text-gray-400">{fav.country}</div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ============ SETTINGS TAB ============
function SettingsTab() {
  const { temperatureUnit, setTemperatureUnit, speedUnit, setSpeedUnit } = useWeatherStore();
  const { t, language, setLanguage } = useI18n();
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Language */}
      <div className="bg-[#1E293B] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-purple-400" />
            <span className="text-white">{t('settings.language')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLanguage('ar')} className={`px-3 py-1.5 rounded-lg text-xs ${language === 'ar' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>العربية</button>
            <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-lg text-xs ${language === 'en' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>English</button>
          </div>
        </div>
      </div>
      
      {/* Temperature */}
      <div className="bg-[#1E293B] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <span className="text-white">{t('settings.temperature')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTemperatureUnit('celsius')} className={`px-3 py-1.5 rounded-lg text-xs ${temperatureUnit === 'celsius' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>°C</button>
            <button onClick={() => setTemperatureUnit('fahrenheit')} className={`px-3 py-1.5 rounded-lg text-xs ${temperatureUnit === 'fahrenheit' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>°F</button>
          </div>
        </div>
      </div>
      
      {/* Wind */}
      <div className="bg-[#1E293B] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-cyan-400" />
            <span className="text-white">{t('weather.windSpeed')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSpeedUnit('kmh')} className={`px-3 py-1.5 rounded-lg text-xs ${speedUnit === 'kmh' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>{t('unit.kmh')}</button>
            <button onClick={() => setSpeedUnit('mph')} className={`px-3 py-1.5 rounded-lg text-xs ${speedUnit === 'mph' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>{t('unit.mph')}</button>
          </div>
        </div>
      </div>
      
      {/* App Info */}
      <div className="bg-[#1E293B] rounded-2xl p-4 text-center">
        <div className="text-cyan-400 font-bold text-lg mb-1">SkyPulse</div>
        <div className="text-gray-400 text-xs">{t('app.version')}</div>
        <div className="text-gray-500 text-[10px] mt-2">Powered by OpenWeatherMap</div>
      </div>
    </motion.div>
  );
}

// ============ AI ASSISTANT BUTTON ============
function AIAssistantButton() {
  const { currentWeather, airQuality, currentLocation } = useWeatherStore();
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([{ role: 'assistant', content: t('assistant.welcome') }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          weatherContext: currentWeather ? {
            temperature: Math.round(currentWeather.main.temp),
            feelsLike: Math.round(currentWeather.main.feels_like),
            humidity: currentWeather.main.humidity,
            windSpeed: currentWeather.wind.speed,
            windDirection: currentWeather.wind.deg,
            condition: currentWeather.weather[0].main,
            description: currentWeather.weather[0].description,
            city: currentLocation?.name || currentWeather.name,
            country: currentWeather.sys.country,
            aqi: airQuality?.list[0]?.main.aqi
          } : undefined,
          language
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: language === 'ar' ? 'عذراً، حدث خطأ.' : 'Sorry, an error occurred.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: language === 'ar' ? 'خطأ في الاتصال' : 'Connection error' }]);
    }
    setLoading(false);
  };
  
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-20 left-4 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg z-40">
        <MessageCircle className="w-5 h-5 text-white" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 z-50 bg-[#1E293B] rounded-2xl flex flex-col sm:inset-auto sm:bottom-20 sm:left-4 sm:right-4 sm:w-80 sm:h-96 sm:mx-auto">
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{t('assistant.title')}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-purple-500/20' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`}>
                    {msg.role === 'user' ? <User className="w-3 h-3 text-purple-400" /> : <Bot className="w-3 h-3 text-white" />}
                  </div>
                  <div className={`max-w-[75%] p-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-purple-500/20 text-white' : 'bg-white/10 text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mx-auto" />}
            </div>
            
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('assistant.placeholder')} className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" dir={language === 'ar' ? 'rtl' : 'ltr'} />
              <button onClick={handleSend} disabled={!input.trim() || loading} className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center disabled:opacity-50">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
