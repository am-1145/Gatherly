import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventWizardModal } from '../../components/wizard/EventWizardModal';
import { renderWithProviders } from '../testUtils';
import * as geminiService from '../../services/ai/geminiService';

describe('EventWizardModal Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(geminiService, 'getActiveGeminiApiKey').mockReturnValue('');
  });

  it('renders modal with step tracker and mode toggle when open', () => {
    const handleClose = vi.fn();
    renderWithProviders(<EventWizardModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Create New Event/i)).toBeInTheDocument();
    expect(screen.getByText(/Step-by-Step/i)).toBeInTheDocument();
    expect(screen.getByText(/Prompt AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Select the primary occasion you are planning/i)).toBeInTheDocument();
  });

  it('navigates through guided steps using next and back buttons', () => {
    const handleClose = vi.fn();
    renderWithProviders(<EventWizardModal isOpen={true} onClose={handleClose} />);

    // Step 1 -> Step 2
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);
    expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();

    // Step 2 -> Step 3
    const nextStepBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextStepBtn);
    expect(screen.getByLabelText(/Total Target Budget/i)).toBeInTheDocument();

    // Back to Step 2
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);
    expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
  });

  it('switches to natural language mode and parses prompt into event draft', () => {
    const handleClose = vi.fn();
    renderWithProviders(<EventWizardModal isOpen={true} onClose={handleClose} />);

    // Switch to Prompt AI tab
    const promptAiTabBtn = screen.getByText(/Prompt AI/i);
    fireEvent.click(promptAiTabBtn);

    const textarea = screen.getByPlaceholderText(/I want to organize a birthday party/i);
    fireEvent.change(textarea, {
      target: { value: 'Anniversary party in Mumbai for 60 guests with ₹50,000 budget' },
    });

    const parseBtn = screen.getByRole('button', { name: /Parse & Generate Workspace/i });
    fireEvent.click(parseBtn);

    // After parsing, it switches to Step 5 Review
    expect(screen.getByText(/Generate Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/60 Guests/i)).toBeInTheDocument();
  });
});
