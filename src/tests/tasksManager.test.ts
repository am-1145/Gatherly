import { describe, it, expect } from 'vitest';
import { TaskItem } from '../types';

describe('Tasks & Timeline Management', () => {
  const sampleTasks: TaskItem[] = [
    {
      id: 't-1',
      title: 'Sign venue contract',
      category: 'Bookings',
      priority: 'urgent',
      status: 'completed',
      dueDate: '2026-10-15',
    },
    {
      id: 't-2',
      title: 'Send digital RSVPs',
      category: 'Invitations',
      priority: 'high',
      status: 'pending',
      dueDate: '2026-10-20', // past relative to 2026-10-29
    },
    {
      id: 't-3',
      title: 'Final menu tasting',
      category: 'Preparations',
      priority: 'medium',
      status: 'in_progress',
      dueDate: '2026-11-15', // future
    },
  ];

  it('calculates task completion percentage accurately', () => {
    const total = sampleTasks.length;
    const completed = sampleTasks.filter((t) => t.status === 'completed').length;
    const pct = Math.round((completed / total) * 100);

    expect(completed).toBe(1);
    expect(pct).toBe(33);
  });

  it('correctly flags overdue tasks based on reference date', () => {
    const referenceDate = '2026-10-29';
    const overdue = sampleTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < referenceDate
    );

    expect(overdue.length).toBe(1);
    expect(overdue[0].id).toBe('t-2');
  });

  it('filters tasks by category and priority', () => {
    const urgentTasks = sampleTasks.filter((t) => t.priority === 'urgent');
    expect(urgentTasks.length).toBe(1);
    expect(urgentTasks[0].title).toBe('Sign venue contract');

    const invitationTasks = sampleTasks.filter((t) => t.category === 'Invitations');
    expect(invitationTasks.length).toBe(1);
    expect(invitationTasks[0].title).toBe('Send digital RSVPs');
  });
});

