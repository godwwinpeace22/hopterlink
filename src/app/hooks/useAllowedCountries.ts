import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_ALLOWED_COUNTRIES,
  normalizeAllowedCountries,
  type AllowedCountry,
} from "@/app/lib/countryConfig";

type AppSettingsRow = {
  value: unknown;
};

export function useAllowedCountries() {
  const query = useQuery({
    queryKey: ["app_settings", "allowed_countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "allowed_countries")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as AppSettingsRow | null)?.value ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allowedCountries: AllowedCountry[] = query.data
    ? normalizeAllowedCountries(query.data)
    : DEFAULT_ALLOWED_COUNTRIES;

  return {
    ...query,
    allowedCountries,
  };
}
