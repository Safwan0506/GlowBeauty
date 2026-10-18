<p align="center">
  <img src="./public/screenshot.png" alt="Scensora Screenshot" width="800" />
</p>

<h1 align="center">SCENSORA</h1>

<p align="center">
  <em>The Art of Sensorial Beauty — Premium skincare, haircare, makeup, perfumes and wellness products from Douala, Cameroon.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License" />
</p>

---

## About

**Scensora** is a full-featured e-commerce web application for beauty and cosmetics, designed with a luxury Dior/Sephora-inspired aesthetic. The platform serves both customers and administrators with dedicated dashboards, mobile money payment integration (MTN and Orange Money for Cameroon), and a rich product catalog spanning skincare, haircare, makeup, perfumes, and wellness.

The application works seamlessly in both online mode (with Supabase backend) and offline demo mode (using localStorage), making it ideal for production use as well as academic demonstration.

---

## Features

### Landing Page
- Elegant hero section with animated gradients and product slideshow
- About section highlighting brand values (100% Natural, Premium Quality, Eco-friendly)
- Product catalog grid with category badges, brand labels, and pricing in FCFA
- Product reviews modal with star ratings
- Contact form with WhatsApp integration
- Responsive sticky navigation with mobile hamburger menu

### Client Dashboard
- **Product Catalog** — Browse, search, and filter products by category, brand, skin type, price range, and active promotions
- **Smart Search** — Autocomplete search with real-time suggestions
- **Product Detail** — Full product page with skincare tips (morning/evening routines), stock info, and reviews
- **Shopping Cart** — Add/remove items, adjust quantities with stock validation, order summary
- **Favorites & Wishlist** — Save and share favorite products
- **Product Comparison** — Side-by-side comparison of up to 3 products
- **Order History** — View past orders and payment status
- **Mobile Money Payments** — Pay via MTN Mobile Money or Orange Money (live or sandbox mode) with coupon/promo code support
- **Loyalty Program** — Earn points on purchases with Bronze, Silver, Gold, and Platinum tiers
- **Beauty Quiz** — Personalized skincare routine recommendations based on skin type and concerns
- **Beauty Blog** — Editorial content with skincare tips and advice
- **Returns & Claims** — Request product returns directly from order history
- **Live Support Chat** — Real-time messaging with admin (persisted via localStorage)

### Admin Dashboard
- **Analytics Overview** — KPI cards (stock levels, units sold, revenue, daily orders), stock health gauge, top-selling products chart, and business objectives tracker
- **Client Management** — Searchable client directory with registration details
- **Product Management** — Full CRUD for products with image URLs, categories, suppliers, skin type targeting, and stock tracking
- **Category Management** — Create, edit, and delete product categories
- **Supplier Management** — Track suppliers and their associated products
- **Delivery Personnel** — Manage delivery team members
- **Order Management** — Validate or refuse orders with automatic stock decrement and delivery creation on validation
- **Delivery Tracking** — Assign delivery personnel and track delivery status
- **Payment Monitoring** — View all payment transactions (MTN/Orange Money)
- **Notifications** — Priority-based notification system for orders, payments, stock alerts, reviews, and promotions
- **Promotions** — Create time-bound percentage discounts by category or product
- **Sales Export** — Export monthly or annual sales data as CSV
- **Admin Support** — Reply to client support messages

### General
- **Dark Mode / Light Mode** — System-aware theme toggle with manual override
- **Bilingual (FR/EN)** — Full French and English internationalization
- **Responsive Design** — Mobile-first layout with Tailwind CSS
- **Role-Based Access** — Protected routes with admin/client role separation
- **SHA-256 Authentication** — Secure password hashing with Web Crypto API
- **Offline-First Demo Mode** — Complete functionality with localStorage fallback when Supabase is unavailable

---

## Tech Stack

| Layer        | Technology                              |
|-------------|----------------------------------------|
| Framework   | React 18                               |
| Language    | TypeScript 5                           |
| Build Tool  | Vite 5                                 |
| Styling     | Tailwind CSS 3                         |
| Routing     | React Router DOM 7                     |
| Backend     | Supabase (PostgreSQL, Edge Functions)  |
| Icons       | Lucide React                           |
| Payments    | MTN Mobile Money / Orange Money API    |
| Auth        | Custom SHA-256 hashing (Web Crypto)    |
| Linting     | ESLint 9 + TypeScript ESLint           |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project (optional — the app runs in demo mode without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/Safwan0506/mon-site-GlowBeauty.git
cd mon-site-GlowBeauty

# Install dependencies
npm install
```

### Configuration

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin credentials (optional — defaults to ADMIN / 12345 in demo)
VITE_ADMIN_USERNAME=ADMIN
VITE_ADMIN_PASSWORD_HASH=your-sha256-hash

# Mobile Money mode: "sandbox" (simulated) or "live" (real payments)
VITE_MOBILE_MONEY_MODE=sandbox
```

> **Note:** The application works fully without Supabase configuration using built-in demo data (50 products across 5 categories, sample suppliers, delivery personnel, promotions, and coupons).

### Development

```bash
# Start the development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx    # Login / registration modal
│   ├── LanguageToggle.tsx
│   └── ThemeToggle.tsx
├── contexts/            # React context providers
│   ├── AuthContext.tsx   # Authentication state & role management
│   ├── LanguageContext.tsx # FR/EN internationalization
│   └── ThemeContext.tsx  # Dark/light theme management
├── layouts/
│   └── AdminLayout.tsx  # Admin sidebar navigation layout
├── lib/
│   ├── admin-api.ts     # Supabase Edge Functions API client
│   ├── demo-store.ts    # LocalStorage-based demo data layer
│   ├── mobile-money.ts  # MTN/Orange Money payment integration
│   └── supabase.ts      # Supabase client initialization
├── pages/
│   ├── LandingPage.tsx  # Public homepage with products & contact
│   ├── admin/
│   │   └── AdminDashboard.tsx  # Full admin panel (12 sections)
│   └── client/
│       └── ClientDashboard.tsx # Client portal (10 views)
├── types/
│   └── database.ts      # TypeScript interfaces for all entities
├── App.tsx              # Router setup & protected routes
└── main.tsx             # Application entry point
```

---

## Author

**Safwan Djazouli**

- GitHub: [@Safwan0506](https://github.com/Safwan0506)
- LinkedIn: [Safwan Djazouli](https://www.linkedin.com/in/djazouli-safwan-079b23342)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
