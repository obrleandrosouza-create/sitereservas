'use client';
import React, { useEffect, useState } from 'react';
import { Label, Input, Button, Select } from '@/components/Field';

export default function Page() {
  const todayISO = new Date().toISOString().slice(0,10);
  const [date, setDate] = useState(todayISO);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [time, setTime] = useState('');
  const [available, setAvailable] = useState<{label:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load(){
      setLoading(true);
      setMsg('');
      setTime('');
      const res = await fetch(`/api/availability?date=${date}&people=${people}`);
      const data = await res.json();
      setAvailable(data.slots || []);
      setLoading(false);
    }
    load();
  }, [date, people]);

  async function submit(){
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsapp, phone, email, people, date, time })
    });
    const data = await res.json();
    setLoading(false);
    if(!res.ok){ setMsg(data.error || 'Falha ao reservar'); return; }
    setMsg(`Reserva confirmada! Mesas: ${data.tables?.map((t:any)=>t.number).join(', ')}.`);
  }

  const times = available.map(s=>s.label);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Reserva — La Caverna</h1>
        <p className="text-neutral-300 mt-1">Escolha a data, informe seus dados e confirme seu horário.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label>Data</Label>
          <Input type="date" min={todayISO} value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <Label>Quantidade de pessoas</Label>
          <Input type="number" min={1} max={12} value={people} onChange={e=>setPeople(Number(e.target.value))} />
        </div>
        <div className="md:col-span-2">
          <Label>Horário</Label>
          <Select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="">Selecione…</option>
            {times.map(t=> <option key={t} value={t}>{t}</option> )}
          </Select>
          <p className="text-xs text-neutral-400 mt-1">Horários de 19:00 a 22:30, a cada 30 minutos.</p>
        </div>

        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <Label>WhatsApp</Label>
          <Input placeholder="(51) 99999-9999" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input placeholder="(51) 3333-3333" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input type="email" placeholder="voce@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <Button onClick={submit} disabled={loading || !time || !name || !whatsapp}>Confirmar reserva</Button>
          <Button variant="ghost" onClick={()=>{ location.href='https://clientes.anycode.com.br/lacaverna/fazer-reserva?utm_source=site&utm_medium=link&utm_campaign=backup'; }}>Usar sistema Anycode</Button>
        </div>

        {loading && <p className="text-neutral-300">Processando…</p>}
        {msg && <p className="text-emerald-400">{msg}</p>}
      </div>

      <footer className="mt-10 text-sm text-neutral-400">
        <p>Duração por mesa: 2h30 • Tolerância: 15 min • Endereço: Av. Conde Figueira, 332 — Gravataí</p>
      </footer>
    </main>
  );
}
