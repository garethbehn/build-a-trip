export const config = { runtime: 'edge' };

const TTC_BASE  = 'https://api.ttc.com';
const TTC_BRAND = 'contiki';

// ── TTC RAW → CLEAN SHAPE ─────────────────────────────────────────────────────
function parseTour(raw) {
  const option  = raw.tourOptions?.[0] || {};
  const season  = option.seasons?.[0]  || {};
  const content = season.content?.[0]  || {};

  const itinerary = content.itinerary || [];
  const days = itinerary.reduce((n, d) => n + (d.duration || 1), 0) || itinerary.length;

  const images = (content.images || [])
    .map(img => ({ url: img.url || img.src || '', alt: img.caption || img.alt || raw.name || '' }))
    .filter(i => i.url);

  const countriesVisited = (content.countriesVisited || [])
    .map(c => (typeof c === 'string' ? c : c.name || '')).filter(Boolean);

  const region = content.countriesVisited?.[0]?.continent
    || option.tags?.[0]?.value
    || content.tourStyle
    || '';

  const parsedItinerary = itinerary.map(day => {
    const texts = Array.isArray(day.text)
      ? day.text.filter(Boolean)
      : [day.text || day.description || ''].filter(Boolean);
    const meals = (day.meals || [])
      .map(m => (typeof m === 'string' ? m : m.type || m.name || ''))
      .filter(Boolean);
    const accommodation = typeof day.accommodation === 'string'
      ? day.accommodation
      : day.accommodation?.name || '';
    return {
      startDay:         day.startDay || 1,
      endDay:           day.endDay   || day.startDay || 1,
      duration:         day.duration || 1,
      title:            day.title    || day.header   || `Day ${day.startDay}`,
      locationsVisited: (day.locationsVisited || []).map(l => ({ name: l.name || l.city || String(l) })),
      description:      texts.join('\n'),
      accommodation,
      meals,
    };
  });

  const parsedDepartures = (season.departures || []).map(dep => {
    const sr = (dep.sellingRegions || [])[0] || {};
    const roomTypes = (
      dep.roomsOccupancy ||
      season.accommodation?.[0]?.roomsOccupancy ||
      []
    ).map(r => ({ type: r.type || r.name || 'Twin', supplement: r.supplement || r.priceDifference || 0 }));

    return {
      id:           dep.id || dep.departureId || String(dep.operatingStartDate || Math.random()),
      startDate:    sr.startDate  || dep.operatingStartDate || '',
      endDate:      sr.endDate    || dep.operatingEndDate   || '',
      availability: sr.availability || 'unavailable',
      adultPrice:   sr.fromPrice?.adultPrice || 0,
      currency:     sr.currency  || 'USD',
      wasPrice:     sr.oldFullPrice || null,
      discounts:    sr.discounts || [],
      roomTypes:    roomTypes.length ? roomTypes : [
        { type: 'Twin',   supplement:    0 },
        { type: 'Single', supplement:  450 },
      ],
      bookingLink: dep.links?.book || null,
    };
  });

  const allTags = [
    ...(option.tags || []).map(t => (typeof t === 'string' ? t : t.value || '').toLowerCase()),
    ...(raw.tags   || []).map(t => (typeof t === 'string' ? t : t.value || '').toLowerCase()),
  ];

  return {
    id:             String(raw.id),
    title:          raw.name        || 'Contiki Tour',
    region,
    tourStyle:      content.tourStyle       || '',
    onlineBookable: content.onlineBookable  || false,
    isOriginal:     allTags.some(t => t.includes('original')),
    days,
    countriesVisited,
    startCity:      content.startPlace?.city || '',
    endCity:        content.endPlace?.city   || '',
    images,
    description:    content.description || '',
    highlights:     content.highlights  || [],
    itinerary:      parsedItinerary,
    whatsIncluded:  content.whatsIncluded || [],
    accommodation:  (season.accommodation || []).map(a => ({
      name:      a.name      || '',
      type:      a.type      || 'Hotel',
      occupancy: a.occupancy || a.description || '',
    })),
    departures: parsedDepartures,
  };
}

