import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./env.js";
import { supabase } from "./supabase.js";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

/**
 * Menyisipkan access token Supabase pada setiap request.
 *
 * `getSession` menyegarkan token yang sudah kedaluwarsa secara otomatis, jadi
 * tidak perlu lagi membaca token mentah dari localStorage seperti versi lama.
 */
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface ApiErrorBody {
  message?: string;
  code?: string;
  issues?: Array<{ path: string; message: string }>;
}

/** Mengambil pesan yang layak ditampilkan dari error apa pun. */
export function toErrorMessage(error: unknown, fallback = "Terjadi kesalahan."): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;

    if (body?.issues?.length) {
      return body.issues[0]?.message ?? fallback;
    }

    return body?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
