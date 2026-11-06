import type { Product } from "@workspace/api-client-react";

/**
 * The collar is the one product the team keeps in stock, and both product photos
 * belong to it. The shop catalog normally comes from /api/products, but that
 * endpoint can be unreachable (the storefront then says "temporarily
 * unavailable" and the photos never appear at all).
 *
 * This record keeps the home feature, the shop grid and the product page usable
 * in that case: the photos render, the cart works, and the order still goes to
 * the team on WhatsApp, which is where availability and payment are confirmed
 * anyway. Live catalog data always wins when it is available.
 */
export const FALLBACK_COLLAR_ID = "reflective-collars";

export function fallbackCollarProduct(): Product {
  return {
    id: FALLBACK_COLLAR_ID,
    name: "Reflective Collars",
    description:
      "Adjustable nylon collars with a reflective strip and a quick-release buckle, so a dog stays easier to see when the light drops. Available in several colours.",
    priceRupees: 60,
    // The team does not keep a live stock count; null is how the app marks that.
    stock: null as unknown as number,
    stockTracked: false,
    available: true,
    stockStatus: "IN STOCK",
    category: "Dog Accessories / Collars",
    // Photos are the two bundled studio shots, resolved by product name.
    imageUrls: [],
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}
