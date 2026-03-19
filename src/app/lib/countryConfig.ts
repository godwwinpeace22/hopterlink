export type AllowedCountry = {
  code: string;
  name: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  AE: "United Arab Emirates",
  AR: "Argentina",
  AT: "Austria",
  CA: "Canada",
  AU: "Australia",
  BE: "Belgium",
  BR: "Brazil",
  CH: "Switzerland",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  CZ: "Czech Republic",
  DE: "Germany",
  DK: "Denmark",
  EG: "Egypt",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GH: "Ghana",
  GR: "Greece",
  HK: "Hong Kong",
  HU: "Hungary",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IN: "India",
  IT: "Italy",
  JP: "Japan",
  KE: "Kenya",
  KR: "South Korea",
  KW: "Kuwait",
  MA: "Morocco",
  MX: "Mexico",
  MY: "Malaysia",
  NG: "Nigeria",
  NL: "Netherlands",
  NO: "Norway",
  NZ: "New Zealand",
  PE: "Peru",
  PH: "Philippines",
  PK: "Pakistan",
  PL: "Poland",
  PT: "Portugal",
  QA: "Qatar",
  RO: "Romania",
  SA: "Saudi Arabia",
  SE: "Sweden",
  SG: "Singapore",
  TH: "Thailand",
  TR: "Turkey",
  UA: "Ukraine",
  US: "United States",
  VN: "Vietnam",
  ZA: "South Africa",
};

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  AE: "AED",
  AR: "ARS",
  AT: "EUR",
  CA: "CAD",
  AU: "AUD",
  BE: "EUR",
  BR: "BRL",
  CH: "CHF",
  CL: "CLP",
  CN: "CNY",
  CO: "COP",
  CZ: "CZK",
  DE: "EUR",
  DK: "DKK",
  EG: "EGP",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GB: "GBP",
  GH: "GHS",
  GR: "EUR",
  HK: "HKD",
  HU: "HUF",
  ID: "IDR",
  IE: "EUR",
  IL: "ILS",
  IN: "INR",
  IT: "EUR",
  JP: "JPY",
  KE: "KES",
  KR: "KRW",
  KW: "KWD",
  MA: "MAD",
  MX: "MXN",
  MY: "MYR",
  NG: "NGN",
  NL: "EUR",
  NO: "NOK",
  NZ: "NZD",
  PE: "PEN",
  PH: "PHP",
  PK: "PKR",
  PL: "PLN",
  PT: "EUR",
  QA: "QAR",
  RO: "RON",
  SA: "SAR",
  SE: "SEK",
  SG: "SGD",
  TH: "THB",
  TR: "TRY",
  UA: "UAH",
  US: "USD",
  VN: "VND",
  ZA: "ZAR",
};

const COUNTRY_DIAL_CODE_MAP: Record<string, string> = {
  AE: "+971",
  AR: "+54",
  AT: "+43",
  AU: "+61",
  BE: "+32",
  BR: "+55",
  CA: "+1",
  CH: "+41",
  CL: "+56",
  CN: "+86",
  CO: "+57",
  CZ: "+420",
  DE: "+49",
  DK: "+45",
  EG: "+20",
  ES: "+34",
  FI: "+358",
  FR: "+33",
  GB: "+44",
  GH: "+233",
  GR: "+30",
  HK: "+852",
  HU: "+36",
  ID: "+62",
  IE: "+353",
  IL: "+972",
  IN: "+91",
  IT: "+39",
  JP: "+81",
  KE: "+254",
  KR: "+82",
  KW: "+965",
  MA: "+212",
  MX: "+52",
  MY: "+60",
  NG: "+234",
  NL: "+31",
  NO: "+47",
  NZ: "+64",
  PE: "+51",
  PH: "+63",
  PK: "+92",
  PL: "+48",
  PT: "+351",
  QA: "+974",
  RO: "+40",
  SA: "+966",
  SE: "+46",
  SG: "+65",
  TH: "+66",
  TR: "+90",
  UA: "+380",
  US: "+1",
  VN: "+84",
  ZA: "+27",
};

export const KNOWN_COUNTRIES: AllowedCountry[] = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

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

export function getDialCodeForCountry(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);
  return COUNTRY_DIAL_CODE_MAP[normalized] ?? "+1";
}

export function withCountryDialCode(
  phone: string,
  countryCode: string,
): string {
  const dialCode = getDialCodeForCountry(countryCode);
  const trimmed = phone.trim();

  if (!trimmed) {
    return `${dialCode} `;
  }

  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  return `${dialCode} ${trimmed}`;
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
