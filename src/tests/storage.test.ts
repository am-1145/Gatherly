import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStoredEvents,
  saveStoredEvents,
  exportBackupJSON,
  importBackupJSON,
  resetToDefaultDemo,
} from '../utils/storage';
import { INITIAL_DEMO_EVENTS } from '../utils/demoData';

describe('Storage & Data Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default demo events when localStorage is empty', () => {
    const events = loadStoredEvents();
    expect(events.length).toBe(INITIAL_DEMO_EVENTS.length);
    expect(events[0].title).toBe("Aarav’s 30th Rooftop Soirée");
  });

  it('persists and retrieves updated events', () => {
    const modified = [...INITIAL_DEMO_EVENTS];
    modified[0] = { ...modified[0], title: 'Renamed Party 2026' };
    saveStoredEvents(modified);

    const reloaded = loadStoredEvents();
    expect(reloaded[0].title).toBe('Renamed Party 2026');
  });

  it('exports and imports valid JSON backup structure', () => {
    const backupStr = exportBackupJSON();
    expect(backupStr).toContain('"version": "1.0"');
    expect(backupStr).toContain('Aarav’s 30th Rooftop Soirée');

    const result = importBackupJSON(backupStr);
    expect(result).not.toBeNull();
    expect(result?.length).toBeGreaterThan(0);
  });

  it('safely rejects invalid or malformed JSON imports', () => {
    const invalidJson = '{"foo": "bar"}';
    const result = importBackupJSON(invalidJson);
    expect(result).toBeNull();
  });

  it('restores factory demo dataset upon reset', () => {
    localStorage.setItem('gatherly_events_v1', JSON.stringify([]));
    const restored = resetToDefaultDemo();
    expect(restored.length).toBe(INITIAL_DEMO_EVENTS.length);
  });
});

