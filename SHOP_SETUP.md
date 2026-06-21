# Panis Vivus Shop — Setup & Launch Guide (Shopify + Printify)

The merch shop is a **hosted Shopify store** themed to Panis Vivus, reached from a hidden
page on this site: [`shop.html`](shop.html). Apparel is printed and shipped automatically by
**Printify** (native Shopify integration). "Stay Leavened" is a collection inside the store;
the beeswax bread bag is sold as your own stocked inventory.

```
Customer on odbread.com -> shop.html ("Visit the shop") -> Shopify store (shop.odbread.com)
   -> Shopify checkout
       |-- Tee / hoodie / apron -> Printify prints + ships automatically (native integration)
       `-- Beeswax bread bag      -> you ship from a small stock
```

Why this stack: Printify integrates with Shopify **natively** (first-party), so order ->
print -> ship is hands-off and reliable. Shopify is the storefront; this site links to it.

Status: **live.** `shop.html` is linked in the site nav and indexable, and the Shopify store
is public (no storefront password). The store link currently points to the `*.myshopify.com`
address and will be swapped to `shop.odbread.com` once that subdomain is connected (see step 7-8).

---

## 1. Shopify + Printify (done)

You've created the Shopify store, installed Printify, and added a first product. Remaining
config to make fulfillment bulletproof and on-brand:

## 2. Make fulfillment fully automatic (todo)

By default Printify holds new orders for manual approval. To make it hands-off:
- **Printify dashboard -> Settings -> Order approval -> enable automatic approval** (auto-submit
  orders to production). With this on: paid Shopify order -> auto-sent to Printify -> printed ->
  shipped -> tracking synced back to Shopify (customer gets the email automatically).
- In **Printify -> Settings**, add a billing method so production isn't paused waiting on payment.
- Confirm Shopify shipping: let Printify-driven rates flow through, or set flat rates that cover
  Printify's shipping cost. Avoid offering in-store pickup on Printify items.

## 3. Products & collections (todo)

1. In Printify, build products from the artwork in `../Stay_Leavened/t-shirts/`
   (Retro = the fun "Stay Leavened" line; Military = the quieter line). Publish each to Shopify.
2. In Shopify, create collections: **Stay Leavened**, **Hoodies**, **Aprons**, **Kitchen Goods**,
   and assign products. (These match the cards on `shop.html`.)
3. Order a **sample** of anything before selling it. With Printify, you can switch a product to a
   different print provider if quality/turnaround disappoints.
4. Recommended: keep Printify on the **Free** plan; move to annual Premium ($24.99/mo) only once
   you're consistently past ~17 orders/month (that's where the product discount outweighs the fee).

## 4. Beeswax bread bag (todo)

Not print-on-demand — a custom-manufactured (OEM/private-label) item you stock and ship yourself.
1. Request samples + MOQ/lead time from:
   - **Green Wrap** — https://www.greenbeeswrap.com (OEM/ODM, custom print + logo, ~15-30 day lead).
   - **INITI** — https://initibag.com/bread-bags/ (linen/cotton bread bags, OEM/ODM).
2. Approve a sample, place a small first run with your logo.
3. In Shopify, add it as a normal product with **inventory tracking** (not connected to Printify).
   You pack and ship these yourself.

## 5. Staff uniforms (todo)

Internal gear, kept **out** of the public shop. Order in bulk: Printify (or a uniform house /
local screen printer) for embroidered tees and aprons with the logo.

## 6. Brand the Shopify store to match Panis Vivus (todo)

In Shopify -> Online Store -> Themes -> Customize, match the bakery look:
- Colors: Warm Sepia `#C6A676`, Iron Brown `#4A3B2E`, Brick Red `#A7322B`, Cream `#F9F5EC`.
- Fonts: headings **EB Garamond**, body **Libre Franklin**.
- Upload the Panis Vivus logo; set footer text to "Our Daily Bread LLC".
- Add a header link back to `https://odbread.com`.

## 7. Connect the subdomain (todo)

Point **shop.odbread.com** at Shopify so the store feels like part of the site:
1. Shopify -> Settings -> Domains -> Connect existing domain -> `shop.odbread.com`.
2. At your DNS provider, add the **CNAME** Shopify shows (subdomain -> `shops.myshopify.com`).
3. Once it verifies, the store lives at `https://shop.odbread.com`.

## 8. Point this site's button at the store

The two "Visit the shop" / "Browse the full catalog" links in [`shop.html`](shop.html) currently
point to `https://9jcm4d-rh.myshopify.com`. Once `shop.odbread.com` is connected and loads over
HTTPS (step 7), swap both links to `https://shop.odbread.com`.

## 9. Launch status

Done:
- `shop.html` noindex removed; page is indexable.
- "Shop" link added to the nav on `index.html`, `photos.html`, and `shop.html`.
- Store link wired to the live `*.myshopify.com` address.

Remaining:
- Connect `shop.odbread.com` (steps 7-8) and swap the two links.
- Finish theming (step 6) and add products/collections (step 3) before promoting the shop widely,
  since the store is now public.

## Notes

- `shop.html` uses the site's strict CSP (no third-party embed needed — it's a plain link to
  the hosted store), so nothing extra to maintain there.
- Square: keep it for **in-person/POS** sales. It does not integrate natively with Printify, so
  it's not used for the online merch store.
