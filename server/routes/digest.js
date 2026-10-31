import { Router } from 'express';
import { digestRequestSchema } from '../utils/schemas.js';
import { generateDigest } from '../services/gemini.js';

const router = Router();

router.post('/', async (req, res, next) => {
  // 1. Validate request body
  const parsed = digestRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues.map((i) => i.message).join('; '),
      code: 'VALIDATION_ERROR',
    });
  }

  const { events, today } = parsed.data;

  // 2. Call Gemini
  try {
    const digest = await generateDigest(events, today);
    return res.json({ digest });
  } catch (err) {
    return next(err);
  }
});

export default router;
