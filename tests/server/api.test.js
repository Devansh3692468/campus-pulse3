import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server/app.js';
import { clearCache } from '../../server/utils/cache.js';

// ── Mock the Gemini service ───────────────────────────────────────────────────
vi.mock('../../server/services/gemini.js', () => ({
  extractEvent: vi.fn(),
  generateDigest: vi.fn(),
}));

import { extractEvent, generateDigest } from '../../server/services/gemini.js';

const VALID_EVENT = {
  title: 'Tech Talk by Google',
  date: '2026-11-05',
  time: '14:00',
  venue: 'Auditorium A',
  category: 'Event',
  description: 'Google engineers talk about AI tools for students.',
};

const TODAY = '2026-11-01';

// ── /api/extract ──────────────────────────────────────────────────────────────
describe('POST /api/extract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  it('returns 200 with event data on valid input', async () => {
    extractEvent.mockResolvedValueOnce(VALID_EVENT);

    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'Google Tech Talk on Nov 5 at 2pm in Auditorium A.', today: TODAY });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      title: expect.any(String),
      category: expect.any(String),
    });
    expect(extractEvent).toHaveBeenCalledOnce();
  });

  it('returns cached result on identical text (Gemini not called twice)', async () => {
    extractEvent.mockResolvedValue(VALID_EVENT);

    const payload = { text: 'Repeated notice text for cache test.', today: TODAY };
    await request(app).post('/api/extract').send(payload);
    const res = await request(app).post('/api/extract').send(payload);

    expect(res.status).toBe(200);
    expect(extractEvent).toHaveBeenCalledTimes(1); // second hit is from cache
  });

  it('returns 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ today: TODAY });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(extractEvent).not.toHaveBeenCalled();
  });

  it('returns 400 when today is missing', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'Some notice.' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when text exceeds 3000 characters', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'a'.repeat(3001), today: TODAY });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when today has wrong format', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'Some notice.', today: '01-11-2026' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 and no stack trace when Gemini throws', async () => {
    extractEvent.mockRejectedValueOnce(new Error('Gemini API error'));

    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'Some notice.', today: TODAY });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('stack');
    expect(JSON.stringify(res.body)).not.toContain('GEMINI_API_KEY');
  });

  it('returns 500 when AI returns malformed output', async () => {
    // extractEvent itself validates AI output and throws on bad data
    extractEvent.mockRejectedValueOnce(new Error('AI returned unexpected structure for extract'));

    const res = await request(app)
      .post('/api/extract')
      .send({ text: 'Some notice.', today: TODAY });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });
});

// ── /api/digest ───────────────────────────────────────────────────────────────
describe('POST /api/digest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const VALID_EVENTS = [
    { title: 'Event A', date: '2026-11-02', category: 'Event' },
    { title: 'Event B', date: '2026-11-10', category: 'Academic' },
  ];

  it('returns 200 with digest on valid input', async () => {
    generateDigest.mockResolvedValueOnce('Urgent: Event A tomorrow. This week: nothing else. Later: Event B.');

    const res = await request(app)
      .post('/api/digest')
      .send({ events: VALID_EVENTS, today: TODAY });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('digest');
    expect(typeof res.body.digest).toBe('string');
  });

  it('returns 400 when events is missing', async () => {
    const res = await request(app)
      .post('/api/digest')
      .send({ today: TODAY });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when events array is empty', async () => {
    const res = await request(app)
      .post('/api/digest')
      .send({ events: [], today: TODAY });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when events array exceeds 50 items', async () => {
    const oversized = Array.from({ length: 51 }, (_, i) => ({ title: `Event ${i}` }));

    const res = await request(app)
      .post('/api/digest')
      .send({ events: oversized, today: TODAY });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when today is missing', async () => {
    const res = await request(app)
      .post('/api/digest')
      .send({ events: VALID_EVENTS });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 and no stack trace when Gemini throws', async () => {
    generateDigest.mockRejectedValueOnce(new Error('Gemini API error'));

    const res = await request(app)
      .post('/api/digest')
      .send({ events: VALID_EVENTS, today: TODAY });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('stack');
  });

  it('returns 500 when AI returns malformed digest', async () => {
    generateDigest.mockRejectedValueOnce(new Error('AI returned unexpected structure for digest'));

    const res = await request(app)
      .post('/api/digest')
      .send({ events: VALID_EVENTS, today: TODAY });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });
});
