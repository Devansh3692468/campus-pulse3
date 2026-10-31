import React, { useState } from 'react';
import { SAMPLE_NOTICES } from '../utils/storage.js';

export default function SmartInput({ onExtract, isExtracting, error }) {
  const [text, setText] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const maxLength = 3000;
  const isTooLong = text.length > maxLength;
  const canExtract = text.trim().length > 0 && !isTooLong && !isExtracting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canExtract) return;
    onExtract(text.trim());
  };

  const handleSelectSample = (sample) => {
    setText(sample.text);
    setShowSamples(false);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <section aria-labelledby="input-section-title" className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 id="input-section-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>✨</span> Extract from Notice
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Paste any unformatted campus announcement to generate a structured event card.
          </p>
        </div>

        {/* Try a sample button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSamples((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[44px]"
            aria-expanded={showSamples}
            aria-haspopup="true"
          >
            <span>💡</span>
            <span>Try a sample notice</span>
            <span className="text-[10px]">{showSamples ? '▲' : '▼'}</span>
          </button>

          {showSamples && (
            <div
              className="absolute right-0 mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-20 space-y-1"
              role="menu"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select a sample:
              </div>
              {SAMPLE_NOTICES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:bg-slate-100 focus:outline-none"
                  role="menuitem"
                >
                  <p className="font-semibold text-slate-900">{sample.label}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sample.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="notice-input" className="sr-only">
            Paste campus notice text
          </label>
          <textarea
            id="notice-input"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste WhatsApp message, email, or circular text here... (e.g., 'Google tech talk on Friday at 3pm in Mech Audi, refreshments provided')"
            className={`w-full rounded-xl border p-3.5 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              isTooLong
                ? 'border-red-400 focus:ring-red-500 bg-red-50/30'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            disabled={isExtracting}
            aria-invalid={isTooLong}
            aria-describedby="char-count notice-hint"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs">
            <span
              id="char-count"
              className={`font-mono ${isTooLong ? 'text-red-600 font-bold' : 'text-slate-500'}`}
            >
              {text.length} / {maxLength} characters
            </span>
            {text.length > 0 && !isExtracting && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-700 underline focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-1 min-h-[32px]"
              >
                Clear text
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="submit"
              disabled={!canExtract}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-all min-h-[44px] ${
                canExtract
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isExtracting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Extract Event</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2 mt-2"
          >
            <span className="text-red-600 font-bold" aria-hidden="true">
              ⚠️
            </span>
            <div className="flex-1">
              <p className="font-semibold">Unable to extract event</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Live region for accessibility */}
        <div aria-live="polite" className="sr-only">
          {isExtracting && 'Extracting event details from text using AI...'}
        </div>
      </form>
    </section>
  );
}
