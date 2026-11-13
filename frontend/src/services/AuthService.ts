import api from "./axios";
import API_BASE_URL from "../api";
import type { AuthResponse, User } from "../types/auth";

const API_URL = `${API_BASE_URL}/auth`;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: "MAN" | "WOMAN";
  avatarUrl?: string | null;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export async function registerUser(data: RegisterData) {
  return api.post<RegisterResponse>(`${API_URL}/register`, data);
}

export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  return api.post<AuthResponse>(`${API_URL}/login`, {
    email,
    password,
    rememberMe,
  });
}

export async function logoutUser() {
  return api.post(`${API_URL}/logout`);
}

export async function forgotPasswordUser(email: string) {
  return api.post(`${API_URL}/forgot-password`, { email });
}

export async function resetPasswordUser(token: string, password: string) {
  return api.post(`${API_URL}/reset-password`, {
    token,
    password,
  });
}
