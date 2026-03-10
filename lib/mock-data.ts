export type FoodIntent = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  intentTags: string[];
  priceHint: string;
  fixedPrice: number;
  primaryRestaurantId: string;
  recommendedRestaurantIds: string[];
  aiIntentScore: number;
  expectedRewardViraUpTo: number;
  trustHintVerifiedPct: number;
};

export type SignatureDish = {
  name: string;
  image: string;
  tags: string[];
};

export type TakeawayMenuItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  tags: string[];
  available: boolean;
};

export type MenuVariant = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  variants?: MenuVariant[];
  tags?: string[];
  allergens?: string[];
  spicyLevel?: 0 | 1 | 2 | 3;
  isPopular?: boolean;
  available?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

export type RestaurantMenu = {
  lastUpdated: string; // YYYY-MM-DD
  serviceNotes?: string[];
  dineInSections: MenuSection[];
  drinksSections?: MenuSection[];
};

export type Restaurant = {
  id: string;
  name: string;
  coverImage: string;
  tags: string[];
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  avgSpend: number;
  distanceKm: number;
  area: string;
  address: string;
  trustVerifiedPct: number;
  rewardYieldPct: number;
  livePosSync: boolean;
  supportsBooking: boolean;
  supportsTakeaway: boolean;
  bookingNotes: string;
  takeawayNotes: string;
  summary: string;
  signatureDishes: SignatureDish[];
  takeawayMenu: TakeawayMenuItem[];
  menu?: RestaurantMenu;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  reputationScore: number;
  diningRankLabel: string;
  preferences: {
    cuisines: string[];
    budgetRange: string;
    dietaryRestrictions: string[];
    areas: string[];
  };
  wallet: {
    viraBalance: number;
    stakedBalance: number;
    apyPct: number;
    todayEarnings: number;
  };
  nfts: {
    membershipTier: string;
    referralTier: string;
    referralEarningsTotal: number;
    referralGraph: {
      level1Count: number;
      level2Count: number;
    };
  };
  savedRestaurantIds: string[];
  visitedRestaurantIds: string[];
  membershipCardIds: string[];
};

export type MembershipCardOffer = {
  id: string;
  title: string;
  subtitle?: string;
  discountLabel: string;
  terms?: string;
};

export type MembershipCard = {
  id: string; // restaurantId
  restaurantId: string;
  name: string;
  image: string;
  tier: "Bronze" | "Silver" | "Gold";
  theme: "orange" | "sky" | "emerald" | "violet";
  acquisition: {
    type: "FREE" | "PAID" | "APPROVAL";
    price?: number;
    note: string;
  };
  offers: MembershipCardOffer[];
};

export type Booking = {
  id: string;
  restaurantId: string;
  datetime: string;
  partySize: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  verificationStatus: "AUTO" | "QR_REQUIRED" | "VERIFIED";
  paymentStatus: "UNPAID" | "PAID_OSM";
  rewardEstimateVira: number;
  notes?: string;
};

export type TakeawayOrder = {
  id: string;
  restaurantId: string;
  items: { menuItemId: string; qty: number }[];
  subtotal: number;
  status: "DRAFT" | "PLACED" | "READY" | "PICKED_UP" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID_OSM";
  verificationStatus: "AUTO" | "QR_REQUIRED" | "VERIFIED";
  rewardEstimateVira: number;
};

export type WalletTx = {
  id: string;
  type: "PAY" | "TRANSFER_OUT" | "TRANSFER_IN" | "BUY" | "REWARD" | "REWARD_VOTE" | "STAKE" | "UNSTAKE" | "VERIFY";
  amountVira: number;
  counterparty?: string;
  restaurantId?: string;
  orderId?: string;
  bookingId?: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  note: string;
};

export type Review = {
  id: string;
  userId: string;
  restaurantId: string;
  relatedType: "BOOKING" | "TAKEAWAY" | "VISIT";
  relatedId: string;
  createdAt: string;
  agreeCount: number;
  disagreeCount: number;
  ratings: {
    food: number;
    service: number;
    atmosphere: number;
  };
  text: string;
  photos: string[];
  verifiedVisit: boolean;
  verificationMethod: "AUTO" | "QR";
  txHash: string | null;
  userReputationScore: number;
  helpedDecisions: number;
  aiCitations: number;
  tags: string[];
  userName: string;
  userAvatar?: string;
};

export type QrPayload = {
  type: "PAY" | "VERIFY";
  merchantId: string;
  restaurantId: string;
  orderId?: string;
  bookingId?: string;
  amount?: number;
  nonce: string;
  timestamp: string;
};

export const quickIntentChips = ["附近", "平價", "想食辣", "約會", "宵夜"];

