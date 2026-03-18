export type AllowedCountry = {
  code: string;
  name: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  CA: "Canada",
  US: "United States",
  GB: "United Kingdom",
  FR: "France",
  AU: "Australia",
  NZ: "New Zealand",
  DE: "Germany",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
};

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  CA: "CAD",
  US: "USD",
  GB: "GBP",
  FR: "EUR",
  AU: "AUD",
  NZ: "NZD",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
};

export const DEFAULT_ALLOWED_COUNTRIES: AllowedCountry[] = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
];

export function normalizeCountryCode(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function countryNameFromCode(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

export function getCurrencyForCountry(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);
  return COUNTRY_CURRENCY_MAP[normalized] ?? "USD";
}

export function normalizeAllowedCountries(value: unknown): AllowedCountry[] {
  if (!Array.isArray(value)) {
    return DEFAULT_ALLOWED_COUNTRIES;
  }

  const normalized = value
    .map((entry) => {
      if (typeof entry === "string") {
        const code = normalizeCountryCode(entry);
        if (!code) return null;
        return { code, name: countryNameFromCode(code) };
      }

      if (!entry || typeof entry !== "object") {
        return null;
      }

      const code = normalizeCountryCode((entry as { code?: string }).code);
      if (!code) {
        return null;
      }

      const rawName = (entry as { name?: string }).name;
      const name =
        typeof rawName === "string" && rawName.trim().length > 0
          ? rawName.trim()
          : countryNameFromCode(code);

      return { code, name };
    })
    .filter((entry): entry is AllowedCountry => Boolean(entry));

  const deduped = normalized.filter(
    (entry, index, arr) =>
      arr.findIndex((item) => item.code === entry.code) === index,
  );

  return deduped.length > 0 ? deduped : DEFAULT_ALLOWED_COUNTRIES;
}
