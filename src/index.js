import { calculatePrice } from "./discount.js";

const price = 2_000_000;
const discountPercent = 10;
const finalPrice = calculatePrice(price, discountPercent);

console.log(`Original price: ${price}`);
console.log(`Discount: ${discountPercent}%`);
console.log(`Final price 11: ${finalPrice}`);