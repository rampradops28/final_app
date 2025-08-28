import { QueryClient } from "@tanstack/react-query";
import  mockApiRequest  from "../lib/mockApi.js";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Force-enable mocks for frontend-only behavior. Switch to env later if needed.
const USE_MOCKS = true;

function normalizeToPathname(url) {
  if (typeof url !== "string") return "/api";
  if (url.startsWith("/")) return url;
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

export async function apiRequest(method, url, data) {
  const pathname = normalizeToPathname(url);
  const isApi = pathname.startsWith("/api");
  const useMock = USE_MOCKS && isApi;
  const res = useMock
    ? await mockApiRequest(method, pathname, data)
    : await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = ({ on401 }) => {
  return async ({ queryKey }) => {
    const url = queryKey.join("/");
    const pathname = normalizeToPathname(url);
    const isApi = pathname.startsWith("/api");

    const useMock = USE_MOCKS && isApi;
    const res = useMock
      ? await mockApiRequest("GET", pathname, null)
      : await fetch(url, { credentials: "include" });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
