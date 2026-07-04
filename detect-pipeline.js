// detect-pipeline.js
// Detection v1: chat-velocity highlight detection for Kick VODs.
// Signal: messages-per-window spiking above a rolling baseline, weighted by emote bursts.
//
// Env:
//   KICK_PROXY_BASE   Cloudflare proxy for kick.com API (default https://kick-proxy.evmgmtco.workers.dev)
//   DETECT_MAX_PAGES  max chat pages to fetch            (default 300)
//   DETECT_WINDOW_S   scoring bucket size in seconds     (default 10)
//
// Usage:
//   const { detectHighlights } = require('./detect-pipeline');
//   const out = await detectHighlights({ url, top: 5 });
//   // → { ok, video: {uuid, durationSec}, messages, highlights: [{t, ts, score, msgRate, emoteRate, suggestStart, suggestDuration}] }

const PROXY = process.env.KICK_PROXY_BASE || 'https://kick-proxy.evmgmtco.workers.dev';
const MAX_PAGES = Number(process.env.DETECT_MAX_PAGES) || 300;
const WINDOW_S = Number(process.env.DETECT_WINDOW_S) || 10;

async function j(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(`Non-JSON from ${url.split('?')[0]} (status ${r.status})`); }
  if (!r.ok) throw new Error(`Upstream ${r.status} from ${url.split('?')[0]}`);
  return body;
}

function extractUuid(url) {
  const m = String(url).match(/kick\.com\/(?:video|videos)\/([0-9a-f-]{16,})/i);
  if (!m) throw new Error('Expected a Kick VOD URL like https://kick.com/video/<uuid>');
  return m[1];
}

async function fetchVideoMeta(uuid) {
  const v = await j(`${PROXY}/api/v1/video/${uuid}`);
  const ls = v.livestream || v.video?.livestream || {};
  const channelId = ls.channel_id || ls.channel?.id || v.channel_id || v.channel?.id;
  const startTime = ls.start_time || ls.created_at || v.created_at;
  const durationSec = ls.duration ? Math.round(ls.duration / 1000) : (v.duration ? Math.round(v.duration / 1000) : null);
  if (!channelId || !startTime) throw new Error('Could not resolve channel/start time from video metadata');
  return { uuid, channelId, startTime: new Date(startTime), durationSec };
}

async function fetchChatTimeline({ channelId, startTime, durationSec }) {
  const times = []; // seconds-from-start, per message
  const emotes = [];
  let cursor = new Date(startTime);
  const endMs = durationSec ? startTime.getTime() + durationSec * 1000 : startTime.getTime() + 6 * 3600 * 1000;
  let pages = 0, stuck = 0;
  while (pages < MAX_PAGES && cursor.getTime() < endMs && stuck < 3) {
    pages++;
    const iso = cursor.toISOString().replace(/\.\d{3}Z$/, '.000Z');
    let body;
    try {
      body = await j(`${PROXY}/api/v2/channels/${channelId}/messages?start_time=${encodeURIComponent(iso)}`);
    } catch (e) { stuck++; continue; }
    const msgs = body?.data?.messages || body?.messages || [];
    if (!msgs.length) { cursor = new Date(cursor.getTime() + 30000); stuck++; continue; }
    stuck = 0;
    let maxTs = cursor.getTime();
    for (const m of msgs) {
      const ts = new Date(m.created_at || m.createdAt || 0).getTime();
      if (!ts) continue;
      if (ts > maxTs) maxTs = ts;
      const rel = (ts - startTime.getTime()) / 1000;
      if (rel < 0) continue;
      times.push(rel);
      if (/\[emote:/i.test(m.content || '')) emotes.push(rel);
    }
    // advance past last message; +1ms guards against re-fetching the same page forever
    cursor = new Date(Math.max(maxTs + 1, cursor.getTime() + 1000));
  }
  return { times, emotes, pages };
}

function scoreWindows(times, emotes, durationSec) {
  const maxT = durationSec || (times.length ? Math.max(...times) : 0);
  const n = Math.max(1, Math.ceil(maxT / WINDOW_S));
  const counts = new Array(n).fill(0);
  const eCounts = new Array(n).fill(0);
  for (const t of times) { const i = Math.min(n - 1, Math.floor(t / WINDOW_S)); counts[i]++; }
  for (const t of emotes) { const i = Math.min(n - 1, Math.floor(t / WINDOW_S)); eCounts[i]++; }
  const scores = [];
  const BASE_WINDOWS = 18; // 3 min rolling baseline at 10s windows
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - BASE_WINDOWS);
    const prior = counts.slice(lo, i);
    const sorted = [...prior].sort((a, b) => a - b);
    const baseline = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
    const rate = counts[i];
    const spike = rate / Math.max(baseline, 1);
    const emoteBoost = eCounts[i] / Math.max(rate, 1); // fraction of emote messages
    scores.push({ i, t: i * WINDOW_S, score: +(spike * (1 + emoteBoost)).toFixed(2), msgRate: rate, emoteRate: eCounts[i] });
  }
  return scores;
}

function pickPeaks(scores, top) {
  const MIN_GAP = 6; // windows (60s) between distinct highlights
  const sorted = [...scores].filter(s => s.msgRate >= 3).sort((a, b) => b.score - a.score);
  const picked = [];
  for (const s of sorted) {
    if (picked.length >= top) break;
    if (picked.some(p => Math.abs(p.i - s.i) < MIN_GAP)) continue;
    picked.push(s);
  }
  return picked.sort((a, b) => a.t - b.t);
}

function fmt(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return [h, m, s].map(x => String(x).padStart(2, '0')).join(':');
}

async function detectHighlights({ url, top = 5 }) {
  const uuid = extractUuid(url);
  const video = await fetchVideoMeta(uuid);
  const { times, emotes, pages } = await fetchChatTimeline(video);
  if (times.length < 20) throw new Error(`Too little chat data to score (${times.length} messages over ${pages} pages) — chat replay may be unavailable for this VOD`);
  const scores = scoreWindows(times, emotes, video.durationSec);
  const highlights = pickPeaks(scores, top).map(s => ({
    t: s.t,
    ts: fmt(s.t),
    score: s.score,
    msgRate: s.msgRate,
    emoteRate: s.emoteRate,
    suggestStart: Math.max(0, s.t - 15),
    suggestDuration: 30
  }));
  return { ok: true, video: { uuid, durationSec: video.durationSec }, messages: times.length, pagesFetched: pages, windowSec: WINDOW_S, highlights };
}

module.exports = { detectHighlights };
