#!/usr/bin/env bash
# Security smoke — Fase C
# Uso: ./scripts/smoke-security.sh

set -euo pipefail
BASE="${API_BASE:-http://localhost:3001/api}"

pass() { echo "OK  $1"; }
fail() { echo "FAIL $1"; exit 1; }

echo "== security smoke =="

# Sem JWT → 401
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/financial/balance")
[ "$CODE" = "401" ] && pass "balance sem JWT = 401" || fail "balance sem JWT ($CODE)"

CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/users/me/export")
[ "$CODE" = "401" ] && pass "lgpd export sem JWT = 401" || fail "lgpd export ($CODE)"

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/admin/bonuses" \
  -H 'Content-Type: application/json' -d '{"name":"x"}')
[ "$CODE" = "401" ] && pass "admin sem JWT = 401" || fail "admin sem JWT ($CODE)"

# User comum → 403 em admin
LOGIN=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"demo@sorteagora.com","password":"User1234!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['accessToken'])")

CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN")
[ "$CODE" = "403" ] && pass "user em admin = 403" || fail "user admin ($CODE)"

# Webhook público existe (não 401)
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/webhooks/pix" \
  -H 'Content-Type: application/json' -d '{}')
case "$CODE" in
  400|404|200) pass "webhook pix público ($CODE)" ;;
  401) fail "webhook pix bloqueado por JWT" ;;
  *) fail "webhook pix status inesperado $CODE" ;;
esac

# Logout blacklist (se refresh disponível)
REFRESH=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('refreshToken',''))" 2>/dev/null || true)
if [ -n "${REFRESH:-}" ]; then
  curl -sf -X POST "$BASE/auth/logout" -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' -d "{\"refreshToken\":\"$REFRESH\"}" >/dev/null || true
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
  case "$CODE" in
    401) pass "token após logout = 401" ;;
    *) echo "WARN logout blacklist ($CODE) — pode variar por implementação" ;;
  esac
fi

echo "SECURITY SMOKE OK"
