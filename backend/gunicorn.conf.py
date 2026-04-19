# gunicorn.conf.py — Production configuration for StoreVille Backend
import multiprocessing
import os

# ── Binding ──────────────────────────────────────────────────────────────────
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:8000")

# ── Workers ──────────────────────────────────────────────────────────────────
# Rule of thumb: (2 × CPU cores) + 1
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"          # Use "gevent" or "uvicorn.workers.UvicornWorker" for async
threads = int(os.environ.get("GUNICORN_THREADS", 2))
worker_connections = 1000
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 120))
keepalive = 5

# ── Application ───────────────────────────────────────────────────────────────
wsgi_app = "config.wsgi:application"

# ── Logging ───────────────────────────────────────────────────────────────────
# Send logs directly to stdout/stderr so Docker captures them
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sμs'

# ── Performance ───────────────────────────────────────────────────────────────
max_requests = 1000              # Recycle workers after N requests (prevents memory leaks)
max_requests_jitter = 100        # Random jitter so workers don't all restart at once
preload_app = True               # Load app before forking workers (faster, shares memory)

# ── Process naming ────────────────────────────────────────────────────────────
proc_name = "storeville-backend"
