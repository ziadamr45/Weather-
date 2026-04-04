import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface WeatherContext {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  description: string;
  city: string;
  country: string;
  aqi?: number;
  uv?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, weatherContext, language } = body as {
      message: string;
      weatherContext?: WeatherContext;
      language?: string;
    };

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = language === 'ar' 
      ? `أنت مساعد طقس ذكي ودود اسمه "SkyPulse". تجيب على أسئلة المستخدمين عن الطقس بشكل مفيد ومختصر باللغة العربية.
      
استخدم المعلومات التالية عن الطقس الحالي إذا كانت متوفرة:
${weatherContext ? `
- المدينة: ${weatherContext.city}, ${weatherContext.country}
- درجة الحرارة: ${weatherContext.temperature}°م
- الإحساس: ${weatherContext.feelsLike}°م
- الرطوبة: ${weatherContext.humidity}%
- سرعة الرياح: ${weatherContext.windSpeed} م/ث
- الحالة: ${weatherContext.condition} (${weatherContext.description})
${weatherContext.aqi ? `- مؤشر جودة الهواء: ${weatherContext.aqi}` : ''}
${weatherContext.uv ? `- مؤشر الأشعة فوق البنفسجية: ${weatherContext.uv}` : ''}
` : 'لا تتوفر معلومات الطقس حالياً.'}

كن مختصراً ومفيداً. إذا سأل المستخدم عن أنشطة خارجية، أعط نصيحة بناءً على حالة الطقس.`
      : `You are a friendly AI weather assistant named "SkyPulse". You answer users' questions about weather in a helpful and concise manner.

Use the following current weather information if available:
${weatherContext ? `
- City: ${weatherContext.city}, ${weatherContext.country}
- Temperature: ${weatherContext.temperature}°C
- Feels Like: ${weatherContext.feelsLike}°C
- Humidity: ${weatherContext.humidity}%
- Wind Speed: ${weatherContext.windSpeed} m/s
- Condition: ${weatherContext.condition} (${weatherContext.description})
${weatherContext.aqi ? `- Air Quality Index: ${weatherContext.aqi}` : ''}
${weatherContext.uv ? `- UV Index: ${weatherContext.uv}` : ''}
` : 'No weather information available.'}

Be concise and helpful. If the user asks about outdoor activities, give advice based on the weather conditions.`;

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'glm-4-plus',
      temperature: 0.7,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I could not process your request.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
