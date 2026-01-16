/**
 * Validation Middleware
 *
 * Reusable validation middleware for request handling.
 */

import { Request, Response, NextFunction } from 'express';
import { MusicProvider } from '@iuly/iuly-models';
import { ResponseHandler } from '../responseHandler';

const VALID_PROVIDERS = [MusicProvider.Spotify, MusicProvider.AppleMusic];

/**
 * Validates conversion request body has required fields and valid providers.
 * Works with both regular endpoints and SSE streaming endpoints.
 */
export function validateConversionRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { sourceProvider, targetProvider, playlistUrl } = req.body;

  // Check required fields
  if (!sourceProvider || !targetProvider || !playlistUrl) {
    sendValidationError(res, 'Missing required fields: sourceProvider, targetProvider, playlistUrl');
    return;
  }

  // Validate source provider
  if (!VALID_PROVIDERS.includes(sourceProvider)) {
    sendValidationError(res, `Invalid sourceProvider. Must be one of: ${VALID_PROVIDERS.join(', ')}`);
    return;
  }

  // Validate target provider
  if (!VALID_PROVIDERS.includes(targetProvider)) {
    sendValidationError(res, `Invalid targetProvider. Must be one of: ${VALID_PROVIDERS.join(', ')}`);
    return;
  }

  // Validate providers are different
  if (sourceProvider === targetProvider) {
    sendValidationError(res, 'sourceProvider and targetProvider must be different');
    return;
  }

  next();
}

/**
 * Validates session ID exists on request.
 */
export function validateSession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.sessionID) {
    sendValidationError(res, 'Session ID missing');
    return;
  }
  next();
}

/**
 * Validates request body has a required field.
 */
export function requireBodyField(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body[fieldName]) {
      sendValidationError(res, `${fieldName} is required`);
      return;
    }
    next();
  };
}

/**
 * Helper to send validation error in appropriate format.
 * Detects if response expects JSON or SSE.
 */
function sendValidationError(res: Response, message: string): void {
  // Check if headers already sent (SSE might have started)
  if (res.headersSent) {
    return;
  }

  // For SSE endpoints, we need to check Accept header
  // But validation happens before SSE headers are set, so we use JSON
  ResponseHandler.badRequest(res, message);
}
