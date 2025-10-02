'use client';
import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json(); setLoading(false);
    if(!res.ok){ setError(data.error||'Falha no login'); return; }
    const next = new URLSearchParams(location.search).get('next') || '/admin';
    location.href = next;
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Entrar</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm text-neutral-300">E-mail</label>
          <input className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"
                 value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Senha</label>
          <input className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2"
                 value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-semibold rounded-xl px-5 py-3">
          Entrar
        </button>
      </form>
    </main>
  );
}
