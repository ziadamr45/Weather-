'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { AirQualityCard } from '@/components/weather/AirQualityCard';
import { DailyForecast } from '@/components/weather/DailyForecast';
import { HourlyTimeline } from '@/components/weather/HourlyTimeline';
import { UVIndexCard } from '@/components/weather/UVIndexCard';
import { WindCompass } from '@/components/weather/WindCompass';
import { AIAssistant } from '@/components/weather/AIAssistant';
import { WeatherMap } from '@/components/weather/WeatherMap';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { FavoritesPanel } from '@/components/weather/FavoritesPanel';
import { SettingsPanel } from '@/components/weather/SettingsPanel';
import { ImpactScore } from '@/components/weather/ImpactScore';
import { Loader2, Cloud, Sun, CloudRain } from 'lucide-react';

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
    setError
  } = useWeatherStore();
  
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState('home');
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Fetch weather data
  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [currentRes, forecastRes, aqiRes] = await Promise.all([
        fetch(`/api/weather/current?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`),
        fetch(`/api/weather/air-quality?lat=${lat}&lon=${lon}`)
      ]);
      
      if (currentRes.ok) {
        const currentData = await currentRes.json();
        setCurrentWeather(currentData);
      }
      
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData);
      }
      
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        setAirQuality(aqiData);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(t('error.fetch'));
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [setCurrentWeather, setForecast, setAirQuality, setIsLoading, setError, t]);
  
  // Initialize with GPS or default location
  useEffect(() => {
    const initLocation = async () => {
      // Try to get location from localStorage
      const savedLocation = localStorage.getItem('skypulse-weather');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed.state?.currentLocation) {
          setCurrentLocation(parsed.state.currentLocation);
          fetchWeatherData(parsed.state.currentLocation.lat, parsed.state.currentLocation.lon);
          return;
        }
      }
      
      // Try GPS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              const res = await fetch(`/api/weather/geocode?lat=${latitude}&lon=${longitude}`);
              if (res.ok) {
                const data = await res.json();
                if (data[0]) {
                  setCurrentLocation(data[0]);
                  fetchWeatherData(latitude, longitude);
                }
              }
            } catch (error) {
              console.error('Geocode error:', error);
              // Default to Baghdad
              const defaultLoc = { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'IQ' };
              setCurrentLocation(defaultLoc);
              fetchWeatherData(defaultLoc.lat, defaultLoc.lon);
            }
          },
          () => {
            // GPS denied, use default
            const defaultLoc = { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'IQ' };
            setCurrentLocation(defaultLoc);
            fetchWeatherData(defaultLoc.lat, defaultLoc.lon);
          }
        );
      } else {
        // No GPS support
        const defaultLoc = { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'IQ' };
        setCurrentLocation(defaultLoc);
        fetchWeatherData(defaultLoc.lat, defaultLoc.lon);
      }
    };
    
    initLocation();
  }, []);
  
  // Fetch when location changes
  useEffect(() => {
    if (currentLocation && !initialLoad) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon);
    }
  }, [currentLocation?.lat, currentLocation?.lon]);
  
  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  
  // Render loading state
  if (initialLoad && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('app.name')}</h1>
          <p className="text-white/50 mb-6">{t('general.loading')}</p>
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'forecast':
        return (
          <div className="space-y-4">
            <HourlyTimeline />
            <DailyForecast />
            <ImpactScore />
          </div>
        );
      case 'map':
        return (
          <div className="space-y-4">
            <WeatherMap />
            <WeatherAlerts />
          </div>
        );
      case 'favorites':
        return <FavoritesPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <div className="space-y-4">
            <CurrentWeatherCard />
            <HourlyTimeline />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AirQualityCard />
              <UVIndexCard />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WindCompass />
              <ImpactScore />
            </div>
            <WeatherAlerts />
            <DailyForecast />
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <AIAssistant />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
