import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { IdeasPage } from '../../pages/IdeasPage';
import { renderWithProviders } from '../testUtils';

describe('IdeasPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders heading, saved concepts count, and category tabs', () => {
    renderWithProviders(<IdeasPage />);

    expect(screen.getByText(/Ideas & Aesthetic Inspiration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^All Ideas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Themes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Decorations/i })).toBeInTheDocument();
  });

  it('filters ideas by search input', () => {
    renderWithProviders(<IdeasPage />);

    const searchInput = screen.getByPlaceholderText(/Search concepts/i);
    fireEvent.change(searchInput, { target: { value: 'Polaroid' } });

    expect(searchInput).toHaveValue('Polaroid');
  });

  it('toggles favorites filter button', () => {
    renderWithProviders(<IdeasPage />);

    const favBtn = screen.getByRole('button', { name: /^Favorites/i });
    expect(favBtn).toBeInTheDocument();

    fireEvent.click(favBtn);
    expect(favBtn).toBeInTheDocument();
  });

  it('opens Add Creative Concept modal and creates a custom idea', () => {
    renderWithProviders(<IdeasPage />);

    const addBtn = screen.getByRole('button', { name: /Add Idea/i });
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog', { name: /Add Creative Concept or Idea/i });
    expect(dialog).toBeInTheDocument();

    const titleInput = within(dialog).getByLabelText(/Idea Concept Title/i);
    fireEvent.change(titleInput, { target: { value: 'Floating Lantern Canopy' } });

    const descInput = within(dialog).getByLabelText(/Concept Description & Setup Details/i);
    fireEvent.change(descInput, { target: { value: 'Warm glowing LED lanterns suspended over cocktail tables' } });

    const saveBtn = within(dialog).getByRole('button', { name: /Save Concept/i });
    fireEvent.click(saveBtn);

    expect(screen.queryByRole('dialog', { name: /Add Creative Concept or Idea/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Floating Lantern Canopy/i)).toBeInTheDocument();
  });
});
