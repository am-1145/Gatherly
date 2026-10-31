import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EventWizardModal } from '../wizard/EventWizardModal';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState(false);
  const location = useLocation();

  // If on copilot main page, don't open drawer
  const isCopilotPage = location.pathname === '/app/copilot';

  return (
    <div className="flex h-screen w-full bg-ivory-50 dark:bg-charcoal-950 overflow-hidden font-sans text-charcoal-900 dark:text-ivory-100 antialiased">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenCreateWizard={() => setIsWizardOpen(true)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-charcoal-900 shadow-elevated z-10 flex flex-col">
            <div className="absolute top-4 right-3 z-20">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => { }}
              onOpenCreateWizard={() => {
                setIsMobileMenuOpen(false);
                setIsWizardOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateWizard={() => setIsWizardOpen(true)}
          onOpenCopilotDrawer={
            !isCopilotPage ? () => setIsCopilotDrawerOpen(true) : undefined
          }
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* AI Copilot Slide-Over Drawer (for quick contextual assistance on any page) */}
      {!isCopilotPage && (
        <CopilotDrawer
          isOpen={isCopilotDrawerOpen}
          onClose={() => setIsCopilotDrawerOpen(false)}
        />
      )}

      {/* Global Event Creation Wizard */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
};

