import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/filter.js';
import { getEventStatus, STATUS_CONFIG } from '../utils/status.js';
import { formatDisplayDate } from '../utils/date.js';

export default function EditableEventCard({
  initialEvent,
  onSave,
  onCancel,
  isEditingSaved = false,
}) {
  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    category: initialEvent?.category || 'Event',
    date: initialEvent?.date || '',
    time: initialEvent?.time || '',
    venue: initialEvent?.venue || '',
    description: initialEvent?.description || '',
  });

  const [validationError, setValidationError] = useState('');

  // Update form if initialEvent changes
  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title || '',
        category: initialEvent.category || 'Event',
        date: initialEvent.date || '',
        time: initialEvent.time || '',
        venue: initialEvent.venue || '',
        description: initialEvent.description || '',
      });
    }
  }, [initialEvent]);

  // Dynamically computed status from current form data
  const currentStatus = getEventStatus({
    date: formData.date || null,
    time: formData.time || null,
  });
  const statusCfg = STATUS_CONFIG[currentStatus];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && value.trim()) {
      setValidationError('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError('Event title is required.');
      return;
    }

    onSave({
      ...initialEvent,
      title: formData.title.trim(),
      category: formData.category,
      date: formData.date ? formData.date.trim() : null,
      time: formData.time ? formData.time.trim() : null,
      venue: formData.venue.trim() || 'TBA',
      description: formData.description.trim(),
    });
  };

  const availableCategories = CATEGORIES.filter((c) => c !== 'All');

  return (
    <section
      aria-labelledby="card-review-title"
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-blue-400 relative overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {isEditingSaved ? '✏️' : '🎯'}
          </span>
          <div>
            <h2 id="card-review-title" className="text-base sm:text-lg font-bold text-slate-900">
              {isEditingSaved ? 'Edit Saved Event' : 'Review & Edit Extracted Event'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditingSaved
                ? 'Update event details below'
                : 'AI extracted the details below. Review and adjust before saving.'}
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${statusCfg.badgeClass}`}
          role="status"
          aria-label={statusCfg.ariaLabel}
        >
          <span aria-hidden="true">{statusCfg.icon}</span>
          <span>{statusCfg.label}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="event-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Google Cloud Tech Talk"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
          {validationError && (
            <p className="text-xs text-red-600 mt-1 font-medium">{validationError}</p>
          )}
        </div>

        {/* Row: Category + Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="event-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors cursor-pointer"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="event-venue" className="block text-xs font-semibold text-slate-700 mb-1">
              Venue / Location
            </label>
            <input
              id="event-venue"
              type="text"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              placeholder="e.g. Audi A, Lab 3, or Online"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Row: Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              id="event-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            />
            {formData.date && (
              <p className="text-[11px] text-slate-500 mt-1">
                Display: {formatDisplayDate(formData.date)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="event-time" className="block text-xs font-semibold text-slate-700 mb-1">
              Time (24-hour HH:mm)
            </label>
            <input
              id="event-time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="event-description" className="block text-xs font-semibold text-slate-700 mb-1">
            Short Description <span className="text-slate-400 font-normal">(max 20 words recommended)</span>
          </label>
          <textarea
            id="event-description"
            rows={2}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief key details (dress code, links, requirements)..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
          >
            Discard
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px] cursor-pointer"
          >
            <span>💾</span>
            <span>{isEditingSaved ? 'Update Event' : 'Save to My Events'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
