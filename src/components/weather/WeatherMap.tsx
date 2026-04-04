'use client';

import { useState } from 'react';
import { useWeatherStore } from '@/lib/weather-store';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Cloud, Droplets, Thermometer, Wind, MapPin } from 'lucide-react';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const layers = [
  { id: 'clouds', label: 'map.clouds', icon: Cloud, url: 'clouds_new' },
  { id: 'precipitation', label: 'map.precipitation', icon: Droplets, url: 'precipitation_new' },
  { id: 'temperature', label: 'map.temperature', icon: Thermometer, url: 'temp_new' },
  { id: 'wind', label: 'map.wind', icon: Wind, url: 'wind_new' },
];

const API_KEY = 'a8ca35a9b77f4024aa0dbca4198bdc22';

export function WeatherMap() {
  const { currentLocation, currentWeather } = useWeatherStore();
  const { t } = useI18n();
  const [activeLayer, setActiveLayer] = useState('clouds');
  
  const center: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lon]
    : [33.3152, 44.3661]; // Default to Baghdad
  
  const layerUrl = `https://tile.openweathermap.org/map/${layers.find(l => l.id === activeLayer)?.url}/{z}/{x}/{y}.png?appid=${API_KEY}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{t('map.title')}</h3>
        </div>
        
        {/* Layer selector */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all
                  ${isActive 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4" />
                {t(layer.label)}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Map container */}
      <div className="h-[300px] relative">
        <MapContainer
          center={center}
          zoom={6}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url={layerUrl}
            opacity={0.6}
          />
          {currentLocation && currentWeather && (
              <Marker position={center}>
                <Popup>
                  <div className="text-center p-2">
                    <div className="text-lg font-bold">{currentWeather.main.temp}°</div>
                    <div className="text-sm">{currentLocation.name}</div>
                  </div>
                </Popup>
              </Marker>
            )}
        </MapContainer>
        
        {/* Location marker overlay */}
        <div className="absolute bottom-4 left-4 glass rounded-xl p-2">
          <div className="flex items-center gap-2 text-sm text-white">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{currentLocation?.name || 'Select a location'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
