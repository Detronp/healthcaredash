# HealthSync Pro

**Smarter Healthcare. Connected Care. Secure Operations.**

A demonstration healthcare management dashboard. It's a React single-page app, built into static files and served by a small Python (Flask + gunicorn) server, packaged for Docker.

> ⚠️ **Demonstration only.** Every patient, staff member, IP address and event is fictional. The app has no backend database, no EHR integration, and no real authentication, encryption, access control or audit logging. It is **not** HIPAA compliant and must not be used with real protected health information.

## Features

| Section | What's there |
|---|---|
| **Dashboard** | 6 KPI cards, admissions/discharge trend (7/14-day toggle), department donut, stacked discharge chart, bed occupancy by unit, filterable clinical alerts, activity feed, unit status board |
| **Patient Management** | Searchable, sortable, paginated directory (16 records). Filters for status, department and gender. Expandable rows, a full profile drawer (demographics, history, allergies, meds, diagnosis, plan, vitals with trend charts, clinical notes) and CSV export |
| **Clinical Monitoring** | Simulated live vitals feed (pause/resume), bedside tiles colour-coded normal/elevated/critical, HR/RR/SpO₂ trend charts with reference bands, acuity-sorted monitoring table with sparklines |
| **Respiratory Therapy** | Ventilator census table (mode, VT and mL/kg PBW, rate, PEEP, FiO₂, PIP, Pplat), lung-protective flags, ABG panel with interpretation, P/F ratios, FiO₂/PEEP and pressure/SpO₂ trends, oxygen-therapy table, RT task queue |
| **Staff Directory** | 21 staff across Physicians, RNs, RTs and Clinical Administrators. Role cards double as filters, plus shift and availability filters |
| **Reports & Analytics** | LOS, readmissions, ED wait times, payer mix, discharge disposition, scheduled-report library, KPI CSV export |
| **Security & Compliance** | Disclaimer banner, security status panel, idle-timeout countdown (live), login activity chart, security alerts, filterable access-log table, RBAC matrix, active sessions |
| **Settings** | Session timeout (feeds the Security page), MRN masking, compact tables, reduce motion, notification toggles |

The top bar has a global patient search, a notification dropdown and a user profile dropdown with a demo sign-out. Every page has loading skeletons, empty states and a responsive layout for desktop, tablet and mobile.

## Quick start

### Docker (recommended)

```bash
docker compose up -d --build      # → http://localhost:8080
docker compose logs -f
docker compose down
```

To change the host port, set `HOST_PORT=9000 docker compose up -d`. To run the test suite inside Docker, use `make docker-test`.

### Local (Python 3.10+ and Node 18+)

```bash
make install        # pip install -r requirements-dev.txt && npm install
make run            # builds the frontend, serves http://127.0.0.1:8000
make test           # pytest
```

The repo ships with a prebuilt `app/static/`, so `pip install flask && python -m app` works without Node.

## Project structure

```
healthsync-pro/
├── app/                      # Python server package
│   ├── __init__.py           # Flask app factory, SPA routing, security headers
│   ├── wsgi.py               # gunicorn entry point (app.wsgi:app)
│   ├── __main__.py           # `python -m app` dev server
│   └── static/               # build output (generated)
├── frontend/
│   ├── build.mjs             # esbuild bundler → app/static (content-hashed)
│   ├── public/               # index.html, favicon
│   └── src/
│       ├── App.jsx           # shell, hash router, lazy-loaded pages
│       ├── components/       # Layout, DataTable, PatientDrawer, ui primitives
│       │   └── charts/       # Line, Bar, Donut, HBar, Sparkline, Ring (SVG)
│       ├── pages/            # one file per navigation section
│       ├── data/             # fictional sample data
│       ├── lib/vitals.js     # demo reference ranges & helpers
│       └── styles/main.css   # design system (CSS variables)
├── tests/test_server.py      # pytest suite for the server
├── Dockerfile                # multi-stage: node build → pytest → slim runtime
├── docker-compose.yml        # hardened runtime (read-only, cap_drop ALL)
├── gunicorn.conf.py
└── Makefile
```

## Server behaviour

* `/` and any extension-less path return `index.html`, so client-side routes survive a refresh. Missing files (`/x.png`) return a real 404.
* `/assets/*` files are content-hashed and served with `Cache-Control: immutable` for one year. `index.html` is sent with `no-cache`.
* `/healthz` provides the health check used by Docker. `/version` reports the build info.
* Security headers: a strict CSP (`'self'` only, no `unsafe-inline`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` and COOP/CORP. HSTS is opt-in with `ENABLE_HSTS=true`; enable it only behind HTTPS.
* The container runs as a non-root user (uid 10001) on a read-only filesystem with all capabilities dropped.

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `8000` | Listen port inside the container |
| `WEB_CONCURRENCY` | `2` (compose) | gunicorn workers |
| `ENABLE_HSTS` | `false` | Send Strict-Transport-Security |
| `LOG_LEVEL` | `info` | gunicorn log level |
| `HOST_PORT` | `8080` | Published port (compose) |

TLS is out of scope for the app. Put it behind a reverse proxy such as Caddy, nginx or Traefik, or behind a cloud load balancer.

## Tech notes

* **React 19**, **Lucide icons** (via `react-icons/lu`) and **esbuild**. There's no Vite or webpack, and the build takes about 0.1 s.
* The charts are small, dependency-free SVG components with hover tooltips, written in-house rather than with Recharts or Chart.js. This keeps the bundle small (≈355 KB uncompressed in total) and means everything is self-hosted under the strict CSP.
* Vital-sign thresholds in `src/lib/vitals.js` are simplified adult ranges for UI illustration. They are not clinical decision support.
