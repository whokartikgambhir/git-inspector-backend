// external dependencies
import { validate } from 'class-validator';
import { Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';

// internal dependencies
import { STATUS_CODES } from '../common/constants.js';
import { ClassType, ValidatedRequest } from '../common/types.js';

/**
 * Middleware to validate request body against a DTO class
 * Attaches the validated DTO to req.validatedBody if valid
 * 
 * @param dtoClass - The class type of the DTO to validate against
 * @template T - The type of the DTO class
 * @returns A middleware function that validates the request body
 */
export const validateRequest = <T extends object>(dtoClass: ClassType<T>) => {
  return async (req: ValidatedRequest<T>, res: Response, next: NextFunction): Promise<void> => {
    // convert plain request body to an instance of the DTO class
    const dtoObj = plainToInstance(dtoClass, req.body);
    // validate DTO instance using class-validator
    const errors = await validate(dtoObj);

    if (errors.length > 0) {
      // flatten all constraint messages for a readable error response
      const messages = errors
        .flatMap(err => Object.values(err.constraints || {}))
        .join('; ');
      res.status(STATUS_CODES.BAD_REQUEST).json({ error: messages });
      return;
    }

    // optionally attach validated DTO to request for controller use
    req.validatedBody = dtoObj;

    next();
  };
};
