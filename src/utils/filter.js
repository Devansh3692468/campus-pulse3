/**
 * Pure filtering and sorting helpers for Campus Pulse
 */

import { getEventStatus } from './status.js';

export const CATEGORIES = [
  'All',
  'Academic',
  'Deadline',
  'Event',
  'Club',
  'Sports',
  'Placement',
  'Other',
];

/**
 * Filter events by search query, category, and status
 * @param {Array<object>} events
 * @param {object} options
 * @param {string} [options.query=''] - free text search query
 * @param {string} [options.category='All'] - category name or 'All'
 * @param {string} [options.status='All'] - 'All' | 'Urgent' | 'Upcoming' | 'Expired'
 * @param {string|Date} [options.referenceDate=new Date()]
 * @returns {Array<object>}
 */
export function filterEvents(
  events = [],
  { query = '', category = 'All', status = 'All', referenceDate = new Date() } = {}
) {
  if (!Array.isArray(events)) return [];

  const cleanQuery = (query || '').trim().toLowerCase();

  return events.filter((event) => {
    if (!event) return false;

    // Category filter
    if (category && category !== 'All') {
      if (event.category !== category) {
        return false;
      }
    }

    // Status filter
    if (status && status !== 'All') {
      const eventStatus = getEventStatus(event, referenceDate);
      if (eventStatus !== status) {
        return false;
      }
    }

    // Text search query filter
    if (cleanQuery) {
      const title = (event.title || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();
      const venue = (event.venue || '').toLowerCase();
      const cat = (event.category || '').toLowerCase();

      const matches =
        title.includes(cleanQuery) ||
        desc.includes(cleanQuery) ||
        venue.includes(cleanQuery) ||
        cat.includes(cleanQuery);

      if (!matches) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort events
 * @param {Array<object>} events
 * @param {'date-asc' | 'date-desc' | 'urgent-first'} [sortBy='date-asc']
 * @param {string|Date} [referenceDate=new Date()]
 * @returns {Array<object>}
 */
export function sortEvents(events = [], sortBy = 'date-asc', referenceDate = new Date()) {
  if (!Array.isArray(events)) return [];

  const copy = [...events];

  if (sortBy === 'urgent-first') {
    const priority = { Urgent: 0, Upcoming: 1, Expired: 2 };
    return copy.sort((a, b) => {
      const statusA = priority[getEventStatus(a, referenceDate)] ?? 3;
      const statusB = priority[getEventStatus(b, referenceDate)] ?? 3;
      if (statusA !== statusB) return statusA - statusB;
      // Secondary sort: date ascending
      const dateA = a.date ? `${a.date} ${a.time || '00:00'}` : '9999-99-99';
      const dateB = b.date ? `${b.date} ${b.time || '00:00'}` : '9999-99-99';
      return dateA.localeCompare(dateB);
    });
  }

  return copy.sort((a, b) => {
    const dateA = a.date ? `${a.date} ${a.time || '00:00'}` : '9999-99-99';
    const dateB = b.date ? `${b.date} ${b.time || '00:00'}` : '9999-99-99';
    if (sortBy === 'date-desc') {
      return dateB.localeCompare(dateA);
    }
    return dateA.localeCompare(dateB);
  });
}
