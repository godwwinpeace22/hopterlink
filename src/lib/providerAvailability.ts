export type AvailabilityRange = {
  start: string;
  end: string;
};

export type AvailabilityMode = "all_day" | "custom" | "unavailable";

export type AvailabilityWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type AvailabilityDay = {
  mode: AvailabilityMode;
  ranges: AvailabilityRange[];
};

export type AvailabilityDates = Record<string, AvailabilityDay>;
export type AvailabilityWeekly = Record<AvailabilityWeekday, AvailabilityDay>;

export type AvailabilitySettings = {
  timezone: string;
  recurring: boolean;
};

export type NormalizedAvailability = {
  version: number;
  timezone: string;
  weekly: AvailabilityWeekly;
  dates: AvailabilityDates;
  settings: AvailabilitySettings;
  hasExplicitAvailability: boolean;
};

export type AvailabilityStartTimeOption = {
  value: string;
  label: string;
};

export type CanonicalAvailabilityPayload = {
  version: number;
  timezone: string;
  weekly: AvailabilityWeekly;
  dates: AvailabilityDates;
  recurring: boolean;
  settings: AvailabilitySettings;
};

export const DEFAULT_TIMEZONE = "Africa/Lagos";
export const LEGACY_DEFAULT_RANGE: AvailabilityRange = {
  start: "09:00",
  end: "17:00",
};
export const ALL_DAY_RANGE: AvailabilityRange = {
  start: "00:00",
  end: "24:00",
};

export const AVAILABILITY_WEEKDAYS: AvailabilityWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const standardTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const timeWith24EndPattern = /^(?:(?:[01]\d|2[0-3]):[0-5]\d|24:00)$/;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isRangeShape = (
  value: unknown,
): value is { start: string; end: string; available?: boolean } => {
  if (!isObjectRecord(value)) return false;
  return typeof value.start === "string" && typeof value.end === "string";
};

const isWeekday = (value: string): value is AvailabilityWeekday =>
  AVAILABILITY_WEEKDAYS.includes(value as AvailabilityWeekday);

const normalizeWeekdayKey = (value: string): AvailabilityWeekday | null => {
  const normalized = value.trim().toLowerCase();
  if (isWeekday(normalized)) {
    return normalized;
  }

  const numericValue = Number(normalized);
  if (
    Number.isInteger(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 6
  ) {
    const mapped = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][numericValue];
    return mapped as AvailabilityWeekday;
  }

  return null;
};

