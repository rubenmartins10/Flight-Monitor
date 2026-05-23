import { fetchDestinationPhoto } from '@/lib/pexels';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const photo = await fetchDestinationPhoto(params.destination);
  if (!photo) return NextResponse.json({ url: null }, { status: 404 });
  return NextResponse.json(photo, {
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' },
  });
}
