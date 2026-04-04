import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'a8ca35a9b77f4024aa0dbca4198bdc22';
const BASE_URL = 'https://api.openweathermap.org';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q');

  try {
    let url: string;
    
    if (lat && lon) {
      url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else if (q) {
      url = `${BASE_URL}/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric`;
    } else {
      return NextResponse.json({ error: 'Location required' }, { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
