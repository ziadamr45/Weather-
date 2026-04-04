import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, weatherContext, language } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Create ZAI instance
    const zai = await ZAI.create();

    // Build context string
    let contextStr = '';
    if (weatherContext) {
      contextStr = language === 'ar' 
        ? `\n\nمعلومات الطقس الحالي:
- المدينة: ${weatherContext.city}, ${weatherContext.country}
- درجة الحرارة: ${weatherContext.temperature}°م
- الرطوبة: ${weatherContext.humidity}%
- سرعة الرياح: ${weatherContext.windSpeed} م/ث
- الحالة: ${weatherContext.condition}`
        : `\n\nCurrent weather:
- City: ${weatherContext.city}, ${weatherContext.country}
- Temperature: ${weatherContext.temperature}°C
- Humidity: ${weatherContext.humidity}%
- Wind Speed: ${weatherContext.windSpeed} m/s
- Condition: ${weatherContext.condition}`;
    }

    const systemPrompt = language === 'ar' 
      ? `أنت مساعد طقس ذكي اسمه SkyPulse. تجيب على أسئلة المستخدمين عن الطقس بشكل مختصر ومفيد باللغة العربية.${contextStr}`
      : `You are a friendly AI weather assistant named SkyPulse. Answer questions about weather concisely and helpfully.${contextStr}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices?.[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json({ 
        message: language === 'ar' 
          ? 'عذراً، لم أتمكن من فهم طلبك.' 
          : 'Sorry, I could not process your request.' 
      });
    }

    return NextResponse.json({ message: responseText });
    
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ 
      message: 'عذراً، حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.',
      error: error?.message || 'Unknown error'
    });
  }
}
