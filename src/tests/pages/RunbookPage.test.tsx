import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { RunbookPage } from '../../pages/RunbookPage';
import { renderWithProviders } from '../testUtils';

describe('RunbookPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders heading, date badge, and filter status buttons', () => {
    renderWithProviders(<RunbookPage />);

    expect(screen.getByText(/Event-Day Runbook/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^pending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^completed/i })).toBeInTheDocument();
  });

  it('toggles live execution mode button', () => {
    renderWithProviders(<RunbookPage />);

    const liveBtn = screen.getByRole('button', { name: /Live Execution Mode/i });
    fireEvent.click(liveBtn);

    expect(screen.getByRole('button', { name: /Exit Live Mode/i })).toBeInTheDocument();
  });

  it('opens modal and adds a new runbook milestone', () => {
    renderWithProviders(<RunbookPage />);

    const addBtn = screen.getByRole('button', { name: /Add Milestone/i });
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog', { name: /Add Runbook Milestone/i });
    expect(dialog).toBeInTheDocument();

    const titleInput = within(dialog).getByLabelText(/Milestone Activity Title/i);
    fireEvent.change(titleInput, { target: { value: 'Guest of Honor Speech' } });

    const saveBtn = within(dialog).getByRole('button', { name: /Add Milestone/i });
    fireEvent.click(saveBtn);

    expect(screen.queryByRole('dialog', { name: /Add Runbook Milestone/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Guest of Honor Speech/i)).toBeInTheDocument();
  });
});
