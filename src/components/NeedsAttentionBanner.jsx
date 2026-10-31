import React, { useState } from 'react';
import { getUrgentEvents } from '../utils/status.js';
import { formatDisplayDate, formatDisplayTime } from '../utils/date.js';
import StatusBadge from './StatusBadge.jsx';

export default function NeedsAttentionBanner({ events, onFocusUrgent }) {
  const urgentEvents = getUrgentEvents(events);
  const [isExpanded, setIsExpanded] = useState(false);

  if (urgentEvents.length === 0) return null;

  return (
    <aside
      aria-label="Needs attention today"
      className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs text-amber-950 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">
            🚨
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
              <span>Needs attention today</span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                {urgentEvents.length} {urgentEvents.length === 1 ? 'event' : 'events'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
              You have {urgentEvents.length} urgent {urgentEvents.length === 1 ? 'notice' : 'notices'} scheduled for today or within the next 48 hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>

          {onFocusUrgent && (
            <button
              type="button"
              onClick={onFocusUrgent}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[44px] cursor-pointer"
            >
              Filter Urgent Only
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/80">
          <ul className="space-y-2 list-none p-0 m-0">
            {urgentEvents.map((ev) => (
              <li
                key={ev.id}
                className="bg-white/80 rounded-xl p-3 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="Urgent" size="sm" />
                    <span className="font-bold text-sm text-slate-900">{ev.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    📅 {formatDisplayDate(ev.date)} {ev.time ? `at ${formatDisplayTime(ev.time)}` : ''}{' '}
                    {ev.venue ? `• 📍 ${ev.venue}` : ''}
                  </p>
                </div>
                {ev.category && (
                  <span className="self-start sm:self-auto text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {ev.category}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
