import { NextResponse } from "next/server";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function successResponse<T>(
  data: T,
  message = "Request completed successfully",
  status = 200,
  pagination?: PaginationMeta
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      ...(pagination ? { pagination } : {}),
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, any>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
