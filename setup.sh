#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Pulling latest changes..."
cd "$ROOT_DIR"
git pull

echo "==> Installing root dependencies..."
cd "$ROOT_DIR"
pnpm install

echo "==> Installing client dependencies..."
cd "$ROOT_DIR/client"
pnpm install

echo "==> Starting Docker services (PostgreSQL + Redis)..."
cd "$ROOT_DIR"
docker compose up -d

echo "==> Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U reconbanker -d reconbanker > /dev/null 2>&1; do
  sleep 1
done

echo "==> Running database migrations..."
pnpm migrate

echo "==> Starting backend (background)..."
pnpm dev &
BACKEND_PID=$!

echo "==> Starting frontend..."
cd "$ROOT_DIR/client"
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "All services running:"
echo "  Backend  → http://localhost:3000  (pid $BACKEND_PID)"
echo "  Frontend → http://localhost:5173  (pid $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop all services."

cleanup() {
  echo ""
  echo "==> Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM
wait
