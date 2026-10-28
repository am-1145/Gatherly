import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  DollarSign,
  Calendar,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { CurrencyCode } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    aiMode,
    saveAISettings,
    geminiApiKey,
  } = useSettings();

  const { resetDemoData } = useEvent();

  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const [selectedAiMode, setSelectedAiMode] = useState(aiMode);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // JSON Import/Export state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    saveAISettings(selectedAiMode, tempApiKey);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleExportData = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gatherly_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importBackupJSON(content);
      if (imported) {
        setImportStatus('Backup successfully restored! Refreshing...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Invalid backup file schema.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
          Application Settings & Preferences
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Configure appearance, currency standards, local storage persistence, and AI providers.
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <Card padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
              Appearance & Palette
            </h3>
            <p className="text-xs text-charcoal-500">
              Switch between warm ivory daylight theme and charcoal midnight mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ivory-200 dark:border-charcoal-700 bg-ivory-100 dark:bg-charcoal-800 text-xs font-semibold text-charcoal-800 dark:text-ivory-100 hover:bg-ivory-200 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Midnight Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-charcoal-600" />
                <span>Ivory Day Theme</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Currency Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Default Currency Symbol
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
            >
              <option value="INR">₹ INR (Indian Rupee - Lakhs format)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Date Display Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full text-xs rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 28/11/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/28/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 2. AI Copilot Provider Configuration */}
      <Card padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                AI Copilot Engine Configuration
              </h3>
              <p className="text-xs text-charcoal-500">
                Configure local deterministic demo mode or optional live Google Gemini API.
              </p>
            </div>
          </div>
          <Badge variant="sage" size="sm">
            Frontend Provider Abstraction
          </Badge>
        </div>

        <form onSubmit={handleSaveAI} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 dark:text-ivory-100 cursor-pointer">
                <input
                  type="radio"
                  name="aiMode"
                  value="local_demo"
                  checked={selectedAiMode === 'local_demo'}
                  onChange={() => setSelectedAiMode('local_demo')}
                  className="text-sage-600 focus:ring-sage-500"
                />
                <span>Local Deterministic Engine (Offline & No API Key Required)</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 dark:text-ivory-100 cursor-pointer">
                <input
                  type="radio"
                  name="aiMode"
                  value="gemini_api"
                  checked={selectedAiMode === 'gemini_api'}
                  onChange={() => setSelectedAiMode('gemini_api')}
                  className="text-sage-600 focus:ring-sage-500"
                />
                <span>Direct Google Gemini 1.5 Flash (Custom User Key)</span>
              </label>
            </div>
          </div>

          {selectedAiMode === 'gemini_api' && (
            <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800 border border-ivory-200 dark:border-charcoal-700 space-y-3 animate-fade-in">
              <Input
                label="Gemini API Key"
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                hint="Your key is stored strictly in your local browser storage and never uploaded to any backend."
              />

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Frontend Key Limitation:</strong> Browser calls to third-party AI APIs expose
                  network requests in DevTools. In production, keys should be proxied through a secure backend.
                  If the key is empty or network fails, Gatherly AI seamlessly falls back to the deterministic local engine.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {isSavedNotice && (
              <span className="text-xs text-sage-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
            <div className="ml-auto">
              <Button variant="sage" size="sm" type="submit">
                Save AI Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* 3. Data Management & Reset */}
      <Card padding="lg">
        <div className="pb-4 border-b border-ivory-200 dark:border-charcoal-800 mb-4">
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
            Local Data Backup & Reset
          </h3>
          <p className="text-xs text-charcoal-500">
            Export your workspace data as JSON, import from another browser, or reset demo seed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800 border border-ivory-200 dark:border-charcoal-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-charcoal-900 dark:text-ivory-100">
                JSON Workspace Backup
              </p>
              <p className="text-[11px] text-charcoal-500">
                Download all events, tasks, budgets, guests, and runbooks into a single file.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportData}
              >
                Export JSON
              </Button>

              <label className="inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg text-xs px-2.5 py-1.5 gap-1.5 bg-ivory-100 text-charcoal-800 hover:bg-ivory-200 border border-ivory-200 dark:bg-charcoal-800 dark:text-ivory-100 dark:border-charcoal-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importStatus && (
            <p className="text-xs font-semibold text-sage-600">{importStatus}</p>
          )}

          {/* Reset Demo Data Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-charcoal-500">
              Restore the pristine demo dataset (Aarav's 30th Birthday, Jaipur Wedding, etc.).
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset All Demo Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog for Reset */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetDemoData();
          window.location.reload();
        }}
        title="Reset to Factory Demo State?"
        message="This will overwrite all customized events in your local browser storage and re-initialize the default Bangalore rooftop birthday and Jaipur palace wedding demo events."
        confirmLabel="Reset Demo Data"
      />
    </div>
  );
};