export const foodIntents: FoodIntent[] = [
  {
    id: "italian-date-night",
    title: "黑松露手工意粉",
    subtitle: "約會晚餐，想穩陣又有氣氛",
    coverImage: "/images/food/truffle_pasta.jpg",
    intentTags: ["Date Night", "Italian", "Bookable"],
    priceHint: "HK$320 - HK$580",
    fixedPrice: 228,
    primaryRestaurantId: "mano-the-l-square",
    recommendedRestaurantIds: ["mano-the-l-square", "casamigos", "umi-cwb"],
    aiIntentScore: 94,
    expectedRewardViraUpTo: 36,
    trustHintVerifiedPct: 92,
  },
  {
    id: "spanish-group-night",
    title: "西班牙海鮮飯",
    subtitle: "朋友聚餐，想邊食邊飲",
    coverImage: "/images/food/paella.jpg",
    intentTags: ["Group", "Tapas", "Wine"],
    priceHint: "HK$260 - HK$520",
    fixedPrice: 268,
    primaryRestaurantId: "casamigos",
    recommendedRestaurantIds: ["casamigos", "mano-the-l-square", "milu-thai"],
    aiIntentScore: 90,
    expectedRewardViraUpTo: 34,
    trustHintVerifiedPct: 90,
  },
  {
    id: "thai-spicy-seafood",
    title: "冬蔭功海鮮湯",
    subtitle: "想食辣又想有海鮮香氣",
    coverImage: "/images/food/tomyum.jpg",
    intentTags: ["Spicy", "Seafood", "Takeaway"],
    priceHint: "HK$120 - HK$260",
    fixedPrice: 108,
    primaryRestaurantId: "milu-thai",
    recommendedRestaurantIds: ["milu-thai", "thai-simple-kitchen", "atas"],
    aiIntentScore: 88,
    expectedRewardViraUpTo: 22,
    trustHintVerifiedPct: 87,
  },
  {
    id: "quick-brunch",
    title: "全日早餐拼盤",
    subtitle: "周末輕鬆 brunch，唔想行太遠",
    coverImage: "/images/food/breakfast.jpg",
    intentTags: ["Brunch", "Cafe", "Nearby"],
    priceHint: "HK$100 - HK$220",
    fixedPrice: 128,
    primaryRestaurantId: "umi-cwb",
    recommendedRestaurantIds: ["umi-cwb", "atas", "thai-simple-kitchen"],
    aiIntentScore: 89,
    expectedRewardViraUpTo: 20,
    trustHintVerifiedPct: 88,
  },
  {
    id: "office-lunch-singapore",
    title: "海南雞飯",
    subtitle: "午餐想快、穩陣、夠飽",
    coverImage: "/images/food/chicken_rice.jpg",
    intentTags: ["Lunch", "Casual", "Takeaway"],
    priceHint: "HK$80 - HK$180",
    fixedPrice: 92,
    primaryRestaurantId: "atas",
    recommendedRestaurantIds: ["atas", "umi-cwb", "thai-simple-kitchen"],
    aiIntentScore: 86,
    expectedRewardViraUpTo: 19,
    trustHintVerifiedPct: 86,
  },
  {
    id: "thai-comfort-fast",
    title: "泰式打拋豬飯",
    subtitle: "放工後快速外賣首選",
    coverImage: "/images/food/basil_pork.jpg",
    intentTags: ["Comfort", "Thai", "Quick"],
    priceHint: "HK$70 - HK$160",
    fixedPrice: 78,
    primaryRestaurantId: "thai-simple-kitchen",
    recommendedRestaurantIds: ["thai-simple-kitchen", "milu-thai", "atas"],
    aiIntentScore: 85,
    expectedRewardViraUpTo: 17,
    trustHintVerifiedPct: 85,
  },
];

