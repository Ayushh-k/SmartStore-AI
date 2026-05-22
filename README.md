# SmartStore AI — Luxury Editorial E-Commerce Platform

<div align="center">

![SmartStore AI](https://img.shields.io/badge/SmartStore-AI%20Powered-black?style=for-the-badge&logo=openai&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A full-stack AI-powered e-commerce application built with the MERN stack.**  
Featuring a Luxury Store Editorial aesthetic — pure black/white contrast, serif typography,  
AI shopping assistant, real-time admin dashboard, and automated order confirmation emails.

---

*Developed by **Ayush Kamboj** · B.Tech CSE · Winter PEP Project 2026*

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Features Overview](#-features-overview)
4. [Application Architecture](#-application-architecture)
5. [User-Facing Features (Storefront)](#-user-facing-features-storefront)
   - [Storefront & Product Catalog](#1-storefront--product-catalog)
   - [Product Detail Page (PDP)](#2-product-detail-page-pdp)
   - [Shopping Cart](#3-shopping-cart)
   - [Checkout Flow](#4-checkout-flow)
   - [User Profile & Account](#5-user-profile--account)
   - [Wishlist](#6-wishlist)
   - [Address Book](#7-address-book)
   - [AI Features for Shoppers](#8-ai-features-for-shoppers)
6. [Admin Dashboard Features](#-admin-dashboard-features)
   - [Analytics Dashboard](#1-analytics-dashboard)
   - [Product Management](#2-product-management)
   - [Order Management](#3-order-management)
7. [Backend API Reference](#-backend-api-reference)
8. [Database Models](#-database-models)
9. [Email Notification System](#-email-notification-system)
10. [Theme System (Light / Dark Mode)](#-theme-system-light--dark-mode)
11. [Responsive Design](#-responsive-design)
12. [Legal Pages & Footer](#-legal-pages--footer)
13. [Environment Variables](#-environment-variables)
14. [Installation & Running Locally](#-installation--running-locally)
15. [Project Structure](#-project-structure)
16. [Developer](#-developer)

---

## 🌟 Project Overview

**SmartStore AI** is a fully functional, production-grade e-commerce web application that goes beyond a typical shopping cart. It integrates an **OpenAI-powered AI assistant** directly into the shopping experience, allowing customers to:

- Ask questions about products in natural language
- Get AI-generated size recommendations based on their body measurements
- Receive personalized outfit/styling suggestions
- View real-time price trend analysis for any product

On the business side, a secure **Admin Dashboard** provides store managers with:

- Live sales analytics and KPIs
- Complete inventory & product management (CRUD)
- Full order history with customer and shipment details
- AI-powered tools to generate product descriptions, social media captions, and SEO tags automatically

The entire application is wrapped in a **Luxury Store Editorial** visual identity — sharp 0px edges, Playfair Display serif headings, Inter sans-serif body text, and a perfectly responsive black/white high-contrast design that works in both Light and Dark mode.

---

## 🛠 Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI framework with component-based architecture |
| **React Router v6** | Client-side routing with protected routes and layouts |
| **Tailwind CSS v3** | Utility-first responsive styling with class-based dark mode |
| **Vite** | Ultra-fast dev server and production bundler |
| **Lucide React** | Premium icon library |
| **Google Fonts** | Playfair Display (serif headings) + Inter (body) |

### Backend
| Technology | Role |
|---|---|
| **Node.js v22** | JavaScript runtime for the server |
| **Express.js** | REST API framework |
| **MongoDB Atlas** | Cloud NoSQL database |
| **Mongoose** | ODM for MongoDB schema modeling |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcrypt** | Password hashing |
| **OpenAI API (GPT-4o)** | Powers all AI features |
| **Nodemailer + Gmail SMTP** | Transactional order confirmation emails |
| **nodemon** | Dev server auto-restart |

---

## ✨ Features Overview

| Feature Category | Details |
|---|---|
| 🛍️ Storefront | Responsive product catalog with live search, filters, category/price sorting |
| 📦 Product Detail Page | Size & color selectors, image gallery, reviews, AI Q&A, size predictor, delivery check |
| 🛒 Shopping Cart | Persistent cart with quantity controls, size/color variant tracking, cart sharing |
| 💳 Checkout | Multi-step form (Shipping → Payment → Review), address auto-fill, order placement |
| 📧 Email | Luxury HTML order confirmation email sent automatically after checkout |
| 👤 User Profile | Order history, wishlist, address book, account settings — all in one tabbed page |
| 🤖 AI Shopping Assistant | Product Q&A, Size Advisor, Outfit Stylist, Price Insights — all GPT-4o powered |
| 📊 Admin Dashboard | Sales KPIs, revenue charts, recent orders, live notifications |
| 🏪 Product Manager | Full CRUD — add/edit/delete products with image URLs, sizes, colors, AI tools |
| 📋 Order Manager | View all customer orders, filter by status, see item-level size/color data |
| 🌙 Light / Dark Mode | System-aware theme toggle, persisted in localStorage |
| 📱 Responsive | Mobile-first design with hamburger nav, collapsible admin sidebar, fluid grids |
| ⚖️ Legal Pages | Terms & Conditions and Privacy Policy pages |

---

## 🏗 Application Architecture

```
smartstore-ai/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/     # All route-level page components
│       ├── components/# Shared layout components (Navbar, Footer, etc.)
│       ├── context/   # React Context (ThemeContext)
│       └── utils/     # Axios API instance
└── backend/           # Node.js + Express REST API
    ├── controllers/   # Business logic handlers
    ├── models/        # Mongoose database schemas
    ├── routes/        # Express route definitions
    ├── middleware/     # Auth + role guards
    └── utils/         # Mailer utility
```

The frontend and backend are **fully decoupled** — the React SPA communicates with the Express backend exclusively through a REST API. Authentication is handled via JWT tokens stored in `localStorage`.

---

## 🛍️ User-Facing Features (Storefront)

### 1. Storefront & Product Catalog

**File:** `frontend/src/pages/Storefront.jsx`

The homepage of the application. It displays the full product catalog fetched from the backend and provides powerful discovery tools.

**Key Features:**
- **Hero Banner** — Large editorial-style header with brand positioning
- **AI-Powered Search** — A smart search bar that queries the OpenAI GPT-4o API to return semantically relevant products, not just keyword matches. For example, searching "casual office wear for summer" will return contextually appropriate items even if those exact words are not in product names.
- **Category Filters** — One-click filter pills to narrow results by product category (e.g., Tops, Bottoms, Footwear). Filter state is tracked locally and resets gracefully.
- **Price Filter** — Slider or dropdown to filter products within a given price range.
- **Sort Controls** — Sort the catalog by Price (Low to High / High to Low), Newest First, or Most Reviewed.
- **Product Grid** — Responsive grid layout (`1 col → 2 col → 4 col`) displaying product cards. Each card shows the product image, name, price, category badge, stock status, and an average star rating.
- **Wishlist Heart** — Toggle wishlist directly from the product card without navigating away.
- **Stock Indicators** — Products with very low stock show an "Only X left" warning; out-of-stock items show a "Sold Out" overlay.
- **Shared Cart Import** — If a user visits with a `?importCart=...` query parameter (from the Cart Share feature), the app decodes and imports those items into their cart automatically.

---

### 2. Product Detail Page (PDP)

**File:** `frontend/src/pages/ProductPage.jsx`

The most feature-rich page in the application. Reached by clicking any product card.

**Layout:**
- **Left Column** — Large 3:4 aspect-ratio main product image, with an interactive horizontal thumbnail gallery beneath it for multi-image products.
- **Right Column** — All product metadata, selectors, and AI tools.

**Core Product Features:**
- **Brand Badge** — Displays the product's brand in gold (`#D4AF37`) lettering above the title.
- **Serif Product Title** — Displayed in Playfair Display uppercase for editorial impact.
- **Star Rating & Review Count** — Calculated dynamically from all user reviews.
- **Stock Counter** — Shows remaining inventory with color-coded urgency (neutral → amber → red).
- **Pricing with Strikethrough** — Shows current price with a calculated 31% discount strikethrough "original" price and the "X% OFF" tag.
- **Product Description** — Displayed below pricing in light uppercase tracking.

**Variant Selection (Size & Color):**
- **Size Selector** — Square buttons (11×11 px) for each available size. The selected size inverts to fully filled black/white. If the user tries to add to cart without selecting a required size, the container flashes a red border with a "* Required" label for 3 seconds.
- **Color Selector** — Labeled color buttons each containing a live color swatch dot (mapped via a comprehensive `COLOR_MAP` object covering 40+ color names to hex values). The selected color button inverts to solid black/white, matching the size selector's active state.

**Action Buttons:**
- **Wishlist Toggle** — Optimistic UI update (instant local state change, syncs to server in the background). Changes between "Wishlist" and "In Wishlist" with a filled heart icon.
- **Share Product** — Copies the product URL to clipboard with a toast confirmation.
- **Add to Bag** — Posts the product ID, quantity (1), selected size, and selected color to the cart API. On success, a toast notification appears and the user is redirected to `/cart` after 1 second.

**Delivery Estimate:**
- An inline form accepts a PIN code / ZIP code.
- Simulates a delivery API call with a 850ms delay.
- Returns either "Delivery by tomorrow | Free Express Shipping" (for valid 5–6 digit codes) or a "2–3 business days" estimate.

**Product Reviews:**
- Displays all reviews in reverse chronological order with reviewer name, star rating, and comment.
- Shows a rating distribution bar chart (5-star to 1-star breakdown).
- Logged-in users can submit a review via an expandable form (rating 1–5 + comment). Duplicate review prevention is handled server-side.

**AI Shopping Assistant Section:**
Four distinct AI-powered tools are presented beneath the main product actions:

1. **AI Q&A** — The user types any question about the product ("Is this machine washable?", "Will this fit for a formal dinner?") and GPT-4o answers it in context of the product's name, category, and description.

2. **Size Advisor (Size Predictor)** — The user inputs their height (supports both cm and ft/in), weight (lbs or kg), and fit preference (Slim / Regular / Relaxed). GPT-4o analyzes this and recommends a specific size. An "Apply Recommended Size" button auto-detects the size from the AI's response text and pre-selects it in the size selector.

3. **Outfit Stylist** *(on Cart page)* — When on the cart page, suggests complementary products to buy together.

4. **Price Insights** — On page load, fetches an AI-generated paragraph explaining the product's price trend, value positioning, and whether it's a good time to buy.

---

### 3. Shopping Cart

**File:** `frontend/src/pages/Cart.jsx`

The cart is **persistent** — it is stored in the user's database record, not just browser memory. This means the cart survives browser refreshes, logouts, and device switches.

**Cart Item Display:**
- Each cart item shows: product name, category badge, description snippet, selected size & color (if applicable), quantity controls, line price, and unit price.
- **Quantity Controls** — `+` / `−` buttons update the quantity live by calling the `PUT /api/store/cart/:productId` endpoint.
- **Remove Item** — Trash icon removes the item. The cart re-fetches from the server after each mutation to keep the UI in sync.
- **Insufficient Stock Warning** — If a cart item's quantity exceeds current stock (e.g., another user bought some), a red warning appears and the "Proceed to Checkout" button is disabled.

**Order Summary Panel:**
- Shows subtotal, shipping (Free), tax ($0.00), and estimated total.
- **Proceed to Checkout** button links to `/checkout`.
- **Share Cart** button — Serializes the entire cart (product IDs, quantities, sizes, colors) into a Base64-encoded JSON string, appends it as a URL query parameter, and copies it to clipboard. Anyone with the link can import that exact cart into their own account.

**After Checkout Success (Quick Checkout):**
- An inline success receipt card appears showing Order ID, payment status, item count, and total paid.
- The cart is cleared in both the UI and the database.
- The navbar cart badge resets to 0 via a `cartUpdated` custom window event.

**AI Stylist Recommendations:**
- Below the cart, GPT-4o analyzes the current cart items and suggests additional complementary products from the catalog.
- Displayed as product mini-cards with an "Add to Cart" button.
- Recommendations re-fetch only when the cart product composition changes (memoized via a sorted ID string).

---

### 4. Checkout Flow

**File:** `frontend/src/pages/Checkout.jsx`

A full multi-step checkout experience built with internal React state (no external library).

**Step 1 — Shipping Information:**
- Form fields: Full Name, Email, Street Address, City, State, ZIP Code, Country.
- **Auto-fill from Saved Addresses** — If the user has saved addresses in their profile, a dropdown appears to auto-populate all fields in one click.
- Validation: All fields are required before proceeding to step 2.

**Step 2 — Payment Details:**
- Mock payment section (no real payment gateway — representative for academic project).
- Collects: Card Number (formatted with spaces), Name on Card, Expiry Date, CVV.
- Payment method toggle: Credit/Debit Card or Cash on Delivery.
- The card number input auto-formats as the user types (groups of 4 digits).

**Step 3 — Review & Place Order:**
- Shows a full order summary: each item with its name, selected size/color, quantity, and line total.
- Shipping address recap and selected payment method.
- **Place Order button** calls `POST /api/store/checkout` with the shipping address and payment method.
- On success: the order is saved, product stock is decremented, sales data is recorded, an admin notification is created, and a luxury HTML confirmation email is dispatched.
- The user is redirected to their profile's Orders tab.

**Progress Stepper:**
- A horizontal 3-step stepper at the top shows "Shipping → Payment → Review" with completed steps highlighted in solid black/white.

---

### 5. User Profile & Account

**File:** `frontend/src/pages/UserProfile.jsx`

A unified account management page with four tabs:

| Tab | Content |
|---|---|
| **Orders** | Full order history |
| **Wishlist** | Saved products |
| **Addresses** | Saved shipping addresses |
| **Settings** | Account details & preferences |

**Profile Header:**  
Displays the user's name (in serif font), email, account role, and member-since date. Fully responsive — stacks vertically on mobile.

**URL-Synced Tabs:**  
The active tab is synced with the URL query parameter (`?tab=orders`). Sharing the URL takes the recipient directly to that tab. After a successful checkout, the app redirects to `?tab=orders&success=true` to show a success banner.

---

### 6. Wishlist

Users can save any product to their wishlist from:
- The Storefront product card (heart icon)
- The Product Detail Page (Wishlist button)

On the profile Wishlist tab:
- Products are displayed in a 3-column responsive grid with a 3:4 aspect-ratio image.
- **View Details** → Links to the full Product Page.
- **Remove** → Calls the toggle API and removes the item from local state immediately (optimistic update).
- **Move to Cart** → Adds the item to the cart (with the product's first size/color as defaults) and removes it from the wishlist — all in a single action.

---

### 7. Address Book

Users can manage multiple shipping addresses for faster checkout:

- **Add Address** — Inline form for street, city, state, ZIP, and country, with a "Set as Default" checkbox.
- **Edit Address** — Pre-populates the form with existing values for quick modification.
- **Delete Address** — Removes with a browser confirmation dialog.
- **Default Address** — The default address is highlighted with a solid border and a "Primary Address" label. It auto-fills the checkout shipping form.

---

### 8. AI Features for Shoppers

All AI features call the backend `/api/ai/user/*` endpoints, which forward requests to the **OpenAI GPT-4o** model with product-specific context injected into the system prompt.

| AI Feature | Endpoint | What It Does |
|---|---|---|
| **Smart Search** | `POST /api/ai/user/search` | Semantic product search across the full catalog |
| **Product Q&A** | `POST /api/ai/user/qa` | Answers any question about a specific product |
| **Size Advisor** | `POST /api/ai/user/size` | Recommends size from height, weight, and fit preference |
| **Price Insights** | `GET /api/ai/user/price-insights/:id` | Explains whether the price is a good value |
| **Outfit Stylist** | `POST /api/ai/user/stylist` | Suggests complementary products for the cart |

---

## 🔧 Admin Dashboard Features

The admin area is accessible only to users with `role: "admin"` in the database. The URL `/dashboard` redirects non-admins back to the storefront.

**Admin Layout (`AdminLayout.jsx`):**
- Persistent left sidebar with navigation links.
- On mobile: sidebar slides off-canvas and is toggled by a hamburger button in the header.
- Sidebar shows: Dashboard, Products, Add Product, Orders.

---

### 1. Analytics Dashboard

**File:** `frontend/src/pages/Dashboard.jsx`

A live business intelligence panel that fetches aggregated data from `GET /api/dashboard/stats`.

**KPI Cards:**
| Card | Metric |
|---|---|
| Total Revenue | Sum of all completed order totals |
| Total Orders | Count of all orders |
| Total Products | Count of active catalog products |
| Total Customers | Count of registered users |

**Recent Orders Table:**  
Shows the last 5–10 orders with Order ID, customer name, total, status badge, and date.

**Live Notifications:**  
Admin notifications (e.g., "New purchase by John! 3 products for $129.00") are fetched and displayed in a sidebar panel. Unread count badge appears on the bell icon.

**Revenue Chart:**  
Visual bar/line chart of revenue aggregated over recent days or months using the `Sale` model's `saleDate` and `totalAmount` fields.

---

### 2. Product Management

**Files:** `frontend/src/pages/Products.jsx` · `frontend/src/pages/AddProduct.jsx`

**Products List (`/products`):**
- Shows all products in a table with image preview, name, SKU, category, price, stock, and status toggle.
- **Search/Filter** — Filter by name or category.
- **Toggle Active** — A toggle switch activates or deactivates a product from the storefront without deleting it.
- **Edit** — Opens the product in the edit form.
- **Delete** — Permanently removes the product (with confirmation).

**Add / Edit Product (`/products/new`):**

This is the most comprehensive admin form in the app. Fields include:

| Field | Description |
|---|---|
| Product Name | Required title |
| SKU | Unique stock-keeping unit identifier |
| Brand | Brand/manufacturer name |
| Category | e.g., Tops, Footwear, Accessories |
| Target Audience | e.g., Men, Women, Unisex |
| Description | Long-form text description |
| Price | Numeric price in USD |
| Stock | Available inventory quantity |
| Sizes | Comma-separated or tag-input (e.g., XS, S, M, L, XL) |
| Colors | Comma-separated color names (e.g., black, camel, navy) |
| Image URLs | One or more product image URLs |
| Keywords | SEO keywords for AI search indexing |
| Tags | Searchable product tags |
| Active Status | Toggle to show/hide from storefront |

**AI Generation Tools (Admin-only):**

| Tool | What It Generates |
|---|---|
| **Generate Description** | A full, luxury-style product description based on the name, category, and brand |
| **Generate Keywords** | SEO-optimized search keywords for the product |
| **Generate Tags** | Searchable product tags |
| **Generate Captions** | Platform-specific social media captions for Instagram, Facebook, Twitter, TikTok, and a generic version |

These generation tools call `/api/ai/admin/*` endpoints and insert the AI-generated text directly into the form fields so the admin can review and save them.

**Price History:**  
Every time a product's price is saved with a different value, the old price is automatically pushed to the `priceHistory` array in the database (via a Mongoose pre-save hook). This enables the Price Insights AI feature to provide trend analysis.

---

### 3. Order Management

**File:** `frontend/src/pages/AdminOrders.jsx`

A full orders table accessible at `/admin/orders`.

**Features:**
- Lists all orders from all customers, most recent first.
- **Per-Order Details:** Order ID, customer name, total amount, payment method, status badge, and date.
- **Item Breakdown:** Expanding each order shows every item with its product name, selected size, selected color, quantity, and price at time of purchase.
- **Status Filter:** Filter orders by status (All / Completed / Processing / Cancelled).
- **Search:** Find orders by customer name or Order ID.

---

## 📡 Backend API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer <JWT>` token in the `Authorization` header. Admin routes additionally verify `role === "admin"`.

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Log in, receive JWT + user object |

### Store Routes (`/api/store`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Get all active products |
| `GET` | `/products/:id` | Public | Get single product by ID |
| `GET` | `/cart` | User | Get current user's cart |
| `POST` | `/cart` | User | Add item to cart (with size/color) |
| `PUT` | `/cart/:productId` | User | Update cart item quantity |
| `DELETE` | `/cart/:productId` | User | Remove item from cart |
| `POST` | `/cart/batch` | User | Batch import shared cart |
| `POST` | `/checkout` | User | Place order, clear cart, send email |

### User Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile` | User | Get profile + orders + wishlist |
| `PUT` | `/profile` | User | Update name, email, settings |
| `POST` | `/wishlist/toggle` | User | Toggle product in/out of wishlist |
| `POST` | `/address` | User | Add new shipping address |
| `PUT` | `/address/:id` | User | Update an address |
| `DELETE` | `/address/:id` | User | Delete an address |

### Product Routes (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Admin | Get all products (including inactive) |
| `POST` | `/` | Admin | Create a new product |
| `PUT` | `/:id` | Admin | Update product details |
| `DELETE` | `/:id` | Admin | Delete a product |
| `POST` | `/:id/reviews` | User | Submit a product review |

### AI Routes (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/user/search` | Public | Semantic product search |
| `POST` | `/user/qa` | User | Product Q&A |
| `POST` | `/user/size` | User | Size recommendation |
| `GET` | `/user/price-insights/:id` | User | Price trend insights |
| `POST` | `/user/stylist` | User | Cart-based outfit suggestions |
| `POST` | `/admin/description` | Admin | Generate product description |
| `POST` | `/admin/keywords` | Admin | Generate SEO keywords |
| `POST` | `/admin/tags` | Admin | Generate product tags |
| `POST` | `/admin/captions` | Admin | Generate social media captions |

### Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | KPIs: revenue, orders, products, users |
| `GET` | `/notifications` | Admin | Recent admin notifications |

---

## 🗄 Database Models

### User
| Field | Type | Description |
|---|---|---|
| `name` | String | Display name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt-hashed password |
| `role` | Enum | `"user"` or `"admin"` |
| `cart` | Array | `[{ product, quantity, selectedSize, selectedColor }]` |
| `addresses` | Array | `[{ street, city, state, zipCode, country, isDefault }]` |
| `wishlist` | Array | Array of Product ObjectIDs |
| `profileSettings` | Object | `{ language, notifications }` |

### Product
| Field | Type | Description |
|---|---|---|
| `name` | String | Product name |
| `sku` | String | Unique stock-keeping unit |
| `description` | String | Long-form description |
| `price` | Number | Current selling price |
| `stock` | Number | Available inventory |
| `category` | String | Product category |
| `brand` | String | Manufacturer/brand |
| `audience` | String | Target audience (Men/Women/Unisex) |
| `sizes` | String[] | Available sizes |
| `colors` | String[] | Available color names |
| `images` | String[] | Image URLs |
| `tags` | String[] | Searchable tags |
| `keywords` | String | SEO keywords |
| `captions` | Array | `[{ platform, text }]` per social channel |
| `isActive` | Boolean | Storefront visibility toggle |
| `priceHistory` | Array | `[{ price, date }]` — auto-logged on save |
| `reviews` | Array | `[{ user, name, rating, comment, createdAt }]` |
| `rating` | Number | Aggregate rating |
| `numReviews` | Number | Total review count |

### Order
| Field | Type | Description |
|---|---|---|
| `user` | ObjectID | Reference to User |
| `products` | Array | `[{ product, quantity, priceAtPurchase, selectedSize, selectedColor }]` |
| `shippingAddress` | Object | `{ street, city, state, zipCode, country }` |
| `paymentDetails` | Object | `{ method, status }` |
| `totalAmount` | Number | Total order value in USD |
| `status` | Enum | `pending / processing / completed / cancelled` |

### Sale
| Field | Type | Description |
|---|---|---|
| `product` | ObjectID | Reference to Product |
| `quantity` | Number | Units sold |
| `totalAmount` | Number | Revenue from this sale |
| `saleDate` | Date | Timestamp of the transaction |
| `channel` | String | Sales channel (e.g., `"web"`) |

### Notification
| Field | Type | Description |
|---|---|---|
| `type` | String | Event type (e.g., `"purchase"`) |
| `message` | String | Human-readable notification text |
| `isRead` | Boolean | Read status |

---

## 📧 Email Notification System

**File:** `backend/utils/mailer.js`

After every successful checkout, SmartStore AI automatically dispatches a **luxury HTML order confirmation email** to the customer using **Nodemailer + Gmail SMTP**.

**Email Template Features:**
- Pure black/white editorial design — zero color noise
- SmartStore Atelier branding header
- Order ID, date, payment status, and shipping method fields
- Full itemized product table with size/color variant info
- Subtotal, shipping (Free), tax, and total due summary
- Shipping destination block
- Professional footer with copyright

**Email is dispatched non-blocking** — even if the email fails (e.g., SMTP timeout), the checkout API call still returns `201 Created` successfully. The error is only logged server-side.

---

## 🌙 Theme System (Light / Dark Mode)

**File:** `frontend/src/context/ThemeContext.jsx`

- Theme is stored in `localStorage` under the key `smartstore-theme`.
- On first load, the system preference (`prefers-color-scheme`) is detected if no saved preference exists.
- The `"dark"` class is applied to the root `<html>` element, enabling Tailwind's `dark:` variant across every component.
- A **ThemeToggle button** (`ThemeToggle.jsx`) in the User Navbar switches between modes with an animated Sun/Moon icon.

The entire application — every page, card, input, modal, and sidebar — is fully styled for both light and dark modes using Tailwind's `dark:` prefix utility classes.

---

## 📱 Responsive Design

The application is built **mobile-first** using Tailwind CSS responsive breakpoints:

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Default (mobile) | < 768px | Single column, stacked layouts |
| `md:` | ≥ 768px | Two columns, flex-row headers |
| `lg:` | ≥ 1024px | Three-four columns, full desktop layout |
| `xl:` | ≥ 1280px | Max-width containers with generous padding |

**Key Responsive Components:**
- **UserNavbar** — Desktop links hidden on mobile (`hidden md:flex`). A hamburger icon reveals a full-height slide-in drawer with all navigation options.
- **AdminLayout** — Sidebar is off-canvas on mobile, toggled by a hamburger button in the admin header.
- **Product Grids** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Product Detail Page** — Stacks image and details column on mobile, side-by-side on desktop.
- **Checkout** — Three-column layout on desktop collapses to single column on mobile.
- **Footer** — Four-column grid collapses to two columns on tablet, single on mobile.

---

## ⚖️ Legal Pages & Footer

### Footer (`Footer.jsx`)
A luxury four-column responsive footer rendered on all storefront pages (hidden in admin):

| Column | Content |
|---|---|
| **Brand** | SMARTSTORE logo, tagline, copyright |
| **Quick Links** | Shop, Cart, Profile, Terms, Privacy |
| **Developer** | Ayush Kamboj — name, role, college, GitHub, LinkedIn |
| **Contact** | Quick contact form (Name + Message) |

### Legal Pages
- **`/terms`** — Terms & Conditions with standard e-commerce clauses
- **`/privacy`** — Privacy Policy covering data collection, usage, and storage

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=sk-...your_openai_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENTURL=http://localhost:5173
```

> **Note:** `EMAIL_PASS` must be a **Gmail App Password** (not your regular Gmail password). Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) with 2FA enabled.

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js v18+ (v22 recommended)
- npm v9+
- A MongoDB Atlas account (free tier is sufficient)
- An OpenAI API key (GPT-4o access)
- A Gmail account with App Passwords enabled

### 1. Clone the Repository
```bash
git clone https://github.com/Ayushh-k/SmartStore-AI.git
cd SmartStore-AI/smartstore-ai
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Backend Environment
Create `backend/.env` with the variables listed in the [Environment Variables](#-environment-variables) section.

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 5. Configure Frontend Environment
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 6. Start the Backend Server
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### 7. Start the Frontend Dev Server
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

### 8. Create an Admin Account
1. Sign up normally at `/signup`.
2. In MongoDB Atlas, find your user document and change `"role": "user"` to `"role": "admin"`.
3. Log in again — you will now see the Admin Dashboard at `/dashboard`.

---

## 📁 Project Structure

```
smartstore-ai/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login, register logic
│   │   ├── storeController.js       # Cart, checkout, products (public)
│   │   ├── productController.js     # Admin product CRUD
│   │   ├── userController.js        # Profile, wishlist, addresses
│   │   ├── aiController.js          # Admin AI tools (descriptions, captions)
│   │   ├── userAiController.js      # Shopper AI tools (Q&A, size, search)
│   │   ├── dashboardController.js   # Analytics KPIs and notifications
│   │   └── adminController.js       # Admin-only misc actions
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema (with price history)
│   │   ├── Order.js                 # Order schema
│   │   ├── Sale.js                  # Per-sale revenue record
│   │   └── Notification.js          # Admin notification schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification + role guard
│   ├── utils/
│   │   └── mailer.js                # Nodemailer luxury HTML email
│   ├── db.js                        # MongoDB connection
│   └── server.js                    # Express app entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Storefront.jsx        # Homepage + catalog
        │   ├── ProductPage.jsx       # Full product detail page
        │   ├── Cart.jsx              # Shopping cart
        │   ├── Checkout.jsx          # Multi-step checkout
        │   ├── UserProfile.jsx       # Account (orders, wishlist, etc.)
        │   ├── Login.jsx             # Login page
        │   ├── Signup.jsx            # Registration page
        │   ├── Dashboard.jsx         # Admin analytics
        │   ├── Products.jsx          # Admin product list
        │   ├── AddProduct.jsx        # Admin add/edit product form
        │   ├── AdminOrders.jsx       # Admin order management
        │   ├── Terms.jsx             # Terms & Conditions
        │   └── Privacy.jsx           # Privacy Policy
        ├── components/
        │   ├── UserNavbar.jsx        # Storefront navbar with hamburger
        │   ├── AdminLayout.jsx       # Admin sidebar + header layout
        │   ├── Footer.jsx            # Luxury four-column footer
        │   ├── ProductDetails.jsx    # Reusable product detail component
        │   └── ThemeToggle.jsx       # Light/dark mode toggle button
        ├── context/
        │   └── ThemeContext.jsx      # Global theme state provider
        ├── utils/
        │   └── api.js               # Axios instance with auth header
        ├── App.jsx                   # Route definitions + layout guards
        ├── main.jsx                  # React DOM entry point
        └── index.css                # Global styles + Tailwind directives
```

---

## 👨‍💻 Developer

<div align="center">

**Ayush Kamboj**  
B.Tech Computer Science Engineering  
Winter PEP Project · 2026

[![GitHub](https://img.shields.io/badge/GitHub-Ayushh--k-181717?style=for-the-badge&logo=github)](https://github.com/Ayushh-k)

*"Built with precision, designed with intent."*

</div>

---

<div align="center">

**© 2026 SmartStore AI. All Rights Reserved.**  
*Luxury Editorial E-Commerce — Powered by OpenAI GPT-4o*

</div>
