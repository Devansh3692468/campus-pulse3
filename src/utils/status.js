/**
 * Pure status calculation helpers for Campus Pulse
 * Spec: Urgent = today or within 48h; Expired = past; Upcoming = future (> 48h)
 */

/**
 * Normalizes input date to YYYY-MM-DD string and midnight Date
 * @param {string|Date} dateInput
 * @returns {{ dateStr: string, midnight: Date }}
 */
function normalizeDate(dateInput) {
  if (!dateInput) {
    const now = new Date();
    const dateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      dateStr,
      midnight: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    };
  }

  if (dateInput instanceof Date) {
    const dateStr = [
      dateInput.getFullYear(),
      String(dateInput.getMonth() + 1).padStart(2, '0'),
      String(dateInput.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      dateStr,
      midnight: new Date(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate(),
        0,
        0,
        0,
        0
      ),
    };
  }

  // String format YYYY-MM-DD
  const parts = String(dateInput).slice(0, 10).split('-');
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    return {
      dateStr: String(dateInput).slice(0, 10),
      midnight: new Date(y, m, d, 0, 0, 0, 0),
    };
  }

  const d = new Date(dateInput);
  const dateStr = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
  return {
    dateStr,
    midnight: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
  };
}

/**
 * Computes event status: 'Urgent' | 'Upcoming' | 'Expired'
 * @param {object} event - { date: 'YYYY-MM-DD' | null, time?: string | null }
 * @param {string|Date} [referenceDate=new Date()]
 * @returns {'Urgent' | 'Upcoming' | 'Expired'}
 */
export function getEventStatus(event, referenceDate = new Date()) {
  if (!event || !event.date) {
    return 'Upcoming';
  }

  const { dateStr: refDateStr, midnight: refMidnight } = normalizeDate(referenceDate);
  const { dateStr: eventDateStr, midnight: eventMidnight } = normalizeDate(event.date);

  // Past calendar day -> Expired
  if (eventDateStr < refDateStr) {
    return 'Expired';
  }

  // Event is today -> Urgent
  if (eventDateStr === refDateStr) {
    return 'Urgent';
  }

  // Event is in future: check 48-hour window from reference start of day
  // 1 day (tomorrow) = 24h -> Urgent
  // 2 days away = 48h -> Urgent
  // 3+ days away (> 48h) -> Upcoming
  const diffMs = eventMidnight.getTime() - refMidnight.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 48) {
    return 'Urgent';
  }

  return 'Upcoming';
}

/**
 * Checks whether an event is urgent
 * @param {object} event
 * @param {string|Date} [referenceDate]
 * @returns {boolean}
 */
export function isEventUrgent(event, referenceDate = new Date()) {
  return getEventStatus(event, referenceDate) === 'Urgent';
}

/**
 * Filters list of events to only urgent events
 * @param {Array<object>} events
 * @param {string|Date} [referenceDate]
 * @returns {Array<object>}
 */
export function getUrgentEvents(events = [], referenceDate = new Date()) {
  return events.filter((ev) => isEventUrgent(ev, referenceDate));
}

/**
 * Badge styling and accessibility metadata for WCAG AA (>= 4.5:1 contrast)
 * Uses text + icon, never color alone
 */
export const STATUS_CONFIG = {
  Urgent: {
    label: 'Urgent',
    icon: '⚡',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 font-semibold',
    dotClass: 'bg-red-600',
    ariaLabel: 'Status: Urgent (needs attention today or within 48 hours)',
  },
  Upcoming: {
    label: 'Upcoming',
    icon: '📅',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
    dotClass: 'bg-blue-600',
    ariaLabel: 'Status: Upcoming',
  },
  Expired: {
    label: 'Expired',
    icon: '⌛',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300 font-medium',
    dotClass: 'bg-gray-500',
    ariaLabel: 'Status: Expired (past event)',
  },
};
