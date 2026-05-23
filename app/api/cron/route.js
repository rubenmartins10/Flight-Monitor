import { createServiceClient } from '@/lib/supabase/server';
import { fetchCheapestFlight, calcAverage } from '@/lib/serpapi';
import { sendAlertEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: routes } = await supabase
    .from('routes')
    .select('*, price_history(price, checked_at)')
    .eq('notify', true);

  const alertsByUser = {};

  for (const route of routes || []) {
    const flight = await fetchCheapestFlight(route);
    if (!flight) continue;

    await supabase.from('price_history').insert({
      route_id:       route.id,
      price:          flight.price,
      airline:        flight.airline,
      departure_date: flight.departure_date,
      return_date:    flight.return_date,
      duration_h:     flight.duration_h,
      stops:          flight.stops,
    });

    const avg       = calcAverage(route.price_history || []);
    const threshold = Number(route.threshold_eur) || 80;

    if (flight.price <= threshold || (avg && flight.price <= avg * 0.75)) {
      if (!alertsByUser[route.user_id]) alertsByUser[route.user_id] = [];
      alertsByUser[route.user_id].push({
        label: route.label, ...flight, avg,
        type:        flight.price <= threshold ? 'absolute' : 'relative',
        threshold,
        savings_pct: avg ? (1 - flight.price / avg) * 100 : 0,
      });
    }
  }

  // Send alerts per user
  for (const [userId, alerts] of Object.entries(alertsByUser)) {
    try {
      const { data } = await supabase.auth.admin.getUserById(userId);
      if (data?.user?.email) await sendAlertEmail(alerts, { to: data.user.email });
    } catch (e) { console.error('Cron email error:', e.message); }
  }

  return NextResponse.json({
    processed: routes?.length || 0,
    alerts_sent: Object.values(alertsByUser).flat().length,
  });
}
