/**
 * Use this for any expected failure (validation, not found, unauthorized, etc.)
 * so the central error handler can respond with the right status code and a
 * safe, predictable message instead of leaking stack traces.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
