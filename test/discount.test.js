import test from "node:test";
import assert from "node:assert/strict";
import { calculatePrice } from "../src/discount.js";

test("applies a 10% discount", () => {
  assert.equal(calculatePrice(2_000_000, 10), 1_800_000);
});

test("zero discount keeps the original price", () => {
  assert.equal(calculatePrice(100, 0), 100);
});

test("rejects a negative price", () => {
  assert.throws(() => calculatePrice(-1, 10), /price must be/);
});

test("rejects a discount above 100%", () => {
  assert.throws(() => calculatePrice(100, 101), /discountPercent must be/);
});
