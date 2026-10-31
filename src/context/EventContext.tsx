import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  EventModel,
  TaskItem,
  ExpenseItem,
  GuestItem,
  VendorItem,
  IdeaItem,
  RunbookItem,
  ActionProposal,
} from '../types';
import {
  loadStoredEvents,
  saveStoredEvents,
  loadActiveEventId,
  saveActiveEventId,
  resetToDefaultDemo,
} from '../utils/storage';
import { getDaysRemaining } from '../utils/formatters';

export interface EventMetrics {
  totalBudget: number;
  totalAllocated: number;
  totalEstimated: number;
  totalActualPaid: number;
  remainingBudget: number;
  budgetVariance: number;
  isOverBudget: boolean;
  allocationVariance: number;
  isOverAllocated: boolean;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  taskProgressPct: number;
  totalGuestsTarget: number;
  confirmedGuestsCount: number;
  tentativeGuestsCount: number;
  declinedGuestsCount: number;
  pendingGuestsCount: number;
  totalAttendingHeadcount: number;
  totalVendors: number;
  bookedVendors: number;
  shortlistedVendors: number;
  daysRemaining: ReturnType<typeof getDaysRemaining>;
}

interface EventContextType {
  events: EventModel[];
  activeEvent: EventModel;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  createEvent: (newEvent: EventModel) => void;
  updateEvent: (updated: EventModel) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  resetDemoData: () => void;
  // Specific Sub-Entity Mutators
  // Budget
  updateBudgetTotal: (newTotal: number) => void;
  updateCategoryAllocation: (categoryKey: string, allocatedAmount: number) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (expense: ExpenseItem) => void;
  deleteExpense: (id: string) => void;
  // Tasks
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (task: TaskItem) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  // Guests
  addGuest: (guest: Omit<GuestItem, 'id'>) => void;
  updateGuest: (guest: GuestItem) => void;
  deleteGuest: (id: string) => void;
  // Vendors
  addVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (vendor: VendorItem) => void;
  deleteVendor: (id: string) => void;
  // Ideas
  toggleFavoriteIdea: (id: string) => void;
  addCustomIdea: (idea: Omit<IdeaItem, 'id' | 'isFavorite'>) => void;
  convertIdeaToTask: (ideaId: string) => void;
  addIdeaToBudget: (ideaId: string) => void;
  // Runbook
  addRunbookItem: (item: Omit<RunbookItem, 'id'>) => void;
  updateRunbookItem: (item: RunbookItem) => void;
  deleteRunbookItem: (id: string) => void;
  // Copilot Action Proposal
  applyActionProposal: (proposal: ActionProposal) => void;
  // Computed Metrics
  metrics: EventMetrics;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

/**
 * Primary React Context Provider managing multi-event workspace state, persistence, and live calculations.
 *
 * @param props.children - Child React nodes to receive event context values.
 * @returns JSX Context Provider element wrapping the application tree.
 */
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventModel[]>(() => loadStoredEvents());
  const [activeEventId, setActiveEventIdState] = useState<string>(() =>
    loadActiveEventId(events[0]?.id || '')
  );

  // Sync active event ID with storage
  const setActiveEventId = useCallback((id: string) => {
    setActiveEventIdState(id);
    saveActiveEventId(id);
  }, []);

  // Save changes to localStorage whenever events change
  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  // Retrieve current active event safely
  const activeEvent = useMemo(() => {
    const found = events.find((e) => e.id === activeEventId);
    return found || events[0] || (null as unknown as EventModel);
  }, [events, activeEventId]);

  // Helper to update the currently active event
  const mutateActiveEvent = useCallback(
    (updater: (prev: EventModel) => EventModel) => {
      setEvents((prevEvents) =>
        prevEvents.map((ev) => {
          if (ev.id === activeEventId) {
            const updated = updater(ev);
            return { ...updated, updatedAt: new Date().toISOString() };
          }
          return ev;
        })
      );
    },
    [activeEventId]
  );

  // Event Level operations
  const createEvent = useCallback((newEvent: EventModel) => {
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
  }, [setActiveEventId]);

