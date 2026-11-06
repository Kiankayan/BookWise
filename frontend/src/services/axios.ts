import axios, { type InternalAxiosRequestConfig } from "axios";
import API_BASE_URL from "../api";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

async function refreshAccessToken(): Promise<string> {
  const response = await refreshApi.post("/auth/refresh");

  const newToken = response.data.token;

  localStorage.setItem("bookwise-token", newToken);

  return newToken;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bookwise-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      window.dispatchEvent(new Event("auth:session-expired"));

      return Promise.reject(refreshError);
    }
  },
);

export default api;
