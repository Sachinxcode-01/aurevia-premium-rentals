<div align="center">

<img src="public/readme/aurevia-banner.png" alt="AUREVIA — Premium Camera Rentals" width="720" />

<br/>

<img src="public/readme/aurevia-logo.png" alt="AUREVIA Logo" width="100" height="100" />

# AUREVIA

### Premium Camera Rentals by Prem

> *"Frame the Extraordinary."*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-R185-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Anime.js](https://img.shields.io/badge/Anime.js-4.5-FF6B6B?style=for-the-badge)](https://animejs.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![Build Status](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-Private-D8B36A?style=flat-square)](.)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)](.)

<br/>

[📋 View Repository](https://github.com/Sachinxcode-01/aurevia-premium-rentals) &nbsp;·&nbsp;
[🎬 Live Demo](#) &nbsp;·&nbsp;
[📖 Documentation](#table-of-contents) &nbsp;·&nbsp;
[📞 Contact](#contact--credits)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Hero Scroll Animation](#hero-scroll-animation)
- [Interactive 3D Optics Showroom](#interactive-3d-optics-showroom)
- [Rental & Booking Workflow](#rental--booking-workflow)
- [Customer Dashboard](#customer-dashboard)
- [Admin Analytics Dashboard](#admin-analytics-dashboard)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Workflow](#application-workflow)
- [Project Structure](#project-structure)
- [Database Overview](#database-overview)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Development Commands](#development-commands)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [Security Features](#security-features)
- [Performance Optimizations](#performance-optimizations)
- [Roadmap](#roadmap)
- [Contact & Credits](#contact--credits)
- [License](#license)

---

## Project Overview

**AUREVIA** is a premium full-stack camera-rental platform crafted for professional photographers, cinematographers, and production houses. It provides an immersive, cinematic interface to browse, compare, book, and manage high-end cameras, cinema lenses, gimbals, professional lighting, audio equipment, and production accessories.

Built on **Next.js 16** with a **React 19 + TypeScript** architecture, AUREVIA delivers a luxury editorial experience through a **canvas-based scroll animation**, a **photorealistic Three.js camera showroom**, an **advanced booking engine**, a **customer rental dashboard**, and a comprehensive **admin analytics panel** — all backed by a production-ready **Supabase PostgreSQL** database schema.

**Designed for:**

- Commercial photographers and directors
- Wedding and fashion cinematographers
- Film productions and documentary crews
- Production studios requiring on-demand gear rentals

---

## Key Features

| Feature | Details |
|---|---|
| 🎬 **Canon Image Sequence Hero** | Scroll-mapped 210-frame canvas animation with progressive preloading and MP4 mobile fallback |
| 🔭 **Interactive 3D Showroom** | Photorealistic Canon EOS R5 model with swappable lenses, hotspot inspection, and orbit controls |
| 🎯 **3D Motion Cards** | GPU-accelerated parallax tilt cards with dynamic shadows, gloss sheen, and magnetic buttons |
| 🛒 **Rental Cart & Booking** | Multi-item cart, accessory add-ons, date selection, availability checking, and checkout |
| 📋 **Customer Dashboard** | Active rentals, booking history, wishlist, and profile management |
| 📊 **Admin Analytics** | Revenue charts, inventory status, booking pipeline, and advanced reporting via Recharts |
| 🔐 **Secure Auth** | Supabase Auth with email/password, session management, and role-based access |
| 📱 **Fully Responsive** | Mobile-first design with touch interactions, swipe carousels, and simplified animations |
| ♿ **Accessibility First** | `prefers-reduced-motion` support, keyboard navigation, semantic HTML, and screen-reader labels |
| 🚀 **SEO Optimized** | Metadata API, Open Graph, Twitter cards, dynamic sitemap, and robots.txt |
| 💬 **WhatsApp Enquiry** | Direct rental enquiry via configured WhatsApp business number |

---

## Hero Scroll Animation

AUREVIA's hero section features a **cinematic Canon EOS R5 reveal** mapped precisely to scroll position — similar to Apple product pages — built entirely in-browser with zero video playback on desktop.

### How It Works

```
Page Load
  └─ Preload frames 1–30 + key milestones [50, 75, 100, 125, 150, 175, 200, 210]
  └─ Decode off-screen via img.decode() to prevent main-thread jank
  └─ Draw frame 1 instantly — no blank screen

User Scrolls (400vh track → sticky 100vh canvas)
  └─ requestAnimationFrame tick loop maps scroll position → target frame index
  └─ Lerp(currentFrame, targetFrame, 0.55) for smooth deceleration
  └─ Cache-miss fallback searches nearest loaded frame — eliminates flickering
  └─ IntersectionObserver pauses tick loop when hero leaves viewport

Scroll Milestones → Anime.js Stage Gates
  ├─ 0–12%   Empty studio reveal — Intro text fade in
  ├─ 12–30%  Camera materialises — Main heading animation
  ├─ 75–95%  Full reveal — Technical spec panel slide in
  └─ 82–100% Canvas scale(0.92) + fade out → transition to next section
```

### Technical Specifications

| Property | Value |
|---|---|
| **Total frames** | 210 JPEG images |
| **Frame format** | `/assets/canon-sequence/frame-{n}.jpg` |
| **Scroll height** | `400vh` container, `100vh` sticky canvas |
| **Lerp factor** | `0.55` (responsive + smooth deceleration) |
| **HiDPI** | `window.devicePixelRatio` scaled canvas |
| **Mobile fallback** | MP4 video (`/assets/videos/canonvideo.mp4`) |
| **Reduced motion** | Instant video fallback, no frame preloading |
| **Cache strategy** | Progressive batches of 15 frames, 50ms gaps |

> **File:** [`src/components/hero/HeroScrollSequence.tsx`](src/components/hero/HeroScrollSequence.tsx)

---

## Interactive 3D Optics Showroom

The **AUREVIA Optics Showroom** is a fully interactive, photorealistic virtual studio built with **React Three Fiber**, **Drei**, and **Three.js**.

### Studio Configuration

- **Environment**: Dark obsidian studio with champagne-gold rim lighting
- **Shadows**: `ContactShadows` for realistic contact depth
- **Floor**: Subtle reflective obsidian surface
- **Controls**: Drag to orbit, scroll to zoom, touch-pinch to pinch-zoom

### Camera Body — Canon EOS R5

Built from scratch using Drei `RoundedBox` primitives with **Physically Based Rendering (PBR)** materials:

- Charcoal matte body + rubber handgrip texture
- Mode dial, shutter button, top OLED screen, viewfinder hump
- Canon EF-RF mount flange with throat indicator
- Articulating rear touchscreen with button panel

### Swappable Lens System

| Lens | Description |
|---|---|
| **RF 24-70mm f/2.8L** | Matte black barrel, red L-series ring, convex front element |
| **RF 50mm f/1.2L** | Thick barrel, large front element, gold USM ring |
| **RF 70-200mm f/2.8L** | White telephoto barrel, silver collar, black focus rings |

### Clickable Hotspots

Four interactive inspection zones trigger smooth Anime.js camera coordinate transitions:

- **Sensor** — unmounts lens, reveals sensor cavity
- **Viewfinder** — zooms to EVF and shooting controls
- **Screen** — reveals articulating monitor with menu UI
- **Lens Mount** — inspects the RF mount throat

> **File:** [`src/components/three/CameraShowroom.tsx`](src/components/three/CameraShowroom.tsx)

---

## Rental & Booking Workflow

```mermaid
flowchart TD
    A[🔍 Explore Gear] --> B[📷 Select Product]
    B --> C[📅 Choose Rental Dates]
    C --> D{✅ Check Availability}
    D -- Available --> E[➕ Add Accessories]
    D -- Unavailable --> C
    E --> F[💰 Review Pricing]
    F --> G{🔐 Authenticated?}
    G -- No --> H[🔑 Login / Register]
    H --> F
    G -- Yes --> I[🛒 Cart & Checkout]
    I --> J[📋 Booking Confirmation]
    J --> K[⚙️ Admin Processing]
    K --> L[📦 Equipment Pickup / Delivery]
    L --> M[🎥 Rental Period]
    M --> N[📬 Return Gear]
    N --> O[💳 Deposit Released]
```

### Booking Engine Features

- **Daily & weekly pricing** with pro-rated daily calculation
- **Security deposit** tracking per product
- **Coupon codes** with percentage discount and expiry
- **Delivery method** — studio pickup or location delivery
- **Add-ons** — CFexpress cards, batteries, external monitors
- **Reference codes** — unique booking ID for tracking
- **WhatsApp enquiry** for non-standard bookings

---

## Customer Dashboard

Authenticated customers access a personal dashboard at `/dashboard`:

- **Active Bookings** — current rental status with pickup/return timeline
- **Booking History** — all past and cancelled bookings with reference codes
- **Wishlist** — saved gear for future rentals
- **Profile Management** — name, email, phone, and saved addresses
- **Booking Detail View** — itemised gear list, add-ons, pricing breakdown, and payment status

> **File:** [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)

---

## Admin Analytics Dashboard

The admin panel at `/admin` provides a comprehensive operations view:

| Panel | Description |
|---|---|
| **Revenue Overview** | Monthly revenue Recharts bar chart and trend lines |
| **Booking Pipeline** | Active pending, confirmed, picked-up, and returned bookings |
| **Inventory Status** | Per-unit availability, maintenance status, and serial tracking |
| **Equipment Utilisation** | Most rented gear, revenue per product |
| **Customer Insights** | New registrations, repeat customers, top spenders |
| **Damage & Deposits** | Open damage reports and deposit hold status |

> **File:** [`src/app/admin/page.tsx`](src/app/admin/page.tsx)

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | `16.2.10` | App Router, SSR, SSG, API routes |
| [React](https://react.dev) | `19.2.4` | Component framework |
| [TypeScript](https://www.typescriptlang.org) | `^5` | Type safety across the full stack |
| [Tailwind CSS](https://tailwindcss.com) | `^4` | Utility-first responsive styling |
| [Anime.js](https://animejs.com) | `^4.5.0` | Scroll animations, entrance reveals, transitions |
| [Three.js](https://threejs.org) | `^0.185.1` | 3D rendering engine |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | `^9.6.1` | React renderer for Three.js |
| [Drei](https://github.com/pmndrs/drei) | `^10.7.7` | Three.js helper components |
| [Lucide React](https://lucide.dev) | `^1.24.0` | Icon system |
| [Recharts](https://recharts.org) | `^3.9.2` | Admin analytics charts |

### Forms & Validation

| Technology | Version | Purpose |
|---|---|---|
| [React Hook Form](https://react-hook-form.com) | `^7.81.0` | Performant form state |
| [Zod](https://zod.dev) | `^4.4.3` | Schema validation |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | `^5.4.0` | RHF + Zod integration |

### Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| [Supabase](https://supabase.com) | `^2.110.5` | PostgreSQL, Auth, Storage, Row Level Security |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) | `^0.12.3` | Server-side session management |

### Fonts

| Font | Usage |
|---|---|
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Serif headings, editorial typography |
| [Inter](https://fonts.google.com/specimen/Inter) | UI text, labels, body copy |

---

## System Architecture

```mermaid
graph TD
    User(["👤 User / Browser"])

    subgraph Frontend ["Next.js 16 — App Router"]
        Pages["📄 Pages & Routes\n/explore, /gear/:slug, /booking\n/dashboard, /admin"]
        Components["🧩 Components\nNavbar, HeroScrollSequence\nCameraShowroom, Cards"]
        Hooks["🪝 Hooks\nuseCart, useAuth"]
        AnimeJS["🎬 Anime.js\nScroll Animations\nEntrance Reveals"]
        ThreeJS["🔭 Three.js / R3F\n3D Camera Showroom\nOrbit Controls"]
    end

    subgraph Auth ["Authentication"]
        SupabaseAuth["🔐 Supabase Auth\nEmail + Password\nSSR Session Cookies"]
        RLS["🛡️ Row Level Security\nCustomer / Staff / Admin Roles"]
    end

    subgraph Database ["Supabase PostgreSQL"]
        Profiles["👤 profiles"]
        Products["📷 products\nbrands, categories\nproduct_images, specs"]
        Inventory["📦 inventory_units\navailability_blocks"]
        Bookings["📋 bookings\nbooking_items, booking_addons"]
        Payments["💳 payments\ndeposits, returns"]
        Analytics["📊 Analytics Views\nRevenue, Utilisation"]
    end

    User --> Pages
    Pages --> Components
    Components --> AnimeJS
    Components --> ThreeJS
    Pages --> Hooks
    Hooks --> SupabaseAuth
    SupabaseAuth --> RLS
    RLS --> Profiles
    RLS --> Products
    RLS --> Inventory
    RLS --> Bookings
    RLS --> Payments
    Bookings --> Analytics
```

---

## Application Workflow

```mermaid
sequenceDiagram
    actor Customer
    participant Web as AUREVIA Web
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    Customer->>Web: Browse /explore — filter gear
    Web->>DB: Query products + availability
    DB-->>Web: Product list
    Customer->>Web: Open product detail /gear/:slug
    Customer->>Web: Add to Cart + select dates
    Customer->>Web: Proceed to /booking
    Web->>Auth: Check session
    Auth-->>Web: Unauthenticated
    Web->>Customer: Redirect to /login
    Customer->>Auth: Submit credentials
    Auth-->>Web: Session established
    Customer->>Web: Complete checkout
    Web->>DB: INSERT booking + booking_items
    DB-->>Web: Booking reference code
    Web->>Customer: Confirmation page
    Web->>Customer: WhatsApp notification link
    Note over Web,DB: Admin reviews booking at /admin
```

---

## Project Structure

```
aurevia-camera-rentals/
│
├── public/
│   ├── assets/
│   │   ├── canon-sequence/        # 210 JPEG frames for scroll animation
│   │   │   ├── frame-1.jpg
│   │   │   ├── frame-2.jpg
│   │   │   └── ...frame-210.jpg
│   │   └── videos/
│   │       └── canonvideo.mp4     # Mobile fallback video
│   └── readme/                    # README documentation assets
│       ├── aurevia-banner.png
│       └── aurevia-logo.png
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Homepage (hero, categories, featured gear)
│   │   ├── layout.tsx             # Root layout (fonts, metadata, providers)
│   │   ├── globals.css            # Design tokens, clamp typography, animations
│   │   ├── about/                 # About AUREVIA page
│   │   ├── admin/                 # Admin analytics dashboard
│   │   ├── booking/               # Checkout & booking confirmation
│   │   ├── contact/               # Contact & enquiry page
│   │   ├── dashboard/             # Customer rental dashboard
│   │   ├── explore/               # Equipment catalogue + filters
│   │   │   └── compare/           # Side-by-side gear comparison
│   │   ├── faq/                   # Frequently asked questions
│   │   ├── gear/[slug]/           # Individual product detail page
│   │   ├── login/                 # Authentication — sign in
│   │   ├── register/              # Authentication — create account
│   │   ├── rental-process/        # How renting works page
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms & conditions
│   │   ├── robots.ts              # SEO — robots.txt generation
│   │   └── sitemap.ts             # SEO — dynamic sitemap generation
│   │
│   ├── components/
│   │   ├── hero/
│   │   │   └── HeroScrollSequence.tsx  # Canvas scroll animation engine
│   │   ├── navigation/
│   │   │   └── Navbar.tsx              # Responsive glass navbar
│   │   └── three/
│   │       └── CameraShowroom.tsx      # Three.js photorealistic showroom
│   │
│   ├── hooks/
│   │   └── useCart.tsx            # Cart state management (Context + localStorage)
│   │
│   └── lib/
│       └── db/
│           ├── mockData.ts        # Typed product seed data (brands, categories, products)
│           └── store.ts           # Data access layer (queries, filters, sorting)
│
├── supabase/
│   └── migrations/
│       └── 20260715000000_schema.sql  # Full PostgreSQL schema
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config (via postcss)
└── eslint.config.mjs
```

---

## Database Overview

The PostgreSQL schema (via Supabase) covers the complete rental operation:

```mermaid
erDiagram
    profiles ||--o{ bookings : "places"
    profiles ||--o{ wishlists : "saves"
    profiles ||--o{ addresses : "has"

    bookings ||--|{ booking_items : "contains"
    bookings ||--o{ booking_addons : "includes"
    bookings ||--o{ payments : "has"
    bookings ||--o| deposits : "requires"
    bookings ||--o| returns : "results in"

    products ||--o{ booking_items : "rented via"
    products ||--o{ product_images : "shown by"
    products ||--o{ product_specifications : "described by"
    products ||--o{ inventory_units : "tracked as"
    products ||--o{ availability_blocks : "blocked by"
    products }o--|| brands : "made by"
    products }o--|| categories : "belongs to"

    product_addons ||--o{ booking_addons : "added to"
```

### Core Tables

| Table | Description |
|---|---|
| `profiles` | Customer accounts linked to Supabase Auth |
| `addresses` | Customer delivery addresses |
| `brands` | Equipment brands (Canon, Sony, Nikon, DJI, RED) |
| `categories` | 8 gear categories (Mirrorless, Cinema, Lenses, etc.) |
| `products` | Equipment catalogue with daily/weekly pricing |
| `product_images` | Multiple images per product |
| `product_specifications` | Key-value spec pairs for filtering |
| `inventory_units` | Physical units with serial numbers and status |
| `availability_blocks` | Manual hold periods (maintenance, events) |
| `product_addons` | Rentable accessories (cards, batteries, monitors) |
| `wishlists` | Customer saved gear |
| `bookings` | Rental reservations with full pricing breakdown |
| `booking_items` | Line items per booking (product + unit assignment) |
| `booking_addons` | Add-on selections per booking |
| `payments` | Transaction records |
| `deposits` | Security deposit lifecycle tracking |
| `returns` | Equipment return records |

### Enums

```sql
user_role:        customer | staff | admin
inventory_status: available | rented | maintenance | decommissioned
booking_status:   pending | confirmed | picked_up | returned | cancelled | rejected
payment_status:   unpaid | paid | refunded
deposit_status:   held | released | forfeited
```

---

## Environment Variables

Create a `.env.local` file in the project root. **Never commit real credentials.**

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (Direct connection for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres

# Business Contact
NEXT_PUBLIC_WHATSAPP_NUMBER=9686909048
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` grants full database access. Keep it **server-side only** and never expose it to the browser.

---

## Installation & Setup

### Prerequisites

- Node.js `v18.17+`
- npm `v9+`
- A [Supabase](https://supabase.com) project (free tier works for development)

### 1. Clone & Install

```bash
git clone https://github.com/Sachinxcode-01/aurevia-premium-rentals.git
cd aurevia-premium-rentals
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials (see [Environment Variables](#environment-variables)).

### 3. Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in your project dashboard
3. Copy and run the migration file:

```bash
# Run via Supabase CLI (if installed)
npx supabase db push

# Or manually paste supabase/migrations/20260715000000_schema.sql
# into the Supabase SQL Editor and execute
```

### 4. Configure Supabase Storage

In your Supabase project dashboard:
1. Go to **Storage** → **Create a new bucket** → Name it `product-images`
2. Set the bucket to **Public**
3. Configure CORS if using file uploads

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Commands

```bash
# Start the development server with hot reload
npm run dev

# Compile TypeScript and check for errors (no output)
npx tsc --noEmit

# Run ESLint across the codebase
npm run lint

# Build for production
npm run build

# Start the production server (after build)
npm start
```

---

## Production Build

```bash
# Create optimised production bundle
npm run build

# Review the route output
# ○ Static   — pre-rendered at build time
# ƒ Dynamic  — server-rendered on demand

# Start production server locally
npm start
```

The production build outputs all static routes as pre-rendered HTML and uses server-rendering only for dynamic routes such as `/gear/[slug]`.

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the **Vercel Project Settings → Environment Variables** panel
4. Vercel auto-detects Next.js — click **Deploy**

### Environment Variables on Vercel

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g. `https://aurevia.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client-side |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only |
| `DATABASE_URL` | Server-side only |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Client-side |

---

## Security Features

| Feature | Implementation |
|---|---|
| **Authentication** | Supabase Auth with secure session cookies via `@supabase/ssr` |
| **Row Level Security** | PostgreSQL RLS policies enforce data isolation per user role |
| **Role-Based Access** | `customer`, `staff`, `admin` roles control page and data access |
| **Input Validation** | All forms validated with Zod schemas before any DB operation |
| **No Credential Exposure** | Service role key restricted to server-side only |
| **HTTPS Enforced** | Vercel enforces TLS on all production traffic |
| **Deposit Protection** | Security deposits tracked independently with lifecycle states |

---

## Performance Optimizations

| Area | Technique |
|---|---|
| **Canvas Animation** | `requestAnimationFrame` + lerp interpolation at 60 FPS |
| **Frame Preloading** | Progressive batched preloading with `img.decode()` off-screen |
| **Anti-Flicker** | Nearest-frame fallback rendering prevents blank canvas |
| **Visibility Pausing** | `IntersectionObserver` halts tick loop when hero is off-screen |
| **Font Loading** | `next/font` with `display: swap` prevents layout shift |
| **Static Generation** | All stable pages pre-rendered at build time |
| **CSS Animations** | `transform-only` and `will-change: transform, opacity` for GPU compositing |
| **Image Optimisation** | `next/image` with WebP and AVIF format negotiation |
| **Responsive Typography** | `clamp()` fluid sizing system eliminates breakpoint-specific overrides |
| **3D Rendering** | Drei `ContactShadows`, baked environment maps, and frustum culling |
| **Reduced Motion** | Full `prefers-reduced-motion` fallback — no heavy animation on sensitive systems |

---

## Roadmap

> Features planned for future development cycles.

- [ ] **Razorpay / Stripe Payment Integration** — Online payment collection at checkout
- [ ] **Real-time Availability Calendar** — Live unit-level availability via Supabase Realtime
- [ ] **Equipment Comparison Tool** — Side-by-side spec comparison (route exists at `/explore/compare`)
- [ ] **Supabase Storage** — Admin product image upload with CDN delivery
- [ ] **Email Notifications** — Booking confirmation and status updates via Resend
- [ ] **SMS Alerts** — Pickup reminders via Twilio
- [ ] **Staff Portal** — Equipment check-in/check-out with condition reports
- [ ] **Damage Waiver Checkout** — Optional damage protection add-on at booking
- [ ] **Customer Reviews** — Post-return equipment rating system
- [ ] **Loyalty Points** — Repeat rental rewards programme
- [ ] **Multi-language Support** — Kannada and Hindi locale support

---

## Contact & Credits

<table>
<tr>
<td width="50%" align="center">

### 🏪 Business Owner

**Prem Mundargi**

Owner, AUREVIA Camera Rentals

📧 [premmundargi135@gmail.com](mailto:premmundargi135@gmail.com)  
📞 +91 96869 09048

*Prem owns and operates the AUREVIA camera rental business, manages the equipment fleet, customer relations, and rental operations.*

</td>
<td width="50%" align="center">

### 💻 Technical Manager

**Sachin**

Website Designer & Technical Lead

📧 [sachiii8827@gmail.com](mailto:sachiii8827@gmail.com)  
📞 +91 98807 62623  
🐙 [github.com/Sachinxcode-01](https://github.com/Sachinxcode-01)

*Sachin designed and developed the AUREVIA web platform end-to-end, covering architecture, UI/UX design, 3D systems, animation engine, database schema, and deployment.*

</td>
</tr>
</table>

---

## License

This project is **proprietary software** developed exclusively for AUREVIA Camera Rentals by Prem Mundargi.

All source code, design assets, and brand identity are copyright © 2026 AUREVIA / Prem Mundargi. Unauthorised reproduction, distribution, or use of this codebase is strictly prohibited.

---

<div align="center">

<br/>

<img src="public/readme/aurevia-logo.png" alt="AUREVIA" width="60" height="60" />

**AUREVIA Camera Rentals**

*Frame the Extraordinary.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Sachinxcode--01-181717?style=flat-square&logo=github)](https://github.com/Sachinxcode-01)

</div>
