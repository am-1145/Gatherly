import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsPage } from '../../pages/SettingsPage';
import { renderWithProviders } from '../testUtils';

describe('SettingsPage Feature Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders application settings header and core preference cards', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Application Settings & Preferences/i })).toBeInTheDocument();
    expect(screen.getByText(/Appearance & Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Copilot Engine Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Data Backup & Reset/i)).toBeInTheDocument();
  });

  it('allows toggling between light and dark themes', () => {
    renderWithProviders(<SettingsPage />);

    const themeButton = screen.getByRole('button', { name: /(Ivory Day Theme|Midnight Theme)/i });
    expect(themeButton).toBeInTheDocument();

    fireEvent.click(themeButton);
    expect(localStorage.getItem('gatherly_app_settings_v1_theme')).toBeTruthy();
  });

  it('allows changing currency preference', () => {
    renderWithProviders(<SettingsPage />);

    const currencySelect = screen.getByDisplayValue(/₹ INR/i);
    expect(currencySelect).toBeInTheDocument();

    fireEvent.change(currencySelect, { target: { value: 'USD' } });
    expect((currencySelect as HTMLSelectElement).value).toBe('USD');
  });

  it('allows selecting Gemini AI intelligence mode and saving API credentials', () => {
    renderWithProviders(<SettingsPage />);

    const geminiRadio = screen.getByLabelText(/Direct Google Gemini 1.5 Flash/i);
    fireEvent.click(geminiRadio);

    const apiKeyInput = screen.getByPlaceholderText(/AIzaSy.../i);
    expect(apiKeyInput).toBeInTheDocument();

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key-12345' } });

    const saveButton = screen.getByRole('button', { name: /Save AI Settings/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/Settings saved successfully!/i)).toBeInTheDocument();
  });

  it('triggers backup export and opens reset confirmation dialog', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    renderWithProviders(<SettingsPage />);

    // Test Export
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
    fireEvent.click(exportBtn);
    expect(createElementSpy).toHaveBeenCalledWith('a');

    // Test Reset confirmation
    const resetBtn = screen.getByRole('button', { name: /Reset All Demo Data/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Reset to Factory Demo State\?/i)).toBeInTheDocument();
    expect(screen.getByText(/This will overwrite all customized events/i)).toBeInTheDocument();
  });
});
