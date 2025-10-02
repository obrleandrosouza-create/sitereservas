'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { slotsForDate } from '@/lib/time';

type Row = {
  id: string;
  customer_name: string;
  whatsapp: string;
  email: string | null;
  phone: string | null;
  people: number;
  start_time: string;
  end_time: string;
  status: 'CONFIRMED' | 'CANCELED';
  tables: { id: number; number: number }[];
};

export default function AdminReservasPage(){
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Row|null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPeople, setEditPeople] = useState(2);

  const times = useMemo(()=> slotsForDate(editDate || date).map(s=>s.label), [editDate, date]);

  async function load(){
    setLoading(true); setError('');
    const url = new URL('/api/reservations', location.origin);
    if (date) url.searchParams.set('date', date);
    if (query) url.searchParams.set('query', query);
    const res = await fetch(url.toString());
    const data = await res.json();
    setLoading(false);
    if(!res.ok){ setError(data.error||'Falha ao carregar.'); return; }
    setRows(data.rows || []);
  }

  useEffect(()=>{ load(); }, [date, query]);

  function openEdit(r: Row){
    setEditing(r);
    setEditDate(r.start_time.slice(0,10));
    setEditTime(new Date(r.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12:false }));
    setEditPeople(r.people);
  }

  async function saveEdit(){
    if(!editing) return;
    const slot = slotsForDate(editDate).find(s=> s.label === editTime);
    if(!slot){ alert('Horário inválido'); return; }
    const body = { people: editPeople, start_time: slot.startUTC.toISOString(), end_time: slot.endUTC.toISOString() };
    const res = await fetch(`/api/reservations/${editing.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    if(!res.ok){ const d = await res.json(); alert(d.error||'Falha ao salvar'); return; }
    setEditing(null);
    load();
  }

  async function cancel(id: string){
    if(!confirm('Cancelar esta reserva?')) return;
    const res = await fetch(`/api/reservations/${id}`, { method:'DELETE' });
    if(!res.ok){ const d = await res.json(); alert(d.error||'Falha ao cancelar'); return; }
    load();
  }

  async function logout(){
    await fetch('/api/auth/logout', { method:'POST' });
    location.href = '/admin/login';
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Admin — Reservas</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={logout} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2">Sair</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"/>
        <input placeholder="Buscar por nome/WhatsApp/e-mail" value={query} onChange={e=>setQuery(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 min-w-[260px]"/>
        <button onClick={load} className="bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-semibold rounded-xl px-4">Atualizar</button>
      </div>

      {loading && <p className="text-neutral-300">Carregando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="space-y-3">
        {rows.map(r=> (
          <div key={r.id} className="border border-neutral-800 rounded-xl p-4">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div>
                <p className="font-semibold">{r.customer_name} • {r.people}p</p>
                <p className="text-neutral-300">{new Date(r.start_time).toLocaleString('pt-BR')} — {new Date(r.end_time).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="text-neutral-400 text-sm">Mesas: {r.tables?.map(t=>t.number).join(', ') || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openEdit(r)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2">Editar</button>
                <button onClick={()=>cancel(r.id)} className="bg-red-500 hover:bg-red-600 text-neutral-900 font-semibold rounded-xl px-3 py-2">Cancelar</button>
              </div>
            </div>
          </div>
        ))}
        {rows.length===0 && !loading && <p className="text-neutral-400">Sem reservas para os filtros selecionados.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-3">Editar reserva</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-300">Data</label>
                <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"/>
              </div>
              <div>
                <label className="text-sm text-neutral-300">Horário</label>
                <select value={editTime} onChange={e=>setEditTime(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2">
                  {times.map(t=> <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-300">Pessoas</label>
                <input type="number" min={1} max={20} value={editPeople} onChange={e=>setEditPeople(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"/>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={()=>setEditing(null)} className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2">Fechar</button>
              <button onClick={saveEdit} className="bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-semibold rounded-xl px-4 py-2">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
