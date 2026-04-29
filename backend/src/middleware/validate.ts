import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Express middleware factory.
 * Usage: router.post('/path', validate(MySchema), handler)
 * Parses req.body against the schema; on failure returns 400 with field errors.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }
    // Replace body with the parsed (type-safe, stripped) value
    req.body = result.data;
    next();
  };
}
