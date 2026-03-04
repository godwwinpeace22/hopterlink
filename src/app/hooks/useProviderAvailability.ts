import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type AvailabilityRange = {
  start: string;
  end: string;
};

export type AvailabilityDates = Record<string, AvailabilityRange[]>;

export type AvailabilitySettings = {
  timezone: string;
  recurring: boolean;
};

const defaultRange: AvailabilityRange = {
  start: "09:00",
  end: "17:00",
};

const defaultSettings: AvailabilitySettings = {
  timezone: "Africa/Lagos",
  recurring: false,
};

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

const isRangeShape = (
  value: unknown,
): value is { start: string; end: string; available?: boolean } => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return "start" in value && "end" in value;
};

const slotsToRange = (
  slots: Record<string, boolean>,
): AvailabilityRange | null => {
  const enabled = Object.entries(slots)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key)
    .sort();

  if (enabled.length === 0) {
    return null;
  }

  const start = enabled[0];
  const last = enabled[enabled.length - 1];
  const [hour, minute] = last.split(":").map(Number);
  const endDate = new Date();
  endDate.setHours(hour, minute, 0, 0);
  endDate.setHours(endDate.getHours() + 1);
  const end = `${endDate.getHours().toString().padStart(2, "0")}:${endDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return { start, end };
};

const normalizeDates = (rawDates: Record<string, unknown>) => {
  return Object.entries(rawDates).reduce<AvailabilityDates>(
    (acc, [key, value]) => {
      if (!dateKeyPattern.test(key)) {
        return acc;
      }

      if (value === null || value === false) {
        acc[key] = [];
        return acc;
      }

      if (value === true) {
        acc[key] = [{ ...defaultRange }];
        return acc;
      }

      if (Array.isArray(value)) {
        const ranges = value
          .filter((item) => isRangeShape(item))
          .map((item) => ({
            start:
              typeof item.start === "string" ? item.start : defaultRange.start,
            end: typeof item.end === "string" ? item.end : defaultRange.end,
          }));
        acc[key] = ranges;
        return acc;
      }

      if (isRangeShape(value)) {
        const start =
          typeof value.start === "string" ? value.start : defaultRange.start;
        const end =
          typeof value.end === "string" ? value.end : defaultRange.end;
        const available =
          typeof value.available === "boolean" ? value.available : true;
        acc[key] = available ? [{ start, end }] : [];
        return acc;
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        const map = value as Record<string, unknown>;
        if (
          "slots" in map &&
          map.slots &&
          typeof map.slots === "object" &&
          !Array.isArray(map.slots)
        ) {
          const range = slotsToRange(map.slots as Record<string, boolean>);
          acc[key] = range ? [range] : [];
          return acc;
        }
        const range = slotsToRange(
          Object.entries(map).reduce<Record<string, boolean>>(
            (slots, [slotKey, slotValue]) => {
              slots[slotKey] = Boolean(slotValue);
              return slots;
            },
            {},
          ),
        );
        acc[key] = range ? [range] : [];
        return acc;
      }

      return acc;
    },
    {},
  );
};

export const normalizeAvailability = (
  raw: unknown,
): { dates: AvailabilityDates; settings: AvailabilitySettings } => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { dates: {}, settings: { ...defaultSettings } };
  }

  const root = raw as Record<string, unknown>;
  const settings: AvailabilitySettings = {
    timezone:
      typeof root.timezone === "string" && root.timezone
        ? root.timezone
        : defaultSettings.timezone,
    recurring:
      typeof root.recurring === "boolean"
        ? root.recurring
        : defaultSettings.recurring,
  };

  const datesSource =
    root.dates && typeof root.dates === "object" && !Array.isArray(root.dates)
      ? (root.dates as Record<string, unknown>)
      : root;

  return {
    dates: normalizeDates(datesSource),
    settings,
  };
};

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

  const [dates, setDates] = useState<AvailabilityDates>(
    normalizedAvailability.dates,
  );
  const [settings, setSettings] = useState<AvailabilitySettings>(
    normalizedAvailability.settings,
  );

  useEffect(() => {
    setDates(normalizedAvailability.dates);
    setSettings(normalizedAvailability.settings);
  }, [normalizedAvailability]);

  return {
    dates,
    setDates,
    settings,
    setSettings,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}
