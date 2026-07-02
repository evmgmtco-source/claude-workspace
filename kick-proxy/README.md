# kick-proxy

Metadata proxy that lets the AgentNet workspace resolve Kick VODs from Railway's
datacenter IP.

## The problem (diagnosed 2026-07-02)
1. `kick.com/api/*` sits behind Cloudflare bot management -> HTTP **403** from the
   Railway/GCP datacenter IP. (Verified: curl from Railway -> 403.)
2. The old kick-proxy Worker returned **error 1042**: a Cloudflare Worker cannot fetch a
   Cloudflare-fronted zone (kick.com) because the request short-circuits inside CF's edge.
3. The actual video host **stream.kick.com** is AWS IVS, NOT Cloudflare, and returns
   **200** from Railway. So only the metadata lookup was ever blocked.

## The fix
- Redeploy the Worker with compatibility flag **global_fetch_strictly_public** (forces the
  Worker's fetch onto the public internet, clearing 1042) and **enable its workers.dev
  subdomain**. A Cloudflare Worker's egress is NOT blocked by Kick's bot management, so the
  metadata call succeeds where the datacenter IP fails.
- Pipeline: worker resolves `source` (master.m3u8) -> `yt-dlp` downloads the HLS directly
  from stream.kick.com. See `resolve.sh`.

## Files
- `worker.js`   - the Worker source
- `deploy.sh`   - deploy WITH the flag + subdomain (run from workspace; uses CF env creds)
- `resolve.sh`  - resolve/download a VOD: `resolve.sh <video_uuid> [format] [out]`

## Do NOT
- Redeploy kick-proxy via the workspace /cloudflare/deploy route -- it uses
  Content-Type application/javascript, which drops the compat flag and disables the
  subdomain, bringing back error 1042. Use deploy.sh instead.
- Feed the kick.com watch URL straight to yt-dlp -- its Kick extractor hits the blocked API.
