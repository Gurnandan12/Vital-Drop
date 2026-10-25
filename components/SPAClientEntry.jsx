'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const AppRouter = dynamic(() => import('@/components/AppRouter').then((m) => m.AppRouter), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#080814] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-violet-400 tracking-widest uppercase animate-pulse">
          Loading Vital Drop Simulator…
        </span>
      </div>
    </div>
  ),
});

export function SPAClientEntry() {
  return <AppRouter />;
}

export default SPAClientEntry;
