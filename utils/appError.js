class AppError extends Error {
  constructor(message, statusCode, error = undefined) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(this.statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.fullError = error;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
