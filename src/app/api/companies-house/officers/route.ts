import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyNumber = searchParams.get('companyNumber');

  if (!companyNumber) {
    return NextResponse.json({ error: 'Query parameter "companyNumber" is required' }, { status: 400 });
  }

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.company-information.service.gov.uk/company/${encodeURIComponent(companyNumber)}/officers`, {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ items: [] });
      }
      throw new Error(`Companies House API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching company officers:', error);
    return NextResponse.json({ error: 'Failed to fetch officers data' }, { status: 500 });
  }
}
