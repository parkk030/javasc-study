export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "EXTERNAL_WEBHOOK_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const Errors = {
  validation(message: string, details?: unknown): AppError {
    return new AppError("VALIDATION_ERROR", message, 400, details);
  },
  unauthorized(message = "로그인이 필요한 요청입니다."): AppError {
    return new AppError("UNAUTHORIZED", message, 401);
  },
  forbidden(message = "접근 권한이 없습니다."): AppError {
    return new AppError("FORBIDDEN", message, 403);
  },
  notFound(message = "요청한 리소스를 찾을 수 없습니다."): AppError {
    return new AppError("NOT_FOUND", message, 404);
  },
  conflict(message = "이미 존재하는 리소스입니다."): AppError {
    return new AppError("CONFLICT", message, 409);
  },
  webhook(message: string, details?: unknown): AppError {
    return new AppError("EXTERNAL_WEBHOOK_ERROR", message, 502, details);
  },
  internal(message = "서버 내부 오류가 발생했습니다."): AppError {
    return new AppError("INTERNAL_ERROR", message, 500);
  },
};