export const restaurants: Restaurant[] = [
  {
    id: "mano-the-l-square",
    name: "MANO",
    coverImage: "/images/restaurant/mano.jpg",
    tags: ["Italian", "Western", "Date Night"],
    priceRange: "$$$",
    avgSpend: 420,
    distanceKm: 0.6,
    area: "Causeway Bay",
    address: "The L Square, 459-461 Lockhart Rd, Causeway Bay",
    trustVerifiedPct: 92,
    rewardYieldPct: 4,
    livePosSync: true,
    supportsBooking: true,
    supportsTakeaway: false,
    bookingNotes: "Dinner reservations recommended.",
    takeawayNotes: "Not available.",
    summary: "Modern Italian dining with handmade pasta and relaxed upscale atmosphere.",
    signatureDishes: [
      { name: "Truffle Pasta", image: "/images/food/truffle_pasta.jpg", tags: ["Signature"] },
      { name: "Burrata Salad", image: "/images/food/burrata.jpg", tags: ["Fresh"] },
    ],
    takeawayMenu: [],
  },
  {
    id: "umi-cwb",
    name: "UMI",
    coverImage: "/images/restaurant/umi.jpg",
    tags: ["Cafe", "Brunch", "Western"],
    priceRange: "$$",
    avgSpend: 180,
    distanceKm: 0.4,
    area: "Causeway Bay",
    address: "Fashion Walk, Causeway Bay",
    trustVerifiedPct: 88,
    rewardYieldPct: 4,
    livePosSync: true,
    supportsBooking: false,
    supportsTakeaway: true,
    bookingNotes: "Walk-in mainly.",
    takeawayNotes: "Pickup within 15 minutes.",
    summary: "Casual brunch cafe known for all-day breakfast and coffee.",
    signatureDishes: [
      { name: "All Day Breakfast", image: "/images/food/breakfast.jpg", tags: ["Brunch"] },
      { name: "Avocado Toast", image: "/images/food/avocado_toast.jpg", tags: ["Healthy"] },
    ],
    takeawayMenu: [
      { id: "umi-0", name: "All Day Breakfast", image: "/images/food/breakfast.jpg", price: 128, tags: ["Brunch"], available: true },
      { id: "umi-1", name: "Breakfast Set", image: "/images/food/breakfast.jpg", price: 128, tags: ["Brunch"], available: true },
      { id: "umi-2", name: "Latte", image: "/images/food/avocado_toast.jpg", price: 38, tags: ["Coffee"], available: true },
      { id: "umi-3", name: "Avocado Toast", image: "/images/food/avocado_toast.jpg", price: 86, tags: ["Healthy"], available: true },
      { id: "umi-4", name: "Scrambled Eggs Toast", image: "/images/food/breakfast.jpg", price: 72, tags: ["Breakfast"], available: true },
      { id: "umi-5", name: "Iced Black Coffee", image: "/images/food/avocado_toast.jpg", price: 30, tags: ["Coffee"], available: true },
      { id: "umi-6", name: "Greek Yogurt Bowl", image: "/images/food/breakfast.jpg", price: 68, tags: ["Light"], available: true },
    ],
  },
  {
    id: "casamigos",
    name: "Casamigos",
    coverImage: "/images/restaurant/casamigos.jpg",
    tags: ["Spanish", "Tapas", "Wine"],
    priceRange: "$$$",
    avgSpend: 360,
    distanceKm: 0.7,
    area: "Causeway Bay",
    address: "Jardine House Area, Causeway Bay",
    trustVerifiedPct: 90,
    rewardYieldPct: 5,
    livePosSync: false,
    supportsBooking: true,
    supportsTakeaway: false,
    bookingNotes: "Great for group dinners.",
    takeawayNotes: "Not available.",
    summary: "Spanish tapas restaurant perfect for wine nights and social dining.",
    signatureDishes: [
      { name: "Spanish Paella", image: "/images/food/paella.jpg", tags: ["Signature"] },
      { name: "Garlic Prawns", image: "/images/food/garlic_prawn.jpg", tags: ["Seafood"] },
    ],
    takeawayMenu: [],
  },
  {
    id: "milu-thai",
    name: "Milu Thai",
    coverImage: "/images/restaurant/milu_thai.jpg",
    tags: ["Thai", "Spicy", "Seafood"],
    priceRange: "$$",
    avgSpend: 200,
    distanceKm: 0.5,
    area: "Causeway Bay",
    address: "Bartlock Centre, Causeway Bay",
    trustVerifiedPct: 87,
    rewardYieldPct: 5,
    livePosSync: false,
    supportsBooking: false,
    supportsTakeaway: true,
    bookingNotes: "Walk-in friendly.",
    takeawayNotes: "Fast takeaway pickup.",
    summary: "Popular Thai spot known for bold flavors and spicy seafood dishes.",
    signatureDishes: [
      { name: "Tom Yum Soup", image: "/images/food/tomyum.jpg", tags: ["Spicy"] },
      { name: "Thai Crab Omelette", image: "/images/food/crab_omelette.jpg", tags: ["Signature"] },
    ],
    takeawayMenu: [
      { id: "milu-0", name: "Tom Yum Soup", image: "/images/food/tomyum.jpg", price: 108, tags: ["Soup", "Spicy"], available: true },
      { id: "milu-1", name: "Pad Thai", image: "/images/food/tomyum_noodle.jpg", price: 98, tags: ["Noodles"], available: true },
      { id: "milu-2", name: "Green Curry", image: "/images/food/tomyum.jpg", price: 108, tags: ["Spicy"], available: true },
      { id: "milu-3", name: "Thai Crab Omelette", image: "/images/food/crab_omelette.jpg", price: 138, tags: ["Signature"], available: true },
      { id: "milu-4", name: "Mango Sticky Rice", image: "/images/food/laksa.jpg", price: 62, tags: ["Dessert"], available: true },
      { id: "milu-5", name: "Thai Milk Tea", image: "/images/food/tomyum.jpg", price: 28, tags: ["Drink"], available: true },
      { id: "milu-6", name: "Shrimp Cake", image: "/images/food/garlic_prawn.jpg", price: 76, tags: ["Side"], available: true },
    ],
  },
  {
    id: "atas",
    name: "A.T.A.S",
    coverImage: "/images/restaurant/atas.jpg",
    tags: ["Singaporean", "Casual Dining"],
    priceRange: "$$",
    avgSpend: 170,
    distanceKm: 0.3,
    area: "Causeway Bay",
    address: "Fashion Walk, Causeway Bay",
    trustVerifiedPct: 86,
    rewardYieldPct: 4,
    livePosSync: true,
    supportsBooking: false,
    supportsTakeaway: true,
    bookingNotes: "No reservation needed.",
    takeawayNotes: "Quick takeaway available.",
    summary: "Singaporean comfort food with reliable lunch crowd.",
    signatureDishes: [
      { name: "Laksa", image: "/images/food/laksa.jpg", tags: ["Signature"] },
      { name: "Hainan Chicken Rice", image: "/images/food/chicken_rice.jpg", tags: ["Classic"] },
    ],
    takeawayMenu: [
      { id: "atas-1", name: "Laksa", image: "/images/food/laksa.jpg", price: 88, tags: ["Noodles"], available: true },
      { id: "atas-2", name: "Chicken Rice", image: "/images/food/chicken_rice.jpg", price: 92, tags: ["Rice"], available: true },
      { id: "atas-3", name: "Kaya Toast Set", image: "/images/food/breakfast.jpg", price: 48, tags: ["Snack"], available: true },
      { id: "atas-4", name: "Hainan Chicken Rice Set", image: "/images/food/chicken_rice.jpg", price: 118, tags: ["Set"], available: true },
      { id: "atas-5", name: "Teh Tarik", image: "/images/food/laksa.jpg", price: 26, tags: ["Drink"], available: true },
      { id: "atas-6", name: "Prawn Laksa", image: "/images/food/laksa.jpg", price: 102, tags: ["Seafood"], available: true },
    ],
  },
  {
    id: "thai-simple-kitchen",
    name: "Thai Simple Kitchen",
    coverImage: "/images/restaurant/thai_simple.jpg",
    tags: ["Thai", "Casual"],
    priceRange: "$$",
    avgSpend: 160,
    distanceKm: 0.6,
    area: "Causeway Bay",
    address: "Tang Lung Street Area, Causeway Bay",
    trustVerifiedPct: 85,
    rewardYieldPct: 4,
    livePosSync: false,
    supportsBooking: false,
    supportsTakeaway: true,
    bookingNotes: "Walk-in.",
    takeawayNotes: "Takeaway within 15 mins.",
    summary: "Simple Thai comfort dishes popular with nearby office workers.",
    signatureDishes: [
      { name: "Thai Basil Pork Rice", image: "/images/food/basil_pork.jpg", tags: ["Classic"] },
      { name: "Tom Yum Noodles", image: "/images/food/tomyum_noodle.jpg", tags: ["Spicy"] },
    ],
    takeawayMenu: [
      { id: "tsk-1", name: "Basil Pork Rice", image: "/images/food/basil_pork.jpg", price: 78, tags: ["Rice"], available: true },
      { id: "tsk-2", name: "Tom Yum Noodles", image: "/images/food/tomyum_noodle.jpg", price: 88, tags: ["Noodles"], available: true },
      { id: "tsk-3", name: "Thai Fried Rice", image: "/images/food/chicken_rice.jpg", price: 82, tags: ["Rice"], available: true },
      { id: "tsk-4", name: "Pad Kra Pao Egg", image: "/images/food/basil_pork.jpg", price: 84, tags: ["Top Seller"], available: true },
      { id: "tsk-5", name: "Tom Yum Soup", image: "/images/food/tomyum.jpg", price: 72, tags: ["Soup"], available: true },
      { id: "tsk-6", name: "Thai Iced Lemon Tea", image: "/images/food/tomyum.jpg", price: 24, tags: ["Drink"], available: true },
    ],
  },
];

