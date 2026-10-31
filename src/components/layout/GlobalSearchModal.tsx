import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckSquare, Store, Users, Wallet, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useEvent } from '../../context/EventContext';
import { formatCurrency } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { activeEvent } = useEvent();
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim() || !activeEvent) return [];
    const q = query.toLowerCase();

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'task' | 'vendor' | 'guest' | 'expense';
      route: string;
    }> = [];

    // Search tasks
    activeEvent.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
        items.push({
          id: t.id,
          title: t.title,
          subtitle: `Task • ${t.category} • ${t.status}`,
          type: 'task',
          route: '/app/tasks',
        });
      }
    });

    // Search vendors
    activeEvent.vendors.forEach((v) => {
      if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
        items.push({
          id: v.id,
          title: v.name,
          subtitle: `Vendor • ${v.category} • ${formatCurrency(v.quotation.price, activeEvent.budget.currency)}`,
          type: 'vendor',
          route: '/app/vendors',
        });
      }
    });

    // Search guests
    activeEvent.guests.forEach((g) => {
      if (g.name.toLowerCase().includes(q) || (g.phone && g.phone.includes(q))) {
        items.push({
          id: g.id,
          title: g.name,
          subtitle: `Guest • ${g.group} • ${g.status}`,
          type: 'guest',
          route: '/app/guests',
        });
      }
    });

    // Search expenses
    activeEvent.budget.expenses.forEach((e) => {
      if (e.name.toLowerCase().includes(q) || e.categoryKey.toLowerCase().includes(q)) {
        items.push({
          id: e.id,
          title: e.name,
          subtitle: `Expense • ${e.categoryKey} • ${formatCurrency(e.estimatedAmount, activeEvent.budget.currency)}`,
          type: 'expense',
          route: '/app/budget',
        });
      }
    });

    return items.slice(0, 8);
  }, [query, activeEvent]);

  const handleSelect = (route: string) => {
    onClose();
    navigate(route);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-sage-600" />;
      case 'vendor':
        return <Store className="w-4 h-4 text-blue-600" />;
      case 'guest':
        return <Users className="w-4 h-4 text-terracotta-500" />;
      case 'expense':
        return <Wallet className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={false} aria-label="Search Workspace">
      <div className="relative">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-ivory-200 dark:border-charcoal-800">
          <Search className="w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, vendors, guests, expenses... (Esc to exit)"
            aria-label="Search tasks, vendors, guests, and expenses"
            className="w-full text-sm bg-transparent border-0 focus:outline-none text-charcoal-900 dark:text-ivory-50 placeholder-charcoal-400"
            autoFocus
          />
        </div>

        <div className="py-3 max-h-80 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="text-center py-6 text-xs text-charcoal-400">
              Type keywords to search across your active event workspace.
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-6 text-xs text-charcoal-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.route)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-ivory-100 dark:hover:bg-charcoal-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getIcon(item.type)}</div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-charcoal-900 dark:text-ivory-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

