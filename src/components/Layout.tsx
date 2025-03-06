
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
