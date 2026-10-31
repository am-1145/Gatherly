import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { BudgetPage } from '../../pages/BudgetPage';
import { renderWithProviders } from '../testUtils';

describe('BudgetPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders overall budget summary metrics (Total, Allocated, Estimated, Actual)', () => {
    renderWithProviders(<BudgetPage />);

    expect(screen.getByText(/Budget Planner & Expenses/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Total Budget/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Allocated Sum/i)).toBeInTheDocument();
  });

  it('renders budget category breakdown cards and comparison table', () => {
    renderWithProviders(<BudgetPage />);

    expect(screen.getAllByText(/Venue/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Catering/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Category Allocation Controls/i)).toBeInTheDocument();
  });

  it('filters expenses by category button', () => {
    renderWithProviders(<BudgetPage />);

    const cateringFilterBtn = screen.getByRole('button', { name: /^Catering/i });
    fireEvent.click(cateringFilterBtn);

    expect(cateringFilterBtn).toBeInTheDocument();
  });

  it('opens Add Expense modal and allows creating a new expense', () => {
    renderWithProviders(<BudgetPage />);

    const addExpenseBtn = screen.getByRole('button', { name: /Record Expense/i });
    fireEvent.click(addExpenseBtn);

    const dialog = screen.getByRole('dialog', { name: /Record New Expense or Quote/i });
    expect(dialog).toBeInTheDocument();

    const descInput = within(dialog).getByLabelText(/Expense Description/i);
    fireEvent.change(descInput, { target: { value: 'Acoustic Band Advance' } });

    const amountInput = within(dialog).getByLabelText(/Estimated Amount/i);
    fireEvent.change(amountInput, { target: { value: '8000' } });

    const submitBtn = within(dialog).getByRole('button', { name: /Save Expense/i });
    fireEvent.click(submitBtn);

    expect(screen.queryByRole('dialog', { name: /Record New Expense or Quote/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Acoustic Band Advance/i)).toBeInTheDocument();
  });

  it('opens and updates Total Budget modal', () => {
    renderWithProviders(<BudgetPage />);

    const editBtn = screen.getByRole('button', { name: /Edit Total Budget/i });
    fireEvent.click(editBtn);

    const dialog = screen.getByRole('dialog', { name: /Adjust Total Event Budget/i });
    expect(dialog).toBeInTheDocument();

    const budgetInput = within(dialog).getByLabelText(/Budget Ceiling/i);
    fireEvent.change(budgetInput, { target: { value: '55000' } });

    const saveBtn = within(dialog).getByRole('button', { name: /Save Budget/i });
    fireEvent.click(saveBtn);

    expect(screen.queryByRole('dialog', { name: /Adjust Total Event Budget/i })).not.toBeInTheDocument();
  });
});
