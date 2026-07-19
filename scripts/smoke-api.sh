#!/usr/bin/env bash
# Smoke de integração API — Fase 3
# Uso: ./scripts/smoke-api.sh  (requer backend em :3001)

set -euo pipefail
BASE="${API_BASE:-http://localhost:3001/api}"

echo "== health =="
curl -sf "$BASE/health" | grep -q '"status":"ok"'

echo "== login demo =="
LOGIN=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"demo@sorteagora.com","password":"User1234!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['accessToken'])")

echo "== profile 401 without token =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/auth/profile")
test "$CODE" = "401"

echo "== balance =="
curl -sf "$BASE/financial/balance" -H "Authorization: Bearer $TOKEN" | grep -q balance

echo "== casino games (cached) =="
curl -sf "$BASE/casino/games" | grep -q '\[\|Crash\|Fortune\|Roulette\|Blackjack'

echo "== admin login + reports =="
ALOGIN=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@sorteagora.com","password":"Admin123!"}')
AT=$(echo "$ALOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['accessToken'])")
curl -sf "$BASE/admin/reports" -H "Authorization: Bearer $AT" | grep -q revenue

echo "SMOKE OK"
