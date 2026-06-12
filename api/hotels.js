export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function mockHotels(location) {
  return [
    { id:`mock-h1-${location}`, name:`${location} Grand Hotel`, address:`Central ${location}`, rating:4.5, reviews:2134, price_level:'$$$', maps_url:`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(location)}`, _mock:true },
    { id:`mock-h2-${location}`, name:`${location} Boutique Stay`, address:`Old Town, ${location}`, rating:4.3, reviews:876, price_level:'$$', maps_url:`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(location)}`, _mock:true },
    { id:`mock-h3-${location}`, name:`The ${location} Collection`, address:`${location} City Centre`, rating:4.7, reviews:3210, price_level:'$$$$', maps_url:`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(location)}`, _mock:true },
  ];
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { location, check_in, check_out } = await req.json();

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return new Response(JSON.stringify(mockHotels(location)), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Google Places New API — searchText
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.id',
      },
      body: JSON.stringify({ textQuery: `hotels in ${location}` }),
    });

    if (!placesRes.ok) {
      return new Response(JSON.stringify(mockHotels(location)), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const placesData = await placesRes.json();
    const places = placesData.places || [];

    const results = places.slice(0, 5).map(p => ({
      id: p.id,
      name: p.displayName?.text || 'Hotel',
      address: p.formattedAddress || location,
      rating: p.rating || 4.0,
      reviews: p.userRatingCount || 0,
      price_level: p.priceLevel || '$$',
      photo_name: p.photos?.[0]?.name || null,
      maps_url: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    }));

    return new Response(JSON.stringify(results.length ? results : mockHotels(location)), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch {
    return new Response(JSON.stringify(mockHotels('the selected city')), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
