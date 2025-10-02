import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();
  const fields: string[] = [];
  const values: any[] = [];

  if (body.status) { values.push(body.status); fields.push(`status = $${values.length}`); }
  if (body.people) { values.push(body.people); fields.push(`people = $${values.length}`); }
  if (body.start_time && body.end_time) {
    values.push(body.start_time, body.end_time);
    fields.push(`start_time = $${values.length-1}`, `end_time = $${values.length}`);
  }
  if (!fields.length) return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });

  values.push(id);
  await query(`update reservations set ${fields.join(', ')}, updated_at = now() where id = $${values.length}`, values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  await query(`update reservations set status = 'CANCELED', updated_at = now() where id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
