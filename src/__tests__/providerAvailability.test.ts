import { describe, test, expect } from "bun:test";
import {
  buildCanonicalAvailability,
  buildAvailabilityStartTimes,
  hasConfiguredAvailability,
  normalizeAvailability,
  resolveAvailabilityForDate,
} from "@/lib/providerAvailability";

describe("normalizeAvailability", () => {
  test("returns implicit all-day weekly schedule for null", () => {
    const result = normalizeAvailability(null);
    expect(result.dates).toEqual({});
    expect(result.settings.timezone).toBe("Africa/Lagos");
    expect(result.settings.recurring).toBe(false);
    expect(result.weekly.monday.mode).toBe("all_day");
    expect(result.hasExplicitAvailability).toBe(false);
  });

  test("returns empty dates for non-object input", () => {
    expect(normalizeAvailability("string").dates).toEqual({});
    expect(normalizeAvailability(42).dates).toEqual({});
    expect(normalizeAvailability([1, 2]).dates).toEqual({});
  });

  test("parses custom timezone and recurring settings", () => {
    const result = normalizeAvailability({
      timezone: "America/Toronto",
      recurring: true,
    });
    expect(result.settings.timezone).toBe("America/Toronto");
    expect(result.settings.recurring).toBe(true);
  });

  test("parses canonical weekly day states", () => {
    const result = normalizeAvailability({
      timezone: "America/Toronto",
      weekly: {
        monday: { mode: "custom", ranges: [{ start: "10:00", end: "14:00" }] },
        tuesday: { mode: "unavailable", ranges: [] },
      },
    });

    expect(result.weekly.monday.mode).toBe("custom");
    expect(result.weekly.tuesday.mode).toBe("unavailable");
    expect(result.hasExplicitAvailability).toBe(true);
  });

  test("date set to true uses legacy 09:00-17:00 range", () => {
    const result = normalizeAvailability({
      dates: { "2026-03-15": true },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "custom",
      ranges: [{ start: "09:00", end: "17:00" }],
    });
  });

  test("date set to false produces empty array", () => {
    const result = normalizeAvailability({
      dates: { "2026-03-15": false },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "unavailable",
      ranges: [],
    });
  });

  test("date set to null produces empty array", () => {
    const result = normalizeAvailability({
      dates: { "2026-03-15": null },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "unavailable",
      ranges: [],
    });
  });

  test("date with range object uses start/end values", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": { start: "10:00", end: "14:00" },
      },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "custom",
      ranges: [{ start: "10:00", end: "14:00" }],
    });
  });

  test("date with range object and available: false produces empty", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": { start: "10:00", end: "14:00", available: false },
      },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "unavailable",
      ranges: [],
    });
  });

  test("date with array of ranges", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": [
          { start: "08:00", end: "12:00" },
          { start: "13:00", end: "17:00" },
        ],
      },
    });
    expect(result.dates["2026-03-15"].ranges).toHaveLength(2);
    expect(result.dates["2026-03-15"].ranges[0].start).toBe("08:00");
    expect(result.dates["2026-03-15"].ranges[1].start).toBe("13:00");
  });

  test("date with slots object converts to range", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": {
          slots: {
            "09:00": true,
            "10:00": true,
            "11:00": true,
            "12:00": false,
          },
        },
      },
    });
    const ranges = result.dates["2026-03-15"].ranges;
    expect(ranges).toHaveLength(1);
    expect(ranges[0].start).toBe("09:00");
    expect(ranges[0].end).toBe("12:00");
  });

  test("date with all-false slots produces empty array", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": {
          slots: { "09:00": false, "10:00": false },
        },
      },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "unavailable",
      ranges: [],
    });
  });

  test("ignores non-date keys", () => {
    const result = normalizeAvailability({
      dates: {
        "not-a-date": true,
        timezone: "test",
        "2026-03-15": true,
      },
    });
    expect(Object.keys(result.dates)).toEqual(["2026-03-15"]);
  });

  test("reads dates from root level if no dates key", () => {
    const result = normalizeAvailability({
      "2026-03-15": true,
      "2026-03-16": { start: "10:00", end: "15:00" },
    });
    expect(result.dates["2026-03-15"]).toEqual({
      mode: "custom",
      ranges: [{ start: "09:00", end: "17:00" }],
    });
    expect(result.dates["2026-03-16"]).toEqual({
      mode: "custom",
      ranges: [{ start: "10:00", end: "15:00" }],
    });
  });

  test("handles bare slot map without slots wrapper", () => {
    const result = normalizeAvailability({
      dates: {
        "2026-03-15": { "09:00": true, "10:00": true, "14:00": false },
      },
    });
    const ranges = result.dates["2026-03-15"].ranges;
    expect(ranges).toHaveLength(1);
    expect(ranges[0].start).toBe("09:00");
  });

  test("resolves weekly availability when no date override exists", () => {
    const normalized = normalizeAvailability({
      weekly: {
        thursday: {
          mode: "custom",
          ranges: [{ start: "11:00", end: "15:00" }],
        },
      },
    });

    expect(resolveAvailabilityForDate(normalized, "2026-03-12")).toEqual({
      mode: "custom",
      ranges: [{ start: "11:00", end: "15:00" }],
    });
  });

  test("builds 30-minute start times that fit the selected duration", () => {
    const options = buildAvailabilityStartTimes(
      { mode: "custom", ranges: [{ start: "09:00", end: "12:00" }] },
      2,
    );

    expect(options.map((option) => option.value)).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  test("builds canonical payloads with recurring settings", () => {
    expect(
      buildCanonicalAvailability({
        timezone: "America/Toronto",
        recurring: true,
        weekly: {
          monday: {
            mode: "custom",
            ranges: [{ start: "09:00", end: "17:00" }],
          },
        },
      }),
    ).toMatchObject({
      version: 2,
      timezone: "America/Toronto",
      recurring: true,
      settings: {
        timezone: "America/Toronto",
        recurring: true,
      },
      dates: {},
      weekly: {
        monday: {
          mode: "custom",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
      },
    });
  });

  test("detects canonical weekly availability only when some day is available", () => {
    expect(
      hasConfiguredAvailability({
        weekly: {
          monday: { mode: "unavailable", ranges: [] },
          tuesday: { mode: "unavailable", ranges: [] },
          wednesday: { mode: "unavailable", ranges: [] },
          thursday: { mode: "unavailable", ranges: [] },
          friday: { mode: "unavailable", ranges: [] },
          saturday: { mode: "unavailable", ranges: [] },
          sunday: { mode: "unavailable", ranges: [] },
        },
        dates: {},
      }),
    ).toBe(false);

    expect(
      hasConfiguredAvailability({
        weekly: {
          monday: {
            mode: "custom",
            ranges: [{ start: "09:00", end: "17:00" }],
          },
        },
      }),
    ).toBe(true);
  });
});
