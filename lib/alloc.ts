import { query, pool } from './db';

export type TableRow = { id:number; number:number; capacity:number; joinable:boolean };

export async function getTables(): Promise<TableRow[]> {
  const { rows } = await query<TableRow>('select id, number, capacity, joinable from tables order by number');
  return rows;
}

export async function findFreeTables(startUTC: Date, endUTC: Date): Promise<TableRow[]> {
  const { rows } = await query<TableRow>(
    `select t.id, t.number, t.capacity, t.joinable
     from tables t
     where not exists (
       select 1 from reservation_tables rt
       join reservations r on r.id = rt.reservation_id and r.status = 'CONFIRMED'
       where rt.table_id = t.id
         and not (r.end_time <= $1 or r.start_time >= $2)
     )
     order by t.number`,
    [startUTC.toISOString(), endUTC.toISOString()]
  );
  return rows;
}

export type Allocation = { tableIds:number[] } | null;

export function allocate(people: number, free: TableRow[]): Allocation {
  // Heurística simples:
  const f2 = free.filter(t => t.capacity === 2);
  const f5 = free.filter(t => t.capacity === 5);
  const joinables = free.filter(t => t.joinable); // 4..10

  // 1) ≤2 pessoas: tentar uma de 2
  if (people <= 2) {
    if (f2.length) return { tableIds: [f2[0].id] };
    if (f5.length) return { tableIds: [f5[0].id] };
  }

  // 2) 3–5 pessoas: tentar uma de 5; se não, duas de 2 (para 4); fallback 5
  if (people >= 3 && people <= 5) {
    if (f5.length) return { tableIds: [f5[0].id] };
    if (people <= 4 && f2.length >= 2) return { tableIds: [f2[0].id, f2[1].id] };
    if (f2.length && f5.length) return { tableIds: [f5[0].id] };
  }

  // 3) >5 pessoas: usar combinações joinables (2 lugares) e somar 5 se necessário
  if (people > 5) {
    const neededPairs = (people + 1) // ceil(people/2) without Math
    // Correct calculation:
  }
  // fix calculation:
  return allocateLarge(people, joinables, f5);
}

function allocateLarge(people:number, joinables:TableRow[], f5:TableRow[]): Allocation {
  // number of 2-seat tables needed
  let remaining = people;
  const ids:number[] = [];

  // Try to use joinable 2-seat tables first
  for (const t of joinables) {
    if (remaining <= 0) break;
    ids.push(t.id);
    remaining -= 2;
  }
  // Use 5-seat tables if still remaining
  for (const t of f5) {
    if (remaining <= 0) break;
    ids.push(t.id);
    remaining -= 5;
  }
  return remaining <= 0 ? { tableIds: ids } : null;
}
