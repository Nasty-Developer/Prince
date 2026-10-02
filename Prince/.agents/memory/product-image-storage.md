---
name: Product image storage
description: Durable storage and URL rules for SaveStreet Dogs product images.
---

Product images use Firebase Storage download URLs in production rather than browser blob URLs or Replit object-storage URLs. Admin uploads save the persistent Firebase URL on the product record, and the same value flows through the catalog, details, cart, checkout, and order history.

**Why:** Render has no Replit object-storage sidecar, while Firebase is already the SaveStreet Dogs authentication and storage project. New production uploads must therefore be independent of Replit.

**How to apply:** Keep the Firebase upload flow for new product and puppy images. Legacy `/objects/...` records may remain readable in Replit development, but do not rewrite them to a Render-only endpoint or make Render startup depend on the Replit sidecar. Never use `blob:` URLs as database values or copy attached files into frontend public assets.