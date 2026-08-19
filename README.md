<div align="center">

<img src="public/readme/aurevia-banner.png" alt="AUREVIA — Premium Camera Rentals" width="100%" />

<br/>

<img src="public/readme/aurevia-logo.png" alt="AUREVIA Logo" width="100" height="100" />

# AUREVIA

### Premium Camera Rentals by Prem & Sachin

> *"Frame the Extraordinary."*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-R185-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![Build Status](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-Private-D8B36A?style=flat-square)](.)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)](.)

<br/>

[📋 View Repository](https://github.com/Sachinxcode-01/aurevia-premium-rentals) &nbsp;·&nbsp;
[📖 Documentation](#table-of-contents) &nbsp;·&nbsp;
[📞 Contact](#contact--credits)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Production Features](#key-production-features)
- [Supabase SSR Auth & Production Google OAuth](#supabase-ssr-auth--production-google-oauth)
- [Realtime Viral Referral & Rewards System](#realtime-viral-referral--rewards-system)
- [Pelican Flight-Case Dispatch & Inspection Terminal](#pelican-flight-case-dispatch--inspection-terminal)
- [Interactive 3D Camera & Optics Showroom](#interactive-3d-camera--optics-showroom)
- [Hero Scroll Canvas Animation](#hero-scroll-canvas-animation)
- [Admin Operations & Customer Engagement Suite](#admin-operations--customer-engagement-suite)
- [Supabase Database & Realtime Architecture](#supabase-database--realtime-architecture)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Verification & Build Commands](#verification--build-commands)
- [Deployment Guide](#deployment-guide)
- [Security & Concurrency Protection](#security--concurrency-protection)
- [Contact & Credits](#contact--credits)

---

## Project Overview

**AUREVIA** is an enterprise-grade full-stack camera rental platform engineered for professional cinematographers, commercial directors, and film production houses. It provides a luxury editorial interface to discover, inspect in 3D, reserve, and manage flagship cinema cameras, anamorphic optics, gimbals, lighting rigs, and sound equipment.

Built on **Next.js 16 (App Router)** with a **React 19 + TypeScript 5** architecture, AUREVIA delivers a state-of-the-art experience powered by **Supabase SSR Authentication & Google OAuth**, a **Realtime Referral & Rewards Architecture**, a **Canvas-Based Scroll Engine**, a **Photorealistic 3D Optics Showroom**, a **Pelican Flight-Case Dispatch Terminal**, an **Admin Management Console**, and a production-hardened **Supabase PostgreSQL** backend.

---

## Key Production Features

| Feature | Description |
|---|---|
| 🔐 **Supabase SSR & Google OAuth** | Production-ready Supabase Auth layer with `@supabase/ssr`, Google Sign-In button, OAuth PKCE code exchange, and enforced `role: "customer"` RLS profile creation |
| 🎁 **Realtime Referral System** | Dynamic viral referral code links (`AUREVIA-REF-XXXXX`), live Supabase WebSockets updates on customer dashboard, and full **Admin Referral Control Terminal** (`/referrals`) |
| 🧳 **Pelican Inspection Terminal** | Interactive dispatch & return inspection terminal (`/returns`) with flight-case barcode scanning, serial checklist, sensor cleanliness certification, and PDF manifest generator |
| 🔭 **Interactive 3D Optics Showroom** | Photorealistic Three.js / R3F camera showroom with Exploded View lerp mode, floating 3D Drei callouts, optical ray path, and lighting mood presets |
| 🎬 **Hero Scroll Sequence** | Scroll-mapped 210-frame canvas animation with smooth lerped frame damping, telemetry HUD, and stage navigation controls |
| 🎧 **Support Ticket System** | Threaded customer support desk with real-time websocket replies between customer dashboard and admin console |
| ⚡ **Realtime Cross-App Engine** | Live multi-channel event sync bridging Admin (`:3002`) and Customer Website (`:3000`) for bookings, inventory, and support |
| 📊 **Admin Operations Suite** | Analytics command center, booking pipeline management, KYC verification center, reviews moderation, and refund processing |
| 🛡️ **PostgreSQL Concurrency Protection** | Transactional row-level locking (`FOR UPDATE SKIP LOCKED`) in `reserve_inventory_for_booking` to eliminate double-booking |

---

## Supabase SSR Auth & Production Google OAuth

AUREVIA integrates **Supabase Auth** as its single authoritative authentication system for both email/password credentials and Google OAuth.

```
Customer Website (/login or /register)
  ├─ Click "Continue with Google"
  ├─ Trigger supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })
  ├─ Redirect to Google OAuth → Consent → Supabase Auth Server
  ├─ Redirect to /auth/callback?code=...
  ├─ Exchange OAuth code for HTTP-only cookies via @supabase/ssr server client
  ├─ Upsert profile in `profiles` table with enforced role: "customer"
  └─ Redirect to /dashboard
```

### Features & Security
- **OAuth Callback Handler**: `src/app/auth/callback/route.ts` exchanges OAuth code, updates profile avatar, and guarantees `role: "customer"`.
- **Google OAuth Button**: `src/components/ui/GoogleSignInButton.tsx` with official 4-color Google G SVG and loading spinner.
- **Navbar Profile Avatar**: Displays user Google avatar or initials badge via Next.js `<Image unoptimized />` component (`lh3.googleusercontent.com`).
- **Protected Routes Proxy**: `src/proxy.ts` automatically guards `/dashboard`, `/profile`, `/checkout`, `/kyc`, `/notifications`, `/booking` and redirects unauthenticated users to `/login?redirect=...`.

---

## Realtime Viral Referral & Rewards System

AUREVIA features a production-level **Realtime Referral & Rewards Program** empowering creators to earn rental credits by inviting fellow filmmakers.

```
1. Customer Shares Referral Link:
   https://aurevia.com/booking?ref=AUREVIA-REF-PREM

2. Friend Accepts & Books Gear:
   - Friend gets instant ₹200 discount at checkout
   - Referral record inserted into Supabase `referrals` table (status: 'pending')

3. Realtime Dashboard Update:
   - Referrer's Customer Dashboard receives instant Supabase WebSocket payload
   - Referred Creators Roster and Pending Credits update live on screen!

4. Admin Control Terminal (/referrals):
   - Admin inspects referral analytics (Total Referred, Rewards Issued, Conversion Rate)
   - Admin approves credit → Status changes to 'rewarded' → ₹500 rental credit released
```

### Admin Control Terminal (`admin/src/app/(dashboard)/referrals/page.tsx`)
- **Analytics KPIs**: Total Viral Referrals, Total Rewards Issued, Pending Approvals, Conversion Rate %.
- **Global Config Controls**: Adjust default Referrer Credit (₹500) and Friend Signup Discount (₹200).
- **Realtime Approval Actions**: "Approve & Credit ₹500", "Reject Referral", and CSV manifest exporter.

---

## Pelican Flight-Case Dispatch & Inspection Terminal

Located in the Admin App at [`admin/src/app/(dashboard)/returns/page.tsx`](file:///c:/Users/kalin/OneDrive/Documents/Projects/aurevia-premium-rentals-main/aurevia-premium-rentals-main/admin/src/app/(dashboard)/returns/page.tsx), this terminal streamlines flight-case dispatch and return inspections.

### Features
- **Barcode & Serial Scanner**: Instant lookup for Pelican flight cases (`PEL-R5-108`, `PEL-RED-204`, etc.).
- **Serial Checklist**: Interactive verification of camera body, cine prime lens, batteries, charger, and memory cards.
- **Sensor Cleanliness Certification**: 5-point optical sensor inspection with cleanliness rating.
- **Damage Fee Calculator**: Dynamic fee assessment for scratched elements or missing accessories.
- **PDF Packing Manifest Generator**: Generates and prints official dispatch manifests with signature blocks.

---

## Interactive 3D Camera & Optics Showroom

Built with **React Three Fiber (R3F)**, **Drei**, and **Three.js** at [`src/components/three/CameraShowroom.tsx`](file:///c:/Users/kalin/OneDrive/Documents/Projects/aurevia-premium-rentals-main/aurevia-premium-rentals-main/src/components/three/CameraShowroom.tsx).

### Highlights
- **Exploded View Mode**: Interactive lerp slider exploding camera body, mount flange, sensor block, and lens assembly into 3D space.
- **Floating 3D Callout Labels**: HTML callouts attached directly to 3D mesh nodes inspecting sensor resolution, mount type, and optics.
- **Optical Ray Path**: Visualized light ray trace passing through lens elements onto the full-frame CMOS sensor.
- **Studio Lighting Moods**: Toggleable lighting presets (`gold`, `studio`, `anamorphic`).

---

## Hero Scroll Canvas Animation

Located at [`src/components/hero/HeroScrollSequence.tsx`](file:///c:/Users/kalin/OneDrive/Documents/Projects/aurevia-premium-rentals-main/aurevia-premium-rentals-main/src/components/hero/HeroScrollSequence.tsx).

- **210-Frame Render Loop**: Preloaded canvas sequence rendering camera assembly mapped to scroll depth.
- **Frame Damping**: RAF lerped frame interpolation eliminating scroll stutter.
- **Telemetry HUD**: Displays current frame index, camera angle, and scroll percentage.
- **Stage Navigation**: Clickable dots for instant jumping between story milestones.

---

## Admin Operations & Customer Engagement Suite

The **AUREVIA Admin App** (`http://localhost:3002`) provides complete operational management:

- **Bookings & Calendar**: Live timeline schedule of fleet reservations and availability blocks.
- **Fleet Inventory**: Unit-level tracking (`inventory_units`) by serial number, condition, and status.
- **KYC Center**: Identity verification document review queue (`aadhaar`, `driving_licence`, `pan`).
- **Reviews Moderation**: Admin queue (`/reviews`) approving customer ratings for public homepage display.
- **Support Tickets**: Threaded customer support ticket resolution (`/tickets`) with real-time websocket sync.
- **Payments & Refunds**: Razorpay transaction logs, webhook verification, and refund requests.

---

## Supabase Database & Realtime Architecture

AUREVIA is backed by a 32-table **Supabase PostgreSQL** database schema managed via structured SQL migrations:

```
Database Schema:
  profiles ────────► bookings ────────► booking_items ────────► inventory_units
     │                  │                     │                      │
     ├─ kyc_documents   ├─ payments           └─ product_addons      └─ maintenance_records
     ├─ referrals       ├─ refunds
     ├─ support_tickets └─ returns ──────────► damage_reports
     └─ notifications
```

### Realtime Publications (`supabase_realtime`)
Realtime WebSockets are enabled on key operational tables:
`bookings`, `inventory_units`, `profiles`, `support_tickets`, `ticket_replies`, `notifications`, `payments`, `referrals`.

---

## Technology Stack

- **Framework**: [Next.js 16.2](https://nextjs.org) (App Router)
- **UI Core**: [React 19](https://react.dev) · [TypeScript 5](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) · Lucide Icons
- **Database & Auth**: [Supabase PostgreSQL](https://supabase.com) · `@supabase/ssr` · Supabase Auth
- **3D Graphics**: [Three.js](https://threejs.org) · [React Three Fiber](https://r3f.docs.pmnd.rs) · Drei
- **Animations**: Anime.js · Motion
- **Payments**: Razorpay Node SDK & Webhooks
- **Deployment**: Vercel

---

## Environment Variables

Configure these variables in `.env.local` (and in your Vercel Project Settings):

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uoutovqmmxzawhvpahcg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_1NFW4MM4sCE7qVZVvFUjEQ_bU3VH4TI
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:...@db.uoutovqmmxzawhvpahcg.supabase.co:5432/postgres

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Razorpay Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email / WhatsApp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=sachiii8827@gmail.com
SMTP_APP_PASSWORD=your-app-password
NEXT_PUBLIC_CONCIERGE_WHATSAPP=919686909048
```

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Sachinxcode-01/aurevia-premium-rentals.git
cd aurevia-premium-rentals

# Install root dependencies
npm install

# Install admin dependencies
cd admin
npm install
cd ..
```

---

## Verification & Build Commands

```bash
# Run root development server (http://localhost:3000)
npm run dev

# Run admin development server (http://localhost:3002)
cd admin && npm run dev

# Run TypeScript compilation check across root project
npm run typecheck

# Run TypeScript compilation check across admin project
cd admin && npm run typecheck

# Run Next.js production build
npm run build
```

---

## Security & Concurrency Protection

1. **Row Level Security (RLS)**: Enforced across all Supabase tables (`profiles`, `bookings`, `referrals`, `kyc_documents`, `support_tickets`). Customers can only read and write their own records.
2. **Double-Booking Elimination**: `reserve_inventory_for_booking` PostgreSQL function uses `FOR UPDATE SKIP LOCKED` transaction locking to guarantee physical units cannot be double-booked.
3. **Idempotent Webhooks**: Razorpay payment webhooks verify HMAC SHA256 signatures and check `processed_events` to prevent duplicate processing.
4. **Role Isolation**: OAuth and registration handlers strictly enforce `role: "customer"` to prevent privilege escalation to admin status.

---

## Contact & Credits

- **Owner & Founder**: Prem Mundargi (`+91 96869 09048`)
- **Lead Engineering**: Sachin (`sachiii8827@gmail.com`)
- **Repository**: [Sachinxcode-01/aurevia-premium-rentals](https://github.com/Sachinxcode-01/aurevia-premium-rentals)

---

<div align="center">

**AUREVIA — Frame the Extraordinary.**  
*Built with precision for cinematography professionals.*

</div>