export const membershipCards: MembershipCard[] = [
  {
    id: "mano-the-l-square",
    restaurantId: "mano-the-l-square",
    name: "MANO Membership",
    image: "/images/membership/mano_membership.png",
    tier: "Gold",
    theme: "violet",
    acquisition: {
      type: "PAID",
      price: 388,
      note: "Available for direct purchase in app.",
    },
    offers: [
      { id: "mano-1", title: "10% off handmade pasta", subtitle: "Mon–Thu dinner", discountLabel: "10% OFF", terms: "Dine-in only. Excludes set menus." },
      { id: "mano-2", title: "Birthday dessert on the house", subtitle: "Birthday month", discountLabel: "FREE", terms: "One per member. Show ID at checkout." },
    ],
  },
  {
    id: "umi-cwb",
    restaurantId: "umi-cwb",
    name: "UMI Membership",
    image: "/images/membership/umi_membership.png",
    tier: "Bronze",
    theme: "sky",
    acquisition: {
      type: "FREE",
      note: "Free to claim for all users this month.",
    },
    offers: [
      { id: "umi-1", title: "Free upgrade to oat milk", subtitle: "Any latte", discountLabel: "FREE", terms: "One upgrade per order." },
      { id: "umi-2", title: "Brunch set discount", subtitle: "Weekends 11:00–14:00", discountLabel: "HK$20 OFF", terms: "Minimum spend HK$120." },
    ],
  },
  {
    id: "casamigos",
    restaurantId: "casamigos",
    name: "Casamigos Membership",
    image: "/images/membership/casamigos_membership.png",
    tier: "Silver",
    theme: "orange",
    acquisition: {
      type: "APPROVAL",
      note: "Requires restaurant approval after application.",
    },
    offers: [
      { id: "casa-1", title: "Tapas bundle deal", subtitle: "Choose 3 tapas", discountLabel: "HK$60 OFF", terms: "Dine-in only. Limited to selected tapas." },
      { id: "casa-2", title: "Wine-by-the-glass promo", subtitle: "Sun–Thu", discountLabel: "2nd 50%", terms: "Same wine only." },
    ],
  },
  {
    id: "milu-thai",
    restaurantId: "milu-thai",
    name: "Milu Thai Membership",
    image: "/images/membership/miluThai_membership.png",
    tier: "Silver",
    theme: "emerald",
    acquisition: {
      type: "PAID",
      price: 188,
      note: "Purchase once to unlock takeaway and dine-in perks.",
    },
    offers: [
      { id: "milu-1", title: "Green curry discount", subtitle: "Takeaway & dine-in", discountLabel: "HK$15 OFF", terms: "One per order." },
      { id: "milu-2", title: "Free iced Thai tea", subtitle: "With any main", discountLabel: "FREE", terms: "While stocks last." },
    ],
  },
  {
    id: "atas",
    restaurantId: "atas",
    name: "A.T.A.S Membership",
    image: "/images/membership/atas_membership.png",
    tier: "Bronze",
    theme: "sky",
    acquisition: {
      type: "FREE",
      note: "Claimable after your first completed order.",
    },
    offers: [
      { id: "atas-1", title: "Laksa add-on topping", subtitle: "Choose one", discountLabel: "FREE", terms: "Egg / tofu / fish cake. One per bowl." },
      { id: "atas-2", title: "Lunch set discount", subtitle: "Weekdays 12:00–15:00", discountLabel: "HK$10 OFF", terms: "Minimum spend HK$80." },
    ],
  },
  {
    id: "thai-simple-kitchen",
    restaurantId: "thai-simple-kitchen",
    name: "Thai Simple Membership",
    image: "/images/membership/thaiSimple_membership.png",
    tier: "Gold",
    theme: "orange",
    acquisition: {
      type: "APPROVAL",
      note: "Distributed by the restaurant to selected members.",
    },
    offers: [
      { id: "tsk-1", title: "Basil pork rice promo", subtitle: "Weekday takeaway", discountLabel: "HK$8 OFF", terms: "One per order." },
      { id: "tsk-2", title: "Free extra fried egg", subtitle: "With any rice bowl", discountLabel: "FREE", terms: "Dine-in only." },
    ],
  },
];

