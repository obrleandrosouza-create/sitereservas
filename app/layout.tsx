import './globals.css';
import React from 'react';

export const metadata = {
  title: 'La Caverna — Reservas',
  description: 'Reservas online do La Caverna — Fondue perto de casa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
