export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSuccessResponse {
  success: true;
  message: string;
  data: AuthUser;
}

export interface MessageResponse {
  success: true;
  message: string;
  data?: {
    expiresInMinutes?: number;
    email?: string;
  };
}
