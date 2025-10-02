import React from 'react';

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm text-neutral-300">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 w-full"/>;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 w-full"/>;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 w-full"/>;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const base = 'rounded-xl px-5 py-3 transition w-full md:w-auto';
  const styles = props.variant === 'ghost'
    ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100'
    : 'bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-semibold';
  const { variant, className, ...rest } = props as any;
  return <button {...rest} className={`${base} ${styles} ${className||''}`} />
}
