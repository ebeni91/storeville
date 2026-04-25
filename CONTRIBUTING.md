# StoreVille — Contributing & Development Workflow

## Branch Strategy

| Branch |          Purpose 
|--------|------------------------|
| `main` | Production-ready code 
| `dev`  | Active development & local testing

> **Rule:** Never commit directly to `main`. Always work on `dev` (or a feature branch), test locally, then merge to `main` when ready.

---

## Local Development Setup

### Prerequisites
- Docker + Docker Compose
- Node.js 22+
- Python 3.11+
- A `.env` file at the repo root (see `.env.example`)

### Start the full local stack
```bash
make up
```

This starts:
- **Frontend** → `http://localhost:3000`
- **Backend (Django)** → `http://localhost:8000`
- **Django Admin** → `http://localhost:8000/admin/`
- **PostgreSQL** → `localhost:5432`
- **Redis** → `localhost:6379`

### Stop the stack
```bash
make down
```

### Reset the database
```bash
make reset
```

---

## Daily Workflow

```bash
# 1. Always start on dev
git checkout dev

# 2. Pull the latest changes
git pull origin dev

# 3. Start your local environment
make up

# 4. Make your changes and test them locally

# 5. Commit your work
git add .
git commit -m "feat: describe your change"
git push origin dev

# 6. When the feature is ready and tested, merge to main to deploy
git checkout main
git merge dev
git push origin main   # ← triggers Vercel + Render deployment

# 7. Go back to dev
git checkout dev
```

---

## Feature Branch Workflow (for bigger features)

For large features, create a dedicated branch off `dev`:

```bash
git checkout dev
git checkout -b feature/chapa-payment
# ... develop and test ...
git push origin feature/chapa-payment
# When done: merge into dev, then eventually dev → main
git checkout dev
git merge feature/chapa-payment
```

### Branch naming conventions
| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feature/short-name` | `feature/cart-service` |
| Bug fix | `fix/short-name` | `fix/map-loading` |
| Infrastructure | `infra/short-name` | `infra/celery-worker` |

---

## Pre-Merge Checklist (before `dev` → `main`)

Before merging into `main` and triggering a production deployment:

- [ ] `make up` runs without errors locally
- [ ] The feature works end-to-end on `http://localhost:3000`
- [ ] No hardcoded `localhost` URLs in any file that ships to production
- [ ] No secrets or API keys committed to the repo
- [ ] Django migrations are included if models changed (`python manage.py makemigrations`)

---

## Environment Variables Reference

| Variable | Local (`dev`) | Production (`main`) |
|----------|--------------|---------------------|
| `DATABASE_URL` | `postgresql://storeville_user:...@postgres:5432/storeville_db` | Render Postgres URL |
| `BETTER_AUTH_URL` | `http://frontend:3000` | `https://storeville.app` |
| `DJANGO_INTERNAL_URL` | `http://backend:8000` | `https://api.storeville.app` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://storeville.app` |
| `NODE_ENV` | `development` | `production` |

> Local values live in `.env` (gitignored).
> Production values live in Vercel & Render environment variable dashboards.
