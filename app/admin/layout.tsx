import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen">
      {children}
      <div className="text-center text-neutral-500 text-xs py-8">© La Caverna — Admin</div>
    </div>
  );
}
