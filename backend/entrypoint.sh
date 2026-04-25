#!/bin/sh
# entrypoint.sh — Docker entrypoint for StoreVille Backend
# Runs database migrations then starts the server (dev or prod mode)
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Bootstrapping Better Auth tables (idempotent)..."
python manage.py shell -c "
import os
import psycopg2
conn = psycopg2.connect(os.environ['DATABASE_URL'])
conn.autocommit = True
cur = conn.cursor()
cur.execute('''
CREATE TABLE IF NOT EXISTS \"user\" (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    \"emailVerified\" BOOLEAN NOT NULL,
    image TEXT,
    \"createdAt\" TIMESTAMP NOT NULL,
    \"updatedAt\" TIMESTAMP NOT NULL,
    role TEXT DEFAULT 'CUSTOMER',
    phone_number TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    \"expiresAt\" TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    \"createdAt\" TIMESTAMP NOT NULL,
    \"updatedAt\" TIMESTAMP NOT NULL,
    \"ipAddress\" TEXT,
    \"userAgent\" TEXT,
    \"userId\" TEXT NOT NULL REFERENCES \"user\"(id) ON DELETE CASCADE
);
-- ✅ PERFORMANCE FIX: Index on expiresAt — used in WHERE expiresAt > NOW() on
-- every single API request. Without this, Postgres scans all rows as the table grows.
CREATE INDEX IF NOT EXISTS session_expires_at_idx ON session (\"expiresAt\");
-- Index on userId for JOIN performance in session validation query.
CREATE INDEX IF NOT EXISTS session_user_id_idx ON session (\"userId\");
CREATE TABLE IF NOT EXISTS account (
    id TEXT NOT NULL PRIMARY KEY,
    \"accountId\" TEXT NOT NULL,
    \"providerId\" TEXT NOT NULL,
    \"userId\" TEXT NOT NULL REFERENCES \"user\"(id) ON DELETE CASCADE,
    \"accessToken\" TEXT,
    \"refreshToken\" TEXT,
    \"idToken\" TEXT,
    \"accessTokenExpiresAt\" TIMESTAMP,
    \"refreshTokenExpiresAt\" TIMESTAMP,
    scope TEXT,
    password TEXT,
    \"createdAt\" TIMESTAMP NOT NULL,
    \"updatedAt\" TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS verification (
    id TEXT NOT NULL PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    \"expiresAt\" TIMESTAMP NOT NULL,
    \"createdAt\" TIMESTAMP,
    \"updatedAt\" TIMESTAMP
);
''')
cur.close()
conn.close()
print('Better Auth tables ready.')
" 2>/dev/null || echo "Better Auth bootstrap skipped (psycopg2 or DATABASE_URL issue)"

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "Starting server..."
exec "$@"
