// clip-pipeline.js
// Clip-cutting pipeline: resolve → download (segment only) → ffmpeg encode → output file
// Requires yt-dlp + ffmpeg (installed in the Docker image).
//
// Limits (env-configurable):
//   CLIP_MIN_SECONDS      minimum clip length          (default 3)
//   CLIP_MAX_SECONDS      maximum clip length          (default 180)
//   CLIP_MAX_SOURCE_MB    max source download size     (default 500)
//   CLIP_MAX_OUTPUT_MB    max encoded output size      (default 100)
//   CLIP_TIMEOUT_MS       per-subprocess timeout       (default 300000)
//
// Usage:
//   const { cutClip } = require('./clip-pipeline');
//   const out = await cutClip({ url, start: '00:01:23', duration: 30, vertical: true });
//   // → { file, sizeBytes, durationSec, source }

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const run = promisify(execFile);

const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

const LIMITS = {
  minSec: Number(process.env.CLIP_MIN_SECONDS) || 3,
  maxSec: Number(process.env.CLIP_MAX_SECONDS) || 180,
  maxSourceMB: Number(process.env.CLIP_MAX_SOURCE_MB) || 500,
  maxOutputMB: Number(process.env.CLIP_MAX_OUTPUT_MB) || 100,
  timeoutMs: Number(process.env.CLIP_TIMEOUT_MS) || 300000
};

const RUN_OPTS = { maxBuffer: 50 * 1024 * 1024, timeout: LIMITS.timeoutMs };

// ---------- helpers ----------

function toSeconds(t) {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  const parts = String(t).split(':').map(Number);
  if (parts.some(isNaN)) throw new Error(`Bad timestamp: ${t}`);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function tmpName(ext) {
  return path.join(require('os').tmpdir(), `clip-${crypto.randomBytes(6).toString('hex')}.${ext}`);
}

function validateWindow(s, d, sourceDuration) {
  if (s < 0) throw new Error('start must be >= 0');
  if (d == null || isNaN(d) || d <= 0) throw new Error('Provide end or duration (> start)');
  if (d < LIMITS.minSec) throw new Error(`Clip too short: ${d}s (min ${LIMITS.minSec}s)`);
  if (d > LIMITS.maxSec) throw new Error(`Clip too long: ${d}s (max ${LIMITS.maxSec}s, set CLIP_MAX_SECONDS to raise)`);
  if (sourceDuration && s >= sourceDuration) throw new Error(`start (${s}s) is beyond source duration (${sourceDuration}s)`);
}

// ---------- 1. resolve ----------

async function resolveSource(url) {
  const { stdout } = await run(YTDLP, [
    '--no-warnings', '--no-playlist', '-J', url
  ], RUN_OPTS);
  const info = JSON.parse(stdout);
  return {
    id: info.id,
    title: info.title || 'clip',
    duration: info.duration || null,
    extractor: info.extractor,
    directUrl: info.url || null,
    original: url
  };
}

// ---------- 2. download (only the needed section, not the whole VOD) ----------

async function downloadSource(url, { sectionStart = null, sectionEnd = null } = {}) {
  const out = tmpName('mp4');
  const args = [
    '--no-warnings', '--no-playlist',
    '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b',
    '--merge-output-format', 'mp4',
    '--max-filesize', `${LIMITS.maxSourceMB}M`
  ];
  if (sectionStart != null && sectionEnd != null) {
    args.push('--download-sections', `*${sectionStart}-${sectionEnd}`);
  }
  args.push('-o', out, url);
  await run(YTDLP, args, RUN_OPTS);
  if (!fs.existsSync(out)) {
    throw new Error(`yt-dlp did not produce an output file (source may exceed ${LIMITS.maxSourceMB}MB limit — set CLIP_MAX_SOURCE_MB to raise)`);
  }
  return out;
}

// ---------- 3. ffmpeg segment ----------

async function cutSegment(srcFile, { start = 0, end, duration, outFile, precise = true, vertical = false }) {
  const s = toSeconds(start) ?? 0;
  const d = duration != null ? toSeconds(duration)
          : end != null ? toSeconds(end) - s
          : null;
  validateWindow(s, d);

  const args = ['-y', '-ss', String(s), '-i', srcFile, '-t', String(d)];

  if (precise || vertical) {
    if (vertical) {
      args.push('-vf', "crop=ih*9/16:ih,scale=1080:1920");
    }
    args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
              '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart');
  } else {
    args.push('-c', 'copy');
  }
  args.push(outFile);

  await run(FFMPEG, args, RUN_OPTS);

  const sizeMB = fs.statSync(outFile).size / (1024 * 1024);
  if (sizeMB > LIMITS.maxOutputMB) {
    fs.rmSync(outFile, { force: true });
    throw new Error(`Encoded clip is ${sizeMB.toFixed(1)}MB (max ${LIMITS.maxOutputMB}MB — set CLIP_MAX_OUTPUT_MB to raise)`);
  }
  return outFile;
}

async function probeDuration(file) {
  try {
    const { stdout } = await run(FFPROBE, [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', file
    ], RUN_OPTS);
    return parseFloat(stdout.trim()) || null;
  } catch { return null; }
}

// ---------- pipeline ----------

async function cutClip({ url, start = 0, end, duration, outDir = './clips', format = 'mp4', precise = true, vertical = false, keepSource = false }) {
  if (!url) throw new Error('url is required');

  const s = toSeconds(start) ?? 0;
  const d = duration != null ? toSeconds(duration)
          : end != null ? toSeconds(end) - s
          : null;

  const source = await resolveSource(url);
  validateWindow(s, d, source.duration);

  fs.mkdirSync(outDir, { recursive: true });

  // Only download the window we need (±2s padding for keyframe alignment)
  const pad = 2;
  const secStart = Math.max(0, s - pad);
  const secEnd = source.duration ? Math.min(source.duration, s + d + pad) : s + d + pad;
  const srcFile = await downloadSource(url, { sectionStart: secStart, sectionEnd: secEnd });

  const safeTitle = (source.title || 'clip').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60);
  const outFile = path.join(outDir, `${safeTitle}_${Date.now()}.${format}`);

  try {
    // srcFile starts at secStart, so offset the cut accordingly
    await cutSegment(srcFile, { start: s - secStart, duration: d, outFile, precise, vertical });
  } finally {
    if (!keepSource) fs.rmSync(srcFile, { force: true });
  }

  return {
    file: outFile,
    sizeBytes: fs.statSync(outFile).size,
    durationSec: await probeDuration(outFile),
    source
  };
}

module.exports = { cutClip, resolveSource, downloadSource, cutSegment, LIMITS };

// CLI: node clip-pipeline.js <url> <start> <end|duration> [--vertical]
if (require.main === module) {
  const [url, start, endOrDur] = process.argv.slice(2);
  const vertical = process.argv.includes('--vertical');
  cutClip({ url, start, end: endOrDur, vertical })
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(e.message); process.exit(1); });
}
