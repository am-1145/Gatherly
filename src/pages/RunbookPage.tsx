import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  MapPin,
  User,
  Trash2,
  Edit2,
  Flag,
  Smartphone,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { RunbookItem, RunbookStatus } from '../types';
import { formatDate } from '../utils/formatters';

export const RunbookPage: React.FC = () => {
  const { activeEvent, addRunbookItem, updateRunbookItem, deleteRunbookItem } = useEvent();

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed' | 'flagged'>('all');

  // Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RunbookItem | null>(null);

  // Form fields
  const [time, setTime] = useState('06:00 PM');
  const [title, setTitle] = useState('');
  const [responsible, setResponsible] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<RunbookStatus>('pending');
  const [notes, setNotes] = useState('');

  const sortedRunbook = useMemo(() => {
    const list = activeEvent?.runbook || [];
    return [...list].sort((a, b) => a.time.localeCompare(b.time));
  }, [activeEvent?.runbook]);

  const filteredItems = useMemo(() => {
    return sortedRunbook.filter((item) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'completed') return item.status === 'completed';
      if (selectedFilter === 'flagged') return item.status === 'flagged';
      if (selectedFilter === 'pending') return item.status === 'pending' || item.status === 'in_progress';
      return true;
    });
  }, [sortedRunbook, selectedFilter]);

  if (!activeEvent) return null;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTime('05:00 PM');
    setTitle('');
    setResponsible('Host / Team');
    setLocation('Main Hall');
    setStatus('pending');
    setNotes('');
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: RunbookItem) => {
    setEditingItem(item);
    setTime(item.time);
    setTitle(item.title);
    setResponsible(item.responsible);
    setLocation(item.location || '');
    setStatus(item.status);
    setNotes(item.notes || '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;

    if (editingItem) {
      updateRunbookItem({
        ...editingItem,
        time: time.trim(),
        title: title.trim(),
        responsible: responsible.trim(),
        location: location.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addRunbookItem({
        time: time.trim(),
        title: title.trim(),
        responsible: responsible.trim(),
        location: location.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
    }

    setIsItemModalOpen(false);
  };

  const toggleStatus = (item: RunbookItem) => {
    const nextStatus: RunbookStatus =
      item.status === 'completed'
        ? 'pending'
        : item.status === 'pending'
          ? 'in_progress'
          : 'completed';
    updateRunbookItem({ ...item, status: nextStatus });
  };

  const toggleFlagIssue = (item: RunbookItem) => {
    const nextStatus: RunbookStatus = item.status === 'flagged' ? 'in_progress' : 'flagged';
    updateRunbookItem({ ...item, status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Event-Day Runbook
            </h1>
            <Badge variant="sage" size="sm">
              {formatDate(activeEvent.date)}
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Chronological minute-by-minute execution schedule for coordinators, vendors, and hosts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isLiveMode ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Smartphone className="w-3.5 h-3.5" />}
            onClick={() => setIsLiveMode(!isLiveMode)}
          >
            {isLiveMode ? 'Exit Live Mode' : 'Live Execution Mode'}
          </Button>

          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
          >
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'completed', 'flagged'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-3 py-1 text-xs rounded-full font-semibold capitalize transition-all ${selectedFilter === f
                ? 'bg-charcoal-900 text-ivory-50 dark:bg-ivory-100 dark:text-charcoal-900 shadow-subtle'
                : 'bg-ivory-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-400 hover:bg-ivory-200'
              }`}
          >
            {f} ({sortedRunbook.filter((i) => f === 'all' || (f === 'pending' ? i.status !== 'completed' && i.status !== 'flagged' : i.status === f)).length})
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-400">
            No schedule milestones matching this filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isFlagged = item.status === 'flagged';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${isFlagged
                    ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-900'
                    : isCompleted
                      ? 'bg-ivory-50/70 dark:bg-charcoal-900/60 border-ivory-200 dark:border-charcoal-800 opacity-80'
                      : isInProgress
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-card'
                        : 'bg-white dark:bg-charcoal-850 border-ivory-200 dark:border-charcoal-700 shadow-subtle'
                  }`}
              >
                {/* Time Badge Column */}
                <div className="w-24 sm:w-28 shrink-0 text-left">
                  <div className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-charcoal-900 dark:text-ivory-50">
                    <Clock className="w-3.5 h-3.5 text-sage-600" />
                    <span>{item.time}</span>
                  </div>
                  {item.durationMinutes && (
                    <span className="block text-[10px] text-charcoal-400 mt-0.5">
                      ~{item.durationMinutes} mins
                    </span>
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className={`text-sm sm:text-base font-bold ${isCompleted
                          ? 'line-through text-charcoal-400'
                          : 'text-charcoal-900 dark:text-ivory-50'
                        }`}
                    >
                      {item.title}
                    </h3>
                    <Badge
                      variant={
                        isCompleted
                          ? 'sage'
                          : isFlagged
                            ? 'red'
                            : isInProgress
                              ? 'amber'
                              : 'neutral'
                      }
                      size="sm"
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500 mb-2">
                    <span className="flex items-center gap-1 font-medium text-charcoal-700 dark:text-charcoal-300">
                      <User className="w-3 h-3 text-charcoal-400" />
                      <span>{item.responsible}</span>
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-charcoal-400" />
                        <span>{item.location}</span>
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-charcoal-600 dark:text-charcoal-400 bg-white/70 dark:bg-charcoal-900/60 p-2.5 rounded-lg border border-ivory-200 dark:border-charcoal-800 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleFlagIssue(item)}
                    className={`p-2 rounded-lg transition-colors ${isFlagged
                        ? 'bg-red-600 text-white'
                        : 'text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800'
                      }`}
                    title={isFlagged ? 'Resolve issue flag' : 'Flag an urgent delay/issue'}
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleStatus(item)}
                    className={`p-2 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all ${isCompleted
                        ? 'bg-sage-600 text-white'
                        : 'bg-ivory-200 hover:bg-sage-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-ivory-100 hover:text-sage-800'
                      }`}
                    title="Toggle progress status"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isCompleted ? 'Done' : 'Mark Done'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRunbookItem(item.id)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Milestone Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Runbook Milestone' : 'Add Runbook Milestone'}
      >
        <form onSubmit={handleSaveItem} className="space-y-3.5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 06:30 PM"
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RunbookStatus)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="flagged">Flagged Issue</option>
              </select>
            </div>
          </div>

          <Input
            label="Milestone Activity Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Guest arrivals & welcome drinks service"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Responsible Lead / Vendor"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="e.g. Greeter / Priya"
              required
            />
            <Input
              label="Location / Zone"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Entrance Foyer"
            />
          </div>

          <Textarea
            label="Specific Notes or Instructions"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cue spotlight, check microphone batteries, ensure pure veg tray ready"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              {editingItem ? 'Save Milestone' : 'Add Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

