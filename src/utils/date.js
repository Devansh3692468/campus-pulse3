/**
 * Pure date and time formatting utilities for Campus Pulse
 */

/**
 * Returns current or given date formatted as YYYY-MM-DD
 * @param {Date|string} [date=new Date()]
 * @returns {string}
 */
export function getTodayString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into human-readable date e.g. "Thu, Nov 5, 2026"
 * @param {string|null} dateStr
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 'Date TBA';

  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;

  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);

  const dateObj = new Date(y, m, d);
  if (Number.isNaN(dateObj.getTime())) return dateStr;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format HH:mm (24-hour) to 12-hour e.g. "2:00 PM"
 * @param {string|null} timeStr
 * @returns {string}
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';

  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return clean;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return clean;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Returns relative human label e.g. "Today", "Tomorrow", "In 2 days", "Yesterday"
 * @param {string} dateStr
 * @param {string} [todayStr=getTodayString()]
 * @returns {string}
 */
export function formatRelativeDate(dateStr, todayStr = getTodayString()) {
  if (!dateStr) return '';

  if (dateStr === todayStr) return 'Today';

  const [y1, m1, d1] = dateStr.slice(0, 10).split('-').map(Number);
  const [y2, m2, d2] = todayStr.slice(0, 10).split('-').map(Number);

  const dDate = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
  const dToday = new Date(y2, m2 - 1, d2, 0, 0, 0, 0);

  const diffDays = Math.round((dDate - dToday) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

  return formatDisplayDate(dateStr);
}

/**
 * Returns month name (e.g. "November")
 * @param {number} monthIndex - 0 to 11
 * @returns {string}
 */
export function getMonthName(monthIndex) {
  const d = new Date(2026, monthIndex, 1);
  return d.toLocaleString('en-US', { month: 'long' });
}

/**
 * Returns Month and Year display string (e.g. "November 2026")
 * @param {number} year
 * @param {number} monthIndex - 0 to 11
 * @returns {string}
 */
export function formatMonthYear(year, monthIndex) {
  return `${getMonthName(monthIndex)} ${year}`;
}

/**
 * Returns the number of days in a given month
 * @param {number} year
 * @param {number} monthIndex - 0 to 11
 * @returns {number}
 */
export function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Returns weekday index of 1st day of month (0 = Sun, 6 = Sat)
 * @param {number} year
 * @param {number} monthIndex - 0 to 11
 * @returns {number}
 */
export function getFirstDayOfWeek(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

/**
 * Generates calendar grid cells for a given month, padded with prev/next month dates
 * @param {number} year
 * @param {number} monthIndex - 0 to 11
 * @param {string} [todayStr=getTodayString()]
 * @returns {Array<{ dateStr: string, dayNumber: number, isCurrentMonth: boolean, isToday: boolean }>}
 */
export function getCalendarGrid(year, monthIndex, todayStr = getTodayString()) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startDay = getFirstDayOfWeek(year, monthIndex); // 0 (Sun) to 6 (Sat)
  const prevMonthDays = getDaysInMonth(year, monthIndex - 1);

  const cells = [];

  // Previous month padding days
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevDate = new Date(year, monthIndex - 1, day);
    const dateStr = getTodayString(prevDate);
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const currentMonthNum = String(monthIndex + 1).padStart(2, '0');
    const dayNum = String(day).padStart(2, '0');
    const dateStr = `${year}-${currentMonthNum}-${dayNum}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding days to complete 7-column rows (total must be multiple of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextDate = new Date(year, monthIndex + 1, day);
    const dateStr = getTodayString(nextDate);
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

