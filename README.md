# SmartStore AI — Luxury Editorial E-Commerce Platform

<div align="center">

![SmartStore AI](https://img.shields.io/badge/SmartStore-AI%20Powered-black?style=for-the-badge&logo=openai&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel Analytics](https://img.shields.io/badge/Vercel-Web%20Analytics-black?style=for-the-badge&logo=vercel&logoColor=white)

**A full-stack AI-powered, multi-vendor e-commerce platform built with the MERN stack.**  
Featuring a Luxury Store Editorial aesthetic — stark monochrome contrast, sharp 0px corners, serif typography,  
2-step OTP registration, global INR currency localization, OpenAI shopping assistant, Vercel analytics, and real-time developer moderation controls.

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
   - [Storefront & Indian Market Localization](#1-storefront--indian-market-localization)
   - [Product Detail Page (PDP)](#2-product-detail-page-pdp)
   - [Shopping Cart](#3-shopping-cart)
   - [Checkout Flow](#4-checkout-flow)
   - [User Profile & Account Settings](#5-user-profile--account-settings)
   - [Wishlist & Address Book](#6-wishlist--address-book)
   - [AI Features for Shoppers](#7-ai-features-for-shoppers)
6. [Multi-Vendor & Administration Portals](#-multi-vendor--administration-portals)
   - [Vendor Dashboard & Inventory CRUD](#1-vendor-dashboard--inventory-crud)
   - [Super Admin / Developer Portal ("God Mode V3")](#2-super-admin--developer-portal-god-mode-v3)
   - [Suspension & Revocation Reason Workflow](#3-suspension--revocation-reason-workflow)
7. [Email & OTP Verification System](#-email--otp-verification-system)
8. [Backend API Reference](#-backend-api-reference)
9. [Database Models](#-database-models)
10. [Environment Variables](#-environment-variables)
11. [Installation & Running Locally](#-installation--running-locally)
12. [Project Structure](#-project-structure)
13. [Developer](#-developer)

---

## 🌟 Project Overview

**SmartStore AI** is a fully functional, production-grade multi-vendor e-commerce platform that goes beyond a standard storefront. It implements a stark, premium **"Luxury Store Editorial"** design system — utilizing a monochrome palette, Playfair Display headings, monospaced details, and clean thin borders.

The platform splits accounts into **three tiers**:
- **Customers**: Can verify accounts via OTP, shop, review products, get AI size predictions, and manage profiles with base64 image uploads.
- **Vendors (Merchants)**: Gain a secure dashboard to manage catalog listings, review sales analytics, and create products using automated AI description/social caption tools.
- **Super Admins (Developers)**: Access **"God Mode V3"** — a central moderation deck displaying aggregate platform-wide revenue charts, store directories, active catalogs, and cascade deletion tools to ban violating accounts.

---

## 🛠 Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI framework with component-based SPA architecture |
| **React Router v6** | Client-side routing with role-based protected layout guards |
| **Tailwind CSS v3** | Styling framework customized for a high-contrast theme |
| **Vercel Web Analytics** | Serverless storefront traffic tracking |
| **Chart.js + React-Chartjs-2** | Monochromatic interactive line charts |
| **Lucide React** | Editorial stroke-based icon library |

### Backend
| Technology | Role |
|---|---|
| **Node.js v22** | JavaScript backend runtime environment |
| **Express.js** | RESTful API framework |
| **MongoDB Atlas** | Cloud NoSQL database holding platform state |
| **Mongoose** | ODM for MongoDB schema validation and pre-save hooks |
| **JSON Web Tokens (JWT)** | Stateless authentication, fortified against malformed headers |
| **bcrypt** | Secure password hashing |
| **OpenAI API (GPT-4o)** | Powers search vibes, price insights, and Q&A chatbots |
| **Brevo HTTP API (Axios)** | High-delivery SMTP email dispatch bypassing outbound port limits |

---

## ✨ Features Overview

| Feature Category | Details |
|---|---|
| 🛍️ Storefront | Responsive grid catalog, horizonal categories, and dual keyword/vibe search |
| 🇮🇳 Localization | Complete conversion to Indian Rupees (`₹`) via global `formatCurrency` utility |
| 🛡️ OTP Registration | 2-step signup wizard requiring 6-digit OTP verification valid for 5 mins |
| 👤 Profile Deck | Base64 avatar uploads, editable phone/address metadata, and navbar previews |
| 🤖 AI shopping | Product Q&A, Body-spec Size Predictor, Cart Stylist, and Price Insights |
| 🏪 Vendor Portal | Inventory tables, product editing forms, sales charts, and recent activity logs |
| ✍️ AI Content Tools | Automatic descriptions, social media platform captions, and tags generator |
| ⚡ God Mode V3 | Aggregated revenue trends, merchant catalogs, ban controls, and user activity audits |
| 🚫 Suspensions | Ban reasoning workflow that locks access and redirects to a stark revocation page |
| 📧 HTTP Transactional Mail | OTP codes, inquiry receipts, and order confirmation tracking links sent via Brevo |
| 🌙 Theme Toggles | Light/dark theme toggle wired inside standard, admin, and developer headers |

---

## 🏗 Application Architecture

```
smartstore-ai/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/     # Page views (Storefront, PDP, Dashboards, Suspended)
│       ├── components/# Layout cards, sidebars, AvatarUpload, ThemeToggle
│       ├── context/   # Theme Context and state providers
│       └── utils/     # Axios instances, global formatCurrency helper
└── backend/           # Node.js + Express REST API
    ├── controllers/   # Auth, Store, AI, Developer & Vendor managers
    ├── models/        # Schemas (User, Product, Order, Sale, Notification)
    ├── routes/        # Express route definitions
    ├── middleware/     # Malformed token interception & Role guards
    └── utils/         # Brevo mailer API wrapper
```

---

## 🛍️ User-Facing Features (Storefront)

### 1. Storefront & Indian Market Localization

**File:** `frontend/src/pages/Storefront.jsx` & `frontend/src/utils/formatCurrency.js`

Fully customized for the Indian market, utilizing a centralized format helper:
- **Rupees formatting** — Formats pricing to the Indian currency system (`₹`) with grouping commas (lakhs/crores) and fraction decimals:
  ```javascript
  // Returns ₹1,29,999.00
  formatCurrency(129999);
  ```
- **Category Filter Horizontal Scroll** — Features an auto-snapping horizontal category bar designed specifically for mobile screens.
- **Vibe Search** — Translates natural language queries (e.g. `"classy dress for wedding in Delhi"`) into curated product returns by checking OpenAI.

### 2. Product Detail Page (PDP)

**File:** `frontend/src/pages/ProductPage.jsx` & `frontend/src/components/ProductDetails.jsx`

Displays a two-column gallery layout matching editorial lookups:
- **Variations Validation** — Forces selection of sizes and colors using square toggle buttons; displays animated validation alerts if bypassed.
- **AI Size Predictor** — Prompts user height (cm/ft), weight (kg/lbs), and fit vibes to predict sizing. Features an "Apply Size" shortcut to auto-select recommendations.
- **Price Insights** — Evaluates price history arrays inside the database to output trend advice.

### 3. Shopping Cart

**File:** `frontend/src/pages/Cart.jsx`

Persistent database-linked cart providing:
- **Instant Quantities** — Optimistic local state updates for immediate total calculations.
- **Cart Sharing** — Encodes items into a Base64 URL parameter. Visiting this link imports products instantly.
- **AI Stylist Recommendations** — Suggests matching products in the footer using GPT-4o.

### 4. Checkout Flow

**File:** `frontend/src/pages/Checkout.jsx`

A 3-step checkout wizard (Shipping address selection → Card/COD details → Order Review):
- **Address Auto-Fill** — Pulls default coordinates from customer profiles in one click.
- **Pincode check** — Performs validation checks on Indian postal codes before allowing checkout.

### 5. User Profile & Account Settings

**File:** `frontend/src/pages/UserProfile.jsx`

A tabbed profile deck (`?tab=orders`) for managing customer logs:
- **Avatar Uploads** — Integrates the luxury `<AvatarUpload />` component using standard `FileReader` base64 conversion.
- **Navbar Icon** — Displays the uploaded custom profile image dynamically inside storefront navigation loops.
- **Details Management** — Allows updating Name, Phone, and Corporate Addresses.

### 6. Wishlist & Address Book
- **Wishlist to Cart** — One-click action to move items to the cart using the first variation default.
- **Default Address Flag** — Restricts addresses to a single primary shipping coordinate, which auto-fills the checkout forms.

### 7. AI Features for Shoppers

| AI Tool | Controller | Purpose |
|---|---|---|
| **Semantic Search** | `userAiController.js` | Locates products matching conversational queries |
| **Chatbot Q&A** | `userAiController.js` | Dedicated assistant chatbox inside product details overlay |
| **Size Advisor** | `userAiController.js` | Suggests sizing based on height, weight, and fit |
| **Price Insights** | `userAiController.js` | Identifies deal values using product price history |

---

## 🏪 Multi-Vendor & Administration Portals

### 1. Vendor Dashboard & Inventory CRUD

**Files:** `frontend/src/pages/Dashboard.jsx` · `Products.jsx` · `AddProduct.jsx` · `EditProduct.jsx`

Vendors manage their store listings in a dedicated layout:
- **Real-Time KPIs** — Monitors total catalog size, orders completed, and total revenue.
- **Sales Trend Graph** — Visualizes earnings over a 7-day period.
- **Secure Inventory CRUD** — Restricts update and delete actions to the authenticated vendor owner. Attempts to update products owned by other vendors return a `403 Forbidden` response.
- **AI Copywriter** — Automated Description, Tags, and platform-specific Social Captions (Instagram, Facebook, X, LinkedIn) generators.

### 2. Super Admin / Developer Portal ("God Mode V3")

**Files:** `PlatformOverview.jsx` · `StoreManagement.jsx` · `GlobalProducts.jsx` · `UserManagement.jsx`

A god-mode panel allowing superadmins to oversee marketplace health:
- **Role Picker Screen** — A split choice menu displaying aggregate metrics for Vendors (Amber cards) and Customers (Sky cards).
- **Interactive Metrics Chart** — Monochromatic trend charts updating dynamically when clicking KPI metric cards (Platform Revenue, Active Stores, Catalog Size).
- **Vendor Catalog Drill-down** — Full-page responsive grid audit showcasing all items live under specific stores.
- **User Activity Audit** — Complete profile audit showing placed invoices, cart bag listings, wishlists, and shipping addresses for any platform customer.

### 3. Suspension & Revocation Reason Workflow

**Files:** `Suspended.jsx` · `authController.js` · `developerController.js`

Enforces platform moderation rules:
- **Ban Reasoning Modal** — Prompts superadmins for custom reasons before executing user or store bans.
- **Auth Interception** — Validates `isBanned` on login. If true, rejects token issuance and returns `403 Forbidden` carrying the suspension reason.
- **Revoked UI Page** — Renders a stark revocation interface (`Suspended.jsx`) detailing why access was blocked.

---

## 📧 Email & OTP Verification System

**Files:** `backend/utils/sendEmail.js` · `backend/controllers/authController.js` · `frontend/src/pages/Signup.jsx`

Implements a secure registration flow using the Brevo HTTP API:
- **Verification Code** — Generates a 6-digit OTP code on signup, saving the user as `isVerified: false`. Returns a `201 Created` status without a JWT token.
- **5-Minute Expiry** — Restricts OTP validity. The email layout specifies this expiration window.
- **Resend Countdown Timer** — Triggers a 120-second countdown in the frontend signup page. The "Resend Code" button is disabled while the timer is active.
- **Spam Folder Advisory** — Displays a minimalist serif note warning users to check junk folders.
- **Transactional Rollbacks** — If the Brevo email API fails during signup, the database rolls back and deletes the unverified user document automatically, avoiding orphaned email logs.

---

## 📡 Backend API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Generates OTP, drafts user, sends email |
| `POST` | `/verify` | Public | Validates OTP, issues JWT, logs user in |
| `POST` | `/resend-otp` | Public | Dispatches a fresh verification token |
| `POST` | `/login` | Public | Authenticates credentials, checks ban status |

### User Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile` | User | Retrieves user profile metadata and order history |
| `PUT` | `/profile` | User | Updates avatar base64, phone, address, and settings |
| `POST` | `/wishlist/toggle` | User | Toggles product in/out of customer wishlist |
| `POST` | `/address` | User | Saves a new delivery coordinate |

### Store & Cart (`/api/store`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Gets active catalog items |
| `GET` | `/cart` | User | Gets customer persistent cart |
| `POST` | `/cart` | User | Adds items with color/size variations |
| `PUT` | `/cart/:productId` | User | Updates quantities (optimistic frontend tracking) |
| `POST` | `/checkout` | User | Processes order, decrements stock, sends receipt |

### Developer / Moderation (`/api/developer`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/metrics` | Developer | Gets platform stats and time-series trends |
| `GET` | `/vendors` | Developer | Lists all stores and active catalog size |
| `PUT` | `/vendors/:id/ban` | Developer | Toggles vendor ban status with custom reason |
| `DELETE` | `/vendors/:id` | Developer | Permanently cascade deletes vendor and all products |
| `GET` | `/users` | Developer | Gets all registered users and activity numbers |
| `PUT` | `/users/:id/ban` | Developer | Toggles shopper ban status with custom reason |
| `DELETE` | `/users/:id` | Developer | Deletes shopper account and order histories |
| `GET` | `/users/:id/activity` | Developer | Fetches full order, cart, and address logs for a user |

---

## 🗄 Database Models

### User
- `name`, `email`, `password`, `role` (`"user"`, `"admin"`, `"superadmin"`).
- `avatar`, `phone`, `address`.
- `isVerified`, `verificationOtp`, `otpExpire`.
- `isBanned`, `banReason`.
- `cart`: `[{ product, quantity, selectedSize, selectedColor }]`.
- `addresses`: `[{ street, city, state, zipCode, country, isDefault }]`.
- `wishlist`: Array of Product IDs.

### Product
- `name`, `sku`, `brand`, `category`, `price`, `stock`, `description`.
- `sizes`, `colors`, `images`, `tags`, `keywords`.
- `isActive` (visibility flag), `vendor` (owner ObjectID).
- `priceHistory`: `[{ price, date }]`.
- `reviews`: `[{ user, name, rating, comment, createdAt }]`.

### Order
- `user` (shopper ObjectID).
- `products`: `[{ product, quantity, priceAtPurchase, selectedSize, selectedColor }]`.
- `shippingAddress`: `{ street, city, state, zipCode, country }`.
- `paymentDetails`: `{ method, status }`.
- `totalAmount` (in INR `₹`).
- `status` (`pending`, `processing`, `completed`, `cancelled`).

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=sk-proj-...
BREVO_API_KEY=xkeysib-...
EMAIL_USER=your_configured_sender_email
CLIENTURL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Installation & Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Ayushh-k/SmartStore-AI.git
cd SmartStore-AI/smartstore-ai
```

### 2. Configure Backend
```bash
cd backend
npm install
# Create .env and populate variables
npm run dev
# Server boots at http://localhost:5000
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
# Create .env and populate VITE_API_BASE_URL
npm run dev
# Client dev server starts at http://localhost:5173
```

---

## 📁 Project Structure
The structure splits source layers cleanly:
- `backend/controllers/`: Contains `authController.js`, `storeController.js`, `productController.js`, `developerController.js`, `userAiController.js`.
- `backend/routes/`: Registers routes including `developerRoutes.js` and `authRoutes.js`.
- `frontend/src/pages/`: Modular page views including `Storefront.jsx`, `AdminProfile.jsx`, `UserProfile.jsx`, `Suspended.jsx`.
- `frontend/src/components/`: Layout wrappers and inputs (`AvatarUpload.jsx`, `ThemeToggle.jsx`, `UserNavbar.jsx`).

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
*Luxury Editorial Multi-Vendor E-Commerce — Powered by OpenAI & Brevo*

</div>
