import React from 'react';
import { formatDisplayDate, getTodayString } from '../utils/date.js';

export default function Header() {
  const todayStr = getTodayString();
  const formattedToday = formatDisplayDate(todayStr);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white font-medium"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <span className="text-xl" role="img" aria-label="Campus Pulse Logo">
                ⚡
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Campus Pulse
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  AI Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Turn messy campus notices into clean, organised event cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              aria-label={`Current date is ${formattedToday}`}
            >
              <span className="text-slate-500">📅</span>
              <span>Today:</span>
              <span className="font-semibold text-slate-900">{formattedToday}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
