<div align="center">

<img src="public/readme/aurevia-banner.png" alt="AUREVIA — Premium Camera Rentals" width="100%" />

<br/>

<img src="public/readme/aurevia-logo.png" alt="AUREVIA Logo" width="100" height="100" />

# AUREVIA
### Luxury Cinema Camera & Optics Rentals
**Engineered by Prem & Sachin**

> *"Frame the Extraordinary."*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-R185-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Razorpay](https://img.shields.io/badge/Razorpay-Node%20SDK-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![Build Status](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-Private-D8B36A?style=flat-square)](.)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)](.)
[![Security Hardened](https://img.shields.io/badge/Security-Audit%20Passed-blue?style=flat-square)](.)

<br/>

[📋 GitHub Repository](https://github.com/Sachinxcode-01/aurevia-premium-rentals) &nbsp;·&nbsp;
[📖 Platform Architecture](#platform-architecture) &nbsp;·&nbsp;
[🗄️ Database & User Details](#database-schema--user-details-deep-dive) &nbsp;·&nbsp;
[🚀 Roadmap of Improvements](#platform-improvements--audit-roadmap) &nbsp;·&nbsp;
[📞 Founders & Credits](#founders--credits)

</div>

---

## Table of Contents

1. [Executive Summary & Vision](#executive-summary--vision)
2. [Platform Architecture](#platform-architecture)
3. [Key Production Features](#key-production-features)
   - [Supabase SSR Auth & Production Google OAuth](#1-supabase-ssr-auth--production-google-oauth)
   - [Realtime Viral Referral & Rewards System](#2-realtime-viral-referral--rewards-system)
   - [Interactive 3D Camera & Optics Showroom](#3-interactive-3d-camera--optics-showroom)
   - [Hero Scroll Canvas Cinema Animation](#4-hero-scroll-canvas-cinema-animation)
   - [Pelican Flight-Case Dispatch & Inspection Terminal](#5-pelican-flight-case-dispatch--inspection-terminal)
   - [Operational Admin Command Center](#6-operational-admin-command-center)
   - [Double-Booking Concurrency Protection](#7-double-booking-concurrency-protection)
4. [Database Schema & User Details Deep-Dive](#database-schema--user-details-deep-dive)
   - [Entity Relationship Diagram](#entity-relationship-diagram)
   - [User Details & Profiles Architecture](#user-details--profiles-architecture)
   - [Identity Verification & KYC Engine](#identity-verification--kyc-engine)
   - [Fleet Inventory & Unit-Level Tracking](#fleet-inventory--unit-level-tracking)
   - [Reservation & Payment Lifecycle](#reservation--payment-lifecycle)
5. [Platform Improvements & Audit Roadmap](#platform-improvements--audit-roadmap)
   - [User Details & Profile Enhancements](#1-user-details--profile-enhancements)
   - [Database & Schema Hardening](#2-database--schema-hardening)
   - [Equipment & Fleet Operations](#3-equipment--fleet-operations)
   - [Customer Checkout & Financials](#4-customer-checkout--financials)
   - [Real-Time Customer Engagement](#5-real-time-customer-engagement)
6. [Technology Stack](#technology-stack)
7. [Repository File Structure](#repository-file-structure)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Environment Variables](#environment-variables)
10. [Installation & Local Development](#installation--local-development)
11. [Verification & Production Build](#verification--production-build)
12. [Security & Concurrency Protections](#security--concurrency-protections)
13. [Founders & Credits](#founders--credits)

---

## Executive Summary & Vision

**AUREVIA** is an enterprise-grade, luxury camera and cinema equipment rental ecosystem engineered specifically for commercial cinematographers, directors of photography (DoPs), indie filmmakers, and production houses.

High-end film equipment (such as full-frame 8K mirrorless bodies, anamorphic primes, 3-axis cinema gimbals, and high-frequency wireless audio) carries extreme capital expenditure and strict on-set reliability demands. AUREVIA bridges this gap by combining:
- **Editorial Luxury Interface**: Bespoke aesthetic crafted with obsidian, champagne gold accents, glassmorphic HUD telemetry, and tactile micro-animations.
- **Precision Equipment Verification**: Interactive 3D photorealistic showroom allowing creators to inspect camera mounts, sensor blocks, and ray paths before booking.
- **Zero Double-Booking Guarantee**: Database-level transactional row locks (`FOR UPDATE SKIP LOCKED`) allocating physical inventory units by serial number.
- **Flight-Case Inspection Terminal**: Complete dispatch and return checklist with sensor cleanliness certification, barcode tracking, and damage penalty assessment.
- **Integrated Identity & Trust**: Strict KYC verification, Google OAuth with PKCE security, and customer privilege isolation.

---

## Platform Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Clients"]
        WEB["Customer Web Portal\n(:3000 / Next.js 16)"]
        ADMIN["Admin Management Suite\n(:3002 / Next.js 16)"]
    end

    subgraph EdgeLayer["Edge & Middleware"]
        PROXY["src/proxy.ts\n(RBAC / Strict CORS / Auth Guard)"]
        OAUTH_CB["OAuth PKCE Callback\n(/auth/callback)"]
    end

    subgraph ServiceLayer["Application & Services"]
        AUTH_SVC["Supabase SSR Auth Client"]
        BOOKING_SVC["Booking & Reservation Engine"]
        KYC_SVC["KYC Document OCR & Verification"]
        PAY_SVC["Razorpay Payment Gateway & Webhooks"]
        EMAIL_SVC["Nodemailer & SMTP Mailer"]
        REALTIME_HUB["Supabase Realtime WebSockets"]
    end

    subgraph StorageLayer["Data & Persistence (Supabase PostgreSQL)"]
        DB_PROFILES[("profiles\n(User Details & Roles)")]
        DB_KYC[("kyc_documents\n(Identity Records)")]
        DB_BOOKINGS[("bookings & booking_items\n(Reservations Engine)")]
        DB_INVENTORY[("inventory_units\n(Serial-Tracked Units)")]
        DB_REFERRALS[("referrals\n(Viral Rewards Ledger)")]
        DB_TICKETS[("support_tickets & replies\n(Support Desk)")]
        DB_AUDIT[("audit_logs & processed_events\n(Idempotency & Audits)")]
    end

    WEB --> PROXY
    ADMIN --> PROXY
    PROXY --> OAUTH_CB
    PROXY --> AUTH_SVC
    PROXY --> BOOKING_SVC
    PROXY --> PAY_SVC
    PROXY --> KYC_SVC

    AUTH_SVC --> DB_PROFILES
    KYC_SVC --> DB_KYC
    BOOKING_SVC --> DB_BOOKINGS
    BOOKING_SVC --> DB_INVENTORY
    REALTIME_HUB <--> WEB
    REALTIME_HUB <--> ADMIN
    PAY_SVC --> DB_BOOKINGS
```

---

## Key Production Features

### 1. Supabase SSR Auth & Production Google OAuth
- **Dual Authentication**: Seamless credential login (email/password with strength meter) or one-click Google Sign-In.
- **Secure PKCE Token Exchange**: `@supabase/ssr` exchanges authorization codes for secure, HTTP-only, SameSite cookies in `src/app/auth/callback/route.ts`.
- **Enforced Role Isolation**: First-time Google OAuth registrations automatically upsert profiles strictly as `role: "customer"`.
- **Database Trigger Guard**: `trg_prevent_role_escalation` operates `BEFORE INSERT OR UPDATE` on `public.profiles` to prevent tampering with user privilege roles.
- **Route Guard**: `src/proxy.ts` automatically redirects unauthorized attempts to access `/dashboard`, `/profile`, `/checkout`, `/kyc`, and `/booking`.

### 2. Realtime Viral Referral & Rewards System
- **Viral Referral Links**: Each creator receives a unique share link (`https://aurevia.com/booking?ref=AUREVIA-REF-XXXXX`).
- **Dual Incentive Flow**:
  - **Referred Friend**: Receives an instant flat ₹200 discount at checkout.
  - **Referrer**: Receives ₹500 in rental credits upon booking completion.
- **Live WebSocket Dashboard**: When a referred creator signs up or books, the referrer's dashboard updates in real-time via Supabase WebSockets.
- **Admin Referral Terminal** (`/referrals`): Complete overview of viral referral velocity, conversion percentages, and one-click credit approval.

### 3. Interactive 3D Camera & Optics Showroom
- Built using **React Three Fiber (R3F)**, **Drei**, and **Three.js** (`src/components/three/CameraShowroom.tsx`).
- **Exploded View Mode**: Smooth lerp animation deconstructing the camera body, mount flange, optical filter, and full-frame sensor block into 3D space.
- **Floating 3D Callouts**: Interactive HTML annotation pins highlighting sensor resolution, optical stabilization, mount type, and video frame rates.
- **Optical Ray Path**: Visual ray tracing showing light transmission through cinema glass onto the sensor plane.
- **Studio Mood Lighting**: Switch between `Gold Luxury`, `Studio High-Key`, and `Anamorphic Blue` lighting profiles.

### 4. Hero Scroll Canvas Cinema Animation
- Located at `src/components/hero/HeroScrollSequence.tsx`.
- **210-Frame Canvas Engine**: High-fidelity photographic sequence rendered directly to an HTML5 canvas synchronized with user scroll velocity.
- **RAF Damping Interpolation**: Hardware-accelerated RequestAnimationFrame lerp eliminating scroll jitter and frame-tearing.
- **Heads-Up Display (HUD)**: Real-time telemetry showing frame index, optical focus distance, and chapter progression.

### 5. Pelican Flight-Case Dispatch & Inspection Terminal
- Located at `admin/src/app/(dashboard)/returns/page.tsx`.
- **Barcode & Serial Scanner**: Instant flight-case check-in via hardware barcode scanner or serial lookup (`PEL-R5-108`, `PEL-RED-204`).
- **Pre-Flight & Post-Flight Checklist**: 7-point verification verifying camera body, cine lens, batteries, dual-bay charger, memory cards, rugged cables, and pelican case seals.
- **5-Point Sensor Cleanliness Certification**: Optical inspection grading (Pristine, Micro-Dust, Smudge, Scratched).
- **Automated Damage Penalty Engine**: Calculates replacement/repair costs with instant penalty payment link dispatch.
- **Official PDF Packing Manifest**: Generates printable dispatch manifests with custodian signature lines.

### 6. Operational Admin Command Center
- Located on port `:3002` (`admin/`).
- **Fleet Calendar Schedule**: Interactive Gantt-style timeline showing active rentals, scheduled pickups, and maintenance hold blocks.
- **KYC Review Pipeline**: Document inspection desk for verifying government IDs (`Aadhaar`, `Driving Licence`, `PAN`, `Passport`).
- **Review Moderation Queue**: Approving and curating verified customer ratings for public homepage display.
- **Threaded Support Desk**: Live customer support system with real-time bidirectional WebSocket message streaming.

### 7. Double-Booking Concurrency Protection
- Employs a dedicated PostgreSQL function `reserve_inventory_for_booking` with `FOR UPDATE SKIP LOCKED`.
- Resolves race conditions during peak festival/wedding seasons when multiple creators attempt to book the same camera unit simultaneously.

---

## Database Schema & User Details Deep-Dive

### Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ ADDRESSES : "has many"
    PROFILES ||--o{ BOOKINGS : "places"
    PROFILES ||--o{ KYC_DOCUMENTS : "submits"
    PROFILES ||--o{ REFERRALS : "refers"
    PROFILES ||--o{ SUPPORT_TICKETS : "files"
    PROFILES ||--o{ NOTIFICATIONS : "receives"
    PROFILES ||--o{ WISHLISTS : "saves"
    PROFILES ||--o{ REVIEWS : "writes"

    PRODUCTS ||--o{ INVENTORY_UNITS : "has physical"
    PRODUCTS ||--o{ BOOKING_ITEMS : "included in"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--o{ PRODUCT_SPECIFICATIONS : "specifies"
    BRANDS ||--o{ PRODUCTS : "manufactures"
    CATEGORIES ||--o{ PRODUCTS : "classifies"

    BOOKINGS ||--|{ BOOKING_ITEMS : "contains"
    BOOKINGS ||--o{ BOOKING_ADDONS : "includes"
    BOOKINGS ||--o{ PAYMENTS : "generates"
    BOOKINGS ||--o{ REFUNDS : "may have"
    BOOKINGS ||--o{ RETURNS : "settled via"
    RETURNS ||--o{ DAMAGE_REPORTS : "may incur"

    INVENTORY_UNITS ||--o{ BOOKING_ITEMS : "assigned to"
    INVENTORY_UNITS ||--o{ MAINTENANCE_RECORDS : "undergoes"
```

---

### User Details & Profiles Architecture

User identity in AUREVIA is anchored to Supabase `auth.users` and mirrored to `public.profiles`:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### User Roles & Privileges
| Role | Permissions & Scope |
|---|---|
| `customer` | Default role. Can view catalog, book gear, submit KYC, manage own profile/addresses, review bookings, and file support tickets. |
| `staff` | Operational role. Can inspect inventory, process flight-case dispatch/returns, view bookings, and reply to support tickets. |
| `admin` | Full system access. Can modify catalog pricing, approve/reject KYC, issue refunds, adjust coupon limits, and manage staff accounts. |

---

### Identity Verification & KYC Engine

Because cinema gear entails high physical value, AUREVIA requires mandatory identity verification prior to equipment handover:

```sql
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    id_type VARCHAR(50) NOT NULL, -- 'aadhaar', 'driving_licence', 'passport', 'pan'
    id_number VARCHAR(100) NOT NULL,
    id_front_url TEXT NOT NULL,
    id_back_url TEXT,
    selfie_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Fleet Inventory & Unit-Level Tracking

Unlike typical e-commerce platforms that track generic inventory counts, AUREVIA tracks each camera body and lens by its unique **serial number**:

```sql
CREATE TABLE IF NOT EXISTS public.inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status inventory_status DEFAULT 'available', -- 'available', 'rented', 'maintenance', 'decommissioned'
    last_inspected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Reservation & Payment Lifecycle

```
[Customer Selects Gear]
         │
         ▼
[Cart Validated & Availability Checked]
         │
         ▼
[Checkout Form: Dates, KYC Check, Shipping / Studio Pickup]
         │
         ▼
[Razorpay Order Generated (/api/create-order)]
         │
         ▼
[Payment Completed via UPI / Card / NetBanking]
         │
         ▼
[Webhook Signature Verified (/api/webhooks/razorpay)]
         │
         ├─► Mark booking as 'confirmed'
         ├─► Lock physical inventory unit via reserve_inventory_for_booking()
         ├─► Dispatch PDF Confirmation & Invoice via SMTP
         └─► Notify Admin Dispatch Queue via WebSockets
```

---

## Platform Improvements & Audit Roadmap

Following a comprehensive audit of the database schema, security boundaries, and user workflows, here are the recommended next improvements:

### 1. User Details & Profile Enhancements
- [ ] **B2B GSTIN & Company Invoicing**: Add `company_name`, `gstin`, and `billing_address` to `profiles` so commercial production houses can receive automated B2B GST tax credit invoices.
- [ ] **Emergency & Studio Contact**: Add `emergency_contact_name` and `emergency_contact_phone` to ensure equipment recovery contact channels during multi-day location shoots.
- [ ] **Cached KYC Status on `profiles`**: Add a `kyc_status` enum (`unverified`, `pending`, `verified`, `rejected`) directly to `profiles` with an auto-updating trigger. This eliminates repetitive subqueries in the checkout pipeline.
- [ ] **Creator Social & Portfolio Verification**: Add `instagram_handle`, `vimeo_url`, and `imdb_profile` for accelerated KYC approval of established cinematographers.
- [ ] **User Risk Score & Blacklist Flag**: Add `is_blocked` and `damage_incident_count` to safeguard the fleet against repeat offenders or delinquent accounts.

### 2. Database & Schema Hardening
- [ ] **Rental Credits Ledger**: Create a dedicated `wallet_transactions` table to track earned referral credits, redeemed booking credits, and balance expiration with complete accounting auditability.
- [ ] **Hourly & Half-Day Time Slot Granularity**: Extend `bookings` with exact pickup/return time blocks (`pickup_window`, `return_window`) to optimize same-day turnaround between morning and evening shoots.
- [ ] **Automated Backup & Archive Policies**: Implement Supabase pg_cron jobs to archive old completed booking telemetry and purge expired session tokens.

### 3. Equipment & Fleet Operations
- [ ] **QR Code Asset Tags**: Generate physical QR codes for every Pelican flight case and camera body, allowing warehouse staff to perform instantaneous check-in/check-out from mobile camera scanners.
- [ ] **Shutter Count & Sensor Hours Logging**: Track shutter actuations and sensor run-hours inside `maintenance_records` to predict sensor calibration cycles and prevent field breakdowns.
- [ ] **Location Geofencing / GPS Beacon Integration**: Provide optional support for GPS tracker telemetry in high-value packages (e.g. RED Digital / Arri cinema packages).

### 4. Customer Checkout & Financials
- [ ] **Security Deposit Pre-Auth Holds**: Switch from direct charging and manual refunding of security deposits to Razorpay/Stripe pre-authorization holds that automatically release upon pristine inspection.
- [ ] **Dynamic Multi-Item Bundle Builder**: Introduce automated package discounting (e.g., Camera Body + Anamorphic Lens + Wireless Focus + Monitor bundle triggers an automatic 15% discount).
- [ ] **Automated GST Tax Invoice PDF**: Generate downloadable, digitally signed tax invoices with HSN/SAC codes directly inside the customer dashboard.

### 5. Real-Time Customer Engagement
- [ ] **WhatsApp Cloud API Integration**: Send instant booking confirmations, dispatch manifests, and return reminders directly to the creator's WhatsApp via `NEXT_PUBLIC_CONCIERGE_WHATSAPP`.
- [ ] **In-App Live Support Chat Audio/Image Upload**: Allow cinematographers on set to send camera error-code photos directly inside the support ticket chat.

---

## Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Core Framework** | Next.js 16.2.10 (App Router) | Server components, streaming, API route handlers, and proxy middleware |
| **UI Library** | React 19.2.4 & TypeScript 5 | Modern typed component architecture with concurrent rendering |
| **Styling** | Tailwind CSS 4 & Lucide Icons | Ultra-fast styling engine, custom luxury gold/obsidian design system |
| **Database** | Supabase PostgreSQL | Managed relational database with 32 tables, triggers, and stored procedures |
| **Authentication** | Supabase SSR Auth | HTTP-only cookie session handling with Google OAuth PKCE and native email verification |
| **3D Rendering** | Three.js R185, R3F & Drei | Interactive 3D camera showroom with exploded view and optical ray paths |
| **Animations** | Anime.js 4 & Motion | RAF canvas scroll sequence and fluid page transitions |
| **Payments** | Razorpay Node SDK | Secure order generation, signature verification, and webhook handling |
| **Realtime Engine** | Supabase WebSockets | Bidirectional multi-channel sync for bookings, referrals, and support tickets |
| **Communications** | Nodemailer & SMTP | Automated HTML email confirmations, dispatch receipts, and OTP verification |
| **Deployment** | Vercel Serverless | Global edge network, serverless functions, and asset optimization |

---

## Repository File Structure

```
aurevia-premium-rentals/
├── admin/                         # Admin Operations Suite (:3002)
│   ├── src/app/(dashboard)/       # Admin screens: Bookings, Inventory, KYC, Returns, Referrals
│   └── package.json               # Admin dependencies & scripts
├── public/                        # Static assets, logos, and readme media
│   └── readme/                    # Architectural banners and branding
├── src/
│   ├── app/                       # Next.js App Router (:3000)
│   │   ├── (auth)/                # Login, register, forgot-password, reset-password
│   │   ├── api/                   # REST API endpoints (bookings, kyc, payments, webhooks)
│   │   ├── booking/               # Equipment reservation flow & calendar
│   │   ├── dashboard/             # Customer dashboard, active rentals & referrals
│   │   ├── gear/                  # Product catalog with fine-filtering & 3D showroom
│   │   ├── kyc/                   # Identity verification upload portal
│   │   └── layout.tsx             # Root layout & global providers
│   ├── components/                # Modular React components
│   │   ├── chatbot/               # Live support chat interface
│   │   ├── hero/                  # 210-frame canvas scroll sequence engine
│   │   ├── navigation/            # Luxury navbar, mobile drawer, user profile menu
│   │   ├── three/                 # Three.js 3D camera showroom & exploded view
│   │   └── ui/                    # Reusable design system primitives
│   ├── hooks/                     # Custom React hooks (useCart, useToast, useRealtime)
│   ├── lib/                       # Core application utilities
│   │   ├── actions/               # Next.js Server Actions (auth, bookings)
│   │   ├── db/                    # Supabase database access layer
│   │   ├── email/                 # Email templates & nodemailer transport
│   │   ├── services/              # Availability engine, OCR, referral service
│   │   └── supabase/              # Supabase SSR client, server, and admin clients
│   └── proxy.ts                   # Edge middleware (RBAC, CORS whitelist, auth guard)
├── supabase/
│   └── migrations/                # 13 versioned SQL migrations (schema, RLS, indexes, triggers)
├── .env.example                   # Environment configuration template
├── package.json                   # Root dependencies & build scripts
└── tsconfig.json                  # Strict TypeScript configuration
```

---

## API Endpoints Reference

### Customer & Storefront Endpoints
- `POST /api/create-order`: Validates cart availability and generates Razorpay payment order.
- `POST /api/verify-payment`: Verifies Razorpay payment signature and activates booking reservation.
- `GET /api/v1/kyc`: Fetches current KYC verification status for authenticated customer.
- `POST /api/kyc/verify-doc`: Uploads and initiates OCR verification for government identity document.
- `GET /api/bookings`: Lists active and historical bookings for authenticated customer.
- `POST /api/support`: Creates a new technical or rental support ticket.

### Administrative & Operations Endpoints
- `GET /api/bookings/return?ref=...`: Retrieves booking and serial checklist for flight-case inspection.
- `POST /api/bookings/return`: Finalizes return inspection, records damage reports, and calculates late fees.
- `POST /api/create-penalty-order`: Generates Razorpay payment link for damage or late return penalties.
- `GET /api/v1/admin/dashboard`: Returns aggregate revenue, fleet utilization, and pending dispatch counts.
- `GET /api/v1/admin/kyc`: Lists pending customer identity documents awaiting verification.
- `POST /api/v1/admin/kyc`: Approves or rejects customer KYC document with reason notes.

### Webhook & Background Endpoints
- `POST /api/webhooks/razorpay`: Processes asynchronous payment capture and refund events with HMAC verification.
- `GET /api/cron/booking-ops`: Automated background cron checking for overdue rentals and releasing expired holds.

---

## Environment Variables

Create `.env.local` in the root directory (and replicate in your Vercel Project Settings):

```ini
# ==============================================================================
# SUPABASE POSTGRESQL & AUTH
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://uoutovqmmxzawhvpahcg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_1NFW4MM4sCE7qVZVvFUjEQ_bU3VH4TI
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:...@db.uoutovqmmxzawhvpahcg.supabase.co:5432/postgres

# ==============================================================================
# APPLICATION ORIGINS & CORS
# ==============================================================================
NEXT_PUBLIC_APP_URL=https://aurevia-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://aurevia-app.vercel.app
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002

# ==============================================================================
# RAZORPAY PAYMENT GATEWAY
# ==============================================================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ==============================================================================
# SMTP NOTIFICATION SERVICE & CONCIERGE
# ==============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=sachiii8827@gmail.com
SMTP_APP_PASSWORD=your_google_app_password
NEXT_PUBLIC_CONCIERGE_WHATSAPP=919686909048
```

---

## Installation & Local Development

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **Supabase Account**: With PostgreSQL project created

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/Sachinxcode-01/aurevia-premium-rentals.git
cd aurevia-premium-rentals

# Install root customer portal dependencies
npm install

# Install admin operations suite dependencies
cd admin
npm install
cd ..
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Populate .env.local with your Supabase, Razorpay, and SMTP credentials
```

### 3. Run Development Servers
```bash
# Terminal 1: Launch Customer Web Portal (http://localhost:3000)
npm run dev

# Terminal 2: Launch Admin Operations Suite (http://localhost:3002)
npm run dev:admin
```

---

## Verification & Production Build

Run the automated verification suite before deploying:

```bash
# 1. Typecheck the entire customer portal
npm run typecheck

# 2. Typecheck the admin operations suite
cd admin && npm run typecheck && cd ..

# 3. Execute linting rules
npm run lint

# 4. Run unit and integration tests
npm test

# 5. Execute production Next.js build
npm run build
```

---

## Security & Concurrency Protections

1. **Row Level Security (RLS)**: Enforced across all operational tables. Customers can only read and write their own bookings, profiles, documents, and support tickets.
2. **Double-Booking Elimination**: Database-level stored procedure `reserve_inventory_for_booking` uses `FOR UPDATE SKIP LOCKED` transaction locking to guarantee physical units cannot be double-booked.
3. **Privilege Escalation Prevention**: PostgreSQL trigger `trg_prevent_role_escalation` operates `BEFORE INSERT OR UPDATE` on `public.profiles` to strictly block unauthorized role elevation.
4. **Idempotent Webhooks**: Razorpay webhooks verify SHA256 signatures and log event IDs to `processed_events` to prevent duplicate payment credits or order processing.
5. **Strict CORS Whitelisting**: `src/proxy.ts` verifies incoming origin against an explicit domain whitelist, rejecting untrusted cross-origin requests.

---

## Founders & Credits

<div align="center">

| Name | Role | Contact |
|---|---|---|
| **Prem Mundargi** | Founder & Fleet Operations Director | `+91 96869 09048` |
| **Sachin** | Lead Systems Architect & Full-Stack Engineer | `sachiii8827@gmail.com` |

<br/>

**AUREVIA — Frame the Extraordinary.**  
*Luxury Cinema Camera & Optics Rentals.*

</div>
