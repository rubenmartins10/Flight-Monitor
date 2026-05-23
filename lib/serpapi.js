export async function fetchTopFlights(route, opts = {}) {
  const {
    nights  = 3,
    api_key = process.env.SERPAPI_KEY,
  } = opts;

  const fmt = dt => typeof dt === 'string' ? dt : dt.toISOString().split('T')[0];
  const allFlights = [];
  const dates = [];

  if (route.date_from) {
    // Specific date set on route — search that date + ±7 days for better deals
    const base = new Date(route.date_from);
    const d1   = new Date(base); d1.setDate(d1.getDate() - 7);
    const d2   = new Date(base); d2.setDate(d2.getDate() + 7);
    const now  = new Date();
    if (d1 > now) dates.push(fmt(d1));
    dates.push(fmt(base));
    dates.push(fmt(d2));
  } else {
    // Auto-discover: next 90 days every 2 weeks (max 5 windows)
    const cur = new Date(); cur.setDate(cur.getDate() + 7);
    const end = new Date(); end.setDate(end.getDate() + 90);
    while (cur <= end && dates.length < 5) {
      dates.push(fmt(cur));
      cur.setDate(cur.getDate() + 14);
    }
  }

  for (const depStr of dates) {
    const retStr = route.date_to || (() => {
      const r = new Date(depStr); r.setDate(r.getDate() + nights); return fmt(r);
    })();

    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine',        'google_flights');
    url.searchParams.set('departure_id',  route.from_code);
    url.searchParams.set('arrival_id',    route.to_code);
    url.searchParams.set('outbound_date', depStr);
    url.searchParams.set('return_date',   retStr);
    url.searchParams.set('currency',      'EUR');
    url.searchParams.set('hl',            'pt');
    url.searchParams.set('api_key',       api_key);

    try {
      const res  = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      const all  = [...(data.best_flights || []), ...(data.other_flights || [])];
      for (const f of all) {
        if (!f.price) continue;
        const legs = f.flights || [{}];
        allFlights.push({
          price:          f.price,
          departure_date: depStr,
          return_date:    retStr,
          airline:        legs[0].airline || '?',
          duration_h:     Math.round((f.total_duration || 0) / 60 * 10) / 10,
          stops:          legs.length - 1,
        });
      }
    } catch (e) {
      console.error(`SerpApi error [${depStr}]:`, e.message);
    }
  }

  // Sort by price; prefer different airlines for diversity
  allFlights.sort((a, b) => a.price - b.price);
  const seen = new Set();
  const top3 = [];
  for (const f of allFlights) {
    if (top3.length >= 3) break;
    if (!seen.has(f.airline)) { seen.add(f.airline); top3.push(f); }
  }
  // Fill remaining slots if not enough unique airlines
  for (const f of allFlights) {
    if (top3.length >= 3) break;
    if (!top3.includes(f)) top3.push(f);
  }
  return top3;
}

// Backward-compat wrapper
export async function fetchCheapestFlight(route, opts = {}) {
  const top3 = await fetchTopFlights(route, opts);
  return top3[0] || null;
}

export function calcAverage(history) {
  if (!history || history.length < 3) return null;
  return history.reduce((s, h) => s + Number(h.price), 0) / history.length;
}