const timeToMinutes = (value: string, allow24End = false) => {
  const pattern = allow24End ? timeWith24EndPattern : standardTimePattern;
  if (!pattern.test(value)) {
    return null;
  }

  if (value === "24:00") {
    return allow24End ? 24 * 60 : null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (value: number) => {
  const safeValue = Math.max(0, Math.min(value, 24 * 60));
  if (safeValue === 24 * 60) {
    return "24:00";
  }

  const hours = Math.floor(safeValue / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (safeValue % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const compareRanges = (left: AvailabilityRange, right: AvailabilityRange) => {
  const leftMinutes = timeToMinutes(left.start);
  const rightMinutes = timeToMinutes(right.start);
  return (leftMinutes ?? 0) - (rightMinutes ?? 0);
};

const mergeRanges = (ranges: AvailabilityRange[]) => {
  const sorted = [...ranges].sort(compareRanges);
  const merged: AvailabilityRange[] = [];

  for (const range of sorted) {
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end, true);
    if (
      startMinutes == null ||
      endMinutes == null ||
      endMinutes <= startMinutes
    ) {
      continue;
    }

    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ start: range.start, end: range.end });
      continue;
    }

    const previousEndMinutes = timeToMinutes(previous.end, true);
    if (previousEndMinutes != null && startMinutes <= previousEndMinutes) {
      if (endMinutes > previousEndMinutes) {
        previous.end = range.end;
      }
      continue;
    }

    merged.push({ start: range.start, end: range.end });
  }

  return merged;
};

const normalizeRanges = (ranges: AvailabilityRange[]) => {
  const normalized = mergeRanges(
    ranges.filter((range) => {
      const startMinutes = timeToMinutes(range.start);
      const endMinutes = timeToMinutes(range.end, true);
      return (
        startMinutes != null && endMinutes != null && endMinutes > startMinutes
      );
    }),
  );

  if (
    normalized.length === 1 &&
    normalized[0].start === ALL_DAY_RANGE.start &&
    normalized[0].end === ALL_DAY_RANGE.end
  ) {
    return [{ ...ALL_DAY_RANGE }];
  }

  return normalized;
};

const buildDay = (
  mode: AvailabilityMode,
  ranges: AvailabilityRange[],
): AvailabilityDay => {
  if (mode === "unavailable") {
    return { mode, ranges: [] };
  }

  const normalizedRanges = normalizeRanges(ranges);
  if (
    normalizedRanges.length === 1 &&
    normalizedRanges[0].start === ALL_DAY_RANGE.start &&
    normalizedRanges[0].end === ALL_DAY_RANGE.end
  ) {
    return { mode: "all_day", ranges: [{ ...ALL_DAY_RANGE }] };
  }

  if (normalizedRanges.length === 0) {
    return { mode: "unavailable", ranges: [] };
  }

  return {
    mode: mode === "all_day" ? "all_day" : "custom",
    ranges: normalizedRanges,
  };
};

export const buildAvailabilityDay = (
  mode: AvailabilityMode,
  ranges: AvailabilityRange[] = [],
) => buildDay(mode, ranges);

const buildDefaultDay = (): AvailabilityDay => ({
  mode: "all_day",
  ranges: [{ ...ALL_DAY_RANGE }],
});

export const buildUnavailableDay = (): AvailabilityDay => ({
  mode: "unavailable",
  ranges: [],
});

export const buildDefaultWeeklyAvailability = (): AvailabilityWeekly =>
  AVAILABILITY_WEEKDAYS.reduce<AvailabilityWeekly>((acc, weekday) => {
    acc[weekday] = buildDefaultDay();
    return acc;
  }, {} as AvailabilityWeekly);

export const buildUnavailableWeeklyAvailability = (): AvailabilityWeekly =>
  AVAILABILITY_WEEKDAYS.reduce<AvailabilityWeekly>((acc, weekday) => {
    acc[weekday] = buildUnavailableDay();
    return acc;
  }, {} as AvailabilityWeekly);

const slotMapToRanges = (slots: Record<string, unknown>) => {
  const enabled = Object.entries(slots)
    .filter(([, rawValue]) => Boolean(rawValue))
    .map(([key]) => key)
    .filter((key) => standardTimePattern.test(key))
    .sort(
      (left, right) => (timeToMinutes(left) ?? 0) - (timeToMinutes(right) ?? 0),
    );

  if (enabled.length === 0) {
    return [] as AvailabilityRange[];
  }

  const ranges: AvailabilityRange[] = [];
  let currentStart = enabled[0];
  let previous = enabled[0];

  for (let index = 1; index < enabled.length; index += 1) {
    const next = enabled[index];
    const previousMinutes = timeToMinutes(previous);
    const nextMinutes = timeToMinutes(next);
    const diff =
      previousMinutes == null || nextMinutes == null
        ? null
        : nextMinutes - previousMinutes;

    if (diff !== 30 && diff !== 60) {
      const previousEnd = minutesToTime((previousMinutes ?? 0) + 60);
      ranges.push({ start: currentStart, end: previousEnd });
      currentStart = next;
    }

    previous = next;
  }

  const previousMinutes = timeToMinutes(previous) ?? 0;
  ranges.push({
    start: currentStart,
    end: minutesToTime(previousMinutes + 60),
  });
  return normalizeRanges(ranges);
};

const parseLegacyDay = (value: unknown): AvailabilityDay | null => {
  if (value == null || value === false) {
    return { mode: "unavailable", ranges: [] };
  }

  if (value === true) {
    return buildDay("custom", [{ ...LEGACY_DEFAULT_RANGE }]);
  }

  if (Array.isArray(value)) {
    const ranges = value.filter(isRangeShape).map((range) => ({
      start: range.start,
      end: range.end,
    }));
    return buildDay("custom", ranges);
  }

  if (!isObjectRecord(value)) {
    return null;
  }

  if (typeof value.mode === "string") {
    const mode = value.mode.trim().toLowerCase() as AvailabilityMode;
    const rawRanges = Array.isArray(value.ranges)
      ? value.ranges.filter(isRangeShape).map((range) => ({
          start: range.start,
          end: range.end,
        }))
      : [];

    if (mode === "all_day") {
      return buildDay(
        "all_day",
        rawRanges.length > 0 ? rawRanges : [{ ...ALL_DAY_RANGE }],
      );
    }

    if (mode === "custom") {
      return buildDay("custom", rawRanges);
    }

    if (mode === "unavailable") {
      return { mode: "unavailable", ranges: [] };
    }
  }

  if (isRangeShape(value)) {
    if (value.available === false) {
      return { mode: "unavailable", ranges: [] };
    }

    return buildDay("custom", [{ start: value.start, end: value.end }]);
  }

  const slots = isObjectRecord(value.slots) ? value.slots : value;
  const ranges = slotMapToRanges(slots);
  return ranges.length > 0
    ? buildDay("custom", ranges)
    : { mode: "unavailable", ranges: [] };
};

const getTimezone = (root: Record<string, unknown>) => {
  if (typeof root.timezone === "string" && root.timezone.trim()) {
    return root.timezone.trim();
  }

  if (
    isObjectRecord(root.settings) &&
    typeof root.settings.timezone === "string"
  ) {
    const timezone = root.settings.timezone.trim();
    if (timezone) {
      return timezone;
    }
  }

  return DEFAULT_TIMEZONE;
};

const getRecurring = (root: Record<string, unknown>) => {
  if (typeof root.recurring === "boolean") {
    return root.recurring;
  }

  if (
    isObjectRecord(root.settings) &&
    typeof root.settings.recurring === "boolean"
  ) {
    return root.settings.recurring;
  }

  return false;
};

export const buildCanonicalAvailability = (params?: {
  timezone?: string;
  recurring?: boolean;
  weekly?: Partial<Record<AvailabilityWeekday, AvailabilityDay>>;
  dates?: Record<string, AvailabilityDay>;
}): CanonicalAvailabilityPayload => {
  const timezone = params?.timezone?.trim() || DEFAULT_TIMEZONE;
  const recurring = params?.recurring ?? false;
  const weekly = buildUnavailableWeeklyAvailability();

  for (const weekday of AVAILABILITY_WEEKDAYS) {
    const sourceDay = params?.weekly?.[weekday];
    if (!sourceDay) {
      continue;
    }

    weekly[weekday] = buildAvailabilityDay(sourceDay.mode, sourceDay.ranges);
  }

  const dates = Object.entries(params?.dates ?? {}).reduce<AvailabilityDates>(
    (acc, [dateKey, sourceDay]) => {
      if (!dateKeyPattern.test(dateKey)) {
        return acc;
      }

      acc[dateKey] = buildAvailabilityDay(sourceDay.mode, sourceDay.ranges);
      return acc;
    },
    {},
  );

  return {
    version: 2,
    timezone,
    weekly,
    dates,
    recurring,
    settings: {
      timezone,
      recurring,
    },
  };
};

export const hasConfiguredAvailability = (raw: unknown) => {
  if (!isObjectRecord(raw)) {
    return false;
  }

  if (isObjectRecord(raw.weekly)) {
    const normalized = normalizeAvailability(raw);
    return (
      AVAILABILITY_WEEKDAYS.some(
        (weekday) => normalized.weekly[weekday].mode !== "unavailable",
      ) ||
      Object.values(normalized.dates).some((day) => day.mode !== "unavailable")
    );
  }

  const source =
    isObjectRecord(raw.dates) && Object.keys(raw.dates).length > 0
      ? raw.dates
      : raw;

  return Object.keys(source).length > 0;
};

export const normalizeAvailability = (raw: unknown): NormalizedAvailability => {
  const weekly = buildDefaultWeeklyAvailability();
  const dates: AvailabilityDates = {};

  if (!isObjectRecord(raw)) {
    return {
      version: 2,
      timezone: DEFAULT_TIMEZONE,
      weekly,
      dates,
      settings: { timezone: DEFAULT_TIMEZONE, recurring: false },
      hasExplicitAvailability: false,
    };
  }

  const timezone = getTimezone(raw);
  const recurring = getRecurring(raw);
  let hasExplicitAvailability = false;

  if (isObjectRecord(raw.weekly)) {
    hasExplicitAvailability =
      Object.keys(raw.weekly).length > 0 || hasExplicitAvailability;
    for (const [key, value] of Object.entries(raw.weekly)) {
      const weekday = normalizeWeekdayKey(key);
      if (!weekday) continue;
      const parsedDay = parseLegacyDay(value);
      if (!parsedDay) continue;
      weekly[weekday] = parsedDay;
    }
  }

  const rawDates = isObjectRecord(raw.dates) ? raw.dates : raw;
  for (const [key, value] of Object.entries(rawDates)) {
    if (!dateKeyPattern.test(key)) {
      continue;
    }
    const parsedDay = parseLegacyDay(value);
    if (!parsedDay) {
      continue;
    }
    dates[key] = parsedDay;
    hasExplicitAvailability = true;
  }

  return {
    version: typeof raw.version === "number" ? raw.version : 2,
    timezone,
    weekly,
    dates,
    settings: { timezone, recurring },
    hasExplicitAvailability,
  };
};

export const resolveAvailabilityForDate = (
  availability: NormalizedAvailability,
  date: Date | string,
) => {
  const dateKey = typeof date === "string" ? date : toDateKey(date);
  if (!dateKey) {
    return buildDefaultDay();
  }

  const override = availability.dates[dateKey];
  if (override) {
    return override;
  }

  const weekday = getWeekdayFromDateKey(dateKey);
  return weekday
    ? (availability.weekly[weekday] ?? buildDefaultDay())
    : buildDefaultDay();
};

export const toDateKey = (date: Date | null | undefined) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getWeekdayFromDateKey = (
  dateKey: string,
): AvailabilityWeekday | null => {
  if (!dateKeyPattern.test(dateKey)) {
    return null;
  }

  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return isWeekday(weekday) ? weekday : null;
};

export const formatAvailabilityTimeLabel = (value: string) => {
  const minutes = timeToMinutes(value, true);
  if (minutes == null) {
    return value;
  }

  const normalizedMinutes = minutes === 24 * 60 ? 23 * 60 + 59 : minutes;
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatAvailabilitySummary = (day: AvailabilityDay) => {
  if (day.mode === "unavailable") {
    return "Unavailable";
  }

  if (day.mode === "all_day") {
    return "Open all day";
  }

  return day.ranges
    .map(
      (range) =>
        `${formatAvailabilityTimeLabel(range.start)} - ${formatAvailabilityTimeLabel(range.end)}`,
    )
    .join(", ");
};

export const buildAvailabilityStartTimes = (
  day: AvailabilityDay,
  durationHours: number,
  stepMinutes = 30,
): AvailabilityStartTimeOption[] => {
  if (day.mode === "unavailable") {
    return [];
  }

  const durationMinutes = Math.round(durationHours * 60);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return [];
  }

  const options: AvailabilityStartTimeOption[] = [];
  for (const range of day.ranges) {
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end, true);
    if (startMinutes == null || endMinutes == null) {
      continue;
    }

    for (
      let slotMinutes = startMinutes;
      slotMinutes + durationMinutes <= endMinutes;
      slotMinutes += stepMinutes
    ) {
      const value = minutesToTime(slotMinutes);
      options.push({ value, label: formatAvailabilityTimeLabel(value) });
    }
  }

  return options;
};