  const updateEvent = useCallback((updated: EventModel) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : e))
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const remaining = prev.filter((e) => e.id !== id);
      if (remaining.length === 0) {
        // Keep at least one demo if all are deleted
        const reset = resetToDefaultDemo();
        setActiveEventId(reset[0].id);
        return reset;
      }
      if (id === activeEventId) {
        setActiveEventId(remaining[0].id);
      }
      return remaining;
    });
  }, [activeEventId, setActiveEventId]);

  const duplicateEvent = useCallback((id: string) => {
    const original = events.find((e) => e.id === id);
    if (!original) return;
    const duplicated: EventModel = {
      ...JSON.parse(JSON.stringify(original)),
      id: `event-${Date.now()}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [duplicated, ...prev]);
    setActiveEventId(duplicated.id);
  }, [events, setActiveEventId]);

  const resetDemoData = useCallback(() => {
    const fresh = resetToDefaultDemo();
    setEvents(fresh);
    setActiveEventId(fresh[0].id);
  }, [setActiveEventId]);

  // --- Budget Mutators ---
  const updateBudgetTotal = useCallback(
    (newTotal: number) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          total: Math.max(0, newTotal),
        },
      }));
    },
    [mutateActiveEvent]
  );

  const updateCategoryAllocation = useCallback(
    (categoryKey: string, allocatedAmount: number) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          categories: prev.budget.categories.map((c) =>
            c.key === categoryKey ? { ...c, allocatedAmount: Math.max(0, allocatedAmount) } : c
          ),
        },
      }));
    },
    [mutateActiveEvent]
  );

  const addExpense = useCallback(
    (expense: Omit<ExpenseItem, 'id'>) => {
      const newExp: ExpenseItem = {
        ...expense,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          expenses: [...prev.budget.expenses, newExp],
        },
      }));
    },
    [mutateActiveEvent]
  );

  const updateExpense = useCallback(
    (expense: ExpenseItem) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          expenses: prev.budget.expenses.map((e) => (e.id === expense.id ? expense : e)),
        },
      }));
    },
    [mutateActiveEvent]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          expenses: prev.budget.expenses.filter((e) => e.id !== id),
        },
      }));
    },
    [mutateActiveEvent]
  );

  // --- Tasks Mutators ---
  const addTask = useCallback(
    (task: Omit<TaskItem, 'id'>) => {
      const newTask: TaskItem = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));
    },
    [mutateActiveEvent]
  );

  const updateTask = useCallback(
    (task: TaskItem) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
    },
    [mutateActiveEvent]
  );

  const deleteTask = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
    },
    [mutateActiveEvent]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.id === id) {
            const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
            return { ...t, status: nextStatus };
          }
          return t;
        }),
      }));
    },
    [mutateActiveEvent]
  );

  // --- Guests Mutators ---
  const addGuest = useCallback(
    (guest: Omit<GuestItem, 'id'>) => {
      const newGuest: GuestItem = {
        ...guest,
        id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        guests: [newGuest, ...prev.guests],
      }));
    },
    [mutateActiveEvent]
  );

  const updateGuest = useCallback(
    (guest: GuestItem) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        guests: prev.guests.map((g) => (g.id === guest.id ? guest : g)),
      }));
    },
    [mutateActiveEvent]
  );

  const deleteGuest = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        guests: prev.guests.filter((g) => g.id !== id),
      }));
    },
    [mutateActiveEvent]
  );

  // --- Vendors Mutators ---
  const addVendor = useCallback(
    (vendor: Omit<VendorItem, 'id'>) => {
      const newVen: VendorItem = {
        ...vendor,
        id: `ven-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        vendors: [newVen, ...prev.vendors],
      }));
    },
    [mutateActiveEvent]
  );

  const updateVendor = useCallback(
    (vendor: VendorItem) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        vendors: prev.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
      }));
    },
    [mutateActiveEvent]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        vendors: prev.vendors.filter((v) => v.id !== id),
      }));
    },
    [mutateActiveEvent]
  );

  // --- Ideas Mutators ---
  const toggleFavoriteIdea = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        ideas: prev.ideas.map((idea) =>
          idea.id === id ? { ...idea, isFavorite: !idea.isFavorite } : idea
        ),
      }));
    },
    [mutateActiveEvent]
  );

  const addCustomIdea = useCallback(
    (idea: Omit<IdeaItem, 'id' | 'isFavorite'>) => {
      const newIdea: IdeaItem = {
        ...idea,
        id: `idea-${Date.now()}`,
        isFavorite: true,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        ideas: [newIdea, ...prev.ideas],
      }));
    },
    [mutateActiveEvent]
  );

  const convertIdeaToTask = useCallback(
    (ideaId: string) => {
      mutateActiveEvent((prev) => {
        const idea = prev.ideas.find((i) => i.id === ideaId);
        if (!idea) return prev;
        const newTask: TaskItem = {
          id: `task-${Date.now()}`,
          title: `Implement: ${idea.title}`,
          category: 'Preparations',
          priority: 'medium',
          status: 'pending',
          dueDate: prev.date,
          notes: idea.description,
        };
        const updatedIdeas = prev.ideas.map((i) =>
          i.id === ideaId ? { ...i, convertedToTaskId: newTask.id } : i
        );
        return {
          ...prev,
          tasks: [newTask, ...prev.tasks],
          ideas: updatedIdeas,
        };
      });
    },
    [mutateActiveEvent]
  );

  const addIdeaToBudget = useCallback(
    (ideaId: string) => {
      mutateActiveEvent((prev) => {
        const idea = prev.ideas.find((i) => i.id === ideaId);
        if (!idea || !idea.estimatedCost) return prev;

        const newExp: ExpenseItem = {
          id: `exp-${Date.now()}`,
          categoryKey: 'Miscellaneous',
          name: idea.title,
          estimatedAmount: idea.estimatedCost,
          actualAmount: 0,
          isPaid: false,
          notes: `Added from Idea: ${idea.description}`,
        };

        const updatedIdeas = prev.ideas.map((i) =>
          i.id === ideaId ? { ...i, addedToBudget: true } : i
        );

        return {
          ...prev,
          budget: {
            ...prev.budget,
            expenses: [...prev.budget.expenses, newExp],
          },
          ideas: updatedIdeas,
        };
      });
    },
    [mutateActiveEvent]
  );

  // --- Runbook Mutators ---
  const addRunbookItem = useCallback(
    (item: Omit<RunbookItem, 'id'>) => {
      const newItem: RunbookItem = {
        ...item,
        id: `rb-${Date.now()}`,
      };
      mutateActiveEvent((prev) => ({
        ...prev,
        runbook: [...prev.runbook, newItem],
      }));
    },
    [mutateActiveEvent]
  );

  const updateRunbookItem = useCallback(
    (item: RunbookItem) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        runbook: prev.runbook.map((rb) => (rb.id === item.id ? item : rb)),
      }));
    },
    [mutateActiveEvent]
  );

  const deleteRunbookItem = useCallback(
    (id: string) => {
      mutateActiveEvent((prev) => ({
        ...prev,
        runbook: prev.runbook.filter((rb) => rb.id !== id),
      }));
    },
    [mutateActiveEvent]
  );

  // --- Copilot Action Proposal Applier ---
  const applyActionProposal = useCallback(
    (proposal: ActionProposal) => {
      const p = proposal.payload;
      if (proposal.type === 'add_task') {
        addTask(p as unknown as Omit<TaskItem, 'id'>);
      } else if (proposal.type === 'add_expense') {
        addExpense(p as unknown as Omit<ExpenseItem, 'id'>);
      } else if (proposal.type === 'update_budget') {
        updateBudgetTotal(Number(p.total) || 0);
      } else if (proposal.type === 'save_idea') {
        addCustomIdea(p as unknown as Omit<IdeaItem, 'id' | 'isFavorite'>);
      } else if (proposal.type === 'add_runbook_item') {
        addRunbookItem(p as unknown as Omit<RunbookItem, 'id'>);
      } else if (proposal.type === 'reallocate_category') {
        updateCategoryAllocation(String(p.categoryKey || ''), Number(p.amount) || 0);
      }
    },
    [addTask, addExpense, updateBudgetTotal, addCustomIdea, addRunbookItem, updateCategoryAllocation]
  );

  // --- Derived Calculations ---
  const metrics = useMemo<EventMetrics>(() => {
    if (!activeEvent) {
      return {
        totalBudget: 0,
        totalAllocated: 0,
        totalEstimated: 0,
        totalActualPaid: 0,
        remainingBudget: 0,
        budgetVariance: 0,
        isOverBudget: false,
        allocationVariance: 0,
        isOverAllocated: false,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        taskProgressPct: 0,
        totalGuestsTarget: 0,
        confirmedGuestsCount: 0,
        tentativeGuestsCount: 0,
        declinedGuestsCount: 0,
        pendingGuestsCount: 0,
        totalAttendingHeadcount: 0,
        totalVendors: 0,
        bookedVendors: 0,
        shortlistedVendors: 0,
        daysRemaining: { days: 0, label: '', isPast: false, isToday: false },
      };
    }

    const { budget, tasks = [], guests = [], vendors = [], date, guestCount = 0 } = activeEvent;
    const totalBudget = budget?.total || 0;

    const totalAllocated = (budget?.categories || []).reduce(
      (acc, c) => acc + (c.allocatedAmount || 0),
      0
    );

    const totalEstimated = (budget?.expenses || []).reduce(
      (acc, e) => acc + (e.estimatedAmount || 0),
      0
    );

    const totalActualPaid = (budget?.expenses || []).reduce(
      (acc, e) => acc + (e.isPaid ? e.actualAmount || e.estimatedAmount || 0 : 0),
      0
    );

    const remainingBudget = totalBudget - totalActualPaid;
    const budgetVariance = totalBudget - totalEstimated;
    const isOverBudget = totalEstimated > totalBudget || totalActualPaid > totalBudget;
    const allocationVariance = totalBudget - totalAllocated;
    const isOverAllocated = totalAllocated > totalBudget;

    // Tasks metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
    ).length;
    const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Guests metrics
    const confirmedGuestsCount = guests.filter((g) => g.status === 'confirmed').length;
    const tentativeGuestsCount = guests.filter((g) => g.status === 'tentative').length;
    const declinedGuestsCount = guests.filter((g) => g.status === 'declined').length;
    const pendingGuestsCount = guests.filter((g) => g.status === 'pending').length;

    const totalAttendingHeadcount = guests
      .filter((g) => g.status === 'confirmed')
      .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

    // Vendors metrics
    const totalVendors = vendors.length;
    const bookedVendors = vendors.filter((v) => v.status === 'booked').length;
    const shortlistedVendors = vendors.filter((v) => v.status === 'shortlisted').length;

    // Date
    const daysRemaining = getDaysRemaining(date);

    return {
      totalBudget,
      totalAllocated,
      totalEstimated,
      totalActualPaid,
      remainingBudget,
      budgetVariance,
      isOverBudget,
      allocationVariance,
      isOverAllocated,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      taskProgressPct,
      totalGuestsTarget: guestCount,
      confirmedGuestsCount,
      tentativeGuestsCount,
      declinedGuestsCount,
      pendingGuestsCount,
      totalAttendingHeadcount,
      totalVendors,
      bookedVendors,
      shortlistedVendors,
      daysRemaining,
    };
  }, [activeEvent]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        resetDemoData,
        updateBudgetTotal,
        updateCategoryAllocation,
        addExpense,
        updateExpense,
        deleteExpense,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addGuest,
        updateGuest,
        deleteGuest,
        addVendor,
        updateVendor,
        deleteVendor,
        toggleFavoriteIdea,
        addCustomIdea,
        convertIdeaToTask,
        addIdeaToBudget,
        addRunbookItem,
        updateRunbookItem,
        deleteRunbookItem,
        applyActionProposal,
        metrics,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

/**
 * React hook to consume the current active Event workspace, mutators, and computed real-time metrics.
 *
 * @returns EventContextType object providing activeEvent, event collections, mutator methods, and financial metrics.
 * @throws Error when invoked outside an `<EventProvider>` component hierarchy.
 */
export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}