export const user: User = {
  id: "user-opensesame",
  name: "OpenSesame User",
  avatar: "/images/avatar-1.jpg",
  reputationScore: 91,
  diningRankLabel: "Trust Curator Lv.7",
  preferences: {
    cuisines: ["Italian", "Thai", "Cafe", "Spanish"],
    budgetRange: "HK$100 - HK$450",
    dietaryRestrictions: ["Low sugar"],
    areas: ["Causeway Bay"],
  },
  wallet: {
    viraBalance: 1380,
    stakedBalance: 3200,
    apyPct: 4,
    todayEarnings: 12.8,
  },
  nfts: {
    membershipTier: "Gold Member NFT",
    referralTier: "Connector Tier II",
    referralEarningsTotal: 236,
    referralGraph: { level1Count: 16, level2Count: 34 },
  },
  savedRestaurantIds: ["mano-the-l-square", "casamigos", "milu-thai"],
  visitedRestaurantIds: ["umi-cwb", "atas", "thai-simple-kitchen"],
  membershipCardIds: ["umi-cwb", "casamigos", "mano-the-l-square"],
};

export const bookings: Booking[] = [
  {
    id: "bk-1001",
    restaurantId: "mano-the-l-square",
    datetime: "2026-02-27T19:00:00.000Z",
    partySize: 2,
    status: "CONFIRMED",
    verificationStatus: "AUTO",
    paymentStatus: "PAID_OSM",
    rewardEstimateVira: 32,
    notes: "Anniversary",
  },
  {
    id: "bk-1002",
    restaurantId: "casamigos",
    datetime: "2026-02-21T20:00:00.000Z",
    partySize: 4,
    status: "COMPLETED",
    verificationStatus: "VERIFIED",
    paymentStatus: "PAID_OSM",
    rewardEstimateVira: 30,
  },
  {
    id: "bk-1003",
    restaurantId: "mano-the-l-square",
    datetime: "2026-02-28T18:30:00.000Z",
    partySize: 3,
    status: "CONFIRMED",
    verificationStatus: "QR_REQUIRED",
    paymentStatus: "UNPAID",
    rewardEstimateVira: 24,
  },
];

export const orders: TakeawayOrder[] = [
  {
    id: "od-2001",
    restaurantId: "umi-cwb",
    items: [
      { menuItemId: "umi-1", qty: 1 },
      { menuItemId: "umi-2", qty: 1 },
    ],
    subtotal: 166,
    status: "READY",
    paymentStatus: "UNPAID",
    verificationStatus: "AUTO",
    rewardEstimateVira: 12,
  },
  {
    id: "od-2002",
    restaurantId: "milu-thai",
    items: [
      { menuItemId: "milu-1", qty: 1 },
      { menuItemId: "milu-2", qty: 1 },
    ],
    subtotal: 206,
    status: "PICKED_UP",
    paymentStatus: "PAID_OSM",
    verificationStatus: "VERIFIED",
    rewardEstimateVira: 14,
  },
  {
    id: "od-2003",
    restaurantId: "atas",
    items: [
      { menuItemId: "atas-1", qty: 1 },
      { menuItemId: "atas-2", qty: 1 },
    ],
    subtotal: 180,
    status: "PLACED",
    paymentStatus: "UNPAID",
    verificationStatus: "QR_REQUIRED",
    rewardEstimateVira: 11,
  },
];

