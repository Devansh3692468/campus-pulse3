import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEventStatus,
  isEventUrgent,
  getUrgentEvents,
  STATUS_CONFIG,
} from '../../src/utils/status.js';
import { filterEvents, sortEvents } from '../../src/utils/filter.js';
import {
  getTodayString,
  formatDisplayDate,
  formatDisplayTime,
  formatRelativeDate,
  getMonthName,
  formatMonthYear,
  getDaysInMonth,
  getFirstDayOfWeek,
  getCalendarGrid,
} from '../../src/utils/date.js';
import {
  loadEvents,
  saveEvents,
  generateEventId,
  STORAGE_KEY,
} from '../../src/utils/storage.js';

describe('Event Status Calculation', () => {
  const BASE_DATE = '2026-11-01'; // Reference date: Nov 1, 2026

  it('marks an event on the same day as Urgent', () => {
    const event = { title: 'Today Event', date: '2026-11-01', time: '14:00' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Urgent');
    expect(isEventUrgent(event, BASE_DATE)).toBe(true);
  });

  it('marks an event tomorrow (within 24h) as Urgent', () => {
    const event = { title: 'Tomorrow Event', date: '2026-11-02', time: '10:00' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Urgent');
    expect(isEventUrgent(event, BASE_DATE)).toBe(true);
  });

  it('marks an event 2 days away (within 48h) as Urgent', () => {
    const event = { title: 'In 48h Event', date: '2026-11-03', time: '09:00' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Urgent');
  });

  it('marks an event 3 days away (> 48h) as Upcoming', () => {
    const event = { title: 'Future Event', date: '2026-11-04', time: '10:00' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Upcoming');
    expect(isEventUrgent(event, BASE_DATE)).toBe(false);
  });

  it('marks an event far in the future as Upcoming', () => {
    const event = { title: 'Next Month Event', date: '2026-12-15' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Upcoming');
  });

  it('marks yesterday as Expired', () => {
    const event = { title: 'Yesterday Event', date: '2026-10-31', time: '18:00' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Expired');
  });

  it('marks an event in the distant past as Expired', () => {
    const event = { title: 'Old Event', date: '2025-05-10' };
    expect(getEventStatus(event, BASE_DATE)).toBe('Expired');
  });

  it('defaults to Upcoming when date is null or undefined', () => {
    expect(getEventStatus({ title: 'No Date' }, BASE_DATE)).toBe('Upcoming');
    expect(getEventStatus(null, BASE_DATE)).toBe('Upcoming');
    expect(getEventStatus({ date: null }, BASE_DATE)).toBe('Upcoming');
  });

  it('filters a list of events to only urgent events', () => {
    const events = [
      { id: 1, date: '2026-10-31' }, // expired
      { id: 2, date: '2026-11-01' }, // urgent (today)
      { id: 3, date: '2026-11-02' }, // urgent (tomorrow)
      { id: 4, date: '2026-11-08' }, // upcoming
    ];
    const urgent = getUrgentEvents(events, BASE_DATE);
    expect(urgent.map((e) => e.id)).toEqual([2, 3]);
  });

  it('provides WCAG-compliant status config with text and icon', () => {
    expect(STATUS_CONFIG.Urgent.icon).toBeDefined();
    expect(STATUS_CONFIG.Urgent.label).toBe('Urgent');
    expect(STATUS_CONFIG.Upcoming.icon).toBeDefined();
    expect(STATUS_CONFIG.Expired.icon).toBeDefined();
  });
});

describe('Event Filtering and Sorting', () => {
  const events = [
    {
      id: 1,
      title: 'Google Cloud Tech Talk',
      category: 'Event',
      date: '2026-11-02',
      venue: 'Mech Audi',
      description: 'AI talk for students',
    },
    {
      id: 2,
      title: 'TCS Placement Interview',
      category: 'Placement',
      date: '2026-11-01',
      venue: 'Hall 2',
      description: 'Formal dress mandatory',
    },
    {
      id: 3,
      title: 'Hackathon Submission Deadline',
      category: 'Deadline',
      date: '2026-11-05',
      venue: 'Online',
      description: 'Submit project abstract',
    },
    {
      id: 4,
      title: 'Cricket Tournament Final',
      category: 'Sports',
      date: '2026-10-30',
      venue: 'College Ground',
      description: 'Inter-branch cricket',
    },
  ];

  const REF_DATE = '2026-11-01';

  it('returns all events when no filters are set', () => {
    const result = filterEvents(events);
    expect(result).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterEvents(events, { category: 'Placement' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by status (Urgent)', () => {
    const result = filterEvents(events, { status: 'Urgent', referenceDate: REF_DATE });
    // Nov 1 (today) and Nov 2 (tomorrow) are Urgent
    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });

  it('filters by status (Expired)', () => {
    const result = filterEvents(events, { status: 'Expired', referenceDate: REF_DATE });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('searches text across title, description, and venue (case-insensitive)', () => {
    // Search in title
    expect(filterEvents(events, { query: 'google' })).toHaveLength(1);
    // Search in venue
    expect(filterEvents(events, { query: 'audi' })).toHaveLength(1);
    // Search in description
    expect(filterEvents(events, { query: 'formal' })).toHaveLength(1);
  });

  it('combines query and category filters', () => {
    const result = filterEvents(events, { query: 'project', category: 'Deadline' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);

    const noMatch = filterEvents(events, { query: 'project', category: 'Event' });
    expect(noMatch).toHaveLength(0);
  });

  it('sorts events by date ascending', () => {
    const sorted = sortEvents(events, 'date-asc');
    expect(sorted.map((e) => e.id)).toEqual([4, 2, 1, 3]);
  });

  it('sorts events by date descending', () => {
    const sorted = sortEvents(events, 'date-desc');
    expect(sorted.map((e) => e.id)).toEqual([3, 1, 2, 4]);
  });

  it('sorts events with Urgent first', () => {
    const sorted = sortEvents(events, 'urgent-first', REF_DATE);
    const urgentIds = [sorted[0].id, sorted[1].id];
    // Events 2 (Nov 1) and 1 (Nov 2) are Urgent, so they should be first
    expect(urgentIds).toContain(1);
    expect(urgentIds).toContain(2);
    // Last should be expired (4)
    expect(sorted[3].id).toBe(4);
  });
});

describe('Date & Time Formatting', () => {
  it('formats dates into readable format', () => {
    expect(formatDisplayDate('2026-11-05')).toContain('Nov 5, 2026');
    expect(formatDisplayDate(null)).toBe('Date TBA');
  });

  it('formats 24h time into 12h AM/PM', () => {
    expect(formatDisplayTime('14:00')).toBe('2:00 PM');
    expect(formatDisplayTime('09:30')).toBe('9:30 AM');
    expect(formatDisplayTime('00:15')).toBe('12:15 AM');
    expect(formatDisplayTime('12:00')).toBe('12:00 PM');
    expect(formatDisplayTime(null)).toBe('');
  });

  it('calculates relative dates correctly', () => {
    const today = '2026-11-01';
    expect(formatRelativeDate('2026-11-01', today)).toBe('Today');
    expect(formatRelativeDate('2026-11-02', today)).toBe('Tomorrow');
    expect(formatRelativeDate('2026-10-31', today)).toBe('Yesterday');
    expect(formatRelativeDate('2026-11-04', today)).toBe('In 3 days');
  });

  it('getTodayString returns YYYY-MM-DD', () => {
    const d = new Date(2026, 10, 5); // Month is 0-indexed: 10 = Nov
    expect(getTodayString(d)).toBe('2026-11-05');
  });

  it('generates month names and formatted month year strings', () => {
    expect(getMonthName(10)).toBe('November');
    expect(formatMonthYear(2026, 10)).toBe('November 2026');
  });

  it('computes days in month and starting weekday', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28); // Feb 2026: 28 days
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (leap): 29 days
    expect(getDaysInMonth(2026, 10)).toBe(30); // Nov 2026: 30 days
    expect(getFirstDayOfWeek(2026, 10)).toBe(0); // Nov 1, 2026 is Sunday (0)
  });

  it('generates full padded 7-column calendar grid', () => {
    // Nov 2026 starts on Sunday (day 0), has 30 days
    const grid = getCalendarGrid(2026, 10, '2026-11-05');
    // Grid length must be multiple of 7
    expect(grid.length % 7).toBe(0);
    expect(grid.length).toBeGreaterThanOrEqual(30);

    // Nov 1 is current month
    const nov1 = grid.find((cell) => cell.dateStr === '2026-11-01');
    expect(nov1).toBeDefined();
    expect(nov1.isCurrentMonth).toBe(true);

    // Nov 5 is marked as today
    const nov5 = grid.find((cell) => cell.dateStr === '2026-11-05');
    expect(nov5.isToday).toBe(true);
  });
});

describe('Storage Helpers', () => {
  let mockStore = {};
  const mockStorage = {
    getItem: (key) => mockStore[key] || null,
    setItem: (key, val) => {
      mockStore[key] = String(val);
    },
    removeItem: (key) => {
      delete mockStore[key];
    },
    clear: () => {
      mockStore = {};
    },
  };

  beforeEach(() => {
    mockStorage.clear();
  });

  it('saves and loads events from storage', () => {
    const sample = [{ id: 'ev_1', title: 'Test Event' }];
    expect(saveEvents(sample, mockStorage)).toBe(true);

    const loaded = loadEvents(mockStorage);
    expect(loaded).toEqual(sample);
  });

  it('returns empty array when storage is empty', () => {
    expect(loadEvents(mockStorage)).toEqual([]);
  });

  it('handles corrupted JSON safely without throwing', () => {
    mockStore[STORAGE_KEY] = 'INVALID_JSON{{{';
    const result = loadEvents(mockStorage);
    expect(result).toEqual([]);
  });

  it('generates unique event IDs with prefix', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();
    expect(id1).toMatch(/^ev_/);
    expect(id1).not.toBe(id2);
  });
});
