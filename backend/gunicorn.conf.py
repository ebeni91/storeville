# gunicorn.conf.py — Production configuration for StoreVille Backend
import multiprocessing
import os

# ── Binding ──────────────────────────────────────────────────────────────────
# Render injects PORT=10000. We must bind to it or health checks will fail.
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# ── Workers ──────────────────────────────────────────────────────────────────
# ✅ Render sets WEB_CONCURRENCY=1 on the free tier to prevent OOM crashes.
# We MUST respect it. Fall back to cpu-count formula only on paid/self-hosted.
workers = int(
    os.environ.get("WEB_CONCURRENCY")
    or os.environ.get("GUNICORN_WORKERS")
    or multiprocessing.cpu_count() * 2 + 1
)
# ✅ gevent: non-blocking async I/O
worker_class = "gevent"
threads = int(os.environ.get("GUNICORN_THREADS", 1))  # gevent doesn't need threads
worker_connections = 100  # Reduced from 1000 — free tier has 512MB RAM
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 120))
keepalive = 2

# ── Application ───────────────────────────────────────────────────────────────
wsgi_app = "config.wsgi:application"

# ── Logging ───────────────────────────────────────────────────────────────────
# Send logs directly to stdout/stderr so Docker captures them
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sμs'

# ── Performance ───────────────────────────────────────────────────────────────
max_requests = 500               # Recycle workers after N requests (prevents memory leaks)
max_requests_jitter = 50         # Random jitter so workers don't all restart at once
preload_app = False              # Disabled: free tier doesn't have enough RAM for safe fork

# ── Process naming ────────────────────────────────────────────────────────────
proc_name = "storeville-backend"
