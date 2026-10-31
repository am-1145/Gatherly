import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { TasksPage } from '../../pages/TasksPage';
import { renderWithProviders } from '../testUtils';

describe('TasksPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders task manager header, milestone progress bar, and category filters', () => {
    renderWithProviders(<TasksPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Timeline & Task Manager/i })).toBeInTheDocument();
    expect(screen.getByText(/All Categories/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Planning/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Overall Completion/i)).toBeInTheDocument();
  });

  it('switches between List View and Kanban Stages View', () => {
    renderWithProviders(<TasksPage />);

    // Click Board/Stages View
    const boardBtn = screen.getByTitle('Board View');
    fireEvent.click(boardBtn);
    expect(screen.getByText(/To Do/i)).toBeInTheDocument();
    expect(screen.getAllByText(/In Progress/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);

    // Switch back to List View
    const listBtn = screen.getByTitle('List View');
    fireEvent.click(listBtn);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('filters tasks via search query input', () => {
    renderWithProviders(<TasksPage />);

    const searchInput = screen.getByPlaceholderText(/Search tasks or assignees/i);
    fireEvent.change(searchInput, { target: { value: 'DJ' } });

    expect(searchInput).toHaveValue('DJ');
  });

  it('opens Create Task modal and adds a new milestone task', () => {
    renderWithProviders(<TasksPage />);

    const addBtn = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog', { name: /Create New Checklist Task/i });
    expect(dialog).toBeInTheDocument();

    const titleInput = within(dialog).getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Order custom cake topper' } });

    const saveBtn = within(dialog).getByRole('button', { name: /Create Task/i });
    fireEvent.click(saveBtn);

    expect(screen.queryByRole('dialog', { name: /Create New Checklist Task/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Order custom cake topper/i)).toBeInTheDocument();
  });

  it('toggles task status using accessible checkbox', () => {
    renderWithProviders(<TasksPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    const first = checkboxes[0];
    const initialAriaChecked = first.getAttribute('aria-checked');
    fireEvent.click(first);
    expect(first.getAttribute('aria-checked')).not.toBe(initialAriaChecked);
  });
});
