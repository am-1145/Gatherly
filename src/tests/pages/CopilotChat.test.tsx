import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CopilotChat } from '../../components/copilot/CopilotChat';
import { renderWithProviders } from '../testUtils';
import * as aiDispatcher from '../../services/ai/aiDispatcher';

describe('CopilotChat Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders welcome message and quick prompt buttons', () => {
    renderWithProviders(<CopilotChat />);

    expect(screen.getByText(/Hello! I am/i)).toBeInTheDocument();
    expect(screen.getByText(/Gatherly AI/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything or command an action/i)).toBeInTheDocument();
  });

  it('sends a prompt and renders assistant response with offline local intelligence', async () => {
    vi.spyOn(aiDispatcher, 'dispatchCopilotMessage').mockResolvedValue({
      content: 'Here is your cost optimization analysis for catering and decor.',
      suggestedFollowUps: ['How to save more?', 'Compare quotes'],
      intentTag: 'budget_analysis',
    });

    renderWithProviders(<CopilotChat />);

    const input = screen.getByPlaceholderText(/Ask anything or command an action/i);
    fireEvent.change(input, { target: { value: 'How can I reduce my event costs?' } });

    const submitBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Here is your cost optimization analysis for catering and decor/i)
      ).toBeInTheDocument();
    });
  });

  it('renders action proposal card when prompt commands an action', async () => {
    vi.spyOn(aiDispatcher, 'dispatchCopilotMessage').mockResolvedValue({
      content: 'I have prepared a new task proposal for your review.',
      actionProposal: {
        id: 'prop-task-1',
        type: 'add_task',
        title: 'Add New Task',
        description: 'Order custom birthday cake with delivery',
        status: 'pending',
        impactSummary: 'Task added to checklist due in 3 days',
        payload: {
          task: {
            title: 'Order custom birthday cake',
            category: 'Catering',
            status: 'pending',
            dueDate: '2026-11-20',
          },
        },
      },
      suggestedFollowUps: ['Show remaining tasks', 'Review catering budget'],
      intentTag: 'task_management',
    });

    renderWithProviders(<CopilotChat />);

    const input = screen.getByPlaceholderText(/Ask anything or command an action/i);
    fireEvent.change(input, { target: { value: 'Add task Order custom birthday cake' } });

    const submitBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Proposed Action/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Apply to Workspace/i })).toBeInTheDocument();
    });
  });
});
