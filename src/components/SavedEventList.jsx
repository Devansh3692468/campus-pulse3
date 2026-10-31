import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import EventCard from './EventCard.jsx';
import { CATEGORIES, filterEvents, sortEvents } from '../utils/filter.js';

// Lazy-load the Calendar view for performance
const CalendarView = lazy(() => import('./CalendarView.jsx'));

function CalendarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading calendar view"
      className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4"
    >
      <div className="flex justify-between items-center">
        <div className="h-6 w-36 bg-slate-200 rounded-lg" />
        <div className="h-10 w-44 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-7 gap-2 pt-4">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl border border-slate-200/60" />
        ))}
      </div>
    </div>
  );
}

export default function SavedEventList({
  events = [],
  onEditEvent,
  onDeleteEvent,
  onTrySample,
  activeStatusFilter = 'All',
  onStatusFilterChange,
}) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  // Debounce search input (250ms) to avoid expensive re-filters during fast typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filter and sort events (memoized)
  const filteredEvents = useMemo(() => {
    const filtered = filterEvents(events, {
      query: debouncedQuery,
      category: selectedCategory,
      status: activeStatusFilter,
    });
    return sortEvents(filtered, sortBy);
  }, [events, debouncedQuery, selectedCategory, activeStatusFilter, sortBy]);

  const hasAnySavedEvents = events.length > 0;
  const isFiltering =
    searchInput.trim() !== '' || selectedCategory !== 'All' || activeStatusFilter !== 'All';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setSelectedCategory('All');
    if (onStatusFilterChange) {
      onStatusFilterChange('All');
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedQuery('');
  };

  return (
    <section aria-labelledby="saved-events-heading" className="space-y-4">
      {/* Section Header with List/Calendar View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 id="saved-events-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span> Saved Events
            {hasAnySavedEvents && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredEvents.length} of {events.length}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            All your organized campus events stored safely in your browser.
          </p>
        </div>

        {hasAnySavedEvents && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* List / Calendar Toggle */}
            <div
              role="group"
              aria-label="View mode toggle"
              className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/80"
            >
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[44px] ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span aria-hidden="true">📋</span>
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                aria-pressed={viewMode === 'calendar'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[44px] ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span aria-hidden="true">📅</span>
                <span>Calendar</span>
              </button>
            </div>

            {/* Sort Select (only in list view) */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-1.5">
                <label htmlFor="sort-select" className="sr-only">
                  Sort saved events
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  <option value="date-asc">Date: Earliest first</option>
                  <option value="date-desc">Date: Latest first</option>
                  <option value="urgent-first">Urgent first</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar (shown when user has saved events) */}
      {hasAnySavedEvents && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
          {/* Search Input (Debounced) */}
          <div className="relative">
            <span
              className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, description, venue, or category..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[44px]"
              aria-label="Search saved events"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-2 px-2 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded min-h-[44px]"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            {['All', 'Urgent', 'Upcoming', 'Expired'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange && onStatusFilterChange(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors min-h-[44px] ${
                  activeStatusFilter === status
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                aria-pressed={activeStatusFilter === status}
              >
                {status === 'Urgent' && '⚡ '}
                {status === 'Upcoming' && '📅 '}
                {status === 'Expired' && '⌛ '}
                {status}
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors min-h-[44px] ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Filter Pill Summary & Reset */}
          {isFiltering && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>
                Filtered: <strong className="text-slate-800">{filteredEvents.length}</strong> of{' '}
                {events.length} events
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 min-h-[44px] px-2 flex items-center"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* View content: Empty State vs List vs Calendar */}
      {!hasAnySavedEvents ? (
        /* Brand new user empty state */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
            📬
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            No saved events yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
            Paste a messy announcement into the box above and click{' '}
            <strong className="text-slate-700">Extract Event</strong> to get started.
          </p>
          <button
            type="button"
            onClick={onTrySample}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] cursor-pointer"
          >
            <span aria-hidden="true">💡</span>
            <span>Try a sample notice</span>
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Filters matched 0 results */
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-2xl mb-2" aria-hidden="true">
            🔍
          </p>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
            No events match your criteria
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search query, status, or category filter.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View (Lazy Loaded) */
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView
            events={filteredEvents}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        </Suspense>
      ) : (
        /* List View */
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
          {filteredEvents.map((event) => (
            <li key={event.id}>
              <EventCard
                event={event}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
