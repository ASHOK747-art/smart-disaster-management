/**
 * Wraps an async route handler so thrown/rejected errors are forwarded to
 * Express's error-handling middleware instead of crashing the process or
 * requiring a try/catch in every controller.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
