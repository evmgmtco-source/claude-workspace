#!/usr/bin/env bash
# Resolve/download a Kick VOD end-to-end from the Railway datacenter IP.
#
# Why this indirection: kick.com/api/* is behind Cloudflare bot management and returns
# HTTP 403 to datacenter IPs (Railway/GCP). A Cloudflare Worker proxy returns error 1042
# UNLESS it has compat flag global_fetch_strictly_public + an enabled workers.dev subdomain
# (see kick-proxy/deploy.sh). The actual video host, stream.kick.com (AWS IVS), is NOT
# blocked from datacenter IPs -- so we only proxy the tiny metadata call, then let yt-dlp
# pull the HLS directly. Do NOT feed the kick.com watch URL to yt-dlp directly; its Kick
# extractor calls the blocked API and 403s.
#
# Usage: resolve.sh <video_uuid> [format] [output_template]
set -euo pipefail
UUID="$1"; FMT="${2:-best}"; OUT="${3:-%(id)s.%(ext)s}"
PROXY="${KICK_PROXY:-https://kick-proxy.evmgmtco.workers.dev}"
SRC="$(curl -fsS "$PROXY/api/v1/video/$UUID" | python3 -c "import sys,json;print(json.load(sys.stdin)['source'])")"
echo "source: $SRC"
exec yt-dlp -f "$FMT" -o "$OUT" "$SRC"
