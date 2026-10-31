import { z } from 'zod';

// ── /api/extract ──────────────────────────────────────────────────────────────
export const extractRequestSchema = z.object({
  text: z
    .string({ required_error: 'text is required' })
    .min(1, 'text must not be empty')
    .max(3000, 'text must be at most 3000 characters'),
  today: z
    .string({ required_error: 'today is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
});

// Zod schema to validate the AI model's JSON output for /api/extract
export const extractAiResponseSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  venue: z.string().nullable(),
  category: z.enum(['Academic', 'Deadline', 'Event', 'Club', 'Sports', 'Placement', 'Other']),
  description: z.string().max(200),
});

// ── /api/digest ───────────────────────────────────────────────────────────────
const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const digestRequestSchema = z.object({
  events: z
    .array(eventSchema)
    .min(1, 'events must not be empty')
    .max(50, 'events must be at most 50 items'),
  today: z
    .string({ required_error: 'today is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
});

// Zod schema to validate the AI model's JSON output for /api/digest
export const digestAiResponseSchema = z.object({
  digest: z.string().min(1).max(600),
});
