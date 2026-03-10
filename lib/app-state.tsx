"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bookings as seedBookings,
  orders as seedOrders,
  restaurants,
  reviews as seedReviews,
  transactions as seedTransactions,
  user,
  type Booking,
  type QrPayload,
  type Review,
  type TakeawayOrder,
  type User,
  type WalletTx,
} from "@/lib/mock-data";
import { getBookingDepositAmount } from "@/lib/payment";
import { generateId } from "@/lib/utils";

type BookingDraft = {
  restaurantId: string;
  datetime: string;
  partySize: number;
  notes?: string;
};

type CartDraft = Record<string, Record<string, number>>;

type WalletState = {
  viraBalance: number;
  stakedBalance: number;
  apyPct: number;
  todayEarnings: number;
};

type AiFoodDislike = {
  intentId: string;
  reason: string;
  createdAt: string;
};

type PendingVoteTask = {
  id: string;
  contextType: "TAKEAWAY" | "BOOKING";
  contextId: string;
  restaurantId: string;
  reviewId: string;
  rewardForVote: number;
  createdAt: string;
  status: "PENDING" | "RESPONDED";
};

type AiPreferences = {
  likedFoodIntentIds: string[];
  dislikedFoodIntents: AiFoodDislike[];
  reviewVotes: Record<string, "AGREE" | "DISAGREE">;
  pendingVoteTasks: PendingVoteTask[];
};

type TransactionVote = {
  reviewId: string;
  vote: "AGREE" | "DISAGREE";
  createdAt: string;
};

type SocialState = {
  followingUserIds: string[];
  savedReviewIds: string[];
  transactionVotes: Record<string, TransactionVote>; // keyed by `${relatedType}:${relatedId}`
};

type MembershipState = {
  ownedCardIds: string[]; // membershipCards[].id (restaurantId)
  activeCardId: string | null;
};

export type UserPreferencesState = User["preferences"] & {
  spicePreference: "No spicy" | "Mild" | "Anything";
  healthNotes: string[];
  diningFor: "Solo" | "Couple" | "Family" | "Friends";
};

export type AppLocale = "en" | "zh-HK";

type AppStateContextType = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  preferences: UserPreferencesState;
  updatePreferences: (patch: Partial<UserPreferencesState>) => void;
  wallet: WalletState;
  bookings: Booking[];
  orders: TakeawayOrder[];
  transactions: WalletTx[];
  reviews: Review[];
  aiPreferences: AiPreferences;
  social: SocialState;
  membership: MembershipState;
  pendingVoteTasks: PendingVoteTask[];
  bookingDraft: BookingDraft | null;
  cartDraft: CartDraft;
  setBookingDraft: (draft: BookingDraft) => void;
  clearBookingDraft: () => void;
  setCartItem: (restaurantId: string, menuItemId: string, qty: number) => void;
  clearCart: (restaurantId: string) => void;
  toggleLikedFoodIntent: (intentId: string) => void;
  addDislikedFoodIntent: (intentId: string, reason: string) => void;
  removeDislikedFoodIntent: (intentId: string) => void;
  setReviewVote: (input: {
    relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
    relatedId: string;
    vote: "AGREE" | "DISAGREE";
  }) => void;
  updateBooking: (bookingId: string, patch: { datetime?: string; partySize?: number; notes?: string }) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  cancelOrder: (orderId: string) => void;
  markOrderReady: (orderId: string) => void;
  markOrderPickedUp: (orderId: string) => void;
  respondPendingVote: (taskId: string, vote: "AGREE" | "DISAGREE") => void;
  toggleFollowUser: (userId: string) => void;
  toggleSavedReview: (reviewId: string) => void;
  hasCompletedTransaction: (restaurantId: string) => boolean;
  getUnusedVoteContexts: (restaurantId: string) => { relatedType: "BOOKING" | "TAKEAWAY" | "VISIT"; relatedId: string; label: string }[];
  voteOnReview: (input: {
    reviewId: string;
    restaurantId: string;
    relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
    relatedId: string;
    vote: "AGREE" | "DISAGREE";
  }) => { ok: boolean; message: string };
  createBookingFromDraft: () => string | null;
  createOrderFromCart: (restaurantId: string) => string | null;
  processPayment: (input: {
    context: "booking" | "order";
    bookingId?: string;
    orderId?: string;
    paymentMethod: "credit_card" | "apple_pay";
    walletOffset: number;
  }) => { ok: boolean; route?: string; message: string };
  confirmQrAction: (payload: QrPayload) => { ok: boolean; message: string; txId?: string };
  addTransferOut: (recipient: string, amount: number, note: string) => void;
  addBuy: (amount: number, note: string) => void;
  stake: (amount: number) => void;
  unstake: (amount: number) => void;
  submitReviewWithReward: (input: {
    restaurantId: string;
    relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
    relatedId: string;
    ratings: { food: number; service: number; atmosphere: number };
    text: string;
    tags: string[];
    photos: string[];
  }) => void;
  addMembershipCard: (cardId: string) => void;
  removeMembershipCard: (cardId: string) => void;
  setActiveMembershipCard: (cardId: string) => void;
};

