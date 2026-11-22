# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Stage 1 — build the React frontend into static files
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY frontend/ ./
# build.mjs writes to ../app/static
RUN mkdir -p ../app && node build.mjs

# ---------------------------------------------------------------------------
# Stage 2 — run the test suite against the built output (docker build --target test .)
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS test
WORKDIR /srv
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY app/ app/
COPY tests/ tests/
COPY --from=frontend /build/app/static app/static
RUN python -m pytest -q

# ---------------------------------------------------------------------------
# Stage 3 — minimal production runtime (Flask + gunicorn, non-root)
# ---------------------------------------------------------------------------
FROM python:3.12-slim AS runtime
LABEL org.opencontainers.image.title="HealthSync Pro (demo)" \
      org.opencontainers.image.description="Static healthcare management dashboard demo — fictional data only" \
      org.opencontainers.image.version="1.0.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

WORKDIR /srv
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --no-create-home app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --chown=app:app gunicorn.conf.py .
COPY --chown=app:app app/__init__.py app/wsgi.py app/__main__.py app/
COPY --from=frontend --chown=app:app /build/app/static app/static

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import os,urllib.request,sys; sys.exit(0 if urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\",\"8000\")}/healthz', timeout=2).status == 200 else 1)"

CMD ["gunicorn", "--config", "gunicorn.conf.py", "app.wsgi:app"]
