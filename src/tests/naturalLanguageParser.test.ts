import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageEvent, generateEventFromDraft } from '../utils/naturalLanguageParser';

describe('Natural Language Event Parser', () => {
  it('correctly extracts city when provided in prompt', () => {
    const promptGoa = 'Planning a beach wedding in Goa for 120 guests with 5 lakh budget';
    const draftGoa = parseNaturalLanguageEvent(promptGoa);
    expect(draftGoa.city).toBe('Goa');
    expect(draftGoa.occasion).toBe('wedding');
    expect(draftGoa.guestCount).toBe(120);

    const promptParis = 'Organizing a birthday dinner in Paris for 30 people with €5,000 budget';
    const draftParis = parseNaturalLanguageEvent(promptParis);
    expect(draftParis.city).toBe('Paris');
    expect(draftParis.currency).toBe('EUR');
    expect(draftParis.guestCount).toBe(30);

    const promptTokyo = 'Tech company leadership conference in Tokyo for 100 pax with $20,000';
    const draftTokyo = parseNaturalLanguageEvent(promptTokyo);
    expect(draftTokyo.city).toBe('Tokyo');
    expect(draftTokyo.currency).toBe('USD');
    expect(draftTokyo.occasion).toBe('corporate');
  });

  it('NEVER defaults location to Bangalore when no location is mentioned', () => {
    const promptNoLocation = 'Organize a 30th birthday party for 50 people with ₹25,000 budget, classy theme';
    const draft = parseNaturalLanguageEvent(promptNoLocation);

    expect(draft.city).toBe('Location TBD');
    expect(draft.city).not.toBe('Bengaluru');
    expect(draft.assumptions).toContain('Location was not specified in prompt; marked as Location TBD.');
    expect(draft.title).toBe('My Birthday Bash');
  });

  it('parses Indian Rupee abbreviations and lakhs accurately', () => {
    const promptLakh = 'Royal wedding in Udaipur for 250 guests with 15 lakh budget';
    const draft = parseNaturalLanguageEvent(promptLakh);

    expect(draft.budgetTotal).toBe(1500000);
    expect(draft.currency).toBe('INR');
    expect(draft.city).toBe('Udaipur');
    expect(draft.occasion).toBe('wedding');
  });

  it('parses thousand (k) abbreviations correctly', () => {
    const promptK = 'Birthday party in Mumbai for 60 guests with 40k budget';
    const draft = parseNaturalLanguageEvent(promptK);

    expect(draft.budgetTotal).toBe(40000);
    expect(draft.city).toBe('Mumbai');
  });

  it('generates proportional budget categories tailored to occasion', () => {
    const draftWedding = parseNaturalLanguageEvent('Wedding in Jaipur for 200 guests with 10 lakh budget');
    const event = generateEventFromDraft(draftWedding);

    const venue = event.budget.categories.find((c) => c.key === 'Venue');
    const catering = event.budget.categories.find((c) => c.key === 'Catering');

    expect(venue?.allocatedAmount).toBe(280000); // 28% for wedding
    expect(catering?.allocatedAmount).toBe(320000); // 32% for wedding
    expect(event.tasks.length).toBeGreaterThanOrEqual(7);
    expect(event.vendors.length).toBeGreaterThanOrEqual(3);
    expect(event.runbook.length).toBeGreaterThanOrEqual(5);
  });
});

