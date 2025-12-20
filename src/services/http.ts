import axios, { type AxiosAdapter, type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL as string | undefined;
const TOKEN_KEY = "auth_token";
let AUTH_TOKEN: string | null = null;

export type HttpCacheConfig = {
  enabled?: boolean;
  ttlMs?: number;
  tags?: string[];
  invalidateTags?: string[];
};

declare module "axios" {
  export interface AxiosRequestConfig {
    cache?: HttpCacheConfig;
  }
}

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}
export function getAuthToken() {
  return AUTH_TOKEN;
}
export function clearAuthToken() {
  AUTH_TOKEN = null;
}

type CacheEntry = {
  expiresAt: number;
  response: AxiosResponse;
};

const cacheEntries = new Map<string, CacheEntry>();
const cacheKeyTags = new Map<string, string[]>();
const cacheTagKeys = new Map<string, Set<string>>();

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function buildCacheKey(config: AxiosRequestConfig): string {
  const method = (config.method ?? "get").toLowerCase();
  const base = config.baseURL ?? "";
  const url = config.url ?? "";
  const params = config.params ? stableStringify(config.params) : "";
  return `${method}:${base}${url}?${params}`;
}

function removeCacheKey(key: string) {
  cacheEntries.delete(key);
  const tags = cacheKeyTags.get(key) ?? [];
  cacheKeyTags.delete(key);
  for (const tag of tags) {
    const keys = cacheTagKeys.get(tag);
    if (!keys) continue;
    keys.delete(key);
    if (keys.size === 0) cacheTagKeys.delete(tag);
  }
}

export function invalidateCacheTags(tags: string[]) {
  const uniq = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
  for (const tag of uniq) {
    const keys = cacheTagKeys.get(tag);
    if (!keys) continue;
    for (const key of Array.from(keys)) removeCacheKey(key);
    cacheTagKeys.delete(tag);
  }
}

function createHttp(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  const resolveDefaultAdapter = (): AxiosAdapter | undefined => {
    const raw = instance.defaults.adapter as unknown;
    if (typeof raw === "function") return raw as AxiosAdapter;

    const axiosAny = axios as unknown as { getAdapter?: (adapter: unknown) => unknown };
    if (typeof axiosAny.getAdapter === "function") {
      try {
        const resolved = axiosAny.getAdapter(raw);
        if (typeof resolved === "function") return resolved as AxiosAdapter;
      } catch {
      }
    }

    if (Array.isArray(raw)) {
      for (const candidate of raw) {
        if (typeof candidate === "function") return candidate as AxiosAdapter;
        if (typeof axiosAny.getAdapter === "function") {
          try {
            const resolved = axiosAny.getAdapter(candidate);
            if (typeof resolved === "function") return resolved as AxiosAdapter;
          } catch {
          }
        }
      }
    }

    return undefined;
  };

  const defaultAdapter = resolveDefaultAdapter();
  if (defaultAdapter) {
    instance.defaults.adapter = async (config) => {
      const method = (config.method ?? "get").toLowerCase();
      const cache = config.cache;
      const enabled = cache?.enabled !== false;
      const tags = (cache?.tags ?? []).map((t) => t.trim()).filter(Boolean);
      const ttlMs = cache?.ttlMs ?? 30_000;
      const canCache = enabled && method === "get" && ttlMs > 0 && tags.length > 0;

      const key = canCache ? buildCacheKey(config) : null;
      if (key) {
        const hit = cacheEntries.get(key);
        if (hit) {
          if (hit.expiresAt > Date.now()) {
            return { ...hit.response, config };
          }
          removeCacheKey(key);
        }
      }

      const res = await defaultAdapter(config);
      if (key) {
        const entry: CacheEntry = { expiresAt: Date.now() + ttlMs, response: { ...res, config } };
        cacheEntries.set(key, entry);
        cacheKeyTags.set(key, tags);
        for (const tag of tags) {
          const set = cacheTagKeys.get(tag) ?? new Set<string>();
          set.add(key);
          cacheTagKeys.set(tag, set);
        }
      }
      return res;
    };
  }

  instance.interceptors.request.use((config) => {
    const token = getAuthToken() ?? localStorage.getItem(TOKEN_KEY) ?? undefined;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = token;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      const tags = res.config.cache?.invalidateTags;
      if (tags?.length) invalidateCacheTags(tags);
      return res;
    },
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
