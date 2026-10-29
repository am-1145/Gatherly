import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Wallet,
  CheckSquare,
  Users,
  Store,
  Lightbulb,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenCreateWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  onOpenCreateWizard,
}) => {
  const { activeEvent, metrics } = useEvent();
  const location = useLocation();

  const navItems = [
    {
      to: '/app',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      exact: true,
    },
    {
      to: '/app/events',
      label: 'My Events',
      icon: Calendar,
      badge: null,
    },
    {
      to: '/app/copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      badge: 'AI',
      badgeVariant: 'sage' as const,
    },
    {
      to: '/app/budget',
      label: 'Budget Planner',
      icon: Wallet,
      badge: metrics.isOverBudget ? 'Over' : null,
      badgeVariant: 'terracotta' as const,
    },
    {
      to: '/app/tasks',
      label: 'Timeline & Tasks',
      icon: CheckSquare,
      badge: metrics.pendingTasks > 0 ? `${metrics.pendingTasks}` : null,
      badgeVariant: 'neutral' as const,
    },
    {
      to: '/app/guests',
      label: 'Guests & RSVPs',
      icon: Users,
      badge: `${metrics.confirmedGuestsCount}/${metrics.totalGuestsTarget}`,
      badgeVariant: 'neutral' as const,
    },
    {
      to: '/app/vendors',
      label: 'Vendors',
      icon: Store,
      badge: null,
    },
    {
      to: '/app/ideas',
      label: 'Ideas & Inspiration',
      icon: Lightbulb,
      badge: null,
    },
    {
      to: '/app/runbook',
      label: 'Event-Day Runbook',
      icon: Clock,
      badge: null,
    },
    {
      to: '/app/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-ivory-200 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md transition-all duration-300 z-30 select-none ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-ivory-200 dark:border-charcoal-800 shrink-0">
        {!isCollapsed && (
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sage-600 to-sage-500 flex items-center justify-center text-white font-bold text-base shadow-subtle shrink-0">
              G
            </div>
            <div className="truncate">
              <span className="font-bold text-sm tracking-tight text-charcoal-900 dark:text-ivory-50">
                Gatherly
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-sage-600 dark:text-sage-400 ml-1 uppercase">
                AI
              </span>
            </div>
          </NavLink>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-sage-600 to-sage-500 flex items-center justify-center text-white font-bold text-base shadow-subtle">
            G
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors ${isCollapsed ? 'hidden' : 'block'
            }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Active Event Mini Banner (expanded only) */}
      {!isCollapsed && activeEvent && (
        <div className="px-3 pt-3.5 pb-2">
          <div className="p-2.5 rounded-xl bg-ivory-100/70 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700/60">
            <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Active Workspace</span>
              <span className="font-semibold text-sage-700 dark:text-sage-400">
                {metrics.daysRemaining.days}d left
              </span>
            </div>
            <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
              {activeEvent.title}
            </p>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${isActive
                  ? 'bg-sage-50 dark:bg-sage-950/40 text-sage-800 dark:text-sage-200 border border-sage-200/80 dark:border-sage-800/80 font-semibold'
                  : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100 hover:bg-ivory-100/80 dark:hover:bg-charcoal-800/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${isActive
                    ? 'text-sage-700 dark:text-sage-300'
                    : 'text-charcoal-400 group-hover:text-charcoal-700 dark:group-hover:text-charcoal-200'
                  }`}
              />

              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || 'neutral'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Action Button at bottom */}
      <div className="p-3 border-t border-ivory-200 dark:border-charcoal-800">
        {!isCollapsed ? (
          <button
            onClick={onOpenCreateWizard}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-charcoal-900 text-ivory-50 dark:bg-ivory-100 dark:text-charcoal-900 text-xs font-semibold hover:opacity-95 transition-opacity shadow-subtle"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateWizard}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-charcoal-900 text-ivory-50 dark:bg-ivory-100 dark:text-charcoal-900 hover:opacity-95 shadow-subtle"
            title="Create New Event"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mt-3 w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

