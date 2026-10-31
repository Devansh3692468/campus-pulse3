import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import SmartInput from './components/SmartInput.jsx';
import EditableEventCard from './components/EditableEventCard.jsx';
import NeedsAttentionBanner from './components/NeedsAttentionBanner.jsx';
import SavedEventList from './components/SavedEventList.jsx';
import {
  loadEvents,
  saveEvents,
  generateEventId,
  SAMPLE_NOTICES,
} from './utils/storage.js';
import { getTodayString } from './utils/date.js';

export default function App() {
  const [events, setEvents] = useState(() => loadEvents());
  const [extractedEvent, setExtractedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [announcement, setAnnouncement] = useState('');

  const editableCardRef = useRef(null);
  const savedListRef = useRef(null);

  // Sync events to localStorage on change
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  // Handle extracting from notice text
  const handleExtract = async (text) => {
    setIsExtracting(true);
    setExtractError(null);
    setAnnouncement('Extracting notice details with AI...');

    try {
      const today = getTodayString();
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, today }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract event from notice');
      }

      // Assign temporary ID
      const newEvent = {
        id: generateEventId(),
        ...data,
      };

      setExtractedEvent(newEvent);
      setEditingEvent(null);
      setAnnouncement(`Event "${newEvent.title}" extracted. Review and save below.`);

      // Smooth scroll to review card
      setTimeout(() => {
        editableCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractError(
        err.message || 'Something went wrong while analyzing the notice. Please try again.'
      );
      setAnnouncement('Failed to extract event. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save freshly extracted event
  const handleSaveExtracted = (eventToSave) => {
    setEvents((prev) => [eventToSave, ...prev]);
    setExtractedEvent(null);
    setAnnouncement(`Event "${eventToSave.title}" saved to your list.`);
  };

  // Discard extracted card
  const handleDiscardExtracted = () => {
    setExtractedEvent(null);
    setAnnouncement('Extracted event discarded.');
  };

  // Start editing a saved event
  const handleStartEdit = (event) => {
    setEditingEvent(event);
    setExtractedEvent(null);
    setTimeout(() => {
      editableCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Save changes to an existing event
  const handleUpdateSaved = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
    );
    setEditingEvent(null);
    setAnnouncement(`Event "${updatedEvent.title}" updated.`);
  };

  // Delete event
  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
    }
    setAnnouncement('Event deleted.');
  };

  // Handle focus urgent events
  const handleFocusUrgent = () => {
    setStatusFilter('Urgent');
    setAnnouncement('Showing urgent notices.');
    setTimeout(() => {
      savedListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle user clicking "Try a sample notice" from empty state
  const handleTrySample = () => {
    const sample = SAMPLE_NOTICES[0];
    handleExtract(sample.text);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Screen reader announcement region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Needs attention today banner */}
        <NeedsAttentionBanner
          events={events}
          onFocusUrgent={handleFocusUrgent}
        />

        {/* Smart Input Form */}
        <SmartInput
          onExtract={handleExtract}
          isExtracting={isExtracting}
          error={extractError}
        />

        {/* Review / Edit Extracted Event Card */}
        {extractedEvent && (
          <div ref={editableCardRef}>
            <EditableEventCard
              initialEvent={extractedEvent}
              onSave={handleSaveExtracted}
              onCancel={handleDiscardExtracted}
              isEditingSaved={false}
            />
          </div>
        )}

        {/* Edit Existing Saved Event Card */}
        {editingEvent && (
          <div ref={editableCardRef}>
            <EditableEventCard
              initialEvent={editingEvent}
              onSave={handleUpdateSaved}
              onCancel={() => setEditingEvent(null)}
              isEditingSaved={true}
            />
          </div>
        )}

        {/* Saved Events List */}
        <div ref={savedListRef}>
          <SavedEventList
            events={events}
            onEditEvent={handleStartEdit}
            onDeleteEvent={handleDeleteEvent}
            onTrySample={handleTrySample}
            activeStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4">
          <p className="font-medium text-slate-700">Campus Pulse &bull; AI-Powered Notice Tracker</p>
          <p className="mt-1">All event data is saved locally on your device in localStorage.</p>
        </div>
      </footer>
    </div>
  );
}
