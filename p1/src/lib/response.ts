import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, type ErrorCode } from "./errors";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function ok<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  const payload: ApiSuccessResponse<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };
  return NextResponse.json(payload, { status });
}

export function fail(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof AppError) {
    const errorObj: ApiErrorDetail =
      err.details !== undefined
        ? { code: err.code, message: err.message, details: err.details }
        : { code: err.code, message: err.message };

    return NextResponse.json(
      { success: false, error: errorObj },
      { status: err.statusCode }
    );
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: details[0]?.message ?? "입력값 검증에 실패했습니다.",
          details,
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "서버 내부 오류가 발생했습니다.",
      },
    },
    { status: 500 }
  );
}

export function withErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: unknown) {
      return fail(error);
    }
  };
}
