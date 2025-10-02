import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest){
  const { email, password } = await req.json();
  const adminEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH || '';
  if (!email || !password) return NextResponse.json({ error: 'Informe e-mail e senha' }, { status: 400 });
  if (email !== adminEmail) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  // Cookie httpOnly simples para sessão (24h)
  res.cookies.set('lc_session', 'admin', { httpOnly: true, path: '/', maxAge: 60*60*24, sameSite: 'lax' });
  return res;
}
