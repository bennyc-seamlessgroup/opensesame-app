export type SearchSort = "熱門" | "最新" | "高評分" | "高回贈" | "附近";
export type SearchServiceMode = "堂食" | "外賣" | "全部";

export type SearchFilters = {
  keyword: string;
  area: string | null;
  cuisine: string | null;
  sort: SearchSort;
  serviceMode: SearchServiceMode;
  priceRange: "$" | "$$" | "$$$" | "$$$$" | null;
  highRewardOnly: boolean;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  keyword: "",
  area: null, // null means "any" (nearby is handled as a quick chip in UI)
  cuisine: null,
  sort: "熱門",
  serviceMode: "全部",
  priceRange: null,
  highRewardOnly: false,
};

export function isDefaultSearchFilters(filters: SearchFilters) {
  return (
    filters.keyword.trim() === "" &&
    filters.area == null &&
    filters.cuisine == null &&
    filters.sort === DEFAULT_SEARCH_FILTERS.sort &&
    filters.serviceMode === DEFAULT_SEARCH_FILTERS.serviceMode &&
    filters.priceRange == null &&
    filters.highRewardOnly === false
  );
}

export function getSearchSummary(filters: SearchFilters, extraTokens: string[] = []) {
  const tokens: string[] = [];

  if (filters.area) tokens.push(filters.area);
  if (filters.cuisine) tokens.push(filters.cuisine);
  if (filters.serviceMode !== "全部") tokens.push(filters.serviceMode);
  if (filters.sort !== "熱門") tokens.push(filters.sort);
  if (filters.priceRange) tokens.push(filters.priceRange);
  if (filters.highRewardOnly) tokens.push("高回贈");

  for (const token of extraTokens) {
    if (!token) continue;
    if (tokens.includes(token)) continue;
    tokens.push(token);
  }

  const visible = tokens.slice(0, 2);
  const remaining = Math.max(0, tokens.length - visible.length);
  const text = visible.join(" • ");
  return remaining > 0 ? `${text} +${remaining}` : text;
}

export function parseSearchFiltersFromParams(params: URLSearchParams): SearchFilters {
  const get = (key: string) => (params.get(key) || "").trim();

  const keyword = get("keyword");
  const areaRaw = get("area");
  const cuisineRaw = get("cuisine");
  const sortRaw = get("sort") as SearchSort;
  const serviceRaw = get("service") as SearchServiceMode;
  const priceRaw = (get("price") as SearchFilters["priceRange"]) || "";
  const highRewardOnly = get("highReward") === "1";

  const sort: SearchSort = ["熱門", "最新", "高評分", "高回贈", "附近"].includes(sortRaw) ? sortRaw : "熱門";
  const serviceMode: SearchServiceMode = ["堂食", "外賣", "全部"].includes(serviceRaw) ? serviceRaw : "全部";
  const priceRange: SearchFilters["priceRange"] = ["$", "$$", "$$$", "$$$$"].includes(priceRaw) ? (priceRaw as any) : null;

  return {
    keyword,
    area: areaRaw ? areaRaw : null,
    cuisine: cuisineRaw ? cuisineRaw : null,
    sort,
    serviceMode,
    priceRange,
    highRewardOnly,
  };
}

export function toSearchParams(filters: SearchFilters) {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.area) params.set("area", filters.area);
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.sort !== "熱門") params.set("sort", filters.sort);
  if (filters.serviceMode !== "全部") params.set("service", filters.serviceMode);
  if (filters.priceRange) params.set("price", filters.priceRange);
  if (filters.highRewardOnly) params.set("highReward", "1");

  return params;
}

