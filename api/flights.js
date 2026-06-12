export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MOCK_FLIGHTS = [
  { offer_id:'mock-1', flight:'BA204', airline:'British Airways', departing_at:'09:15', arriving_at:'14:30', price:189, currency:'USD', booking_url:'#', _mock:true },
  { offer_id:'mock-2', flight:'U2447', airline:'easyJet', departing_at:'14:00', arriving_at:'19:20', price:124, currency:'USD', booking_url:'#', _mock:true },
  { offer_id:'mock-3', flight:'LH332', airline:'Lufthansa', departing_at:'17:45', arriving_at:'23:05', price:215, currency:'USD', booking_url:'#', _mock:true },
];

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { origin, destination, departure_date, trip_b_start_iso, min_buffer_hours = 4, city_transfer_minutes = 120 } = await req.json();

    if (!process.env.DUFFEL_API_KEY) {
      return new Response(JSON.stringify(MOCK_FLIGHTS), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Single Duffel call with return_offers=true
    const duffelRes = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date, origin_type: 'airport', destination_type: 'airport' }],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });

    if (!duffelRes.ok) {
      return new Response(JSON.stringify(MOCK_FLIGHTS), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const duffelData = await duffelRes.json();
    const offers = duffelData.data?.offers || [];

    // Direct-only filter
    let filtered = offers.filter(o => o.slices?.[0]?.segments?.length === 1);

    // Feasibility filter
    if (trip_b_start_iso) {
      const latestArrival = new Date(new Date(trip_b_start_iso).getTime()
        - (min_buffer_hours * 3600 + city_transfer_minutes * 60) * 1000);
      filtered = filtered.filter(o => {
        const arriving = new Date(o.slices[0].segments[0].arriving_at);
        return arriving <= latestArrival;
      });
    }

    // Sort by price, take top 5
    filtered.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
    const results = filtered.slice(0, 5).map(o => {
      const seg = o.slices[0].segments[0];
      return {
        offer_id: o.id,
        flight: `${seg.marketing_carrier?.iata_code}${seg.marketing_carrier_flight_number}`,
        airline: seg.marketing_carrier?.name,
        departing_at: seg.departing_at?.slice(11, 16),
        arriving_at: seg.arriving_at?.slice(11, 16),
        price: parseFloat(o.total_amount),
        currency: o.total_currency,
        booking_url: `https://book.duffel.com/offers/${o.id}`,
        direct_possible: true,
      };
    });

    return new Response(JSON.stringify(results.length ? results : MOCK_FLIGHTS), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch {
    return new Response(JSON.stringify(MOCK_FLIGHTS), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
