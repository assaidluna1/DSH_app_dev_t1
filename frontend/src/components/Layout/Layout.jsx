import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Menu } from 'lucide-react';

export const Layout = ({ currentPath, onNavigate, title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless toggled */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:relative
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }>
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0 flex flex-col min-h-screen min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-20 md:pt-24 bg-surface-950 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
