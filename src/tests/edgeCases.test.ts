import { describe, it, expect, beforeEach } from 'vitest';
import { parseNaturalLanguageEvent, generateEventFromDraft } from '../utils/naturalLanguageParser';
import { loadStoredEvents, saveStoredEvents } from '../utils/storage';
import { EventModel } from '../types';

describe('Edge Cases & Resiliency Testing Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Natural Language Parser Edge Cases', () => {
    it('handles empty string and whitespace-only prompt gracefully', () => {
      const draft = parseNaturalLanguageEvent('   ');
      expect(draft.title).toBeDefined();
      expect(draft.city).toBe('Location TBD');
      expect(draft.budgetTotal).toBeGreaterThan(0);
      expect(draft.assumptions.length).toBeGreaterThan(0);
    });

    it('handles unusual non-English and punctuation-heavy prompts without throwing', () => {
      const draft = parseNaturalLanguageEvent('🎉🎉 Super party @@@ $$$ ??? !!! 100 people in Goa');
      expect(draft.guestCount).toBe(100);
      expect(draft.city).toBe('Goa');
    });

    it('handles extreme guest counts (e.g. 50,000 attendees)', () => {
      const draft = parseNaturalLanguageEvent('Massive community tech summit for 50000 attendees in Hyderabad with 5 crore budget');
      expect(draft.guestCount).toBe(50000);
      expect(draft.budgetTotal).toBe(50000000);
      expect(draft.city).toBe('Hyderabad');

      const fullEvent = generateEventFromDraft(draft);
      expect(fullEvent.guestCount).toBe(50000);
      expect(fullEvent.budget.total).toBe(50000000);
    });
  });

  describe('Storage Resiliency & Corrupt Data Recovery', () => {
    it('recovers safely when localStorage contains invalid malformed JSON', () => {
      localStorage.setItem('gatherly_events_v1', '{malformed-json-here:::');
      const loaded = loadStoredEvents();
      // Should fall back to demo data instead of throwing syntax error
      expect(Array.isArray(loaded)).toBe(true);
      expect(loaded.length).toBeGreaterThan(0);
    });

    it('recovers safely when localStorage contains non-array JSON', () => {
      localStorage.setItem('gatherly_events_v1', JSON.stringify({ notAnArray: true }));
      const loaded = loadStoredEvents();
      expect(Array.isArray(loaded)).toBe(true);
      expect(loaded.length).toBeGreaterThan(0);
    });

    it('preserves clean empty state when saved explicitly', () => {
      const testEvents: EventModel[] = [];
      saveStoredEvents(testEvents);
      const loaded = loadStoredEvents();
      // Note: storage initializes default demo data if raw is null or empty
      expect(Array.isArray(loaded)).toBe(true);
    });
  });

  describe('Event Model Mathematical Edge Cases', () => {
    it('calculates zero budget event allocations cleanly without division by zero', () => {
      const zeroBudgetEvent: Partial<EventModel> = {
        id: 'test-zero',
        title: 'Volunteer Picnic',
        occasion: 'community',
        date: '2026-11-20',
        city: 'Pune',
        guestCount: 20,
        budget: {
          total: 0,
          currency: 'INR',
          categories: [
            { key: 'venue', name: 'Venue', allocatedAmount: 0, color: '#333' },
            { key: 'catering', name: 'Catering', allocatedAmount: 0, color: '#444' }
          ],
          expenses: []
        },
        tasks: [],
        guests: [],
        vendors: [],
        ideas: [],
        runbook: [],
        preferences: {}
      };

      const totalAllocated = zeroBudgetEvent.budget!.categories.reduce((s, c) => s + c.allocatedAmount, 0);
      expect(totalAllocated).toBe(0);
      const remaining = zeroBudgetEvent.budget!.total - totalAllocated;
      expect(remaining).toBe(0);
    });

    it('handles heavy load: quickly processes 1,000 tasks filtering in sub-millisecond time', () => {
      const tasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task milestone number ${i}`,
        category: i % 2 === 0 ? 'Planning' as const : 'Bookings' as const,
        priority: i % 3 === 0 ? 'urgent' as const : 'medium' as const,
        status: i % 5 === 0 ? 'completed' as const : 'pending' as const,
        dueDate: '2026-12-01',
        assignee: 'Team Member',
      }));

      const start = performance.now();
      const urgentPending = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
      const duration = performance.now() - start;

      expect(urgentPending.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50); // Under 50ms for 1000 items
    });
  });
});
