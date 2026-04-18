.PHONY: build up down logs migrate makemigrations shell create-super-user

build:
	docker compose build
build-frontend:
	docker compose build frontend
	docker-compose up -d --build frontend
build-backend:
	docker compose build backend
up:
# 	docker compose up -d
	docker-compose up --build 
# 	docker-compose up
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