import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Mail,
  MessageSquare,
  Check,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  UserCheck,
  Utensils,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { GuestItem, RSVPStatus, DietaryPreference } from '../types';
import { formatDate } from '../utils/formatters';

export const GuestsPage: React.FC = () => {
  const { activeEvent, metrics, addGuest, updateGuest, deleteGuest } = useEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');

  // Modal states
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState<GuestItem['group']>('Friends');
  const [status, setStatus] = useState<RSVPStatus>('pending');
  const [diet, setDiet] = useState<DietaryPreference>('Standard');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [tableOrArea, setTableOrArea] = useState('');
  const [notes, setNotes] = useState('');

  if (!activeEvent) return null;

  const filteredGuests = useMemo(() => {
    return activeEvent.guests.filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !g.name.toLowerCase().includes(q) &&
          !(g.phone && g.phone.includes(q)) &&
          !(g.email && g.email.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (selectedStatus !== 'All' && g.status !== selectedStatus) return false;
      if (selectedGroup !== 'All' && g.group !== selectedGroup) return false;
      if (selectedDiet !== 'All' && g.diet !== selectedDiet) return false;
      return true;
    });
  }, [activeEvent.guests, searchQuery, selectedStatus, selectedGroup, selectedDiet]);

  // Dietary counts breakdown
  const dietStats = useMemo(() => {
    const stats: Record<string, number> = {};
    activeEvent.guests.forEach((g) => {
      stats[g.diet] = (stats[g.diet] || 0) + 1 + (g.plusOnes || 0);
    });
    return stats;
  }, [activeEvent.guests]);

  const handleOpenCreate = () => {
    setEditingGuest(null);
    setName('');
    setPhone('');
    setEmail('');
    setGroup('Friends');
    setStatus('pending');
    setDiet('Standard');
    setPlusOnes(0);
    setTableOrArea('');
    setNotes('');
    setIsGuestModalOpen(true);
  };

  const handleOpenEdit = (guest: GuestItem) => {
    setEditingGuest(guest);
    setName(guest.name);
    setPhone(guest.phone || '');
    setEmail(guest.email || '');
    setGroup(guest.group);
    setStatus(guest.status);
    setDiet(guest.diet);
    setPlusOnes(guest.plusOnes);
    setTableOrArea(guest.tableOrArea || '');
    setNotes(guest.notes || '');
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGuest) {
      updateGuest({
        ...editingGuest,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        group,
        status,
        diet,
        plusOnes: Math.max(0, plusOnes),
        tableOrArea: tableOrArea.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addGuest({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        group,
        status,
        diet,
        plusOnes: Math.max(0, plusOnes),
        tableOrArea: tableOrArea.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsGuestModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Group', 'RSVP Status', 'Plus Ones', 'Diet', 'Table', 'Notes'];
    const rows = activeEvent.guests.map((g) => [
      `"${g.name}"`,
      `"${g.phone || ''}"`,
      `"${g.email || ''}"`,
      `"${g.group}"`,
      `"${g.status}"`,
      g.plusOnes,
      `"${g.diet}"`,
      `"${g.tableOrArea || ''}"`,
      `"${g.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeEvent.title.replace(/\s+/g, '_')}_Guests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generated Invitation Message Template
  const sampleInviteMessage = `✨ You are cordially invited to celebrate with us! ✨

Event: ${activeEvent.title}
Date: ${formatDate(activeEvent.date)}
Location: ${activeEvent.venueName || activeEvent.city}
Theme: ${activeEvent.preferences.theme || 'Classy Chic'}

Please confirm your attendance & dietary preferences here:
👉 https://gatherly.ai/rsvp/${activeEvent.id}

We can't wait to celebrate together! 🎉`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(sampleInviteMessage);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Guests & RSVPs
            </h1>
            <Badge variant="sage" size="sm">
              {metrics.totalAttendingHeadcount} Attending Headcount
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Household grouping, plus-one accounting, dietary needs, and automated invite messaging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
          >
            Add Guest
          </Button>
        </div>
      </div>

      {/* RSVP Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-sage-600" />
          </div>
          <p className="text-2xl font-black text-sage-700 dark:text-sage-400">
            {metrics.confirmedGuestsCount}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-0.5">
            {metrics.totalAttendingHeadcount} covers including +1s
          </span>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Tentative</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {metrics.tentativeGuestsCount}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-0.5">Awaiting confirmation</span>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Declined</span>
            <XCircle className="w-4 h-4 text-charcoal-400" />
          </div>
          <p className="text-2xl font-black text-charcoal-500">
            {metrics.declinedGuestsCount}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-0.5">Unable to attend</span>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pending Reply</span>
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600">
            {metrics.pendingGuestsCount}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-0.5">Invite sent out</span>
        </Card>
      </div>

      {/* Dietary Summary Banner */}
      <div className="p-3.5 rounded-xl bg-ivory-100/70 dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-charcoal-800 dark:text-ivory-100 uppercase tracking-wider text-[11px]">
          <Utensils className="w-4 h-4 text-sage-600" />
          <span>Dietary Breakdown:</span>
        </div>
        {Object.entries(dietStats).map(([d, count]) => (
          <div key={d} className="flex items-center gap-1">
            <span className="font-semibold text-charcoal-700 dark:text-charcoal-300">{d}:</span>
            <span className="px-2 py-0.5 rounded-full bg-white dark:bg-charcoal-800 font-bold text-charcoal-900 dark:text-ivory-50 border border-ivory-200 dark:border-charcoal-700">
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All RSVPs</option>
            <option value="confirmed">Confirmed</option>
            <option value="tentative">Tentative</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
          </select>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Groups</option>
            <option value="Family">Family</option>
            <option value="Friends">Friends</option>
            <option value="VIP">VIP</option>
            <option value="Colleagues">Colleagues</option>
            <option value="Other">Other</option>
          </select>

          {/* Diet Filter */}
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Diets</option>
            <option value="Standard">Standard</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Jain">Jain</option>
            <option value="Gluten-Free">Gluten-Free</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-100/70 dark:bg-charcoal-800/60 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-ivory-200 dark:border-charcoal-700">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Group</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4">Plus-Ones</th>
                <th className="py-3 px-4">Diet</th>
                <th className="py-3 px-4">Table / Area</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-800 text-charcoal-800 dark:text-charcoal-200">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-charcoal-400">
                    No guests matching criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-ivory-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-ivory-100">
                      {g.name}
                      {g.notes && (
                        <span className="block text-[10px] text-charcoal-400 font-normal">
                          {g.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-charcoal-500">
                      {g.phone || g.email || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">
                        {g.group}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          g.status === 'confirmed'
                            ? 'sage'
                            : g.status === 'tentative'
                            ? 'amber'
                            : g.status === 'declined'
                            ? 'terracotta'
                            : 'neutral'
                        }
                        size="sm"
                        dot
                      >
                        {g.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      +{g.plusOnes} {g.plusOnes > 0 ? `(${1 + g.plusOnes} total)` : ''}
                    </td>
                    <td className="py-3 px-4">{g.diet}</td>
                    <td className="py-3 px-4 text-charcoal-500">{g.tableOrArea || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGuest(g.id)}
                          className="p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        title={editingGuest ? 'Edit Guest Details' : 'Add Guest to RSVP Registry'}
      >
        <form onSubmit={handleSaveGuest} className="space-y-3.5 py-2">
          <Input
            label="Guest / Household Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Ramesh & Sunita Singhania"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 12345"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Group
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as any)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="VIP">VIP</option>
                <option value="Colleagues">Colleagues</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                RSVP Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RSVPStatus)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="tentative">Tentative</option>
                <option value="declined">Declined</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Dietary Preference
              </label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value as DietaryPreference)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="Standard">Standard</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Halal">Halal</option>
              </select>
            </div>

            <Input
              label="Plus-Ones Count"
              type="number"
              min={0}
              max={10}
              value={plusOnes}
              onChange={(e) => setPlusOnes(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Seating / Table Area"
              value={tableOrArea}
              onChange={(e) => setTableOrArea(e.target.value)}
              placeholder="e.g. Table 4, High Tops Lounge"
            />
            <Input
              label="Special Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Arriving late, allergy to peanuts"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsGuestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              {editingGuest ? 'Save Changes' : 'Add Guest'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invitation Template Generator Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="WhatsApp & Digital RSVP Message Generator"
        description="Share this message with your guests to gather attendance and food preferences."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-ivory-100/70 dark:bg-charcoal-800 border border-ivory-200 dark:border-charcoal-700 font-mono text-xs whitespace-pre-line leading-relaxed text-charcoal-800 dark:text-ivory-100">
            {sampleInviteMessage}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-ivory-200 dark:border-charcoal-800">
            <span className="text-[11px] text-charcoal-500">
              *RSVP responses can be tracked directly in this workspace.
            </span>
            <Button
              variant="sage"
              size="sm"
              leftIcon={copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyInvite}
            >
              {copiedInvite ? 'Copied to Clipboard!' : 'Copy Invitation Text'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

