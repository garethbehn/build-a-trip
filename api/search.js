export const config = { runtime: 'edge' };

// ── TTC API CONFIG ────────────────────────────────────────────────────────────
// Base: https://api.ttc.com  Brand: contiki
// Auth: token:{API_TOKEN} (HTTP Basic) or Bearer JWT
// Docs: https://bookings.contiki.com
// Set TTC_API_TOKEN in Vercel environment variables to enable live data
const TTC_BASE = 'https://api.ttc.com';
const TTC_BRAND = 'contiki';

async function fetchTTCTours(ttcToken) {
  // Auth: HTTP Basic, username="token", password=API token
  // Use manual base64 — btoa() not available in all Vercel Edge runtimes
  const credentials = `token:${ttcToken}`;
  const encoded = Buffer.from(credentials).toString('base64');

  const res = await fetch(`${TTC_BASE}/brands/${TTC_BRAND}/tours`, {
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Accept': 'application/vnd.ttc.v4+json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`TTC API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();

  // Handle all known TTC response shapes defensively
  // Could be: plain array, { tours: [] }, { data: [] }, { _embedded: { tours: [] } }
  let raw = [];
  if (Array.isArray(data)) raw = data;
  else if (Array.isArray(data.tours)) raw = data.tours;
  else if (Array.isArray(data.data)) raw = data.data;
  else if (data._embedded && Array.isArray(data._embedded.tours)) raw = data._embedded.tours;
  else {
    // Surface the actual shape to help debug
    throw new Error(`TTC unexpected shape. Keys: ${Object.keys(data).join(', ')} | Sample: ${JSON.stringify(data).slice(0, 300)}`);
  }

  if (!raw.length) throw new Error('TTC returned 0 tours');

  return raw.map(tour => {
    // Navigate the nested TTC structure:
    // Content, images, itinerary, start/end are in:
    //   tour.tourOptions[0].seasons[0].content[0]
    // Departures and prices are in:
    //   tour.tourOptions[0].seasons[0].departures[0].sellingRegions[0]

    const option   = tour.tourOptions?.[0] || {};
    const season   = option.seasons?.[0] || {};
    const content  = season.content?.[0] || {};

    // Find the first available departure for this selling region
    const departures = season.departures || [];
    let departure = null;
    let selRegion = null;
    for (const dep of departures) {
      const sr = (dep.sellingRegions || []).find(r =>
        r.availability === 'available' || r.availability === 'onRequest'
      );
      if (sr) { departure = dep; selRegion = sr; break; }
    }
    // Fallback: just take the first departure/region regardless of availability
    if (!selRegion && departures[0]) {
      departure = departures[0];
      selRegion = departure.sellingRegions?.[0] || {};
    }

    // Duration: sum itinerary day durations, or count itinerary entries
    const itinerary = content.itinerary || [];
    const days = itinerary.reduce((n, d) => n + (d.duration || 1), 0) || itinerary.length || 0;

    // Route: unique locations across the itinerary
    const locations = [];
    for (const day of itinerary) {
      for (const loc of (day.locationsVisited || [])) {
        if (loc.name && !locations.includes(loc.name)) locations.push(loc.name);
      }
    }
    // Fallback: start → end place
    const startCity = content.startPlace?.city || '';
    const endCity   = content.endPlace?.city   || '';
    const route = locations.length
      ? locations.slice(0, 6).join(' → ')
      : [startCity, endCity].filter(Boolean).join(' → ');

    // Countries
    const countriesVisited = content.countriesVisited || [];
    const region = countriesVisited[0]?.continent || content.tourStyle || '';

    // Price: fromPrice.adultPrice from the departure sellingRegion
    const fromPrice = selRegion?.fromPrice?.adultPrice || 0;
    const currency  = selRegion?.currency || 'USD';

    // Dates
    const startDate = selRegion?.startDate || departure?.operatingStartDate || null;
    const endDate   = selRegion?.endDate   || null;

    // Image
    const photo = content.images?.[0]?.url || null;

    // Tags from departure sellingRegion
    const rawTags = selRegion?.tags || option.tags?.map(t => t.value) || [];
    const tags = rawTags.filter(Boolean);

    // Vibe string for AI semantic matching
    const vibe = [
      tour.name,
      region,
      content.description || '',
      content.tourStyle || '',
      countriesVisited.map(c => c.name).join(' '),
      locations.slice(0, 8).join(' '),
    ].join(' ');

    return {
      id: String(tour.id),
      title: tour.name || 'Untitled Tour',
      region,
      route,
      startCity,
      endCity,
      days,
      countries: countriesVisited.length || 1,
      price: fromPrice,
      currency,
      startDate,
      endDate,
      photo,
      bgColor: '#1C1C1C',
      tags,
      vibe,
      tourStyle: content.tourStyle || '',
      onlineBookable: content.onlineBookable || false,
      websiteUrl: option.websiteUrls?.find(w => w.sellingRegion === 'us')?.url || null,
      _ttc: tour, // preserve raw for downstream use
    };
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }); }

  const { query, trips: clientTrips } = body;
  if (!query) return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } });

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const ttcToken = process.env.TTC_API_TOKEN;

  // Use live TTC data if token available, else fall back to client-supplied mock trips
  let trips = clientTrips;
  let ttcError = null;
  if (ttcToken) {
    try {
      trips = await fetchTTCTours(ttcToken);
    } catch (e) {
      ttcError = e.message;
      console.error('TTC fetch failed:', ttcError);
      trips = clientTrips; // fall back to mock
    }
  }

  // No AI key — keyword fallback
  if (!anthropicKey) {
    const kwResult = keywordSearch(query, trips);
    if (ttcError) kwResult._ttcError = ttcError;
    return new Response(JSON.stringify(kwResult), {
      status: 200, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  // Live Claude semantic search
  const system = `You are a Contiki travel expert helping 18-35 year olds find group trips.
Given a free-text query, rank the best matching trips (up to 6) and explain briefly why each fits.
Respond ONLY with valid JSON, no markdown, no preamble:
{"summary":"1-2 sentence friendly summary of what you understood","matches":[{"id":"trip-id","reason":"one specific sentence why this trip fits","score":0.0}]}`;

  const tripList = trips.map(t =>
    `ID:${t.id} | ${t.title} | ${t.region} | ${t.days} days | $${t.price} | ${t.route}` +
    (t.startDate ? ` | Departs: ${t.startDate}` : '') +
    (t.startCity ? ` | Starts: ${t.startCity}` : '') +
    (t.endCity   ? ` | Ends: ${t.endCity}` : '') +
    ` | Vibe: ${t.vibe}`
  ).join('\n');

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 1000, system,
      messages: [{ role: 'user', content: `Query: "${query}"\n\nTrips:\n${tripList}` }],
    }),
  });

  if (!anthropicRes.ok) {
    const kwResult = keywordSearch(query, trips);
    if (ttcError) kwResult._ttcError = ttcError;
    return new Response(JSON.stringify(kwResult), {
      status: 200, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const data = await anthropicRes.json();
  const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

  // Merge AI scores back with full trip objects (inc live TTC data)
  const matches = parsed.matches.map(m => {
    const t = trips.find(x => String(x.id) === String(m.id));
    return t ? { ...t, aiReason: m.reason, score: m.score } : null;
  }).filter(Boolean);

  return new Response(JSON.stringify({ summary: parsed.summary, matches }), {
    status: 200, headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function keywordSearch(query, trips) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  const reasons = {
    'eu-highlights': "Covers Europe's most iconic cities across 7 countries in one trip.",
    'greek-islands': 'Island-hopping between Athens, Mykonos and Santorini.',
    'south-america': 'Adventure-packed route through Machu Picchu, the Andes and Uyuni.',
    'southeast-asia': 'Immerses you in temples, street food and beaches across 4 countries.',
    'safari': "Face-to-face with the Big Five across Kenya and Tanzania's greatest parks.",
    'japan': 'Balances ancient temples and neon cities across Tokyo, Kyoto and Osaka.',
    'budget-europe': 'Four iconic European cities in one week at an unbeatable price.',
    'costa-rica': 'Pure adventure through rainforests, volcanoes and Pacific coastline.',
    'morocco': 'Ancient medinas, Saharan desert camps and vibrant souks across 9 days.',
    'scandinavia': 'Fjords, Viking history and Nordic cities across three countries.',
    'aus-nz': 'The ultimate antipodean bucket list — bungee jumping, reef snorkelling and more.',
    'usa-parks': "America's most jaw-dropping canyon landscapes on an epic road trip.",
  };
  const scored = trips.map(t => {
    const corpus = [t.title, t.region, t.route, t.vibe, (t.tags||[]).join(' ')].join(' ').toLowerCase();
    let score = words.reduce((s, w) => s + (corpus.includes(w) ? 1 : 0), 0);
    if (corpus.includes(q)) score += 3;
    return { ...t, score: score / Math.max(words.length, 1), aiReason: reasons[t.id] || 'A strong match for your travel style.' };
  }).filter(t => t.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

  return {
    summary: `Here are the best trips matching "${query}" — keyword matching active. Add an API key for full AI-powered search.`,
    matches: scored,
  };
}

function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
