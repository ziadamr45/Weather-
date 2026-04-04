'use client';

import { useEffect, useRef, useState } from 'react';
import { useWeatherStore, calculateImpactScore, generateRecommendations } from '@/lib/weather-store';
import { useI18n, formatTime, getDayName } from '@/lib/i18n';
import { getWeatherBackground, getWeatherIcon } from '@/lib/weather-types';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Wind, 
  Eye, 
  Thermometer, 
  Gauge, 
  Sun,
  Sunrise,
  Sunset,
  MapPin,
  Star,
  CloudRain,
  SunMedium,
  Cloud,
  CloudSun,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export function CurrentWeatherCard() {
  const { currentWeather, forecast, airQuality, currentLocation, temperatureUnit, formatTemperature } = useWeatherStore();
  const { t, language } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const weatherMain = currentWeather?.weather[0]?.main || 'Clear';
  const isNight = currentWeather?.sys ? 
    (Date.now() / 1000 < currentWeather.sys.sunrise || Date.now() / 1000 > currentWeather.sys.sunset) : 
    false;
  
  const background = getWeatherBackground(weatherMain, isNight);
  const impactScore = calculateImpactScore(currentWeather);
  const recommendations = generateRecommendations(currentWeather, airQuality);
  
  const formatTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9/5) + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };
  
  // Weather animation particles
  useEffect(() => {
    if (!canvasRef.current || !currentWeather) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles: { x: number; y: number; speed: number; size: number; opacity: number }[] = [];
    const particleCount = weatherMain === 'Rain' || weatherMain === 'Drizzle' ? 100 : 
                          weatherMain === 'Snow' ? 80 : 
                          weatherMain === 'Clear' && !isNight ? 30 : 0;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: weatherMain === 'Snow' ? 1 + Math.random() : 5 + Math.random() * 5,
        size: weatherMain === 'Snow' ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.5
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        
        if (weatherMain === 'Snow') {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          p.y += p.speed;
          p.x += Math.sin(p.y * 0.01) * 0.5;
        } else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + p.size * 10);
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          p.y += p.speed;
        } else if (weatherMain === 'Clear' && !isNight) {
          // Dust particles for clear sunny day
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          p.y += 0.2;
          p.x += 0.1;
        }
        
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    if (particleCount > 0) {
      animate();
    }
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentWeather, weatherMain, isNight]);
  
  if (!currentWeather) return null;
  
  const sunriseTime = new Date(currentWeather.sys.sunrise * 1000);
  const sunsetTime = new Date(currentWeather.sys.sunset * 1000);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl"
      style={{ background }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.6 }}
      />
      
      <div className="relative p-6 min-h-[320px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/80">
              {currentLocation?.local_names?.[language] || currentLocation?.name || currentWeather.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">
              {formatTime(new Date(), language)}
            </span>
          </div>
        </div>
        
        {/* Main Temperature */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-8xl font-bold text-white mb-2">
              {formatTemp(currentWeather.main.temp)}
            </div>
            <div className="text-lg text-white/90">
              {t(`weather.${weatherMain.toLowerCase()}`)}
            </div>
            <div className="text-sm text-white/60 mt-1">
              {t('weather.feelsLike')} {formatTemp(currentWeather.main.feels_like)}
            </div>
          </div>
          
          <div className="relative">
            <img
              src={getWeatherIcon(currentWeather.weather[0].icon)}
              alt={currentWeather.weather[0].description}
              className="w-32 h-32 animate-float"
            />
          </div>
        </div>
        
        {/* Min/Max Temperature */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1 text-sm text-white/70">
            <span className="text-cyan-400">↑</span>
            {formatTemp(currentWeather.main.temp_max)}
          </div>
          <div className="flex items-center gap-1 text-sm text-white/70">
            <span className="text-blue-400">↓</span>
            {formatTemp(currentWeather.main.temp_min)}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <Droplets className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
            <div className="text-lg font-semibold text-white">{currentWeather.main.humidity}%</div>
            <div className="text-xs text-white/60">{t('weather.humidity')}</div>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <Wind className="w-5 h-5 mx-auto text-purple-400 mb-1" />
            <div className="text-lg font-semibold text-white">{Math.round(currentWeather.wind.speed * 3.6)}</div>
            <div className="text-xs text-white/60">{t('unit.kmh')}</div>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <Eye className="w-5 h-5 mx-auto text-green-400 mb-1" />
            <div className="text-lg font-semibold text-white">{(currentWeather.visibility / 1000).toFixed(1)}</div>
            <div className="text-xs text-white/60">{t('unit.km')}</div>
          </div>
          
          <div className="glass rounded-xl p-3 text-center">
            <Gauge className="w-5 h-5 mx-auto text-orange-400 mb-1" />
            <div className="text-lg font-semibold text-white">{currentWeather.main.pressure}</div>
            <div className="text-xs text-white/60">{t('unit.hpa')}</div>
          </div>
        </div>
        
        {/* Sunrise/Sunset */}
        <div className="flex items-center justify-between mt-4 glass rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Sunrise className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-xs text-white/60">{t('weather.sunrise')}</div>
              <div className="text-sm font-medium text-white">{formatTime(sunriseTime, language)}</div>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/20" />
          
          <div className="flex items-center gap-2">
            <div className="text-left">
              <div className="text-xs text-white/60">{t('weather.sunset')}</div>
              <div className="text-sm font-medium text-white">{formatTime(sunsetTime, language)}</div>
            </div>
            <Sunset className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