// ── MOCK DATA (returned when TTC_API_TOKEN absent) ────────────────────────────
function mockTour(id) {
  return {
    id,
    title:          'European Highlights',
    region:         'Europe',
    tourStyle:      'Classic',
    onlineBookable: true,
    isOriginal:     false,
    days:           14,
    countriesVisited: ['France', 'Germany', 'Czech Republic', 'Austria'],
    startCity: 'Paris',
    endCity:   'Vienna',
    images: [
      { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1400&q=80', alt: 'Paris at dusk' },
      { url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400&q=80', alt: 'Prague Old Town' },
      { url: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1400&q=80', alt: 'Vienna skyline' },
      { url: 'https://images.unsplash.com/photo-1473951574080-01fe45ec8643?w=1400&q=80', alt: 'Munich beer garden' },
    ],
    description: 'Dive deep into the heart of Europe on this 14-day adventure built for curious 18–35s. From the romance of Paris to the medieval magic of Prague and the imperial grandeur of Vienna — every day brings something new. You\'ll travel with a crew of like-minded explorers, guided by a Contiki Trip Manager who knows these cities inside out. Expect hidden bars, local food markets, iconic landmarks, and the kind of nights that become stories you\'ll tell for years.',
    highlights: [
      { title: 'Epic moments', items: ['Sunset from the Eiffel Tower', 'Late night in Prague\'s Old Town Square', 'Mozart concert in Vienna', 'Bavarian beer hall dinner in Munich'] },
      { title: 'Included experiences', items: ['Seine River cruise, Paris', 'Prague Castle guided tour', 'Wiener Schnitzel farewell dinner', 'Old Town evening walk, Heidelberg'] },
      { title: 'Local expertise', items: ['Expert Trip Manager throughout', 'Local guides in each city', 'Hand-picked 3★ & 4★ hotels', 'All internal transport included'] },
    ],
    itinerary: [
      { startDay: 1,  duration: 1, title: 'Arrive Paris',           locationsVisited: [{ name: 'Paris' }],                     description: 'Your adventure begins in the City of Light. Check in, meet your travel crew and Trip Manager, and kick things off with a welcome dinner before your first taste of Parisian nightlife.',             accommodation: 'Best Western Plus Isidore, Paris',      meals: ['Dinner'] },
      { startDay: 2,  duration: 1, title: 'Paris — Icons & Hidden', locationsVisited: [{ name: 'Paris' }],                     description: 'Start at the Louvre, then join your Trip Manager for a walking tour through Le Marais. Afternoon free — Montmartre at sunset is highly recommended.',                                              accommodation: 'Best Western Plus Isidore, Paris',      meals: ['Breakfast'] },
      { startDay: 3,  duration: 1, title: 'Paris → Heidelberg',     locationsVisited: [{ name: 'Paris' }, { name: 'Heidelberg' }], description: 'Morning at leisure before a private coach north-east to Heidelberg — Germany\'s most romantic university town. An evening stroll across the iconic Old Bridge.',                           accommodation: 'Hotel Hirschgasse, Heidelberg',         meals: ['Breakfast'] },
      { startDay: 4,  duration: 1, title: 'Heidelberg → Munich',    locationsVisited: [{ name: 'Heidelberg' }, { name: 'Munich' }], description: 'South to Munich, Bavaria\'s beating heart. Hit the Englischer Garten, explore Marienplatz, and spend the evening in a traditional beer hall with your crew.',                             accommodation: 'Hotel Regent, Munich',                  meals: ['Breakfast', 'Dinner'] },
      { startDay: 5,  duration: 1, title: 'Munich Free Day',        locationsVisited: [{ name: 'Munich' }],                    description: 'A full free day — day trip to Neuschwanstein Castle, the BMW Museum, or simply wander the Viktualienmarkt. Tonight\'s yours.',                                                                accommodation: 'Hotel Regent, Munich',                  meals: ['Breakfast'] },
      { startDay: 6,  duration: 1, title: 'Munich → Salzburg',      locationsVisited: [{ name: 'Munich' }, { name: 'Salzburg' }], description: 'Cross the Austrian border to Mozart\'s birthplace. Explore the Getreidegasse, wander Mirabell Gardens, and take in the Sound of Music scenery.',                                              accommodation: 'Hotel Stein, Salzburg',                 meals: ['Breakfast'] },
      { startDay: 7,  duration: 1, title: 'Salzburg → Vienna',      locationsVisited: [{ name: 'Salzburg' }, { name: 'Vienna' }], description: 'Morning at Hohensalzburg Fortress before heading east to Vienna. Check in, then a guided evening walk along the grand Ringstraße.',                                                              accommodation: 'Vienna City Suites',                    meals: ['Breakfast'] },
      { startDay: 8,  duration: 1, title: 'Vienna — Imperial Day',  locationsVisited: [{ name: 'Vienna' }],                    description: 'Schönbrunn Palace in the morning, the Kunsthistorisches Museum in the afternoon, and a Mozart & Strauss concert in the evening. The full Vienna experience.',                                   accommodation: 'Vienna City Suites',                    meals: ['Breakfast', 'Dinner'] },
      { startDay: 9,  duration: 1, title: 'Vienna → Brno',          locationsVisited: [{ name: 'Vienna' }, { name: 'Brno' }],  description: 'Head north into the Czech Republic to Brno — the country\'s second city and an underrated gem. Evening walking tour of the Old Town.',                                                              accommodation: 'Barceló Brno Palace',                   meals: ['Breakfast'] },
      { startDay: 10, duration: 1, title: 'Brno → Prague',          locationsVisited: [{ name: 'Brno' }, { name: 'Prague' }],  description: 'Arrive in Prague — the crown jewel of Central Europe. Check in and head straight out into the Old Town. Tonight belongs to you.',                                                                 accommodation: 'Hotel Paris Prague',                    meals: ['Breakfast'] },
      { startDay: 11, duration: 1, title: 'Prague — Castles',       locationsVisited: [{ name: 'Prague' }],                    description: 'Guided tour of Prague Castle and St Vitus Cathedral in the morning. Afternoon free. Tonight: whatever Prague throws at you.',                                                                      accommodation: 'Hotel Paris Prague',                    meals: ['Breakfast'] },
      { startDay: 12, duration: 1, title: 'Prague Free Day',        locationsVisited: [{ name: 'Prague' }],                    description: 'A full free day. Consider the Josefov Jewish Quarter, Letná Park beer garden, or a day trip to Kutná Hora\'s Bone Church.',                                                                      accommodation: 'Hotel Paris Prague',                    meals: ['Breakfast'] },
      { startDay: 13, duration: 1, title: 'Prague → Dresden',       locationsVisited: [{ name: 'Prague' }, { name: 'Dresden' }], description: 'Head north to Dresden, the baroque "Florence of the Elbe". Explore the Zwinger Palace and the rebuilt Frauenkirche before a final evening out.',                                              accommodation: 'Hotel Taschenbergpalais, Dresden',      meals: ['Breakfast'] },
      { startDay: 14, duration: 1, title: 'Farewell — Berlin',      locationsVisited: [{ name: 'Dresden' }, { name: 'Berlin' }], description: 'Final morning in Dresden before travelling to Berlin for onward journeys. The end of one adventure — and the beginning of planning the next.',                                                   accommodation: null,                                    meals: [] },
    ],
    whatsIncluded: [
      { title: 'Transport',      items: ['All internal transport by private air-conditioned coach', 'Train travel on select legs', 'Airport transfers not included'] },
      { title: 'Accommodation',  items: ['13 nights in 3★ & 4★ hotels', 'Twin-share basis (single supplement available)', 'Triple rooms on select departures'] },
      { title: 'Meals',          items: ['Daily continental breakfast (days 2–14)', '3 included dinners (nights 1, 4, 8)', 'Welcome drinks on arrival night'] },
      { title: 'Experiences',    items: ['Seine River cruise, Paris', 'Prague Castle guided tour', 'Mozart & Strauss concert, Vienna', 'Expert Trip Manager throughout 14 days'] },
    ],
    accommodation: [
      { name: 'Best Western Plus Isidore, Paris',     type: 'Hotel ★★★',   occupancy: 'Twin / single / triple' },
      { name: 'Hotel Regent, Munich',                 type: 'Hotel ★★★★',  occupancy: 'Twin / single' },
      { name: 'Vienna City Suites',                   type: 'Hotel ★★★★',  occupancy: 'Twin / single / triple' },
      { name: 'Hotel Paris Prague',                   type: 'Hotel ★★★★★', occupancy: 'Twin / single' },
    ],
    departures: [
      { id: 'dep-1', startDate: '2026-07-05', endDate: '2026-07-19', availability: 'available',  adultPrice: 2900, currency: 'USD', wasPrice: 3225, discounts: [{ type: 'Early Bird', amount: 325 }], roomTypes: [{ type: 'Twin', supplement: 0 }, { type: 'Single', supplement: 450 }, { type: 'Triple', supplement: -150 }], bookingLink: null },
      { id: 'dep-2', startDate: '2026-07-19', endDate: '2026-08-02', availability: 'available',  adultPrice: 3100, currency: 'USD', wasPrice: null, discounts: [], roomTypes: [{ type: 'Twin', supplement: 0 }, { type: 'Single', supplement: 450 }], bookingLink: null },
      { id: 'dep-3', startDate: '2026-08-02', endDate: '2026-08-16', availability: 'onRequest',  adultPrice: 2750, currency: 'USD', wasPrice: null, discounts: [], roomTypes: [{ type: 'Twin', supplement: 0 }, { type: 'Single', supplement: 450 }], bookingLink: null },
      { id: 'dep-4', startDate: '2026-08-16', endDate: '2026-08-30', availability: 'available',  adultPrice: 3050, currency: 'USD', wasPrice: null, discounts: [], roomTypes: [{ type: 'Twin', supplement: 0 }, { type: 'Single', supplement: 450 }], bookingLink: null },
      { id: 'dep-5', startDate: '2026-09-06', endDate: '2026-09-20', availability: 'unavailable',adultPrice: 2800, currency: 'USD', wasPrice: null, discounts: [], roomTypes: [{ type: 'Twin', supplement: 0 }, { type: 'Single', supplement: 450 }], bookingLink: null },
    ],
    _mock: true,
  };
}

// ── HANDLER ───────────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });

  const url = new URL(req.url);
  const id  = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id parameter' }, 400);

  const ttcToken = process.env.TTC_API_TOKEN;
  if (!ttcToken) return json(mockTour(id), 200);

  const credentials = `token:${ttcToken}`;
  const encoded     = Buffer.from(credentials).toString('base64');
  const headers     = {
    'Authorization': `Basic ${encoded}`,
    'Accept':        'application/vnd.ttc.v4+json',
    'Content-Type':  'application/json',
  };

  // Try dedicated single-tour endpoint first
  try {
    const res = await fetch(`${TTC_BASE}/brands/${TTC_BRAND}/tours/${id}`, { headers });
    if (res.ok) {
      const raw  = await res.json();
      const tour = Array.isArray(raw) ? raw[0] : raw;
      if (tour?.id) return json(parseTour(tour), 200);
    }
  } catch { /* fall through to list endpoint */ }

  // Fall back to full list + filter
  try {
    const res = await fetch(`${TTC_BASE}/brands/${TTC_BRAND}/tours`, { headers });
    if (!res.ok) throw new Error(`TTC ${res.status}`);
    const data = await res.json();

    let tours = [];
    if (Array.isArray(data))                          tours = data;
    else if (Array.isArray(data.tours))               tours = data.tours;
    else if (Array.isArray(data.data))                tours = data.data;
    else if (data._embedded?.tours)                   tours = data._embedded.tours;

    const tour = tours.find(t => String(t.id) === String(id));
    if (!tour) return json({ error: 'Tour not found', id }, 404);
    return json(parseTour(tour), 200);
  } catch (e) {
    return json({ error: 'Failed to fetch tour data', detail: e.message }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
