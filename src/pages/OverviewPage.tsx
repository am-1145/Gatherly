import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckSquare,
  Store,
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const { activeEvent, metrics, toggleTaskStatus } = useEvent();
  const navigate = useNavigate();

  if (!activeEvent) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-charcoal-500">No active event selected.</p>
      </div>
    );
  }

  const { budget, tasks = [], guests = [], vendors = [], recommendations = [] } = activeEvent;
  const currency = budget.currency;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Event Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-ivory-100 via-white to-ivory-100 dark:from-charcoal-900 dark:via-charcoal-850 dark:to-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="sage" size="md">
              {activeEvent.occasion.toUpperCase()}
            </Badge>
            <span className="text-xs font-medium text-charcoal-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
              <span>{activeEvent.city}</span>
            </span>
            <span className="text-xs font-medium text-charcoal-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
              <span>{formatDate(activeEvent.date)}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
            {activeEvent.title}
          </h1>

          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1 max-w-xl">
            {activeEvent.preferences?.theme || 'Classy Theme'} •{' '}
            {activeEvent.venueName || 'Venue TBD'}
          </p>
        </div>

        {/* Countdown Badge & Quick CTAs */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800/80 text-center">
            <span className="text-xs font-semibold text-sage-800 dark:text-sage-200 block">
              {metrics.daysRemaining.label}
            </span>
            <span className="text-[11px] text-sage-600 dark:text-sage-400">
              {metrics.daysRemaining.days} days to go
            </span>
          </div>

          <Button
            variant="sage"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('/app/copilot')}
          >
            Ask AI Copilot
          </Button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget */}
        <Card
          className="cursor-pointer hover:border-sage-400 transition-all group"
          onClick={() => navigate('/app/budget')}
        >
          <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Budget</span>
            <div className="w-7 h-7 rounded-lg bg-ivory-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-700 dark:text-charcoal-300 group-hover:bg-sage-100 transition-colors">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 dark:text-ivory-50 mb-1">
            {formatCurrency(metrics.totalBudget, currency)}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-500">
              Paid: {formatCurrency(metrics.totalActualPaid, currency)}
            </span>
            <span
              className={`font-semibold ${
                metrics.remainingBudget >= 0 ? 'text-sage-600' : 'text-terracotta-600'
              }`}
            >
              {formatCurrency(metrics.remainingBudget, currency)} left
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={(metrics.totalActualPaid / (metrics.totalBudget || 1)) * 100}
              color={metrics.isOverBudget ? 'terracotta' : 'sage'}
              size="sm"
            />
          </div>
        </Card>

        {/* Metric 2: Guests & RSVP */}
        <Card
          className="cursor-pointer hover:border-sage-400 transition-all group"
          onClick={() => navigate('/app/guests')}
        >
          <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Guest RSVPs
            </span>
            <div className="w-7 h-7 rounded-lg bg-ivory-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-700 dark:text-charcoal-300 group-hover:bg-sage-100 transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 dark:text-ivory-50 mb-1">
            {metrics.confirmedGuestsCount}{' '}
            <span className="text-sm font-normal text-charcoal-400">
              / {metrics.totalGuestsTarget} Target
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-500">
              {metrics.totalAttendingHeadcount} total attending (incl. +1s)
            </span>
            <span className="font-semibold text-charcoal-700 dark:text-charcoal-300">
              {metrics.pendingGuestsCount} pending
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={(metrics.confirmedGuestsCount / (metrics.totalGuestsTarget || 1)) * 100}
              color="sage"
              size="sm"
            />
          </div>
        </Card>

        {/* Metric 3: Task Progress */}
        <Card
          className="cursor-pointer hover:border-sage-400 transition-all group"
          onClick={() => navigate('/app/tasks')}
        >
          <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Tasks Progress</span>
            <div className="w-7 h-7 rounded-lg bg-ivory-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-700 dark:text-charcoal-300 group-hover:bg-sage-100 transition-colors">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 dark:text-ivory-50 mb-1">
            {metrics.taskProgressPct}%
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-500">
              {metrics.completedTasks} of {metrics.totalTasks} completed
            </span>
            {metrics.overdueTasks > 0 ? (
              <span className="font-bold text-terracotta-600">
                {metrics.overdueTasks} overdue
              </span>
            ) : (
              <span className="text-sage-600 font-medium">On schedule</span>
            )}
          </div>
          <div className="mt-3">
            <ProgressBar value={metrics.taskProgressPct} color="sage" size="sm" />
          </div>
        </Card>

        {/* Metric 4: Vendors */}
        <Card
          className="cursor-pointer hover:border-sage-400 transition-all group"
          onClick={() => navigate('/app/vendors')}
        >
          <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Vendors Booked
            </span>
            <div className="w-7 h-7 rounded-lg bg-ivory-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-700 dark:text-charcoal-300 group-hover:bg-sage-100 transition-colors">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-charcoal-900 dark:text-ivory-50 mb-1">
            {metrics.bookedVendors}{' '}
            <span className="text-sm font-normal text-charcoal-400">
              / {metrics.totalVendors} in list
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-500">
              {metrics.shortlistedVendors} shortlisted
            </span>
            <span className="text-sage-600 font-medium flex items-center gap-0.5">
              <span>Quotes ready</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={(metrics.bookedVendors / (metrics.totalVendors || 1)) * 100}
              color="sage"
              size="sm"
            />
          </div>
        </Card>
      </div>

      {/* Main 2-Column Split: AI Recommendations + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Recommendations & Budget Breakdown Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Priority Recommendations */}
          <Card padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                    AI Priority Recommendations
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    Contextual guidance generated for {activeEvent.title}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/copilot')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Copilot
              </Button>
            </div>

            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-xs text-charcoal-400 py-3">No pending recommendations.</p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-ivory-50/70 dark:bg-charcoal-800/50 border border-ivory-200/80 dark:border-charcoal-700/60 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal-900 dark:text-ivory-100">
                          {rec.title}
                        </span>
                        <Badge
                          variant={rec.impact === 'high' ? 'terracotta' : 'sage'}
                          size="sm"
                        >
                          {rec.impact.toUpperCase()} IMPACT
                        </Badge>
                      </div>
                      <p className="text-[11px] text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Category Spending Preview */}
          <Card padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                  Allocated Spending by Category
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Total allocated: {formatCurrency(metrics.totalAllocated, currency)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/budget')}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                Manage Budget
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {budget.categories.map((cat) => (
                <div
                  key={cat.key}
                  className="p-3 rounded-xl bg-ivory-50/70 dark:bg-charcoal-800/50 border border-ivory-200 dark:border-charcoal-700"
                >
                  <span className="text-[10px] font-semibold text-charcoal-400 uppercase block mb-1">
                    {cat.name}
                  </span>
                  <span className="text-sm font-bold text-charcoal-900 dark:text-ivory-100">
                    {formatCurrency(cat.allocatedAmount, currency)}
                  </span>
                  <span className="text-[10px] text-charcoal-500 block mt-0.5">
                    {Math.round((cat.allocatedAmount / (metrics.totalBudget || 1)) * 100)}% of total
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Urgent Tasks & Next Deadlines */}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-3">
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                Immediate Checklist
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/tasks')}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                View all ({tasks.length})
              </Button>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg border border-ivory-200 dark:border-charcoal-700/80 bg-white dark:bg-charcoal-800 flex items-start gap-3 hover:border-charcoal-300 transition-colors"
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-sage-600 border-sage-600 text-white'
                        : 'border-charcoal-300 dark:border-charcoal-600 hover:border-sage-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug truncate ${
                        task.status === 'completed'
                          ? 'line-through text-charcoal-400'
                          : 'text-charcoal-800 dark:text-charcoal-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-charcoal-400">
                        Due {formatDate(task.dueDate)}
                      </span>
                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'terracotta'
                            : task.priority === 'high'
                            ? 'amber'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-ivory-200 dark:border-charcoal-800">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => navigate('/app/tasks')}
              >
                Add New Task
              </Button>
            </div>
          </Card>

          {/* Runbook Quick Teaser */}
          <Card padding="lg">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-800 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                  Event-Day Schedule
                </h3>
              </div>
              <Badge variant="sage" size="sm">
                {activeEvent.runbook.length} milestones
              </Badge>
            </div>

            <div className="space-y-2">
              {activeEvent.runbook.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-ivory-50 dark:bg-charcoal-850 text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-charcoal-900 dark:text-ivory-100 block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-charcoal-400">{item.responsible}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-sage-700 dark:text-sage-300 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-3"
              onClick={() => navigate('/app/runbook')}
            >
              Open Full Runbook
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

