.PHONY: build up down logs migrate makemigrations shell create-super-user \
        prod-up prod-down prod-logs prod-build prod-migrate

# ── Development ───────────────────────────────────────────────────────────────
build:
	docker compose build
build-frontend:
	docker compose build frontend
	docker-compose up -d --build frontend
build-backend:
	docker compose build backend

up:
	docker-compose up --build

up-frontend:
	docker compose up -d frontend
up-backend:
	docker compose up -d backend

down:
	docker compose down

restart:
	docker compose restart

restart-backend:
	docker compose restart backend

restart-frontend:
	docker compose restart frontend

logs:
	docker compose logs -f backend

makemigrations:
	docker compose exec backend python manage.py makemigrations

migrate:
	docker compose exec backend python manage.py migrate

shell:
	docker compose exec backend python manage.py shell

create-super-user:
	docker compose exec backend python manage.py createsuperuser

# ── Production / Staging ──────────────────────────────────────────────────────
PROD_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.prod.yml

prod-build:
	$(PROD_COMPOSE) build

prod-up:
	$(PROD_COMPOSE) up -d

prod-up-backend:
	$(PROD_COMPOSE) up -d backend nginx

prod-down:
	$(PROD_COMPOSE) down

prod-restart:
	$(PROD_COMPOSE) restart

prod-logs:
	$(PROD_COMPOSE) logs -f backend

prod-logs-nginx:
	$(PROD_COMPOSE) logs -f nginx

prod-migrate:
	$(PROD_COMPOSE) exec backend python manage.py migrate --noinput

prod-collectstatic:
	$(PROD_COMPOSE) exec backend python manage.py collectstatic --noinput

prod-shell:
	$(PROD_COMPOSE) exec backend python manage.py shell

prod-create-super-user:
	$(PROD_COMPOSE) exec backend python manage.py createsuperuser