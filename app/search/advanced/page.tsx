import { AdvancedSearchClient } from "./search-advanced-client";

export default async function AdvancedSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const asString = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || "";

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = asString(value);
    if (!v) continue;
    query.set(key, v);
  }

  return <AdvancedSearchClient initialQuery={query.toString()} />;
}

