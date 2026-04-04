import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, weatherContext, language } = body;

    if (!message) {
      return NextResponse.json({ message: 'Message required' });
    }

    // Create ZAI instance
    const zai = await ZAI.create();

    // Build context
    let contextText = '';
    if (weatherContext) {
      contextText = language === 'ar' 
        ? `\nمعلومات الطقس الحالية:
- المدينة: ${weatherContext.city}, ${weatherContext.country}
- درجة الحرارة: ${weatherContext.temperature}°م
- الرطوبة: ${weatherContext.humidity}%
- الحالة: ${weatherContext.condition}`
        : `\nCurrent weather info:
- City: ${weatherContext.city}, ${weatherContext.country}
- Temperature: ${weatherContext.temperature}°C
- Humidity: ${weatherContext.humidity}%
- Condition: ${weatherContext.condition}`;
    }

    const systemContent = language === 'ar' 
      ? `أنت مساعد طقس ذكي اسمه SkyPulse. أجب على أسئلة المستخدم عن الطقس بشكل مختصر ومفيد باللغة العربية.${contextText}`
      : `You are SkyPulse, a friendly weather AI assistant. Answer weather questions concisely and helpfully.${contextText}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: systemContent
        },
        {
          role: 'user',
          content: message
        }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices?.[0]?.message?.content;
    
    if (!response) {
      return NextResponse.json({ 
        message: language === 'ar' ? 'عذراً، لم أتمكن من الرد.' : 'Sorry, no response generated.'
      });
    }

    return NextResponse.json({ message: response });
    
  } catch (error: any) {
    console.error('AI Chat error:', error?.message || error);
    return NextResponse.json({ 
      message: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
    });
  }
}
