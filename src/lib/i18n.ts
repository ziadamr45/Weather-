import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'en';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App
    'app.name': 'SkyPulse',
    'app.title': 'طقس اليوم',
    'app.version': 'الإصدار 2.4.0',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.forecast': 'التنبؤات',
    'nav.map': 'الخريطة',
    'nav.favorites': 'المفضلة',
    'nav.settings': 'الإعدادات',
    'nav.alerts': 'التنبيهات',
    'nav.assistant': 'المساعد',
    
    // Weather
    'weather.now': 'الطقس الآن',
    'weather.forecast': 'توقعات الطقس',
    'weather.hourly': 'التنبؤات بالساعة',
    'weather.daily': 'التنبؤات اليومية',
    'weather.weekly': 'التنبؤات الأسبوعية',
    'weather.feelsLike': 'يبدو كأنه',
    'weather.humidity': 'الرطوبة',
    'weather.wind': 'الرياح',
    'weather.windSpeed': 'سرعة الرياح',
    'weather.windDirection': 'اتجاه الرياح',
    'weather.pressure': 'الضغط الجوي',
    'weather.visibility': 'الرؤية',
    'weather.uvIndex': 'مؤشر الأشعة فوق البنفسجية',
    'weather.uvLow': 'منخفض',
    'weather.uvModerate': 'معتدل',
    'weather.uvHigh': 'عالي',
    'weather.uvVeryHigh': 'عالي جداً!',
    'weather.uvExtreme': 'شديد الخطورة',
    'weather.sunrise': 'الشروق',
    'weather.sunset': 'الغروب',
    'weather.dewPoint': 'نقطة الندى',
    'weather.clouds': 'السحب',
    'weather.precipitation': 'الهطول',
    
    // Weather Conditions
    'weather.clear': 'صافي',
    'weather.cloudy': 'غائم',
    'weather.partlyCloudy': 'صافي وغائم',
    'weather.rain': 'ممطر',
    'weather.drizzle': 'رذاذ',
    'weather.thunderstorm': 'عاصفة رعدية',
    'weather.snow': 'ثلجي',
    'weather.mist': 'ضباب خفيف',
    'weather.fog': 'ضباب',
    'weather.haze': 'سديم',
    'weather.sand': 'عاصفة رملية',
    'weather.dust': 'غبار',
    
    // Air Quality
    'aqi.title': 'جودة الهواء',
    'aqi.today': 'اليوم',
    'aqi.good': 'جيدة',
    'aqi.moderate': 'معتدلة',
    'aqi.unhealthySensitive': 'غير صحية للحساسين',
    'aqi.unhealthy': 'غير صحية',
    'aqi.veryUnhealthy': 'غير صحية جداً',
    'aqi.hazardous': 'خطرة',
    'aqi.pollution': 'تلوث الهواء',
    'aqi.dust': 'غبار وذرات',
    'aqi.pm25': 'PM2.5',
    'aqi.pm10': 'PM10',
    'aqi.o3': 'الأوزون',
    'aqi.no2': 'ثاني أكسيد النيتروجين',
    'aqi.so2': 'ثاني أكسيد الكبريت',
    'aqi.co': 'أول أكسيد الكربون',
    
    // Alerts
    'alerts.title': 'تحذيرات الطقس',
    'alerts.details': 'التفاصيل',
    'alerts.showDetails': 'إظهار التفاصيل',
    'alerts.rainWarning': 'تحذير من الأمطار',
    'alerts.heatWarning': 'تحذير من الحرارة',
    'alerts.windWarning': 'تحذير من الرياح',
    'alerts.uvWarning': 'تحذير من الأشعة',
    'alerts.carryUmbrella': 'احمل مظلة - من المتوقع هطول أمطار',
    'alerts.useSunscreen': 'استخدم واقي الشمس - أشعة فوق البنفسجية عالية',
    'alerts.stayHydrated': 'حافظ على ترطيب جسمك',
    'alerts.limitOutdoor': 'قلل من الأنشطة الخارجية',
    
    // Time
    'time.today': 'اليوم',
    'time.tomorrow': 'غداً',
    'time.now': 'الآن',
    'time.days': 'أيام',
    'time.hours': 'ساعات',
    'time.minutes': 'دقائق',
    
    // Days
    'day.sunday': 'الأحد',
    'day.monday': 'الاثنين',
    'day.tuesday': 'الثلاثاء',
    'day.wednesday': 'الأربعاء',
    'day.thursday': 'الخميس',
    'day.friday': 'الجمعة',
    'day.saturday': 'السبت',
    
    // Search
    'search.placeholder': 'ابحث عن مدينة...',
    'search.recent': 'عمليات البحث الأخيرة',
    'search.noResults': 'لم يتم العثور على نتائج',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.units': 'وحدات القياس',
    'settings.temperature': 'درجة الحرارة',
    'settings.celsius': 'مئوية',
    'settings.fahrenheit': 'فهرنهايت',
    'settings.notifications': 'الإشعارات',
    'settings.location': 'الموقع',
    'settings.theme': 'المظهر',
    'settings.themeLight': 'فاتح',
    'settings.themeDark': 'داكن',
    'settings.themeSystem': 'تلقائي',
    
    // Favorites
    'favorites.title': 'المفضلة',
    'favorites.add': 'إضافة للمفضلة',
    'favorites.remove': 'إزالة من المفضلة',
    'favorites.empty': 'لم تضف أي مدن للمفضلة',
    
    // Impact Score
    'impact.title': 'مؤشر الملاءمة',
    'impact.outdoor': 'الأنشطة الخارجية',
    'impact.travel': 'السفر',
    'impact.sports': 'الرياضة',
    'impact.walking': 'المشي',
    'impact.excellent': 'ممتاز',
    'impact.good': 'جيد',
    'impact.moderate': 'معتدل',
    'impact.poor': 'ضعيف',
    
    // Recommendations
    'rec.title': 'توصيات ذكية',
    'rec.umbrella': 'احمل مظلة',
    'rec.sunscreen': 'استخدم واقي الشمس',
    'rec.jacket': 'ارتدِ سترة',
    'rec.hydration': 'اشرب الماء',
    'rec.indoor': 'ابقَ في الداخل',
    
    // AI Assistant
    'assistant.title': 'مساعد الطقس الذكي',
    'assistant.placeholder': 'اسأل عن الطقس...',
    'assistant.welcome': 'مرحباً! أنا مساعد الطقس الذكي. كيف يمكنني مساعدتك؟',
    'assistant.thinking': 'جاري التفكير...',
    
    // Map
    'map.title': 'خريطة الطقس',
    'map.clouds': 'السحب',
    'map.precipitation': 'الهطول',
    'map.temperature': 'الحرارة',
    'map.wind': 'الرياح',
    
    // Errors
    'error.location': 'فشل في تحديد الموقع',
    'error.fetch': 'فشل في جلب البيانات',
    'error.network': 'خطأ في الشبكة',
    'error.retry': 'إعادة المحاولة',
    
    // Units
    'unit.kmh': 'كم/س',
    'unit.mph': 'ميل/س',
    'unit.mm': 'مم',
    'unit.in': 'بوصة',
    'unit.hpa': 'هكتوباسكال',
    'unit.km': 'كم',
    'unit.mi': 'ميل',
    
    // General
    'general.loading': 'جاري التحميل...',
    'general.refresh': 'تحديث',
    'general.cancel': 'إلغاء',
    'general.save': 'حفظ',
    'general.close': 'إغلاق',
    'general.back': 'رجوع',
  },
  en: {
    // App
    'app.name': 'SkyPulse',
    'app.title': "Today's Weather",
    'app.version': 'Version 2.4.0',
    
    // Navigation
    'nav.home': 'Home',
    'nav.forecast': 'Forecast',
    'nav.map': 'Map',
    'nav.favorites': 'Favorites',
    'nav.settings': 'Settings',
    'nav.alerts': 'Alerts',
    'nav.assistant': 'Assistant',
    
    // Weather
    'weather.now': 'Weather Now',
    'weather.forecast': 'Weather Forecast',
    'weather.hourly': 'Hourly Forecast',
    'weather.daily': 'Daily Forecast',
    'weather.weekly': 'Weekly Forecast',
    'weather.feelsLike': 'Feels Like',
    'weather.humidity': 'Humidity',
    'weather.wind': 'Wind',
    'weather.windSpeed': 'Wind Speed',
    'weather.windDirection': 'Wind Direction',
    'weather.pressure': 'Pressure',
    'weather.visibility': 'Visibility',
    'weather.uvIndex': 'UV Index',
    'weather.uvLow': 'Low',
    'weather.uvModerate': 'Moderate',
    'weather.uvHigh': 'High',
    'weather.uvVeryHigh': 'Very High!',
    'weather.uvExtreme': 'Extreme',
    'weather.sunrise': 'Sunrise',
    'weather.sunset': 'Sunset',
    'weather.dewPoint': 'Dew Point',
    'weather.clouds': 'Clouds',
    'weather.precipitation': 'Precipitation',
    
    // Weather Conditions
    'weather.clear': 'Clear',
    'weather.cloudy': 'Cloudy',
    'weather.partlyCloudy': 'Partly Cloudy',
    'weather.rain': 'Rainy',
    'weather.drizzle': 'Drizzle',
    'weather.thunderstorm': 'Thunderstorm',
    'weather.snow': 'Snowy',
    'weather.mist': 'Mist',
    'weather.fog': 'Fog',
    'weather.haze': 'Haze',
    'weather.sand': 'Sandstorm',
    'weather.dust': 'Dust',
    
    // Air Quality
    'aqi.title': 'Air Quality',
    'aqi.today': 'Today',
    'aqi.good': 'Good',
    'aqi.moderate': 'Moderate',
    'aqi.unhealthySensitive': 'Unhealthy for Sensitive',
    'aqi.unhealthy': 'Unhealthy',
    'aqi.veryUnhealthy': 'Very Unhealthy',
    'aqi.hazardous': 'Hazardous',
    'aqi.pollution': 'Air Pollution',
    'aqi.dust': 'Dust & Particles',
    'aqi.pm25': 'PM2.5',
    'aqi.pm10': 'PM10',
    'aqi.o3': 'Ozone',
    'aqi.no2': 'Nitrogen Dioxide',
    'aqi.so2': 'Sulfur Dioxide',
    'aqi.co': 'Carbon Monoxide',
    
    // Alerts
    'alerts.title': 'Weather Alerts',
    'alerts.details': 'Details',
    'alerts.showDetails': 'Show Details',
    'alerts.rainWarning': 'Rain Warning',
    'alerts.heatWarning': 'Heat Warning',
    'alerts.windWarning': 'Wind Warning',
    'alerts.uvWarning': 'UV Warning',
    'alerts.carryUmbrella': 'Carry an umbrella - Rain expected',
    'alerts.useSunscreen': 'Use sunscreen - High UV index',
    'alerts.stayHydrated': 'Stay hydrated',
    'alerts.limitOutdoor': 'Limit outdoor activities',
    
    // Time
    'time.today': 'Today',
    'time.tomorrow': 'Tomorrow',
    'time.now': 'Now',
    'time.days': 'days',
    'time.hours': 'hours',
    'time.minutes': 'minutes',
    
    // Days
    'day.sunday': 'Sunday',
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    
    // Search
    'search.placeholder': 'Search for a city...',
    'search.recent': 'Recent Searches',
    'search.noResults': 'No results found',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.units': 'Units',
    'settings.temperature': 'Temperature',
    'settings.celsius': 'Celsius',
    'settings.fahrenheit': 'Fahrenheit',
    'settings.notifications': 'Notifications',
    'settings.location': 'Location',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    
    // Favorites
    'favorites.title': 'Favorites',
    'favorites.add': 'Add to Favorites',
    'favorites.remove': 'Remove from Favorites',
    'favorites.empty': 'No favorite cities added',
    
    // Impact Score
    'impact.title': 'Impact Score',
    'impact.outdoor': 'Outdoor Activities',
    'impact.travel': 'Travel',
    'impact.sports': 'Sports',
    'impact.walking': 'Walking',
    'impact.excellent': 'Excellent',
    'impact.good': 'Good',
    'impact.moderate': 'Moderate',
    'impact.poor': 'Poor',
    
    // Recommendations
    'rec.title': 'Smart Recommendations',
    'rec.umbrella': 'Bring an umbrella',
    'rec.sunscreen': 'Use sunscreen',
    'rec.jacket': 'Wear a jacket',
    'rec.hydration': 'Drink water',
    'rec.indoor': 'Stay indoors',
    
    // AI Assistant
    'assistant.title': 'AI Weather Assistant',
    'assistant.placeholder': 'Ask about the weather...',
    'assistant.welcome': 'Hello! I\'m your AI weather assistant. How can I help you?',
    'assistant.thinking': 'Thinking...',
    
    // Map
    'map.title': 'Weather Map',
    'map.clouds': 'Clouds',
    'map.precipitation': 'Precipitation',
    'map.temperature': 'Temperature',
    'map.wind': 'Wind',
    
    // Errors
    'error.location': 'Failed to get location',
    'error.fetch': 'Failed to fetch data',
    'error.network': 'Network error',
    'error.retry': 'Retry',
    
    // Units
    'unit.kmh': 'km/h',
    'unit.mph': 'mph',
    'unit.mm': 'mm',
    'unit.in': 'in',
    'unit.hpa': 'hPa',
    'unit.km': 'km',
    'unit.mi': 'mi',
    
    // General
    'general.loading': 'Loading...',
    'general.refresh': 'Refresh',
    'general.cancel': 'Cancel',
    'general.save': 'Save',
    'general.close': 'Close',
    'general.back': 'Back',
  }
};

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      setLanguage: (lang: Language) => set({ language: lang }),
      t: (key: string) => {
        const state = get();
        return translations[state.language][key] || key;
      },
    }),
    {
      name: 'skypulse-language',
    }
  )
);

export const getDayName = (date: Date, language: Language): string => {
  const days = {
    ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  return days[language][date.getDay()];
};

export const formatTime = (date: Date, language: Language): string => {
  if (language === 'ar') {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
