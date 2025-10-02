import { NextResponse } from 'next/server';
export async function POST(){
  const res = NextResponse.json({ ok: true });
  res.cookies.set('lc_session', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });
  return res;
}
