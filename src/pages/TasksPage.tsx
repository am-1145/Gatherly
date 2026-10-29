import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Kanban,
  List,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { TaskItem, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { formatDate } from '../utils/formatters';

const TASK_CATEGORIES: TaskCategory[] = [
  'Planning',
  'Bookings',
  'Invitations',
  'Preparations',
  'Event Day',
  'Follow-up',
];

export const TasksPage: React.FC = () => {
  const { activeEvent, metrics, addTask, updateTask, deleteTask, toggleTaskStatus } =
    useEvent();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Planning');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('pending');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  if (!activeEvent) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return activeEvent.tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !task.title.toLowerCase().includes(q) &&
          !(task.assignee && task.assignee.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && task.status !== selectedStatus) return false;
      if (selectedPriority !== 'All' && task.priority !== selectedPriority) return false;
      return true;
    });
  }, [activeEvent.tasks, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskCategory('Planning');
    setTaskPriority('medium');
    setTaskStatus('pending');
    setTaskDueDate(activeEvent.date);
    setTaskAssignee('You');
    setTaskNotes('');
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate);
    setTaskAssignee(task.assignee || '');
    setTaskNotes(task.notes || '');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate,
        assignee: taskAssignee.trim() || undefined,
        notes: taskNotes.trim() || undefined,
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate,
        assignee: taskAssignee.trim() || undefined,
        notes: taskNotes.trim() || undefined,
      });
    }

    setIsTaskModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Timeline & Task Manager
            </h1>
            <Badge variant="sage" size="sm">
              {metrics.completedTasks}/{metrics.totalTasks} Done
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Track milestones, bookings, and preparations leading up to {formatDate(activeEvent.date)}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center bg-ivory-100 dark:bg-charcoal-800 p-0.5 rounded-lg border border-ivory-200 dark:border-charcoal-700">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-ivory-50 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-ivory-50 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
              title="Board View"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Stages</span>
            </button>
          </div>

          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreate}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress & Stat Summary */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium text-charcoal-700 dark:text-charcoal-300">
              <span>Overall Completion</span>
              <span className="font-bold">{metrics.taskProgressPct}%</span>
            </div>
            <ProgressBar value={metrics.taskProgressPct} color="sage" size="md" />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-center px-3 border-r border-ivory-200 dark:border-charcoal-800">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Pending
              </span>
              <span className="text-base font-bold text-charcoal-900 dark:text-ivory-50">
                {metrics.pendingTasks}
              </span>
            </div>
            <div className="text-center px-3 border-r border-ivory-200 dark:border-charcoal-800">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Completed
              </span>
              <span className="text-base font-bold text-sage-600">
                {metrics.completedTasks}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                Overdue
              </span>
              <span
                className={`text-base font-bold ${
                  metrics.overdueTasks > 0 ? 'text-terracotta-600' : 'text-charcoal-400'
                }`}
              >
                {metrics.overdueTasks}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or assignees..."
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
            {TASK_CATEGORIES.map((c) => (
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 py-2 px-2.5 text-charcoal-700 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
          >
            <option value="All">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100/70 dark:bg-charcoal-800/60 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-ivory-200 dark:border-charcoal-700">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-800 text-charcoal-800 dark:text-charcoal-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-charcoal-400">
                      No matching tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isOverdue =
                      task.status !== 'completed' && task.dueDate && task.dueDate < todayStr;

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-ivory-50/80 dark:hover:bg-charcoal-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-4 h-4 rounded border mx-auto flex items-center justify-center transition-colors ${
                              task.status === 'completed'
                                ? 'bg-sage-600 border-sage-600 text-white'
                                : 'border-charcoal-300 dark:border-charcoal-600 hover:border-sage-500'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <p
                            className={`font-semibold ${
                              task.status === 'completed'
                                ? 'line-through text-charcoal-400'
                                : 'text-charcoal-900 dark:text-ivory-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="text-[11px] text-charcoal-400 mt-0.5 line-clamp-1">
                              {task.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="neutral" size="sm">
                            {task.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`flex items-center gap-1.5 ${
                              isOverdue
                                ? 'text-terracotta-600 font-bold'
                                : 'text-charcoal-600 dark:text-charcoal-400'
                            }`}
                          >
                            {isOverdue && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span>{formatDate(task.dueDate)}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-charcoal-600 dark:text-charcoal-300">
                          {task.assignee || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              task.priority === 'urgent'
                                ? 'terracotta'
                                : task.priority === 'high'
                                ? 'amber'
                                : task.priority === 'medium'
                                ? 'sage'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-ivory-100 dark:hover:bg-charcoal-800"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW MODE 2: KANBAN STAGES BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(
            [
              { status: 'pending', title: 'To Do', color: 'border-charcoal-300' },
              { status: 'in_progress', title: 'In Progress', color: 'border-amber-400' },
              { status: 'completed', title: 'Completed', color: 'border-sage-500' },
            ] as const
          ).map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="rounded-2xl bg-ivory-100/60 dark:bg-charcoal-900/60 border border-ivory-200 dark:border-charcoal-800 p-3.5 flex flex-col min-h-[420px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-ivory-200 dark:border-charcoal-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 dark:text-ivory-100">
                      {col.title}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {colTasks.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 text-[11px] text-charcoal-400 italic">
                      No tasks in this stage.
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-ivory-200 dark:border-charcoal-700 shadow-subtle hover:border-charcoal-400 transition-all text-left group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <Badge variant="neutral" size="sm">
                            {task.category}
                          </Badge>
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

                        <p
                          className={`text-xs font-semibold leading-snug mb-2 ${
                            task.status === 'completed'
                              ? 'line-through text-charcoal-400'
                              : 'text-charcoal-900 dark:text-ivory-100'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-charcoal-500 pt-2 border-t border-ivory-100 dark:border-charcoal-700">
                          <span>{formatDate(task.dueDate)}</span>
                          <span className="font-medium text-charcoal-700 dark:text-charcoal-300">
                            {task.assignee || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-dashed border-ivory-100 dark:border-charcoal-700">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="text-[10px] text-sage-600 hover:text-sage-800 font-semibold"
                          >
                            {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 ml-auto"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Checklist Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-3.5 py-2">
          <Input
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Schedule final soundcheck with Indiranagar venue manager"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              required
            />
            <Input
              label="Assignee"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              placeholder="e.g. Aarav, Priya, Decor Lead"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Status
            </label>
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
              className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Textarea
            label="Notes & Context"
            rows={2}
            value={taskNotes}
            onChange={(e) => setTaskNotes(e.target.value)}
            placeholder="Contract terms, phone numbers, or key items to pack"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

