export const config = { runtime: 'edge' };

// LiteAPI — hotel search proxy
// Docs: https://docs.liteapi.travel/reference/overview
// Auth: X-API-key header
// Flow: 1) GET /data/hotels (get IDs for city/location)
//        2) POST /hotels/rates (get live rates for those IDs)
// Set LITEAPI_KEY in Vercel environment variables

const LITE_BASE = 'https://api.liteapi.travel/v3.0';

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...cors() } });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }); }

  const { location, check_in, check_out, country_code, lat, lng, radius_meters = 5000 } = body;

  if (!location && !lat) {
    return new Response(JSON.stringify({ error: 'Missing location or lat/lng' }), { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } });
  }

  const liteKey = process.env.LITEAPI_KEY;
  if (!liteKey) {
    return new Response(JSON.stringify({ error: 'LITEAPI_KEY not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  try {
    // ── STEP 1: Get hotel IDs for the location ──────────────────────────────
    let hotelIds = [];

    if (lat && lng) {
      // Geo-fenced search by lat/lng + radius (preferred — scopes to gap city area)
      const geoUrl = `${LITE_BASE}/data/hotels?latitude=${lat}&longitude=${lng}&radius=${radius_meters}&limit=20`;
      const geoRes = await fetch(geoUrl, { headers: liteHeaders(liteKey) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        hotelIds = (geoData.data || []).map(h => h.id).filter(Boolean).slice(0, 20);
      }
    } else {
      // City name search — derive countryCode from location if not supplied
      const cc = country_code || cityToCountryCode(location);
      const cityUrl = `${LITE_BASE}/data/hotels?countryCode=${cc}&cityName=${encodeURIComponent(location)}&limit=20`;
      const cityRes = await fetch(cityUrl, { headers: liteHeaders(liteKey) });
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        // API returns HotelIds as comma-delimited string OR as array depending on version
        const raw = cityData.data?.HotelIds || cityData.data || [];
        hotelIds = typeof raw === 'string'
          ? raw.split(',').slice(0, 20)
          : raw.map(h => h.id || h).slice(0, 20);
      }
    }

    if (!hotelIds.length) {
      return new Response(JSON.stringify({ error: 'No hotels found for location', location }), {
        status: 404, headers: { 'Content-Type': 'application/json', ...cors() },
      });
    }

    // ── STEP 2: Get rates for those hotels ─────────────────────────────────
    const checkin  = check_in  || formatDate(new Date());
    const checkout = check_out || formatDate(addDays(new Date(), 2));

    const ratesRes = await fetch(`${LITE_BASE}/hotels/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...liteHeaders(liteKey) },
      body: JSON.stringify({
        hotelIds,
        checkin,
        checkout,
        occupancies: [{ adults: 1 }],
        currency: 'USD',
        guestNationality: 'GB',
        includeHotelData: true,  // ensures hotel name, address, photos included in response
      }),
    });

    if (!ratesRes.ok) {
      const err = await ratesRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: `LiteAPI rates error ${ratesRes.status}`, detail: err.slice(0,200) }), {
        status: ratesRes.status, headers: { 'Content-Type': 'application/json', ...cors() },
      });
    }

    const ratesData = await ratesRes.json();
    const hotels = (ratesData.data || [])
      .filter(h => h.roomTypes && h.roomTypes.length > 0)
      .slice(0, 5)
      .map(h => {
        const cheapestRoom = h.roomTypes
          .flatMap(rt => rt.rates || [])
          .sort((a, b) => (a.retailRate?.total?.[0]?.amount || 0) - (b.retailRate?.total?.[0]?.amount || 0))[0];
        const price = cheapestRoom?.retailRate?.total?.[0];
        return {
          id: h.hotelId,
          name: h.hotel?.name || h.hotelData?.name || h.name || h.hotelId,
          address: [h.hotel?.address || h.hotelData?.address, h.hotel?.city || h.hotelData?.city, h.hotel?.country || h.hotelData?.country].filter(Boolean).join(', '),
          rating: h.hotel?.stars || h.hotelData?.starRating || h.hotel?.starRating || null,
          reviews: null, // LiteAPI doesn't return review count in rates endpoint
          price_per_night: price?.amount || null,
          currency: price?.currency || 'USD',
          room_type: cheapestRoom?.name || null,
          cancellation: cheapestRoom?.cancellationPolicies?.[0]?.type || null,
          offer_id: cheapestRoom?.offerId || null,
          photo: h.hotel?.main_photo || h.hotelData?.hotelImages?.[0]?.url || h.hotel?.thumbnail || null,
          maps_url: h.hotel?.latitude && h.hotel?.longitude
            ? `https://www.google.com/maps/search/?api=1&query=${h.hotel.latitude},${h.hotel.longitude}`
            : null,
        };
      });

    return new Response(JSON.stringify({ hotels, location, check_in: checkin, check_out: checkout }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...cors() },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'LiteAPI error', detail: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function liteHeaders(key) {
  return { 'X-API-key': key, 'Accept': 'application/json' };
}

// Best-effort city → ISO country code map for common Contiki destinations
function cityToCountryCode(city) {
  const map = {
    'rome': 'IT', 'florence': 'IT', 'venice': 'IT', 'milan': 'IT',
    'paris': 'FR', 'nice': 'FR', 'lyon': 'FR',
    'london': 'GB', 'edinburgh': 'GB', 'manchester': 'GB',
    'amsterdam': 'NL', 'rotterdam': 'NL',
    'barcelona': 'ES', 'madrid': 'ES', 'seville': 'ES',
    'athens': 'GR', 'mykonos': 'GR', 'santorini': 'GR', 'thessaloniki': 'GR',
    'berlin': 'DE', 'munich': 'DE', 'hamburg': 'DE',
    'prague': 'CZ', 'vienna': 'AT', 'budapest': 'HU', 'warsaw': 'PL',
    'bangkok': 'TH', 'chiang mai': 'TH', 'phuket': 'TH',
    'hanoi': 'VN', 'ho chi minh': 'VN', 'hoi an': 'VN',
    'bali': 'ID', 'jakarta': 'ID',
    'tokyo': 'JP', 'kyoto': 'JP', 'osaka': 'JP',
    'singapore': 'SG', 'kuala lumpur': 'MY',
    'nairobi': 'KE', 'mombasa': 'KE',
    'cape town': 'ZA', 'johannesburg': 'ZA',
    'marrakech': 'MA', 'casablanca': 'MA', 'fes': 'MA',
    'cairo': 'EG',
    'dubai': 'AE', 'abu dhabi': 'AE',
    'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'queenstown': 'NZ', 'auckland': 'NZ',
    'new york': 'US', 'los angeles': 'US', 'las vegas': 'US', 'miami': 'US', 'san francisco': 'US',
    'cancun': 'MX', 'mexico city': 'MX',
    'lima': 'PE', 'cusco': 'PE',
    'buenos aires': 'AR', 'rio de janeiro': 'BR', 'sao paulo': 'BR',
    'bogota': 'CO', 'cartagena': 'CO',
    'san jose': 'CR',
    'la paz': 'BO', 'uyuni': 'BO',
    'copenhagen': 'DK', 'oslo': 'NO', 'bergen': 'NO', 'stockholm': 'SE',
  };
  const k = (city || '').toLowerCase().trim();
  return map[k] || Object.entries(map).find(([c]) => k.includes(c))?.[1] || 'GB';
}

function formatDate(d) { return d.toISOString().split('T')[0]; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }


function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
