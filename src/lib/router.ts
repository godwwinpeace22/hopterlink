/**
 * React-Router-DOM compatibility shim over TanStack Router.
 *
 * Existing components import from here instead of 'react-router-dom'.
 * This keeps the migration incremental — components can later switch to
 * native TanStack Router APIs for full type-safety.
 */

import {
  Link as TSLink,
  Outlet as TSOutlet,
  Navigate as TSNavigate,
  useLocation as tsUseLocation,
  useNavigate as tsUseNavigate,
  useParams as tsUseParams,
  useSearch as tsUseSearch,
} from "@tanstack/react-router";

// Re-exports that are API-compatible
export const Link = TSLink;
export const Outlet = TSOutlet;
export const Navigate = TSNavigate;

// useLocation — map TanStack shape to React-Router shape
export function useLocation() {
  const loc = tsUseLocation();
  return {
    pathname: loc.pathname,
    search: loc.searchStr ?? "",
    hash: loc.hash,
    state: (loc as any).state,
    key: "",
  };
}

// useNavigate — accept the (path, opts?) signature from React-Router
export function useNavigate() {
  const nav = tsUseNavigate();
  return (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    nav({
      to,
      replace: options?.replace,
      state: options?.state,
    } as any);
  };
}

// useParams — generic untyped version matching React-Router
export function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  return tsUseParams({ strict: false }) as unknown as T;
}

// useSearchParams — wraps TanStack's useSearch into the [URLSearchParams, setter] tuple
export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams) => void,
] {
  const search = tsUseSearch({ strict: false }) as Record<string, string>;
  const nav = tsUseNavigate();

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }

  const setParams = (next: URLSearchParams) => {
    const obj: Record<string, string> = {};
    next.forEach((v, k) => {
      obj[k] = v;
    });
    nav({ search: obj as any, replace: true } as any);
  };

  return [params, setParams];
}
