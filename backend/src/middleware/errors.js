export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === "ZodError") {
    return res.status(400).json({ message: "Validation failed", errors: error.errors });
  }
  res.status(error.status || 500).json({ message: error.message || "Internal server error" });
}
