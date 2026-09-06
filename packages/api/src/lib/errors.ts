/**
 * Error domain dengan status HTTP.
 * Controller melempar ini, satu error handler menerjemahkannya ke response,
 * sehingga tidak ada lagi `res.status(500)` yang diulang di setiap try/catch.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = "app_error") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan.") {
    super(404, message, "not_found");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  readonly issues: Array<{ path: string; message: string }>;

  constructor(issues: Array<{ path: string; message: string }>) {
    super(400, "Data yang dikirim tidak valid.", "validation_error");
    this.name = "ValidationError";
    this.issues = issues;
  }
}
