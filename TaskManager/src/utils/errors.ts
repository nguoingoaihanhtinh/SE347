// src/utils/errors.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  status: string;

  constructor(error: { message: string; statusCode: number; status: string }) {
    super(error.message);
    this.statusCode = error.statusCode;
    this.status = error.status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor({ message = "Bad request", statusCode = 400, status = "BAD_REQUEST" }) {
    super({ message, statusCode, status });
  }
}

export class UnauthorizedError extends AppError {
  constructor({ message = "Unauthorized", statusCode = 401, status = "UNAUTHORIZED" }) {
    super({ message, statusCode, status });
  }
}

export class ForbiddenError extends AppError {
  constructor({ message = "Forbidden", statusCode = 403, status = "FORBIDDEN" }) {
    super({ message, statusCode, status });
  }
}

export class NotFoundError extends AppError {
  constructor({ message = "Resource not found", statusCode = 404, status = "NOT_FOUND" }) {
    super({ message, statusCode, status });
  }
}

export class ConflictError extends AppError {
  constructor({ message = "Conflict", statusCode = 409, status = "CONFLICT" }) {
    super({ message, statusCode, status });
  }
}

export class ValidationError extends AppError {
  constructor({ message = "Validation error", statusCode = 422, status = "VALIDATION_ERROR" }) {
    super({ message, statusCode, status });
  }
}

export class TooManyRequestsError extends AppError {
  constructor({ message = "Too many requests", statusCode = 429, status = "TOO_MANY_REQUESTS" }) {
    super({ message, statusCode, status });
  }
}

export class InternalServerError extends AppError {
  constructor({ message = "Internal server error", statusCode = 500, status = "INTERNAL_SERVER_ERROR" }) {
    super({ message, statusCode, status });
  }
}

export class JWTError extends AppError {
  constructor({ message = "JWT Error", statusCode = 401, status = "JWT_ERROR" }) {
    super({ message, statusCode, status });
  }
}
