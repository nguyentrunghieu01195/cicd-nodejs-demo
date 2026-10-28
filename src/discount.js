export function calculatePrice(price, discountPercent) {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("price must be a non-negative number");
  }

  if (!Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100) {
    throw new Error("discountPercent must be between 0 and 100");
  }

  return price - (price * discountPercent / 100);
}
