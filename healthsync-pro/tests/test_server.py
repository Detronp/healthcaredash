"""Tests for the Flask static server."""

from pathlib import Path

import pytest

from app import create_app

STATIC = Path(__file__).resolve().parents[1] / "app" / "static"


@pytest.fixture()
def client():
    if not (STATIC / "index.html").exists():
        pytest.skip("frontend not built; run `make build`")
    app = create_app()
    app.testing = True
    return app.test_client()


def first_asset(ext: str) -> str:
    return next(p.name for p in (STATIC / "assets").glob(f"main-*.{ext}"))


def test_index_serves_app_shell(client):
    r = client.get("/")
    assert r.status_code == 200
    assert b'<div id="root">' in r.data
    assert r.headers["Cache-Control"] == "no-cache"


@pytest.mark.parametrize("route", ["/dashboard", "/patients", "/security/logs"])
def test_spa_fallback_returns_index(client, route):
    r = client.get(route)
    assert r.status_code == 200
    assert b'<div id="root">' in r.data


def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_version_reports_demo_mode(client):
    body = client.get("/version").get_json()
    assert body["mode"] == "static-demo"
    assert body["data"] == "fictional"


def test_hashed_assets_are_immutable(client):
    r = client.get(f"/assets/{first_asset('js')}")
    assert r.status_code == 200
    assert "immutable" in r.headers["Cache-Control"]
    assert "javascript" in r.headers["Content-Type"]


def test_index_references_existing_assets(client):
    html = client.get("/").data.decode()
    for ext in ("js", "css"):
        assert f"/assets/{first_asset(ext)}" in html


def test_security_headers_present(client):
    r = client.get("/")
    csp = r.headers["Content-Security-Policy"]
    assert "default-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp
    assert "'unsafe-inline'" not in csp
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert "Strict-Transport-Security" not in r.headers  # off unless ENABLE_HSTS


def test_hsts_opt_in(monkeypatch):
    monkeypatch.setenv("ENABLE_HSTS", "true")
    app = create_app()
    r = app.test_client().get("/healthz")
    assert "max-age" in r.headers["Strict-Transport-Security"]


def test_missing_asset_is_404_not_index(client):
    assert client.get("/assets/nope.js").status_code == 404
    assert client.get("/missing.png").status_code == 404


@pytest.mark.parametrize("path", ["/assets/../__init__.py", "/assets/%2e%2e/__init__.py", "/../app/__init__.py"])
def test_path_traversal_blocked(client, path):
    r = client.get(path)
    assert b"create_app" not in r.data


def test_unbuilt_frontend_returns_503(tmp_path):
    app = create_app(static_dir=tmp_path)
    assert app.test_client().get("/").status_code == 503
