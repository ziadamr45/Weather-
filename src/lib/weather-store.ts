import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrentWeather, ForecastData, AirQualityData, Location, Coordinates } from './weather-types';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph';

interface WeatherState {
  // Current location
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  
  // Weather data
  currentWeather: CurrentWeather | null;
  setCurrentWeather: (weather: CurrentWeather | null) => void;
  
  forecast: ForecastData | null;
  setForecast: (forecast: ForecastData | null) => void;
  
  airQuality: AirQualityData | null;
  setAirQuality: (aqi: AirQualityData | null) => void;
  
  // Favorites
  favorites: Location[];
  addFavorite: (location: Location) => void;
  removeFavorite: (location: Location) => void;
  isFavorite: (location: Location) => boolean;
  
  // Settings
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  
  speedUnit: SpeedUnit;
  setSpeedUnit: (unit: SpeedUnit) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  // Convert helpers
  convertTemperature: (celsius: number) => number;
  formatTemperature: (celsius: number) => string;
  convertSpeed: (ms: number) => number;
  formatSpeed: (ms: number) => string;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      // Current location
      currentLocation: null,
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      // Weather data
      currentWeather: null,
      setCurrentWeather: (weather) => set({ currentWeather: weather }),
      
      forecast: null,
      setForecast: (forecast) => set({ forecast: forecast }),
      
      airQuality: null,
      setAirQuality: (aqi) => set({ airQuality: aqi }),
      
      // Favorites
      favorites: [],
      addFavorite: (location) => {
        const state = get();
        if (!state.favorites.some(f => f.lat === location.lat && f.lon === location.lon)) {
          set({ favorites: [...state.favorites, location] });
        }
      },
      removeFavorite: (location) => {
        const state = get();
        set({
          favorites: state.favorites.filter(f => !(f.lat === location.lat && f.lon === location.lon))
        });
      },
      isFavorite: (location) => {
        const state = get();
        return state.favorites.some(f => f.lat === location.lat && f.lon === location.lon);
      },
      
      // Settings
      temperatureUnit: 'celsius',
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      
      speedUnit: 'kmh',
      setSpeedUnit: (unit) => set({ speedUnit: unit }),
      
      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      error: null,
      setError: (error) => set({ error: error }),
      
      // Convert helpers
      convertTemperature: (celsius: number) => {
        const state = get();
        if (state.temperatureUnit === 'fahrenheit') {
          return Math.round((celsius * 9/5) + 32);
        }
        return Math.round(celsius);
      },
      
      formatTemperature: (celsius: number) => {
        const state = get();
        const temp = state.convertTemperature(celsius);
        return `${temp}°`;
      },
      
      convertSpeed: (ms: number) => {
        const state = get();
        if (state.speedUnit === 'mph') {
          return Math.round(ms * 2.237);
        }
        return Math.round(ms * 3.6);
      },
      
      formatSpeed: (ms: number) => {
        const state = get();
        const speed = state.convertSpeed(ms);
        const unit = state.speedUnit === 'mph' ? 'mph' : 'كم/س';
        return `${speed} ${unit}`;
      },
    }),
    {
      name: 'skypulse-weather',
      partialize: (state) => ({
        favorites: state.favorites,
        temperatureUnit: state.temperatureUnit,
        speedUnit: state.speedUnit,
        currentLocation: state.currentLocation,
      }),
    }
  )
);

// Calculate weather impact score
export const calculateImpactScore = (weather: CurrentWeather | null): number => {
  if (!weather) return 50;
  
  let score = 100;
  const { main, wind, visibility, weather: conditions } = weather;
  const condition = conditions[0]?.main || 'Clear';
  
  // Temperature impact
  if (main.temp < 0 || main.temp > 40) score -= 30;
  else if (main.temp < 10 || main.temp > 35) score -= 15;
  else if (main.temp < 15 || main.temp > 30) score -= 5;
  
  // Humidity impact
  if (main.humidity > 80) score -= 10;
  else if (main.humidity < 20) score -= 5;
  
  // Wind impact
  if (wind.speed > 15) score -= 20;
  else if (wind.speed > 10) score -= 10;
  else if (wind.speed > 5) score -= 5;
  
  // Visibility impact
  if (visibility < 1000) score -= 25;
  else if (visibility < 5000) score -= 15;
  else if (visibility < 10000) score -= 5;
  
  // Weather condition impact
  if (['Thunderstorm', 'Snow', 'Sand', 'Dust'].includes(condition)) score -= 25;
  else if (['Rain', 'Drizzle', 'Fog'].includes(condition)) score -= 15;
  else if (['Clouds', 'Mist', 'Haze'].includes(condition)) score -= 5;
  
  return Math.max(0, Math.min(100, score));
};

// Generate smart recommendations
export const generateRecommendations = (weather: CurrentWeather | null, aqi: AirQualityData | null): string[] => {
  if (!weather) return [];
  
  const recommendations: string[] = [];
  const { main, wind, weather: conditions } = weather;
  const condition = conditions[0]?.main;
  
  // Rain recommendations
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(condition || '')) {
    recommendations.push('rec.umbrella');
  }
  
  // Temperature recommendations
  if (main.temp < 15) {
    recommendations.push('rec.jacket');
  }
  
  if (main.temp > 30) {
    recommendations.push('rec.hydration');
  }
  
  // UV recommendations (estimate based on time of day and weather)
  const hour = new Date().getHours();
  const isDaytime = hour >= 10 && hour <= 16;
  if (condition === 'Clear' && isDaytime) {
    recommendations.push('rec.sunscreen');
  }
  
  // Air quality recommendations
  if (aqi && aqi.list[0]?.main.aqi >= 3) {
    recommendations.push('rec.indoor');
  }
  
  return recommendations;
};
