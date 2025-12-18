# Crypto Trading Platform

## Overview

This is a full-stack crypto trading platform built with React/Vite on the frontend and Express.js with PostgreSQL on the backend. The platform enables users to trade cryptocurrencies, stocks, and forex, manage portfolios, use AI trading bots, and handle deposits/withdrawals. It includes both user-facing features and comprehensive admin management capabilities.

The application is designed as a Telegram Mini App but also functions as a standalone web application with mock Telegram user data for development outside Telegram.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server (port 5000)
- **Wouter** for lightweight client-side routing instead of React Router
- **TailwindCSS v4** with the new `@import "tailwindcss"` syntax for styling
- **shadcn/ui** components (New York style) with Radix UI primitives

**State Management**
- **TanStack Query (React Query)** for server state management and data fetching
- Local storage for persistence of certain user preferences and temporary data
- Session-based authentication state managed through cookies

**UI Component Strategy**
- Mobile-first responsive design optimized for Telegram WebApp
- Custom `MobileLayout` wrapper component with bottom navigation
- Extensive use of shadcn/ui components for consistent UI patterns
- Theme system using CSS variables for easy customization

**Path Aliases**
- `@/` maps to `client/src/`
- `@shared/` maps to `shared/` (for shared types between frontend and backend)
- `@assets/` maps to `attached_assets/`

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript in ESM module format
- Custom logging middleware for API request/response tracking
- Session management using `express-session` with PostgreSQL store

**API Design**
- RESTful API endpoints under `/api` prefix
- Session-based authentication (no JWT tokens)
- Separate admin authentication flow with permission system
- Role-based access control (user vs admin)

**Development vs Production**
- Development: Uses `tsx` for hot reloading (`npm run dev`)
- Production: Compiled with `esbuild` to `dist/` directory
- Vite dev server runs separately on port 5000 in development

### Database Architecture

**ORM & Migrations**
- **Drizzle ORM** for type-safe database operations
- PostgreSQL as the primary database (using Neon serverless driver)
- Schema defined in `shared/schema.ts` for sharing types between frontend and backend
- Database migrations stored in `./migrations/` directory

**Database Schema Design**

The schema includes comprehensive tables for a trading platform:

1. **Core User Tables**
   - `users`: User profiles with Telegram integration, verification status
   - `admins`: Administrative users with permission-based access control
   - `user_balances`: Total balance tracking per user
   - `user_emails`: Multiple email addresses for security/2FA purposes
   - `kyc_verifications`: KYC document storage and verification status

2. **Asset Tables**
   - `crypto_assets`: Cryptocurrency data (API-sourced or manually added)
   - `forex_assets`: Forex pair data (API-sourced or manually added)
   - `stock_assets`: Stock market data (API-sourced or manually added)

3. **Trading & Portfolio Tables**
   - `portfolios`: User asset holdings and positions
   - `transactions`: All financial transactions (deposits, withdrawals, trades, swaps)
   - `swaps`: Asset swap history between different currencies
   - `deposits`: Deposit requests with status tracking (pending/approved/rejected)
   - `withdrawals`: Withdrawal requests with gatewayId, cryptoAddressId, charges, amountAfterCharges
   - `crypto_addresses`: User's saved cryptocurrency addresses linked to withdrawal gateways

4. **Payment Gateway Tables**
   - `payment_gateways`: Admin-configured deposit methods (crypto addresses, QR codes, fees)
   - `withdrawal_gateways`: Admin-configured withdrawal methods (name, min/max amounts, fees, network type)

5. **Investment & Bot Tables**
   - `investment_plans`: Available investment plans with ROI and risk levels
   - `user_investments`: User's active/completed investments
   - `ai_bots`: AI trading bot configurations
   - `user_bots`: User subscriptions to AI bots with P&L tracking

6. **Wallet & Security Tables**
   - `connected_wallets`: External wallet connections (WalletConnect, MetaMask, etc.)
   - Session storage via `connect-pg-simple` for Express sessions

7. **Support & Settings Tables**
   - `support_tickets`: User-admin communication with priority/status
   - `system_settings`: Platform-wide configuration and feature toggles

**Enums for Data Integrity**
- Transaction statuses: pending, approved, completed, failed, rejected
- Investment statuses: active, completed, cancelled
- Risk levels: low, medium, high
- Ticket statuses and priorities

### Authentication & Authorization

**User Authentication**
- Primary authentication through Telegram WebApp initialization
- Fallback to traditional username/password for non-Telegram access
- Session cookies with 30-day expiration
- Password hashing using bcryptjs (10 salt rounds)

**Admin Authentication**
- Separate admin login endpoint (`/api/admin/login`)
- Permission-based access control system
- Admin middleware protection on sensitive routes
- Logout functionality clears session state

**Security Measures**
- HTTP-only cookies for session management
- Secure cookies in production environment
- Session secrets from environment variables
- CSRF protection through session validation

### External Dependencies

**Third-Party APIs**
- **CoinGecko API**: Real-time cryptocurrency market data (prices, charts, market cap)
  - Configurable API endpoints stored in localStorage
  - Default API key: `CG-7Rc5Jh3xjgp1MT5J9vG5BsSk` (demo key)
  - Supports custom API keys via environment variable `VITE_COINGECKO_API_KEY`
- **Forex & Stock APIs**: Integration points exist but specific providers not yet configured

**Database Provider**
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL with serverless drivers
  - Connection string required via `DATABASE_URL` environment variable
  - Configured in `drizzle.config.ts` for migrations

**Wallet Integrations**
- Support for multiple wallet providers (WalletConnect, MetaMask, Trust Wallet, etc.)
- Wallet phrase import functionality for connected wallets
- External wallet connection tracking in database

**Telegram Integration**
- **Telegram WebApp SDK**: `telegram-web-app.js` for Telegram Mini App features
  - Mock implementation for browser development (`telegram-mock.ts`)
  - User data extraction from Telegram context

**UI & Component Libraries**
- **Radix UI**: Headless component primitives for complex UI patterns
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Charting library for trading charts and data visualization
- **TailwindCSS Animate**: Animation utilities integrated via `tw-animate-css`

**Development Tools**
- **Replit Plugins**: Development banner, cartographer, runtime error overlay
- TypeScript for static type checking across the stack
- ESBuild for fast production builds

**Session Store**
- **connect-pg-simple**: PostgreSQL-backed session store for Express
  - Automatic session table creation
  - Integration with existing database connection pool

### Admin Panel Features

**Theme System**
- Admin panel has its own light/dark theme toggle (separate from main app)
- Theme preference stored in localStorage as `admin-theme`
- Implementation files:
  - `client/src/lib/admin-theme.tsx` - AdminThemeProvider context and useAdminTheme hook
  - `client/src/components/layout/admin-layout.tsx` - Theme-aware layout with toggle button
  - `client/src/index.css` - CSS overrides for admin dark mode (using `[data-admin-theme="dark"]` selector)
- Note: CSS nesting with `&` is not supported in this project's PostCSS setup - use explicit descendant selectors