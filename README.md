# StoreVille Platform

StoreVille is a modernized multi-tenant digital marketplace platform connecting retail and food merchants with consumers. It features a Next.js (App Router) frontend, a Django + PostgreSQL backend, and an Expo React Native mobile application. 

## Features
- **Multi-Tenant Architecture:** Separate store configurations (food vs retail), customizable themes, and domain management.
- **Unified Authentication:** Managed via Better Auth, supporting seamless cross-application sessions, OAuth, and JIT (Just-In-Time) role promotion.
- **Robust Payment & Delivery:** Dual-model order system supporting specialized logic for both physical items and on-demand food delivery.
- **Modern Seller Studio:** An interactive dashboard for merchants to manage products, stores, themes, and orders.

## Project Structure
- `frontend/` - Next.js 14 web application (Buyer storefronts & Seller Studio)
- `backend/` - Django Rest Framework API providing core business logic
- `mobile/` - Expo React Native application for buyers and delivery drivers
- `docs/` - Architectural documentation and engineering guidelines
- `docker-compose.yml` - Local development orchestration

## Getting Started (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend/mobile dev if not using Docker)
- Make (optional, but recommended)

### Quick Start
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in any required variables.
3. Start the entire platform using Docker Compose:
```bash
make up
# or
docker compose up -d
```
4. Access the services:
- **Frontend (Web App):** http://localhost:3000
- **Backend (Django API):** http://localhost:8000
- **Postgres Database:** localhost:5432

### Running Migrations
If you make changes to Django models, generate and apply migrations:
```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

The **Better Auth schema** (tables for `user`, `session`, `account`, `verification`) is created **automatically** on every `docker compose up` via the `db-migrate` init service — no manual SQL script required. If you ever need to re-run it manually:
```bash
make ba-migrate
```

## Architecture Documentation
For detailed architecture and workflow information, please refer to the [ARCHITECTURE.md](docs/ARCHITECTURE.md) document.
