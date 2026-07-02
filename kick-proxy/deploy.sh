#!/usr/bin/env bash
# Deploy kick-proxy WITH the required compat flag + workers.dev subdomain.
# Do NOT redeploy via the workspace /cloudflare/deploy route (Content-Type: application/javascript):
# that path drops the flag and disables the subdomain, reintroducing Cloudflare error 1042.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cat > /tmp/kp_meta.json <<'JSON'
{"main_module":"worker.js","compatibility_date":"2025-09-01","compatibility_flags":["global_fetch_strictly_public"]}
JSON
curl -fsS -X PUT "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/kick-proxy" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -F "metadata=@/tmp/kp_meta.json;type=application/json" \
  -F "worker.js=@$DIR/worker.js;type=application/javascript+module"
echo
curl -fsS -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/kick-proxy/subdomain" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
  --data '{"enabled":true,"previews_enabled":false}'
echo
echo "Deployed. Wait ~30s for subdomain propagation before first request."