const STORAGE_KEY = "opensesame-consumer-app-2-1";
const LEGACY_STORAGE_KEY = "vira-consumer-app-2-1";
const defaultPreferences: UserPreferencesState = {
  ...user.preferences,
  spicePreference: "Mild",
  healthNotes: ["Low sodium"],
  diningFor: "Couple",
};

const AppStateContext = createContext<AppStateContextType | null>(null);

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash.toString(36);
};

const migrateReviewsWithUserId = (input: unknown): Review[] => {
  const list = Array.isArray(input) ? (input as Review[]) : [];
  return list.map((review) => {
    if ((review as Review).userId) return review as Review;
    const anyReview = review as Review & { userId?: string };
    const isSelf = anyReview.userName === user.name;
    const fallbackId = isSelf
      ? user.id
      : `user-${stableHash(`${anyReview.userName || "unknown"}|${anyReview.userAvatar || ""}`)}`;
    return { ...anyReview, userId: fallbackId } as Review;
  });
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>("en");
  const [preferences, setPreferences] = useState<UserPreferencesState>(defaultPreferences);
  const [wallet, setWallet] = useState<WalletState>(user.wallet);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [orders, setOrders] = useState<TakeawayOrder[]>(seedOrders);
  const [transactions, setTransactions] = useState<WalletTx[]>(seedTransactions);
  const [reviews, setReviews] = useState<Review[]>(seedReviews);
  const [isHydrated, setIsHydrated] = useState(false);
  const [aiPreferences, setAiPreferences] = useState<AiPreferences>({
    likedFoodIntentIds: [],
    dislikedFoodIntents: [],
    reviewVotes: {},
    pendingVoteTasks: [],
  });
  const [social, setSocial] = useState<SocialState>({
    followingUserIds: [],
    savedReviewIds: [],
    transactionVotes: {},
  });
  const [membership, setMembership] = useState<MembershipState>({
    ownedCardIds: user.membershipCardIds || [],
    activeCardId: user.membershipCardIds?.[0] ?? null,
  });
  const [bookingDraft, setBookingDraftState] = useState<BookingDraft | null>(null);
  const [cartDraft, setCartDraft] = useState<CartDraft>({});

  useEffect(() => {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY) ?? legacyRaw;
    const usingLegacy = !localStorage.getItem(STORAGE_KEY) && Boolean(legacyRaw);
    if (!raw) {
      setIsHydrated(true);
      return;
    }
    try {
      const data = JSON.parse(raw) as {
        locale?: AppLocale;
        preferences?: Partial<UserPreferencesState>;
        wallet: WalletState;
        bookings: Booking[];
        orders: TakeawayOrder[];
        transactions: WalletTx[];
        reviews: Review[];
        aiPreferences?: AiPreferences;
        social?: SocialState;
        membership?: MembershipState;
        bookingDraft: BookingDraft | null;
        cartDraft: CartDraft;
      };
      setLocale(data.locale === "zh-HK" ? "zh-HK" : "en");
      setPreferences({
        ...defaultPreferences,
        ...(data.preferences || {}),
        cuisines: Array.isArray(data.preferences?.cuisines) ? data.preferences!.cuisines.filter((value) => typeof value === "string") : defaultPreferences.cuisines,
        dietaryRestrictions: Array.isArray(data.preferences?.dietaryRestrictions)
          ? data.preferences!.dietaryRestrictions.filter((value) => typeof value === "string")
          : defaultPreferences.dietaryRestrictions,
        areas: Array.isArray(data.preferences?.areas) ? data.preferences!.areas.filter((value) => typeof value === "string") : defaultPreferences.areas,
        healthNotes: Array.isArray(data.preferences?.healthNotes)
          ? data.preferences!.healthNotes.filter((value) => typeof value === "string")
          : defaultPreferences.healthNotes,
        spicePreference:
          data.preferences?.spicePreference === "No spicy" || data.preferences?.spicePreference === "Anything"
            ? data.preferences.spicePreference
            : defaultPreferences.spicePreference,
        diningFor:
          data.preferences?.diningFor === "Solo" ||
          data.preferences?.diningFor === "Couple" ||
          data.preferences?.diningFor === "Family" ||
          data.preferences?.diningFor === "Friends"
            ? data.preferences.diningFor
            : defaultPreferences.diningFor,
      });
      setWallet(data.wallet || user.wallet);
      setBookings(data.bookings || seedBookings);
      setOrders(data.orders || seedOrders);
      setTransactions(data.transactions || seedTransactions);
      const nextReviews = migrateReviewsWithUserId(data.reviews || seedReviews);
      setReviews(nextReviews);
      const nextAiPreferences = data.aiPreferences || {
        likedFoodIntentIds: [],
        dislikedFoodIntents: [],
        reviewVotes: {},
        pendingVoteTasks: [],
      };
      setAiPreferences({
        likedFoodIntentIds: nextAiPreferences.likedFoodIntentIds || [],
        dislikedFoodIntents: nextAiPreferences.dislikedFoodIntents || [],
        reviewVotes: nextAiPreferences.reviewVotes || {},
        pendingVoteTasks: nextAiPreferences.pendingVoteTasks || [],
      });
      const nextSocial = data.social || { followingUserIds: [], savedReviewIds: [], reviewVotes: {} };
      const migratedTransactionVotes: SocialState["transactionVotes"] = (() => {
        const raw = (nextSocial as any).transactionVotes as SocialState["transactionVotes"] | undefined;
        if (raw && typeof raw === "object") return raw;
        // legacy: reviewVotes keyed by reviewId (no transaction binding)
        const legacyByReview = (nextSocial as any).reviewVotes as Record<string, "AGREE" | "DISAGREE"> | undefined;
        if (!legacyByReview || typeof legacyByReview !== "object") return {};
        const next: SocialState["transactionVotes"] = {};
        for (const [reviewId, vote] of Object.entries(legacyByReview)) {
          next[`LEGACY:${reviewId}`] = { reviewId, vote, createdAt: new Date().toISOString() };
        }
        return next;
      })();
      setSocial({
        followingUserIds: nextSocial.followingUserIds || [],
        savedReviewIds: nextSocial.savedReviewIds || [],
        transactionVotes: migratedTransactionVotes,
      });
      const nextMembership = data.membership;
      setMembership({
        ownedCardIds: Array.isArray(nextMembership?.ownedCardIds)
          ? nextMembership!.ownedCardIds.filter((id) => typeof id === "string")
          : (user.membershipCardIds || []),
        activeCardId: typeof nextMembership?.activeCardId === "string"
          ? nextMembership!.activeCardId
          : (user.membershipCardIds?.[0] ?? null),
      });
      setBookingDraftState(data.bookingDraft || null);
      setCartDraft(data.cartDraft || {});
      if (usingLegacy) localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ locale, preferences, wallet, bookings, orders, transactions, reviews, aiPreferences, social, membership, bookingDraft, cartDraft })
    );
  }, [locale, preferences, wallet, bookings, orders, transactions, reviews, aiPreferences, social, membership, bookingDraft, cartDraft, isHydrated]);

  const updatePreferences = (patch: Partial<UserPreferencesState>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  };

  const setBookingDraft = (draft: BookingDraft) => setBookingDraftState(draft);
  const clearBookingDraft = () => setBookingDraftState(null);

  const setCartItem = (restaurantId: string, menuItemId: string, qty: number) => {
    setCartDraft((prev) => {
      const next = { ...prev };
      const restaurantCart = { ...(next[restaurantId] || {}) };
      if (qty <= 0) delete restaurantCart[menuItemId];
      else restaurantCart[menuItemId] = qty;
      next[restaurantId] = restaurantCart;
      return next;
    });
  };

  const clearCart = (restaurantId: string) => {
    setCartDraft((prev) => ({ ...prev, [restaurantId]: {} }));
  };

  const toggleLikedFoodIntent = (intentId: string) => {
    setAiPreferences((prev) => {
      const liked = new Set(prev.likedFoodIntentIds);
      if (liked.has(intentId)) liked.delete(intentId);
      else liked.add(intentId);

      const dislikedFoodIntents = prev.dislikedFoodIntents.filter((item) => item.intentId !== intentId);

      return { ...prev, likedFoodIntentIds: Array.from(liked), dislikedFoodIntents };
    });
  };

  const addDislikedFoodIntent = (intentId: string, reason: string) => {
    setAiPreferences((prev) => {
      const likedFoodIntentIds = prev.likedFoodIntentIds.filter((id) => id !== intentId);
      const nextDisliked = prev.dislikedFoodIntents.filter((item) => item.intentId !== intentId);
      nextDisliked.unshift({ intentId, reason, createdAt: new Date().toISOString() });
      return { ...prev, likedFoodIntentIds, dislikedFoodIntents: nextDisliked };
    });
  };

  const removeDislikedFoodIntent = (intentId: string) => {
    setAiPreferences((prev) => ({
      ...prev,
      dislikedFoodIntents: prev.dislikedFoodIntents.filter((item) => item.intentId !== intentId),
    }));
  };

  const setReviewVote = (input: { relatedType: "BOOKING" | "TAKEAWAY" | "VISIT"; relatedId: string; vote: "AGREE" | "DISAGREE" }) => {
    const key = `${input.relatedType}:${input.relatedId}`;
    setAiPreferences((prev) => {
      if (prev.reviewVotes?.[key]) return prev;
      return { ...prev, reviewVotes: { ...(prev.reviewVotes || {}), [key]: input.vote } };
    });
  };

  const pickStableReviewId = (restaurantId: string, seed: string) => {
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    if (!restaurant) return null;

    const verified = reviews.filter((review) => review.restaurantId === restaurantId && review.verifiedVisit);
    if (verified.length === 0) return null;

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const daysAgo = (iso: string) => {
      const t = +new Date(iso);
      if (!Number.isFinite(t)) return 9999;
      return (Date.now() - t) / (1000 * 60 * 60 * 24);
    };
    const hashSeed = (s: string) => {
      let hash = 0;
      for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
      return hash;
    };

    const tagMatches = preferences.cuisines.filter((cuisine) => restaurant.tags.includes(cuisine)).length;
    const tasteSimilarity = clamp01(tagMatches / Math.max(1, preferences.cuisines.length));

    const scoreReview = (review: Review) => {
      const totalVotes = Math.max(0, review.agreeCount) + Math.max(0, review.disagreeCount);
      const agreeRate = totalVotes > 0 ? clamp01(review.agreeCount / totalVotes) : 0.5;
      const credibility = clamp01(review.userReputationScore / 100);
      const freshness = clamp01(Math.exp(-daysAgo(review.createdAt) / 30));
      return credibility * 0.35 + tasteSimilarity * 0.25 + agreeRate * 0.25 + freshness * 0.15;
    };

    const scored = verified
      .map((review) => ({ review, score: scoreReview(review) }))
      .sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(3, scored.length)).map((item) => item.review);
    const idx = hashSeed(seed) % top.length;
    return top[idx]?.id || null;
  };

  const ensurePendingVoteTask = (input: { contextType: "TAKEAWAY" | "BOOKING"; contextId: string; restaurantId: string }) => {
    const contextKey = `${input.contextType}:${input.contextId}`;
    const reviewId = pickStableReviewId(input.restaurantId, contextKey);
    if (!reviewId) return;

    setAiPreferences((prev) => {
      const existing = (prev.pendingVoteTasks || []).some((task) => `${task.contextType}:${task.contextId}` === contextKey);
      if (existing) return prev;

      const next: PendingVoteTask = {
        id: generateId("pv"),
        contextType: input.contextType,
        contextId: input.contextId,
        restaurantId: input.restaurantId,
        reviewId,
        rewardForVote: 0.2,
        createdAt: new Date().toISOString(),
        status: "PENDING",
      };

      return { ...prev, pendingVoteTasks: [next, ...(prev.pendingVoteTasks || [])] };
    });
  };

  useEffect(() => {
    if (!isHydrated) return;
    setAiPreferences((prev) => {
      const existingKeys = new Set((prev.pendingVoteTasks || []).map((task) => `${task.contextType}:${task.contextId}`));
      const nextTasks: PendingVoteTask[] = [];

      for (const booking of bookings) {
        if (booking.status !== "COMPLETED") continue;
        if (booking.verificationStatus !== "VERIFIED") continue;
        const key = `BOOKING:${booking.id}`;
        if (existingKeys.has(key)) continue;
        const reviewId = pickStableReviewId(booking.restaurantId, key);
        if (!reviewId) continue;
        nextTasks.push({
          id: generateId("pv"),
          contextType: "BOOKING",
          contextId: booking.id,
          restaurantId: booking.restaurantId,
          reviewId,
          rewardForVote: 0.2,
          createdAt: new Date().toISOString(),
          status: "PENDING",
        });
      }

      for (const order of orders) {
        if (order.status !== "PICKED_UP") continue;
        if (order.verificationStatus !== "VERIFIED") continue;
        const key = `TAKEAWAY:${order.id}`;
        if (existingKeys.has(key)) continue;
        const reviewId = pickStableReviewId(order.restaurantId, key);
        if (!reviewId) continue;
        nextTasks.push({
          id: generateId("pv"),
          contextType: "TAKEAWAY",
          contextId: order.id,
          restaurantId: order.restaurantId,
          reviewId,
          rewardForVote: 0.2,
          createdAt: new Date().toISOString(),
          status: "PENDING",
        });
      }

      if (nextTasks.length === 0) return prev;
      return { ...prev, pendingVoteTasks: [...nextTasks, ...(prev.pendingVoteTasks || [])] };
    });
  }, [bookings, isHydrated, orders, reviews]);

  const createBookingFromDraft = () => {
    if (!bookingDraft) return null;
    const restaurant = restaurants.find((item) => item.id === bookingDraft.restaurantId);
    if (!restaurant) return null;

    const id = generateId("bk");
    const booking: Booking = {
      id,
      restaurantId: bookingDraft.restaurantId,
      datetime: bookingDraft.datetime,
      partySize: bookingDraft.partySize,
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      verificationStatus: restaurant.livePosSync ? "AUTO" : "QR_REQUIRED",
      rewardEstimateVira: Math.max(4, Math.round((restaurant.avgSpend * restaurant.rewardYieldPct) / 100)),
      notes: bookingDraft.notes,
    };
    setBookings((prev) => [booking, ...prev]);
    setBookingDraftState(null);
    return id;
  };

  const updateBooking = (bookingId: string, patch: { datetime?: string; partySize?: number; notes?: string }) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              datetime: patch.datetime ?? booking.datetime,
              partySize: patch.partySize ?? booking.partySize,
              notes: patch.notes ?? booking.notes,
            }
          : booking
      )
    );
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking)));
  };

  const completeBooking = (bookingId: string) => {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    if (booking.status === "COMPLETED") return;
    if (booking.paymentStatus !== "PAID_OSM") return;
    setBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status: "COMPLETED", verificationStatus: item.verificationStatus === "AUTO" ? "AUTO" : "VERIFIED" } : item)));
    ensurePendingVoteTask({ contextType: "BOOKING", contextId: bookingId, restaurantId: booking.restaurantId });

    const rewardAmount = Math.max(2, Math.round(booking.rewardEstimateVira));
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + rewardAmount }));
    addTx({
      id: generateId("tx"),
      type: "REWARD",
      amountVira: rewardAmount,
      restaurantId: booking.restaurantId,
      bookingId,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Booking completion reward",
    });
  };

  const createOrderFromCart = (restaurantId: string) => {
    const restaurant = restaurants.find((item) => item.id === restaurantId);
    const cart = cartDraft[restaurantId] || {};
    if (!restaurant || Object.keys(cart).length === 0) return null;

    const items = Object.entries(cart).map(([menuItemId, qty]) => ({ menuItemId, qty }));
    const subtotal = items.reduce((acc, item) => {
      const menu = restaurant.takeawayMenu.find((m) => m.id === item.menuItemId);
      return acc + (menu?.price || 0) * item.qty;
    }, 0);

    const id = generateId("od");
    const order: TakeawayOrder = {
      id,
      restaurantId,
      items,
      subtotal,
      status: "PLACED",
      paymentStatus: "UNPAID",
      verificationStatus: restaurant.livePosSync ? "AUTO" : "QR_REQUIRED",
      rewardEstimateVira: Math.max(3, Math.round((subtotal * restaurant.rewardYieldPct) / 100)),
    };

    setOrders((prev) => [order, ...prev]);
    clearCart(restaurantId);
    return id;
  };

  const processPayment = (input: {
    context: "booking" | "order";
    bookingId?: string;
    orderId?: string;
    paymentMethod: "credit_card" | "apple_pay";
    walletOffset: number;
  }) => {
    const methodLabel = input.paymentMethod === "apple_pay" ? "Apple Pay" : "Credit card";

    if (input.context === "booking") {
      const booking = bookings.find((item) => item.id === input.bookingId);
      if (!booking) return { ok: false, message: "Booking not found." };
      if (booking.paymentStatus === "PAID_OSM") {
        return { ok: true, route: `/pay/complete?context=booking&bookingId=${booking.id}`, message: "Payment already completed." };
      }
      const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
      if (!restaurant) return { ok: false, message: "Restaurant not found." };

      const total = getBookingDepositAmount(restaurant);
      const walletOffset = Math.max(0, Math.min(input.walletOffset, total, wallet.viraBalance));
      if (walletOffset > wallet.viraBalance) return { ok: false, message: "Insufficient balance." };

      if (walletOffset > 0) {
        setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance - walletOffset }));
        addTx({
          id: generateId("tx"),
          type: "PAY",
          amountVira: -walletOffset,
          counterparty: restaurant.name,
          bookingId: booking.id,
          restaurantId: restaurant.id,
          createdAt: new Date().toISOString(),
          status: "CONFIRMED",
          note: `Booking deposit via $OSM + ${methodLabel}`,
        });
      }

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? { ...item, paymentStatus: "PAID_OSM", verificationStatus: "VERIFIED" }
            : item
        )
      );

      return { ok: true, route: `/pay/complete?context=booking&bookingId=${booking.id}`, message: "Payment completed." };
    }

    const order = orders.find((item) => item.id === input.orderId);
    if (!order) return { ok: false, message: "Order not found." };
    if (order.paymentStatus === "PAID_OSM") {
      return { ok: true, route: `/pay/complete?context=order&orderId=${order.id}`, message: "Payment already completed." };
    }
    const restaurant = restaurants.find((item) => item.id === order.restaurantId);
    if (!restaurant) return { ok: false, message: "Restaurant not found." };

    const total = order.subtotal;
    const walletOffset = Math.max(0, Math.min(input.walletOffset, total, wallet.viraBalance));
    if (walletOffset > wallet.viraBalance) return { ok: false, message: "Insufficient balance." };

    if (walletOffset > 0) {
      setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance - walletOffset }));
      addTx({
        id: generateId("tx"),
        type: "PAY",
        amountVira: -walletOffset,
        counterparty: restaurant.name,
        orderId: order.id,
        restaurantId: restaurant.id,
        createdAt: new Date().toISOString(),
        status: "CONFIRMED",
        note: `Takeaway payment via $OSM + ${methodLabel}`,
      });
    }

    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? { ...item, paymentStatus: "PAID_OSM", verificationStatus: "VERIFIED" }
          : item
      )
    );

    return { ok: true, route: `/pay/complete?context=order&orderId=${order.id}`, message: "Payment completed." };
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "CANCELLED" } : order)));
  };

  const markOrderReady = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "READY" } : order)));
  };

  const markOrderPickedUp = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    if (order.status === "PICKED_UP") return;
    if (order.paymentStatus !== "PAID_OSM") return;
    setOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, status: "PICKED_UP", verificationStatus: item.verificationStatus === "AUTO" ? "AUTO" : "VERIFIED" } : item)));
    ensurePendingVoteTask({ contextType: "TAKEAWAY", contextId: orderId, restaurantId: order.restaurantId });

    const rewardAmount = Math.max(2, Math.round(order.rewardEstimateVira));
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + rewardAmount }));
    addTx({
      id: generateId("tx"),
      type: "REWARD",
      amountVira: rewardAmount,
      restaurantId: order.restaurantId,
      orderId,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Takeaway completion reward",
    });
  };

  const respondPendingVote = (taskId: string, vote: "AGREE" | "DISAGREE") => {
    const task = aiPreferences.pendingVoteTasks.find((item) => item.id === taskId);
    if (!task || task.status !== "PENDING") return;

    setAiPreferences((prev) => {
      const nextTasks = (prev.pendingVoteTasks || []).map((item) => (item.id === taskId ? { ...item, status: "RESPONDED" } : item));
      const key = `${task.contextType}:${task.contextId}`;
      const nextVotes = prev.reviewVotes?.[key] ? prev.reviewVotes : { ...(prev.reviewVotes || {}), [key]: vote };
      return { ...prev, pendingVoteTasks: nextTasks, reviewVotes: nextVotes };
    });

    setReviews((prev) => {
      const target = prev.find((review) => review.id === task.reviewId);
      const authorId = target?.userId;
      return prev.map((review) => {
        const isTarget = review.id === task.reviewId;
        const isAuthor = authorId && review.userId === authorId;
        const reputationBoost =
          vote === "AGREE" && isAuthor ? Math.min(99, Math.max(0, (review.userReputationScore || 0) + 1)) : review.userReputationScore;

        if (isTarget) {
          return vote === "AGREE"
            ? { ...review, agreeCount: review.agreeCount + 1, userReputationScore: reputationBoost }
            : { ...review, disagreeCount: review.disagreeCount + 1, userReputationScore: reputationBoost };
        }

        return isAuthor ? { ...review, userReputationScore: reputationBoost } : review;
      });
    });

    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + task.rewardForVote }));
    addTx({
      id: generateId("tx"),
      type: "REWARD_VOTE",
      amountVira: task.rewardForVote,
      restaurantId: task.restaurantId,
      orderId: task.contextType === "TAKEAWAY" ? task.contextId : undefined,
      bookingId: task.contextType === "BOOKING" ? task.contextId : undefined,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Vote participation reward",
    });
  };

  const addTx = (tx: WalletTx) => setTransactions((prev) => [tx, ...prev]);

  const confirmQrAction = (payload: QrPayload) => {
    const restaurant = restaurants.find((item) => item.id === payload.restaurantId);
    if (!restaurant) return { ok: false, message: "Invalid restaurant" };

    if (payload.type === "PAY") {
      const amount = payload.amount || 0;
      if (amount <= 0) return { ok: false, message: "Amount missing for payment" };
      if (wallet.viraBalance < amount) return { ok: false, message: "Insufficient balance" };

      const txId = generateId("tx");
      addTx({
        id: txId,
        type: "PAY",
        amountVira: -amount,
        counterparty: restaurant.name,
        restaurantId: restaurant.id,
        orderId: payload.orderId,
        bookingId: payload.bookingId,
        createdAt: new Date().toISOString(),
        status: "CONFIRMED",
        note: "QR payment",
      });

      setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance - amount }));

      if (payload.orderId) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === payload.orderId
              ? {
                  ...order,
                  paymentStatus: "PAID_OSM",
                  verificationStatus: restaurant.livePosSync ? "VERIFIED" : "QR_REQUIRED",
                }
              : order
          )
        );
      }

      if (payload.bookingId) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === payload.bookingId
              ? {
                  ...booking,
                  paymentStatus: "PAID_OSM",
                  verificationStatus: restaurant.livePosSync ? "VERIFIED" : "QR_REQUIRED",
                }
              : booking
          )
        );
      }

      return {
        ok: true,
        message: restaurant.livePosSync
          ? "Payment confirmed. Verification completed automatically."
          : "Payment confirmed. Please scan VERIFY QR to complete verification.",
        txId,
      };
    }

    const txId = generateId("tx");
    addTx({
      id: txId,
      type: "VERIFY",
      amountVira: 0,
      counterparty: restaurant.name,
      restaurantId: restaurant.id,
      orderId: payload.orderId,
      bookingId: payload.bookingId,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "QR verification",
    });

    if (payload.orderId) {
      setOrders((prev) =>
        prev.map((order) => (order.id === payload.orderId ? { ...order, verificationStatus: "VERIFIED" } : order))
      );
    }

    if (payload.bookingId) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === payload.bookingId ? { ...booking, verificationStatus: "VERIFIED" } : booking
        )
      );
    }

    return { ok: true, message: "Verification confirmed.", txId };
  };

  const addTransferOut = (recipient: string, amount: number, note: string) => {
    if (amount <= 0 || wallet.viraBalance < amount) return;
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance - amount }));
    addTx({
      id: generateId("tx"),
      type: "TRANSFER_OUT",
      amountVira: -amount,
      counterparty: recipient,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: note || "Transfer",
    });
  };

  const addBuy = (amount: number, note: string) => {
    if (amount <= 0) return;
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + amount }));
    addTx({
      id: generateId("tx"),
      type: "BUY",
      amountVira: amount,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: note || "Buy more",
    });
  };

  const stake = (amount: number) => {
    if (amount <= 0 || wallet.viraBalance < amount) return;
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance - amount, stakedBalance: prev.stakedBalance + amount }));
    addTx({
      id: generateId("tx"),
      type: "STAKE",
      amountVira: -amount,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Stake",
    });
  };

  const unstake = (amount: number) => {
    if (amount <= 0 || wallet.stakedBalance < amount) return;
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + amount, stakedBalance: prev.stakedBalance - amount }));
    addTx({
      id: generateId("tx"),
      type: "UNSTAKE",
      amountVira: amount,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Unstake",
    });
  };

  const submitReviewWithReward = (input: {
    restaurantId: string;
    relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
    relatedId: string;
    ratings: { food: number; service: number; atmosphere: number };
    text: string;
    tags: string[];
    photos: string[];
  }) => {
    const review: Review = {
      id: generateId("rv"),
      userId: user.id,
      restaurantId: input.restaurantId,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      createdAt: new Date().toISOString(),
      agreeCount: 0,
      disagreeCount: 0,
      ratings: input.ratings,
      text: input.text,
      photos: input.photos,
      verifiedVisit: true,
      verificationMethod: "QR",
      txHash: null,
      userReputationScore: user.reputationScore,
      helpedDecisions: 0,
      aiCitations: 0,
      tags: input.tags,
      userName: user.name,
      userAvatar: user.avatar,
    };

    setReviews((prev) => [review, ...prev]);
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + 5 }));

    addTx({
      id: generateId("tx"),
      type: "REWARD",
      amountVira: 5,
      restaurantId: input.restaurantId,
      bookingId: input.relatedType === "BOOKING" ? input.relatedId : undefined,
      orderId: input.relatedType === "TAKEAWAY" ? input.relatedId : undefined,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Verified review reward",
    });
  };

  const toggleFollowUser = (userId: string) => {
    if (!userId || userId === user.id) return;
    setSocial((prev) => {
      const next = new Set(prev.followingUserIds || []);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return { ...prev, followingUserIds: Array.from(next) };
    });
  };

  const toggleSavedReview = (reviewId: string) => {
    if (!reviewId) return;
    setSocial((prev) => {
      const next = new Set(prev.savedReviewIds || []);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return { ...prev, savedReviewIds: Array.from(next) };
    });
  };

  const addMembershipCard = (cardId: string) => {
    if (!cardId) return;
    setMembership((prev) => {
      if (prev.ownedCardIds.includes(cardId)) return prev;
      const ownedCardIds = [...prev.ownedCardIds, cardId];
      const activeCardId = prev.activeCardId ?? cardId;
      return { ownedCardIds, activeCardId };
    });
  };

  const removeMembershipCard = (cardId: string) => {
    if (!cardId) return;
    setMembership((prev) => {
      if (!prev.ownedCardIds.includes(cardId)) return prev;
      const ownedCardIds = prev.ownedCardIds.filter((id) => id !== cardId);
      const activeCardId = prev.activeCardId === cardId ? (ownedCardIds[0] ?? null) : prev.activeCardId;
      return { ownedCardIds, activeCardId };
    });
  };

  const setActiveMembershipCard = (cardId: string) => {
    if (!cardId) return;
    setMembership((prev) => ({ ...prev, activeCardId: cardId }));
  };

  const hasCompletedTransaction = (restaurantId: string) => {
    if (!restaurantId) return false;
    if (user.visitedRestaurantIds?.includes(restaurantId)) return true;
    const bookingCompleted = bookings.some((booking) => booking.restaurantId === restaurantId && booking.status === "COMPLETED");
    if (bookingCompleted) return true;
    const orderCompleted = orders.some((order) => order.restaurantId === restaurantId && order.status === "PICKED_UP");
    return orderCompleted;
  };

  const getUnusedVoteContexts = (restaurantId: string) => {
    if (!restaurantId) return [];
    const used = new Set(Object.keys(social.transactionVotes || {}));

    const candidates: { relatedType: "BOOKING" | "TAKEAWAY" | "VISIT"; relatedId: string; label: string }[] = [];

    const completedBookings = bookings
      .filter((booking) => booking.restaurantId === restaurantId && booking.status === "COMPLETED")
      .sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime));
    for (const booking of completedBookings) {
      candidates.push({ relatedType: "BOOKING", relatedId: booking.id, label: `訂枱 ${new Date(booking.datetime).toLocaleDateString()}` });
    }

    const pickedOrders = orders
      .filter((order) => order.restaurantId === restaurantId && order.status === "PICKED_UP")
      .sort((a, b) => b.id.localeCompare(a.id));
    for (const order of pickedOrders) {
      candidates.push({ relatedType: "TAKEAWAY", relatedId: order.id, label: `外賣 ${order.id}` });
    }

    if (user.visitedRestaurantIds?.includes(restaurantId)) {
      candidates.push({ relatedType: "VISIT", relatedId: `visit-${restaurantId}`, label: "已到訪" });
    }

    return candidates.filter((context) => !used.has(`${context.relatedType}:${context.relatedId}`));
  };

  const voteOnReview = (input: {
    reviewId: string;
    restaurantId: string;
    relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
    relatedId: string;
    vote: "AGREE" | "DISAGREE";
  }) => {
    const { reviewId, restaurantId, relatedType, relatedId, vote } = input;
    if (!reviewId || !restaurantId || !relatedId) return { ok: false, message: "Invalid vote." };
    if (!hasCompletedTransaction(restaurantId)) return { ok: false, message: "完成交易後先可以投票。" };

    const contextKey = `${relatedType}:${relatedId}`;
    if (social.transactionVotes?.[contextKey]) return { ok: false, message: "呢筆交易已經投過票。" };

    const alreadyVotedThisReview = Object.values(social.transactionVotes || {}).some((v) => v.reviewId === reviewId);
    if (alreadyVotedThisReview) return { ok: false, message: "你已經對呢段評論投過票。" };

    const eligibleContexts = getUnusedVoteContexts(restaurantId);
    const isEligible = eligibleContexts.some((ctx) => `${ctx.relatedType}:${ctx.relatedId}` === contextKey);
    if (!isEligible) return { ok: false, message: "呢筆交易暫不可用於投票。" };

    setSocial((prev) => ({
      ...prev,
      transactionVotes: {
        ...(prev.transactionVotes || {}),
        [contextKey]: { reviewId, vote, createdAt: new Date().toISOString() },
      },
    }));

    setReviews((prev) => {
      const target = prev.find((review) => review.id === reviewId);
      const authorId = target?.userId;
      return prev.map((review) => {
        const isTarget = review.id === reviewId;
        const isAuthor = authorId && review.userId === authorId;

        const reputationBoost =
          vote === "AGREE" && isAuthor ? Math.min(99, Math.max(0, (review.userReputationScore || 0) + 1)) : review.userReputationScore;

        if (isTarget) {
          return vote === "AGREE"
            ? { ...review, agreeCount: review.agreeCount + 1, userReputationScore: reputationBoost }
            : { ...review, disagreeCount: review.disagreeCount + 1, userReputationScore: reputationBoost };
        }

        return isAuthor ? { ...review, userReputationScore: reputationBoost } : review;
      });
    });

    // Small participation reward (demo)
    setWallet((prev) => ({ ...prev, viraBalance: prev.viraBalance + 1 }));
    addTx({
      id: generateId("tx"),
      type: "REWARD_VOTE",
      amountVira: 1,
      restaurantId,
      bookingId: relatedType === "BOOKING" ? relatedId : undefined,
      orderId: relatedType === "TAKEAWAY" ? relatedId : undefined,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      note: "Vote participation reward",
    });

    return { ok: true, message: "已記錄投票，並獲得 $OSM 獎勵。" };
  };

  const value = useMemo<AppStateContextType>(
    () => ({
      locale,
      setLocale,
      preferences,
      updatePreferences,
      wallet,
      bookings,
      orders,
      transactions,
      reviews,
      aiPreferences,
      social,
      membership,
      pendingVoteTasks: aiPreferences.pendingVoteTasks,
      bookingDraft,
      cartDraft,
      setBookingDraft,
      clearBookingDraft,
      setCartItem,
      clearCart,
      toggleLikedFoodIntent,
      addDislikedFoodIntent,
      removeDislikedFoodIntent,
      setReviewVote,
      updateBooking,
      cancelBooking,
      completeBooking,
      createBookingFromDraft,
      createOrderFromCart,
      processPayment,
      confirmQrAction,
      addTransferOut,
      addBuy,
      stake,
      unstake,
      submitReviewWithReward,
      cancelOrder,
      markOrderReady,
      markOrderPickedUp,
      respondPendingVote,
      toggleFollowUser,
      toggleSavedReview,
      voteOnReview,
      hasCompletedTransaction,
      getUnusedVoteContexts,
      addMembershipCard,
      removeMembershipCard,
      setActiveMembershipCard,
    }),
    [
      locale,
      preferences,
      updatePreferences,
      wallet,
      bookings,
      orders,
      transactions,
      reviews,
      aiPreferences,
      social,
      membership,
      bookingDraft,
      cartDraft,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
}
