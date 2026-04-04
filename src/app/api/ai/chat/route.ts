import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Force Node.js runtime for Vercel
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, weatherContext, language } = body;

    console.log('[AI Chat] Received request:', { message, language, hasContext: !!weatherContext });

    if (!message) {
      console.log('[AI Chat] No message provided');
      return NextResponse.json({ message: 'Message required' });
    }

    // Create ZAI instance
    console.log('[AI Chat] Creating ZAI instance...');
    const zai = await ZAI.create();
    console.log('[AI Chat] ZAI instance created');

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
      ? `أنت مساعد طقس ذكي اسمه SkyPulse. أجب على أسئلة المستخدم عن الطقس بشكل مختصر ومفيد.${contextText}`
      : `You are SkyPulse, a friendly weather AI assistant. Answer weather questions concisely and helpfully.${contextText}`;

    // Use the exact pattern from the LLM skill documentation
    console.log('[AI Chat] Sending request to AI...');
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

    console.log('[AI Chat] Received completion:', JSON.stringify(completion, null, 2));

    const response = completion.choices?.[0]?.message?.content;
    
    if (!response || response.trim().length === 0) {
      console.error('[AI Chat] Empty response from AI');
      return NextResponse.json({ 
        message: language === 'ar' ? 'عذراً، لم أتمكن من الرد.' : 'Sorry, no response generated.'
      });
    }

    console.log('[AI Chat] Success! Response:', response);
    return NextResponse.json({ message: response });
    
  } catch (error: any) {
    console.error('[AI Chat] Error:', error?.message || error);
    console.error('[AI Chat] Error stack:', error?.stack);
    return NextResponse.json({ 
      message: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
    });
  }
}
