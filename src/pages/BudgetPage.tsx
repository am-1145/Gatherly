import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieChartIcon,
  TrendingUp,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { BudgetCategory } from '../types';
import { formatCurrency } from '../utils/formatters';

const CHART_COLORS = [
  '#4E8063', // sage
  '#CF6B46', // terracotta
  '#D99B26', // amber
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#64748B', // slate
];

export const BudgetPage: React.FC = () => {
  const {
    activeEvent,
    metrics,
    updateBudgetTotal,
    updateCategoryAllocation,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useEvent();

  const [isTotalBudgetModalOpen, setIsTotalBudgetModalOpen] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState(activeEvent?.budget.total || 0);

  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('All');

  // Expense form state
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(
    activeEvent?.budget.categories[0]?.key || 'Venue'
  );
  const [expenseEstimated, setExpenseEstimated] = useState<number>(0);
  const [expenseActual, setExpenseActual] = useState<number>(0);
  const [expenseIsPaid, setExpenseIsPaid] = useState(false);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Editing Category Allocation Modal
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editAllocatedAmount, setEditAllocatedAmount] = useState<number>(0);

  const budget = activeEvent?.budget;
  const currency = budget?.currency || 'INR';

  // Filter expenses by selected category
  const filteredExpenses = useMemo(() => {
    if (!budget) return [];
    if (selectedCategoryKey === 'All') return budget.expenses;
    return budget.expenses.filter((e) => e.categoryKey === selectedCategoryKey);
  }, [budget, selectedCategoryKey]);

  // Recharts data for pie chart
  const pieChartData = useMemo(() => {
    if (!budget) return [];
    return budget.categories.map((c) => ({
      name: c.name,
      value: c.allocatedAmount,
    }));
  }, [budget]);

  // Recharts comparison data (Allocated vs Estimated vs Actual)
  const comparisonBarData = useMemo(() => {
    if (!budget) return [];
    return budget.categories.map((c) => {
      const catExpenses = budget.expenses.filter((e) => e.categoryKey === c.key);
      const estimated = catExpenses.reduce((s, e) => s + (e.estimatedAmount || 0), 0);
      const actualPaid = catExpenses.reduce(
        (s, e) => s + (e.isPaid ? e.actualAmount || e.estimatedAmount : 0),
        0
      );
      return {
        name: c.name.split(' ')[0], // short name
        Allocated: c.allocatedAmount,
        Estimated: estimated,
        Paid: actualPaid,
      };
    });
  }, [budget]);

  if (!activeEvent || !budget) return null;

  const handleSaveTotalBudget = () => {
    updateBudgetTotal(newTotalBudget);
    setIsTotalBudgetModalOpen(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || expenseEstimated <= 0) return;

    addExpense({
      name: expenseName.trim(),
      categoryKey: expenseCategory,
      estimatedAmount: expenseEstimated,
      actualAmount: expenseActual || expenseEstimated,
      isPaid: expenseIsPaid,
      notes: expenseNotes.trim(),
    });

    // Reset
    setExpenseName('');
    setExpenseEstimated(0);
    setExpenseActual(0);
    setExpenseIsPaid(false);
    setExpenseNotes('');
    setIsAddExpenseModalOpen(false);
  };

  const handleSaveCategoryAllocation = () => {
    if (!editingCategory) return;
    updateCategoryAllocation(editingCategory.key, editAllocatedAmount);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Budget Planner & Expenses
            </h1>
            <Badge variant="sage" size="sm">
              {currency}
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Real-time deterministic calculations across allocations, estimates, and settled payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => {
              setNewTotalBudget(budget.total);
              setIsTotalBudgetModalOpen(true);
            }}
          >
            Edit Total Budget
          </Button>

          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddExpenseModalOpen(true)}
          >
            Record Expense
          </Button>
        </div>
      </div>

      {/* Over-allocation or Over-budget Warning Banner */}
      {metrics.isOverAllocated && (
        <div className="p-4 rounded-xl bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-800 flex items-start gap-3 text-xs text-terracotta-900 dark:text-terracotta-100 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Warning: Category allocations exceed your total budget by{' '}
              {formatCurrency(Math.abs(metrics.allocationVariance), currency)}.
            </p>
            <p className="text-[11px] text-terracotta-700 dark:text-terracotta-300 leading-relaxed">
              Your categories total {formatCurrency(metrics.totalAllocated, currency)} against a
              ceiling of {formatCurrency(metrics.totalBudget, currency)}. Consider reducing
              Catering or Decor allocations, or expanding your overall budget.
            </p>
          </div>
        </div>
      )}

      {/* Key Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
            Total Budget
          </span>
          <p className="text-2xl font-black text-charcoal-900 dark:text-ivory-50">
            {formatCurrency(metrics.totalBudget, currency)}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-1">Target ceiling</span>
        </Card>

        <Card>
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
            Allocated Sum
          </span>
          <p
            className={`text-2xl font-black ${
              metrics.isOverAllocated
                ? 'text-terracotta-600'
                : 'text-charcoal-900 dark:text-ivory-50'
            }`}
          >
            {formatCurrency(metrics.totalAllocated, currency)}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-1">
            {Math.round((metrics.totalAllocated / (metrics.totalBudget || 1)) * 100)}% of ceiling
          </span>
        </Card>

        <Card>
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
            Actual Paid Out
          </span>
          <p className="text-2xl font-black text-sage-700 dark:text-sage-400">
            {formatCurrency(metrics.totalActualPaid, currency)}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-1">Settled payments</span>
        </Card>

        <Card>
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
            Remaining Cash
          </span>
          <p
            className={`text-2xl font-black ${
              metrics.remainingBudget >= 0 ? 'text-charcoal-900 dark:text-ivory-50' : 'text-red-600'
            }`}
          >
            {formatCurrency(metrics.remainingBudget, currency)}
          </p>
          <span className="text-[11px] text-charcoal-500 block mt-1">Unspent balance</span>
        </Card>
      </div>

      {/* Visual Charts: Pie Chart (Allocation) & Bar Chart (Allocated vs Paid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Allocation Distribution */}
        <Card padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                Spending Allocation by Category
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Proportional distribution across event needs
              </p>
            </div>
            <PieChartIcon className="w-4 h-4 text-charcoal-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val, currency), 'Allocated']}
                  contentStyle={{
                    backgroundColor: '#1E2025',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-ivory-100 dark:border-charcoal-800 text-[11px]">
            {budget.categories.map((c, i) => (
              <div key={c.key} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="truncate text-charcoal-600 dark:text-charcoal-300">
                  {c.name}: <strong>{formatCurrency(c.allocatedAmount, currency, true)}</strong>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar Chart: Category Comparison */}
        <Card padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                Allocated vs Actual Paid
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Tracking commitment variance per vertical
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-charcoal-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888" />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val, currency), '']}
                  contentStyle={{
                    backgroundColor: '#1E2025',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Allocated" fill="#CFD8D3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paid" fill="#4E8063" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-ivory-100 dark:border-charcoal-800 text-[11px] text-charcoal-600 dark:text-charcoal-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#CFD8D3]" />
              <span>Allocated Target</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-sage-600" />
              <span>Actual Paid Out</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Allocations Interactive Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-ivory-200 dark:border-charcoal-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
              Category Allocation Controls
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Click any category to reallocate its budget ceiling.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Budget category allocation summary</caption>
            <thead className="bg-ivory-100/70 dark:bg-charcoal-800/60 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-ivory-200 dark:border-charcoal-700">
              <tr>
                <th scope="col" className="py-3 px-4">Category</th>
                <th scope="col" className="py-3 px-4">Allocated</th>
                <th scope="col" className="py-3 px-4">Estimated Total</th>
                <th scope="col" className="py-3 px-4">Actual Paid</th>
                <th scope="col" className="py-3 px-4">Variance</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-800 text-charcoal-800 dark:text-charcoal-200">
              {budget.categories.map((cat) => {
                const catExpenses = budget.expenses.filter((e) => e.categoryKey === cat.key);
                const estTotal = catExpenses.reduce((s, e) => s + (e.estimatedAmount || 0), 0);
                const paidTotal = catExpenses.reduce(
                  (s, e) => s + (e.isPaid ? e.actualAmount || e.estimatedAmount : 0),
                  0
                );
                const variance = cat.allocatedAmount - estTotal;

                return (
                  <tr
                    key={cat.key}
                    className="hover:bg-ivory-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-charcoal-900 dark:text-ivory-100">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(cat.allocatedAmount, currency)}
                    </td>
                    <td className="py-3 px-4">{formatCurrency(estTotal, currency)}</td>
                    <td className="py-3 px-4 font-medium text-sage-700 dark:text-sage-400">
                      {formatCurrency(paidTotal, currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          variance >= 0 ? 'text-sage-600' : 'text-terracotta-600'
                        }`}
                      >
                        {variance >= 0 ? '+' : ''}
                        {formatCurrency(variance, currency)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditAllocatedAmount(cat.allocatedAmount);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Itemized Expenses List */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-ivory-200 dark:border-charcoal-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
              Itemized Expenses & Commitments
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Record quotations, advances, and final vendor payments.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {['All', ...budget.categories.map((c) => c.key)].map((catKey) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategoryKey(catKey)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategoryKey === catKey
                    ? 'bg-sage-600 text-white shadow-subtle'
                    : 'bg-ivory-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-400 hover:bg-ivory-200'
                }`}
              >
                {catKey}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Detailed expense line items</caption>
            <thead className="bg-ivory-100/70 dark:bg-charcoal-800/60 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-ivory-200 dark:border-charcoal-700">
              <tr>
                <th scope="col" className="py-3 px-4">Expense Item</th>
                <th scope="col" className="py-3 px-4">Category</th>
                <th scope="col" className="py-3 px-4">Estimated</th>
                <th scope="col" className="py-3 px-4">Actual Amount</th>
                <th scope="col" className="py-3 px-4">Payment Status</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-800 text-charcoal-800 dark:text-charcoal-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-charcoal-400">
                    No expense records found under this filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-ivory-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-charcoal-900 dark:text-ivory-100">
                        {exp.name}
                      </p>
                      {exp.notes && (
                        <p className="text-[11px] text-charcoal-400 mt-0.5">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">
                        {exp.categoryKey}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{formatCurrency(exp.estimatedAmount, currency)}</td>
                    <td className="py-3 px-4 font-bold text-charcoal-900 dark:text-ivory-50">
                      {formatCurrency(exp.actualAmount || exp.estimatedAmount, currency)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          updateExpense({
                            ...exp,
                            isPaid: !exp.isPaid,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          exp.isPaid
                            ? 'bg-sage-100 text-sage-800 dark:bg-sage-950/60 dark:text-sage-300'
                            : 'bg-ivory-200 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-400 hover:bg-ivory-300'
                        }`}
                      >
                        {exp.isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <span>Unpaid (Mark Paid)</span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Total Budget Modal */}
      <Modal
        isOpen={isTotalBudgetModalOpen}
        onClose={() => setIsTotalBudgetModalOpen(false)}
        title="Adjust Total Event Budget"
        description="Changing the overall budget recalculates remaining balances across all screens."
      >
        <div className="space-y-4 py-2">
          <Input
            label={`Budget Ceiling (${currency})`}
            type="number"
            min={100}
            step={1000}
            value={newTotalBudget}
            onChange={(e) => setNewTotalBudget(parseFloat(e.target.value) || 0)}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTotalBudgetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" onClick={handleSaveTotalBudget}>
              Save Budget
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Record New Expense or Quote"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3.5 py-2">
          <Input
            label="Expense Description"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            placeholder="e.g. Stage floral runner, DJ sound console, Cake deposit"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                {budget.categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={`Estimated Amount (${currency})`}
              type="number"
              min={1}
              value={expenseEstimated || ''}
              onChange={(e) => setExpenseEstimated(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Actual Paid (${currency})`}
              type="number"
              min={0}
              value={expenseActual || ''}
              onChange={(e) => setExpenseActual(parseFloat(e.target.value) || 0)}
              hint="Leave 0 if unpaid"
            />

            <div className="flex flex-col justify-center pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 dark:text-charcoal-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expenseIsPaid}
                  onChange={(e) => setExpenseIsPaid(e.target.checked)}
                  className="rounded text-sage-600 focus:ring-sage-500 w-4 h-4"
                />
                <span>Settled / Paid in full</span>
              </label>
            </div>
          </div>

          <Input
            label="Notes or Vendor Reference"
            value={expenseNotes}
            onChange={(e) => setExpenseNotes(e.target.value)}
            placeholder="Advance paid via UPI, balance due on event day"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Allocation Modal */}
      {editingCategory && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          title={`Adjust ${editingCategory.name} Allocation`}
        >
          <div className="space-y-4 py-2">
            <Input
              label={`Allocated Target Amount (${currency})`}
              type="number"
              min={0}
              step={500}
              value={editAllocatedAmount}
              onChange={(e) => setEditAllocatedAmount(parseFloat(e.target.value) || 0)}
            />

            <div className="flex justify-end gap-2.5 pt-3 border-t border-ivory-200 dark:border-charcoal-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button variant="sage" size="sm" onClick={handleSaveCategoryAllocation}>
                Update Allocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

