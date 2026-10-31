import { EventModel } from '../types';
import { INITIAL_DEMO_EVENTS } from './demoData';

const STORAGE_KEYS = {
  EVENTS: 'gatherly_events_v1',
  ACTIVE_EVENT_ID: 'gatherly_active_event_id_v1',
  SETTINGS: 'gatherly_settings_v1',
  CHAT_SESSIONS: 'gatherly_chat_sessions_v1',
};

/**
 * Loads stored events from browser LocalStorage with automatic corrupted JSON recovery.
 *
 * @returns Array of valid EventModel objects, falling back to default seed events if storage is empty or malformed.
 */
export function loadStoredEvents(): EventModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      saveStoredEvents(INITIAL_DEMO_EVENTS);
      return INITIAL_DEMO_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_EVENTS;
  } catch (err) {
    console.error('Failed to load events from LocalStorage:', err);
    return INITIAL_DEMO_EVENTS;
  }
}

/**
 * Persists the entire array of events to browser LocalStorage.
 *
 * @param events - Complete list of active and archived event records.
 * @returns void
 */
export function saveStoredEvents(events: EventModel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to LocalStorage:', err);
  }
}

/**
 * Retrieves the currently active event ID from browser LocalStorage.
 *
 * @param defaultId - Fallback ID to return if no active event is currently stored.
 * @returns Stored active event UUID or defaultId fallback.
 */
export function loadActiveEventId(defaultId: string): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    return id || defaultId;
  } catch {
    return defaultId;
  }
}

/**
 * Saves the selected active event ID to browser LocalStorage.
 *
 * @param id - The event identifier to designate as active in current session.
 * @returns void
 */
export function saveActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  } catch (err) {
    console.error('Failed to save active event ID:', err);
  }
}

/**
 * Clears custom modifications and restores initial demo events into LocalStorage.
 *
 * @returns Re-initialized array of default demo events.
 */
export function resetToDefaultDemo(): EventModel[] {
  try {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    localStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
    saveStoredEvents(INITIAL_DEMO_EVENTS);
    saveActiveEventId(INITIAL_DEMO_EVENTS[0].id);
    return INITIAL_DEMO_EVENTS;
  } catch (err) {
    console.error('Failed to reset demo data:', err);
    return INITIAL_DEMO_EVENTS;
  }
}

/**
 * Serializes all workspace data into an exportable, formatted JSON string.
 *
 * @returns Pretty-printed JSON string containing schema version, timestamp, and event array.
 */
export function exportBackupJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    events: loadStoredEvents(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Parses and validates an imported backup JSON string, persisting valid events to LocalStorage.
 *
 * @param jsonStr - Raw JSON backup string uploaded by user.
 * @returns Array of imported EventModel objects if parsing and validation succeed, or null on failure.
 */
export function importBackupJSON(jsonStr: string): EventModel[] | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.events)) {
      saveStoredEvents(parsed.events);
      if (parsed.events[0]?.id) {
        saveActiveEventId(parsed.events[0].id);
      }
      return parsed.events;
    }
    return null;
  } catch (err) {
    console.error('Failed to import backup JSON:', err);
    return null;
  }
}
