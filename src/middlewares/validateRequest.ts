// external dependencies
import { plainToInstance } from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';
import { RequestHandler, Response, NextFunction } from 'express';

// internal dependencies
import { STATUS_CODES } from '../common/constants';
import { ClassType, ValidatedRequest } from '../common/types';

/**
 * Middleware to sanitize and validate request data against a DTO class
 * Sanitizes req.body, req.query, and req.params by trimming and removing dangerous characters,
 * then validates against the provided DTO, attaching the validated object to req.validatedBody
 * Attaches the validated DTO to req.validatedBody if valid
 *
 * @param dtoClass - DTO class to validate against
 * @param options - class-validator options (whitelist, transform, etc.)
 * @returns A middleware function that validates the request body
 */
export const validateRequest = <T extends object>(
  dtoClass: ClassType<T>,
  options: ValidatorOptions = { whitelist: true }
): RequestHandler => {
  return async (
    req: ValidatedRequest<T>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Sanitization: trim and remove potentially dangerous chars
    const sanitize = (obj?: Record<string, string>) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'string') {
          let sanitized = val.trim();
          // remove < > " ' ` ; ( ) \ characters
          sanitized = sanitized.replace(/[<>"'`;()\\]/g, '');
          obj[key] = sanitized;
        }
      }
    };
    sanitize(req.body);
    sanitize(req.query as Record<string, string>);
    sanitize(req.params as Record<string, string>);

    // Validation
    const dtoObj = plainToInstance(dtoClass, {
      ...req.params,
      ...req.query,
      ...req.body,
    });
    const errors = await validate(dtoObj, options);
    if (errors.length > 0) {
      const messages = errors
        .flatMap(err => Object.values(err.constraints || {}))
        .join('; ');
      res.status(STATUS_CODES.BAD_REQUEST).json({ error: messages });
      return;
    }

    // Attach the validated and sanitized DTO
    req.validatedBody = dtoObj;

    next();
  };
};
