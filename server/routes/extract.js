import { Router } from 'express';
import { extractRequestSchema } from '../utils/schemas.js';
import { hashText, getCached, setCached } from '../utils/cache.js';
import { extractEvent } from '../services/gemini.js';

const router = Router();

router.post('/', async (req, res, next) => {
  // 1. Validate request body
  const parsed = extractRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues.map((i) => i.message).join('; '),
      code: 'VALIDATION_ERROR',
    });
  }

  const { text, today } = parsed.data;

  // 2. Check cache (keyed by hash of text only — same text always extracts the same event)
  const cacheKey = hashText(text);
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // 3. Call Gemini
  try {
    const event = await extractEvent(text, today);
    setCached(cacheKey, event);
    return res.json(event);
  } catch (err) {
    return next(err);
  }
});

export default router;
