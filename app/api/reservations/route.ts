import { NextRequest, NextResponse } from 'next/server';
import { slotsForDate } from '@/lib/time';
import { allocate, findFreeTables } from '@/lib/alloc';
import { query, pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');
  const q = req.nextUrl.searchParams.get('query');
  let sql = `select r.*, coalesce(json_agg(json_build_object('id', t.id, 'number', t.number) order by t.number) filter (where t.id is not null), '[]') as tables
             from reservations r
             left join reservation_tables rt on rt.reservation_id = r.id
             left join tables t on t.id = rt.table_id`;
  const where: string[] = [];
  const params: any[] = [];
  if (date) { params.push(date); where.push(`to_char((r.start_time at time zone 'UTC' at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD') = $${params.length}`); }
  if (q)   { params.push(`%${q}%`); where.push(`(r.customer_name ilike $${params.length} or r.whatsapp ilike $${params.length} or r.email ilike $${params.length})`); }
  if (where.length) sql += ` where ${where.join(' and ')}`;
  sql += ` group by r.id order by r.start_time desc limit 200`;
  const { rows } = await query(sql, params);
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, whatsapp, phone, email, people, date, time } = body || {};
  if (!name || !whatsapp || !people || !date || !time) return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });

  const slot = slotsForDate(date).find(s=>s.label===time);
  if (!slot) return NextResponse.json({ error: 'Horário inválido.' }, { status: 400 });

  const free = await findFreeTables(slot.startUTC, slot.endUTC);
  const pick = allocate(Number(people), free);
  if (!pick) return NextResponse.json({ error: 'Sem mesas disponíveis neste horário.' }, { status: 409 });

  const client = await pool.connect();
  try {
    await client.query('begin');
    const ins = await client.query(
      `insert into reservations(customer_name, whatsapp, phone, email, people, start_time, end_time)
       values ($1,$2,$3,$4,$5,$6,$7) returning id`,
      [name, whatsapp, phone||null, email||null, people, slot.startUTC.toISOString(), slot.endUTC.toISOString()]
    );
    const rid = ins.rows[0].id;
    for (const tid of pick.tableIds) {
      await client.query(`insert into reservation_tables(reservation_id, table_id) values ($1,$2)`, [rid, tid]);
    }
    await client.query('commit');

    const { rows } = await query(`select number from tables where id = any($1::int[]) order by number`, [pick.tableIds]);
    return NextResponse.json({ id: rid, tables: rows });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    return NextResponse.json({ error: 'Erro ao salvar reserva.' }, { status: 500 });
  } finally {
    client.release();
  }
}
