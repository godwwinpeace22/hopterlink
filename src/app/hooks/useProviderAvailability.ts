import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  buildAvailabilityDay,
  buildCanonicalAvailability,
  buildDefaultWeeklyAvailability,
  buildUnavailableWeeklyAvailability,
  hasConfiguredAvailability,
  normalizeAvailability,
  type AvailabilitySettings,
  type AvailabilityRange,
} from "@/lib/providerAvailability";

export {
  normalizeAvailability,
  buildAvailabilityDay,
  buildCanonicalAvailability,
  buildDefaultWeeklyAvailability,
  buildUnavailableWeeklyAvailability,
  hasConfiguredAvailability,
  buildAvailabilityStartTimes,
  formatAvailabilitySummary,
  formatAvailabilityTimeLabel,
  getWeekdayFromDateKey,
  resolveAvailabilityForDate,
  toDateKey,
  type AvailabilityDay,
  type AvailabilityDates,
  type AvailabilityRange,
  type AvailabilitySettings,
  type NormalizedAvailability,
} from "@/lib/providerAvailability";

export function useProviderAvailability(userId?: string | null) {
  const query = useQuery({
    queryKey: ["provider-availability", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("availability")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data?.availability ?? null;
    },
    enabled: Boolean(userId),
  });

  const normalizedAvailability = useMemo(
    () => normalizeAvailability(query.data),
    [query.data],
  );

  return {
    availability: normalizedAvailability,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}
