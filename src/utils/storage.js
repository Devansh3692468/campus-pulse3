/**
 * Storage helpers and sample data for Campus Pulse
 */

export const STORAGE_KEY = 'campus_pulse_events';

export const SAMPLE_NOTICES = [
  {
    label: 'Google Tech Talk',
    text: 'Attention All Students!! Google Cloud is conducting a technical session on Modern Generative AI architectures this Friday at 3:00 PM in the Mech Seminar Hall (Block B). Attendance is mandatory for 3rd and 4th year CSE/IT. Refreshments will be served after the Q&A.',
  },
  {
    label: 'Hackathon Registration Deadline',
    text: 'URGENT: Smart Campus Hackathon 2026 team registration and idea abstract submission deadline is tomorrow at 11:59 PM. Late entries will NOT be entertained under any circumstances. Submit at bit.ly/campus-hack-2026.',
  },
  {
    label: 'TCS Placement Interview',
    text: 'Placement Cell Notice: Final round technical interviews for TCS Ninja and Digital shortlisted candidates are scheduled for Nov 5, 2026 starting at 09:30 AM in Central Placement Hall 2. Carry 2 physical copies of resume and college ID.',
  },
  {
    label: 'Robotics Club Workshop',
    text: 'Hey everyone! Robotics Club is hosting a hands-on Arduino and IoT workshop next Monday at 4:30 PM in Lab 402. Bring your laptops. Free entry for club members.',
  },
];

/**
 * Generates a unique client-side ID
 * @returns {string}
 */
export function generateEventId() {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Safely loads events from localStorage
 * @param {Storage} [customStorage]
 * @returns {Array<object>}
 */
export function loadEvents(customStorage) {
  try {
    const storage =
      customStorage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!storage) return [];

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load events from storage:', err);
    return [];
  }
}

/**
 * Safely saves events to localStorage
 * @param {Array<object>} events
 * @param {Storage} [customStorage]
 * @returns {boolean}
 */
export function saveEvents(events, customStorage) {
  try {
    const storage =
      customStorage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!storage) return false;

    storage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    console.error('Failed to save events to storage:', err);
    return false;
  }
}
