export const config = { runtime: 'edge' };

// Booking proxy — iTravel-shaped contract
// Live booking proxy — POSTs to TTC departure.links.book
// Requires TTC_API_TOKEN in Vercel environment variables

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json', ...cors() },
  });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
    status: 400, headers: { 'Content-Type': 'application/json', ...cors() },
  }); }

  const {
    tourId, departureId, roomType,
    passengers, leadBooker, pricing, payment,
  } = body;

  // ── Validation ───────────────────────────────────────────────────────────
  const errors = [];
  if (!tourId)      errors.push('Missing tourId');
  if (!departureId) errors.push('Missing departureId');
  if (!roomType)    errors.push('Missing roomType');
  if (!passengers || !passengers.length) errors.push('At least one passenger required');
  if (!leadBooker?.email) errors.push('Lead booker email required');

  if (passengers) {
    passengers.forEach((p, i) => {
      if (!p.firstName)  errors.push(`Passenger ${i+1}: firstName required`);
      if (!p.lastName)   errors.push(`Passenger ${i+1}: lastName required`);
      if (!p.dob)        errors.push(`Passenger ${i+1}: date of birth required`);
      if (!p.nationality) errors.push(`Passenger ${i+1}: nationality required`);
    });
  }

  if (errors.length) {
    return new Response(JSON.stringify({ error: 'Validation failed', errors }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  // ── Production booking (when TTC booking API is available) ────────────────
  // Uncomment and wire up when real API credentials are available:
  //
  // const ttcToken = process.env.TTC_API_TOKEN;
  // const bookingEnabled = process.env.TTC_BOOKING_ENABLED === 'true';
  // if (ttcToken && bookingEnabled && body.bookingUrl) {
  //   try {
  //     const ttcRes = await fetch(body.bookingUrl, {  // departure.links.book
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Basic ${Buffer.from(`token:${ttcToken}`).toString('base64')}`,
  //         'Accept': 'application/vnd.ttc.v4+json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         roomType,
  //         passengers,
  //         leadBooker,
  //         payment,
  //       }),
  //     });
  //     const ttcData = await ttcRes.json();
  //     return new Response(JSON.stringify({
  //       bookingReference: ttcData.bookingReference,
  //       status: 'confirmed',
  //       confirmationEmail: leadBooker.email,
  //       _source: 'live',
  //     }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } });
  //   } catch (e) {
  //     console.error('TTC booking failed:', e.message);
  //     // Fall through to demo mode
  //   }
  // }

  // ── Live booking via TTC API ────────────────────────────────────────────────
  const ttcToken = process.env.TTC_API_TOKEN;
  if (!ttcToken) {
    return new Response(JSON.stringify({ error: 'TTC_API_TOKEN not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  if (!body.bookingUrl) {
    return new Response(JSON.stringify({ error: 'bookingUrl required (from departure.links.book)' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const encoded = Buffer.from(`token:${ttcToken}`).toString('base64');

  const ttcRes = await fetch(body.bookingUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Accept': 'application/vnd.ttc.v4+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      roomType,
      passengers,
      leadBooker,
      payment,
    }),
  });

  if (!ttcRes.ok) {
    const err = await ttcRes.json().catch(() => ({}));
    return new Response(JSON.stringify({
      error: err?.message || err?.errors?.[0] || `TTC booking error ${ttcRes.status}`,
    }), {
      status: ttcRes.status, headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const ttcData = await ttcRes.json();

  return new Response(JSON.stringify({
    bookingReference: ttcData.bookingReference || ttcData.reference || ttcData.id,
    status:           ttcData.status || 'confirmed',
    confirmationEmail: leadBooker.email,
    tourId,
    departureId,
    roomType,
    passengers:       passengers.length,
    totalPrice:       pricing?.totalPrice || 0,
    currency:         pricing?.currency   || 'USD',
    depositAmount:    ttcData.depositAmount   || pricing?.depositAmount,
    balanceDueDate:   ttcData.balanceDueDate  || pricing?.balanceDueDate,
    _raw:             ttcData,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
