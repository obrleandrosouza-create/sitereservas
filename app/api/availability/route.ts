import { NextRequest, NextResponse } from 'next/server';
import { slotsForDate } from '@/lib/time';
import { findFreeTables, allocate } from '@/lib/alloc';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  const people = Number(req.nextUrl.searchParams.get('people')||'0');
  if(!date || !people) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });

  const slots = slotsForDate(date);
  const available = [] as any[];
  for (const s of slots) {
    const free = await findFreeTables(s.startUTC, s.endUTC);
    const pick = allocate(people, free);
    if (pick) available.push({ label: s.label });
  }
  return NextResponse.json({ slots: available });
}
