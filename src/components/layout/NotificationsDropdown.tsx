import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Calendar, Info, X } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeEvent, metrics } = useEvent();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate dynamic notifications based on real state
  const notifications = [
    ...(metrics.isOverBudget
      ? [
          {
            id: 'n-budget-alert',
            type: 'warning' as const,
            title: 'Budget Allocation Warning',
            message: `Allocated amounts exceed total budget by ${formatCurrency(
              Math.abs(metrics.allocationVariance),
              activeEvent?.budget.currency
            )}.`,
            time: 'Live calculation',
          },
        ]
      : []),
    ...(metrics.overdueTasks > 0
      ? [
          {
            id: 'n-tasks-overdue',
            type: 'urgent' as const,
            title: `${metrics.overdueTasks} Task(s) Past Due Date`,
            message: 'Review pending vendor contracts and advance confirmations.',
            time: 'Requires attention',
          },
        ]
      : []),
    {
      id: 'n-rsvp-update',
      type: 'info' as const,
      title: `${metrics.confirmedGuestsCount} RSVPs Confirmed`,
      message: `${metrics.totalAttendingHeadcount} total attending headcount for ${activeEvent?.title}.`,
      time: 'Updated today',
    },
    {
      id: 'n-date-countdown',
      type: 'calendar' as const,
      title: `${metrics.daysRemaining.days} Days Until Event`,
      message: `Scheduled for ${formatDate(activeEvent?.date)} in ${activeEvent?.city}.`,
      time: 'Milestone',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-900 dark:hover:text-ivory-50 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-900 rounded-xl shadow-elevated border border-ivory-200 dark:border-charcoal-800 p-4 z-50 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-wider">
                Notifications
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 font-semibold">
                {notifications.length}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-100 dark:border-charcoal-700/50 flex gap-3 text-left"
              >
                <div className="shrink-0 mt-0.5">
                  {item.type === 'warning' || item.type === 'urgent' ? (
                    <AlertTriangle className="w-4 h-4 text-terracotta-500" />
                  ) : item.type === 'calendar' ? (
                    <Calendar className="w-4 h-4 text-sage-600" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-charcoal-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600 dark:text-charcoal-400 leading-snug">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
