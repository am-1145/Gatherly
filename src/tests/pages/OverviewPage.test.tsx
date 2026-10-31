import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OverviewPage } from '../../pages/OverviewPage';
import { renderWithProviders } from '../testUtils';

describe('OverviewPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders active event title, occasion, city, and countdown', async () => {
    renderWithProviders(<OverviewPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Aarav/i })).toBeInTheDocument();
    expect(screen.getByText(/Bengaluru/i)).toBeInTheDocument();
    expect(screen.getByText(/The Bohemian Sky Deck/i)).toBeInTheDocument();
    expect(screen.getAllByText(/days to go/i).length).toBeGreaterThan(0);
  });

  it('displays budget overview and spending metrics', async () => {
    renderWithProviders(<OverviewPage />);

    expect(screen.getAllByText(/Total Budget/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Guest RSVPs/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasks Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendors Booked/i)).toBeInTheDocument();
  });

  it('renders AI priority recommendations with action prompts', async () => {
    renderWithProviders(<OverviewPage />);

    expect(screen.getByText(/AI Priority Recommendations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Copilot/i })).toBeInTheDocument();
  });

  it('allows toggling tasks directly from the overview checklist', async () => {
    renderWithProviders(<OverviewPage />);

    const taskCheckboxes = screen.getAllByRole('checkbox');
    expect(taskCheckboxes.length).toBeGreaterThan(0);

    const firstCheckbox = taskCheckboxes[0];
    const initialChecked = firstCheckbox.getAttribute('aria-checked') === 'true';

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.getAttribute('aria-checked')).toBe(String(!initialChecked));
  });
});
