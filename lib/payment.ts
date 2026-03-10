import { type Restaurant } from "@/lib/mock-data";

const bookingDepositByRestaurant: Record<string, number> = {
  "mano-the-l-square": 120,
  casamigos: 100,
};

export function getBookingDepositAmount(restaurant: Restaurant) {
  return bookingDepositByRestaurant[restaurant.id] ?? 0;
}
