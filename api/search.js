export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MOCK_TRIPS = [
  { id:'eur-highlights-14', name:'European Highlights', geography:'Europe', destinations:['Paris','Amsterdam','Berlin','Prague','Vienna'], duration_days:14, departure_date:'2026-07-05', end_date:'2026-07-19', from_price:2900, currency:'USD', was_price:3225, image:'https://picsum.photos/seed/european-highlights/600/400', tags:['hot'], is_original:true },
  { id:'italy-greece-12', name:'Italian Greek Adventure', geography:'Europe', destinations:['Rome','Florence','Athens','Santorini'], duration_days:12, departure_date:'2026-07-12', end_date:'2026-07-24', from_price:3100, currency:'USD', was_price:null, image:'https://picsum.photos/seed/italy-greece/600/400', tags:['new'], is_original:false },
  { id:'japan-discovery-10', name:'Japan Discovery', geography:'Asia', destinations:['Tokyo','Kyoto','Osaka','Hiroshima'], duration_days:10, departure_date:'2026-08-02', end_date:'2026-08-12', from_price:3400, currency:'USD', was_price:null, image:'https://picsum.photos/seed/japan-discovery/600/400', tags:['bestseller'], is_original:true },
  { id:'se-asia-18', name:'Southeast Asia Explorer', geography:'Asia', destinations:['Bangkok','Chiang Mai','Luang Prabang','Hanoi','Hoi An'], duration_days:18, departure_date:'2026-09-01', end_date:'2026-09-19', from_price:2650, currency:'USD', was_price:2950, image:'https://picsum.photos/seed/southeast-asia/600/400', tags:['hot','sale'], is_original:false },
  { id:'nz-adventure-8', name:'New Zealand Adventure', geography:'Australasia', destinations:['Auckland','Rotorua','Queenstown','Milford Sound'], duration_days:8, departure_date:'2026-10-05', end_date:'2026-10-13', from_price:2200, currency:'USD', was_price:null, image:'https://picsum.photos/seed/new-zealand/600/400', tags:['new'], is_original:false },
  { id:'bali-7', name:'Bali Breeze', geography:'Asia', destinations:['Seminyak','Ubud','Nusa Penida','Canggu'], duration_days:7, departure_date:'2026-08-15', end_date:'2026-08-22', from_price:1850, currency:'USD', was_price:2100, image:'https://picsum.photos/seed/bali/600/400', tags:['sale'], is_original:false },
  { id:'morocco-10', name:'Morocco Magic', geography:'Africa', destinations:['Casablanca','Fes','Merzouga','Marrakech'], duration_days:10, departure_date:'2026-07-20', end_date:'2026-07-30', from_price:2400, currency:'USD', was_price:null, image:'https://picsum.photos/seed/morocco/600/400', tags:[], is_original:true },
  { id:'peru-9', name:'Peruvian Wonders', geography:'Latin America', destinations:['Lima','Cusco','Machu Picchu','Sacred Valley'], duration_days:9, departure_date:'2026-09-15', end_date:'2026-09-24', from_price:2750, currency:'USD', was_price:null, image:'https://picsum.photos/seed/peru/600/400', tags:['bestseller'], is_original:false },
];

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { query, trips: clientTrips } = await req.json();

    // Use live TTC tours if token present, else fall back to client-supplied or mock
    let trips = clientTrips || MOCK_TRIPS;
    if (process.env.TTC_API_TOKEN) {
      try {
        const ttcRes = await fetch('https://api.ttc.com/brands/contiki/tours', {
          headers: {
            Authorization: `Basic ${btoa('token:' + process.env.TTC_API_TOKEN)}`,
            Accept: 'application/vnd.ttc.v4+json',
          },
        });
        if (ttcRes.ok) {
          const data = await ttcRes.json();
          trips = (data.tours || data).map(t => ({
            id: t.id, name: t.name, geography: t.geography,
            destinations: t.destinations || [],
            duration_days: t.duration_days,
            departure_date: t.departure_date, end_date: t.end_date,
            from_price: t.from_price, currency: t.currency,
            image: t.images?.[0]?.url || '',
            tags: [t.is_new && 'new', t.is_hot && 'hot', t.has_promotion && 'sale'].filter(Boolean),
            is_original: t.is_original || false,
          }));
        }
      } catch { /* fall through to mock */ }
    }

    // Use Anthropic if key present
    if (process.env.ANTHROPIC_API_KEY) {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a Contiki travel expert helping 18-35 year olds find group trips.
Given a free-text query, rank the best matching trips (up to 6) and explain briefly why each fits.
Respond ONLY with valid JSON, no markdown:
{"summary":"...","matches":[{"id":"...","reason":"...","score":0.0}]}`,
          messages: [{
            role: 'user',
            content: `Query: "${query}"\n\nTrips:\n${JSON.stringify(trips.map(t => ({ id:t.id, name:t.name, geography:t.geography, destinations:t.destinations, duration_days:t.duration_days, from_price:t.from_price, tags:t.tags })))}`,
          }],
        }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const text = aiData.content?.[0]?.text || '';
        const parsed = JSON.parse(text);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
    }

    // Keyword fallback
    return new Response(JSON.stringify(keywordSearch(query, trips)), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Search failed', _mock: true }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}

function keywordSearch(query, trips) {
  const q = query.toLowerCase();
  const scored = trips.map(t => {
    let score = 0;
    if (q.includes(t.geography.toLowerCase())) score += 0.5;
    t.destinations.forEach(d => { if (q.includes(d.toLowerCase())) score += 0.3; });
    if (q.includes(t.name.toLowerCase())) score += 0.4;
    if (q.includes('cheap') || q.includes('budget')) score += t.from_price < 2500 ? 0.2 : -0.1;
    if (q.includes('long') || q.includes('extended')) score += t.duration_days > 12 ? 0.2 : -0.1;
    if (q.includes('short') || q.includes('quick')) score += t.duration_days < 10 ? 0.2 : -0.1;
    return { trip: t, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  const matches = scored.slice(0, 6).map(({ trip, score }) => ({
    id: trip.id,
    reason: `A great match for "${query}" — ${trip.duration_days} days across ${trip.geography}`,
    score: Math.min(0.99, score),
  }));

  return {
    summary: `Found ${matches.length} trips matching "${query}"`,
    matches: matches.length ? matches : trips.slice(0, 4).map(t => ({
      id: t.id,
      reason: `Popular ${t.geography} tour — might suit your interests`,
      score: 0.6,
    })),
  };
}
