# StoreVille Architecture

## High-Level Overview
StoreVille is a fully decoupled, multi-tenant digital marketplace. The architecture connects buyers, sellers, and drivers through three distinct clients interacting with a centralized Django API and PostgreSQL database.

```mermaid
graph TD
    Client_NextJS[Next.js Frontend\n(Buyer & Seller)] --> API_Gateway
    Client_Mobile[Expo Mobile App\n(Buyer & Driver)] --> API_Gateway
    
    API_Gateway --> BetterAuth[Better Auth Service\n(Authentication)]
    API_Gateway --> Django_Backend[Django Rest Framework API\n(Business Logic)]
    
    BetterAuth --> Postgres[(PostgreSQL DB)]
    Django_Backend --> Postgres
```

## Core Components

### 1. Frontend (Next.js 14 App Router)
- **Role:** Handles consumer-facing store pages and the secure Seller Studio dashboard.
- **State Management:** Zustand is used for client-side state (`useCartStore`, `useAuthStore`, `useFavoriteStore`).
- **Security & Authorization:** 
  - Next.js Middleware acts as a gatekeeper, leveraging a short-lived `x-user-role` cookie to enforce RBAC without unnecessary backend queries.
  - Better Auth provides seamless sessions and cross-tab synchronization.

### 2. Backend (Django REST Framework)
- **Role:** Core business logic, payments, deliveries, and catalog management.
- **Domain Modeling:** 
  - Order logic is decoupled into `RetailOrder` and `FoodOrder` domains to allow custom validation flows.
  - User model extensions are managed via dedicated profiles (e.g., `DriverProfile`, `CustomerAddress`).
- **Authorization:** Handled by a centralized `IsStoreOwnerOrReadOnly` permission class and `RoleSyncService` which seamlessly bridges Django User roles with Better Auth's database records.

### 3. Authentication (Better Auth)
- **Role:** Specialized lightweight Node/Express/Next middleware handling OAuth, OTP, and session management.
- **Integration:** Writes directly to the shared Postgres database. Django validates incoming requests by reading the `better-auth.session_token` cookie and verifying it against the Postgres session tables.

### 4. Database (PostgreSQL)
- **Role:** Shared persistent storage.
- **Key Tables:** 
  - Better Auth tables (`user`, `session`, `account`).
  - Django tables (Stores, Products, Orders, Profiles).

## Key Workflows

### 1. Role Promotion (JIT)
When a `CUSTOMER` registers a store, their account needs to be instantly upgraded to a `SELLER`:
1. The user creates a store via the frontend.
2. Django processes the request, creates the store, and uses `RoleSyncService` to update the user's role in the Better Auth `user` table.
3. The frontend immediately updates its `x-user-role` cache cookie and hard-navigates to `/dashboard/seller`.

### 2. Cross-App Order Management
- Both Retail and Food systems implement their own order models to avoid circular dependencies and enforce domain-specific business logic.
- Delivery services map incoming polymorphic orders (`RetailOrder` or `FoodOrder`) to a unified `Delivery` tracking object linked to a `DriverProfile`.
