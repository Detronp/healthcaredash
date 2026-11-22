.PHONY: help install build watch run test docker-build docker-test up down logs clean

PY ?= python3

help:            ## Show available commands
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install:         ## Install Python and Node dependencies
	$(PY) -m pip install -r requirements-dev.txt
	cd frontend && npm install

build:           ## Bundle the React frontend into app/static
	cd frontend && node build.mjs

watch:           ## Rebuild the frontend on change (unminified)
	cd frontend && node build.mjs --watch

run: build       ## Build and serve locally at http://127.0.0.1:8000
	$(PY) -m app

test: build      ## Run the Python test suite
	$(PY) -m pytest -q

docker-build:    ## Build the production image
	docker compose build

docker-test:     ## Build the test stage (runs pytest inside Docker)
	docker build --target test -t healthsync-pro:test .

up:              ## Start the container at http://localhost:8080
	docker compose up -d --build

down:            ## Stop the container
	docker compose down

logs:            ## Follow container logs
	docker compose logs -f

clean:           ## Remove build output and caches
	rm -rf app/static .pytest_cache **/__pycache__
