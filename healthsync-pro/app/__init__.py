"""HealthSync Pro — Flask server for the static healthcare dashboard demo.

The frontend is a pre-built React single-page app in ``app/static``. This
package only serves those files with sensible caching and security headers;
it has no database, no patient data API and no authentication backend.
"""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, abort, jsonify, send_from_directory

__version__ = "1.0.0"

STATIC_DIR = Path(__file__).resolve().parent / "static"

# Strict CSP: everything is self-hosted; no inline scripts or styles in HTML.
# React sets styles through the CSSOM, which style-src does not restrict.
CSP = "; ".join(
    [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ]
)

SECURITY_HEADERS = {
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
}


def _truthy(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


def create_app(static_dir: Path | str | None = None) -> Flask:
    """Application factory."""
    root = Path(static_dir) if static_dir else STATIC_DIR
    app = Flask(__name__, static_folder=None)
    app.config.update(
        STATIC_ROOT=root,
        # Only send HSTS when the deployment actually terminates TLS.
        ENABLE_HSTS=_truthy(os.environ.get("ENABLE_HSTS")),
        JSON_SORT_KEYS=False,
    )

    def index_response():
        if not (root / "index.html").is_file():
            abort(503, description="Frontend not built. Run `make build` first.")
        resp = send_from_directory(root, "index.html", max_age=0)
        resp.headers["Cache-Control"] = "no-cache"
        return resp

    @app.get("/healthz")
    def healthz():
        return jsonify(status="ok", service="healthsync-pro", version=__version__)

    @app.get("/version")
    def version():
        return jsonify(
            name="HealthSync Pro",
            version=__version__,
            mode="static-demo",
            data="fictional",
        )

    @app.get("/assets/<path:filename>")
    def assets(filename: str):
        # send_from_directory rejects path traversal (../) with a 404.
        resp = send_from_directory(root / "assets", filename, max_age=31536000)
        # File names are content-hashed by the build, so they never change.
        resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return resp

    @app.get("/")
    def index():
        return index_response()

    @app.get("/<path:path>")
    def spa(path: str):
        candidate = (root / path).resolve()
        if candidate.is_file() and root.resolve() in candidate.parents:
            return send_from_directory(root, path, max_age=3600)
        # Anything that looks like a missing file is a real 404, not the app shell.
        if "." in path.rsplit("/", 1)[-1]:
            abort(404)
        return index_response()

    @app.after_request
    def add_headers(resp):
        for key, value in SECURITY_HEADERS.items():
            resp.headers.setdefault(key, value)
        if app.config["ENABLE_HSTS"]:
            resp.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
        resp.headers.pop("Server", None)
        return resp

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify(error="not_found"), 404

    return app
