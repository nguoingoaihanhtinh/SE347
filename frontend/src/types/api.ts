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
  if (error instanceof Error) return error.message;

  const apiError = error as ApiError;
  return apiError?.response?.data?.message || "An unexpected error occurred";
}
