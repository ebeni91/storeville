.PHONY: build up down logs migrate makemigrations shell create-super-user

build:
	docker compose build

up:
# 	docker compose up -d
	docker-compose up --build 

down:
	docker compose down
	
restart:
	docker compose restart

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