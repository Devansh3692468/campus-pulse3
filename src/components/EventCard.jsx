import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import {
  formatDisplayDate,
  formatDisplayTime,
  formatRelativeDate,
} from '../utils/date.js';

const CATEGORY_STYLES = {
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Deadline: 'bg-rose-50 text-rose-700 border-rose-200',
  Event: 'bg-purple-50 text-purple-700 border-purple-200',
  Club: 'bg-teal-50 text-teal-700 border-teal-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Placement: 'bg-amber-50 text-amber-800 border-amber-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function EventCard({ event, onEdit, onDelete }) {
  const categoryStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other;
  const relativeDate = event.date ? formatRelativeDate(event.date) : '';

  return (
    <article
      aria-labelledby={`event-title-${event.id}`}
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between gap-4"
    >
      <div>
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Badge (WCAG AA text + icon) */}
            <StatusBadge event={event} />

            {/* Category Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${categoryStyle}`}
            >
              {event.category}
            </span>
          </div>

          {relativeDate && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {relativeDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          id={`event-title-${event.id}`}
          className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mb-2"
        >
          {event.title}
        </h3>

        {/* Meta: Date, Time, Venue */}
        <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400" aria-hidden="true">
              📅
            </span>
            <span className="font-medium">
              {formatDisplayDate(event.date)}
              {event.time && (
                <span className="text-slate-500 font-normal">
                  {' '}
                  at {formatDisplayTime(event.time)}
                </span>
              )}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400" aria-hidden="true">
                📍
              </span>
              <span>{event.venue}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            {event.description}
          </p>
        )}
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          aria-label={`Edit ${event.title}`}
        >
          <span>✏️</span>
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(event.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
          aria-label={`Delete ${event.title}`}
        >
          <span>🗑️</span>
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}
