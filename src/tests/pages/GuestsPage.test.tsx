import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { GuestsPage } from '../../pages/GuestsPage';
import { renderWithProviders } from '../testUtils';

describe('GuestsPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders guest headcount stats and dietary requirement breakdown', () => {
    renderWithProviders(<GuestsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Guests & RSVPs/i })).toBeInTheDocument();
    expect(screen.getByText(/Attending Headcount/i)).toBeInTheDocument();
    expect(screen.getByText(/Dietary Breakdown/i)).toBeInTheDocument();
  });

  it('filters guests by search input', () => {
    renderWithProviders(<GuestsPage />);

    const searchInput = screen.getByPlaceholderText(/Search by name or phone/i);
    fireEvent.change(searchInput, { target: { value: 'Rohan' } });

    expect(searchInput).toHaveValue('Rohan');
  });

  it('opens and closes the Add Guest modal with form inputs', () => {
    renderWithProviders(<GuestsPage />);

    const addGuestBtn = screen.getByRole('button', { name: /Add Guest/i });
    fireEvent.click(addGuestBtn);

    const dialog = screen.getByRole('dialog', { name: /Add Guest to RSVP Registry/i });
    expect(dialog).toBeInTheDocument();

    const nameInput = within(dialog).getByLabelText(/Guest \/ Household Name/i);
    fireEvent.change(nameInput, { target: { value: 'Priya Sharma' } });

    const submitBtn = within(dialog).getByRole('button', { name: /Add Guest/i });
    fireEvent.click(submitBtn);

    expect(screen.queryByRole('dialog', { name: /Add Guest to RSVP Registry/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
  });

  it('opens sample invitation generator modal and handles copy action', () => {
    renderWithProviders(<GuestsPage />);

    const inviteBtn = screen.getByRole('button', { name: /Invite Template/i });
    fireEvent.click(inviteBtn);

    const dialog = screen.getByRole('dialog', { name: /WhatsApp & Digital RSVP Message Generator/i });
    expect(dialog).toBeInTheDocument();

    const copyBtn = within(dialog).getByRole('button', { name: /Copy Invitation Text/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it('triggers CSV download without error', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    renderWithProviders(<GuestsPage />);

    const exportBtn = screen.getByRole('button', { name: /Export CSV/i });
    fireEvent.click(exportBtn);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    createElementSpy.mockRestore();
  });
});
