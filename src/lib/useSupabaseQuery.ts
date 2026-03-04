import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export function useSupabaseQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: () => PromiseLike<PostgrestSingleResponse<TData>>,
  options?: Omit<
    UseQueryOptions<PostgrestSingleResponse<TData>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}
