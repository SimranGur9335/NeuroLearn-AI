import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PlatformLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150">
      {/* Sidebar - static width inside flex */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Header - sticky top */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
