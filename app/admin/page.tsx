import React from 'react';
import { query } from '@/lib/db';
import { TZ } from '@/lib/time';
import { utcToZonedTime, format } from 'date-fns-tz';

function fmt(d: string) {
  const date = new Date(d);
  return format(utcToZonedTime(date, TZ), 'HH:mm', { timeZone: TZ });
}

export default async function AdminPage() {
  const today = new Date();
  const dayISO = today.toISOString().slice(0,10);
  const { rows } = await query<any>(
    `select r.id, r.customer_name, r.people, r.start_time, r.end_time,
            json_agg(json_build_object('number', t.number) order by t.number) as tables
     from reservations r
     join reservation_tables rt on rt.reservation_id = r.id
     join tables t on t.id = rt.table_id
     where to_char((r.start_time at time zone 'UTC' at time zone $1), 'YYYY-MM-DD') = $2
       and r.status = 'CONFIRMED'
     group by r.id
     order by r.start_time`, [TZ, dayISO]
  );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Reservas do dia {dayISO}</h1>
      <div className="space-y-3">
        {rows.map((r:any)=> (
          <div key={r.id} className="border border-neutral-800 rounded-xl p-4">
            <div className="flex flex-wrap gap-3 justify-between">
              <div>
                <p className="font-semibold">{r.customer_name} • {r.people}p</p>
                <p className="text-neutral-300">Horário: {fmt(r.start_time)}–{fmt(r.end_time)}</p>
              </div>
              <div className="text-neutral-300">Mesas: {r.tables.map((t:any)=>t.number).join(', ')}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-neutral-400">Sem reservas hoje.</p>}
      </div>
    </main>
  );
}
