import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Plus,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { useSettings } from '../../context/SettingsContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenCreateWizard: () => void;
  onOpenCopilotDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenCreateWizard,
  onOpenCopilotDrawer,
}) => {
  const { events, activeEvent, activeEventId, setActiveEventId } = useEvent();
  const { theme, toggleTheme } = useSettings();
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const eventMenuRef = useRef<HTMLDivElement>(null);

  // Close event switcher dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventMenuRef.current && !eventMenuRef.current.contains(e.target as Node)) {
        setIsEventMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-ivory-200 dark:border-charcoal-800 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
        {/* Left Section: Mobile Menu + Event Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Event Switcher Dropdown */}
          <div className="relative" ref={eventMenuRef}>
            <button
              onClick={() => setIsEventMenuOpen(!isEventMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-ivory-200 dark:border-charcoal-700/80 bg-ivory-50/80 dark:bg-charcoal-800/80 hover:bg-ivory-100 dark:hover:bg-charcoal-700 transition-colors text-left"
            >
              <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <div className="max-w-[140px] sm:max-w-[220px] truncate">
                <p className="text-xs font-bold text-charcoal-900 dark:text-ivory-50 truncate">
                  {activeEvent?.title || 'Select Event'}
                </p>
                <p className="text-[10px] text-charcoal-500 dark:text-charcoal-400 capitalize truncate">
                  {activeEvent?.occasion} • {activeEvent?.city}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 shrink-0 ml-0.5" />
            </button>

            {isEventMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-charcoal-900 rounded-xl shadow-elevated border border-ivory-200 dark:border-charcoal-800 p-2 z-50 animate-slide-up">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 border-b border-ivory-100 dark:border-charcoal-800 flex justify-between items-center">
                  <span>Switch Workspace</span>
                  <span>{events.length} events</span>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
                  {events.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setActiveEventId(ev.id);
                        setIsEventMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                        ev.id === activeEventId
                          ? 'bg-sage-50 dark:bg-sage-950/40 text-sage-900 dark:text-sage-100 font-semibold'
                          : 'hover:bg-ivory-100 dark:hover:bg-charcoal-800 text-charcoal-800 dark:text-charcoal-200'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs truncate">{ev.title}</p>
                        <p className="text-[10px] text-charcoal-500 dark:text-charcoal-400 capitalize">
                          {ev.occasion} • {ev.city}
                        </p>
                      </div>
                      {ev.id === activeEventId && (
                        <Check className="w-4 h-4 text-sage-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-ivory-100 dark:border-charcoal-800">
                  <button
                    onClick={() => {
                      setIsEventMenuOpen(false);
                      onOpenCreateWizard();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-950/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Another Event</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Search, AI Shortcut, Notifications, Theme, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-charcoal-500 dark:text-charcoal-400 bg-ivory-100/70 dark:bg-charcoal-800/60 hover:bg-ivory-200/80 dark:hover:bg-charcoal-700 transition-colors border border-ivory-200/60 dark:border-charcoal-700/60"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-charcoal-900 border border-ivory-300 dark:border-charcoal-700 rounded text-charcoal-500">
              ⌘K
            </kbd>
          </button>

          {/* Quick Copilot button if provided */}
          {onOpenCopilotDrawer && (
            <button
              onClick={onOpenCopilotDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sage-50 dark:bg-sage-950/50 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800 hover:bg-sage-100 transition-colors"
              title="Open AI Copilot Drawer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span className="hidden lg:inline">Ask Copilot</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-ivory-50 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User profile avatar (demo state) */}
          <div className="flex items-center gap-2 pl-2 border-l border-ivory-200 dark:border-charcoal-800">
            <div className="w-8 h-8 rounded-full bg-terracotta-100 dark:bg-terracotta-900/60 border border-terracotta-200 dark:border-terracotta-800 flex items-center justify-center text-xs font-bold text-terracotta-700 dark:text-terracotta-300">
              AP
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
