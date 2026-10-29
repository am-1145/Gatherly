import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Heart,
  PartyPopper,
  Briefcase,
  Compass,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EventWizardModal } from '../components/wizard/EventWizardModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export const EventsPage: React.FC = () => {
  const { events, activeEventId, setActiveEventId, duplicateEvent, deleteEvent } = useEvent();
  const navigate = useNavigate();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const getOccasionIcon = (occasion: string) => {
    switch (occasion) {
      case 'wedding':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'birthday':
        return <PartyPopper className="w-4 h-4 text-amber-500" />;
      case 'corporate':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      default:
        return <Compass className="w-4 h-4 text-sage-600" />;
    }
  };

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    navigate('/app');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              My Events Portfolio
            </h1>
            <Badge variant="sage" size="sm">
              {events.length} Workspaces
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Switch between active celebrations, duplicate existing frameworks, or create new plans.
          </p>
        </div>

        <Button
          variant="sage"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsWizardOpen(true)}
        >
          Create New Event
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => {
          const isActive = ev.id === activeEventId;
          const currency = ev.budget.currency;

          return (
            <Card
              key={ev.id}
              padding="lg"
              className={`flex flex-col justify-between transition-all text-left relative ${isActive
                  ? 'border-sage-500 ring-2 ring-sage-500/20 bg-white dark:bg-charcoal-900 shadow-elevated'
                  : 'hover:border-charcoal-400 dark:hover:border-charcoal-700'
                }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {getOccasionIcon(ev.occasion)}
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-charcoal-400">
                      {ev.occasion}
                    </span>
                  </div>

                  {isActive && (
                    <Badge variant="sage" size="sm" dot>
                      Active Workspace
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-charcoal-900 dark:text-ivory-50 mb-1 line-clamp-1">
                  {ev.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{ev.city}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{formatDate(ev.date)}</span>
                  </span>
                </div>

                {/* Key Numbers Bar */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700 mb-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-charcoal-400 block">
                      Target Budget
                    </span>
                    <span className="text-sm font-bold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(ev.budget.total, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-charcoal-400 block">
                      Guest Capacity
                    </span>
                    <span className="text-sm font-bold text-charcoal-900 dark:text-ivory-100">
                      {ev.guestCount} Guests
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-charcoal-400 block">
                      Checklist Tasks
                    </span>
                    <span className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      {ev.tasks.filter((t) => t.status === 'completed').length}/{ev.tasks.length} Done
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-charcoal-400 block">
                      Vendors
                    </span>
                    <span className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-300">
                      {ev.vendors.length} in portfolio
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-ivory-100 dark:border-charcoal-800">
                {isActive ? (
                  <Button
                    variant="sage"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/app')}
                  >
                    Open Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectEvent(ev.id)}
                  >
                    Switch to This Event
                  </Button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicateEvent(ev.id)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
                    title="Duplicate framework"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {events.length > 1 && (
                    <button
                      onClick={() => setEventToDelete(ev.id)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) deleteEvent(eventToDelete);
        }}
        title="Delete Event Workspace"
        message="Are you sure you want to delete this event? All local tasks, budget numbers, and guest records for this event will be permanently removed from your browser storage."
        confirmLabel="Delete Workspace"
      />

      {/* Event Wizard */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
};

