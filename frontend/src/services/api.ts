import axios from 'axios';
import type {
  AuthSuccessResponse,
  MessageResponse,
} from '../types/auth';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  // Render free tier may cold-start; allow a bit longer than local
  timeout: 30000,
});

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSuccessResponse> {
  const { data } = await api.post<AuthSuccessResponse>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthSuccessResponse> {
  const { data } = await api.post<AuthSuccessResponse>('/auth/login', payload);
  return data;
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>('/auth/forgot-password', { email });
  return data;
}

export async function verifyResetToken(token: string): Promise<MessageResponse> {
  const { data } = await api.get<MessageResponse>(`/auth/verify-reset-token/${token}`);
  return data;
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>('/auth/reset-password', payload);
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Something went wrong';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