export const transactions: WalletTx[] = [
  {
    id: "tx-1",
    type: "PAY",
    amountVira: -220,
    counterparty: "MANO",
    bookingId: "bk-1001",
    restaurantId: "mano-the-l-square",
    createdAt: "2026-02-20T09:20:00.000Z",
    status: "CONFIRMED",
    note: "Booking payment",
  },
  {
    id: "tx-2",
    type: "REWARD",
    amountVira: 12,
    counterparty: "Milu Thai",
    orderId: "od-2002",
    restaurantId: "milu-thai",
    createdAt: "2026-02-22T11:30:00.000Z",
    status: "CONFIRMED",
    note: "Pickup reward",
  },
  {
    id: "tx-3",
    type: "STAKE",
    amountVira: -400,
    createdAt: "2026-02-18T10:00:00.000Z",
    status: "CONFIRMED",
    note: "Stake allocation",
  },
  {
    id: "tx-4",
    type: "BUY",
    amountVira: 200,
    createdAt: "2026-02-16T07:30:00.000Z",
    status: "CONFIRMED",
    note: "Card top-up",
  },
];

export const reviews: Review[] = [
  {
    id: "rv-1",
    userId: "user-opensesame",
    restaurantId: "casamigos",
    relatedType: "BOOKING",
    relatedId: "bk-1002",
    createdAt: "2026-02-22T08:30:00.000Z",
    agreeCount: 34,
    disagreeCount: 8,
    ratings: { food: 5, service: 4, atmosphere: 4 },
    text: "Tapas came out quickly and worked well for sharing with 4 people.",
    photos: ["/images/food/paella.jpg"],
    verifiedVisit: true,
    verificationMethod: "QR",
    txHash: "0x83ab..112f",
    userReputationScore: 91,
    helpedDecisions: 94,
    aiCitations: 17,
    tags: ["group", "tapas", "timely"],
    userName: "OpenSesame User",
    userAvatar: "/images/avatar-1.jpg",
  },
  {
    id: "rv-2",
    userId: "user-ada-loves-food",
    restaurantId: "umi-cwb",
    relatedType: "VISIT",
    relatedId: "vs-9001",
    createdAt: "2026-02-21T12:45:00.000Z",
    agreeCount: 21,
    disagreeCount: 9,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Coffee and all day breakfast are consistent, good for casual brunch.",
    photos: ["/images/food/breakfast.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 90,
    helpedDecisions: 73,
    aiCitations: 11,
    tags: ["brunch", "coffee", "quick"],
    userName: "AdaLovesFood",
    userAvatar: "/images/food/breakfast.jpg",
  },
  {
    id: "rv-3",
    userId: "user-noodle-scout",
    restaurantId: "milu-thai",
    relatedType: "VISIT",
    relatedId: "vs-9002",
    createdAt: "2026-02-23T12:10:00.000Z",
    agreeCount: 47,
    disagreeCount: 6,
    ratings: { food: 5, service: 4, atmosphere: 3 },
    text: "Tom yum soup had bold flavor and solid seafood portion. Spice level is clear and the kitchen is fast even during dinner rush.",
    photos: ["/images/food/tomyum.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 87,
    helpedDecisions: 68,
    aiCitations: 9,
    tags: ["spicy", "seafood", "quick"],
    userName: "NoodleScout",
    userAvatar: "/images/food/laksa.jpg",
  },
  {
    id: "rv-7",
    userId: "user-after-work-eats",
    restaurantId: "thai-simple-kitchen",
    relatedType: "TAKEAWAY",
    relatedId: "od-2003",
    createdAt: "2026-02-24T11:20:00.000Z",
    agreeCount: 18,
    disagreeCount: 5,
    ratings: { food: 4, service: 5, atmosphere: 3 },
    text: "Basil pork rice is a reliable after-work takeaway. Portion is fair and pickup is usually fast.",
    photos: [],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 86,
    helpedDecisions: 44,
    aiCitations: 6,
    tags: ["comfort", "takeaway", "quick"],
    userName: "AfterWorkEats",
    userAvatar: "/images/food/tomyum.jpg",
  },
  {
    id: "rv-4",
    userId: "user-hkfoodmap",
    restaurantId: "mano-the-l-square",
    relatedType: "VISIT",
    relatedId: "vs-9003",
    createdAt: "2026-02-20T18:05:00.000Z",
    agreeCount: 52,
    disagreeCount: 11,
    ratings: { food: 5, service: 4, atmosphere: 4 },
    text: "Pasta texture is excellent and the room feels relaxed for long dinners.",
    photos: ["/images/food/truffle_pasta.jpg"],
    verifiedVisit: true,
    verificationMethod: "QR",
    txHash: "0x4fa1..7b2c",
    userReputationScore: 92,
    helpedDecisions: 101,
    aiCitations: 14,
    tags: ["date night", "signature dish", "italian"],
    userName: "HKFoodMap",
    userAvatar: "/images/food/paella.jpg",
  },
  {
    id: "rv-8",
    userId: "user-dinner-planner",
    restaurantId: "casamigos",
    relatedType: "BOOKING",
    relatedId: "bk-1002",
    createdAt: "2026-02-24T08:05:00.000Z",
    agreeCount: 29,
    disagreeCount: 12,
    ratings: { food: 5, service: 4, atmosphere: 4 },
    text: "Booked this for a friend gathering. Paella and garlic prawns are both solid picks and easy to share.",
    photos: ["/images/food/garlic_prawn.jpg"],
    verifiedVisit: true,
    verificationMethod: "QR",
    txHash: "0x7c2e..19aa",
    userReputationScore: 89,
    helpedDecisions: 77,
    aiCitations: 10,
    tags: ["group", "booking", "reliable"],
    userName: "DinnerPlanner",
    userAvatar: "/images/food/truffle_pasta.jpg",
  },
  {
    id: "rv-5",
    userId: "user-omakase-weekly",
    restaurantId: "mano-the-l-square",
    relatedType: "BOOKING",
    relatedId: "bk-1001",
    createdAt: "2026-02-19T09:15:00.000Z",
    agreeCount: 17,
    disagreeCount: 9,
    ratings: { food: 5, service: 5, atmosphere: 5 },
    text: "Service flow is polished and the mains are consistently good. Worth booking for celebrations.",
    photos: ["/images/food/truffle_pasta.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 95,
    helpedDecisions: 88,
    aiCitations: 16,
    tags: ["date night", "premium", "italian"],
    userName: "OmakaseWeekly",
    userAvatar: "/images/food/burrata.jpg",
  },
  {
    id: "rv-9",
    userId: "user-sushi-notes",
    restaurantId: "casamigos",
    relatedType: "VISIT",
    relatedId: "vs-9004",
    createdAt: "2026-02-24T18:25:00.000Z",
    agreeCount: 13,
    disagreeCount: 11,
    ratings: { food: 5, service: 5, atmosphere: 5 },
    text: "Wine pairings work well with tapas and pacing is smooth. Good spot when you want a social dinner with enough variety.",
    photos: ["/images/food/paella.jpg", "/images/food/garlic_prawn.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 94,
    helpedDecisions: 66,
    aiCitations: 12,
    tags: ["wine", "service", "celebration"],
    userName: "SushiNotes",
    userAvatar: "/images/food/garlic_prawn.jpg",
  },
  {
    id: "rv-6",
    userId: "user-dessert-radar",
    restaurantId: "atas",
    relatedType: "TAKEAWAY",
    relatedId: "od-2003",
    createdAt: "2026-02-18T15:40:00.000Z",
    agreeCount: 41,
    disagreeCount: 7,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Laksa is comforting and takeaway packing holds up well.",
    photos: ["/images/food/laksa.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 83,
    helpedDecisions: 57,
    aiCitations: 7,
    tags: ["value", "takeaway", "singaporean"],
    userName: "DessertRadar",
    userAvatar: "/images/food/avocado_toast.jpg",
  },
  {
    id: "rv-10",
    userId: "user-snack-seeker",
    restaurantId: "thai-simple-kitchen",
    relatedType: "VISIT",
    relatedId: "vs-9005",
    createdAt: "2026-02-23T09:35:00.000Z",
    agreeCount: 22,
    disagreeCount: 6,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Simple menu but dependable flavor. Good quick stop around Tang Lung Street when you want a no-fuss Thai meal.",
    photos: ["/images/food/tomyum_noodle.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 84,
    helpedDecisions: 39,
    aiCitations: 5,
    tags: ["thai", "queue", "quick"],
    userName: "SnackSeeker",
    userAvatar: "/images/food/chicken_rice.jpg",
  },
  {
    id: "rv-11",
    userId: "user-brunch-hunter",
    restaurantId: "umi-cwb",
    relatedType: "VISIT",
    relatedId: "vs-9006",
    createdAt: "2026-02-25T10:20:00.000Z",
    agreeCount: 26,
    disagreeCount: 4,
    ratings: { food: 4, service: 4, atmosphere: 4 },
    text: "Strong coffee and comfortable seating. Easy brunch option with consistent quality.",
    photos: ["/images/food/breakfast.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 88,
    helpedDecisions: 52,
    aiCitations: 8,
    tags: ["brunch", "coffee", "casual"],
    userName: "BrunchHunter",
    userAvatar: "/images/food/crab_omelette.jpg",
  },
  {
    id: "rv-12",
    userId: "user-pasta-club",
    restaurantId: "mano-the-l-square",
    relatedType: "BOOKING",
    relatedId: "bk-1001",
    createdAt: "2026-02-26T13:00:00.000Z",
    agreeCount: 33,
    disagreeCount: 7,
    ratings: { food: 5, service: 5, atmosphere: 4 },
    text: "Truffle pasta is rich but balanced. Great date-night pacing and attentive staff.",
    photos: ["/images/food/truffle_pasta.jpg"],
    verifiedVisit: true,
    verificationMethod: "QR",
    txHash: "0x9a22..19ff",
    userReputationScore: 93,
    helpedDecisions: 76,
    aiCitations: 12,
    tags: ["italian", "date night", "signature"],
    userName: "PastaClub",
    userAvatar: "/images/food/tomyum_noodle.jpg",
  },
  {
    id: "rv-13",
    userId: "user-laksa-diary",
    restaurantId: "atas",
    relatedType: "VISIT",
    relatedId: "vs-9007",
    createdAt: "2026-02-25T04:30:00.000Z",
    agreeCount: 19,
    disagreeCount: 3,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Laksa broth is fragrant and not too heavy. Good value for weekday lunch.",
    photos: ["/images/food/laksa.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 86,
    helpedDecisions: 41,
    aiCitations: 5,
    tags: ["singaporean", "lunch", "value"],
    userName: "LaksaDiary",
    userAvatar: "/images/food/basil_pork.jpg",
  },
  {
    id: "rv-14",
    userId: "user-spice-meter",
    restaurantId: "milu-thai",
    relatedType: "TAKEAWAY",
    relatedId: "od-2002",
    createdAt: "2026-02-26T07:10:00.000Z",
    agreeCount: 28,
    disagreeCount: 6,
    ratings: { food: 5, service: 4, atmosphere: 3 },
    text: "Green curry and tom yum are both spicy enough and takeaway packaging is secure.",
    photos: ["/images/food/green_curry.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 90,
    helpedDecisions: 59,
    aiCitations: 9,
    tags: ["thai", "spicy", "takeaway"],
    userName: "SpiceMeter",
    userAvatar: "/images/food/avocado_toast.jpg",
  },
  {
    id: "rv-15",
    userId: "user-tapas-notes",
    restaurantId: "casamigos",
    relatedType: "VISIT",
    relatedId: "vs-9008",
    createdAt: "2026-02-24T14:55:00.000Z",
    agreeCount: 24,
    disagreeCount: 4,
    ratings: { food: 5, service: 4, atmosphere: 4 },
    text: "Paella is great for sharing and garlic prawns are a safe order for groups.",
    photos: ["/images/food/paella.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 89,
    helpedDecisions: 63,
    aiCitations: 8,
    tags: ["tapas", "wine", "group"],
    userName: "TapasNotes",
    userAvatar: "/images/food/burrata.jpg",
  },
  {
    id: "rv-16",
    userId: "user-cwb-lunch-map",
    restaurantId: "thai-simple-kitchen",
    relatedType: "VISIT",
    relatedId: "vs-9009",
    createdAt: "2026-02-25T03:40:00.000Z",
    agreeCount: 16,
    disagreeCount: 2,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Fast service and reliable basil pork rice. Good office-lunch option in CWB.",
    photos: ["/images/food/basil_pork.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 85,
    helpedDecisions: 33,
    aiCitations: 4,
    tags: ["thai", "quick", "office lunch"],
    userName: "CWBLunchMap",
    userAvatar: "/images/food/garlic_prawn.jpg",
  },
  {
    id: "rv-17",
    userId: "user-weekend-bites",
    restaurantId: "umi-cwb",
    relatedType: "TAKEAWAY",
    relatedId: "od-2001",
    createdAt: "2026-02-26T09:35:00.000Z",
    agreeCount: 14,
    disagreeCount: 3,
    ratings: { food: 4, service: 4, atmosphere: 4 },
    text: "Avocado toast and latte combo travels well. Great for a quick weekend pickup.",
    photos: ["/images/food/avocado_toast.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 84,
    helpedDecisions: 27,
    aiCitations: 3,
    tags: ["brunch", "takeaway", "coffee"],
    userName: "WeekendBites",
    userAvatar: "/images/food/laksa.jpg",
  },
  {
    id: "rv-18",
    userId: "user-curry-and-rice",
    restaurantId: "atas",
    relatedType: "TAKEAWAY",
    relatedId: "od-2004",
    createdAt: "2026-02-26T06:20:00.000Z",
    agreeCount: 21,
    disagreeCount: 5,
    ratings: { food: 4, service: 4, atmosphere: 3 },
    text: "Chicken rice is juicy and portion is stable. Easy and dependable takeaway.",
    photos: ["/images/food/chicken_rice.jpg"],
    verifiedVisit: true,
    verificationMethod: "AUTO",
    txHash: null,
    userReputationScore: 87,
    helpedDecisions: 46,
    aiCitations: 6,
    tags: ["chicken rice", "value", "quick"],
    userName: "CurryAndRice",
    userAvatar: "/images/food/breakfast.jpg",
  },
];

export const qrPayloadSamples: { label: string; payload: string }[] = [
  {
    label: "PAY UMI takeaway order",
    payload: JSON.stringify({
      type: "PAY",
      merchantId: "m-umi",
      restaurantId: "umi-cwb",
      orderId: "od-2001",
      amount: 166,
      nonce: "n-1100",
      timestamp: "2026-02-24T09:40:00.000Z",
    }),
  },
  {
    label: "VERIFY MANO booking",
    payload: JSON.stringify({
      type: "VERIFY",
      merchantId: "m-mano",
      restaurantId: "mano-the-l-square",
      bookingId: "bk-1003",
      nonce: "n-1101",
      timestamp: "2026-02-24T09:50:00.000Z",
    }),
  },
  {
    label: "Combined PAY Milu takeaway",
    payload: JSON.stringify({
      type: "PAY",
      merchantId: "m-milu",
      restaurantId: "milu-thai",
      orderId: "od-2002",
      amount: 206,
      nonce: "n-1102",
      timestamp: "2026-02-24T10:00:00.000Z",
    }),
  },
];

export const reviewTags = [
  "Value",
  "Service",
  "Date Night",
  "Family",
  "Late Night",
  "Signature Dish",
  "Quiet",
  "Fast Seating",
];

export const referralLink = "https://opensesame.app/r/opensesame-user-021";
