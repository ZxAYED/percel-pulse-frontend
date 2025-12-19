import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL as string | undefined;
const TOKEN_KEY = "auth_token";
let AUTH_TOKEN: string | null = null;

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}
export function getAuthToken() {
  return AUTH_TOKEN;
}
export function clearAuthToken() {
  AUTH_TOKEN = null;
}

function createHttp(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = getAuthToken() ?? localStorage.getItem(TOKEN_KEY) ?? undefined;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = token;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        clearAuthToken();
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("auth_role");
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const http = createHttp();

export function withAbort(config?: AxiosRequestConfig) {
  const controller = new AbortController();
  return { ...config, signal: controller.signal, controller };
}
