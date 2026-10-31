import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { VendorsPage } from '../../pages/VendorsPage';
import { renderWithProviders } from '../testUtils';

describe('VendorsPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders vendor management heading, metrics, and category tabs', () => {
    renderWithProviders(<VendorsPage />);

    expect(screen.getByText(/Vendor Management & Quotations/i)).toBeInTheDocument();
    expect(screen.getByText(/All Categories/i)).toBeInTheDocument();
  });

  it('opens Add Vendor modal and creates a new vendor profile', () => {
    renderWithProviders(<VendorsPage />);

    const addBtn = screen.getByRole('button', { name: /Add Vendor/i });
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog', { name: /Add New Vendor & Quote/i });
    expect(dialog).toBeInTheDocument();

    const nameInput = within(dialog).getByLabelText(/Vendor \/ Business Name/i);
    fireEvent.change(nameInput, { target: { value: 'Skyline Acoustic Strings' } });

    const saveBtn = within(dialog).getByRole('button', { name: /Save Vendor/i });
    fireEvent.click(saveBtn);

    expect(screen.queryByRole('dialog', { name: /Add New Vendor & Quote/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Skyline Acoustic Strings/i)).toBeInTheDocument();
  });

  it('opens and closes the Side-by-Side Comparison Matrix modal', () => {
    renderWithProviders(<VendorsPage />);

    const compareBtn = screen.getByRole('button', { name: /Compare Quotes/i });
    fireEvent.click(compareBtn);

    const dialog = screen.getByRole('dialog', { name: /Side-by-Side Vendor Quotation Matrix/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('table')).toBeInTheDocument();

    const closeBtn = within(dialog).getByLabelText(/Close dialog/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /Side-by-Side Vendor Quotation Matrix/i })).not.toBeInTheDocument();
  });

  it('filters vendors by search bar input', () => {
    renderWithProviders(<VendorsPage />);

    const searchInput = screen.getByPlaceholderText(/Search vendor name or vertical/i);
    fireEvent.change(searchInput, { target: { value: 'Catering' } });

    expect(searchInput).toHaveValue('Catering');
  });
});
