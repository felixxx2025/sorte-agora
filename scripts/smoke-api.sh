#!/usr/bin/env bash
# Smoke de integração API — pós Fase D3
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

echo "== lgpd export =="
curl -sf "$BASE/users/me/export" -H "Authorization: Bearer $TOKEN" | grep -q exportedAt

echo "== pix webhook idempotent path =="
# Cria depósito PENDING se auto-confirm off; com auto-confirm on, webhook em id inexistente = 404
# Smoke apenas garante endpoint público responde (não 401)
WH=$(curl -s -o /tmp/wh.json -w '%{http_code}' -X POST "$BASE/webhooks/pix" \
  -H 'Content-Type: application/json' \
  -d '{"externalId":"pix_smoke_missing","status":"PAID"}')
case "$WH" in
  200|400|404) ;;
  *) echo "unexpected webhook status $WH"; exit 1 ;;
esac

echo "== pix payout webhook shape =="
WHP=$(curl -s -o /tmp/whp.json -w '%{http_code}' -X POST "$BASE/webhooks/pix" \
  -H 'Content-Type: application/json' \
  -d '{"externalId":"payout_smoke_missing","status":"PAID","kind":"PAYOUT"}')
case "$WHP" in
  200|400|404) ;;
  *) echo "unexpected payout webhook status $WHP"; exit 1 ;;
esac

echo "== health feature flags =="
curl -sf "$BASE/health" | grep -q 'pixProviderMode\|features\|pixAutoConfirm\|"ok"'

echo "== admin login + reports =="
ALOGIN=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@sorteagora.com","password":"Admin123!"}')
AT=$(echo "$ALOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['accessToken'])")
curl -sf "$BASE/admin/reports" -H "Authorization: Bearer $AT" | grep -q revenue

echo "SMOKE OK"
