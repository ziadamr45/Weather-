import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'a8ca35a9b77f4024aa0dbca4198bdc22';
const BASE_URL = 'https://api.openweathermap.org';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const limit = searchParams.get('limit') || '5';

  if (!q) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
