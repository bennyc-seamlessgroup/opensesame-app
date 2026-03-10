export const HONG_KONG_DISTRICTS = [
  "Central & Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
] as const;

export const HONG_KONG_AREAS = [
  "Central",
  "Causeway Bay",
  "Wan Chai",
  "Tsim Sha Tsui",
  "Jordan",
  "Mong Kok",
  "Sham Shui Po",
  "Quarry Bay",
  "Kennedy Town",
  "Sai Ying Pun",
  "Admiralty",
  "Sheung Wan",
  "Tseung Kwan O",
  "Sha Tin",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
] as const;

const AREA_TO_DISTRICT: Record<string, string> = {
  Central: "Central & Western",
  "Causeway Bay": "Wan Chai",
  "Wan Chai": "Wan Chai",
  "Sham Shui Po": "Sham Shui Po",
  "Mong Kok": "Yau Tsim Mong",
  Jordan: "Yau Tsim Mong",
  "Tsim Sha Tsui": "Yau Tsim Mong",
  Admiralty: "Central & Western",
  "Sheung Wan": "Central & Western",
  "Sai Ying Pun": "Central & Western",
  "Kennedy Town": "Central & Western",
  "Quarry Bay": "Eastern",
  "Tseung Kwan O": "Sai Kung",
  "Sha Tin": "Sha Tin",
  "Tsuen Wan": "Tsuen Wan",
  "Tuen Mun": "Tuen Mun",
  "Yuen Long": "Yuen Long",
};

export const HONG_KONG_LOCATION_OPTIONS = Array.from(
  new Set<string>([...HONG_KONG_AREAS, ...HONG_KONG_DISTRICTS])
);

export function matchesHongKongLocation(area: string, selected: string | null) {
  if (!selected) return true;
  if (area === selected) return true;
  const district = AREA_TO_DISTRICT[area];
  return district === selected;
}
