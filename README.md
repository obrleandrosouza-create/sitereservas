# La Caverna — Reservas (Next.js + PostgreSQL)

## Requisitos
- Node 18+
- PostgreSQL (pode ser Supabase)

## Setup rápido
1. `cp .env.example .env.local` e preencha `DATABASE_URL` e `NEXTAUTH_SECRET`.
2. `npm i`
3. Criar schema: `npm run db:setup`
4. Seed das mesas: `npm run db:seed`
5. Dev: `npm run dev` → abrir http://localhost:3000

## Fluxo
- Cliente: página inicial com calendário (data), depois horários disponíveis e formulário.
- API calcula disponibilidade por **mesa livre** e aloca automaticamente, bloqueando por **2h30**.
- Admin: `/admin` lista reservas do dia e `/admin/reservas` permite **editar/cancelar**.

## Próximos passos (sugestões)
- Máscaras BR e validação (Zod/React Hook Form).
- Timeline tipo Gantt para ocupação das 13 mesas.
- Integração Google Calendar (opcional) e Webhook.
- Página pública com FAQ e políticas.
