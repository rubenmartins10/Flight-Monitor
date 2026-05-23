import { createClient } from '@/lib/supabase/server';
import { fetchTopFlights, calcAverage } from '@/lib/serpapi';
import { sendAlertEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body    = await request.json().catch(() => ({}));
  const routeId = body.route_id;

  let query = supabase
    .from('routes')
    .select('*, price_history(price, checked_at, airline, rank)')
    .eq('user_id', user.id)
    .eq('notify', true);

  if (routeId) query = query.eq('id', routeId);

  const { data: routes, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const alerts  = [];
  const results = [];

  for (const route of routes) {
    const top3 = await fetchTopFlights(route);
    if (!top3 || top3.length === 0) { results.push({ route_id: route.id, status: 'no_results' }); continue; }

    const checkId = randomUUID();
    for (let i = 0; i < top3.length; i++) {
      const flight = top3[i];
      await supabase.from('price_history').insert({
        route_id:       route.id,
        price:          flight.price,
        airline:        flight.airline,
        departure_date: flight.departure_date,
        return_date:    flight.return_date,
        duration_h:     flight.duration_h,
        stops:          flight.stops,
        rank:           i + 1,
        check_id:       checkId,
      });
    }

    const cheapest  = top3[0];
    const avg       = calcAverage(route.price_history || []);
    const threshold = Number(route.threshold_eur) || 80;
    let alertType   = null;
    let savingsPct  = 0;

    if (cheapest.price <= threshold) {
      alertType = 'absolute';
    } else if (avg && cheapest.price <= avg * 0.75) {
      alertType  = 'relative';
      savingsPct = (1 - cheapest.price / avg) * 100;
    }

    if (alertType) {
      alerts.push({ label: route.label, ...cheapest, top3, avg, type: alertType, threshold, savings_pct: savingsPct });
    }
    results.push({ route_id: route.id, status: 'ok', price: cheapest.price, alert: !!alertType });
  }

  if (alerts.length > 0) {
    try { await sendAlertEmail(alerts, { to: user.email }); } catch (e) { console.error('Email:', e.message); }
  }

  return NextResponse.json({ results, alerts_sent: alerts.length });
}
