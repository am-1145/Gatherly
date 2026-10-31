import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventsPage } from '../../pages/EventsPage';
import { renderWithProviders } from '../testUtils';

describe('EventsPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders portfolio header, workspace count, and Create New Event button', () => {
    renderWithProviders(<EventsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /My Events Portfolio/i })).toBeInTheDocument();
    expect(screen.getByText(/Workspaces/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Event/i })).toBeInTheDocument();
  });

  it('renders existing demo events with details and active status', () => {
    renderWithProviders(<EventsPage />);

    expect(screen.getByText(/Aarav.*30th Rooftop Soirée/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Workspace/i)).toBeInTheDocument();
  });

  it('allows duplicating an event into a new workspace', () => {
    renderWithProviders(<EventsPage />);

    const duplicateButtons = screen.getAllByRole('button', { name: /Duplicate/i });
    expect(duplicateButtons.length).toBeGreaterThan(0);

    fireEvent.click(duplicateButtons[0]);

    expect(screen.getByText(/\(Copy\)/i)).toBeInTheDocument();
  });

  it('opens confirmation modal before deleting an event', () => {
    renderWithProviders(<EventsPage />);

    // First duplicate so we have more than 1 event to safely delete
    const duplicateButtons = screen.getAllByRole('button', { name: /Duplicate/i });
    fireEvent.click(duplicateButtons[0]);

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    expect(screen.getByText(/Delete Event Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this event\?/i)).toBeInTheDocument();
  });
});
