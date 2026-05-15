// =============================================================================
// API Types — matches Rust backend response structures
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
