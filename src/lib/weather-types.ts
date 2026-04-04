// OpenWeatherMap API Types

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level?: number;
    grnd_level?: number;
    humidity: number;
    temp_kf?: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
  sys: {
    pod: 'd' | 'n';
  };
  dt_txt: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AirQualityData {
  coord: {
    lon: number;
    lat: number;
  };
  list: {
    dt: number;
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }[];
}

export interface UVIndexData {
  lat: number;
  lon: number;
  date_iso: string;
  date: number;
  value: number;
}

export interface WeatherMapLayer {
  id: string;
  title: string;
  tileUrl: string;
}

export type WeatherMain = 
  | 'Clear' 
  | 'Clouds' 
  | 'Rain' 
  | 'Drizzle' 
  | 'Thunderstorm' 
  | 'Snow' 
  | 'Mist' 
  | 'Fog' 
  | 'Haze' 
  | 'Sand' 
  | 'Dust';

export const getWeatherIcon = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
};

export const getWeatherIconSmall = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

export const getWindDirectionArabic = (deg: number): string => {
  const directions = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

export const getAQILevel = (aqi: number): { level: string; color: string; bgColor: string } => {
  if (aqi === 1) return { level: 'good', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' };
  if (aqi === 2) return { level: 'moderate', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.2)' };
  if (aqi === 3) return { level: 'unhealthySensitive', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.2)' };
  if (aqi === 4) return { level: 'unhealthy', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' };
  if (aqi === 5) return { level: 'veryUnhealthy', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' };
  return { level: 'hazardous', color: '#7f1d1d', bgColor: 'rgba(127, 29, 29, 0.2)' };
};

export const getUVLevel = (uv: number): { level: string; color: string } => {
  if (uv <= 2) return { level: 'low', color: '#22c55e' };
  if (uv <= 5) return { level: 'moderate', color: '#eab308' };
  if (uv <= 7) return { level: 'high', color: '#f97316' };
  if (uv <= 10) return { level: 'veryHigh', color: '#ef4444' };
  return { level: 'extreme', color: '#7f1d1d' };
};

export const getWeatherBackground = (weatherMain: string, isNight: boolean): string => {
  const backgrounds: Record<string, { day: string; night: string }> = {
    Clear: {
      day: 'linear-gradient(180deg, #1e3a5f 0%, #3b82f6 50%, #60a5fa 100%)',
      night: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    },
    Clouds: {
      day: 'linear-gradient(180deg, #374151 0%, #6b7280 50%, #9ca3af 100%)',
      night: 'linear-gradient(180deg, #1f2937 0%, #374151 50%, #4b5563 100%)'
    },
    Rain: {
      day: 'linear-gradient(180deg, #1e3a5f 0%, #3b82f6 50%, #64748b 100%)',
      night: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #334155 100%)'
    },
    Drizzle: {
      day: 'linear-gradient(180deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
      night: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #475569 100%)'
    },
    Thunderstorm: {
      day: 'linear-gradient(180deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
      night: 'linear-gradient(180deg, #111827 0%, #1f2937 50%, #374151 100%)'
    },
    Snow: {
      day: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
      night: 'linear-gradient(180deg, #334155 0%, #475569 50%, #64748b 100%)'
    },
    Mist: {
      day: 'linear-gradient(180deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
      night: 'linear-gradient(180deg, #374151 0%, #4b5563 50%, #6b7280 100%)'
    },
    Fog: {
      day: 'linear-gradient(180deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
      night: 'linear-gradient(180deg, #374151 0%, #4b5563 50%, #6b7280 100%)'
    },
    Haze: {
      day: 'linear-gradient(180deg, #92400e 0%, #b45309 50%, #d97706 100%)',
      night: 'linear-gradient(180deg, #451a03 0%, #78350f 50%, #92400e 100%)'
    },
    Sand: {
      day: 'linear-gradient(180deg, #92400e 0%, #b45309 50%, #d97706 100%)',
      night: 'linear-gradient(180deg, #451a03 0%, #78350f 50%, #92400e 100%)'
    },
    Dust: {
      day: 'linear-gradient(180deg, #92400e 0%, #b45309 50%, #d97706 100%)',
      night: 'linear-gradient(180deg, #451a03 0%, #78350f 50%, #92400e 100%)'
    }
  };

  const weather = backgrounds[weatherMain] || backgrounds.Clear;
  return isNight ? weather.night : weather.day;
};
