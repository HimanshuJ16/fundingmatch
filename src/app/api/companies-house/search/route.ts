import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(q)}`, {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Companies House API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 500 });
  }
}
