import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge.jsx';
import {
  getTodayString,
  formatDisplayDate,
  formatDisplayTime,
  formatMonthYear,
  getCalendarGrid,
} from '../utils/date.js';
import { getEventStatus } from '../utils/status.js';

const WEEKDAYS = [
  { short: 'Sun', long: 'Sunday' },
  { short: 'Mon', long: 'Monday' },
  { short: 'Tue', long: 'Tuesday' },
  { short: 'Wed', long: 'Wednesday' },
  { short: 'Thu', long: 'Thursday' },
  { short: 'Fri', long: 'Friday' },
  { short: 'Sat', long: 'Saturday' },
];

const CATEGORY_STYLES = {
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Deadline: 'bg-rose-50 text-rose-700 border-rose-200',
  Event: 'bg-purple-50 text-purple-700 border-purple-200',
  Club: 'bg-teal-50 text-teal-700 border-teal-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Placement: 'bg-amber-50 text-amber-800 border-amber-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function CalendarView({
  events = [],
  onEditEvent,
  onDeleteEvent,
}) {
  const todayStr = useMemo(() => getTodayString(), []);

  // Initialize viewing month from today or first event
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
    };
  });

  // Selected date defaults to today
  const [selectedDateStr, setSelectedDateStr] = useState(() => todayStr);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      if (!ev.date) continue;
      const key = ev.date.slice(0, 10);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  // Calendar grid cells
  const gridCells = useMemo(() => {
    return getCalendarGrid(currentDate.year, currentDate.month, todayStr);
  }, [currentDate.year, currentDate.month, todayStr]);

  // Selected day's events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return eventsByDate.get(selectedDateStr) || [];
  }, [selectedDateStr, eventsByDate]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
    setSelectedDateStr(todayStr);
  };

  return (
    <div className="space-y-6">
      {/* Month Card */}
      <section
        aria-label="Events Calendar"
        className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs"
      >
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {formatMonthYear(currentDate.year, currentDate.month)}
            </h3>
            {currentDate.year === new Date().getFullYear() &&
              currentDate.month === new Date().getMonth() && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Current Month
                </span>
              )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px]"
              aria-label="Previous month"
            >
              <span>‹</span>
              <span className="ml-1 hidden sm:inline">Prev</span>
            </button>

            <button
              type="button"
              onClick={handleGoToday}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px]"
              aria-label="Next month"
            >
              <span className="mr-1 hidden sm:inline">Next</span>
              <span>›</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid Table */}
        <div className="overflow-x-auto">
          <div
            role="grid"
            aria-label={`Calendar for ${formatMonthYear(currentDate.year, currentDate.month)}`}
            className="min-w-[320px] w-full"
          >
            {/* Weekday Row */}
            <div role="row" className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day.short}
                  role="columnheader"
                  className="py-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  <abbr title={day.long} className="no-underline">
                    {day.short}
                  </abbr>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {gridCells.map((cell) => {
                const dayEvents = eventsByDate.get(cell.dateStr) || [];
                const hasEvents = dayEvents.length > 0;
                const hasUrgent = dayEvents.some((ev) => getEventStatus(ev) === 'Urgent');
                const isSelected = selectedDateStr === cell.dateStr;

                // Accessible day description for screen readers
                const ariaDescription = [
                  cell.dateStr,
                  cell.isToday ? 'Today' : '',
                  hasEvents ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : 'No events',
                  hasUrgent ? 'Has urgent events' : '',
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-label={ariaDescription}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`relative min-h-[52px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500 shadow-xs'
                        : cell.isCurrentMonth
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-slate-100 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-blue-600 text-white font-bold'
                            : isSelected
                            ? 'text-blue-900 font-bold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {hasUrgent && (
                        <span
                          className="text-xs text-red-600 font-bold"
                          title="Urgent event on this day"
                          aria-hidden="true"
                        >
                          ⚡
                        </span>
                      )}
                    </div>

                    {/* Event indicators on the day */}
                    {hasEvents && (
                      <div className="w-full mt-1">
                        {/* Event count pill */}
                        <div className="hidden sm:flex flex-col gap-1">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <span
                              key={ev.id}
                              className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium border ${
                                getEventStatus(ev) === 'Urgent'
                                  ? 'bg-red-50 text-red-800 border-red-200 font-semibold'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                              title={ev.title}
                            >
                              {ev.title}
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-slate-500 font-medium px-1">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* Mobile dot indicator */}
                        <div className="flex sm:hidden items-center justify-center gap-1 mt-0.5">
                          {hasUrgent ? (
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                          {dayEvents.length > 1 && (
                            <span className="text-[9px] font-bold text-slate-600">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Day Event Details */}
      <section
        aria-labelledby="selected-day-heading"
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 id="selected-day-heading" className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📅</span> Events on {formatDisplayDate(selectedDateStr)}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedDayEvents.length === 0
                ? 'No events scheduled for this day.'
                : `${selectedDayEvents.length} event${selectedDayEvents.length > 1 ? 's' : ''} on this date.`}
            </p>
          </div>

          {selectedDateStr === todayStr && (
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Today
            </span>
          )}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            <p className="text-2xl mb-2" aria-hidden="true">
              ☕
            </p>
            <p className="font-medium text-slate-700">No events on this date</p>
            <p className="text-xs text-slate-500 mt-1">
              Select another day in the calendar above or switch to List view to see all events.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 mt-3 list-none p-0 m-0">
            {selectedDayEvents.map((event) => {
              const categoryStyle =
                CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other;

              return (
                <li
                  key={event.id}
                  className="py-4 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge event={event} size="sm" />
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${categoryStyle}`}
                      >
                        {event.category}
                      </span>
                      {event.time && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          ⏰ {formatDisplayTime(event.time)}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {event.title}
                    </h4>

                    {event.venue && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span aria-hidden="true">📍</span>
                        <span>{event.venue}</span>
                      </p>
                    )}

                    {event.description && (
                      <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {onEditEvent && (
                      <button
                        type="button"
                        onClick={() => onEditEvent(event)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                        aria-label={`Edit ${event.title}`}
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                    )}

                    {onDeleteEvent && (
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(event.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                        aria-label={`Delete ${event.title}`}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
