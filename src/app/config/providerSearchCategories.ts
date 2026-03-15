/**
 * Static fallback list — used as defaults while the database query loads.
 * The authoritative list comes from the `service_categories` DB table
 * via the `useServiceCategories` hook.
 */
export const ALL_SERVICES_CATEGORY = "All Services";

export const PROVIDER_SEARCH_CATEGORIES = [
  ALL_SERVICES_CATEGORY,
  "Graphics Design",
  "UI/UX Design",
  "Web Development",
  "Product Design",
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Painting",
  "Landscaping",
  "Carpentry",
  "Snow Clearing",
  "Handyman",
  "Auto Services",
  "Childcare",
  "Tutoring",
  "Moving Help",
  "Personal Care",
  "HVAC",
  "General Contractor",
] as const;
