// src/types/api.ts
export interface ApiErrorResponse {
  success: false;
  status_code: number;
  status: string;
  message: string;
  stack?: string;
}

export type ApiError = {
  response?: {
    data: ApiErrorResponse;
  };
  message?: string;
};

export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  // Check axios error response first (before generic Error)
  const apiError = error as ApiError;
  if (apiError?.response?.data?.message) {
    return apiError.response.data.message;
  }

  // Fallback to generic error message
  if (error instanceof Error) return error.message;

  return "Đã có lỗi xảy ra";
}
