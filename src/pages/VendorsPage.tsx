import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Edit2,
  Bookmark,
  BookmarkCheck,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { VendorItem, VendorStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const VENDOR_CATEGORIES = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Makeup & Styling',
  'Logistics',
  'Other',
];

export const VendorsPage: React.FC = () => {
  const { activeEvent, metrics, addVendor, updateVendor, deleteVendor } = useEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal states
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Comparison Matrix Modal
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<VendorStatus>('shortlisted');
  const [rating, setRating] = useState<number>(4.8);
  const [includedServices, setIncludedServices] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  if (!activeEvent) return null;

  const currency = activeEvent.budget.currency;

  const filteredVendors = useMemo(() => {
    return activeEvent.vendors.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && v.status !== selectedStatus) return false;
      return true;
    });
  }, [activeEvent.vendors, searchQuery, selectedCategory, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setName('');
    setCategory('Venue');
    setContactName('');
    setPhone('');
    setEmail('');
    setPrice(10000);
    setStatus('shortlisted');
    setRating(4.8);
    setIncludedServices('');
    setExclusions('');
    setPaymentTerms('50% advance on booking, 50% post-event completion');
    setNotes('');
    setIsVendorModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContactName(v.contactName);
    setPhone(v.phone);
    setEmail(v.email);
    setPrice(v.quotation.price);
    setStatus(v.status);
    setRating(v.rating);
    setIncludedServices(v.quotation.includedServices?.join(', ') || '');
    setExclusions(v.quotation.exclusions?.join(', ') || '');
    setPaymentTerms(v.quotation.paymentTerms || '');
    setNotes(v.notes || '');
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const incList = includedServices
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const excList = exclusions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingVendor) {
      updateVendor({
        ...editingVendor,
        name: name.trim(),
        category,
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        status,
        rating,
        quotation: {
          ...editingVendor.quotation,
          price: Math.max(0, price),
          includedServices: incList,
          exclusions: excList,
          paymentTerms: paymentTerms.trim(),
        },
        notes: notes.trim() || undefined,
      });
    } else {
      addVendor({
        name: name.trim(),
        category,
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        status,
        rating,
        quotation: {
          price: Math.max(0, price),
          includedServices: incList,
          exclusions: excList,
          paymentTerms: paymentTerms.trim(),
        },
        notes: notes.trim() || undefined,
        isVerifiedSample: false,
      });
    }

    setIsVendorModalOpen(false);
  };

  const toggleBookedStatus = (vendor: VendorItem) => {
    const nextStatus: VendorStatus = vendor.status === 'booked' ? 'shortlisted' : 'booked';
    updateVendor({
      ...vendor,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Vendor Management & Quotations
            </h1>
            <Badge variant="sage" size="sm">
              {metrics.bookedVendors} Booked
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Compare quotations, deliverables, payment terms, and booking statuses for {activeEvent.title}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Layers className="w-3.5 h-3.5" />}
            onClick={() => setIsCompareModalOpen(true)}
            disabled={activeEvent.vendors.length < 2}
          >
            Compare Quotes
          </Button>

          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
          >
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-ivory-100/70 dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 flex items-center justify-between text-xs text-charcoal-600 dark:text-charcoal-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
          <span>
            Initial vendor quotes are sample benchmarks calibrated to Bangalore & metropolitan averages.
            Customize amounts to reflect your negotiated contracts.
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor name or vertical..."
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Categories</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="contacted">Contacted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal-400">
            No vendors found matching criteria.
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              padding="lg"
              className="flex flex-col justify-between hover:border-sage-400 transition-all text-left"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="neutral" size="sm">
                    {vendor.category}
                  </Badge>
                  <Badge
                    variant={
                      vendor.status === 'booked'
                        ? 'sage'
                        : vendor.status === 'shortlisted'
                        ? 'amber'
                        : 'neutral'
                    }
                    size="sm"
                    dot
                  >
                    {vendor.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-charcoal-900 dark:text-ivory-50 mb-1">
                  {vendor.name}
                </h3>

                <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-3">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {vendor.rating}
                  </span>
                  <span>•</span>
                  <span>{vendor.contactName}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700/80 mb-3">
                  <span className="text-[10px] font-semibold uppercase text-charcoal-400 block mb-0.5">
                    Quoted Package
                  </span>
                  <span className="text-xl font-extrabold text-charcoal-900 dark:text-ivory-50">
                    {formatCurrency(vendor.quotation.price, currency)}
                  </span>
                  {vendor.quotation.paymentTerms && (
                    <p className="text-[11px] text-charcoal-500 mt-1 line-clamp-1">
                      Terms: {vendor.quotation.paymentTerms}
                    </p>
                  )}
                </div>

                {/* Included Services Bullets */}
                {vendor.quotation.includedServices && vendor.quotation.includedServices.length > 0 && (
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
                      Included Scope:
                    </span>
                    <ul className="space-y-1">
                      {vendor.quotation.includedServices.slice(0, 3).map((item, idx) => (
                        <li
                          key={idx}
                          className="text-[11px] text-charcoal-600 dark:text-charcoal-300 flex items-start gap-1.5 leading-snug"
                        >
                          <Check className="w-3 h-3 text-sage-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact phone/email */}
                <div className="text-[11px] text-charcoal-500 space-y-0.5 pt-2 border-t border-ivory-100 dark:border-charcoal-800">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-charcoal-400" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-charcoal-400" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-ivory-100 dark:border-charcoal-800">
                <Button
                  variant={vendor.status === 'booked' ? 'outline' : 'sage'}
                  size="sm"
                  leftIcon={vendor.status === 'booked' ? <Check className="w-3.5 h-3.5" /> : undefined}
                  onClick={() => toggleBookedStatus(vendor)}
                >
                  {vendor.status === 'booked' ? 'Booked' : 'Confirm Booking'}
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                    title="Edit vendor quote"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                    title="Remove vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Quotation' : 'Add New Vendor & Quote'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveVendor} className="space-y-3.5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Vendor / Business Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lumina Aesthetic Floral"
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Contact Person"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Manager name"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98..."
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Quoted Package Price (${currency})`}
              type="number"
              min={0}
              step={500}
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="shortlisted">Shortlisted</option>
                <option value="contacted">Contacted</option>
                <option value="booked">Booked</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Included Services (comma-separated)"
            rows={2}
            value={includedServices}
            onChange={(e) => setIncludedServices(e.target.value)}
            placeholder="e.g. 5 hours sound, 2 wireless mics, DJ console setup"
          />

          <Textarea
            label="Exclusions (comma-separated)"
            rows={2}
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            placeholder="e.g. Generator fuel, overtime charges past midnight"
          />

          <Input
            label="Payment Milestones & Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="50% advance on booking, balance on event morning"
          />

          <Textarea
            label="Internal Notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Negotiated 10% discount if settled in cash"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsVendorModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              {editingVendor ? 'Save Changes' : 'Save Vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quotation Comparison Side-by-Side Matrix Modal */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side Vendor Quotation Matrix"
        description="Compare deliverables, price points, and terms across your active vendor pool."
        maxWidth="2xl"
      >
        <div className="overflow-x-auto py-2">
          <table className="w-full text-left text-xs border border-ivory-200 dark:border-charcoal-700 rounded-lg">
            <thead className="bg-ivory-100/70 dark:bg-charcoal-800 text-charcoal-700 dark:text-ivory-100">
              <tr>
                <th className="p-3 w-32 border-b border-ivory-200 dark:border-charcoal-700">Vendor</th>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <th
                    key={v.id}
                    className="p-3 border-b border-ivory-200 dark:border-charcoal-700 font-bold"
                  >
                    <div>{v.name}</div>
                    <span className="text-[10px] text-charcoal-400 capitalize">{v.category}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-800 text-charcoal-700 dark:text-charcoal-300">
              <tr>
                <td className="p-3 font-semibold bg-ivory-50 dark:bg-charcoal-850">Price</td>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <td key={v.id} className="p-3 font-bold text-sage-700 dark:text-sage-400">
                    {formatCurrency(v.quotation.price, currency)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-ivory-50 dark:bg-charcoal-850">Status</td>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <td key={v.id} className="p-3">
                    <Badge variant={v.status === 'booked' ? 'sage' : 'amber'} size="sm">
                      {v.status}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-ivory-50 dark:bg-charcoal-850">Included</td>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <td key={v.id} className="p-3">
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {(v.quotation.includedServices || ['Standard scope']).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-ivory-50 dark:bg-charcoal-850">Exclusions</td>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <td key={v.id} className="p-3">
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-charcoal-400">
                      {(v.quotation.exclusions || ['None noted']).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-ivory-50 dark:bg-charcoal-850">Payment Terms</td>
                {activeEvent.vendors.slice(0, 3).map((v) => (
                  <td key={v.id} className="p-3 text-[11px]">
                    {v.quotation.paymentTerms || 'Standard'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

