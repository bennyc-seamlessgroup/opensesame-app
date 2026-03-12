import { foodIntents, restaurants, reviews, type FoodIntent, type Restaurant, type Review } from "@/lib/mock-data";

export type ChatRole = "user" | "assistant";

export type ChatApiMessage = {
  role: ChatRole;
  content: string;
};

export type ChatApiResponse = {
  reply: string;
  cards: ChatCardRef[];
};

export type ChatCardRef = {
  type: "restaurant" | "food" | "foodie";
  id: string;
};

export const OPENROUTER_MODEL = "google/gemma-3-27b-it:free";
export const OPENROUTER_FALLBACK_MODELS = [
  OPENROUTER_MODEL,
  "meta-llama/llama-3.1-8b-instruct:free",
] as const;
export const MOONSHOT_FALLBACK_MODELS = [
  process.env.MOONSHOT_MODEL || "kimi-2.5",
  "kimi-k2-0711-preview",
] as const;

export const restaurantDatasetForPrompt = restaurants.map((restaurant) => ({
  id: restaurant.id,
  name: restaurant.name,
  tags: restaurant.tags,
  area: restaurant.area,
  address: restaurant.address,
  avgSpend: restaurant.avgSpend,
  supportsBooking: restaurant.supportsBooking,
  supportsTakeaway: restaurant.supportsTakeaway,
  summary: restaurant.summary,
  signatureDishes: restaurant.signatureDishes.map((dish) => dish.name),
}));

export const foodDatasetForPrompt = foodIntents.map((intent) => ({
  id: intent.id,
  title: intent.title,
  subtitle: intent.subtitle,
  tags: intent.intentTags,
  fixedPrice: intent.fixedPrice,
  primaryRestaurantId: intent.primaryRestaurantId,
  recommendedRestaurantIds: intent.recommendedRestaurantIds,
}));

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

const foodieDatasetForPrompt = Array.from(
  new Map(
    reviews.map((review) => [
      review.userId,
      {
        id: review.userId,
        name: review.userName,
        avatar: review.userAvatar,
        credibilityScore: review.userReputationScore,
        followersCount: stableInt(`${review.userId}:followers`, 340, 5600),
        restaurantIds: Array.from(new Set(reviews.filter((item) => item.userId === review.userId).map((item) => item.restaurantId))).slice(0, 4),
      },
    ])
  ).values()
).slice(0, 20);

export function buildChatSystemPrompt() {
  return [
    "You are the OEats AI food assistant inside a restaurant discovery app.",
    "Use only the datasets provided below.",
    "Never invent restaurants, dishes, foodie profiles, IDs, areas, or offers that are not present in the dataset.",
    "Be concise, practical, and helpful.",
    "Return valid JSON only. No markdown. No code fences.",
    'The JSON schema is: {"reply":"string","cards":[{"type":"restaurant|food|foodie","id":"string"}]}',
    "Return at most 3 cards total.",
    "If the user asks a follow-up question, use the prior conversation context.",
    "Recommend only IDs that exist in the datasets.",
    "If no item fits, return an empty cards array and explain briefly.",
    `Restaurant dataset: ${JSON.stringify(restaurantDatasetForPrompt)}`,
    `Food dataset: ${JSON.stringify(foodDatasetForPrompt)}`,
    `Foodie dataset: ${JSON.stringify(foodieDatasetForPrompt)}`,
  ].join(" ");
}

export function parseStructuredChatResponse(raw: string): ChatApiResponse | null {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

  try {
    const parsed = JSON.parse(fenced) as Partial<ChatApiResponse> & { restaurantIds?: string[] };
    if (typeof parsed.reply !== "string") return null;
    const rawCards = Array.isArray(parsed.cards)
      ? parsed.cards
      : Array.isArray(parsed.restaurantIds)
        ? parsed.restaurantIds.map((id) => ({ type: "restaurant" as const, id }))
        : [];
    const validCards = rawCards.filter((card): card is ChatCardRef => {
      if (!card || typeof card !== "object" || typeof card.id !== "string" || typeof card.type !== "string") return false;
      if (card.type === "restaurant") return restaurants.some((restaurant) => restaurant.id === card.id);
      if (card.type === "food") return foodIntents.some((intent) => intent.id === card.id);
      if (card.type === "foodie") return reviews.some((review) => review.userId === card.id);
      return false;
    });
    return {
      reply: parsed.reply.trim(),
      cards: Array.from(new Map(validCards.map((card) => [`${card.type}:${card.id}`, card])).values()).slice(0, 3),
    };
  } catch {
    return null;
  }
}

export function buildRestaurantSuggestionPayload(restaurantId: string): {
  restaurant: Restaurant;
  intent: FoodIntent | null;
  review: Review | null;
  serviceMode: "book" | "takeaway";
} | null {
  const restaurant = restaurants.find((item) => item.id === restaurantId);
  if (!restaurant) return null;

  const intent =
    foodIntents.find((item) => item.primaryRestaurantId === restaurantId) ||
    foodIntents.find((item) => item.recommendedRestaurantIds.includes(restaurantId)) ||
    null;

  const review =
    reviews.find((item) => item.restaurantId === restaurantId && item.verifiedVisit) ||
    reviews.find((item) => item.restaurantId === restaurantId) ||
    null;

  const serviceMode: "book" | "takeaway" =
    restaurant.supportsBooking || !restaurant.supportsTakeaway ? "book" : "takeaway";

  return { restaurant, intent, review, serviceMode };
}

export function buildFoodieSuggestionPayload(userId: string) {
  const userReviews = reviews.filter((review) => review.userId === userId);
  if (userReviews.length === 0) return null;
  const latest = [...userReviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  const credibilityScore = Math.round(
    userReviews.reduce((sum, review) => sum + review.userReputationScore, 0) / Math.max(userReviews.length, 1)
  );
  return {
    userId,
    username: latest.userName,
    avatar: latest.userAvatar,
    credibilityScore,
    followersCount: stableInt(`${userId}:followers`, 340, 5600),
  };
}
