# 🌸 Blossom Boutique — Advanced Clothing Shop Website

> **Portfolio Sample Project** — Demonstrates a full-stack Sri Lankan e-commerce site built with Node.js, Express, and modern JavaScript.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express.js REST API |
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Animations** | GSAP 3 + ScrollTrigger + IntersectionObserver |
| **Styling** | CSS Custom Properties, Grid, Flexbox |
| **Storage** | localStorage (cart, wishlist, theme) |
| **PWA** | Service Worker + Web Manifest |

---

## ✨ Features

### Frontend
- 🎨 **Dark / Light Mode** — respects `prefers-color-scheme`, persisted in localStorage
- 🛒 **Shopping Cart Drawer** — add, remove, update qty, persisted across refreshes
- 👁️ **Quick View Modal** — size/color selection, qty control, add to cart
- 🔍 **Live Search** — debounced, searches name + category + description
- 🏷️ **Category Filters + Sort** — filter by category, sort by price/rating/popularity
- ❤️ **Wishlist** — toggle + persist in localStorage
- 🎠 **Hero Slideshow** — auto-play with dot navigation + touch swipe support
- ⭐ **Reviews Carousel** — scroll-snap with dot navigation
- 📊 **Count-Up Stats** — animated number counters on scroll
- 🔔 **Toast Notifications** — non-blocking feedback
- 📱 **Fully Responsive** — mobile hamburger nav, touch events
- 💅 **Skeleton Loaders** — shimmer placeholders while API loads
- 🌸 **Floating WhatsApp Button** — with pulsing ring animation

### Backend (Node.js + Express)
- `GET  /api/products` — all products (supports `?category=&search=&sort=`)
- `GET  /api/products/:id` — single product
- `GET  /api/categories` — distinct categories
- `POST /api/orders` — place an order (returns WhatsApp redirect URL)
- `GET  /api/stats` — store statistics

### PWA
- 📦 Service Worker with network-first (API) + cache-first (static) strategy
- 📱 Installable on Android/iOS via Web Manifest

---

## 🏁 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser
# → http://localhost:3000
```

For development with auto-restart:
```bash
npm run dev
```

---

## 📁 Project Structure

```
clothing-shop-site/
├── server.js            ← Express API server
├── package.json
├── .env                 ← PORT, WA number config
└── public/              ← Static files served by Express
    ├── index.html       ← Single-page application shell
    ├── manifest.json    ← PWA manifest
    ← sw.js             ← Service worker
    ├── css/
    │   └── style.css    ← All styles (dark mode, animations, responsive)
    └── js/
        └── app.js       ← All JavaScript (API, cart, filters, GSAP, etc.)
```

---

## 🔗 API Examples

```bash
# All products
curl http://localhost:3000/api/products

# Filter by category + sort by price
curl "http://localhost:3000/api/products?category=dresses&sort=price-asc"

# Search
curl "http://localhost:3000/api/products?search=linen"

# Stats
curl http://localhost:3000/api/stats
```

---

## 📸 Key JavaScript Patterns Used

- **Fetch API** with async/await for REST calls
- **IntersectionObserver** for scroll-reveal and lazy loading
- **GSAP ScrollTrigger** for parallax and stagger animations
- **localStorage** for cart, wishlist, and theme persistence
- **Service Worker** for offline caching (PWA)
- **Debounce** utility for search input performance
- **Module pattern** with `'use strict'`

---

*Made with 💗 · Orders via WhatsApp · Delivered island-wide across Sri Lanka*
