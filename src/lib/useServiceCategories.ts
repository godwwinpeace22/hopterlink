import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

const ALL_SERVICES_LABEL = "All Services";

async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, name, slug, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Returns active service categories from the database.
 * - `categories`: all active categories (no "All Services")
 * - `categoryNames`: display names array (no "All Services")
 * - `categoryNamesWithAll`: display names array starting with "All Services"
 * - `categorySlugs`: slug array (no "all")
 * - `categorySlugsWithAll`: slug array starting with "all"
 * - `slugToName` / `nameToSlug`: lookup maps
 */
export function useServiceCategories() {
  const query = useQuery({
    queryKey: ["service_categories"],
    queryFn: fetchServiceCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categories = query.data ?? [];

  const categoryNames = categories.map((c) => c.name);
  const categoryNamesWithAll = [ALL_SERVICES_LABEL, ...categoryNames];

  const categorySlugs = categories.map((c) => c.slug);
  const categorySlugsWithAll = ["all", ...categorySlugs];

  const slugToName = new Map<string, string>(
    categories.map((c) => [c.slug, c.name]),
  );
  slugToName.set("all", ALL_SERVICES_LABEL);

  const nameToSlug = new Map<string, string>(
    categories.map((c) => [c.name, c.slug]),
  );
  nameToSlug.set(ALL_SERVICES_LABEL, "all");

  return {
    categories,
    categoryNames,
    categoryNamesWithAll,
    categorySlugs,
    categorySlugsWithAll,
    slugToName,
    nameToSlug,
    isLoading: query.isLoading,
    ALL_SERVICES_LABEL,
  };
}
