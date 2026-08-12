import { NextResponse } from "next/server";

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return NextResponse.json(body, { status });
}

export function apiError(
  message: string,
  code = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) {
  const body: ApiResponseError = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}
