import { describe, it, expect } from 'vitest';
import { GuestItem } from '../types';

describe('Guests & RSVPs Management', () => {
  const sampleGuests: GuestItem[] = [
    {
      id: 'g-1',
      name: 'Aditya & Priya Rao',
      group: 'Family',
      status: 'confirmed',
      diet: 'Vegetarian',
      plusOnes: 1,
    },
    {
      id: 'g-2',
      name: 'Karan Mehra',
      group: 'Friends',
      status: 'confirmed',
      diet: 'Standard',
      plusOnes: 0,
    },
    {
      id: 'g-3',
      name: 'Zoya Khan',
      group: 'Friends',
      status: 'tentative',
      diet: 'Vegan',
      plusOnes: 1,
    },
    {
      id: 'g-4',
      name: 'Dr. Ramesh Singhania',
      group: 'VIP',
      status: 'confirmed',
      diet: 'Jain',
      plusOnes: 1,
    },
    {
      id: 'g-5',
      name: 'Devansh K',
      group: 'Colleagues',
      status: 'declined',
      diet: 'Standard',
      plusOnes: 0,
    },
  ];

  it('aggregates confirmed headcounts including plus-ones', () => {
    const confirmedGuests = sampleGuests.filter((g) => g.status === 'confirmed');
    const totalAttending = confirmedGuests.reduce((s, g) => s + 1 + (g.plusOnes || 0), 0);

    expect(confirmedGuests.length).toBe(3);
    // Aditya (+1), Karan (+0), Ramesh (+1) = 2 + 1 + 2 = 5 total headcount
    expect(totalAttending).toBe(5);
  });

  it('tallies dietary requirements across all confirmed and tentative guests', () => {
    const activeAttendees = sampleGuests.filter((g) => g.status !== 'declined');
    const dietCounts: Record<string, number> = {};

    activeAttendees.forEach((g) => {
      dietCounts[g.diet] = (dietCounts[g.diet] || 0) + 1 + (g.plusOnes || 0);
    });

    expect(dietCounts['Vegetarian']).toBe(2);
    expect(dietCounts['Standard']).toBe(1);
    expect(dietCounts['Vegan']).toBe(2);
    expect(dietCounts['Jain']).toBe(2);
  });

  it('generates valid CSV structure with escaped fields', () => {
    const headers = ['Name', 'Group', 'Status', 'Diet', 'PlusOnes'];
    const rows = sampleGuests.map((g) => [
      `"${g.name}"`,
      `"${g.group}"`,
      `"${g.status}"`,
      `"${g.diet}"`,
      g.plusOnes,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    expect(csvContent).toContain('Name,Group,Status,Diet,PlusOnes');
    expect(csvContent).toContain('"Aditya & Priya Rao","Family","confirmed","Vegetarian",1');
  });
});

