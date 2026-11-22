"""Local development server: ``python -m app`` (use gunicorn in production)."""

import os

from app import create_app

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    print(f"HealthSync Pro (demo) → http://{host}:{port}")
    create_app().run(host=host, port=port, debug=False)
